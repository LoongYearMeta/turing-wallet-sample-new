export interface MintHistoryItem {
	id: string;
	type: string;
	txid: string;
	response: any;
	requestParams: any;
	timestamp: number;
}

const MINT_HISTORY_STORAGE_KEY = 'mint_history_global';

const generateId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export function getMintHistory(): MintHistoryItem[] {
	try {
		const historyStr = localStorage.getItem(MINT_HISTORY_STORAGE_KEY);
		if (!historyStr) return [];

		const history = JSON.parse(historyStr);
		return Array.isArray(history) ? history : [];
	} catch (error) {
		console.error('Failed to get mint history:', error);
		return [];
	}
}

export function addMintHistory(type: string, txid: string, response: any, requestParams: any): void {
	try {
		const existing = getMintHistory();
		const newRecord: MintHistoryItem = {
			id: generateId(),
			type,
			txid,
			response,
			requestParams,
			timestamp: Date.now(),
		};

		localStorage.setItem(MINT_HISTORY_STORAGE_KEY, JSON.stringify([newRecord, ...existing]));
	} catch (error) {
		console.error('Failed to save mint history:', error);
	}
}

export function removeMintHistory(id: string): void {
	try {
		const existing = getMintHistory();
		const filtered = existing.filter((item) => item.id !== id);
		localStorage.setItem(MINT_HISTORY_STORAGE_KEY, JSON.stringify(filtered));
		
		// 同步地址缓存
		import('./contractAddressCache').then((module) => {
			module.syncAddressCacheWithHistory();
		});
	} catch (error) {
		console.error('Failed to remove mint history:', error);
	}
}

export function clearMintHistory(): void {
	try {
		localStorage.removeItem(MINT_HISTORY_STORAGE_KEY);
		
		// 同步地址缓存（重建）
		import('./contractAddressCache').then((module) => {
			module.rebuildAddressCacheFromHistory();
		});
	} catch (error) {
		console.error('Failed to clear mint history:', error);
	}
}

