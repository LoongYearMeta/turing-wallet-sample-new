<template>
	<form class="msg-form" @submit.prevent="handleCollectionCreate">
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
				<span>COLLECTION_CREATE Form</span>
			</div>
			<p class="msg-form-description">Enter the collection data to create a new NFT collection</p>
		</div>

		<!-- collectionName input -->
		<div class="form-item">
			<label>Collection Name <span class="required">*</span></label>
			<input
				v-model="collectionForm.collectionName"
				type="text"
				placeholder="Please input collection name"
				class="form-item-input-textarea"
			/>
			<div v-if="errors.collectionName" class="form-item-error">{{ errors.collectionName }}</div>
		</div>

		<!-- description input -->
		<div class="form-item">
			<label>Description <span class="required">*</span></label>
			<MyTextarea
				v-model="collectionForm.description"
				placeholder="Please input collection description"
				:readonly="false"
				:copyable="true"
				:deletable="true"
			/>
			<div v-if="errors.description" class="form-item-error">{{ errors.description }}</div>
		</div>

		<!-- supply input -->
		<div class="form-item">
			<label>Supply <span class="required">*</span></label>
			<input
				v-model="collectionForm.supply"
				type="text"
				placeholder="Please input supply (e.g. 5)"
				class="form-item-input-textarea"
			/>
			<div v-if="errors.supply" class="form-item-error">{{ errors.supply }}</div>
		</div>

		<!-- file input -->
		<div class="form-item">
			<label>File (Image) <span class="required">*</span></label>
			<input type="file" accept="image/*" @change="handleFileChange" class="form-item-file-input" />
			<div v-if="filePreview" class="file-preview">
				<img :src="filePreview" alt="Preview" class="file-preview-image" />
				<p class="file-preview-text">File loaded: {{ fileName }}</p>
			</div>
			<div v-if="errors.file" class="form-item-error">{{ errors.file }}</div>
		</div>

		<!-- domain input -->
		<div class="form-item">
			<label>Domain (Optional)</label>
			<MyTextarea
				v-model="collectionForm.domain"
				placeholder="Please input domain (optional)"
				:readonly="false"
				:copyable="true"
				:deletable="true"
			/>
		</div>

		<!-- broadcastEnabled -->
		<div class="form-item checkbox-item">
			<label class="checkbox-label">
				<input type="checkbox" v-model="collectionForm.broadcastEnabled" />
				<span>Enable Broadcast (`broadcastEnabled`)</span>
			</label>
		</div>

		<div class="form-item-btn-container">
			<button
				class="form-button-submit"
				@click.stop="handleCollectionCreate"
				type="button"
				:disabled="!isCollectionFormValid || isSubmitting"
			>
				<span v-if="isSubmitting">Creating...</span>
				<span v-else>Create Collection</span>
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

// COLLECTION_CREATE 表单数据
const createDefaultCollectionForm = () => ({
	collectionName: '',
	description: '',
	supply: '',
	file: '',
	domain: '',
	// broadcastEnabled 默认 true
	broadcastEnabled: true as boolean,
});

const collectionForm = ref(createDefaultCollectionForm());

// 文件相关
const filePreview = ref('');
const fileName = ref('');

// 表单错误信息
const errors = ref({
	collectionName: '',
	description: '',
	supply: '',
	file: '',
});

const isCollectionResetting = ref(false);

