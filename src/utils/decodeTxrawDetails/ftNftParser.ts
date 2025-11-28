/**
 * FT/NFT 交易解析模块
 * 识别和解析 FT/NFT 相关交易的数据
 */

import * as tbc from 'tbc-lib-js';
import { extractOPReturnDataFromASM } from './scriptIdentifier';

/**
 * 交易类型常量对象
 */
export const TransactionType = {
	FT_MINT: 'FT_MINT',
	FT_TRANSFER: 'FT_TRANSFER',
	NFT_CREATE: 'NFT_CREATE',
	NFT_TRANSFER: 'NFT_TRANSFER',
	COLLECTION_CREATE: 'COLLECTION_CREATE',
	UNKNOWN: 'UNKNOWN',
} as const;

/**
 * 交易类型
 */
export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

/**
 * FT Mint 数据
 */
export interface FTMintData {
	name: string;
	symbol: string;
	amount: number;
	decimal: number;
}

/**
 * FT Transfer 数据
 */
export interface FTTransferData {
	ft_contract_address: string;
	ft_amount: number;
	address: string;
	tbc_amount?: number;
}

/**
 * NFT Create 数据
 */
export interface NFTCreateData {
	nftName: string;
	description: string;
	file: string;
	symbol?: string;
	attributes?: string;
	collection_id: string;
}

/**
 * NFT Transfer 数据
 */
export interface NFTTransferData {
	nft_contract_address: string;
	address: string;
}

/**
 * Collection Create 数据
 */
export interface CollectionCreateData {
	collectionName: string;
	description: string;
	supply: number;
	file: string;
}

/**
 * 解析后的 FT/NFT 交易信息
 */
export interface ParsedFTNFTTransaction {
	type: TransactionType;
	ftMintData?: FTMintData;
	ftTransferData?: FTTransferData;
	nftCreateData?: NFTCreateData;
	nftTransferData?: NFTTransferData;
	collectionCreateData?: CollectionCreateData;
	rawData?: string; // 原始 OP_RETURN 数据
	error?: string;
}

/**
 * 从十六进制字符串转换为文本
 */
function hexToString(hex: string): string {
	try {
		let result = '';
		for (let i = 0; i < hex.length; i += 2) {
			const charCode = parseInt(hex.substr(i, 2), 16);
			if (charCode === 0) break; // 遇到 null 终止符
			result += String.fromCharCode(charCode);
		}
		return result;
	} catch (error) {
		return '';
	}
}

/**
 * 从 OP_RETURN 数据中提取 JSON 字符串
 * OP_RETURN 数据可能是：
 * 1. 直接的 JSON 字符串（hex 编码）
 * 2. 包含 flag 和数据的结构
 * 3. 多个 hex 字符串用空格分隔
 */
function extractJSONFromOPReturn(opReturnData: string): any {
	if (!opReturnData) return null;

	try {
		// 移除空格，将所有 hex 字符串连接起来（只声明一次）
		const cleanHex = opReturnData.replace(/\s+/g, '');
		
		// 尝试直接解析为 JSON（如果是 hex 编码的 JSON）
		const text = hexToString(cleanHex);
		if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
			return JSON.parse(text);
		}

		// 尝试将整个 hex 作为 JSON 解析
		// 某些情况下，数据可能是 UTF-8 编码的 JSON
		try {
			// 浏览器兼容的 hex 到 UTF-8 转换
			let utf8Text = '';
			for (let i = 0; i < cleanHex.length; i += 2) {
				const hexByte = cleanHex.substr(i, 2);
				if (hexByte.length < 2) break;
				const byte = parseInt(hexByte, 16);
				if (isNaN(byte)) break;
				utf8Text += String.fromCharCode(byte);
			}
			if (utf8Text.trim().startsWith('{') || utf8Text.trim().startsWith('[')) {
				return JSON.parse(utf8Text);
			}
		} catch (e) {
			// 忽略错误，继续尝试其他方法
		}

		// 如果包含 flag 标识，尝试提取
		// 格式可能是：flag + 分隔符 + data
		const flagPatterns = [
			'FT_MINT',
			'FT_TRANSFER',
			'NFT_CREATE',
			'NFT_TRANSFER',
			'COLLECTION_CREATE',
		];
		
		// 在循环外使用已声明的 cleanHex
		for (const flag of flagPatterns) {
			// 浏览器兼容的字符串到 hex 转换
			let flagHex = '';
			for (let i = 0; i < flag.length; i++) {
				const charCode = flag.charCodeAt(i);
				flagHex += charCode.toString(16).padStart(2, '0');
			}
			
			if (cleanHex.includes(flagHex)) {
				// 找到 flag，尝试提取后续数据
				const flagIndex = cleanHex.indexOf(flagHex);
				const afterFlag = cleanHex.substring(flagIndex + flagHex.length);
				// 尝试解析后续数据
				try {
					let dataText = '';
					for (let i = 0; i < afterFlag.length; i += 2) {
						const hexByte = afterFlag.substr(i, 2);
						if (hexByte.length < 2) break;
						const byte = parseInt(hexByte, 16);
						if (isNaN(byte)) break;
						dataText += String.fromCharCode(byte);
					}
					if (dataText.trim().startsWith('{')) {
						return { flag, ...JSON.parse(dataText) };
					}
				} catch (e) {
					// 忽略错误
				}
			}
		}

		return null;
	} catch (error) {
		console.error('Failed to extract JSON from OP_RETURN:', error);
		return null;
	}
}

