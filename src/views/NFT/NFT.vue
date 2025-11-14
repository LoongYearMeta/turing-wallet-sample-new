<template>
	<div class="message-signing-page">
		<!-- header -->
		<div class="page-header">
			<div>
				<h2 class="page-title">NFT Transaction</h2>
				<p class="page-description">Create collection, create NFT, or transfer NFT using the form below.</p>
			</div>
			<router-link to="/records" class="history-link">
				<span>View History</span>
			</router-link>
		</div>
		
		<!-- Function Toggle -->
		<div class="function-toggle">
			<button
				class="toggle-btn"
				:class="{ active: currentFunction === 'COLLECTION_CREATE' }"
				@click="currentFunction = 'COLLECTION_CREATE'"
			>
				<span class="toggle-btn-text-full">COLLECTION_CREATE</span>
				<span class="toggle-btn-text-short">COLLECTION</span>
			</button>
			<button
				class="toggle-btn"
				:class="{ active: currentFunction === 'NFT_CREATE' }"
				@click="currentFunction = 'NFT_CREATE'"
			>
				<span class="toggle-btn-text-full">NFT_CREATE</span>
				<span class="toggle-btn-text-short">CREATE</span>
			</button>
			<button
				class="toggle-btn"
				:class="{ active: currentFunction === 'NFT_TRANSFER' }"
				@click="currentFunction = 'NFT_TRANSFER'"
			>
				<span class="toggle-btn-text-full">NFT_TRANSFER</span>
				<span class="toggle-btn-text-short">TRANSFER</span>
			</button>
		</div>

		<!-- COLLECTION_CREATE Form -->
		<form v-if="currentFunction === 'COLLECTION_CREATE'" class="msg-form" @submit.prevent="handleCollectionCreate">
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
				<input
					type="file"
					accept="image/*"
					@change="handleFileChange"
					class="form-item-file-input"
				/>
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

		<!-- NFT_CREATE Form -->
		<form v-if="currentFunction === 'NFT_CREATE'" class="msg-form" @submit.prevent="handleNftCreate">
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
				<p class="msg-form-description">Enter the NFT information and collection ID to create a new NFT</p>
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
				<label>File (Image) <span class="required">*</span></label>
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

		<!-- NFT_TRANSFER Form -->
		<form v-if="currentFunction === 'NFT_TRANSFER'" class="msg-form" @submit.prevent="handleNftTransfer">
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
				<p class="msg-form-description">Enter the NFT contract address and recipient address to transfer NFT</p>
			</div>
			<!-- nft_contract_address input -->
			<div class="form-item">
				<label>NFT Contract Address <span class="required">*</span></label>
				<MyTextarea
					v-model="nftTransferForm.nft_contract_address"
					placeholder="Please input NFT contract address (from NFT_CREATE result)"
					:readonly="false"
					:copyable="true"
					:deletable="true"
				/>
				<div v-if="errors.nft_contract_address" class="form-item-error">{{ errors.nft_contract_address }}</div>
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
					<span>NFT Transaction Result</span>
				</div>
			</div>
			<MyTextarea
				v-model="sendResult"
				placeholder="NFT transaction result will be displayed here"
				:readonly="true"
				:copyable="true"
				:deletable="false"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useToast } from '../../utils/useToast';
import { useWalletStore } from '../../stores/wallet';
import { storeToRefs } from 'pinia';
import MyTextarea from '../../components/m-textarea.vue';
import { addTransactionHistory, extractTxid } from '../../utils/transactionHistory';

// 钱包状态管理
const walletStore = useWalletStore();
const { walletInfo } = storeToRefs(walletStore);
const { getWalletInfo } = walletStore;

// 消息提示
const toastApi = useToast();

// 当前功能类型
const currentFunction = ref<'COLLECTION_CREATE' | 'NFT_CREATE' | 'NFT_TRANSFER'>('COLLECTION_CREATE');

// 提交状态
const isSubmitting = ref(false);

// COLLECTION_CREATE 表单数据
const createDefaultCollectionForm = () => ({
	collectionName: '',
	description: '',
	supply: '',
	file: '',
	domain: '',
});

const collectionForm = ref(createDefaultCollectionForm());

// NFT_CREATE 表单数据
const createDefaultNftCreateForm = () => ({
	name: '',
	description: '',
	file: '',
	symbol: '',
	attributes: '',
	collection_id: '',
	domain: '',
});

const nftCreateForm = ref(createDefaultNftCreateForm());

// NFT_TRANSFER 表单数据
const createDefaultNftTransferForm = () => ({
	nft_contract_address: '',
	address: '',
	domain: '',
});

