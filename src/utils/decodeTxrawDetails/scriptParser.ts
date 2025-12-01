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

/**
 * 从 publicKeyHash 解码地址或hash
 * 根据 tbc-contract 的逻辑：
 * - 如果 hash 以 00 结尾，表示是地址（address），前20字节是 publicKeyHash
 * - 如果 hash 以 01 结尾，表示是 hash，前20字节是 hash
 * 
 * @param hex 十六进制字符串，应该是21字节（42个hex字符）
 * @returns 如果是地址则返回地址字符串，如果是hash则返回hash字符串，否则返回null
 */
function decodeAddressFromPublicKeyHash(hex: string): { address?: string; hash?: string; flag: 'address' | 'hash' | 'unknown' } | null {
	try {
		// 移除所有空格
		const cleanHex = hex.replace(/\s+/g, '');
		
		// 检查长度：应该是 21 字节（20字节hash + 1字节标志）= 42个hex字符
		if (cleanHex.length !== 42) {
			return null;
		}
		
		const buffer = Buffer.from(cleanHex, 'hex');
		if (buffer.length !== 21) {
			return null;
		}
		
		const flag = buffer[20]; // 最后一个字节是标志
		const hashBuffer = buffer.slice(0, 20); // 前20字节是hash
		const hashHex = hashBuffer.toString('hex');
		
		// 如果标志是 0x00，表示是地址
		if (flag === 0x00) {
			try {
				// 尝试使用 livenet 网络
				const address = new tbc.Address(hashBuffer, tbc.Networks.livenet);
				return {
					address: address.toString(),
					flag: 'address',
				};
			} catch (e) {
				// 如果 livenet 失败，尝试 testnet
				try {
					const address = new tbc.Address(hashBuffer, tbc.Networks.testnet);
					return {
						address: address.toString(),
						flag: 'address',
					};
				} catch (e2) {
					// 如果都失败，返回hash，但保留 flag 信息
					// 这样调用者可以知道这应该是一个地址，只是解析失败
					return {
						hash: hashHex,
						flag: 'address', // 标志是address，但解析失败
					};
				}
			}
		}
		
		// 如果标志是 0x01，表示是hash
		if (flag === 0x01) {
			return {
				hash: hashHex,
				flag: 'hash',
			};
		}
		
		return null;
	} catch (error) {
		console.error('Failed to decode address from publicKeyHash:', error);
		return null;
	}
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
		// 检查可读性：如果包含太多 '.'，认为不可读
		if (ascii) {
			const dotCount = (ascii.match(/\./g) || []).length;
			const readableRatio = ascii.length > 0 ? (ascii.length - dotCount) / ascii.length : 0;
			// 如果可读字符比例 > 50%，使用 ASCII，否则返回 hex
			if (readableRatio > 0.5) {
				return { type: ascii };
			}
		}
		// 如果不可读，只返回 hex，不返回 asciiParts（避免显示乱码）
		return { hexParts: parts };
	}

	// 两个数据段：检查第一个是否是 publicKeyHash（21字节，以00或01结尾）
	// 这在 FT-TRANSFER 交易中很常见，第一个数据段包含接收地址信息
	if (parts.length === 2) {
		const firstPart = parts[0]?.replace(/\s+/g, '') || '';
		const secondPart = parts[1]?.replace(/\s+/g, '') || '';
		
		// 检查第一个数据段是否是21字节（42个hex字符）
		if (firstPart.length === 42) {
			const decodedResult = decodeAddressFromPublicKeyHash(firstPart);
			
			if (decodedResult) {
				// 如果成功解码，返回地址或hash信息
				const result: ScriptOpReturnData = {
					publicKeyHash: firstPart.slice(0, 40), // 前20字节的hash（不含标志）
					flag: decodedResult.flag,
				};
				
				// 设置地址或hash
				if (decodedResult.address) {
					// 如果已经成功解析出地址，直接使用
					result.address = decodedResult.address;
				} else if (decodedResult.flag === 'address') {
					// 如果 flag 是 'address' 但没有解析出地址，说明 decodeAddressFromPublicKeyHash 失败了
					// 但我们仍然应该尝试解析，因为 flag 明确表示这是地址
					const hashBuffer = Buffer.from(firstPart.slice(0, 40), 'hex');
					try {
						// 尝试使用 livenet
						const address = new tbc.Address(hashBuffer, tbc.Networks.livenet);
						result.address = address.toString();
					} catch (e) {
						try {
							// 尝试使用 testnet
							const address = new tbc.Address(hashBuffer, tbc.Networks.testnet);
							result.address = address.toString();
						} catch (e2) {
							// 如果都失败，保留 hash 以便调试
							result.hash = decodedResult.hash || firstPart.slice(0, 40);
						}
					}
				} else if (decodedResult.hash) {
					// 如果 flag 是 'hash'，直接使用 hash
					result.hash = decodedResult.hash;
				}
				
				// 处理第二个数据段（codeType）
				// 先尝试 ASCII 转换，如果结果不可读（包含太多 '.'），则使用原始 hex
				const asciiCodeType = asciiParts[1]?.trim() || '';
				const dotCount = (asciiCodeType.match(/\./g) || []).length;
				const readableRatio = asciiCodeType.length > 0 ? (asciiCodeType.length - dotCount) / asciiCodeType.length : 0;
				
				// 如果可读字符比例 > 50%，使用 ASCII，否则使用原始 hex
				if (readableRatio > 0.5 && asciiCodeType.length > 0) {
					result.codeType = asciiCodeType;
				} else {
					result.codeType = secondPart;
				}
				
				return result;
			}
		}
		
		// 如果不是21字节格式，使用原来的逻辑
		// 同样处理 codeType，避免乱码
		const asciiCodeType = asciiParts[1]?.trim() || '';
		const dotCount = (asciiCodeType.match(/\./g) || []).length;
		const readableRatio = asciiCodeType.length > 0 ? (asciiCodeType.length - dotCount) / asciiCodeType.length : 0;
		
		let codeType: string;
		if (readableRatio > 0.5 && asciiCodeType.length > 0) {
			codeType = asciiCodeType;
		} else {
			codeType = parts[1] || '';
		}
		
		return {
			publicKeyHash: parts[0],
			codeType: codeType,
		};
	}

	// 其他情况保留 hex/ASCII 以便调试
	// 过滤掉不可读的 ASCII（包含太多 '.' 的）
	const filteredAsciiParts = asciiParts.map((ascii, index) => {
		if (!ascii || ascii.length === 0) return '';
		const dotCount = (ascii.match(/\./g) || []).length;
		const readableRatio = (ascii.length - dotCount) / ascii.length;
		// 如果可读字符比例 < 50%，返回空字符串，避免显示乱码
		return readableRatio >= 0.5 ? ascii : '';
	}).filter(ascii => ascii.length > 0);
	
	return {
		hexParts: parts,
		asciiParts: filteredAsciiParts.length > 0 ? filteredAsciiParts : undefined,
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