/**
 * 识别交易类型
 * 通过分析输出的脚本 ASM 来判断交易类型
 */
export function identifyTransactionType(outputs: any[]): TransactionType {
	for (const output of outputs) {
		if (!output.script) continue;

		try {
			const script = new tbc.Script(output.script);
			const asm = script.toASM();

			// 检查是否包含 OP_RETURN
			if (!asm.includes('OP_RETURN')) continue;

			// 提取 OP_RETURN 数据
			const opReturnData = extractOPReturnDataFromASM(asm);
			if (!opReturnData) continue;

			// 尝试解析 JSON
			const jsonData = extractJSONFromOPReturn(opReturnData);
			if (!jsonData) continue;

			// 检查 flag 字段
			if (jsonData.flag) {
				switch (jsonData.flag) {
					case 'FT_MINT':
						return TransactionType.FT_MINT;
					case 'FT_TRANSFER':
						return TransactionType.FT_TRANSFER;
					case 'NFT_CREATE':
						return TransactionType.NFT_CREATE;
					case 'NFT_TRANSFER':
						return TransactionType.NFT_TRANSFER;
					case 'COLLECTION_CREATE':
						return TransactionType.COLLECTION_CREATE;
				}
			}

			// 如果没有 flag，尝试通过数据结构推断
			if (jsonData.ft_data) {
				return TransactionType.FT_MINT;
			}
			if (jsonData.ft_contract_address && jsonData.ft_amount !== undefined) {
				return TransactionType.FT_TRANSFER;
			}
			if (jsonData.nft_data && jsonData.collection_id) {
				return TransactionType.NFT_CREATE;
			}
			if (jsonData.nft_contract_address && jsonData.address) {
				return TransactionType.NFT_TRANSFER;
			}
			if (jsonData.collection_data || (jsonData.collectionName && jsonData.supply !== undefined)) {
				return TransactionType.COLLECTION_CREATE;
			}
		} catch (error) {
			console.error('Error identifying transaction type:', error);
		}
	}

	return TransactionType.UNKNOWN;
}

/**
 * 解析 FT/NFT 交易数据
 */
