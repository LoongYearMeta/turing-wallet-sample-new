<template>
	<form class="msg-form" @submit.prevent="handleMint">
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
				<span>FT-MINT Form</span>
			</div>
			<p class="msg-form-description">Enter the FT data to mint new tokens</p>
		</div>

		<!-- name input -->
		<div class="form-item">
			<label>
				Name
				<span class="required">*</span>
			</label>
			<input
				v-model="mintForm.name"
				type="text"
				placeholder="Please input token name (max 20 characters)"
				class="form-item-input-textarea"
				maxlength="20"
			/>
			<div v-if="errors.name" class="form-item-error">{{ errors.name }}</div>
		</div>

		<!-- symbol input -->
		<div class="form-item">
			<label>
				Symbol
				<span class="required">*</span>
			</label>
			<input
				v-model="mintForm.symbol"
				type="text"
				placeholder="Please input token symbol (max 20 characters)"
				class="form-item-input-textarea"
				maxlength="20"
			/>
			<div v-if="errors.symbol" class="form-item-error">{{ errors.symbol }}</div>
		</div>

		<!-- amount input -->
		<div class="form-item">
			<label>
				Amount
				<span class="required">*</span>
			</label>
			<input
				v-model="mintForm.amount"
				type="text"
				placeholder="Please input token amount (max 21,000,000)"
				class="form-item-input-textarea"
			/>
			<div v-if="errors.amount" class="form-item-error">{{ errors.amount }}</div>
		</div>

		<!-- decimal display (fixed at 6) -->
		<div class="form-item">
			<label>Decimal</label>
			<input type="text" value="6 (Fixed)" class="form-item-input-textarea" readonly />
		</div>

		<!-- domain input -->
		<div class="form-item">
			<label>Domain (Optional)</label>
			<MyTextarea
				v-model="mintForm.domain"
				placeholder="Please input domain (optional)"
				:readonly="false"
				:copyable="true"
				:deletable="true"
			/>
		</div>

		<div class="form-item-btn-container">
			<button
				class="form-button-submit"
				@click.stop="handleMint"
				type="button"
				:disabled="!isMintFormValid || isSubmitting"
			>
				<span v-if="isSubmitting">Minting...</span>
				<span v-else>Mint FT</span>
			</button>
		</div>
	</form>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import MyTextarea from '../../../components/m-textarea.vue';
import { useToast } from '../../../utils/useToast';
import { useWalletStore } from '../../../stores/wallet';
import { addTransactionHistory, extractTxid } from '../../../utils/transactionHistory';
import { addMintHistory } from '../../../utils/mintHistory';

const emit = defineEmits<{
	(e: 'update-result', value: string): void;
}>();

// 钱包状态管理
const walletStore = useWalletStore();
const { walletInfo } = storeToRefs(walletStore);
const { getWalletInfo } = walletStore;

// 消息提示
const toastApi = useToast();

// 提交状态
const isSubmitting = ref(false);

// MINT 表单数据
const createDefaultMintForm = () => ({
	flag: 'FT_MINT',
	name: '',
	symbol: '',
	amount: '',
	decimal: 6, // 固定为6
	domain: '',
});

const mintForm = ref(createDefaultMintForm());

// 表单错误信息
const errors = ref({
	name: '',
	symbol: '',
	amount: '',
});

const isMintResetting = ref(false);

const resetMintFormState = async () => {
	isMintResetting.value = true;
	mintForm.value = createDefaultMintForm();
	errors.value.name = '';
	errors.value.symbol = '';
	errors.value.amount = '';
	await nextTick();
	isMintResetting.value = false;
};

// Turing.sendTransaction 函数
const sendTransaction = async (params: any[]) => {
	if (typeof window === 'undefined') {
		throw new Error('window is not defined');
	}

	// 使用 window.Turing.sendTransaction
	if (window.Turing && typeof window.Turing.sendTransaction === 'function') {
		return await window.Turing.sendTransaction(params);
	}

	// 如果不存在，抛出错误
	throw new Error(
		'Turing.sendTransaction method not found. Please ensure window.Turing.sendTransaction is available',
	);
};

// MINT 表单验证
const validateMintForm = (): boolean => {
	let isValid = true;

	// 验证 name
	if (!mintForm.value.name || !mintForm.value.name.trim()) {
		errors.value.name = 'Name is required';
		isValid = false;
	} else {
		const nameLength = mintForm.value.name.trim().length;
		if (nameLength > 20) {
			errors.value.name = 'Name must be 20 characters or less';
			isValid = false;
		} else {
			errors.value.name = '';
		}
	}

	// 验证 symbol
	if (!mintForm.value.symbol || !mintForm.value.symbol.trim()) {
		errors.value.symbol = 'Symbol is required';
		isValid = false;
	} else {
		const symbolLength = mintForm.value.symbol.trim().length;
		if (symbolLength > 20) {
			errors.value.symbol = 'Symbol must be 20 characters or less';
			isValid = false;
		} else {
			errors.value.symbol = '';
		}
	}

	// 验证 amount
	const amountValue = mintForm.value.amount;
	if (amountValue === null || amountValue === undefined || amountValue === '') {
		errors.value.amount = 'Amount is required';
		isValid = false;
	} else {
		const amountNum =
			typeof amountValue === 'string' ? Number(amountValue.trim()) : Number(amountValue);
		if (isNaN(amountNum) || amountNum <= 0) {
			errors.value.amount = 'Amount must be a positive number';
			isValid = false;
		} else if (amountNum > 21000000) {
			errors.value.amount = 'Amount must not exceed 21,000,000';
			isValid = false;
		} else if (!Number.isInteger(amountNum)) {
			errors.value.amount = 'Amount must be an integer';
			isValid = false;
		} else {
			errors.value.amount = '';
		}
	}

	return isValid;
};

