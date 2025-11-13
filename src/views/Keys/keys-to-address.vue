<template>
	<div class="message-signing-page">
		<!-- page header -->
		<h2 class="page-title">Random Key Generator</h2>
		<p class="page-description">Generate random mnemonic, private key, public key, and address.</p>
		<div class="form-container">
			<!-- generate form -->
			<div class="msg-form">
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
						<span>Generate Keys</span>
					</div>
					<p class="msg-form-description">Click the button below to generate random mnemonic, private key, public key, and address</p>
				</div>
				<!-- generate button -->
				<div class="form-item-btn-container">
					<button
						class="form-button-submit"
						@click.stop="handleGenerateKeys"
						type="button"
						:disabled="isGenerating"
					>
						<span v-if="isGenerating">Generating...</span>
						<span v-else>Generate Random Keys</span>
					</button>
				</div>
			</div>
			<!-- results -->
			<div v-if="mnemonic || privateKey || publicKey || address" class="msg-form msg-result">
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
						<span>Generated Results</span>
					</div>
				</div>
				<!-- mnemonic -->
				<div class="form-item">
					<label>Mnemonic</label>
					<MyTextarea
						v-model="mnemonic"
						placeholder="Mnemonic will be displayed here"
						:readonly="true"
						:copyable="true"
						:deletable="false"
					/>
				</div>
				<!-- private key -->
				<div class="form-item">
					<label>Private Key</label>
					<MyTextarea
						v-model="privateKey"
						placeholder="Private key will be displayed here"
						:readonly="true"
						:copyable="true"
						:deletable="false"
					/>
				</div>
				<!-- public key -->
				<div class="form-item">
					<label>Public Key</label>
					<MyTextarea
						v-model="publicKey"
						placeholder="Public key will be displayed here"
						:readonly="true"
						:copyable="true"
						:deletable="false"
					/>
				</div>
				<!-- address -->
				<div class="form-item">
					<label>Address</label>
					<MyTextarea
						v-model="address"
						placeholder="Address will be displayed here"
						:readonly="true"
						:copyable="true"
						:deletable="false"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from '../../utils/useToast';
import { useWalletStore } from '../../stores/wallet';
import MyTextarea from '../../components/m-textarea.vue';
import * as tbc from 'tbc-lib-js';

// 钱包状态管理
const walletStore = useWalletStore();
const { getWalletInfo } = walletStore;

// 消息提示
const toastApi = useToast();

// 提交状态
const isGenerating = ref(false);

// 生成的数据
const mnemonic = ref('');
const privateKey = ref('');
const publicKey = ref('');
const address = ref('');

// 生成随机密钥
const handleGenerateKeys = async () => {
	isGenerating.value = true;
	
	try {
		// 1. 生成随机助记词
		const mnemonicObj = tbc.Mnemonic.fromRandom();
		const mnemonicPhrase = mnemonicObj.toString();
		mnemonic.value = mnemonicPhrase;
		
		// 2. 从助记词生成 HD 私钥 (使用空密码和主网)
		// 使用 BIP44 路径 m/44'/0'/0'/0/0
		const seed = mnemonicObj.toSeed();
		const masterKey = tbc.HDPrivateKey.fromSeed(seed, tbc.Networks.livenet);
		
		// 派生路径 m/44'/0'/0'/0/0 (BIP44)
		// 44' (hardened)
		let derivedKey = masterKey.deriveChild(44, true);
		// 0' (hardened)
		derivedKey = derivedKey.deriveChild(0, true);
		// 0' (hardened)
		derivedKey = derivedKey.deriveChild(0, true);
		// 0 (not hardened)
		derivedKey = derivedKey.deriveChild(0, false);
		// 0 (not hardened)
		derivedKey = derivedKey.deriveChild(0, false);
		
		const privKey = derivedKey.privateKey;
		
		// 3. 从私钥生成公钥
		const pubKey = privKey.toPublicKey();
		
		// 4. 从公钥生成地址
		const addr = pubKey.toAddress().toString();
		
		// 设置结果
		privateKey.value = privKey.toString();
		publicKey.value = pubKey.toString();
		address.value = addr;
		
		toastApi.showSuccess('Keys generated successfully', 3000);
	} catch (error) {
		console.error('Generate keys error:', error);
		toastApi.showError('Failed to generate keys: ' + (error as Error).message, 3000);
		// 清空结果
		mnemonic.value = '';
		privateKey.value = '';
		publicKey.value = '';
		address.value = '';
	} finally {
		isGenerating.value = false;
	}
};

// 检查钱包连接状态
onMounted(async () => {
	await getWalletInfo();
});
</script>

<style scoped>
@import '../../assets/form-page.css';
.msg-result {
	margin-top: var(--spacing-md);
}
</style>