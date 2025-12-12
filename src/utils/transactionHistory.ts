/**
 * 交易历史记录管理工具
 * 用于存储和获取 sendTransaction 的历史记录
 */

export interface TransactionHistoryItem {
	/** 请求方法/类型，如 'P2PKH' */
	method: string;
	/** 交易ID */
	txid: string;
	/** 完整的响应体 */
	response: any;
	/** 请求参数 */
	requestParams: any;
	/** 时间戳 */
	timestamp: number;
}

const HISTORY_STORAGE_KEY_PREFIX = 'transaction_history_';
const MAX_HISTORY_COUNT = 100;

/**
 * 根据钱包地址生成存储键
 * @param address 钱包地址
 * @returns 存储键
 */
function getStorageKey(address: string): string {
	if (!address) {
		throw new Error('Wallet address is required');
	}
	return `${HISTORY_STORAGE_KEY_PREFIX}${address}`;
}

/**
 * 添加交易历史记录
 * @param method 请求方法/类型
 * @param txid 交易ID
 * @param response 完整的响应体
 * @param requestParams 请求参数
 * @param address 钱包地址（用于区分不同地址的历史记录）
 */
export function addTransactionHistory(
	method: string,
	txid: string,
	response: any,
	requestParams: any,
	address: string
): void {
	try {
		if (!address) {
			console.error('Cannot save transaction history: wallet address is required');
			return;
		}
		
		// 获取现有历史记录
		const existingHistory = getTransactionHistory(address);
		
		// 创建新记录
		const newRecord: TransactionHistoryItem = {
			method,
			txid,
			response,
			requestParams,
			timestamp: Date.now(),
		};
		
		// 添加到数组开头（最新的在前面）
		const updatedHistory = [newRecord, ...existingHistory];
		
		// 限制为最近100条
		const limitedHistory = updatedHistory.slice(0, MAX_HISTORY_COUNT);
		
		// 保存到 localStorage（按地址区分）
		const storageKey = getStorageKey(address);
		localStorage.setItem(storageKey, JSON.stringify(limitedHistory));
	} catch (error) {
		console.error('Failed to save transaction history:', error);
	}
}

/**
 * 获取指定钱包地址的交易历史记录
 * @param address 钱包地址
 * @returns 历史记录数组，按时间倒序（最新的在前）
 */
export function getTransactionHistory(address: string): TransactionHistoryItem[] {
	try {
		if (!address) {
			return [];
		}
		
		const storageKey = getStorageKey(address);
		const historyStr = localStorage.getItem(storageKey);
		if (!historyStr) {
			return [];
		}
		
		const history = JSON.parse(historyStr);
		// 确保返回的是数组
		return Array.isArray(history) ? history : [];
	} catch (error) {
		console.error('Failed to get transaction history:', error);
		return [];
	}
}

/**
 * 清除指定钱包地址的交易历史记录
 * @param address 钱包地址
 */
export function clearTransactionHistory(address: string): void {
	try {
		if (!address) {
			return;
		}
		
		const storageKey = getStorageKey(address);
		localStorage.removeItem(storageKey);
		
		// 同步地址缓存（重建，因为优先从 MintHistory 读取，所以影响较小）
		import('./contractAddressCache').then((module) => {
			module.rebuildAddressCacheFromHistory(address);
		});
	} catch (error) {
		console.error('Failed to clear transaction history:', error);
	}
}

/**
 * 从响应体中提取 txid
 * @param response 响应体
 * @returns txid 字符串，如果无法提取则返回空字符串
 */
export function extractTxid(response: any): string {
	if (!response) {
		return '';
	}
	
	// 保存原始响应，以防它是字符串格式的 txid
	const originalResponse = response;
	
	// 如果响应是字符串，尝试解析为 JSON
	if (typeof response === 'string') {
		try {
			response = JSON.parse(response);
		} catch {
			// 如果解析失败，可能是响应本身就是 txid 字符串
			return originalResponse.length > 0 ? originalResponse : '';
		}
	}
	
	// 尝试多种可能的字段名
	const possibleKeys = ['txid', 'txId', 'tx_id', 'transactionId', 'transaction_id', 'hash', 'txHash'];
	
	for (const key of possibleKeys) {
		if (response[key] && typeof response[key] === 'string') {
			return response[key];
		}
	}
	
	// 如果原始响应是字符串且没有被解析（说明可能是 txid 本身）
	if (typeof originalResponse === 'string' && originalResponse.length > 0) {
		return originalResponse;
	}
	
	return '';
}

