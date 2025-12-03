/**
 * 交易API调用模块
 * 通过txid获取交易原始数据
 */

// 网络类型定义
export type NetworkType = 'mainnet' | 'testnet';

// API响应结果类型
export type TransactionApiResult = 
	| { success: true; txraw: string }
	| { success: false; error: string; isNetworkError: boolean };

/**
 * 通过txid获取交易原始数据
 * @param txid 交易ID
 * @param network 网络类型，可选：'mainnet' | 'testnet'，默认为环境变量或主网
 * @returns 成功返回包含txraw的对象，失败返回包含错误信息的对象
 */
export async function getTransactionByTxid(
	txid: string,
	network?: NetworkType,
): Promise<TransactionApiResult> {
	try {
		// 尝试使用fetch直接调用API获取交易
		// 根据网络环境选择不同的API端点
		// 如果未提供网络参数，则使用环境变量或默认为主网
		const networkEnv = network || import.meta.env.VITE_NETWORK || 'mainnet';
		const apiBaseUrl =
			networkEnv === 'testnet' ? 'https://api.tbcdev.org' : 'https://api.turingbitchain.io';

		const response = await fetch(`${apiBaseUrl}/api/tbc/txraw/txid/${txid}`, {
			method: 'GET',
		});
		console.log('response', response);

		if (response.ok) {
			const payload = await response.json();
			const txraw =
				payload.txraw ||
				payload.hex ||
				payload.raw ||
				(payload.data ? payload.data.txraw || payload.data.hex || payload.data.raw : null);
			
			if (txraw) {
				return { success: true, txraw };
			}
			
			// 如果响应ok但没有txraw数据，返回错误
			return {
				success: false,
				error: 'Transaction data not found in response',
				isNetworkError: false,
			};
		}

		// 响应不ok，尝试解析错误信息
		try {
			const errorPayload = await response.json();
			// 检查是否是标准的错误响应格式 {code, message, data}
			const errorMessage = errorPayload.message || errorPayload.error || `HTTP ${response.status}`;
			
			// 判断是否是网络错误（5xx）还是业务错误（4xx等）
			const isNetworkError = response.status >= 500;
			
			return {
				success: false,
				error: errorMessage,
				isNetworkError,
			};
		} catch (parseError) {
			// 如果无法解析JSON错误响应，返回通用错误信息
			const isNetworkError = response.status >= 500;
			return {
				success: false,
				error: `HTTP ${response.status}: ${response.statusText}`,
				isNetworkError,
			};
		}
	} catch (error) {
		// fetch失败，这是网络错误
		console.error(`Failed to fetch transaction ${txid}:`, error);
		const errorMessage = error instanceof Error ? error.message : 'Unknown network error';
		return {
			success: false,
			error: errorMessage,
			isNetworkError: true,
		};
	}
}
