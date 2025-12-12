<template>
	<form class="msg-form" @submit.prevent="handleNftTransfer">
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
				<span>NFT_TRANSFER Form</span>
			</div>
			<p class="msg-form-description">
				Enter the NFT contract address and recipient address to transfer NFT
			</p>
		</div>

		<!-- nft_contract_address input -->
		<div class="form-item">
			<label>NFT Contract Address <span class="required">*</span></label>
			<ContractAddressSelector
				v-model="nftTransferForm.nft_contract_address"
				address-type="nft"
				:allowed-sources="['NFT_CREATE']"
				placeholder="Please input NFT contract address (from NFT_CREATE result)"
			/>
			<div v-if="errors.nft_contract_address" class="form-item-error">
				{{ errors.nft_contract_address }}
			</div>
		</div>

		<!-- address input -->
		<div class="form-item">
			<label>Recipient Address <span class="required">*</span></label>
			<MyTextarea
				v-model="nftTransferForm.address"
				placeholder="Please input recipient address"
				:readonly="false"
				:copyable="true"
				:deletable="true"
			/>
			<div v-if="errors.address" class="form-item-error">{{ errors.address }}</div>
		</div>

		<!-- domain input -->
		<div class="form-item">
			<label>Domain (Optional)</label>
			<MyTextarea
				v-model="nftTransferForm.domain"
				placeholder="Please input domain (optional)"
				:readonly="false"
				:copyable="true"
				:deletable="true"
			/>
		</div>

		<!-- broadcastEnabled -->
		<div class="form-item checkbox-item">
			<label class="checkbox-label">
				<input type="checkbox" v-model="nftTransferForm.broadcastEnabled" />
				<span>Enable Broadcast (`broadcastEnabled`)</span>
			</label>
		</div>

		<div class="form-item-btn-container">
			<button
				class="form-button-submit"
				@click.stop="handleNftTransfer"
				type="button"
				:disabled="!isNftTransferFormValid || isSubmitting"
			>
				<span v-if="isSubmitting">Transferring...</span>
				<span v-else>Transfer NFT</span>
			</button>
		</div>
	</form>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import MyTextarea from '../../../components/m-textarea.vue';
import ContractAddressSelector from '../../../components/ContractAddressSelector.vue';
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

// NFT_TRANSFER 表单数据
const createDefaultNftTransferForm = () => ({
	nft_contract_address: '',
	address: '',
	domain: '',
	// broadcastEnabled 默认 true
	broadcastEnabled: true as boolean,
});

const nftTransferForm = ref(createDefaultNftTransferForm());

// 表单错误信息
const errors = ref({
	nft_contract_address: '',
	address: '',
});

const isNftTransferResetting = ref(false);

const resetNftTransferFormState = async () => {
	isNftTransferResetting.value = true;
	nftTransferForm.value = createDefaultNftTransferForm();
	errors.value.nft_contract_address = '';
	errors.value.address = '';
	await nextTick();
	isNftTransferResetting.value = false;
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

// NFT_TRANSFER 表单验证
const validateNftTransferForm = (): boolean => {
	let isValid = true;

	// 验证 nft_contract_address
	if (
		!nftTransferForm.value.nft_contract_address ||
		!nftTransferForm.value.nft_contract_address.trim()
	) {
		errors.value.nft_contract_address = 'NFT Contract Address is required';
		isValid = false;
	} else {
		errors.value.nft_contract_address = '';
	}

	// 验证 address
	if (!nftTransferForm.value.address || !nftTransferForm.value.address.trim()) {
		errors.value.address = 'Recipient Address is required';
		isValid = false;
	} else {
		errors.value.address = '';
	}

	return isValid;
};

// NFT_TRANSFER 表单验证状态
const isNftTransferFormValid = computed(() => {
	return (
		nftTransferForm.value.nft_contract_address.trim() &&
		nftTransferForm.value.address.trim() &&
		!errors.value.nft_contract_address &&
		!errors.value.address
	);
});

// 处理 NFT_TRANSFER
const handleNftTransfer = async () => {
	// 验证表单
	if (!validateNftTransferForm()) {
		toastApi.showError('Please fix the form errors first', 3000);
		return;
	}

	isSubmitting.value = true;

	try {
		// 构建提交参数
		const params: any[] = [
			{
				flag: 'NFT_TRANSFER',
				nft_contract_address: nftTransferForm.value.nft_contract_address.trim(),
				address: nftTransferForm.value.address.trim(),
			},
		];

		// 如果提供了 domain，添加到参数中
		if (nftTransferForm.value.domain && nftTransferForm.value.domain.trim()) {
			params[0].domain = nftTransferForm.value.domain.trim();
		}

		if (!nftTransferForm.value.broadcastEnabled) {
			params[0].broadcastEnabled = false;
		}

		console.log('NFT_TRANSFER Generated Data:', params);

		// 调用 sendTransaction
		const response = await sendTransaction(params);

		const txid = extractTxid(response);

		if (nftTransferForm.value.broadcastEnabled && txid && walletInfo.value.curAddress) {
			addTransactionHistory('NFT_TRANSFER', txid, response, params, walletInfo.value.curAddress);
		}

		// 通过事件把结果回传给父组件
		emit('update-result', JSON.stringify(response, null, 2));

		toastApi.showSuccess('NFT_TRANSFER transaction sent successfully', 3000);
		await resetNftTransferFormState();
	} catch (error) {
		console.error('NFT_TRANSFER transaction error:', error);
		const errorMsg =
			error instanceof Error ? error.message : 'Failed to send NFT_TRANSFER transaction';
		toastApi.showError(errorMsg, 3000);
		emit('update-result', '');
	} finally {
		isSubmitting.value = false;
	}
};

// 实时验证 - NFT_TRANSFER
watch(
	() => nftTransferForm.value.nft_contract_address,
	() => {
		if (isNftTransferResetting.value) return;
		if (
			!nftTransferForm.value.nft_contract_address ||
			!nftTransferForm.value.nft_contract_address.trim()
		) {
			errors.value.nft_contract_address = 'NFT Contract Address is required';
		} else {
			errors.value.nft_contract_address = '';
		}
	},
);

watch(
	() => nftTransferForm.value.address,
	() => {
		if (isNftTransferResetting.value) return;
		if (!nftTransferForm.value.address || !nftTransferForm.value.address.trim()) {
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
