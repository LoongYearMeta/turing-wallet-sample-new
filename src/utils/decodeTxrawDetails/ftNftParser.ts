/**
 * FT 交易解析模块
 * 根据 tbc-contract 的 FT 合约实现来识别和解析 FT 交易
 */

import * as tbc from 'tbc-lib-js';
import { extractOPReturnDataFromASM } from './scriptIdentifier';

/**
 * 交易类型常量对象
 */
export const TransactionType = {
	FT_MINT: 'FT_MINT',
	FT_TRANSFER: 'FT_TRANSFER',
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
	address: string; // 接收地址
	ft_amount: number; // 转移数量
	ft_contract_address?: string; // FT 合约地址（可选）
}

/**
 * 解析后的 FT 交易信息
 */
export interface ParsedFTTransaction {
	type: TransactionType;
	data?: any; // 统一的数据字段
	// FT_MINT: data 为 FTMintData
	// FT_TRANSFER: data 为 FTTransferData
	error?: string;
}

/**
 * 从十六进制字符串转换为文本
 */
function hexToString(hex: string): string {
	try {
		let text = '';
		for (let i = 0; i < hex.length; i += 2) {
			const hexByte = hex.substr(i, 2);
			if (hexByte.length < 2) break;
			const byte = parseInt(hexByte, 16);
			if (isNaN(byte)) break;
			text += String.fromCharCode(byte);
		}
		return text;
	} catch (error) {
		console.error('Failed to convert hex to string:', error);
		return '';
	}
}

function sanitizeText(input: string): string {
	return input.replace(/\u0000+$/g, '').trim();
}

function normalizeScriptHex(script: any): string {
	if (!script) return '';
	if (typeof script === 'string') {
		return script.replace(/\s+/g, '');
	}
	if (Buffer.isBuffer(script)) {
		return script.toString('hex');
	}
	if (script instanceof Uint8Array) {
		return Buffer.from(script).toString('hex');
	}
	try {
		return Buffer.from(script).toString('hex');
	} catch {
		return '';
	}
}

function extractOpReturnChunks(script: tbc.Script): string[] {
	const chunksHex: string[] = [];
	const chunks = script.chunks || [];
	for (let i = 0; i < chunks.length; i++) {
		const chunk = chunks[i];
		if (!chunk) continue;

		if (chunk.opcodenum === tbc.Opcode.OP_RETURN) {
			for (let j = i + 1; j < chunks.length; j++) {
				const dataChunk = chunks[j];
				if (!dataChunk?.buf) {
					break;
				}
				chunksHex.push(dataChunk.buf.toString('hex'));
			}
			break;
		}

		if (chunk.opcodenum === 0 && i + 1 < chunks.length) {
			const nextChunk = chunks[i + 1];
			if (nextChunk?.opcodenum === tbc.Opcode.OP_RETURN) {
				for (let j = i + 2; j < chunks.length; j++) {
					const dataChunk = chunks[j];
					if (!dataChunk?.buf) {
						break;
					}
					chunksHex.push(dataChunk.buf.toString('hex'));
				}
				break;
			}
		}
	}
	return chunksHex;
}

function buildMintDataFromFields(
	amountHex: string,
	decimalHex: string,
	nameHex: string,
	symbolHex: string,
): FTMintData | null {
	if (!amountHex || !decimalHex || !nameHex || !symbolHex) {
		return null;
	}

	const decimal = parseInt(decimalHex, 16);
	if (Number.isNaN(decimal)) {
		return null;
	}

	const amountBuffer = Buffer.from(amountHex, 'hex');
	if (amountBuffer.length < 48) {
		return null;
	}

	let totalSupply = BigInt(0);
	for (let i = 0; i < 6; i++) {
		const amount = amountBuffer.readBigUInt64LE(i * 8);
		totalSupply += amount;
	}

	const amount = formatAmount(totalSupply, decimal);
	const name = sanitizeText(hexToString(nameHex));
	const symbol = sanitizeText(hexToString(symbolHex));

	return {
		name: name || 'Unknown',
		symbol: symbol || 'UNK',
		amount,
		decimal,
	};
}


/**
 * 格式化金额，避免科学计数法
 */
function formatAmount(value: number | bigint, decimal: number): number {
	let safeDecimal = Number(decimal);
	if (!Number.isFinite(safeDecimal) || safeDecimal < 0) {
		safeDecimal = 6;
	}
	safeDecimal = Math.min(Math.max(Math.floor(safeDecimal), 0), 100);

	const numericValue = typeof value === 'bigint' ? Number(value) : Number(value);
	if (!Number.isFinite(numericValue)) {
		return 0;
	}

	const divisor = Math.pow(10, safeDecimal);
	const result = numericValue / divisor;

	try {
		return Number(result.toFixed(safeDecimal));
	} catch (error) {
		return result;
	}
}

