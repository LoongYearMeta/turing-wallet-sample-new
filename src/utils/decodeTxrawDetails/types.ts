/**
 * 交易解码相关的类型定义
 */

// 导入 FT/NFT 相关类型
import type {
	ParsedFTNFTTransaction,
	TransactionType,
	FTMintData,
	FTTransferData,
	NFTCreateData,
	NFTTransferData,
	CollectionCreateData,
} from './ftNftParser';

/**
 * 脚本类型
 */
export const ScriptType = {
	P2PKH: 'P2PKH', // Pay to Public Key Hash
	P2PK: 'P2PK', // Pay to Public Key
	P2SH: 'P2SH', // Pay to Script Hash
	OP_RETURN: 'OP_RETURN', // OP_RETURN data
	UNKNOWN: 'UNKNOWN', // 未知类型
} as const;

export type ScriptType = typeof ScriptType[keyof typeof ScriptType];

/**
 * 脚本详细信息
 */
export interface ScriptDetail {
	asm: string; // ASM格式
	type: ScriptType; // 脚本类型
	address?: string; // 地址（如果是P2PKH等）
	data?: string; // OP_RETURN数据
}

/**
 * 输入UTXO详细信息
 */
export interface InputUTXODetail {
	txid: string;
	outputIndex: number;
	script: ScriptDetail;
	address?: string;
	tbcAmount?: number; // 单位：TBC
	ftAmount?: number;
	error?: string;
}

/**
 * 解码后的输入信息
 */
export interface DecodedInput {
	txid: string;
	outputIndex: number;
	asm: string; // 当前输入脚本（ASM）
	script?: ScriptDetail; // 上一个UTXO的脚本
	error?: string;
}

/**
 * 解码后的输出信息
 */
export interface DecodedOutput {
	value: number; // 单位：TBC
	script: ScriptDetail;
}

/**
 * 交易详细信息
 */
export interface TransactionDetail {
	hash: string;
	version: number;
	inputs: DecodedInput[];
	outputs: DecodedOutput[];
	nLockTime: number;
	ftNftInfo?: ParsedFTNFTTransaction; // FT/NFT 交易信息
}

// 重新导出类型供外部使用
export type {
	ParsedFTNFTTransaction,
	TransactionType,
	FTMintData,
	FTTransferData,
	NFTCreateData,
	NFTTransferData,
	CollectionCreateData,
};

