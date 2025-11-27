/**
 * 脚本解析模块
 * 解析脚本hex，识别类型并提取地址等信息
 */

import * as tbc from 'tbc-lib-js';
import { ScriptType } from './types';
import type { ScriptDetail } from './types';

/**
 * 解析脚本，识别类型并提取信息
 */
export function parseScript(scriptHex: string): ScriptDetail {
	try {
		const script = new tbc.Script(scriptHex);
		const asm = script.toASM();

		// 检查是否是P2PKH输出脚本
		if (script.isPublicKeyHashOut()) {
			try {
				const pubKeyHash = script.getPublicKeyHash();
				const address = new tbc.Address(pubKeyHash, tbc.Networks.livenet).toString();
				return {
					asm,
					type: ScriptType.P2PKH,
					address,
				};
			} catch (error) {
				console.error('Failed to extract address from P2PKH script:', error);
			}
		}

		// 检查是否是P2PK输出脚本
		if (script.isPublicKeyOut()) {
			try {
				const pubKeyBuf = script.getPublicKey();
				const pubKey = tbc.PublicKey.fromBuffer(pubKeyBuf);
				const address = pubKey.toAddress().toString();
				return {
					asm,
					type: ScriptType.P2PK,
					address,
				};
			} catch (error) {
				console.error('Failed to extract address from P2PK script:', error);
			}
		}

		// 检查是否包含OP_RETURN
		if (asm.includes('OP_RETURN') || asm.includes('OP_FALSE OP_RETURN')) {
			// 尝试提取OP_RETURN数据
			let data = '';
			try {
				// 查找OP_RETURN后的数据
				const chunks = script.chunks;
				if (chunks && chunks.length > 0) {
					for (let i = 0; i < chunks.length; i++) {
						const chunk = chunks[i];
						if (!chunk) continue;
						
						if (chunk.opcodenum === tbc.Opcode.OP_RETURN) {
							// 获取OP_RETURN后的数据
							const nextChunk = i + 1 < chunks.length ? chunks[i + 1] : null;
							if (nextChunk?.buf) {
								data = nextChunk.buf.toString('hex');
							}
							break;
						}
						// 处理OP_FALSE OP_RETURN格式
						if (
							chunk.opcodenum === 0 && // OP_FALSE/OP_0 = 0
							i + 1 < chunks.length
						) {
							const nextChunk = chunks[i + 1];
							if (nextChunk?.opcodenum === tbc.Opcode.OP_RETURN) {
								// 获取OP_RETURN后的数据
								const dataChunk = i + 2 < chunks.length ? chunks[i + 2] : null;
								if (dataChunk?.buf) {
									data = dataChunk.buf.toString('hex');
								}
								break;
							}
						}
					}
				}
			} catch (error) {
				console.error('Failed to extract OP_RETURN data:', error);
			}

			// 检查是否是P2PKH + OP_RETURN组合
			if (script.isPublicKeyHashOut()) {
				try {
					const pubKeyHash = script.getPublicKeyHash();
					const address = new tbc.Address(pubKeyHash, tbc.Networks.livenet).toString();
					return {
						asm,
						type: ScriptType.P2PKH,
						address,
						data: data || undefined,
					};
				} catch (error) {
					console.error('Failed to extract address from P2PKH+OP_RETURN script:', error);
				}
			}

			return {
				asm,
				type: ScriptType.OP_RETURN,
				data: data || undefined,
			};
		}

		// 未知类型
		return {
			asm,
			type: ScriptType.UNKNOWN,
		};
	} catch (error) {
		console.error('Failed to parse script:', error);
		return {
			asm: 'Parse Error',
			type: ScriptType.UNKNOWN,
		};
	}
}

