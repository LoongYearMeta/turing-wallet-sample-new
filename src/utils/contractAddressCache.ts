/**
 * 合约地址缓存管理工具
 * 用于存储和管理合约地址，支持从历史记录中自动提取
 */

import { getTransactionHistory } from './transactionHistory';
import { getMintHistory } from './mintHistory';

export interface ContractAddressItem {
	/** 唯一ID */
	id: string;
	/** 合约地址 */
	address: string;
	/** 地址类型 */
	type: 'nft' | 'ft' | 'collection';
	/** 来源交易类型（如 'NFT_CREATE', 'FT_MINT'） */
	source: string;
	/** 关联的交易ID */
	txid: string;
	/** 用户自定义标签（可选） */
	label?: string;
	/** 添加时间戳 */
	timestamp: number;
	/** 最后使用时间戳 */
	lastUsed?: number;
}

export type AddressType = 'nft' | 'ft' | 'collection';

const ADDRESS_CACHE_STORAGE_KEY = 'contract_address_cache';
const MAX_ADDRESSES_PER_TYPE = 20;

/**
 * 生成唯一ID
 */
const generateId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/**
 * 获取所有缓存的地址
 */
function getAllCachedAddresses(): {
	nft: ContractAddressItem[];
	ft: ContractAddressItem[];
	collection: ContractAddressItem[];
} {
	try {
		const cacheStr = localStorage.getItem(ADDRESS_CACHE_STORAGE_KEY);
		if (!cacheStr) {
			return { nft: [], ft: [], collection: [] };
		}

		const cache = JSON.parse(cacheStr);
		return {
			nft: Array.isArray(cache.nft) ? cache.nft : [],
			ft: Array.isArray(cache.ft) ? cache.ft : [],
			collection: Array.isArray(cache.collection) ? cache.collection : [],
		};
	} catch (error) {
		console.error('Failed to get contract address cache:', error);
		return { nft: [], ft: [], collection: [] };
	}
}

/**
 * 保存所有缓存的地址
 */
function saveAllCachedAddresses(cache: {
	nft: ContractAddressItem[];
	ft: ContractAddressItem[];
	collection: ContractAddressItem[];
}): void {
	try {
		localStorage.setItem(ADDRESS_CACHE_STORAGE_KEY, JSON.stringify(cache));
	} catch (error) {
		console.error('Failed to save contract address cache:', error);
	}
}

/**
 * 从交易响应中提取合约地址（导出供外部使用）
 * 合约地址本质上就是 txid，只是创造 txid 的交易类型不同
 */
export function extractAddressFromResponse(
	method: string,
	response: any
): { address: string; type: AddressType } | null {
	if (!response) return null;

	// 如果响应是字符串，尝试解析为 JSON
	let parsedResponse = response;
	if (typeof response === 'string') {
		try {
			parsedResponse = JSON.parse(response);
		} catch {
			// 如果解析失败，可能是响应本身就是 txid 字符串
			// 根据交易类型确定地址类型
			if (method === 'NFT_CREATE') {
				return { address: response.trim(), type: 'nft' };
			}
			if (method === 'FT_MINT' || method === 'POOLNFT_MINT') {
				return { address: response.trim(), type: 'ft' };
			}
			if (method === 'COLLECTION_CREATE') {
				return { address: response.trim(), type: 'collection' };
			}
			return null;
		}
	}

	// 提取 txid（合约地址就是 txid）
	const txid =
		parsedResponse.txid ||
		parsedResponse.txId ||
		parsedResponse.tx_id ||
		parsedResponse.transactionId ||
		parsedResponse.transaction_id ||
		parsedResponse.hash ||
		parsedResponse.txHash;

	if (!txid || typeof txid !== 'string' || txid.trim().length === 0) {
		return null;
	}

	// 根据交易类型确定地址类型
	if (method === 'NFT_CREATE') {
		return { address: txid.trim(), type: 'nft' };
	}
	if (method === 'FT_MINT' || method === 'POOLNFT_MINT') {
		return { address: txid.trim(), type: 'ft' };
	}
	if (method === 'COLLECTION_CREATE') {
		return { address: txid.trim(), type: 'collection' };
	}

	return null;
}

/**
 * 添加地址到缓存
 * @param address 合约地址
 * @param type 地址类型
 * @param source 来源交易类型
 * @param txid 交易ID
 * @param label 用户自定义标签（可选）
 * @param timestamp 时间戳（可选，用于排序，默认使用当前时间）
 */
