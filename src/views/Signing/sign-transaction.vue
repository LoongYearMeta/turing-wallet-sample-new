<template>
	<div class="message-signing-page">
		<!-- header -->
		<h2 class="page-title">Signing Transaction</h2>
		<p class="page-description">Please input the transaction you want to sign.</p>
		
		<!-- 表单区域 -->
		<form class="msg-form" @submit.prevent="handleSignTransaction">
			<!-- form header -->
			<div class="msg-form-header">
				<div class="msg-form-title">
					<svg
						t="1762498177211"
						class="icon"
						viewBox="0 0 1024 1024"
						version="1.1"
						xmlns="http://www.w3.org/2000/svg"
						p-id="8001"
						width="28"
						height="28"
					>
						<path
							d="M832.7168 496.2816c-16.9472 0-30.72 13.7728-30.72 30.72v281.1392c0 22.0672-17.9712 40.0384-40.0384 40.0384H223.8976c-22.0672 0-40.0384-17.9712-40.0384-40.0384V230.9632c0-22.0672 17.9712-40.0384 40.0384-40.0384h325.8368c16.9472 0 30.72-13.7728 30.72-30.72s-13.7728-30.72-30.72-30.72H223.8976c-55.9616 0-101.4784 45.5168-101.4784 101.4784v577.1776c0 55.9616 45.5168 101.4784 101.4784 101.4784h538.0608c55.9616 0 101.4784-45.5168 101.4784-101.4784v-281.1392c0-16.9472-13.7728-30.72-30.72-30.72z"
							fill="#ff8c01"
							p-id="8002"
						></path>
						<path
							d="M909.2608 210.5856l-73.728-73.728c-25.5488-25.5488-67.072-25.5488-92.5696 0l-313.344 313.2928c-3.8912 3.8912-6.656 8.7552-8.0384 14.08l-40.5504 157.8496a30.67392 30.67392 0 0 0 29.7472 38.3488c2.1504 0 4.3008-0.2048 6.4-0.6656l163.4304-34.9696c5.7856-1.2288 11.1104-4.1472 15.3088-8.3456l313.2928-313.2928c25.5488-25.4976 25.5488-67.0208 0.0512-92.5696z m-350.3616 356.0448l-106.0352 22.6816 26.112-101.632L700.928 265.728l81.7664 77.1584-223.7952 223.744z m306.8928-306.8928l-39.68 39.68-81.7664-77.1584 41.984-41.984a4.096 4.096 0 0 1 5.7344 0l73.728 73.728c1.5872 1.6384 1.5872 4.1984 0 5.7344z"
							fill="#ff8c01"
							p-id="8003"
						></path>
					</svg>
					<span>Transaction Form</span>
				</div>
				<p class="msg-form-description">Input the transaction you want to sign</p>
			</div>

			<!-- txraws 输入区域 -->
			<div class="form-item">
				<label class="form-item-label-line">txraws</label>
				<div class="form-container">
					<div 
						class="form-item-cards txraws-card" 
						v-for="(item, index) in txRawsList" 
						:key="`txraws-${item.id}`"
					>
						<span class="form-item-card-title">txraws {{ index + 1 }}</span>
						<MyTextarea
							v-model="item.value"
							:placeholder="getTxRawsPlaceholder(index)"
							:id="'tx_raws_' + item.id"
							:readonly="false"
							:copyable="true"
							:deletable="false"
							class="txraws-textarea"
						/>
						<button 
							type="button"
							class="txraws-del-btn"
							@click="removeTxRaws(index)"
							:disabled="txRawsList.length <= 1"
							aria-label="Delete txraws"
						>
							Delete txraws
						</button>
					</div>
				</div>
				<div v-if="errors.txraws" class="form-item-error">{{ errors.txraws }}</div>
				<div class="form-item-btn-container">
					<button 
						type="button"
						class="form-item-add-btn"
						@click="addTxRaws"
					>
						+ Add txraws
					</button>
				</div>
			</div>

			<!-- UTXO Details 输入区域 -->
			<div class="form-item">
				<label class="form-item-label-line">UTXO Details</label>
				<div class="form-container">
					<div 
						class="form-item-cards" 
						v-for="(utxo, index) in utxoList" 
						:key="`utxo-${utxo.id}`"
					>
						<span class="form-item-card-title">UTXO {{ index + 1 }}</span>
						
						<!-- utxos_satoshis 输入区域 -->
						<div class="utxo-input-group">
							<label class="utxo-label">utxos_satoshis</label>
							<MyTextarea
								v-model="utxo.satoshis"
								:placeholder="getUtxosSatoshisPlaceholder(index)"
								:id="'utxos_satoshis_' + utxo.id"
								:readonly="false"
								:copyable="true"
								:deletable="false"
								class="utxo-textarea"
							/>
						</div>
						
						<!-- script_pubkeys 输入区域 -->
						<div class="utxo-input-group">
							<label class="utxo-label">script_pubkeys</label>
							<MyTextarea
								v-model="utxo.scriptPubkeys"
								:placeholder="getScriptPubkeysPlaceholder(index)"
								:id="'script_pubkeys_' + utxo.id"
								:readonly="false"
								:copyable="true"
								:deletable="false"
								class="utxo-textarea"
							/>
						</div>
					</div>
				</div>
				<div v-if="errors.utxos_satoshis" class="form-item-error">{{ errors.utxos_satoshis }}</div>
				<div v-if="errors.script_pubkeys" class="form-item-error">{{ errors.script_pubkeys }}</div>
			</div>

			<!-- 提交按钮 -->
			<div class="form-item-btn-container">
				<button
					class="form-button-submit"
					type="submit"
					:disabled="!isFormValid || isSubmitting"
				>
					<span v-if="isSubmitting">Signing...</span>
					<span v-else>Sign Transaction</span>
				</button>
			</div>
		</form>

		<!-- 结果区域 -->
		<div class="msg-form msg-result">
			<div class="msg-form-header">
				<div class="msg-form-title">
					<svg
						t="1762506088732"
						class="icon"
						viewBox="0 0 1024 1024"
						version="1.1"
						xmlns="http://www.w3.org/2000/svg"
						p-id="21589"
						width="28"
						height="28"
					>
						<path
							d="M464.896 134.912c78.848-71.5776 200.192-86.4768 297.5232-36.352 98.5088 50.7904 152.6272 151.4496 137.4208 255.6416-23.04 156.3136-169.3184 247.9616-329.0112 204.7488-25.0368-6.7584-42.2912-3.7376-58.0608 17.2032-18.8928 25.088-41.216 47.9232-62.8736 72.704 9.3184 8.704 16.64 15.1552 23.552 21.8112 33.3824 32.5632 37.5296 70.2464 11.0592 101.0688-25.7536 30.0032-66.56 33.1264-104.8576 7.3216-16.1792-11.0592-32-29.2864-44.544 2.6624 51.0976 58.0608 59.392 90.6752 31.6928 123.1872-29.2864 34.2528-65.536 31.5904-133.8368-10.752-3.6864 2.2528-8.0384 4.4544-12.032 7.2192-41.984 28.672-76.8 28.416-104.2432-1.024-28.4672-30.464-27.8528-68.608 4.3008-105.0624a23307.264 23307.264 0 0 1 276.736-310.1696c20.736-22.6816 22.528-39.7824 9.0112-66.9184C359.2192 322.2528 384 208.4864 464.896 134.912z m193.4336 71.168c-70.0416-9.9328-134.656 36.9152-144.384 104.7552-10.2912 70.4512 38.8608 138.2912 107.2128 148.5824 70.656 10.6496 135.0656-37.5808 145.664-109.056 10.7008-73.3696-34.56-133.4272-108.544-144.2304z"
							fill="#ff8c01"
							p-id="21590"
						></path>
					</svg>
					<span>Transaction Signed Result</span>
				</div>
			</div>
			
			<!-- 分层展示签名结果 -->
			<div v-if="parsedSignatures && parsedSignatures.length > 0" class="form-container">
				<div 
					class="form-item-cards" 
					v-for="(sigGroup, groupIndex) in parsedSignatures" 
					:key="`group-${groupIndex}`"
				>
					<span class="form-item-card-title">txraws {{ groupIndex + 1 }}</span>
					<div 
						v-for="(signature, sigIndex) in sigGroup" 
						:key="`sig-${groupIndex}-${sigIndex}`"
						class="utxo-input-group"
					>
						<label class="utxo-label">Signature {{ sigIndex + 1 }}</label>
						<MyTextarea
							:model-value="signature"
							:readonly="true"
							:copyable="true"
							:deletable="false"
							class="utxo-textarea"
						/>
					</div>
				</div>
			</div>
			
			<!-- 原始JSON展示（始终显示，但如果有分层展示则放在下面） -->
			<div v-if="signatureRes" class="raw-json-section">
				<div class="raw-json-header" @click="toggleRawJson">
					<span class="raw-json-title">Raw JSON Result</span>
					<svg
						class="raw-json-arrow"
						:class="{ 'expanded': showRawJson }"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M7 10L12 15L17 10"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</div>
				<transition name="slide-fade">
					<MyTextarea
						v-if="showRawJson"
						v-model="signatureRes"
						placeholder="Signature result will be displayed here"
						:readonly="true"
						:copyable="true"
						:deletable="false"
						class="result-textarea"
					/>
				</transition>
			</div>
			
			<!-- 如果没有签名结果，显示占位符 -->
			<div v-if="!signatureRes" class="result-placeholder">
				<MyTextarea
					model-value=""
					placeholder="Signature result will be displayed here"
					:readonly="true"
					:copyable="false"
					:deletable="false"
					class="result-textarea"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { useToast } from '../../utils/useToast';
