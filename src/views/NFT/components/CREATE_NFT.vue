<template>
	<form class="msg-form" @submit.prevent="handleNftCreate">
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
				<span>NFT_CREATE Form</span>
			</div>
			<p class="msg-form-description">
				Enter the NFT information and collection ID to create a new NFT
			</p>
		</div>

		<!-- nftName input -->
		<div class="form-item">
			<label>NFT Name <span class="required">*</span></label>
			<input
				v-model="nftCreateForm.name"
				type="text"
				placeholder="Please input NFT name"
				class="form-item-input-textarea"
			/>
			<div v-if="errors.name" class="form-item-error">{{ errors.name }}</div>
		</div>

		<!-- description input -->
		<div class="form-item">
			<label>Description <span class="required">*</span></label>
			<MyTextarea
				v-model="nftCreateForm.description"
				placeholder="Please input NFT description"
				:readonly="false"
				:copyable="true"
				:deletable="true"
			/>
			<div v-if="errors.description" class="form-item-error">{{ errors.description }}</div>
		</div>

		<!-- file input -->
		<div class="form-item">
			<label>File (Image) <span class="optional">(Optional)</span></label>
			<input
				type="file"
				accept="image/*"
				@change="handleNftFileChange"
				class="form-item-file-input"
			/>
			<div v-if="nftFilePreview" class="file-preview">
				<img :src="nftFilePreview" alt="Preview" class="file-preview-image" />
				<p class="file-preview-text">File loaded: {{ nftFileName }}</p>
			</div>
			<div v-if="errors.file" class="form-item-error">{{ errors.file }}</div>
		</div>

		<!-- collection_id input -->
		<div class="form-item">
			<label>Collection ID <span class="required">*</span></label>
			<MyTextarea
				v-model="nftCreateForm.collection_id"
				placeholder="Please input collection ID (from COLLECTION_CREATE result)"
				:readonly="false"
				:copyable="true"
				:deletable="true"
			/>
			<div v-if="errors.collection_id" class="form-item-error">{{ errors.collection_id }}</div>
		</div>

		<!-- domain input -->
		<div class="form-item">
			<label>Domain (Optional)</label>
			<MyTextarea
				v-model="nftCreateForm.domain"
				placeholder="Please input domain (optional)"
				:readonly="false"
				:copyable="true"
				:deletable="true"
			/>
		</div>

		<!-- broadcastEnabled -->
		<div class="form-item checkbox-item">
			<label class="checkbox-label">
				<input type="checkbox" v-model="nftCreateForm.broadcastEnabled" />
				<span>Enable Broadcast (`broadcastEnabled`)</span>
			</label>
		</div>

		<div class="form-item-btn-container">
			<button
				class="form-button-submit"
				@click.stop="handleNftCreate"
				type="button"
				:disabled="!isNftCreateFormValid || isSubmitting"
			>
				<span v-if="isSubmitting">Creating...</span>
				<span v-else>Create NFT</span>
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

// NFT_CREATE 表单数据
const createDefaultNftCreateForm = () => ({
	name: '',
	description: '',
	file: '',
	symbol: '',
	attributes: '',
	collection_id: '',
	domain: '',
	// broadcastEnabled 默认 true
	broadcastEnabled: true as boolean,
});

const nftCreateForm = ref(createDefaultNftCreateForm());

const nftFilePreview = ref('');
const nftFileName = ref('');

// 表单错误信息
const errors = ref({
	name: '',
	description: '',
	file: '',
	collection_id: '',
});

const isNftCreateResetting = ref(false);