export function addContractAddress(
	address: string,
	type: AddressType,
	source: string,
	txid: string,
	label?: string,
	timestamp?: number
): void {
	try {
		if (!address || !address.trim()) {
			return;
		}

		const trimmedAddress = address.trim();
		const cache = getAllCachedAddresses();
		const addresses = cache[type];

		// 检查是否已存在
		const existingIndex = addresses.findIndex((item) => item.address === trimmedAddress);
		if (existingIndex !== -1 && addresses[existingIndex]) {
			// 更新最后使用时间和时间戳（如果提供了更新的时间戳）
			addresses[existingIndex]!.lastUsed = Date.now();
			if (timestamp !== undefined && timestamp > addresses[existingIndex]!.timestamp) {
				addresses[existingIndex]!.timestamp = timestamp;
			}
			if (label) {
				addresses[existingIndex]!.label = label;
			}
			saveAllCachedAddresses(cache);
			return;
		}

		// 如果超过最大数量，删除最久未使用的
		if (addresses.length >= MAX_ADDRESSES_PER_TYPE) {
			const sorted = [...addresses].sort((a, b) => {
				const aTime = a.lastUsed || a.timestamp;
				const bTime = b.lastUsed || b.timestamp;
				return aTime - bTime;
			});
			const toRemove = sorted[0];
			if (toRemove) {
				const removeIndex = addresses.findIndex((item) => item.id === toRemove.id);
				if (removeIndex !== -1) {
					addresses.splice(removeIndex, 1);
				}
			}
		}

		// 添加新地址
		const newItem: ContractAddressItem = {
			id: generateId(),
			address: trimmedAddress,
			type,
			source,
			txid,
			label,
			timestamp: timestamp !== undefined ? timestamp : Date.now(),
			lastUsed: Date.now(),
		};

		addresses.push(newItem);
		saveAllCachedAddresses(cache);
	} catch (error) {
		console.error('Failed to add contract address:', error);
	}
}

/**
 * 获取指定类型的地址列表（按时间戳排序，越新的越靠前）
 */
export function getContractAddresses(type: AddressType): ContractAddressItem[] {
	try {
		const cache = getAllCachedAddresses();
		const addresses = cache[type];

		// 按时间戳排序（越新的越靠前）
		return [...addresses].sort((a, b) => {
			// 优先使用 timestamp（历史记录的时间），如果没有则使用 lastUsed
			const aTime = a.timestamp;
			const bTime = b.timestamp;
			return bTime - aTime;
		});
	} catch (error) {
		console.error('Failed to get contract addresses:', error);
		return [];
	}
}

/**
 * 获取所有地址（按类型分组）
 */
export function getAllContractAddresses(): {
	nft: ContractAddressItem[];
	ft: ContractAddressItem[];
	collection: ContractAddressItem[];
} {
	return getAllCachedAddresses();
}

/**
 * 更新地址使用时间
 */
export function updateAddressLastUsed(id: string): void {
	try {
		const cache = getAllCachedAddresses();
		let found = false;

		for (const type of ['nft', 'ft', 'collection'] as AddressType[]) {
			const index = cache[type].findIndex((item) => item.id === id);
			if (index !== -1 && cache[type][index]) {
				cache[type][index]!.lastUsed = Date.now();
				found = true;
				break;
			}
		}

		if (found) {
			saveAllCachedAddresses(cache);
		}
	} catch (error) {
		console.error('Failed to update address last used:', error);
	}
}

/**
 * 删除地址
 */
export function removeContractAddress(id: string): void {
	try {
		const cache = getAllCachedAddresses();
		let found = false;

		for (const type of ['nft', 'ft', 'collection'] as AddressType[]) {
			const index = cache[type].findIndex((item) => item.id === id);
			if (index !== -1) {
				cache[type].splice(index, 1);
				found = true;
				break;
			}
		}

		if (found) {
			saveAllCachedAddresses(cache);
		}
	} catch (error) {
		console.error('Failed to remove contract address:', error);
	}
}

/**
 * 清除指定类型的所有地址
 */
export function clearContractAddresses(type: AddressType): void {
	try {
		const cache = getAllCachedAddresses();
		cache[type] = [];
		saveAllCachedAddresses(cache);
	} catch (error) {
		console.error('Failed to clear contract addresses:', error);
	}
}

/**
 * 从历史记录中自动提取并缓存地址
 * 优先从 MintHistory 读取（更专业），然后从 TransactionHistory 补充
 */
