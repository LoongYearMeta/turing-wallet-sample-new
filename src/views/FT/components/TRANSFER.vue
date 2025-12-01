<template>
	<form class="msg-form" @submit.prevent="handleTransfer">
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
				<span>FT-TRANSFER Form</span>
			</div>
			<p class="msg-form-description">
				Enter the contract address, amount, and recipient address to transfer FT tokens
			</p>
		</div>

		<!-- ft_contract_address input -->
		<div class="form-item">
			<label>
				FT Contract Address
				<span class="required">*</span>
			</label>
			<MyTextarea
				v-model="transferForm.ft_contract_address"
				placeholder="Please input FT contract address"
				:readonly="false"
				:copyable="true"
				:deletable="true"
			/>
			<div v-if="errors.ft_contract_address" class="form-item-error">
				{{ errors.ft_contract_address }}
			</div>
		</div>

		<!-- ft_amount input -->
		<div class="form-item">
			<label>
				FT Amount
				<span class="required">*</span>
			</label>
			<MyTextarea
				v-model="transferForm.ft_amount"
				placeholder="Please input FT amount (e.g. 0.1)"
				:readonly="false"
				:copyable="true"
				:deletable="true"
			/>
			<div v-if="errors.ft_amount" class="form-item-error">{{ errors.ft_amount }}</div>
		</div>

		<!-- tbc_amount input -->
		<div class="form-item">
			<label>TBC Amount (Optional)</label>
			<MyTextarea
				v-model="transferForm.tbc_amount"
				placeholder="Please input TBC amount if transferring both FT and TBC (e.g. 1)"
				:readonly="false"
				:copyable="true"
				:deletable="true"
			/>
			<div v-if="errors.tbc_amount" class="form-item-error">{{ errors.tbc_amount }}</div>
		</div>

		<!-- address input -->
		<div class="form-item">
			<label>
				Recipient Address
				<span class="required">*</span>
			</label>
			<MyTextarea
				v-model="transferForm.address"
				placeholder="Please input recipient address"
				:readonly="false"
				:copyable="true"
				:deletable="true"
			/>
			<div v-if="errors.address" class="form-item-error">{{ errors.address }}</div>
		</div>

		<!-- broadcastEnabled -->
		<div class="form-item checkbox-item">
			<label class="checkbox-label">
				<input type="checkbox" v-model="transferForm.broadcastEnabled" />
				<span>Enable Broadcast (`broadcastEnabled`)</span>
			</label>
		</div>

		<!-- domain input -->
		<!-- <div class="form-item">
			<label>Domain (Optional)</label>
			<MyTextarea
				v-model="transferForm.domain"
				placeholder="Please input domain (optional)"
				:readonly="false"
				:copyable="true"
				:deletable="true"
			/>
		</div> -->

		<div class="form-item-btn-container">
			<button
				class="form-button-submit"
				@click.stop="handleTransfer"
				type="button"
				:disabled="!isTransferFormValid || isSubmitting"
			>
				<span v-if="isSubmitting">Transferring...</span>
				<span v-else>Transfer FT</span>
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

// TRANSFER 表单数据
const createDefaultTransferForm = () => ({
	flag: 'FT_TRANSFER',
	ft_contract_address: '',
	ft_amount: '',
	tbc_amount: '',
	address: '',
	domain: '',
	// broadcastEnabled 默认 true，由表单控制
	broadcastEnabled: true as boolean,
});

const transferForm = ref(createDefaultTransferForm());

// 表单错误信息
const errors = ref({
	ft_contract_address: '',
	ft_amount: '',
	tbc_amount: '',
	address: '',
});

const isTransferResetting = ref(false);