/**
 * 从 Tape Script 中提取 FT 信息
 * Tape Script 格式：OP_FALSE OP_RETURN [amount(48字节)] [decimal(1字节)] [name(hex)] [symbol(hex)] 4654617065
 * 
 * 优先从 ASM 字符串解析（更准确），如果 ASM 不可用，则从 buffer 解析
 */
function parseTapeScript(tapeScriptHex: string, asm?: string, scriptObj?: tbc.Script): FTMintData | null {
	try {
		// 方法0：直接从 Script chunks 解析
		if (scriptObj) {
			const chunks = extractOpReturnChunks(scriptObj);
			if (chunks.length >= 4) {
				const [amountHex, decimalHex, nameHex, symbolHex] = chunks;
				if (amountHex && decimalHex && nameHex && symbolHex) {
					const mintData = buildMintDataFromFields(amountHex, decimalHex, nameHex, symbolHex);
					if (mintData) {
						return mintData;
					}
				}
			}
		}

		// 方法1：优先从 ASM 解析（更准确）
		if (asm) {
			const parts = asm.split(/\s+/);
			// 格式：0 OP_RETURN [amount] [decimal] [name] [symbol] 4654617065
			if (parts.length >= 7 && parts[0] === '0' && parts[1] === 'OP_RETURN') {
				const [amountHex, decimalHex, nameHex, symbolHex] = [parts[2], parts[3], parts[4], parts[5]];
				if (amountHex && decimalHex && nameHex && symbolHex) {
					const mintData = buildMintDataFromFields(amountHex, decimalHex, nameHex, symbolHex);
					if (mintData) {
						return mintData;
					}
				}
			}
		}
		
		// 方法2：从 buffer 解析（备用）
		const buffer = Buffer.from(tapeScriptHex, 'hex');
		
		// 跳过 OP_FALSE OP_RETURN (2字节)
		if (buffer.length < 3) return null;
		
		let offset = 2; // 跳过 OP_FALSE OP_RETURN
		
		// 跳过 amount (48字节，6个64位整数)
		offset += 48;
		
		// 读取 decimal (1字节)
		if (offset >= buffer.length) return null;
		const decimal = buffer[offset];
		offset += 1;
		
		// 查找 "FTape" 标识 (4654617065)
		const ftapeMarker = Buffer.from('4654617065', 'hex'); // "FTape"
		const ftapeIndex = buffer.indexOf(ftapeMarker, offset);
		if (ftapeIndex === -1) return null;
		
		// name 和 symbol 在 decimal 和 "FTape" 之间
		// 由于没有明确分隔符，尝试找到 name 和 symbol 的分界点
		// 通常 name 和 symbol 长度相近，尝试从中间分割
		const nameSymbolData = buffer.slice(offset, ftapeIndex);
		const nameSymbolHex = nameSymbolData.toString('hex');
		
		// 尝试从中间分割（假设 name 和 symbol 长度相近）
		const midPoint = Math.floor(nameSymbolHex.length / 2);
		const nameHex = nameSymbolHex.substring(0, midPoint);
		const symbolHex = nameSymbolHex.substring(midPoint);
		
		const name = sanitizeText(hexToString(nameHex));
		const symbol = sanitizeText(hexToString(symbolHex));
		
		// 从 amount 中提取总供应量
		const amountBuffer = buffer.slice(2, 2 + 48);
		let totalSupply = BigInt(0);
		for (let i = 0; i < 6; i++) {
			const amount = amountBuffer.readBigUInt64LE(i * 8);
			totalSupply += amount;
		}
		
		// 转换为实际数量（考虑 decimal）
		const decimalValue = decimal || 6; // 默认 decimal 为 6
		const amount = formatAmount(totalSupply, decimalValue);
		
		return {
			name: name || 'Unknown',
			symbol: symbol || 'UNK',
			amount: amount,
			decimal: decimalValue,
		};
	} catch (error) {
		console.error('Failed to parse tape script:', error);
		return null;
	}
}

/**
 * 从 Code Script 中提取接收地址
 * Code Script 在位置 1537 包含 21 字节的地址哈希（20字节哈希 + 1字节标志）
 */