export function extractAndCacheAddressesFromHistory(walletAddress?: string): void {
	try {
		// 1. 优先从 mintHistory 提取（更专业，全局存储）
		const mintHistory = getMintHistory();
		mintHistory.forEach((item) => {
			// 合约地址就是 txid，根据交易类型确定地址类型
			if (!item.txid || item.txid.trim().length === 0) {
				return;
			}

			let addressType: AddressType | null = null;
			if (item.type === 'NFT_CREATE') {
				addressType = 'nft';
			} else if (item.type === 'FT_MINT' || item.type === 'POOLNFT_MINT') {
				addressType = 'ft';
			} else if (item.type === 'COLLECTION_CREATE') {
				addressType = 'collection';
			}

			if (addressType) {
				// 使用历史记录的时间戳作为地址的时间戳，确保排序正确
				addContractAddress(
					item.txid.trim(),
					addressType,
					item.type,
					item.txid,
					undefined,
					item.timestamp
				);
			}
		});

		// 2. 从 transactionHistory 提取（作为补充，按钱包地址存储）
		if (walletAddress) {
			const transactionHistory = getTransactionHistory(walletAddress);
			transactionHistory.forEach((item) => {
				// 合约地址就是 txid，根据交易类型确定地址类型
				if (!item.txid || item.txid.trim().length === 0) {
					return;
				}

				let addressType: AddressType | null = null;
				if (item.method === 'NFT_CREATE') {
					addressType = 'nft';
				} else if (item.method === 'FT_MINT' || item.method === 'POOLNFT_MINT') {
					addressType = 'ft';
				} else if (item.method === 'COLLECTION_CREATE') {
					addressType = 'collection';
				}

				if (addressType) {
					// 使用历史记录的时间戳作为地址的时间戳，确保排序正确
					addContractAddress(
						item.txid.trim(),
						addressType,
						item.method,
						item.txid,
						undefined,
						item.timestamp
					);
				}
			});
		}
	} catch (error) {
		console.error('Failed to extract addresses from history:', error);
	}
}

/**
 * 根据地址查找地址项（用于更新使用时间）
 */
export function findAddressByValue(address: string, type: AddressType): ContractAddressItem | null {
	const addresses = getContractAddresses(type);
	return addresses.find((item) => item.address === address) || null;
}

/**
 * 同步地址缓存与历史记录
 * 当历史记录被删除或清空时，同步清理地址缓存中对应的地址
 */
export function syncAddressCacheWithHistory(): void {
	try {
		// 获取所有历史记录中的 txid
		const mintHistory = getMintHistory();
		const mintTxids = new Set(mintHistory.map((item) => item.txid));

		// 获取所有缓存的地址
		const cache = getAllCachedAddresses();
		let hasChanges = false;

		// 检查每个类型的地址
		(['nft', 'ft', 'collection'] as AddressType[]).forEach((type) => {
			const addresses = cache[type];
			const validAddresses = addresses.filter((item) => {
				// 如果地址的 source 是 mintHistory 中的交易类型，检查 txid 是否还在历史记录中
				const isMintHistorySource = ['FT_MINT', 'POOLNFT_MINT', 'NFT_CREATE', 'COLLECTION_CREATE'].includes(
					item.source
				);
				if (isMintHistorySource) {
					// 如果 txid 不在 mintHistory 中，说明该记录已被删除，需要移除
					return mintTxids.has(item.txid);
				}
				// 对于其他来源的地址，保留（可能来自 transactionHistory）
				return true;
			});

			if (validAddresses.length !== addresses.length) {
				cache[type] = validAddresses;
				hasChanges = true;
			}
		});

		// 如果有变化，保存
		if (hasChanges) {
			saveAllCachedAddresses(cache);
		}
	} catch (error) {
		console.error('Failed to sync address cache with history:', error);
	}
}

/**
 * 完全重建地址缓存（从历史记录重新提取）
 * 用于历史记录被清空后，同步清理地址缓存
 */
export function rebuildAddressCacheFromHistory(walletAddress?: string): void {
	try {
		// 先清空所有地址缓存
		const cache = getAllCachedAddresses();
		cache.nft = [];
		cache.ft = [];
		cache.collection = [];
		saveAllCachedAddresses(cache);

		// 从历史记录重新提取
		extractAndCacheAddressesFromHistory(walletAddress);
	} catch (error) {
		console.error('Failed to rebuild address cache from history:', error);
	}
}

