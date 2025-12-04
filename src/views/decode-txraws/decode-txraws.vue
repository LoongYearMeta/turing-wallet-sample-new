<template>
	<div class="message-signing-page">
		<!-- header -->
		<h2 class="page-title">Decode Txraws</h2>
		<p class="page-description">Please enter a txraw you want to decode.</p>
		<!-- form -->
		<form class="msg-form" @submit.prevent="handleDecodeTxraws">
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
					<span>Txraw Form</span>
				</div>
				<div class="header-actions">
					<!-- 网络选择器 -->
					<div class="network-selector">
						<label class="network-option" :class="{ active: selectedNetwork === 'mainnet' }">
							<input
								type="radio"
								value="mainnet"
								v-model="selectedNetwork"
								@change="handleNetworkChange"
							/>
							<span>mainnet</span>
						</label>
						<label class="network-option" :class="{ active: selectedNetwork === 'testnet' }">
							<input
								type="radio"
								value="testnet"
								v-model="selectedNetwork"
								@change="handleNetworkChange"
							/>
							<span>testnet</span>
						</label>
					</div>
					<!-- <p class="msg-form-description">Enter the txraw you want to decode</p> -->
				</div>
			</div>
			<!-- txraw input textarea -->
			<!-- <div class="form-item"> -->
			<!-- <label for="message">Message</label> -->
			<MyTextarea
				v-model="txraw"
				placeholder="Please input txraw to decode"
				:readonly="false"
				:copyable="true"
				:deletable="true"
				:max-height="300"
			/>
			<!-- </div> -->
			<div class="form-item-btn-container">
				<button
					class="form-button-submit"
					@click.stop="handleDecodeTxraws"
					type="button"
					:disabled="!txraw || isSubmitting"
				>
					<span v-if="isSubmitting">Decoding...</span>
					<span v-else>Decode Txraw</span>
				</button>
			</div>
		</form>
		<!-- txraw detail -->
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
					<span>Txraw Detailed Result</span>
				</div>

				<!-- View File 和 View ASM 按钮 -->
				<div class="header-buttons" v-if="rawDecodedData">
					<button
						v-if="hasNftImage"
						@click="toggleShowFile"
						type="button"
						class="view-file-btn"
						:class="{ active: showFile }"
					>
						{{ showFile ? 'Hide File' : 'View File' }}
					</button>
					<button
						@click="toggleShowAsm"
						type="button"
						class="view-asm-btn"
						:class="{ active: showAsm }"
					>
						{{ showAsm ? 'Hide ASM' : 'View ASM' }}
					</button>
				</div>
			</div>
			<MyTextarea
				v-model="decodedTxrawDetail"
				placeholder="Detailed txraw decoded result will be displayed here"
				:readonly="false"
				:copyable="true"
				:deletable="true"
				:max-height="500"
			/>
			<!-- NFT 图片展示区域 -->
			<div v-if="hasNftImage && showFile" class="nft-image-container">
				<div
					v-for="(imageUrl, index) in nftImageUrls"
					:key="index"
					class="nft-image-item"
				>
					<img :src="imageUrl" :alt="`NFT Image ${index + 1}`" class="nft-image" />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToast } from '../../utils/useToast';
import { useWalletStore } from '../../stores/wallet';
import * as tbc from 'tbc-lib-js';
import MyTextarea from '../../components/m-textarea.vue';
import { decodeTxRawDetail } from '../../utils/decodeTxrawDetails/decodeTxRawDetail';
// import { storeToRefs } from 'pinia'

// 钱包状态管理
const walletStore = useWalletStore();
const { getWalletInfo } = walletStore;

// 消息提示
const toastApi = useToast();

// 提交状态
const isSubmitting = ref(false);

// 状态管理
const txraw = ref('');
const decodedTxraw = ref('');
const decodedTxrawDetail = ref('');
const showAsm = ref(false); // 控制是否显示 ASM
const showFile = ref(false); // 控制是否显示文件（图片）
const rawDecodedData = ref<any>(null); // 保存原始解码数据（包含 asm）
const selectedNetwork = ref<'mainnet' | 'testnet'>('testnet'); // 选中的网络类型

