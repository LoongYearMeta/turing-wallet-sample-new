/**
 * 脚本类型识别模块
 * 根据ASM操作码识别脚本类型并提取相关信息
 */

import { ScriptType } from './types';

/**
 * 根据ASM操作码识别脚本类型
 * @param asm ASM格式的脚本字符串
 * @returns 脚本类型
 * 
 * 常见脚本类型的ASM模式：
 * 
 * 1. P2PKH (Pay to Public Key Hash):
 *    "OP_DUP OP_HASH160 <20字节的pubkeyhash> OP_EQUALVERIFY OP_CHECKSIG"
 *    示例: "OP_DUP OP_HASH160 b770377041443c7eac4a93b721ab7093bdbccaba OP_EQUALVERIFY OP_CHECKSIG"
 * 
 * 2. P2PK (Pay to Public Key):
 *    "<公钥> OP_CHECKSIG"
 *    示例: "02da5f120a4328469bc41f5dd5e45d16212ab84640c1ab2a2daab649db84b97646 OP_CHECKSIG"
 * 
 * 3. P2SH (Pay to Script Hash):
 *    "OP_HASH160 <20字节的scripthash> OP_EQUAL"
 *    示例: "OP_HASH160 3f4c8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e OP_EQUAL"
 * 
 * 4. OP_RETURN (数据输出):
 *    "OP_RETURN <数据>" 或 "OP_FALSE OP_RETURN <数据>"
 *    示例: "OP_RETURN 48656c6c6f" 或 "OP_FALSE OP_RETURN 48656c6c6f"
 * 
 * 5. P2PKH + OP_RETURN (组合脚本):
 *    "OP_DUP OP_HASH160 <20字节的pubkeyhash> OP_EQUALVERIFY OP_CHECKSIG OP_RETURN <数据>"
 *    示例: "OP_DUP OP_HASH160 b770377041443c7eac4a93b721ab7093bdbccaba OP_EQUALVERIFY OP_CHECKSIG OP_RETURN 48656c6c6f"
 * 
 * 6. 多签 (Multisig):
 *    "OP_<M> <公钥1> <公钥2> ... <公钥N> OP_<N> OP_CHECKMULTISIG"
 *    示例: "OP_2 <pubkey1> <pubkey2> OP_2 OP_CHECKMULTISIG"
 */
export function identifyScriptTypeByASM(asm: string): ScriptType {
	const asmUpper = asm.toUpperCase();
	const parts = asmUpper.split(/\s+/).filter(p => p.length > 0);
	
	// 检查是否是P2PKH
	// 模式: OP_DUP OP_HASH160 <20字节hex> OP_EQUALVERIFY OP_CHECKSIG
	if (
		parts.length >= 5 &&
		parts[0] === 'OP_DUP' &&
		parts[1] === 'OP_HASH160' &&
		parts[3] === 'OP_EQUALVERIFY' &&
		parts[4] === 'OP_CHECKSIG'
	) {
		// 检查中间是否是20字节的hex字符串（40个hex字符）
		const pubkeyHash = parts[2] || '';
		if (/^[0-9A-F]{40}$/i.test(pubkeyHash)) {
			// 检查是否包含OP_RETURN（P2PKH + OP_RETURN组合）
			if (asmUpper.includes('OP_RETURN')) {
				return ScriptType.P2PKH; // 仍然返回P2PKH，但会标记有OP_RETURN数据
			}
			return ScriptType.P2PKH;
		}
	}
	
	// 检查是否是P2PK
	// 模式: <公钥hex> OP_CHECKSIG
	// 公钥通常是33字节（压缩）或65字节（未压缩）
	if (
		parts.length === 2 &&
		parts[1] === 'OP_CHECKSIG'
	) {
		const pubkey = parts[0] || '';
		// 检查是否是有效的公钥格式（66或130个hex字符）
		if (/^[0-9A-F]{66}$/i.test(pubkey) || /^[0-9A-F]{130}$/i.test(pubkey)) {
			return ScriptType.P2PK;
		}
	}
	
	// 检查是否是P2SH
	// 模式: OP_HASH160 <20字节hex> OP_EQUAL
	if (
		parts.length === 3 &&
		parts[0] === 'OP_HASH160' &&
		parts[2] === 'OP_EQUAL'
	) {
		const scriptHash = parts[1] || '';
		if (/^[0-9A-F]{40}$/i.test(scriptHash)) {
			return ScriptType.P2SH;
		}
	}
	
	// 检查是否是OP_RETURN
	if (asmUpper.includes('OP_RETURN')) {
		return ScriptType.OP_RETURN;
	}
	
	// 检查是否是OP_FALSE OP_RETURN格式
	if (asmUpper.includes('OP_FALSE') && asmUpper.includes('OP_RETURN')) {
		return ScriptType.OP_RETURN;
	}
	
	// 检查是否是多签
	// 模式1: OP_<M> OP_SWAP <lockScriptPrefix> OP_HASH160 <hash> OP_EQUALVERIFY OP_<N> OP_CHECKMULTISIG
	// 模式2: OP_<M> <pubkey1> <pubkey2> ... <pubkeyN> OP_<N> OP_CHECKMULTISIG
	if (asmUpper.includes('OP_CHECKMULTISIG')) {
		return ScriptType.MULTISIG;
	}
	
	return ScriptType.UNKNOWN;
}

/**
 * 从ASM字符串中提取公钥哈希（用于P2PKH）
 */
export function extractPubKeyHashFromASM(asm: string): string | null {
	const parts = asm.split(/\s+/).filter(p => p.length > 0);
	
	// P2PKH模式: OP_DUP OP_HASH160 <pubkeyhash> OP_EQUALVERIFY OP_CHECKSIG
	if (
		parts.length >= 5 &&
		parts[0] === 'OP_DUP' &&
		parts[1] === 'OP_HASH160' &&
		parts[3] === 'OP_EQUALVERIFY' &&
		parts[4] === 'OP_CHECKSIG'
	) {
		const pubkeyHash = parts[2];
		if (pubkeyHash && /^[0-9a-fA-F]{40}$/.test(pubkeyHash)) {
			return pubkeyHash;
		}
	}
	
	return null;
}

/**
 * 从ASM字符串中提取OP_RETURN数据
 */
export function extractOPReturnDataFromASM(asm: string): string | null {
	const parts = asm.split(/\s+/);
	
	// 查找OP_RETURN的位置
	const returnIndex = parts.findIndex(p => p === 'OP_RETURN' || p === 'OP_FALSE');
	if (returnIndex === -1) {
		return null;
	}
	
	// 如果是OP_FALSE OP_RETURN格式
	if (parts[returnIndex] === 'OP_FALSE' && returnIndex + 1 < parts.length) {
		if (parts[returnIndex + 1] === 'OP_RETURN' && returnIndex + 2 < parts.length) {
			// 返回OP_RETURN后的所有数据（可能有多段）
			return parts.slice(returnIndex + 2).join(' ');
		}
	}
	
	// 标准OP_RETURN格式
	if (parts[returnIndex] === 'OP_RETURN' && returnIndex + 1 < parts.length) {
		// 返回OP_RETURN后的所有数据
		return parts.slice(returnIndex + 1).join(' ');
	}
	
	return null;
}

