/**
 * 交易详细解码主模块
 * 整合各个子模块，提供完整的交易解码功能
 */

import * as tbc from 'tbc-lib-js';
import type { InputUTXODetail, TransactionDetail, DecodedInput, DecodedOutput } from './types';
import { ScriptType } from './types';
import { parseScript } from './scriptParser';
import { getTransactionByTxid } from './transactionApi';
import {
	identifyTransactionType,
	parseFTNFTTransaction,
	extractRecipientAddresses,
	TransactionType,
} from './ftNftParser';

/**
 * 解析输入UTXO的详细信息
 */
export async function parseInputUTXO(
	txid: string,
	outputIndex: number,
): Promise<InputUTXODetail> {
	try {
		// 获取前一个交易的原始数据
		const prevTxraw = await getTransactionByTxid(txid);
		if (!prevTxraw) {
			return {
				txid,
				outputIndex,
				script: {
					asm: '',
					type: ScriptType.UNKNOWN,
				},
				error: `Failed to fetch transaction ${txid}`,
			};
		}

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
					type: ScriptType.UNKNOWN,
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
				type: ScriptType.UNKNOWN,
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
 * @returns 交易详细信息对象
 */
export async function decodeTxRawDetail(txraw: string): Promise<TransactionDetail> {
	try {
		// 解析交易
		const transaction = new tbc.Transaction(txraw);
		const txObj = transaction.toObject();

		const inputs: DecodedInput[] = await Promise.all(
			txObj.inputs.map(async (input: any) => {
				const scriptDetail = parseScript(input.script);

				let utxoDetail: InputUTXODetail | undefined;
				try {
					utxoDetail = await parseInputUTXO(input.prevTxId, input.outputIndex);
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

		// 识别并解析 FT/NFT 交易
		let ftNftInfo;
		try {
			const transactionType = identifyTransactionType(txObj.outputs);
			if (transactionType !== TransactionType.UNKNOWN) {
				ftNftInfo = parseFTNFTTransaction(txObj.outputs, transactionType);
				
				// 对于转移交易，补充接收地址信息
				if (transactionType === TransactionType.FT_TRANSFER && ftNftInfo.ftTransferData) {
					const recipientAddresses = extractRecipientAddresses(txObj.outputs);
					// 如果解析出的地址为空，使用提取的地址
					if (!ftNftInfo.ftTransferData.address && recipientAddresses.length > 0) {
						ftNftInfo.ftTransferData.address = recipientAddresses[0];
					}
				} else if (transactionType === TransactionType.NFT_TRANSFER && ftNftInfo.nftTransferData) {
					const recipientAddresses = extractRecipientAddresses(txObj.outputs);
					// 如果解析出的地址为空，使用提取的地址
					if (!ftNftInfo.nftTransferData.address && recipientAddresses.length > 0) {
						ftNftInfo.nftTransferData.address = recipientAddresses[0];
					}
				}
			}
		} catch (error) {
			console.error('Failed to parse FT/NFT transaction:', error);
			// 不抛出错误，继续返回基本交易信息
		}

		// 返回交易详细信息
		return {
			hash: txObj.hash,
			version: txObj.version,
			inputs,
			outputs,
			nLockTime: txObj.nLockTime,
			ftNftInfo,
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
export { identifyTransactionType, parseFTNFTTransaction, extractRecipientAddresses, TransactionType } from './ftNftParser';
export type {
	ParsedFTNFTTransaction,
	FTMintData,
	FTTransferData,
	NFTCreateData,
	NFTTransferData,
	CollectionCreateData,
} from './ftNftParser';
