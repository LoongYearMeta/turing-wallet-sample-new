<template>
	<div class="message-signing-page">
		<!-- header -->
		<div class="page-header">
			<div>
				<h2 class="page-title">FT Transaction</h2>
				<p class="page-description">Mint or transfer FT tokens using the form below.</p>
			</div>
			<router-link to="/records" class="history-link">
				<svg
					t="1762506088732"
					class="icon"
					viewBox="0 0 1024 1024"
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
				>
					<path
						d="M464.896 134.912c78.848-71.5776 200.192-86.4768 297.5232-36.352 98.5088 50.7904 152.6272 151.4496 137.4208 255.6416-23.04 156.3136-169.3184 247.9616-329.0112 204.7488-25.0368-6.7584-42.2912-3.7376-58.0608 17.2032-18.8928 25.088-41.216 47.9232-62.8736 72.704 9.3184 8.704 16.64 15.1552 23.552 21.8112 33.3824 32.5632 37.5296 70.2464 11.0592 101.0688-25.7536 30.0032-66.56 33.1264-104.8576 7.3216-16.1792-11.0592-32-29.2864-44.544 2.6624 51.0976 58.0608 59.392 90.6752 31.6928 123.1872-29.2864 34.2528-65.536 31.5904-133.8368-10.752-3.6864 2.2528-8.0384 4.4544-12.032 7.2192-41.984 28.672-76.8 28.416-104.2432-1.024-28.4672-30.464-27.8528-68.608 4.3008-105.0624a23307.264 23307.264 0 0 1 276.736-310.1696c20.736-22.6816 22.528-39.7824 9.0112-66.9184C359.2192 322.2528 384 208.4864 464.896 134.912z m193.4336 71.168c-70.0416-9.9328-134.656 36.9152-144.384 104.7552-10.2912 70.4512 38.8608 138.2912 107.2128 148.5824 70.656 10.6496 135.0656-37.5808 145.664-109.056 10.7008-73.3696-34.56-133.4272-108.544-144.2304z"
						fill="#ff8c01"
					></path>
				</svg>
				<span>View History</span>
			</router-link>
		</div>
		
		<!-- Function Toggle -->
		<div class="function-toggle">
			<button
				class="toggle-btn"
				:class="{ active: currentFunction === 'MINT' }"
				@click="currentFunction = 'MINT'"
			>
				FT-MINT
			</button>
			<button
				class="toggle-btn"
				:class="{ active: currentFunction === 'TRANSFER' }"
				@click="currentFunction = 'TRANSFER'"
			>
				FT-TRANSFER
			</button>
		</div>

		<!-- MINT Form -->
		<form v-if="currentFunction === 'MINT'" class="msg-form" @submit.prevent="handleMint">
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
				<label>Name <span class="required">*</span></label>
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
				<label>Symbol <span class="required">*</span></label>
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
				<label>Amount <span class="required">*</span></label>
				<input
					v-model="mintForm.amount"
					type="number"
					placeholder="Please input token amount (max 21,000,000)"
					class="form-item-input-textarea"
					min="1"
					max="21000000"
					step="1"
				/>
				<div v-if="errors.amount" class="form-item-error">{{ errors.amount }}</div>
			</div>
			<!-- decimal display (fixed at 6) -->
			<div class="form-item">
				<label>Decimal</label>
				<input
					type="text"
					value="6 (Fixed)"
					class="form-item-input-textarea"
					readonly
				/>
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

		<!-- TRANSFER Form -->
		<form v-if="currentFunction === 'TRANSFER'" class="msg-form" @submit.prevent="handleTransfer">
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
				<p class="msg-form-description">Enter the contract address, amount, and recipient address to transfer FT tokens</p>
			</div>
			<!-- ft_contract_address input -->
			<div class="form-item">
				<label>FT Contract Address <span class="required">*</span></label>
				<MyTextarea
					v-model="transferForm.ft_contract_address"
					placeholder="Please input FT contract address"
					:readonly="false"
					:copyable="true"
					:deletable="true"
				/>
				<div v-if="errors.ft_contract_address" class="form-item-error">{{ errors.ft_contract_address }}</div>
			</div>
			<!-- ft_amount input -->
			<div class="form-item">
				<label>FT Amount <span class="required">*</span></label>
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
				<label>Recipient Address <span class="required">*</span></label>
				<MyTextarea
					v-model="transferForm.address"
					placeholder="Please input recipient address"
					:readonly="false"
					:copyable="true"
					:deletable="true"
				/>
				<div v-if="errors.address" class="form-item-error">{{ errors.address }}</div>
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
					<span>FT Transaction Result</span>
				</div>
			</div>
			<MyTextarea
				v-model="sendResult"
				placeholder="FT transaction result will be displayed here"
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
import MyTextarea from '../../components/m-textarea.vue';
import { addTransactionHistory, extractTxid } from '../../utils/transactionHistory';

