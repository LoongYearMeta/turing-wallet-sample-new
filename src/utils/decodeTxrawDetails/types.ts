/**
 * 交易解码相关的类型定义
 */

// （已简化）不再直接依赖具体协议的解析类型，脚本解析仅返回原始数据

/**
 * 脚本类型
 */
export const ScriptType = {
	P2PKH: 'P2PKH', // Pay to Public Key Hash
	P2PK: 'P2PK', // Pay to Public Key
	P2SH: 'P2SH', // Pay to Script Hash
	MULTISIG: 'MULTISIG', // Multi-signature
	OP_RETURN: 'OP_RETURN', // OP_RETURN data
	UNKNOWN: 'UNKNOWN', // 未知类型
} as const;

export type ScriptType = typeof ScriptType[keyof typeof ScriptType];

/**
 * 脚本详细信息
 */
export interface ScriptOpReturnData {
	type?: string;
	publicKeyHash?: string;
	address?: string; // 从 publicKeyHash 解码出的地址（当 flag 为 00 时）
	hash?: string; // 哈希值（当 flag 为 01 时）
	flag?: 'address' | 'hash' | 'unknown'; // 标志类型：00=address, 01=hash
	codeType?: string;
	/**
	 * 通用 FT Tape 解码结果（不绑定具体交易类型）
	 * 仅当 OP_RETURN 数据符合 FT Tape 格式时才会出现
	 */
	ftTape?: {
		name: string;
		symbol: string;
		amount: number;
		decimal: number;
	};
	hexParts?: string[];
	asciiParts?: string[];
}

export interface ScriptDetail {
	asm: string; // ASM格式
	type?: ScriptType; // 脚本类型（仅当类型为P2PKH时显示）
	address?: string; // 地址（如果是P2PKH等）
	data?: ScriptOpReturnData; // OP_RETURN数据
	/**
	 * 对于包含源 UTXO 信息的合约脚本（如 FT Code Script），解析出的来源 UTXO
	 */
	originUtxo?: {
		txid: string;
		vout: number;
	};
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
}