function extractAddressFromCodeScript(codeScriptHex: string): string | null {
	try {
		const buffer = Buffer.from(codeScriptHex, 'hex');
		
		// 检查长度
		if (buffer.length < 1537 + 21) return null;
		
		// 提取地址哈希部分（位置 1537，21字节）
		const addressHashBuffer = buffer.slice(1537, 1537 + 21);
		const flag = addressHashBuffer[20]; // 最后一个字节是标志
		const hashBuffer = addressHashBuffer.slice(0, 20); // 前20字节是哈希
		
		// 如果标志是 0x00，表示是地址
		if (flag === 0x00) {
			try {
				const address = new tbc.Address(hashBuffer, tbc.Networks.livenet);
				return address.toString();
			} catch (e) {
				// 如果无法解析为地址，返回哈希
				return hashBuffer.toString('hex');
			}
		}
		
		// 如果标志是 0x01，表示是哈希
		if (flag === 0x01) {
			return hashBuffer.toString('hex');
		}
		
		return null;
	} catch (error) {
		console.error('Failed to extract address from code script:', error);
		return null;
	}
}

/**
 * 从 Tape Script 中提取余额
 * 使用与 FT.getBalanceFromTape 相同的逻辑
 */
function getBalanceFromTape(tapeScriptHex: string): bigint {
	try {
		const buffer = Buffer.from(tapeScriptHex, 'hex');
		
		// 跳过 OP_FALSE OP_RETURN (2字节)
		if (buffer.length < 3) return BigInt(0);
		
		// 读取 amount 部分（位置 3，48字节）
		const amountBuffer = buffer.slice(3, 3 + 48);
		if (amountBuffer.length < 48) return BigInt(0);
		
		let balance = BigInt(0);
		for (let i = 0; i < 6; i++) {
			const amount = amountBuffer.readBigUInt64LE(i * 8);
			balance += amount;
		}
		
		return balance;
	} catch (error) {
		console.error('Failed to get balance from tape:', error);
		return BigInt(0);
	}
}

/**
 * 识别交易类型
 * 根据 FT 合约的实际实现来识别
 * 
 * 识别逻辑：
 * 1. FT_MINT：必须包含 "for ft mint" flag 的 OP_RETURN
 * 2. FT_TRANSFER：有 Code Script (satoshis=500) + Tape Script (satoshis=0) 的组合，但没有 "for ft mint" flag
 */
const FT_UNLOCK_SCRIPT_MIN_LENGTH = 300;

export function identifyTransactionType(txObj: any): TransactionType {
	const outputs = txObj.outputs || [];
	const inputs = txObj.inputs || [];
	let hasMintFlag = false;
	let hasCodeScript = false;
	let hasTapeScript = false;
	let hasFtUnlockInput = false;
	
	for (const output of outputs) {
		if (!output.script) continue;

		try {
			const script = new tbc.Script(output.script);
			const asm = script.toASM();

			// 检查 "for ft mint" flag
			if (asm.includes('OP_RETURN')) {
				console.log('asm', asm);
				const opReturnData = extractOPReturnDataFromASM(asm);
				console.log('opReturnData', opReturnData);
				if (opReturnData) {
					// 检查是否包含 "for ft mint" flag
					const mintFlagHex = Buffer.from('for ft mint', 'utf8').toString('hex');
					const cleanOpReturn = opReturnData.replace(/\s+/g, '');
					console.log('cleanOpReturn', cleanOpReturn);
					if (cleanOpReturn.includes(mintFlagHex.toLowerCase()) || 
						cleanOpReturn.includes(mintFlagHex.toUpperCase())) {
						hasMintFlag = true;
					}
					
					// 检查是否包含 "FT_TRANSFER" flag（如果通过 additionalInfo 添加）
					const transferFlagHex = Buffer.from('FT_TRANSFER', 'utf8').toString('hex');
					if (cleanOpReturn.includes(transferFlagHex.toLowerCase()) || 
						cleanOpReturn.includes(transferFlagHex.toUpperCase())) {
						return TransactionType.FT_TRANSFER;
					}
				}
			}
			
			// 检查 Code Script (satoshis = 500, 复杂脚本)
			if (output.satoshis === 500 && asm.length > 100) {
				hasCodeScript = true;
			}
			
			// 检查 Tape Script (satoshis = 0, 包含 "FTape")
			if (output.satoshis === 0 && (asm.includes('4654617065') || asm.includes('FTape'))) {
				hasTapeScript = true;
			}
		} catch (error) {
			console.error('Error identifying transaction type:', error);
		}
	}

	// 检查输入脚本，判断是否存在 FT 解锁脚本（长度通常远大于普通 P2PKH）
	for (const input of inputs) {
		if (!input.script) continue;
		try {
			const script = new tbc.Script(input.script);
			const length = script.toBuffer().length;
			if (length > FT_UNLOCK_SCRIPT_MIN_LENGTH) {
				hasFtUnlockInput = true;
				break;
			}
		} catch (error) {
			continue;
		}
	}
	
	// 优先判断 FT_MINT（必须有 flag）
	if (hasMintFlag) {
		return TransactionType.FT_MINT;
	}
	
	// FT_TRANSFER：有 Code Script + Tape Script，但没有 mint flag
	if (hasCodeScript && hasTapeScript) {
		if (!hasFtUnlockInput) {
			return TransactionType.FT_MINT;
		}
		return TransactionType.FT_TRANSFER;
	}
	
	return TransactionType.UNKNOWN;
}