const nftTransferForm = ref(createDefaultNftTransferForm());

// 文件相关
const filePreview = ref('');
const fileName = ref('');
const nftFilePreview = ref('');
const nftFileName = ref('');

// 表单错误信息
const errors = ref({
	collectionName: '',
	description: '',
	supply: '',
	file: '',
	name: '',
	symbol: '',
	attributes: '',
	collection_id: '',
	nft_contract_address: '',
	address: '',
});

// 发送结果
const sendResult = ref('');

const resetCollectionForm = () => {
	collectionForm.value = createDefaultCollectionForm();
	filePreview.value = '';
	fileName.value = '';
	errors.value.collectionName = '';
	errors.value.description = '';
	errors.value.supply = '';
	errors.value.file = '';
};

const resetNftCreateForm = () => {
	nftCreateForm.value = createDefaultNftCreateForm();
	nftFilePreview.value = '';
	nftFileName.value = '';
	errors.value.name = '';
	errors.value.description = '';
	errors.value.file = '';
	errors.value.collection_id = '';
};

const resetNftTransferForm = () => {
	nftTransferForm.value = createDefaultNftTransferForm();
	errors.value.nft_contract_address = '';
	errors.value.address = '';
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
	throw new Error('Turing.sendTransaction method not found. Please ensure window.Turing.sendTransaction is available');
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
		const supplyNum = typeof supplyValue === 'string' ? Number(supplyValue.trim()) : Number(supplyValue);
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
	
	// 验证 file
	if (!nftCreateForm.value.file || !nftCreateForm.value.file.trim()) {
		errors.value.file = 'File is required';
		isValid = false;
	} else {
		errors.value.file = '';
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

// NFT_TRANSFER 表单验证
const validateNftTransferForm = (): boolean => {
	let isValid = true;
	
	// 验证 nft_contract_address
	if (!nftTransferForm.value.nft_contract_address || !nftTransferForm.value.nft_contract_address.trim()) {
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

// COLLECTION_CREATE 表单验证状态
const isCollectionFormValid = computed(() => {
	const supplyValue = collectionForm.value.supply;
	const hasValidSupply = supplyValue !== null && supplyValue !== undefined && supplyValue !== '' && !isNaN(Number(supplyValue));
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

// NFT_CREATE 表单验证状态
const isNftCreateFormValid = computed(() => {
	return (
		nftCreateForm.value.name.trim() &&
		nftCreateForm.value.description.trim() &&
		nftCreateForm.value.file.trim() &&
		nftCreateForm.value.collection_id.trim() &&
		!errors.value.name &&
		!errors.value.description &&
		!errors.value.file &&
		!errors.value.collection_id
	);
});

// NFT_TRANSFER 表单验证状态
const isNftTransferFormValid = computed(() => {
	return (
		nftTransferForm.value.nft_contract_address.trim() &&
		nftTransferForm.value.address.trim() &&
		!errors.value.nft_contract_address &&
		!errors.value.address
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
		const supplyNum = typeof supplyValue === 'string' ? Number(supplyValue.trim()) : Number(supplyValue);
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
		
		console.log('COLLECTION_CREATE Generated Data:', params);
		
		// 调用 sendTransaction
		const response = await sendTransaction(params);
		
		// 提取 txid
		const txid = extractTxid(response);
		
		// 记录历史
		if (txid && walletInfo.value.curAddress) {
			addTransactionHistory('COLLECTION_CREATE', txid, response, params, walletInfo.value.curAddress);
		}
		
		// 格式化返回结果并显示
		sendResult.value = JSON.stringify(response, null, 2);
		toastApi.showSuccess('COLLECTION_CREATE transaction sent successfully', 3000);
		resetCollectionForm();
	} catch (error) {
		console.error('COLLECTION_CREATE transaction error:', error);
		const errorMsg = error instanceof Error ? error.message : 'Failed to send COLLECTION_CREATE transaction';
		toastApi.showError(errorMsg, 3000);
		sendResult.value = '';
	} finally {
		isSubmitting.value = false;
	}
};

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
			file: nftCreateForm.value.file.trim(),
			symbol: nftCreateForm.value.name.trim(),
			attributes: nftCreateForm.value.name.trim(),
		};
		
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
		
		console.log('NFT_CREATE Generated Data:', params);
		
		// 调用 sendTransaction
		const response = await sendTransaction(params);
		
		// 提取 txid
		const txid = extractTxid(response);
		
		// 记录历史
		if (txid && walletInfo.value.curAddress) {
			addTransactionHistory('NFT_CREATE', txid, response, params, walletInfo.value.curAddress);
		}
		
		// 格式化返回结果并显示
		sendResult.value = JSON.stringify(response, null, 2);
		toastApi.showSuccess('NFT_CREATE transaction sent successfully', 3000);
		resetNftCreateForm();
	} catch (error) {
		console.error('NFT_CREATE transaction error:', error);
		const errorMsg = error instanceof Error ? error.message : 'Failed to send NFT_CREATE transaction';
		toastApi.showError(errorMsg, 3000);
		sendResult.value = '';
	} finally {
		isSubmitting.value = false;
	}
};

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
		
		console.log('NFT_TRANSFER Generated Data:', params);
		
		// 调用 sendTransaction
		const response = await sendTransaction(params);
		
		// 提取 txid
		const txid = extractTxid(response);
		
		// 记录历史
		if (txid && walletInfo.value.curAddress) {
			addTransactionHistory('NFT_TRANSFER', txid, response, params, walletInfo.value.curAddress);
		}
		
		// 格式化返回结果并显示
		sendResult.value = JSON.stringify(response, null, 2);
		toastApi.showSuccess('NFT_TRANSFER transaction sent successfully', 3000);
		resetNftTransferForm();
	} catch (error) {
		console.error('NFT_TRANSFER transaction error:', error);
		const errorMsg = error instanceof Error ? error.message : 'Failed to send NFT_TRANSFER transaction';
		toastApi.showError(errorMsg, 3000);
		sendResult.value = '';
	} finally {
		isSubmitting.value = false;
	}
};

// 实时验证 - COLLECTION_CREATE
watch(() => collectionForm.value.collectionName, () => {
	if (!collectionForm.value.collectionName || !collectionForm.value.collectionName.trim()) {
		errors.value.collectionName = 'Collection Name is required';
	} else {
		errors.value.collectionName = '';
	}
});

watch(() => collectionForm.value.description, () => {
	if (!collectionForm.value.description || !collectionForm.value.description.trim()) {
		errors.value.description = 'Description is required';
	} else {
		errors.value.description = '';
	}
});

watch(() => collectionForm.value.supply, () => {
	const supplyValue = collectionForm.value.supply;
	if (supplyValue === null || supplyValue === undefined || supplyValue === '') {
		errors.value.supply = 'Supply is required';
	} else {
		const supplyNum = typeof supplyValue === 'string' ? Number(supplyValue.trim()) : Number(supplyValue);
		if (isNaN(supplyNum) || supplyNum <= 0) {
			errors.value.supply = 'Supply must be a positive number';
		} else if (!Number.isInteger(supplyNum)) {
			errors.value.supply = 'Supply must be an integer';
		} else {
			errors.value.supply = '';
		}
	}
});

// 实时验证 - NFT_CREATE
watch(() => nftCreateForm.value.name, () => {
	if (!nftCreateForm.value.name || !nftCreateForm.value.name.trim()) {
		errors.value.name = 'NFT Name is required';
	} else {
		errors.value.name = '';
	}
});

watch(() => nftCreateForm.value.description, () => {
	if (!nftCreateForm.value.description || !nftCreateForm.value.description.trim()) {
		errors.value.description = 'Description is required';
	} else {
		errors.value.description = '';
	}
});

watch(() => nftCreateForm.value.collection_id, () => {
	if (!nftCreateForm.value.collection_id || !nftCreateForm.value.collection_id.trim()) {
		errors.value.collection_id = 'Collection ID is required';
	} else {
		errors.value.collection_id = '';
	}
});

// 实时验证 - NFT_TRANSFER
watch(() => nftTransferForm.value.nft_contract_address, () => {
	if (!nftTransferForm.value.nft_contract_address || !nftTransferForm.value.nft_contract_address.trim()) {
		errors.value.nft_contract_address = 'NFT Contract Address is required';
	} else {
		errors.value.nft_contract_address = '';
	}
});

watch(() => nftTransferForm.value.address, () => {
	if (!nftTransferForm.value.address || !nftTransferForm.value.address.trim()) {
		errors.value.address = 'Recipient Address is required';
	} else {
		errors.value.address = '';
	}
});

// 切换功能时清空结果
watch(currentFunction, () => {
	sendResult.value = '';
});

// 检查钱包连接状态
onMounted(async () => {
	await getWalletInfo();
});
</script>

<style scoped>
@import '../../assets/form-page.css';

.page-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: var(--spacing-lg);
}

.history-link {
	display: flex;
	align-items: center;
	gap: var(--spacing-xs);
	padding: var(--spacing-xs) var(--spacing-sm);
	border-radius: var(--radius-sm);
	background-color: var(--form-bg-color);
	border: 1px solid var(--form-border-color);
	color: var(--color-primary);
	text-decoration: none;
	font-size: var(--font-size-subtitle);
	transition: all 0.2s ease;
}

.history-link:hover {
	background-color: var(--color-primary);
	color: white;
	border-color: var(--color-primary);
}

.history-link svg {
	flex-shrink: 0;
}

.function-toggle {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: var(--spacing-sm);
	margin-bottom: var(--spacing-lg);
	background-color: var(--form-bg-color);
	border: 1px solid var(--form-border-color);
	border-radius: var(--radius-md);
	padding: var(--spacing-xs);
	width: 100%;
	box-sizing: border-box;
}

.toggle-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	padding: var(--spacing-sm) var(--spacing-md);
	border: none;
	border-radius: var(--radius-sm);
	background-color: transparent;
	color: var(--color-text-secondary);
	font-size: var(--font-size-subtitle);
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	white-space: nowrap;
}