// MINT 表单验证状态
const isMintFormValid = computed(() => {
	const amountValue = mintForm.value.amount;
	const hasValidAmount =
		amountValue !== null &&
		amountValue !== undefined &&
		amountValue !== '' &&
		!isNaN(Number(amountValue));
	return (
		mintForm.value.name.trim() &&
		mintForm.value.symbol.trim() &&
		hasValidAmount &&
		!errors.value.name &&
		!errors.value.symbol &&
		!errors.value.amount
	);
});

// 处理 MINT
const handleMint = async () => {
	// 验证表单
	if (!validateMintForm()) {
		toastApi.showError('Please fix the form errors first', 3000);
		return;
	}

	isSubmitting.value = true;

	try {
		// 构建 ft_data 对象
		const amountValue = mintForm.value.amount;
		const amountNum =
			typeof amountValue === 'string' ? Number(amountValue.trim()) : Number(amountValue);
		const ft_data = {
			name: mintForm.value.name.trim(),
			symbol: mintForm.value.symbol.trim(),
			amount: amountNum,
			decimal: 6, // 固定为6
		};

		// 构建提交参数，将 ft_data 格式化为 JSON 字符串
		const params: any[] = [
			{
				flag: 'FT_MINT',
				ft_data: JSON.stringify(ft_data),
			},
		];

		// 如果提供了 domain，添加到参数中
		if (mintForm.value.domain && mintForm.value.domain.trim()) {
			params[0].domain = mintForm.value.domain.trim();
		}

		console.log('FT-MINT Generated Data:', params);

		// 调用 sendTransaction
		const response = await sendTransaction(params);

		// 提取 txid
		const txid = extractTxid(response);

		// 记录历史
		if (walletInfo.value.curAddress && txid) {
			addTransactionHistory('FT_MINT', txid, response, params, walletInfo.value.curAddress);
		}
		addMintHistory('FT_MINT', txid, response, params);

		// 通过事件把结果回传给父组件
		emit('update-result', JSON.stringify(response, null, 2));

		toastApi.showSuccess('FT-MINT transaction sent successfully', 3000);
		await resetMintFormState();
	} catch (error) {
		console.error('FT-MINT transaction error:', error);
		const errorMsg = error instanceof Error ? error.message : 'Failed to send FT-MINT transaction';
		toastApi.showError(errorMsg, 3000);
		emit('update-result', '');
	} finally {
		isSubmitting.value = false;
	}
};

// 实时验证 - MINT
watch(
	() => mintForm.value.name,
	() => {
		if (isMintResetting.value) return;
		if (!mintForm.value.name || !mintForm.value.name.trim()) {
			errors.value.name = 'Name is required';
		} else {
			const nameLength = mintForm.value.name.trim().length;
			if (nameLength > 20) {
				errors.value.name = 'Name must be 20 characters or less';
			} else {
				errors.value.name = '';
			}
		}
	},
);

watch(
	() => mintForm.value.symbol,
	() => {
		if (isMintResetting.value) return;
		if (!mintForm.value.symbol || !mintForm.value.symbol.trim()) {
			errors.value.symbol = 'Symbol is required';
		} else {
			const symbolLength = mintForm.value.symbol.trim().length;
			if (symbolLength > 20) {
				errors.value.symbol = 'Symbol must be 20 characters or less';
			} else {
				errors.value.symbol = '';
			}
		}
	},
);

watch(
	() => mintForm.value.amount,
	() => {
		if (isMintResetting.value) return;
		const amountValue = mintForm.value.amount;
		if (amountValue === null || amountValue === undefined || amountValue === '') {
			errors.value.amount = 'Amount is required';
		} else {
			const amountNum =
				typeof amountValue === 'string' ? Number(amountValue.trim()) : Number(amountValue);
			if (isNaN(amountNum) || amountNum <= 0) {
				errors.value.amount = 'Amount must be a positive number';
			} else if (amountNum > 21000000) {
				errors.value.amount = 'Amount must not exceed 21,000,000';
			} else if (!Number.isInteger(amountNum)) {
				errors.value.amount = 'Amount must be an integer';
			} else {
				errors.value.amount = '';
			}
		}
	},
);

// 检查钱包连接状态（与其他页面保持一致）
getWalletInfo();
</script>

<style scoped>
@import '../../../assets/form-page.css';
</style>