const resetTransferFormState = async () => {
	isTransferResetting.value = true;
	transferForm.value = createDefaultTransferForm();
	errors.value.ft_contract_address = '';
	errors.value.ft_amount = '';
	errors.value.tbc_amount = '';
	errors.value.address = '';
	await nextTick();
	isTransferResetting.value = false;
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

// TRANSFER 表单验证
const validateTransferForm = (): boolean => {
	let isValid = true;

	// 验证 ft_contract_address
	if (!transferForm.value.ft_contract_address || !transferForm.value.ft_contract_address.trim()) {
		errors.value.ft_contract_address = 'FT Contract Address is required';
		isValid = false;
	} else {
		errors.value.ft_contract_address = '';
	}

	// 验证 ft_amount
	if (!transferForm.value.ft_amount || !transferForm.value.ft_amount.trim()) {
		errors.value.ft_amount = 'FT Amount is required';
		isValid = false;
	} else {
		const ftAmountNum = Number(transferForm.value.ft_amount.trim());
		if (isNaN(ftAmountNum) || ftAmountNum <= 0) {
			errors.value.ft_amount = 'FT Amount must be a positive number';
			isValid = false;
		} else {
			errors.value.ft_amount = '';
		}
	}

	// 验证 tbc_amount (如果提供)
	if (transferForm.value.tbc_amount && transferForm.value.tbc_amount.trim()) {
		const tbcAmountNum = Number(transferForm.value.tbc_amount.trim());
		if (isNaN(tbcAmountNum) || tbcAmountNum <= 0) {
			errors.value.tbc_amount = 'TBC Amount must be a positive number';
			isValid = false;
		} else {
			errors.value.tbc_amount = '';
		}
	} else {
		errors.value.tbc_amount = '';
	}

	// 验证 address
	if (!transferForm.value.address || !transferForm.value.address.trim()) {
		errors.value.address = 'Recipient Address is required';
		isValid = false;
	} else {
		errors.value.address = '';
	}

	return isValid;
};

// TRANSFER 表单验证状态
const isTransferFormValid = computed(() => {
	return (
		transferForm.value.ft_contract_address.trim() &&
		transferForm.value.ft_amount.trim() &&
		transferForm.value.address.trim() &&
		!errors.value.ft_contract_address &&
		!errors.value.ft_amount &&
		!errors.value.tbc_amount &&
		!errors.value.address
	);
});

// 处理 TRANSFER
const handleTransfer = async () => {
	// 验证表单
	if (!validateTransferForm()) {
		toastApi.showError('Please fix the form errors first', 3000);
		return;
	}

	isSubmitting.value = true;

	try {
		// 构建提交参数
		const params: any[] = [
			{
				flag: 'FT_TRANSFER',
				ft_contract_address: transferForm.value.ft_contract_address.trim(),
				ft_amount: Number(transferForm.value.ft_amount.trim()),
				address: transferForm.value.address.trim(),
			},
		];

		// 如果提供了 tbc_amount，添加到参数中
		if (transferForm.value.tbc_amount && transferForm.value.tbc_amount.trim()) {
			params[0].tbc_amount = Number(transferForm.value.tbc_amount.trim());
		}

		// 如果提供了 domain，添加到参数中
		if (transferForm.value.domain && transferForm.value.domain.trim()) {
			params[0].domain = transferForm.value.domain.trim();
		}

		// broadcastEnabled：默认 true，仅在为 false 时显式下发
		const broadcastEnabled = transferForm.value.broadcastEnabled !== false;
		if (!broadcastEnabled) {
			params[0].broadcastEnabled = false;
		}

		console.log('FT-TRANSFER Generated Data:', params);

		// 调用 sendTransaction
		const response = await sendTransaction(params);

		// 提取 txid（仅在广播时有效）
		const txid = extractTxid(response);

		// 仅在 broadcastEnabled 为 true 时记录历史
		if (broadcastEnabled && txid && walletInfo.value.curAddress) {
			addTransactionHistory('FT_TRANSFER', txid, response, params, walletInfo.value.curAddress);
		}

		// 通过事件把结果回传给父组件
		emit('update-result', JSON.stringify(response, null, 2));

		toastApi.showSuccess('FT-TRANSFER transaction sent successfully', 3000);
		await resetTransferFormState();
	} catch (error) {
		console.error('FT-TRANSFER transaction error:', error);
		const errorMsg =
			error instanceof Error ? error.message : 'Failed to send FT-TRANSFER transaction';
		toastApi.showError(errorMsg, 3000);
		emit('update-result', '');
	} finally {
		isSubmitting.value = false;
	}
};

// 实时验证 - TRANSFER
watch(
	() => transferForm.value.ft_contract_address,
	() => {
		if (isTransferResetting.value) return;
		if (!transferForm.value.ft_contract_address || !transferForm.value.ft_contract_address.trim()) {
			errors.value.ft_contract_address = 'FT Contract Address is required';
		} else {
			errors.value.ft_contract_address = '';
		}
	},
);

watch(
	() => transferForm.value.ft_amount,
	() => {
		if (isTransferResetting.value) return;
		if (!transferForm.value.ft_amount || !transferForm.value.ft_amount.trim()) {
			errors.value.ft_amount = 'FT Amount is required';
		} else {
			const ftAmountNum = Number(transferForm.value.ft_amount.trim());
			if (isNaN(ftAmountNum) || ftAmountNum <= 0) {
				errors.value.ft_amount = 'FT Amount must be a positive number';
			} else {
				errors.value.ft_amount = '';
			}
		}
	},
);

watch(
	() => transferForm.value.tbc_amount,
	() => {
		if (isTransferResetting.value) return;
		if (transferForm.value.tbc_amount && transferForm.value.tbc_amount.trim()) {
			const tbcAmountNum = Number(transferForm.value.tbc_amount.trim());
			if (isNaN(tbcAmountNum) || tbcAmountNum <= 0) {
				errors.value.tbc_amount = 'TBC Amount must be a positive number';
			} else {
				errors.value.tbc_amount = '';
			}
		} else {
			errors.value.tbc_amount = '';
		}
	},
);

watch(
	() => transferForm.value.address,
	() => {
		if (isTransferResetting.value) return;
		if (!transferForm.value.address || !transferForm.value.address.trim()) {
			errors.value.address = 'Recipient Address is required';
		} else {
			errors.value.address = '';
		}
	},
);

// 检查钱包连接状态（与其他页面保持一致）
getWalletInfo();
</script>

<style scoped>
@import '../../../assets/form-page.css';
</style>