import { useWalletStore } from '../../stores/wallet';
import MyTextarea from '../../components/m-textarea.vue';

// 钱包状态管理
const walletStore = useWalletStore();
const { getWalletInfo } = walletStore;

// 消息提示
const toastApi = useToast();

// 提交状态
const isSubmitting = ref(false);

// 表单输入数据结构
interface TxRawsItem {
	id: number;
	value: string;
}

interface UtxoItem {
	id: number;
	satoshis: string;
	scriptPubkeys: string;
}

// 表单输入数据
const txRawsList = ref<TxRawsItem[]>([
	{ id: Date.now(), value: '' }
]);

const utxoList = ref<UtxoItem[]>([
	{ id: Date.now(), satoshis: '', scriptPubkeys: '' }
]);

// 表单结果
const signatureRes = ref('');
const showRawJson = ref(false); // 控制原始JSON的显示/隐藏

// 解析签名结果，提取sigs数组用于分层展示
const parsedSignatures = computed(() => {
	if (!signatureRes.value) return [];
	
	try {
		const parsed = JSON.parse(signatureRes.value);
		if (parsed.sigs && Array.isArray(parsed.sigs)) {
			// 将sigs数组转换为字符串数组的数组
			return parsed.sigs.map((sigGroup: any) => {
				if (Array.isArray(sigGroup)) {
					// 如果已经是数组，转换为字符串数组
					return sigGroup.map((sig: any) => String(sig));
				} else {
					// 如果不是数组，包装成数组
					return [String(sigGroup)];
				}
			});
		}
		return [];
	} catch (error) {
		return [];
	}
});

