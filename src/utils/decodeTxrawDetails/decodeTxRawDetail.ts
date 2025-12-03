/**
 * 交易详细解码主模块
 * 整合各个子模块，提供完整的交易解码功能
 */

import * as tbc from 'tbc-lib-js';
import type { InputUTXODetail, TransactionDetail, DecodedInput, DecodedOutput } from './types';
import { parseScript } from './scriptParser';
import { getTransactionByTxid } from './transactionApi';
import {
	identifyTransactionType,
	parseFTTransaction,
	TransactionType,
} from './ftNftParser';

/**
 * 解析输入UTXO的详细信息
 * @param txid 交易ID
 * @param outputIndex 输出索引
 * @param network 网络类型，可选：'mainnet' | 'testnet'
 */
export async function parseInputUTXO(
	txid: string,
	outputIndex: number,
	network?: 'mainnet' | 'testnet',
): Promise<InputUTXODetail> {
	try {
		// 获取前一个交易的原始数据
		const apiResult = await getTransactionByTxid(txid, network);
		
		if (!apiResult.success) {
			// 如果不是网络错误，返回具体的错误信息
			if (!apiResult.isNetworkError) {
				// 检查是否是"不存在的utxo"类型的错误（如404）
				const errorLower = apiResult.error.toLowerCase();
				const isNotFoundError = 
					errorLower.includes('not found') || 
					errorLower.includes('不存在') ||
					errorLower.includes('tx not found') ||
					errorLower.includes('transaction not found') ||
					errorLower.includes('404');
				
				if (isNotFoundError) {
					return {
						txid,
						outputIndex,
						script: {
							asm: '',
							// type 字段只在 P2PKH 时显示
						},
						error: '不存在的utxo',
					};
				}
				// 其他业务错误，返回原始错误信息
				return {
					txid,
					outputIndex,
					script: {
						asm: '',
						// type 字段只在 P2PKH 时显示
					},
					error: apiResult.error,
				};
			}
			// 网络错误
			return {
				txid,
				outputIndex,
				script: {
					asm: '',
					// type 字段只在 P2PKH 时显示
				},
				error: `网络错误: ${apiResult.error}`,
			};
		}
		
		const prevTxraw = apiResult.txraw;

		// 解析前一个交易
		const prevTransaction = new tbc.Transaction(prevTxraw);
		const prevTxObj = prevTransaction.toObject();

		// 找到对应的输出
		if (outputIndex >= prevTxObj.outputs.length) {
			return {
				txid,
				outputIndex,
				script: {
					asm: '',
					// type 字段只在 P2PKH 时显示
				},
				error: `Output index ${outputIndex} out of range`,
			};
		}
		// 找到对应的输出
		const output = prevTxObj.outputs[outputIndex];
		// 解析输出脚本
		const scriptDetail = parseScript(output.script);
		// 返回输入UTXO的详细信息
		return {
			txid,
			outputIndex,
			script: scriptDetail,
			address: scriptDetail.address,
			tbcAmount: output.satoshis / 1_000_000,
			// FT余额需要根据实际合约解析，这里先留空
			ftAmount: undefined,
		};
	} catch (error) {
		console.error(`Failed to parse input UTXO ${txid}:${outputIndex}:`, error);
		return {
			txid,
			outputIndex,
			script: {
				asm: '',
				// type 字段只在 P2PKH 时显示
			},
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
}

/**
 * 解码交易的详细信息
 * 
 * 功能说明：
 * 1. 解析交易的基本信息（hash, version, nLockTime等）
 * 2. 解析所有输入的脚本信息
 * 3. 为每个输入获取UTXO详细信息（通过API获取前一个交易）
 * 4. 解析所有输出的脚本信息和地址
 * 5. 返回完整的交易详细信息
 * 
 * @param txraw 交易的十六进制原始数据
 * @param network 网络类型，可选：'mainnet' | 'testnet'
 * @returns 交易详细信息对象
 */
export async function decodeTxRawDetail(
	txraw: string,
	network?: 'mainnet' | 'testnet',
): Promise<TransactionDetail> {
	try {
		// 解析交易
		const transaction = new tbc.Transaction(txraw);
		const txObj = transaction.toObject();

		const inputs: DecodedInput[] = await Promise.all(
			txObj.inputs.map(async (input: any) => {
				const scriptDetail = parseScript(input.script);

				let utxoDetail: InputUTXODetail | undefined;
				try {
					utxoDetail = await parseInputUTXO(input.prevTxId, input.outputIndex, network);
				} catch (error) {
					console.error(
						`Failed to parse UTXO for input ${input.prevTxId}:${input.outputIndex}:`,
						error,
					);
				}
				const decodedInput: DecodedInput = {
					txid: input.prevTxId,
					outputIndex: input.outputIndex,
					asm: scriptDetail.asm || '',
				};

				if (utxoDetail?.script) {
					decodedInput.script = utxoDetail.script;
				}

				if (utxoDetail?.error) {
					decodedInput.error = utxoDetail.error;
				}

				return decodedInput;
			}),
		);

		const outputs: DecodedOutput[] = txObj.outputs.map((output: any) => {
			const scriptDetail = parseScript(output.script);
			return {
				value: output.satoshis / 1_000_000,
				script: scriptDetail,
			};
		});

		// 识别并解析 FT 交易
		let ftData;
		let transactionType: TransactionType | undefined;
		try {
			transactionType = identifyTransactionType(txObj);
			if (transactionType !== TransactionType.UNKNOWN) {
				ftData = parseFTTransaction(txObj.outputs, transactionType);
			}
		} catch (error) {
			console.error('Failed to parse FT transaction:', error);
			// 不抛出错误，继续返回基本交易信息
		}

		if (transactionType && transactionType !== TransactionType.UNKNOWN) {
			outputs.forEach((output) => {
				if (output.script?.data?.ft_data) {
					output.script.data.ft_data.type = transactionType;
				}
			});
		}

		if (transactionType === TransactionType.FT_MINT) {
			const tapeOutput = outputs.find((output) => output.script?.data?.ft_data);
			const tapeFtData = tapeOutput?.script.data?.ft_data;
			if (tapeFtData?.data) {
				const amountValue = Number(tapeFtData.data.amount);
				ftData = {
					type: TransactionType.FT_MINT,
					data: {
						name: tapeFtData.data.name,
						symbol: tapeFtData.data.symbol,
						amount: Number.isFinite(amountValue) ? amountValue : 0,
						decimal: tapeFtData.data.decimal,
					},
				};
			}
		}

		if (transactionType === TransactionType.FT_TRANSFER && ftData?.type === TransactionType.FT_MINT) {
			ftData.type = TransactionType.FT_TRANSFER;
		}

		// 返回交易详细信息
		return {
			hash: txObj.hash,
			version: txObj.version,
			inputs,
			outputs,
			nLockTime: txObj.nLockTime,
			ft_data: ftData,
		};
	} catch (error) {
		console.error('Failed to decode transaction detail:', error);
		throw error;
	}
}

// 导出类型和工具函数供外部使用
export { ScriptType } from './types';
export type {
	ScriptDetail,
	InputUTXODetail,
	DecodedInput,
	DecodedOutput,
	TransactionDetail,
} from './types';
export { identifyScriptTypeByASM, extractPubKeyHashFromASM, extractOPReturnDataFromASM } from './scriptIdentifier';
export { parseScript } from './scriptParser';
export { getTransactionByTxid } from './transactionApi';
export { identifyTransactionType, parseFTTransaction, TransactionType } from './ftNftParser';
export type {
	ParsedFTTransaction,
	FTMintData,
	FTTransferData,
} from './ftNftParser';
