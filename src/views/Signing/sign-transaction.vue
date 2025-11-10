<template>
	<div class="message-signing-page">
		<!-- header -->
		<h2 class="page-title">Signing Transaction</h2>
		<p class="page-description">Please input the transaction you want to sign.</p>
		<!-- form -->
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
			<!-- form content -->
			<!-- input txraws -->
			<div class="form-item">
				<label for="tx_raws">txraws</label>
				<textarea
					class="form-item-textarea"
					v-model="tx_raws"
					placeholder='Please input txraws as JSON array, e.g. ["raw1","raw2"]'
					id="tx_raws"
				></textarea>
				<!-- error message -->
				<Transition name="error-fade">
					<p class="form-item-error" v-if="errors.tx_raws">
						{{ errors.tx_raws }}
					</p>
				</Transition>
			</div>
			<!-- input utxos_satoshis -->
			<div class="form-item">
				<label for="utxos_satoshis">utxos_satoshis</label>
				<textarea
					class="form-item-textarea"
					v-model="utxos_satoshis"
					placeholder="Please input utxos_satoshis (JSON array of arrays)"
					id="utxos_satoshis"
				></textarea>
				<!-- error message -->
				<Transition name="error-fade">
					<p class="form-item-error" v-if="errors.utxos_satoshis">
						{{ errors.utxos_satoshis }}
					</p>
				</Transition>
			</div>
			<!-- input script_pubkeys -->
			<div class="form-item">
				<label for="script_pubkeys">script_pubkeys</label>
				<textarea
					class="form-item-textarea"
					v-model="script_pubkeys"
					placeholder="Please input script_pubkeys (JSON array of arrays)"
					id="script_pubkeys"
				></textarea>
				<!-- error message -->
				<Transition name="error-fade">
					<p class="form-item-error" v-if="errors.script_pubkeys">
						{{ errors.script_pubkeys }}
					</p>
				</Transition>
			</div>
			<button
				class="form-button-submit"
				@click.stop="handleSignTransaction"
				type="button"
				:disabled="!isFormValid"
			>
				Sign Transaction
			</button>
		</form>
		<!-- result -->
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
					<span>Message Signed Result</span>
				</div>
			</div>
			<textarea
				class="form-item-textarea form-item-result"
				v-model="signatureRes"
				readonly
				placeholder="Signature result will be displayed here"
				autosize
			></textarea>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useToast } from '../../utils/useToast';
import { useWalletStore } from '../../stores/wallet';
// import { storeToRefs } from 'pinia'

// 钱包状态管理
const walletStore = useWalletStore();
const { getWalletInfo } = walletStore;

// 消息提示
const toastApi = useToast();

// 表单验证状态
let isFormValid = ref(false);

// 表单输入数据
const tx_raws = ref('');
const utxos_satoshis = ref('');
const script_pubkeys = ref('');

// 表单结果
const signatureRes = ref('');