.toggle-btn:hover {
	color: var(--color-primary);
	background-color: rgba(255, 140, 1, 0.1);
}

.toggle-btn.active {
	background-color: var(--color-primary);
	color: white;
	font-weight: 600;
}

.toggle-btn-text-short {
	display: none;
}

.required {
	color: var(--color-error);
	font-weight: 600;
}

/* Input styled like textarea */
.form-item-input-textarea {
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

.form-item-input-textarea:focus {
	outline: none;
	border-color: var(--color-primary);
	box-shadow: 0 0 0 2px rgba(255, 140, 0, 0.1);
}

.form-item-input-textarea:disabled {
	background-color: var(--form-btn-disabled-color);
	color: var(--color-text-secondary);
	cursor: not-allowed;
	opacity: 0.6;
}

.form-item-input-textarea:read-only {
	background-color: var(--form-item-bg-color);
	cursor: default;
	opacity: 0.9;
}

.form-item-input-textarea::placeholder {
	color: var(--color-text-tertiary);
	opacity: 0.6;
}

/* File input styles */
.form-item-file-input {
	width: 100%;
	padding: var(--spacing-xs);
	border-radius: var(--radius-sm);
	border: 1px solid var(--form-border-color);
	background-color: var(--form-item-bg-color);
	color: var(--color-text-primary);
	font-size: var(--font-size-subtitle);
	box-sizing: border-box;
	transition: all 0.2s ease;
	cursor: pointer;
}

.form-item-file-input:focus {
	outline: none;
	border-color: var(--color-primary);
	box-shadow: 0 0 0 2px rgba(255, 140, 0, 0.1);
}

.file-preview {
	margin-top: var(--spacing-xs);
	padding: var(--spacing-xs);
	border: 1px solid var(--form-border-color);
	border-radius: var(--radius-sm);
	background-color: var(--form-item-bg-color);
}

.file-preview-image {
	max-width: 100%;
	max-height: 200px;
	border-radius: var(--radius-sm);
	object-fit: contain;
}

.file-preview-text {
	margin-top: var(--spacing-xs);
	font-size: var(--font-size-small);
	color: var(--color-text-secondary);
}

/* 移动端响应式优化 */
@media (max-width: 768px) {
	.function-toggle {
		display: flex;
		gap: var(--spacing-xs);
		padding: var(--spacing-xs);
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		scroll-snap-type: x proximity;
	}
	
	.toggle-btn {
		flex: 1;
		padding: var(--spacing-xs) var(--spacing-sm);
		font-size: var(--font-size-small);
		font-weight: 500;
		scroll-snap-align: start;
	}
	
	.toggle-btn-text-full {
		display: none;
	}
	
	.toggle-btn-text-short {
		display: inline;
	}
	
	.page-header {
		flex-direction: column;
		gap: var(--spacing-sm);
		align-items: flex-start;
	}
	
	.history-link {
		width: 100%;
		justify-content: center;
	}
}

@media (max-width: 480px) {
	.function-toggle {
		gap: 4px;
		padding: 4px;
	}
	
	.toggle-btn {
		flex: 1;
		padding: 8px 6px;
		font-size: 10px;
		font-weight: 500;
		letter-spacing: -0.2px;
		min-width: 0;
	}
	
	.page-title {
		font-size: 1.5rem;
	}
	
	.page-description {
		font-size: var(--font-size-small);
	}
}
</style>