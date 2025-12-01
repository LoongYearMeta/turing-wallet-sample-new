/**
 * 脚本解析模块
 * 解析脚本hex，识别类型并提取地址等信息
 */

import * as tbc from 'tbc-lib-js';
import { ScriptType } from './types';
import type { ScriptDetail, ScriptOpReturnData } from './types';
import { TransactionType } from './ftNftParser';

const PRINTABLE_ASCII_MIN = 32;
const PRINTABLE_ASCII_MAX = 126;

function safeFormatAmount(value: bigint, decimal: number): string {
	const safeDecimal = Math.min(Math.max(Number.isFinite(decimal) ? Math.floor(decimal) : 0, 0), 18);
	if (safeDecimal === 0) {
		return value.toString();
	}
	const divisor = BigInt(10) ** BigInt(safeDecimal);
	const integerPart = value / divisor;
	const fractionPart = value % divisor;
	if (fractionPart === BigInt(0)) {
		return integerPart.toString();
	}
	const fractionStr = fractionPart.toString().padStart(safeDecimal, '0').replace(/0+$/, '');
	return `${integerPart.toString()}.${fractionStr}`;
}

function decodeFtTapeParts(parts: string[]) {
	if (parts.length < 5) return null;
	const marker = parts[parts.length - 1]?.toLowerCase();
	if (marker !== '4654617065') return null;

	const amountHex = parts[0];
	const decimalHex = parts[1];
	const nameHex = parts[2];
	const symbolHex = parts[3];

	if (!amountHex || !decimalHex || !nameHex || !symbolHex) return null;

	const decimal = parseInt(decimalHex, 16);
	if (Number.isNaN(decimal)) return null;

	try {
		const amountBuffer = Buffer.from(amountHex, 'hex');
		if (amountBuffer.length < 48) return null;
		let totalSupply = BigInt(0);
		for (let i = 0; i < 6; i++) {
			totalSupply += amountBuffer.readBigUInt64LE(i * 8);
		}

		const name = hexToAscii(nameHex).replace(/\u0000+$/g, '').trim();
		const symbol = hexToAscii(symbolHex).replace(/\u0000+$/g, '').trim();

		const totalSupplyFormatted = safeFormatAmount(totalSupply, decimal);
		const amount =
			parseFloat(totalSupplyFormatted) || parseFloat(totalSupply.toString()) || Number(totalSupply);

		return {
			type: TransactionType.FT_MINT,
			data: {
				name,
				symbol,
				amount: amount,
				decimal,
			},
		};
	} catch (error) {
		console.error('Failed to decode FT tape parts:', error);
		return null;
	}
}

function hexToAscii(hex: string): string {
	const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
	if (cleanHex.length === 0 || cleanHex.length % 2 !== 0) {
		return '';
	}
	let result = '';
	for (let i = 0; i < cleanHex.length; i += 2) {
		const byte = parseInt(cleanHex.substring(i, i + 2), 16);
		if (Number.isNaN(byte)) {
			return '';
		}
		if (byte >= PRINTABLE_ASCII_MIN && byte <= PRINTABLE_ASCII_MAX) {
			result += String.fromCharCode(byte);
		} else {
			result += '.';
		}
	}
	return result;
}

function buildOpReturnData(parts: string[]): ScriptOpReturnData | undefined {
	if (!parts.length) {
		return undefined;
	}

	const ftData = decodeFtTapeParts(parts);
	if (ftData) {
		return { ft_data: ftData };
	}

	const asciiParts = parts.map((part) => hexToAscii(part));

	// 单个数据段，尝试直接返回可读文本
	if (parts.length === 1) {
		const ascii = asciiParts[0]?.trim();
		if (ascii) {
			return { type: ascii };
		}
		return { hexParts: parts, asciiParts };
	}

	// 两个数据段：默认第一个是 hash，第二个是类型标识
	if (parts.length === 2) {
		const codeType = asciiParts[1]?.trim() || '';
		return {
			publicKeyHash: parts[0],
			codeType: codeType || parts[1],
		};
	}

	// 其他情况保留 hex/ASCII 以便调试
	return {
		hexParts: parts,
		asciiParts,
	};
}

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
					// type 字段只在 P2PKH 时显示，P2PK 不显示
					address,
				};
			} catch (error) {
				console.error('Failed to extract address from P2PK script:', error);
			}
		}

		// 检查是否包含OP_RETURN
		if (asm.includes('OP_RETURN') || asm.includes('OP_FALSE OP_RETURN')) {
			// 尝试提取OP_RETURN数据
			const extractDataAfterOpReturn = (chunks: any[], startIndex: number) => {
				const parts: string[] = [];
				for (let j = startIndex; j < chunks.length; j++) {
					const dataChunk = chunks[j];
					if (!dataChunk) break;
					if (dataChunk.buf) {
						parts.push(dataChunk.buf.toString('hex'));
					} else {
						// 遇到新的 opcode，停止收集
						break;
					}
				}
				return parts;
			};

			let dataParts: string[] = [];
			try {
				// 查找OP_RETURN后的数据
				const chunks = script.chunks;
				if (chunks && chunks.length > 0) {
					for (let i = 0; i < chunks.length; i++) {
						const chunk = chunks[i];
						if (!chunk) continue;
						
						if (chunk.opcodenum === tbc.Opcode.OP_RETURN) {
							// 获取 OP_RETURN 后的所有数据段
							dataParts = extractDataAfterOpReturn(chunks, i + 1);
							break;
						}
						// 处理OP_FALSE OP_RETURN格式
						if (
							chunk.opcodenum === 0 && // OP_FALSE/OP_0 = 0
							i + 1 < chunks.length
						) {
							const nextChunk = chunks[i + 1];
							if (nextChunk?.opcodenum === tbc.Opcode.OP_RETURN) {
								dataParts = extractDataAfterOpReturn(chunks, i + 2);
								break;
							}
						}
					}
				}
			} catch (error) {
				console.error('Failed to extract OP_RETURN data:', error);
			}

			const opReturnData = buildOpReturnData(dataParts);

			// 检查是否是P2PKH + OP_RETURN组合
			if (script.isPublicKeyHashOut()) {
				try {
					const pubKeyHash = script.getPublicKeyHash();
					const address = new tbc.Address(pubKeyHash, tbc.Networks.livenet).toString();
					return {
						asm,
						type: ScriptType.P2PKH,
						address,
						data: opReturnData,
					};
				} catch (error) {
					console.error('Failed to extract address from P2PKH+OP_RETURN script:', error);
				}
			}

			return {
				asm,
				// type 字段只在 P2PKH 时显示，OP_RETURN 不显示
				data: opReturnData,
			};
		}

		// 未知类型
		return {
			asm,
			// type 字段只在 P2PKH 时显示，UNKNOWN 不显示
		};
	} catch (error) {
		console.error('Failed to parse script:', error);
		return {
			asm: 'Parse Error',
			// type 字段只在 P2PKH 时显示
		};
	}
}

