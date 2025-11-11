/**
 * Turing 钱包全局类型声明
 * 用于定义浏览器注入的 window.Turing 接口
 */

declare global {
	interface Window {
		Turing: {
			/**
			 * 连接到钱包
			 */
			connect(): Promise<void>;

			/**
			 * 断开钱包连接
			 */
			disconnect(): Promise<void>;

			/**
			 * 检查是否已连接
			 */
			isConnected(): Promise<boolean>;

			/**
			 * 获取公钥
			 * @returns 包含 tbcPubKey 的对象
			 */
			getPubKey(): Promise<{ tbcPubKey: string }>;

			/**
			 * 获取钱包地址
			 * @returns 包含 tbcAddress 的对象
			 */
			getAddress(): Promise<{ tbcAddress: string }>;

			/**
			 * 获取钱包余额
			 * @returns 包含 tbc 余额的对象
			 */
			// 取消从钱包获取余额的方法
			// getBalance(): Promise<{ tbc: number }>;

			/**
			 * 签名交易
			 * @param params 交易签名参数
			 * @param params.txraws 未签名的交易原始数据数组
			 * @param params.utxos_satoshis UTXO 金额的二维数组
			 * @param params.script_pubkeys 锁定脚本的二维数组
			 * @returns 包含签名数组的对象
			 */
			signTransaction(params: {
				txraws: string[];
				utxos_satoshis: number[][];
				script_pubkeys: string[][];
			}): Promise<{ sigs: string[] }>;

			/**
			 * 签名消息
			 * @param params 消息签名参数
			 * @param params.message 消息内容
			 * @param params.encoding 消息编码类型
			 * @returns 包含签名结果的对象
			 */
			signMessage(params: { message: string; encoding: string }): Promise<{ signature: string }>;
			/**
			 * 加密消息
			 * @param params 加密参数
			 * @param params.message 消息内容
			 * @returns 包含加密结果的对象
			 */
			encrypt(params: { message: string }): Promise<{ message: string }>;
			/**
			 * 解密消息
			 * @param params 解密参数
			 * @param params.message 加密后的消息
			 * @returns 包含解密结果的对象
			 */
			decrypt(params: { message: string }): Promise<{ message: string }>;
		};
	}
}

// 确保这是一个模块
export {};