// DECODE TXRAW
const handleDecodeTxraws = async () => {
	if (!txraw.value) {
		// 错误提示
		toastApi.showError('Please enter a txraw to decode', 3000);
		return;
	}

	isSubmitting.value = true;

	try {
		// 从txraw中创建transaction对象
		const transaction = new tbc.Transaction(txraw.value);
		// 将transaction对象转换为JSON对象
		const response = transaction.toObject();
		// 将JSON对象转换为字符串，显示解码后的交易数据
		decodedTxraw.value = JSON.stringify(response, null, 2);

		// 解码详细信息（异步，不阻塞基本解码）
		decodedTxrawDetail.value = 'Decoding detailed information...';
		showAsm.value = false; // 重置 ASM 显示状态
		showFile.value = false; // 重置 File 显示状态
		rawDecodedData.value = null; // 清空原始数据
		try {
			const detailResponse = await decodeTxRawDetail(txraw.value, selectedNetwork.value);
			// 保存原始数据（包含 asm）
			rawDecodedData.value = detailResponse;
			// 根据 showAsm 和 showFile 状态决定是否包含相应字段
			let responseToDisplay = detailResponse;
			if (!showAsm.value) {
				responseToDisplay = removeAsmFields(responseToDisplay);
			}
			if (!showFile.value) {
				responseToDisplay = removeFileFields(responseToDisplay);
			}
			decodedTxrawDetail.value = JSON.stringify(responseToDisplay, null, 2);
		} catch (detailError) {
			console.error('Decode txraw detail error:', detailError);
			decodedTxrawDetail.value = `Failed to decode detailed information: ${
				detailError instanceof Error ? detailError.message : 'Unknown error'
			}`;
			rawDecodedData.value = null;
		}

		// 显示成功提示
		toastApi.showSuccess('Txraw decoded successfully', 3000);
		// 清空txraw输入框
		txraw.value = '';
	} catch (error) {
		console.error('Decode txraw error:', error);
		toastApi.showError('Failed to decode txraw', 3000);
		decodedTxraw.value = '';
		decodedTxrawDetail.value = '';
		rawDecodedData.value = null;
	} finally {
		isSubmitting.value = false;
	}
};

// 切换 ASM 显示状态
const toggleShowAsm = () => {
	showAsm.value = !showAsm.value;
	updateDisplay();
};

// 切换 File 显示状态
const toggleShowFile = () => {
	showFile.value = !showFile.value;
	updateDisplay();
};

// 更新显示内容
const updateDisplay = () => {
	if (rawDecodedData.value) {
		let responseToDisplay = rawDecodedData.value;
		if (!showAsm.value) {
			responseToDisplay = removeAsmFields(responseToDisplay);
		}
		if (!showFile.value) {
			responseToDisplay = removeFileFields(responseToDisplay);
		}
		decodedTxrawDetail.value = JSON.stringify(responseToDisplay, null, 2);
	}
};

// 递归移除对象中的 asm 字段
const removeAsmFields = (obj: any): any => {
	if (obj === null || obj === undefined) {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => removeAsmFields(item));
	}

	if (typeof obj === 'object') {
		const result: any = {};
		for (const key in obj) {
			if (key !== 'asm') {
				result[key] = removeAsmFields(obj[key]);
			}
		}
		return result;
	}

	return obj;
};

// 递归移除对象中的 file 字段（在 nftTape 中）
const removeFileFields = (obj: any): any => {
	if (obj === null || obj === undefined) {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => removeFileFields(item));
	}

	if (typeof obj === 'object') {
		const result: any = {};
		for (const key in obj) {
			if (key === 'nftTape' && obj[key] && typeof obj[key] === 'object') {
				// 保留 nftTape，但移除其中的 file 字段
				const nftTape = { ...obj[key] };
				delete nftTape.file;
				result[key] = removeFileFields(nftTape);
			} else {
				result[key] = removeFileFields(obj[key]);
			}
		}
		return result;
	}

	return obj;
};

// 检测是否有 NFT 图片
const hasNftImage = computed(() => {
	if (!rawDecodedData.value) return false;
	return nftImageUrls.value.length > 0;
});

// 获取所有 NFT 图片 URL
const nftImageUrls = computed(() => {
	const urls: string[] = [];
	if (!rawDecodedData.value) return urls;

	// 递归查找所有 nftTape.file 字段
	const findNftFiles = (obj: any) => {
		if (obj === null || obj === undefined) {
			return;
		}

		if (Array.isArray(obj)) {
			obj.forEach((item) => findNftFiles(item));
			return;
		}

		if (typeof obj === 'object') {
			for (const key in obj) {
				if (key === 'nftTape' && obj[key] && typeof obj[key] === 'object') {
					const nftTape = obj[key];
					if (nftTape.file && typeof nftTape.file === 'string') {
						// 检查是否是有效的 Data URL 格式
						if (nftTape.file.startsWith('data:image/')) {
							urls.push(nftTape.file);
						}
					}
				}
				findNftFiles(obj[key]);
			}
		}
	};

	findNftFiles(rawDecodedData.value);
	return urls;
});