// 切换原始JSON显示
const toggleRawJson = () => {
	showRawJson.value = !showRawJson.value;
};

// 表单错误信息
const errors = ref({
	txraws: '',
	utxos_satoshis: '',
	script_pubkeys: '',
});

// 类型定义
interface ParseRes<T> {
	valid: boolean;
	error?: string;
	data?: T;
}

// 解析tx_raws 字符串 -> string[]
// 优化：用户可以直接输入字符串，系统自动包装成数组格式
const parseTxRaws = (input: string): ParseRes<string[]> => {
	if (!input.trim()) return { valid: false, error: 'Input cannot be empty' };
	
	const trimmed = input.trim();
	
	// 尝试解析为JSON数组
	try {
		const parsed = JSON.parse(trimmed);
		if (Array.isArray(parsed)) {
			if (parsed.length === 0) return { valid: false, error: 'Array cannot be empty' };
			const allStrings = parsed.every((item) => typeof item === 'string');
			if (!allStrings) return { valid: false, error: 'All elements must be strings' };
			return { valid: true, data: parsed };
		}
	} catch (error) {
		// 如果不是有效的JSON，继续处理为普通字符串
	}
	
	// 如果输入不是JSON数组，当作普通字符串处理，自动包装成数组
	return { valid: true, data: [trimmed] };
};

