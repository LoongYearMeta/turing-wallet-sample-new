<template>
	<form class="msg-form" @submit.prevent="handleSubmit">
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
				<span>POOLNFT Swap To TBC</span>
			</div>
			<p class="msg-form-description">Swap FT tokens back to TBC via PoolNFT.</p>
		</div>

		<div class="form-item">
			<label>PoolNFT Contract Address <span class="required">*</span></label>
			<MyTextarea
				v-model="form.nft_contract_address"
				placeholder="Please enter the pool NFT contract address"
				:readonly="false"
				:copyable="true"
				:deletable="true"
			/>
			<div v-if="errors.nft_contract_address" class="form-item-error">
				{{ errors.nft_contract_address }}
			</div>
		</div>

		<div class="form-item">
			<label>Recipient Address <span class="required">*</span></label>
			<MyTextarea
				v-model="form.address"
				placeholder="Please enter the recipient address"
				:readonly="false"
				:copyable="true"
				:deletable="true"
			/>
			<div v-if="errors.address" class="form-item-error">{{ errors.address }}</div>
		</div>

		<div class="form-item">
			<label>FT Amount <span class="required">*</span></label>
			<input
				v-model="form.ft_amount"
				type="text"
				inputmode="decimal"
				class="form-item-input"
				placeholder="Default 10"
			/>
			<div v-if="errors.ft_amount" class="form-item-error">{{ errors.ft_amount }}</div>
		</div>

		<div class="form-item">
			<label>PoolNFT Version</label>
			<input
				v-model="form.poolNFT_version"
				type="text"
				class="form-item-input"
				readonly
			/>
		</div>

		<div class="form-item">
			<label>Liquidity Plan</label>
			<input
				v-model="form.lpPlan"
				type="text"
				inputmode="numeric"
				class="form-item-input"
				placeholder="Default 1"
			/>
			<div v-if="errors.lpPlan" class="form-item-error">{{ errors.lpPlan }}</div>
		</div>

		<div class="form-item">
			<label>Domain (Optional)</label>
			<MyTextarea
				v-model="form.domain"
				placeholder="Add a domain identifier if needed"
				:readonly="false"
				:copyable="true"
				:deletable="true"
			/>
		</div>

		<div class="form-item-btn-container">
			<button class="form-button-submit" type="submit" :disabled="!isFormValid || isSubmitting">
				<span v-if="isSubmitting">Submitting...</span>
				<span v-else>Swap To TBC</span>
			</button>
		</div>
	</form>

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
				<span>POOLNFT Swap To TBC Result</span>
			</div>
		</div>
		<MyTextarea
			v-model="sendResult"
			placeholder="POOLNFT swap to TBC response will be displayed here"
			:readonly="true"
			:copyable="true"
			:deletable="false"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from 'vue';
import { useToast } from '../../../utils/useToast';
import { useWalletStore } from '../../../stores/wallet';
import { storeToRefs } from 'pinia';
import MyTextarea from '../../../components/m-textarea.vue';
import { addTransactionHistory, extractTxid } from '../../../utils/transactionHistory';
import { useFormCache } from '../../../utils/useFormCache';

interface PoolNftSwapToTbcForm {
	nft_contract_address: string;
	address: string;
	ft_amount: string;
	poolNFT_version: number | '';
	lpPlan: string;
	domain: string;
}

const DEFAULT_FT_AMOUNT = '10';
const DEFAULT_VERSION = 2;
const DEFAULT_LP_PLAN = '1';

const walletStore = useWalletStore();
const { walletInfo } = storeToRefs(walletStore);
const { getWalletInfo } = walletStore;

const toastApi = useToast();

const isSubmitting = ref(false);

const form = ref<PoolNftSwapToTbcForm>({
	nft_contract_address: '',
	address: '',
	ft_amount: DEFAULT_FT_AMOUNT,
	poolNFT_version: DEFAULT_VERSION,
	lpPlan: DEFAULT_LP_PLAN,
	domain: '',
});

const errors = ref({
	nft_contract_address: '',
	address: '',
	ft_amount: '',
	lpPlan: '',
});

const sendResult = ref('');

// 是否正在重置表单（用于跳过验证）
const isResetting = ref(false);

// 表单缓存
const { handleSubmitSuccess } = useFormCache(form, {
	key: 'POOLNFT_SWAP_TO_TBC',
	clearOnSubmit: true,
});

// 重置表单到初始状态
const resetForm = async () => {
	isResetting.value = true;
	form.value = {
		nft_contract_address: '',
		address: '',
		ft_amount: DEFAULT_FT_AMOUNT,
		poolNFT_version: DEFAULT_VERSION,
		lpPlan: DEFAULT_LP_PLAN,
		domain: '',
	};
	// 清空错误信息
	Object.keys(errors.value).forEach((key) => {
		errors.value[key as keyof typeof errors.value] = '';
	});
	// 注意：不清空发送结果，保持结果显示
	await nextTick();
	isResetting.value = false;
};

const validatePositiveNumber = (value: string | number | null | undefined) => {
	// 处理 null、undefined 或空值
	if (value === null || value === undefined) return false;
	
	// 转换为字符串并去除空格
	const strValue = String(value).trim();
	if (!strValue) return false;
	
	// 转换为数字并验证
	const num = Number(strValue);
	if (Number.isNaN(num)) return false;
	return num > 0;
};

