/**
 * 多签工具模块
 * 提供多签地址计算、解析等功能
 */

import * as tbc from 'tbc-lib-js';

/**
 * 计算公钥数组的哈希值
 * @param pubKeys 公钥数组（需要按字母序排列）
 * @returns 20字节的哈希值 Buffer
 */
function getHash(pubKeys: string[]): Buffer {
	// 将所有公钥按顺序连接
	const pubKeyBuffers = pubKeys.map(pubKey => Buffer.from(pubKey, 'hex'));
	const combined = Buffer.concat(pubKeyBuffers);
	
	// 计算 SHA256RIPEMD160 哈希
	return tbc.crypto.Hash.sha256ripemd160(combined);
}

/**
 * 计算多签地址
 * @param pubKeys 公钥数组（需要按字母序排列）
 * @param signatureCount 需要的签名数量 (1-6)
 * @param publicKeyCount 公钥总数 (3-10)
 * @returns 多签地址
 */
export function getMultiSigAddress(
	pubKeys: string[],
	signatureCount: number,
	publicKeyCount: number,
): string {
	if (signatureCount < 1 || signatureCount > 6) {
		throw new Error('Invalid signatureCount.');
	} else if (publicKeyCount < 3 || publicKeyCount > 10) {
		throw new Error('Invalid publicKeyCount.');
	} else if (signatureCount > publicKeyCount) {
		throw new Error('SignatureCount must be less than publicKeyCount.');
	}

	const hash = getHash(pubKeys);
	const prefix = (signatureCount << 4) | (publicKeyCount & 0x0f);
	const versionBuffer = Buffer.from([prefix]);
	const addressBuffer = Buffer.concat([versionBuffer, hash]);
	const addressHash = tbc.crypto.Hash.sha256sha256(addressBuffer);
	const checksum = addressHash.subarray(0, 4);
	const addressWithChecksum = Buffer.concat([addressBuffer, checksum]);
	return tbc.encoding.Base58.encode(addressWithChecksum);
}

/**
 * 解析多签地址，获取签名数量和公钥数量
 * @param address 多签地址
 * @returns 包含 signatureCount 和 publicKeyCount 的对象
 */
export function getSignatureAndPublicKeyCount(address: string): {
	signatureCount: number;
	publicKeyCount: number;
} {
	const buf = Buffer.from(tbc.encoding.Base58.decode(address));
	if (buf.length === 0) {
		throw new Error('Invalid address: empty buffer');
	}
	const prefix = buf[0];
	if (prefix === undefined) {
		throw new Error('Invalid address: prefix is undefined');
	}
	const signatureCount = (prefix >> 4) & 0x0f;
	const publicKeyCount = prefix & 0x0f;
	return { signatureCount, publicKeyCount };
}

/**
 * 从多签地址生成锁定脚本（ASM格式）
 * @param address 多签地址
 * @returns 锁定脚本的ASM字符串
 */
export function getMultiSigLockScript(address: string): string {
	const buf = Buffer.from(tbc.encoding.Base58.decode(address));
	if (buf.length < 21) {
		throw new Error('Invalid address: buffer too short');
	}
	const { signatureCount, publicKeyCount } = getSignatureAndPublicKeyCount(address);

	if (signatureCount < 1 || signatureCount > 6) {
		throw new Error('Invalid signatureCount.');
	} else if (publicKeyCount < 3 || publicKeyCount > 10) {
		throw new Error('Invalid publicKeyCount.');
	} else if (signatureCount > publicKeyCount) {
		throw new Error('SignatureCount must be less than publicKeyCount.');
	}

	const hash = Buffer.from(buf.subarray(1, 21)).toString('hex');
	let lockScriptPrefix = '';

	// 生成 OP_SPLIT 部分
	for (let i = 0; i < publicKeyCount - 1; i++) {
		lockScriptPrefix = lockScriptPrefix + '21 OP_SPLIT ';
	}

	// 生成 OP_PICK 部分
	for (let i = 0; i < publicKeyCount; i++) {
		lockScriptPrefix = lockScriptPrefix + `OP_${publicKeyCount - 1} OP_PICK `;
	}

	// 生成 OP_CAT 部分
	for (let i = 0; i < publicKeyCount - 1; i++) {
		lockScriptPrefix = lockScriptPrefix + 'OP_CAT ';
	}

	const script_asm =
		`OP_${signatureCount} OP_SWAP ` +
		lockScriptPrefix +
		`OP_HASH160 ${hash} OP_EQUALVERIFY OP_${publicKeyCount} OP_CHECKMULTISIG`;

	return script_asm;
}