// 表单错误信息
const errors = ref({
	tx_raws: '',
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
// 校验规则：JSON格式正确 + 非空数组 + 所有元素为字符串
const parseTxRaws = (input: string): ParseRes<string[]> => {
	// 空值校验
	if (!input.trim()) return { valid: false, error: 'Input cannot be empty' };
	// JSON格式校验
	try {
		const parsed = JSON.parse(input);
		// 数组类型校验
		if (!Array.isArray(parsed)) return { valid: false, error: 'Input must be a JSON array' };
		// 非空数组校验
		if (parsed.length === 0) return { valid: false, error: 'Array cannot be empty' };
		// 字符串校验
		const allStrings = parsed.every((item) => typeof item === 'string');
		if (!allStrings) return { valid: false, error: 'All elements must be strings' };
		return { valid: true, data: parsed };
	} catch (error) {
		// JSON解析错误
		return { valid: false, error: 'Invalid JSON format' };
	}
};

// 解析utxos_satoshis 字符串 -> number[][]
// 校验规则：JSON格式正确 + 是数组 + 子元素是数组 + 子数组元素是数字
const parseUtxosSatoshis = (input: string): ParseRes<number[][]> => {
	// 空值校验
	if (!input.trim()) return { valid: false, error: 'Input cannot be empty' };
	// JSON格式校验
	try {
		// JSON解析
		const parsed = JSON.parse(input);
		// 数组类型校验
		if (!Array.isArray(parsed)) return { valid: false, error: 'Must be a JSON array of arrays' };
		// 非空数组校验
		if (parsed.length === 0) return { valid: false, error: 'Array cannot be empty' };
		// 子数组校验：必须是数组 + 非空数组 + 元素是数字（非NaN）
		const allNumberArrays = parsed.every(
			(subArr) =>
				Array.isArray(subArr) &&
				subArr.length > 0 &&
				subArr.every((item) => typeof item === 'number' && !isNaN(item)),
		);
		if (!allNumberArrays)
			return { valid: false, error: 'Sub arrays must be non-empty and contain only numbers' };
		return { valid: true, data: parsed };
	} catch (error) {
		// JSON解析错误
		return { valid: false, error: 'Invalid JSON format' };
	}
};

/**
 * 解析script_pubkeys：字符串 → string[][]
 * 校验规则：JSON格式正确 + 是数组 + 子元素是数组 + 子数组元素是字符串
 */
const parseScriptPubkeys = (input: string): ParseRes<string[][]> => {
	// 空值校验
	if (!input.trim()) return { valid: false, error: 'script_pubkeys cannot be empty' };
	// JSON格式校验
	try {
		// JSON解析
		const parsed = JSON.parse(input);
		// 数组类型校验
		if (!Array.isArray(parsed)) return { valid: false, error: 'Must be a JSON array of arrays' };
		// 非空数组校验
		if (parsed.length === 0) return { valid: false, error: 'Array cannot be empty' };
		// 子数组校验：必须是数组 + 非空数组 + 元素是字符串
		const allStringArrays = parsed.every(
			(subArr) =>
				Array.isArray(subArr) &&
				subArr.length > 0 &&
				subArr.every((item) => typeof item === 'string'),
		);
		if (!allStringArrays)
			return { valid: false, error: 'Sub arrays must be non-empty and contain only strings' };
		return { valid: true, data: parsed };
	} catch (err) {
		return { valid: false, error: 'Invalid JSON format' };
	}
};

// 实时校验
watch(tx_raws, (newVal) => {
	const result = parseTxRaws(newVal);
	if (result.valid) {
		errors.value.tx_raws = '';
	} else {
		errors.value.tx_raws = result.error || 'Invalid input';
	}
});

watch(utxos_satoshis, (newVal) => {
	const result = parseUtxosSatoshis(newVal);
	if (result.valid) {
		errors.value.utxos_satoshis = '';
	} else {
		errors.value.utxos_satoshis = result.error || 'Invalid input';
	}
});

watch(script_pubkeys, (newVal) => {
	const result = parseScriptPubkeys(newVal);
	if (result.valid) {
		errors.value.script_pubkeys = '';
	} else {
		errors.value.script_pubkeys = result.error || 'Invalid input';
	}
});

// 禁用提交按钮条件
isFormValid = computed(() => {
	return !errors.value.tx_raws && !errors.value.utxos_satoshis && !errors.value.script_pubkeys;
});

// SIGN Transaction
const handleSignTransaction = async () => {
	// 验证表单数据
	// 提交前强制触发一次校验（防止用户绕过实时校验直接提交）
	const txRawsResult = parseTxRaws(tx_raws.value);
	const utxosResult = parseUtxosSatoshis(utxos_satoshis.value);
	const scriptPubkeysResult = parseScriptPubkeys(script_pubkeys.value);

	// 更新错误信息（若有遗漏）
	errors.value.tx_raws = txRawsResult.error || '';
	errors.value.utxos_satoshis = utxosResult.error || '';
	errors.value.script_pubkeys = scriptPubkeysResult.error || '';

	// 若表单无效，阻止提交并提示
	if (!txRawsResult.valid || !utxosResult.valid || !scriptPubkeysResult.valid) {
		toastApi.showError('Please fix the form errors first', 3000);
		return;
	}
	// 签名交易
	try {
		// 转换后的数据（类型安全，可直接传递给接口）
    // 对交易进行签名（兼容新旧钱包返回：优先 sigs，缺失则尝试 sig）
		const requestData = {
			txraws: txRawsResult.data!,
			utxos_satoshis: utxosResult.data!,
			script_pubkeys: scriptPubkeysResult.data!,
		};
		// 签名交易
		const signRes: any = await window.Turing.signTransaction(requestData);
    // let sigInput: string[] = [];
		// try {
		// 	if (signRes && signRes.sigs) {
		// 		const sigs = signRes.sigs;
		// 		sigInput = Array.isArray(sigs[0]) ? sigs[0] : sigs;
		// 	} else if (signRes && signRes.sig) {
		// 		const sig = signRes.sig;
		// 		sigInput = Array.isArray(sig) ? sig : [sig];
		// 	}
		// 	if (!sigInput || sigInput.length === 0) {
		// 		throw new Error('签名数据为空');
		// 	}
    // } catch (e) {
		// 	throw new Error('交易签名失败：未获取到有效签名（兼容sigs/sig均失败）');
		// }
		// 格式化结果（美化JSON）
		signatureRes.value = JSON.stringify(signRes, null, 2);
		toastApi.showSuccess('Transaction signed successfully', 3000);
	} catch (error) {
		console.error('Sign transaction error:', error);
		// 提取具体错误信息（提升用户体验）
		const errorMsg = error instanceof Error ? error.message : 'Failed to sign transaction';
		toastApi.showError(errorMsg, 3000);
		signatureRes.value = '';
	}
};

// 检查钱包连接状态
onMounted(async () => {
	await getWalletInfo();
});
</script>

<style scoped>
@import '../../assets/form-page.css';
</style>