// 解析utxos_satoshis 字符串 -> number[][]
// 优化：用户输入逗号分隔的数字字符串（如 "1000,2000"），系统自动转换为二维数组
const parseUtxosSatoshis = (input: string): ParseRes<number[][]> => {
	if (!input.trim()) return { valid: false, error: 'Input cannot be empty' };
	
	const trimmed = input.trim();
	
	// 尝试解析为JSON数组
	try {
		const parsed = JSON.parse(trimmed);
		if (Array.isArray(parsed)) {
			if (parsed.length === 0) return { valid: false, error: 'Array cannot be empty' };
			// 检查是否为二维数组
			const allNumberArrays = parsed.every(
				(subArr) =>
					Array.isArray(subArr) && subArr.every((item) => typeof item === 'number' && !isNaN(item)),
			);
			if (allNumberArrays) {
				return { valid: true, data: parsed };
			}
			// 如果是一维数组，转换为二维数组
			if (parsed.every((item) => typeof item === 'number' && !isNaN(item))) {
				return { valid: true, data: [parsed] };
			}
		}
	} catch (error) {
		// 如果不是有效的JSON，继续处理为逗号分隔的字符串
	}
	
	// 如果输入不是JSON，当作逗号分隔的数字字符串处理
	const numbers = trimmed
		.split(',')
		.map((s) => s.trim())
		.filter((s) => s.length > 0)
		.map((s) => {
			const num = Number(s);
			return isNaN(num) ? null : num;
		});
	
	if (numbers.length === 0) {
		return { valid: false, error: 'Please input at least one number' };
	}
	
	if (numbers.some((n) => n === null)) {
		return { valid: false, error: 'All values must be valid numbers' };
	}
	
	// 转换为二维数组格式
	return { valid: true, data: [numbers as number[]] };
};

// 解析script_pubkeys 字符串 -> string[][]
// 优化：用户输入逗号分隔的字符串（如 "pubkey1,pubkey2"），系统自动转换为二维数组
const parseScriptPubkeys = (input: string): ParseRes<string[][]> => {
	if (!input.trim()) return { valid: false, error: 'script_pubkeys cannot be empty' };
	
	const trimmed = input.trim();
	
	// 尝试解析为JSON数组
	try {
		const parsed = JSON.parse(trimmed);
		if (Array.isArray(parsed)) {
			if (parsed.length === 0) return { valid: false, error: 'Array cannot be empty' };
			// 检查是否为二维数组
			const allStringArrays = parsed.every(
				(subArr) => Array.isArray(subArr) && subArr.every((item) => typeof item === 'string'),
			);
			if (allStringArrays) {
				return { valid: true, data: parsed };
			}
			// 如果是一维数组，转换为二维数组
			if (parsed.every((item) => typeof item === 'string')) {
				return { valid: true, data: [parsed] };
			}
		}
	} catch (err) {
		// 如果不是有效的JSON，继续处理为逗号分隔的字符串
	}
	
	// 如果输入不是JSON，当作逗号分隔的字符串处理
	const strings = trimmed
		.split(',')
		.map((s) => s.trim())
		.filter((s) => s.length > 0);
	
	if (strings.length === 0) {
		return { valid: false, error: 'Please input at least one script pubkey' };
	}
	
	// 转换为二维数组格式
	return { valid: true, data: [strings] };
};

// 验证所有txraws
const validateAllTxRaws = (): boolean => {
	for (const item of txRawsList.value) {
		const result = parseTxRaws(item.value);
		if (!result.valid) {
			errors.value.txraws = result.error || 'Invalid txraws format';
			return false;
		}
	}
	errors.value.txraws = '';
	return true;
};

