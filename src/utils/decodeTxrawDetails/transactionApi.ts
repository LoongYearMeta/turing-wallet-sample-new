/**
 * 交易API调用模块
 * 通过txid获取交易原始数据
 */

// 网络环境
const network = import.meta.env.VITE_NETWORK || undefined;
// console.log(import.meta.env.VITE_NETWORK)

/**
 * 通过txid获取交易原始数据
 */
export async function getTransactionByTxid(txid: string): Promise<string | null> {
	try {
		// 尝试使用fetch直接调用API获取交易
		// 根据网络环境选择不同的API端点
		const apiBaseUrl =
			network === 'testnet' ? 'https://api.tbcdev.org' : 'https://api.turingchain.io';

		const response = await fetch(`${apiBaseUrl}/api/tbc/txraw/txid/${txid}`, {
			method: 'GET',
		});

		if (response.ok) {
			const payload = await response.json();
			const txraw =
				payload.txraw ||
				payload.hex ||
				payload.raw ||
				(payload.data ? payload.data.txraw || payload.data.hex || payload.data.raw : null);
			return txraw || null;
		}

		return null;
	} catch (error) {
		console.error(`Failed to fetch transaction ${txid}:`, error);
		return null;
	}
}