const resetNftCreateFormState = async () => {
	isNftCreateResetting.value = true;
	nftCreateForm.value = createDefaultNftCreateForm();
	nftFilePreview.value = '';
	nftFileName.value = '';
	errors.value.name = '';
	errors.value.description = '';
	errors.value.file = '';
	errors.value.collection_id = '';
	await nextTick();
	isNftCreateResetting.value = false;
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

// NFT文件上传处理
const handleNftFileChange = (event: Event) => {
	const target = event.target as HTMLInputElement;
	const file = target.files?.[0];

	if (!file) {
		nftFilePreview.value = '';
		nftFileName.value = '';
		nftCreateForm.value.file = '';
		errors.value.file = '';
		return;
	}

	// 验证文件类型
	if (!file.type.startsWith('image/')) {
		errors.value.file = 'Please select an image file';
		nftFilePreview.value = '';
		nftFileName.value = '';
		nftCreateForm.value.file = '';
		return;
	}

	// 验证文件大小 (限制为 5MB)
	const maxSize = 5 * 1024 * 1024; // 5MB
	if (file.size > maxSize) {
		errors.value.file = 'File size must be less than 5MB';
		nftFilePreview.value = '';
		nftFileName.value = '';
		nftCreateForm.value.file = '';
		return;
	}

	nftFileName.value = file.name;
	errors.value.file = '';

	// 读取文件并转换为 base64
	const reader = new FileReader();
	reader.onload = (e) => {
		const result = e.target?.result as string;
		if (result) {
			nftCreateForm.value.file = result;
			nftFilePreview.value = result;
		}
	};
	reader.onerror = () => {
		errors.value.file = 'Failed to read file';
		nftFilePreview.value = '';
		nftFileName.value = '';
		nftCreateForm.value.file = '';
	};
	reader.readAsDataURL(file);
};

// NFT_CREATE 表单验证
const validateNftCreateForm = (): boolean => {
	let isValid = true;

	// 验证 name
	if (!nftCreateForm.value.name || !nftCreateForm.value.name.trim()) {
		errors.value.name = 'NFT Name is required';
		isValid = false;
	} else {
		errors.value.name = '';
	}

	// 验证 description
	if (!nftCreateForm.value.description || !nftCreateForm.value.description.trim()) {
		errors.value.description = 'Description is required';
		isValid = false;
	} else {
		errors.value.description = '';
	}

	// 验证 collection_id
	if (!nftCreateForm.value.collection_id || !nftCreateForm.value.collection_id.trim()) {
		errors.value.collection_id = 'Collection ID is required';
		isValid = false;
	} else {
		errors.value.collection_id = '';
	}

	return isValid;
};

// NFT_CREATE 表单验证状态
const isNftCreateFormValid = computed(() => {
	return (
		nftCreateForm.value.name.trim() &&
		nftCreateForm.value.description.trim() &&
		nftCreateForm.value.collection_id.trim() &&
		!errors.value.name &&
		!errors.value.description &&
		!errors.value.file &&
		!errors.value.collection_id
	);
});

// 处理 NFT_CREATE
const handleNftCreate = async () => {
	// 验证表单
	if (!validateNftCreateForm()) {
		toastApi.showError('Please fix the form errors first', 3000);
		return;
	}

	isSubmitting.value = true;

	try {
		// 构建 nftData 对象
		const nftData: any = {
			nftName: nftCreateForm.value.name.trim(),
			description: nftCreateForm.value.description.trim(),
			symbol: nftCreateForm.value.name.trim(),
			attributes: nftCreateForm.value.name.trim(),
		};

	if (nftCreateForm.value.file && nftCreateForm.value.file.trim()) {
		nftData.file = nftCreateForm.value.file.trim();
	}

		// 构建提交参数，将 nftData 格式化为 JSON 字符串
		const params: any[] = [
			{
				flag: 'NFT_CREATE',
				nft_data: JSON.stringify(nftData),
				collection_id: nftCreateForm.value.collection_id.trim(),
			},
		];

		// 如果提供了 domain，添加到参数中
		if (nftCreateForm.value.domain && nftCreateForm.value.domain.trim()) {
			params[0].domain = nftCreateForm.value.domain.trim();
		}

		if (!nftCreateForm.value.broadcastEnabled) {
			params[0].broadcastEnabled = false;
		}

		console.log('NFT_CREATE Generated Data:', params);

		// 调用 sendTransaction
		const response = await sendTransaction(params);

		const txid = extractTxid(response);

		if (nftCreateForm.value.broadcastEnabled && txid && walletInfo.value.curAddress) {
			addTransactionHistory('NFT_CREATE', txid, response, params, walletInfo.value.curAddress);
		}
		addMintHistory('NFT_CREATE', txid, response, params);

		// 通过事件把结果回传给父组件
		emit('update-result', JSON.stringify(response, null, 2));

		toastApi.showSuccess('NFT_CREATE transaction sent successfully', 3000);
		await resetNftCreateFormState();
	} catch (error) {
		console.error('NFT_CREATE transaction error:', error);
		const errorMsg =
			error instanceof Error ? error.message : 'Failed to send NFT_CREATE transaction';
		toastApi.showError(errorMsg, 3000);
		emit('update-result', '');
	} finally {
		isSubmitting.value = false;
	}
};

// 实时验证 - NFT_CREATE
watch(
	() => nftCreateForm.value.name,
	() => {
		if (isNftCreateResetting.value) return;
		if (!nftCreateForm.value.name || !nftCreateForm.value.name.trim()) {
			errors.value.name = 'NFT Name is required';
		} else {
			errors.value.name = '';
		}
	},
);

watch(
	() => nftCreateForm.value.description,
	() => {
		if (isNftCreateResetting.value) return;
		if (!nftCreateForm.value.description || !nftCreateForm.value.description.trim()) {
			errors.value.description = 'Description is required';
		} else {
			errors.value.description = '';
		}
	},
);

watch(
	() => nftCreateForm.value.collection_id,
	() => {
		if (isNftCreateResetting.value) return;
		if (!nftCreateForm.value.collection_id || !nftCreateForm.value.collection_id.trim()) {
			errors.value.collection_id = 'Collection ID is required';
		} else {
			errors.value.collection_id = '';
		}
	},
);

// 检查钱包连接状态（与其他页面保持一致）
getWalletInfo();
</script>

<style scoped>
@import '../../../assets/form-page.css';
</style>