// 验证所有UTXO
const validateAllUtxos = (): boolean => {
	let hasSatoshisError = false;
	let hasScriptPubkeysError = false;

	for (const utxo of utxoList.value) {
		const satoshisResult = parseUtxosSatoshis(utxo.satoshis);
		const scriptPubkeysResult = parseScriptPubkeys(utxo.scriptPubkeys);

		if (!satoshisResult.valid) {
			errors.value.utxos_satoshis = satoshisResult.error || 'Invalid utxos_satoshis format';
			hasSatoshisError = true;
		}

		if (!scriptPubkeysResult.valid) {
			errors.value.script_pubkeys = scriptPubkeysResult.error || 'Invalid script_pubkeys format';
			hasScriptPubkeysError = true;
		}
	}

	if (!hasSatoshisError) errors.value.utxos_satoshis = '';
	if (!hasScriptPubkeysError) errors.value.script_pubkeys = '';

	return !hasSatoshisError && !hasScriptPubkeysError;
};

// 实时校验
watch(
	() => txRawsList.value.map((item) => item.value),
	() => {
		validateAllTxRaws();
	},
	{ deep: true }
);

watch(
	() => utxoList.value.map((utxo) => ({ satoshis: utxo.satoshis, scriptPubkeys: utxo.scriptPubkeys })),
	() => {
		validateAllUtxos();
	},
	{ deep: true }
);

// 表单验证状态
const isFormValid = computed(() => {
	return !errors.value.txraws && !errors.value.utxos_satoshis && !errors.value.script_pubkeys;
});

// 添加txraws（同时添加对应的UTXO）
const addTxRaws = () => {
	txRawsList.value.push({
		id: Date.now() + Math.random(),
		value: '',
	});
	// 同步添加UTXO
	utxoList.value.push({
		id: Date.now() + Math.random(),
		satoshis: '',
		scriptPubkeys: '',
	});
};

// 删除txraws（同时删除对应的UTXO）
const removeTxRaws = (index: number) => {
	if (txRawsList.value.length > 1) {
		txRawsList.value.splice(index, 1);
		// 同步删除对应索引的UTXO
		utxoList.value.splice(index, 1);
		validateAllTxRaws();
		validateAllUtxos();
	}
};

// Placeholder 辅助函数
const getTxRawsPlaceholder = (index: number) => {
	return `Please input txraws ${index + 1} (string or JSON array, e.g. "raw1" or ["raw1","raw2"])`;
};

const getUtxosSatoshisPlaceholder = (index: number) => {
	return `Please input utxos_satoshis ${index + 1} (comma-separated numbers, e.g. 1000,2000)`;
};

const getScriptPubkeysPlaceholder = (index: number) => {
	return `Please input script_pubkeys ${index + 1} (comma-separated strings, e.g. pubkey1,pubkey2)`;
};