/**
 * 从多签地址计算 combine_script 哈希
 * @param address 多签地址
 * @returns combine_hash (hex字符串，末尾带01)
 */
export function getCombineHash(address: string): string {
	const combine_hash =
		tbc.crypto.Hash.sha256ripemd160(
			tbc.crypto.Hash.sha256(
				tbc.Script.fromASM(getMultiSigLockScript(address)).toBuffer(),
			),
		).toString('hex') + '01';
	return combine_hash;
}

/**
 * 从多签锁定脚本（ASM）中解析出多签地址
 * @param asm 多签锁定脚本的ASM字符串
 * @returns 多签地址，如果解析失败则返回 null
 */
export function parseMultiSigAddressFromASM(asm: string): string | null {
	try {
		// 多签脚本格式: OP_<M> OP_SWAP <lockScriptPrefix> OP_HASH160 <hash> OP_EQUALVERIFY OP_<N> OP_CHECKMULTISIG
		// 或者简化格式: OP_<M> <pubkey1> <pubkey2> ... <pubkeyN> OP_<N> OP_CHECKMULTISIG
		
		const parts = asm.split(/\s+/).filter(p => p.length > 0);
		
		// 检查是否以 OP_CHECKMULTISIG 结尾
		if (!parts.includes('OP_CHECKMULTISIG')) {
			return null;
		}

		// 查找 OP_HASH160 的位置（新格式）
		const hash160Index = parts.indexOf('OP_HASH160');
		if (hash160Index !== -1 && hash160Index + 1 < parts.length) {
			const hash = parts[hash160Index + 1];
			if (hash && typeof hash === 'string' && /^[0-9a-fA-F]{40}$/.test(hash)) {
				// 查找 OP_EQUALVERIFY 后的 OP_<N>
				const equalVerifyIndex = parts.indexOf('OP_EQUALVERIFY');
				if (equalVerifyIndex !== -1 && equalVerifyIndex + 1 < parts.length) {
					const opN = parts[equalVerifyIndex + 1];
					if (opN) {
						// 提取 N (公钥数量)
						const nMatch = opN.match(/^OP_(\d+)$/);
						if (nMatch && nMatch[1]) {
							const publicKeyCount = parseInt(nMatch[1], 10);
							
							// 查找开头的 OP_<M>
							const opM = parts[0];
							if (opM) {
								const mMatch = opM.match(/^OP_(\d+)$/);
								if (mMatch && mMatch[1]) {
									const signatureCount = parseInt(mMatch[1], 10);
									
											// 使用 hash、signatureCount 和 publicKeyCount 重建地址
									// 此时 hash 已经通过类型检查，确保是 string
									if (typeof hash === 'string') {
										const prefix = (signatureCount << 4) | (publicKeyCount & 0x0f);
										const versionBuffer = Buffer.from([prefix]);
										const hashBuffer = Buffer.from(hash, 'hex');
										const addressBuffer = Buffer.concat([versionBuffer, hashBuffer]);
										const addressHash = tbc.crypto.Hash.sha256sha256(addressBuffer);
										const checksum = addressHash.subarray(0, 4);
										const addressWithChecksum = Buffer.concat([addressBuffer, checksum]);
										return tbc.encoding.Base58.encode(addressWithChecksum);
									}
								}
							}
						}
					}
				}
			}
		}

		// 尝试解析传统格式: OP_<M> <pubkey1> <pubkey2> ... <pubkeyN> OP_<N> OP_CHECKMULTISIG
		// 这种情况下需要从公钥计算hash，但这里我们只处理新格式
		
		return null;
	} catch (error) {
		console.error('Failed to parse multiSig address from ASM:', error);
		return null;
	}
}