// 钱包状态管理
const walletStore = useWalletStore();
const { getWalletInfo } = walletStore;

// 消息提示
const toastApi = useToast();

// 当前功能类型
const currentFunction = ref<'MINT' | 'TRANSFER'>('MINT');

// 提交状态
const isSubmitting = ref(false);

// MINT 表单数据
const mintForm = ref({
  flag: "FT_MINT",
	name: '',
	symbol: '',
	amount: '',
	decimal: 6, // 固定为6
	domain: '',
});

// TRANSFER 表单数据
const transferForm = ref({
  flag: "FT_TRANSFER",
	ft_contract_address: '',
	ft_amount: '',
	tbc_amount: '',
	address: '',
	domain: '',
});

// 表单错误信息
const errors = ref({
	name: '',
	symbol: '',
	amount: '',
	ft_contract_address: '',
	ft_amount: '',
	tbc_amount: '',
	address: '',
});

// 发送结果
const sendResult = ref('');

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
		const amountNum = typeof amountValue === 'string' ? Number(amountValue.trim()) : Number(amountValue);
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

// MINT 表单验证状态
const isMintFormValid = computed(() => {
	const amountValue = mintForm.value.amount;
	const hasValidAmount = amountValue !== null && amountValue !== undefined && amountValue !== '' && !isNaN(Number(amountValue));
	return (
		mintForm.value.name.trim() &&
		mintForm.value.symbol.trim() &&
		hasValidAmount &&
		!errors.value.name &&
		!errors.value.symbol &&
		!errors.value.amount
	);
});

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
		const amountNum = typeof amountValue === 'string' ? Number(amountValue.trim()) : Number(amountValue);
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
		if (txid) {
			addTransactionHistory('FT_MINT', txid, response, params);
		}
		
		// 格式化返回结果并显示
		sendResult.value = JSON.stringify(response, null, 2);
		toastApi.showSuccess('FT-MINT transaction sent successfully', 3000);
	} catch (error) {
		console.error('FT-MINT transaction error:', error);
		const errorMsg = error instanceof Error ? error.message : 'Failed to send FT-MINT transaction';
		toastApi.showError(errorMsg, 3000);
		sendResult.value = '';
	} finally {
		isSubmitting.value = false;
	}
};

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
		
		console.log('FT-TRANSFER Generated Data:', params);
		
		// 调用 sendTransaction
		const response = await sendTransaction(params);
		
		// 提取 txid
		const txid = extractTxid(response);
		
		// 记录历史
		if (txid) {
			addTransactionHistory('FT_TRANSFER', txid, response, params);
		}
		
		// 格式化返回结果并显示
		sendResult.value = JSON.stringify(response, null, 2);
		toastApi.showSuccess('FT-TRANSFER transaction sent successfully', 3000);
	} catch (error) {
		console.error('FT-TRANSFER transaction error:', error);
		const errorMsg = error instanceof Error ? error.message : 'Failed to send FT-TRANSFER transaction';
		toastApi.showError(errorMsg, 3000);
		sendResult.value = '';
	} finally {
		isSubmitting.value = false;
	}
};

// 实时验证 - MINT
watch(() => mintForm.value.name, () => {
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
});

watch(() => mintForm.value.symbol, () => {
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
});

watch(() => mintForm.value.amount, () => {
	const amountValue = mintForm.value.amount;
	if (amountValue === null || amountValue === undefined || amountValue === '') {
		errors.value.amount = 'Amount is required';
	} else {
		const amountNum = typeof amountValue === 'string' ? Number(amountValue.trim()) : Number(amountValue);
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
});

// 实时验证 - TRANSFER
watch(() => transferForm.value.ft_contract_address, () => {
	if (!transferForm.value.ft_contract_address || !transferForm.value.ft_contract_address.trim()) {
		errors.value.ft_contract_address = 'FT Contract Address is required';
	} else {
		errors.value.ft_contract_address = '';
	}
});

watch(() => transferForm.value.ft_amount, () => {
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
});

watch(() => transferForm.value.tbc_amount, () => {
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
});

watch(() => transferForm.value.address, () => {
	if (!transferForm.value.address || !transferForm.value.address.trim()) {
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
	display: flex;
	gap: var(--spacing-sm);
	margin-bottom: var(--spacing-lg);
	background-color: var(--form-bg-color);
	border: 1px solid var(--form-border-color);
	border-radius: var(--radius-md);
	padding: var(--spacing-xs);
}

.toggle-btn {
	flex: 1;
	padding: var(--spacing-sm) var(--spacing-md);
	border: none;
	border-radius: var(--radius-sm);
	background-color: transparent;
	color: var(--color-text-secondary);
	font-size: var(--font-size-subtitle);
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
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
</style>