// SIGN Transaction
const handleSignTransaction = async () => {
	// 验证表单数据
	if (!validateAllTxRaws() || !validateAllUtxos()) {
		toastApi.showError('Please fix the form errors first', 3000);
		return;
	}

	// 收集所有txraws（每个输入框是一个JSON数组，合并所有数组元素）
	const allTxRaws: string[] = [];
	for (const item of txRawsList.value) {
		const result = parseTxRaws(item.value);
		if (result.valid && result.data) {
			// 展开数组合并到allTxRaws
			allTxRaws.push(...result.data);
		}
	}

	// 收集所有utxos_satoshis和script_pubkeys（每个UTXO是一个二维数组，合并所有二维数组）
	const allUtxosSatoshis: number[][] = [];
	const allScriptPubkeys: string[][] = [];

	for (const utxo of utxoList.value) {
		const satoshisResult = parseUtxosSatoshis(utxo.satoshis);
		const scriptPubkeysResult = parseScriptPubkeys(utxo.scriptPubkeys);

		if (satoshisResult.valid && satoshisResult.data) {
			// 展开二维数组合并到allUtxosSatoshis
			allUtxosSatoshis.push(...satoshisResult.data);
		}

		if (scriptPubkeysResult.valid && scriptPubkeysResult.data) {
			// 展开二维数组合并到allScriptPubkeys
			allScriptPubkeys.push(...scriptPubkeysResult.data);
		}
	}

	// 验证数据长度匹配（每个txraw对应一个utxos_satoshis和script_pubkeys）
	if (allTxRaws.length !== allUtxosSatoshis.length || allTxRaws.length !== allScriptPubkeys.length) {
		toastApi.showError(
			`Data length mismatch: txraws(${allTxRaws.length}), utxos_satoshis(${allUtxosSatoshis.length}), script_pubkeys(${allScriptPubkeys.length})`,
			3000
		);
		return;
	}

	isSubmitting.value = true;

	try {
		// 构建请求数据，格式参考：
		// txraws: ["0a00000001f97441c4f86c62bfbca2d972efe1918b24b9617ce23a7e403f1bcf01e985f8350100000000ffffffff02a0860100000000003576a914b770377041443c7eac4a93b721ab7093bdbccaba88ad56ba01247f778104ffffffff819e518804b20100008152ba81a1518720d60854020000001976a914b770377041443c7eac4a93b721ab7093bdbccaba88ac00000000"]
		// utxos_satoshis: [[9999899920]]
		// script_pubkeys: [["76a914b770377041443c7eac4a93b721ab7093bdbccaba88ac"]]
		const requestData = {
			txraws: allTxRaws,
			utxos_satoshis: allUtxosSatoshis,
			script_pubkeys: allScriptPubkeys,
		};

		console.log('Request data:', JSON.stringify(requestData, null, 2));

		// 调用签名接口
		const signRes: any = await window.Turing.signTransaction(requestData);

		// 格式化返回结果并回显
		signatureRes.value = JSON.stringify(signRes, null, 2);
		
		// 等待响应式更新后，根据是否有分层展示的签名来决定是否显示原始JSON
		await nextTick();
		const hasParsedSigs = parsedSignatures.value && parsedSignatures.value.length > 0;
		showRawJson.value = !hasParsedSigs;
		
		console.log('Sign result:', signRes);
		toastApi.showSuccess('Transaction signed successfully', 3000);
	} catch (error) {
		console.error('Sign transaction error:', error);
		const errorMsg = error instanceof Error ? error.message : 'Failed to sign transaction';
		toastApi.showError(errorMsg, 3000);
		signatureRes.value = '';
	} finally {
		isSubmitting.value = false;
	}
};

// 检查钱包连接状态
onMounted(async () => {
	await getWalletInfo();
});
</script>

<style scoped>
@import '../../assets/form-page.css';

.message-signing-page {
	padding: var(--spacing-sm);
}

.page-title {
	color: var(--color-primary);
	font-size: var(--font-size-title);
	text-align: center;
}

.page-description {
	color: var(--color-text-secondary);
	font-size: var(--font-size-subtitle);
	text-align: center;
	margin-top: var(--spacing-xs);
	margin-bottom: var(--spacing-lg);
}

/* txraws 卡片样式 */
.txraws-card {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xs);
}

.txraws-textarea {
	width: 100%;
}

.txraws-textarea :deep(.m-textarea) {
	min-height: 80px;
}

/* txraws 删除按钮 */
.txraws-del-btn {
	background-color: var(--form-btn-error-color);
	color: var(--color-error);
	font-size: var(--font-size-small);
	padding: var(--spacing-xs);
	border-radius: var(--radius-sm);
	border: 1px solid var(--color-error);
	cursor: pointer;
	transition: all 0.2s ease;
	margin-top: var(--spacing-xs);
	width: 100%;
}

.txraws-del-btn:hover:not(:disabled) {
	background-color: var(--color-error);
	color: var(--color-text-primary);
	transform: translateY(-1px);
	box-shadow: var(--shadow-sm);
}

.txraws-del-btn:active:not(:disabled) {
	transform: translateY(0);
	box-shadow: none;
}

.txraws-del-btn:disabled {
	background-color: var(--form-btn-disabled-color);
	color: var(--color-text-secondary);
	border-color: var(--form-border-color);
	cursor: not-allowed;
	opacity: 0.6;
	transform: none;
}