export function parseFTNFTTransaction(
	outputs: any[],
	transactionType: TransactionType,
): ParsedFTNFTTransaction {
	const result: ParsedFTNFTTransaction = {
		type: transactionType,
	};

	// 查找包含 OP_RETURN 的输出
	for (const output of outputs) {
		if (!output.script) continue;

		try {
			const script = new tbc.Script(output.script);
			const asm = script.toASM();

			if (!asm.includes('OP_RETURN')) continue;

			// 提取 OP_RETURN 数据
			const opReturnData = extractOPReturnDataFromASM(asm);
			if (!opReturnData) continue;

			result.rawData = opReturnData;

			// 解析 JSON 数据
			const jsonData = extractJSONFromOPReturn(opReturnData);
			if (!jsonData) {
				result.error = 'Failed to parse OP_RETURN data as JSON';
				return result;
			}

			// 根据交易类型解析数据
			switch (transactionType) {
				case TransactionType.FT_MINT:
					if (jsonData.ft_data) {
						// ft_data 可能是字符串（JSON）或对象
						let ftData: any;
						if (typeof jsonData.ft_data === 'string') {
							try {
								ftData = JSON.parse(jsonData.ft_data);
							} catch (e) {
								result.error = 'Failed to parse ft_data JSON';
								return result;
							}
						} else {
							ftData = jsonData.ft_data;
						}

						result.ftMintData = {
							name: ftData.name || '',
							symbol: ftData.symbol || '',
							amount: ftData.amount || 0,
							decimal: ftData.decimal || 6,
						};
					}
					break;

				case TransactionType.FT_TRANSFER:
					result.ftTransferData = {
						ft_contract_address: jsonData.ft_contract_address || '',
						ft_amount: jsonData.ft_amount || 0,
						address: jsonData.address || '',
						tbc_amount: jsonData.tbc_amount,
					};
					break;

				case TransactionType.NFT_CREATE:
					if (jsonData.nft_data) {
						// nft_data 可能是字符串（JSON）或对象
						let nftData: any;
						if (typeof jsonData.nft_data === 'string') {
							try {
								nftData = JSON.parse(jsonData.nft_data);
							} catch (e) {
								result.error = 'Failed to parse nft_data JSON';
								return result;
							}
						} else {
							nftData = jsonData.nft_data;
						}

						result.nftCreateData = {
							nftName: nftData.nftName || nftData.name || '',
							description: nftData.description || '',
							file: nftData.file || '',
							symbol: nftData.symbol,
							attributes: nftData.attributes,
							collection_id: jsonData.collection_id || '',
						};
					}
					break;

				case TransactionType.NFT_TRANSFER:
					result.nftTransferData = {
						nft_contract_address: jsonData.nft_contract_address || '',
						address: jsonData.address || '',
					};
					break;

				case TransactionType.COLLECTION_CREATE:
					if (jsonData.collection_data) {
						// collection_data 可能是字符串（JSON）或对象
						let collectionData: any;
						if (typeof jsonData.collection_data === 'string') {
							try {
								collectionData = JSON.parse(jsonData.collection_data);
							} catch (e) {
								result.error = 'Failed to parse collection_data JSON';
								return result;
							}
						} else {
							collectionData = jsonData.collection_data;
						}

						result.collectionCreateData = {
							collectionName: collectionData.collectionName || '',
							description: collectionData.description || '',
							supply: collectionData.supply || 0,
							file: collectionData.file || '',
						};
					}
					break;
			}

			// 找到第一个有效的 OP_RETURN 就返回
			if (result.ftMintData || result.ftTransferData || result.nftCreateData || 
				result.nftTransferData || result.collectionCreateData) {
				return result;
			}
		} catch (error) {
			console.error('Error parsing FT/NFT transaction:', error);
			result.error = error instanceof Error ? error.message : 'Unknown error';
		}
	}

	if (!result.error) {
		result.error = 'No valid FT/NFT data found in outputs';
	}

	return result;
}

/**
 * 从交易输出中提取接收地址（用于转移交易）
 * 查找 P2PKH 输出，这些通常是接收地址
 */
export function extractRecipientAddresses(outputs: any[]): string[] {
	const addresses: string[] = [];

	for (const output of outputs) {
		if (!output.script) continue;

		try {
			const script = new tbc.Script(output.script);
			
			// 检查是否是 P2PKH 输出
			if (script.isPublicKeyHashOut()) {
				try {
					const pubKeyHash = script.getPublicKeyHash();
					const address = new tbc.Address(pubKeyHash, tbc.Networks.livenet).toString();
					addresses.push(address);
				} catch (error) {
					console.error('Failed to extract address from P2PKH:', error);
				}
			}
		} catch (error) {
			console.error('Error extracting recipient address:', error);
		}
	}

	return addresses;
}