/**
 * 解析 FT 交易数据
 * 根据 FT 合约的实际结构来解析
 */
export function parseFTTransaction(
	outputs: any[],
	transactionType: TransactionType,
): ParsedFTTransaction {
	const result: ParsedFTTransaction = {
		type: transactionType,
	};

	try {
		switch (transactionType) {
			case TransactionType.FT_MINT:
				// FT_MINT 交易结构：
				// - Source 交易：包含 "for ft mint" flag 的 OP_RETURN 输出
				// - Mint 交易：包含 Code Script 和 Tape Script 的输出
				
				// 查找 Tape Script 输出（包含 "FTape" 标识）
				for (const output of outputs) {
					if (!output.script) continue;
					
					try {
						const script = new tbc.Script(output.script);
						const asm = script.toASM();
						
						// 检查是否是 Tape Script（包含 "FTape"）
						if (asm.includes('4654617065') || asm.includes('FTape')) {
							const scriptHex = normalizeScriptHex(output.script);
							const tapeData = parseTapeScript(scriptHex, asm, script);
							
							if (tapeData) {
								result.data = tapeData;
								// 不返回 rawData
								return result;
							}
						}
					} catch (e) {
						continue;
					}
				}
				
				// 如果没有找到 Tape Script，尝试从 OP_RETURN 中提取
				for (const output of outputs) {
					if (!output.script) continue;
					
					try {
						const script = new tbc.Script(output.script);
						const asm = script.toASM();
						
						if (!asm.includes('OP_RETURN')) continue;
						
						const opReturnData = extractOPReturnDataFromASM(asm);
						if (!opReturnData) continue;
						
						// 检查是否包含 "for ft mint" flag
						const mintFlagHex = Buffer.from('for ft mint', 'utf8').toString('hex');
						const cleanOpReturn = opReturnData.replace(/\s+/g, '');
						
						if (cleanOpReturn.includes(mintFlagHex.toLowerCase()) || cleanOpReturn.includes(mintFlagHex.toUpperCase())) {
							// 对于 Source 交易，可能没有完整的 Tape Script，返回基本信息
							result.data = {
								name: 'Unknown',
								symbol: 'UNK',
								amount: 0,
								decimal: 6,
							};
							// 不返回 rawData
							return result;
						}
					} catch (e) {
						continue;
					}
				}
				
				result.error = 'Failed to parse FT_MINT transaction: Tape Script not found';
				break;

			case TransactionType.FT_TRANSFER:
				// FT_TRANSFER 交易结构：
				// - 输入：FT UTXO(s) + TBC UTXO(s)
				// - 输出1：接收者的 Code Script（包含接收地址）
				// - 输出2：接收者的 Tape Script（包含转移金额）
				// - 输出3（可选）：发送者的 Code Script（找零）
				// - 输出4（可选）：发送者的 Tape Script（找零余额）
				// - 输出5（可选）：额外的 OP_RETURN（如果使用 transferWithAdditionalInfo）
				
				// 查找接收者的 Code Script 和 Tape Script
				// Code Script 通常 satoshis = 500
				// Tape Script 通常 satoshis = 0 且包含 "FTape"
				// 接收者的 Code Script 和 Tape Script 通常是相邻的（第一个配对）
				// 找零的 Code Script 和 Tape Script 通常在后面
				
				let recipientCodeScript: any = null;
				let recipientTapeScript: any = null;
				
				// 优先查找第一个配对的 Code Script + Tape Script（接收者）
				// 遍历输出，查找相邻的 Code Script 和 Tape Script 配对
				for (let i = 0; i < outputs.length - 1; i++) {
					const output1 = outputs[i];
					const output2 = outputs[i + 1];
					
					if (!output1?.script || !output2?.script) continue;
					
					try {
						const script1 = new tbc.Script(output1.script);
						const script2 = new tbc.Script(output2.script);
						const asm1 = script1.toASM();
						const asm2 = script2.toASM();
						
						// 检查是否是 Code Script + Tape Script 配对
						// Code Script: satoshis = 500 且是复杂脚本
						// Tape Script: satoshis = 0 且包含 "FTape"
						const isCodeScript = output1.satoshis === 500 && asm1.length > 100;
						const isTapeScript = output2.satoshis === 0 && (asm2.includes('4654617065') || asm2.includes('FTape'));
						
						if (isCodeScript && isTapeScript) {
							// 找到第一个配对，这应该是接收者的
							recipientCodeScript = output1;
							recipientTapeScript = output2;
							break; // 找到第一个配对就停止，避免匹配到找零输出
						}
					} catch (e) {
						continue;
					}
				}
				
				// 如果没有找到配对，使用原来的逻辑（向后兼容）
				if (!recipientCodeScript || !recipientTapeScript) {
					for (const output of outputs) {
						if (!output.script) continue;
						
						try {
							const script = new tbc.Script(output.script);
							const asm = script.toASM();
							
							// 查找 Tape Script（satoshis = 0 且包含 "FTape"）
							if (!recipientTapeScript && output.satoshis === 0 && (asm.includes('4654617065') || asm.includes('FTape'))) {
								recipientTapeScript = output;
							}
							
							// 查找 Code Script（satoshis = 500 且是复杂脚本）
							if (!recipientCodeScript && output.satoshis === 500 && asm.length > 100) {
								recipientCodeScript = output;
							}
						} catch (e) {
							continue;
						}
					}
				}
				
				// 从 Code Script 提取接收地址
				let recipientAddress: string | null = null;
				if (recipientCodeScript) {
					const codeScriptHex = normalizeScriptHex(recipientCodeScript.script);
					recipientAddress = extractAddressFromCodeScript(codeScriptHex);
				}
				
				// 从 Tape Script 提取转移金额
				let ftAmount = 0;
				let decimal = 6; // 默认 decimal
				if (recipientTapeScript) {
					const tapeScriptHex = normalizeScriptHex(recipientTapeScript.script);
					const script = new tbc.Script(recipientTapeScript.script);
					const asm = script.toASM();
					
				// 尝试从 Tape Script 解析 decimal
				const parts = asm.split(/\s+/);
				if (parts.length >= 4 && parts[0] === '0' && parts[1] === 'OP_RETURN') {
					const decimalHex = parts[3];
					if (decimalHex) {
						const parsedDecimal = parseInt(decimalHex, 16);
						if (!isNaN(parsedDecimal)) {
							decimal = parsedDecimal;
						}
					}
				}
					
					const balance = getBalanceFromTape(tapeScriptHex);
					// 转换为实际数量（考虑 decimal）
					ftAmount = formatAmount(balance, decimal);
				}
				
				// 检查是否有额外的 OP_RETURN（包含 FT_TRANSFER 信息）
				for (const output of outputs) {
					if (!output.script) continue;
					
					try {
						const script = new tbc.Script(output.script);
						const asm = script.toASM();
						
						if (!asm.includes('OP_RETURN')) continue;
						
						const opReturnData = extractOPReturnDataFromASM(asm);
						if (!opReturnData) continue;
						
						// 尝试解析为 JSON（如果使用 transferWithAdditionalInfo）
						try {
							const cleanHex = opReturnData.replace(/\s+/g, '');
							const text = hexToString(cleanHex);
							
							if (text.trim().startsWith('{')) {
								const jsonData = JSON.parse(text);
								if (jsonData.flag === 'FT_TRANSFER') {
									result.data = {
										address: jsonData.address || recipientAddress || '',
										ft_amount: jsonData.ft_amount || ftAmount,
										ft_contract_address: jsonData.ft_contract_address,
									};
									// 不返回 rawData
									return result;
								}
							}
						} catch (e) {
							// 不是 JSON，继续
						}
					} catch (e) {
						continue;
					}
				}
				
				// 如果没有找到 JSON 数据，使用从脚本中提取的信息
				if (recipientAddress || ftAmount > 0) {
					result.data = {
						address: recipientAddress || '',
						ft_amount: ftAmount,
					};
					return result;
				}
				
				result.error = 'Failed to parse FT_TRANSFER transaction: Code Script or Tape Script not found';
				break;

			default:
				result.error = `Unknown transaction type: ${transactionType}`;
		}
	} catch (error) {
		console.error('Error parsing FT transaction:', error);
		result.error = error instanceof Error ? error.message : 'Unknown error';
	}

	return result;
}