/* UTXO 输入组样式 */
.utxo-input-group {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xs);
	width: 100%;
}

.utxo-label {
	font-size: var(--font-size-small);
	color: var(--color-text-secondary);
	font-weight: 500;
}

.utxo-textarea {
	width: 100%;
}

.utxo-textarea :deep(.m-textarea) {
	min-height: 80px;
}

/* UTXO 删除按钮 */
.utxo-del-btn {
	background-color: var(--form-btn-error-color);
	color: var(--color-error);
	font-size: var(--font-size-small);
	padding: var(--spacing-xs);
	border-radius: var(--radius-sm);
	border: 1px solid var(--color-error);
	cursor: pointer;
	transition: all 0.2s ease;
	margin-top: var(--spacing-xs);
	width: 100%;
}

.utxo-del-btn:hover:not(:disabled) {
	background-color: var(--color-error);
	color: var(--color-text-primary);
	transform: translateY(-1px);
	box-shadow: var(--shadow-sm);
}

.utxo-del-btn:active:not(:disabled) {
	transform: translateY(0);
	box-shadow: none;
}

.utxo-del-btn:disabled {
	background-color: var(--form-btn-disabled-color);
	color: var(--color-text-secondary);
	border-color: var(--form-border-color);
	cursor: not-allowed;
	opacity: 0.6;
	transform: none;
}

/* 结果区域样式 */
.msg-result {
	margin-top: var(--spacing-md);
	animation: fadeIn 0.3s ease;
}


/* 原始JSON区域样式 */
.raw-json-section {
	margin-top: var(--spacing-md);
	border-top: 1px solid var(--form-border-color);
	padding-top: var(--spacing-sm);
}

.raw-json-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: var(--spacing-xs) 0;
	cursor: pointer;
	user-select: none;
	transition: all 0.2s ease;
}

.raw-json-header:hover {
	color: var(--color-primary);
}

.raw-json-title {
	font-size: var(--font-size-small);
	font-weight: 500;
	color: var(--color-text-secondary);
}

.raw-json-arrow {
	transition: transform 0.2s ease;
	color: var(--color-text-secondary);
}

.raw-json-arrow.expanded {
	transform: rotate(180deg);
}

.result-textarea {
	margin-top: var(--spacing-xs);
}

.result-textarea :deep(.m-textarea) {
	min-height: 120px;
	font-family: 'Courier New', Courier, monospace;
}

/* 折叠动画 */
.slide-fade-enter-active {
	transition: all 0.3s ease;
}

.slide-fade-leave-active {
	transition: all 0.3s ease;
}

.slide-fade-enter-from {
	opacity: 0;
	transform: translateY(-10px);
}

.slide-fade-leave-to {
	opacity: 0;
	transform: translateY(-10px);
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* 响应式优化 */
@media (max-width: 768px) {
	.message-signing-page {
		padding: var(--spacing-xs);
	}

	.form-item-inputs {
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.form-item-index {
		align-self: flex-start;
	}

	.txraws-del-btn,
	.utxo-del-btn {
		width: 100%;
	}

	.form-item-cards {
		padding: var(--spacing-xs);
	}

	.txraws-textarea,
	.utxo-textarea {
		width: 100%;
	}

	.txraws-textarea :deep(.m-textarea),
	.utxo-textarea :deep(.m-textarea) {
		min-height: 60px;
	}
}

@media (max-width: 480px) {
	.page-title {
		font-size: 1.2rem;
	}

	.page-description {
		font-size: var(--font-size-small);
	}

	.form-item-inputs {
		gap: 8px;
	}

	.form-item-add-btn {
		width: 100%;
		font-size: var(--font-size-small);
	}

	.form-item-cards {
		padding: var(--spacing-xs);
		gap: var(--spacing-xs);
	}

	.utxo-input-group {
		gap: 6px;
	}

	.utxo-label {
		font-size: var(--font-size-tiny);
	}

	.result-textarea :deep(.m-textarea) {
		min-height: 100px;
		font-size: var(--font-size-small);
	}
}
</style>
