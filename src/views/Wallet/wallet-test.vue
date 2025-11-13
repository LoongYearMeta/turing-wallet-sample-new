<template>
	<div class="message-signing-page">
		<!-- header -->
		<h2 class="page-title">Turing Wallet Test</h2>
		<p class="page-description">
			Use the actions below to call Turing wallet APIs and review their responses.
		</p>
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
					<span>Get PubKey Result</span>
				</div>
			</div>
			<div class="form-item-btn-container">
				<button
					class="form-button-submit"
					type="button"
					@click.stop="handleGetPubKey"
					:disabled="isPubKeyLoading"
				>
					<span v-if="isPubKeyLoading">Fetching...</span>
					<span v-else>Get PubKey</span>
				</button>
			</div>
			<MyTextarea
				v-model="pubKey"
				placeholder="PubKey response will be displayed here"
				:readonly="true"
				:copyable="true"
				:deletable="true"
			/>
		</div>
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
					<span>Get Address Result</span>
				</div>
			</div>
			<div class="form-item-btn-container">
				<button
					class="form-button-submit"
					type="button"
					@click.stop="handleGetAddress"
					:disabled="isAddressLoading"
				>
					<span v-if="isAddressLoading">Fetching...</span>
					<span v-else>Get Address</span>
				</button>
			</div>
			<MyTextarea
				v-model="address"
				placeholder="Address response will be displayed here"
				:readonly="true"
				:copyable="true"
				:deletable="true"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from '../../utils/useToast';
import { useWalletStore } from '../../stores/wallet';
import MyTextarea from '../../components/m-textarea.vue';
// import { storeToRefs } from 'pinia'

// 钱包状态管理
const walletStore = useWalletStore();
const { getWalletInfo } = walletStore;

// 消息提示
const toastApi = useToast();

const pubKey = ref('');
const address = ref('');
const isPubKeyLoading = ref(false);
const isAddressLoading = ref(false);

const ensureTuringSdk = (method: 'getPubKey' | 'getAddress') => {
	const turingSdk = (window as any)?.Turing;
	if (!turingSdk || typeof turingSdk[method] !== 'function') {
		throw new Error(`Turing.${method} method not found.`);
	}
	return turingSdk;
};

const handleGetPubKey = async () => {
	isPubKeyLoading.value = true;
	try {
		const turingSdk = ensureTuringSdk('getPubKey');
		const { tbcPubKey } = await turingSdk.getPubKey();
		pubKey.value = tbcPubKey ?? '';
		toastApi.showSuccess('PubKey fetched successfully', 3000);
	} catch (error) {
		console.error('Get PubKey error:', error);
		toastApi.showError('Failed to fetch PubKey', 3000);
		pubKey.value = '';
	} finally {
		isPubKeyLoading.value = false;
	}
};

const handleGetAddress = async () => {
	isAddressLoading.value = true;
	try {
		const turingSdk = ensureTuringSdk('getAddress');
		const { tbcAddress } = await turingSdk.getAddress();
		address.value = tbcAddress ?? '';
		toastApi.showSuccess('Address fetched successfully', 3000);
	} catch (error) {
		console.error('Get Address error:', error);
		toastApi.showError('Failed to fetch Address', 3000);
		address.value = '';
	} finally {
		isAddressLoading.value = false;
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