const validatePositiveInteger = (value: string | number | null | undefined) => {
	// 处理 null、undefined 或空值
	if (value === null || value === undefined) return false;
	
	// 转换为字符串并去除空格
	const strValue = String(value).trim();
	if (!strValue) return false;
	
	const num = Number(strValue);
	return Number.isInteger(num) && num > 0;
};

const validateForm = () => {
	let isValid = true;

	if (!form.value.nft_contract_address.trim()) {
		errors.value.nft_contract_address = 'PoolNFT contract address is required';
		isValid = false;
	} else {
		errors.value.nft_contract_address = '';
	}

	if (!form.value.address.trim()) {
		errors.value.address = 'Recipient address is required';
		isValid = false;
	} else {
		errors.value.address = '';
	}

	if (!validatePositiveNumber(form.value.ft_amount)) {
		errors.value.ft_amount = 'FT amount must be a positive number';
		isValid = false;
	} else {
		errors.value.ft_amount = '';
	}


	if (!validatePositiveInteger(form.value.lpPlan)) {
		errors.value.lpPlan = 'Liquidity plan must be a positive integer';
		isValid = false;
	} else {
		errors.value.lpPlan = '';
	}

	return isValid;
};

const isFormValid = computed(() => {
	return (
		form.value.nft_contract_address.trim() &&
		form.value.address.trim() &&
		validatePositiveNumber(form.value.ft_amount) &&
		validatePositiveInteger(form.value.lpPlan) &&
		!errors.value.nft_contract_address &&
		!errors.value.address &&
		!errors.value.ft_amount &&
		!errors.value.lpPlan
	);
});

const sendTransaction = async (params: any[]) => {
	if (typeof window === 'undefined') {
		throw new Error('window is not defined');
	}

	if (window.Turing && typeof window.Turing.sendTransaction === 'function') {
		return await window.Turing.sendTransaction(params);
	}

	throw new Error(
		'Turing.sendTransaction method not found. Please ensure window.Turing.sendTransaction is available',
	);
};

const handleSubmit = async () => {
	if (!validateForm()) {
		toastApi.showError('Please fix the form errors first', 3000);
		return;
	}

	isSubmitting.value = true;

	try {
		const params: any[] = [
			{
				flag: 'POOLNFT_SWAP_TO_TBC',
				nft_contract_address: form.value.nft_contract_address.trim(),
				address: form.value.address.trim(),
				ft_amount: Number(form.value.ft_amount),
				lpPlan: Number(form.value.lpPlan),
			},
		];

		params[0].poolNFT_version = 2;

		if (form.value.domain.trim()) {
			params[0].domain = form.value.domain.trim();
		}

		console.log('POOLNFT_SWAP_TO_TBC Generated Data:', params);

		const response = await sendTransaction(params);
		const txid = extractTxid(response);

		if (txid && walletInfo.value.curAddress) {
			addTransactionHistory(
				'POOLNFT_SWAP_TO_TBC',
				txid,
				response,
				params,
				walletInfo.value.curAddress,
			);
		}

		sendResult.value = JSON.stringify(response, null, 2);
		toastApi.showSuccess('POOLNFT Swap To TBC transaction sent successfully', 3000);
		// 提交成功后清除缓存并重置表单（不清空结果）
		handleSubmitSuccess();
		await resetForm();
	} catch (error) {
		console.error('POOLNFT Swap To TBC transaction error:', error);
		const errorMsg =
			error instanceof Error ? error.message : 'Failed to send POOLNFT Swap To TBC transaction';
		toastApi.showError(errorMsg, 3000);
		sendResult.value = '';
	} finally {
		isSubmitting.value = false;
	}
};

watch(
	() => form.value.nft_contract_address,
	() => {
		if (isResetting.value) return;
		if (!form.value.nft_contract_address.trim()) {
			errors.value.nft_contract_address = 'PoolNFT contract address is required';
		} else {
			errors.value.nft_contract_address = '';
		}
	},
);

watch(
	() => form.value.address,
	() => {
		if (isResetting.value) return;
		if (!form.value.address.trim()) {
			errors.value.address = 'Recipient address is required';
		} else {
			errors.value.address = '';
		}
	},
);

watch(
	() => form.value.ft_amount,
	() => {
		if (isResetting.value) return;
		if (!validatePositiveNumber(form.value.ft_amount)) {
			errors.value.ft_amount = 'FT amount must be a positive number';
		} else {
			errors.value.ft_amount = '';
		}
	},
);


watch(
	() => form.value.lpPlan,
	() => {
		if (isResetting.value) return;
		if (!validatePositiveInteger(form.value.lpPlan)) {
			errors.value.lpPlan = 'Liquidity plan must be a positive integer';
		} else {
			errors.value.lpPlan = '';
		}
	},
);

onMounted(async () => {
	await getWalletInfo();
});
</script>

<style scoped>
@import '../../../assets/form-page.css';

.required {
	color: var(--color-error);
	font-weight: 600;
}

.form-item-input {
	width: 100%;
	padding: var(--spacing-xs);
	border-radius: var(--radius-sm);
	border: 1px solid var(--form-border-color);
	background-color: var(--form-item-bg-color);
	color: var(--color-text-primary);
	font-size: var(--font-size-subtitle);
	font-family: var(--font-family-monospace);
	box-sizing: border-box;
	transition: all 0.2s ease;
}

.form-item-input:focus {
	outline: none;
	border-color: var(--color-primary);
	box-shadow: 0 0 0 2px rgba(255, 140, 0, 0.1);
}

.form-item-input::placeholder {
	color: var(--color-text-tertiary);
	opacity: 0.6;
}
</style>