// 处理网络切换
const handleNetworkChange = () => {
	// 如果已有解码数据，重新解码以使用新的网络参数
	if (txraw.value && rawDecodedData.value) {
		// 可以在这里触发重新解码，或者只是更新状态
		// 为了更好的用户体验，我们不清空数据，只在下次解码时使用新网络
	}
};

// 检查钱包连接状态
onMounted(async () => {
	await getWalletInfo();
});
</script>

<style scoped>
@import '../../assets/form-page.css';

.msg-form-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: var(--spacing-md);
}

.header-actions {
	display: flex;
	align-items: center;
	gap: var(--spacing-sm);
	flex-wrap: wrap;
}

.network-selector {
	display: flex;
	align-items: center;
	gap: var(--spacing-xs);
	background-color: var(--form-item-bg-color);
	border: 1px solid var(--form-border-color);
	border-radius: var(--radius-sm);
	padding: 2px;
}

.network-option {
	display: flex;
	align-items: center;
	padding: 4px 12px;
	border-radius: calc(var(--radius-sm) - 2px);
	cursor: pointer;
	transition: all 0.2s ease;
	user-select: none;
	font-size: var(--font-size-small);
	color: var(--color-text-secondary);
	position: relative;
}

.network-option input[type='radio'] {
	position: absolute;
	opacity: 0;
	width: 0;
	height: 0;
}

.network-option span {
	pointer-events: none;
}

.network-option:hover {
	color: var(--color-text-primary);
	background-color: var(--form-item-bg-hover-color);
}

.network-option.active {
	color: var(--color-text-primary);
	background-color: var(--color-primary);
	border-color: var(--color-primary);
}

.header-buttons {
	display: flex;
	gap: var(--spacing-xs);
	align-items: center;
}

.view-file-btn,
.view-asm-btn {
	padding: 6px 12px;
	border-radius: var(--radius-sm);
	border: 1px solid var(--color-primary);
	background-color: var(--form-btn-primary-color);
	color: var(--color-primary);
	font-size: var(--font-size-small);
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	white-space: nowrap;
	user-select: none;
}

.view-file-btn:hover,
.view-asm-btn:hover {
	color: var(--color-text-primary);
	background-color: var(--color-primary);
	border-color: var(--color-primary);
	transform: translateY(-1px);
	box-shadow: var(--shadow-sm);
}

.view-file-btn:active,
.view-asm-btn:active {
	transform: translateY(0);
	box-shadow: none;
}

.view-file-btn.active,
.view-asm-btn.active {
	color: var(--color-text-primary);
	background-color: var(--color-primary);
	border-color: var(--color-primary);
}

.nft-image-container {
	margin-top: var(--spacing-md);
	padding: var(--spacing-md);
	background-color: var(--form-bg-color);
	border: 1px solid var(--form-border-color);
	border-radius: var(--radius-md);
	display: flex;
	flex-wrap: wrap;
	gap: var(--spacing-md);
}

.nft-image-item {
	flex: 0 0 auto;
	max-width: 100%;
}

.nft-image {
	max-width: 100%;
	max-height: 500px;
	width: auto;
	height: auto;
	border-radius: var(--radius-sm);
	box-shadow: var(--shadow-sm);
	object-fit: contain;
}

@media (max-width: 768px) {
	.msg-form-header {
		align-items: flex-start;
		gap: var(--spacing-xs);
	}

	.header-actions {
		justify-content: space-between;
	}

	.network-selector {
		flex: 1;
		min-width: 0;
	}

	.network-option {
		flex: 1;
		justify-content: center;
		padding: 4px 8px;
		font-size: var(--font-size-tiny);
	}

	.header-buttons {
		flex-wrap: wrap;
		gap: var(--spacing-xs);
	}

	.view-file-btn,
	.view-asm-btn {
		flex-shrink: 0;
		font-size: var(--font-size-tiny);
		padding: 4px 8px;
	}

	.nft-image-container {
		padding: var(--spacing-sm);
		gap: var(--spacing-sm);
	}

	.nft-image {
		max-height: 300px;
	}
}
</style>