const resetCollectionFormState = async () => {
	isCollectionResetting.value = true;
	collectionForm.value = createDefaultCollectionForm();
	filePreview.value = '';
	fileName.value = '';
	errors.value.collectionName = '';
	errors.value.description = '';
	errors.value.supply = '';
	errors.value.file = '';
	await nextTick();
	isCollectionResetting.value = false;
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

// 文件上传处理
const handleFileChange = (event: Event) => {
	const target = event.target as HTMLInputElement;
	const file = target.files?.[0];

	if (!file) {
		filePreview.value = '';
		fileName.value = '';
		collectionForm.value.file = '';
		errors.value.file = '';
		return;
	}

	// 验证文件类型
	if (!file.type.startsWith('image/')) {
		errors.value.file = 'Please select an image file';
		filePreview.value = '';
		fileName.value = '';
		collectionForm.value.file = '';
		return;
	}

	// 验证文件大小 (限制为 5MB)
	const maxSize = 5 * 1024 * 1024; // 5MB
	if (file.size > maxSize) {
		errors.value.file = 'File size must be less than 5MB';
		filePreview.value = '';
		fileName.value = '';
		collectionForm.value.file = '';
		return;
	}

	fileName.value = file.name;
	errors.value.file = '';

	// 读取文件并转换为 base64
	const reader = new FileReader();
	reader.onload = (e) => {
		const result = e.target?.result as string;
		if (result) {
			collectionForm.value.file = result;
			filePreview.value = result;
		}
	};
	reader.onerror = () => {
		errors.value.file = 'Failed to read file';
		filePreview.value = '';
		fileName.value = '';
		collectionForm.value.file = '';
	};
	reader.readAsDataURL(file);
};

// COLLECTION_CREATE 表单验证
const validateCollectionForm = (): boolean => {
	let isValid = true;

	// 验证 collectionName
	if (!collectionForm.value.collectionName || !collectionForm.value.collectionName.trim()) {
		errors.value.collectionName = 'Collection Name is required';
		isValid = false;
	} else {
		errors.value.collectionName = '';
	}

	// 验证 description
	if (!collectionForm.value.description || !collectionForm.value.description.trim()) {
		errors.value.description = 'Description is required';
		isValid = false;
	} else {
		errors.value.description = '';
	}

	// 验证 supply
	const supplyValue = collectionForm.value.supply;
	if (supplyValue === null || supplyValue === undefined || supplyValue === '') {
		errors.value.supply = 'Supply is required';
		isValid = false;
	} else {
		const supplyNum =
			typeof supplyValue === 'string' ? Number(supplyValue.trim()) : Number(supplyValue);
		if (isNaN(supplyNum) || supplyNum <= 0) {
			errors.value.supply = 'Supply must be a positive number';
			isValid = false;
		} else if (!Number.isInteger(supplyNum)) {
			errors.value.supply = 'Supply must be an integer';
			isValid = false;
		} else {
			errors.value.supply = '';
		}
	}

	// 验证 file
	if (!collectionForm.value.file || !collectionForm.value.file.trim()) {
		errors.value.file = 'File is required';
		isValid = false;
	} else {
		errors.value.file = '';
	}

	return isValid;
};

// COLLECTION_CREATE 表单验证状态
const isCollectionFormValid = computed(() => {
	const supplyValue = collectionForm.value.supply;
	const hasValidSupply =
		supplyValue !== null &&
		supplyValue !== undefined &&
		supplyValue !== '' &&
		!isNaN(Number(supplyValue));
	return (
		collectionForm.value.collectionName.trim() &&
		collectionForm.value.description.trim() &&
		hasValidSupply &&
		collectionForm.value.file.trim() &&
		!errors.value.collectionName &&
		!errors.value.description &&
		!errors.value.supply &&
		!errors.value.file
	);
});

// 处理 COLLECTION_CREATE
const handleCollectionCreate = async () => {
	// 验证表单
	if (!validateCollectionForm()) {
		toastApi.showError('Please fix the form errors first', 3000);
		return;
	}

	isSubmitting.value = true;

	try {
		// 构建 collection_data 对象
		const supplyValue = collectionForm.value.supply;
		const supplyNum =
			typeof supplyValue === 'string' ? Number(supplyValue.trim()) : Number(supplyValue);
		const collection_data = {
			collectionName: collectionForm.value.collectionName.trim(),
			description: collectionForm.value.description.trim(),
			supply: supplyNum,
			file: collectionForm.value.file.trim(),
		};

		// 构建提交参数，将 collection_data 格式化为 JSON 字符串
		const params: any[] = [
			{
				flag: 'COLLECTION_CREATE',
				collection_data: JSON.stringify(collection_data),
			},
		];

		// 如果提供了 domain，添加到参数中
		if (collectionForm.value.domain && collectionForm.value.domain.trim()) {
			params[0].domain = collectionForm.value.domain.trim();
		}

		// broadcastEnabled：默认 true，仅在为 false 时显式下发
		if (!collectionForm.value.broadcastEnabled) {
			params[0].broadcastEnabled = false;
		}

		console.log('COLLECTION_CREATE Generated Data:', params);

		// 调用 sendTransaction
		const response = await sendTransaction(params);

		// 提取 txid（仅在广播时有效）
		const txid = extractTxid(response);

		// 仅在 broadcastEnabled 为 true 时记录历史
		if (collectionForm.value.broadcastEnabled && txid && walletInfo.value.curAddress) {
			addTransactionHistory(
				'COLLECTION_CREATE',
				txid,
				response,
				params,
				walletInfo.value.curAddress,
			);
		}

		// 通过事件把结果回传给父组件
		emit('update-result', JSON.stringify(response, null, 2));

		toastApi.showSuccess('COLLECTION_CREATE transaction sent successfully', 3000);
		await resetCollectionFormState();
	} catch (error) {
		console.error('COLLECTION_CREATE transaction error:', error);
		const errorMsg =
			error instanceof Error ? error.message : 'Failed to send COLLECTION_CREATE transaction';
		toastApi.showError(errorMsg, 3000);
		emit('update-result', '');
	} finally {
		isSubmitting.value = false;
	}
};

// 实时验证 - COLLECTION_CREATE
watch(
	() => collectionForm.value.collectionName,
	() => {
		if (isCollectionResetting.value) return;
		if (!collectionForm.value.collectionName || !collectionForm.value.collectionName.trim()) {
			errors.value.collectionName = 'Collection Name is required';
		} else {
			errors.value.collectionName = '';
		}
	},
);

watch(
	() => collectionForm.value.description,
	() => {
		if (isCollectionResetting.value) return;
		if (!collectionForm.value.description || !collectionForm.value.description.trim()) {
			errors.value.description = 'Description is required';
		} else {
			errors.value.description = '';
		}
	},
);

watch(
	() => collectionForm.value.supply,
	() => {
		if (isCollectionResetting.value) return;
		const supplyValue = collectionForm.value.supply;
		if (supplyValue === null || supplyValue === undefined || supplyValue === '') {
			errors.value.supply = 'Supply is required';
		} else {
			const supplyNum =
				typeof supplyValue === 'string' ? Number(supplyValue.trim()) : Number(supplyValue);
			if (isNaN(supplyNum) || supplyNum <= 0) {
				errors.value.supply = 'Supply must be a positive number';
			} else if (!Number.isInteger(supplyNum)) {
				errors.value.supply = 'Supply must be an integer';
			} else {
				errors.value.supply = '';
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
