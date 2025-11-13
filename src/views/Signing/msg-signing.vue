<template>
	<div class="message-signing-page">
		<!-- 页面头部 -->
		<h2 class="page-title">Message Signing</h2>
		<p class="page-description">
			Please enter the message you want to sign and select the encoding type.
		</p>

		<!-- 签名表单 -->
		<form class="msg-form" @submit.prevent="handleSignMessage">
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
					<span>Message Form</span>
				</div>
				<p class="msg-form-description">Enter the message you want to sign</p>
			</div>

			<!-- 编码类型选择 -->
			<div class="form-item">
				<label>Encoding Type</label>
				<div class="custom-select" @click.stop="toggleDropdown">
					<div class="select-trigger">
						<span>{{ selectedOption.label }}</span>
					</div>
					<svg
						class="select-arrow"
						:class="{ 'rotate-180': isOpen }"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M7 10L12 15L17 10"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					<transition name="fade">
						<div class="select-dropdown" v-if="isOpen">
							<div
								class="dropdown-option"
								v-for="option in options"
								:key="option.value"
								@click.stop="selectOption(option)"
							>
								{{ option.label }}
								<svg
									v-if="selectedOption.value === option.value"
									class="check-icon"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M20 6L9 17L4 12"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</div>
						</div>
					</transition>
				</div>
			</div>

			<!-- 消息输入框（替换为封装组件） -->
			<div class="form-item">
				<label for="message">Message</label>
				<MyTextarea
					v-model="signMessage"
					placeholder="Please input message to sign"
					:readonly="false"
					:copyable="true"
					:deletable="true"
				/>
			</div>
			<div class="form-item-btn-container">
				<button
					class="form-button-submit"
					@click.stop="handleSignMessage"
					type="button"
					:disabled="!signMessage.trim() || isSubmitting"
				>
					<span v-if="isSubmitting">Signing...</span>
					<span v-else>Sign Message</span>
				</button>
			</div>
		</form>

		<!-- 签名结果区域（替换为封装组件） -->
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
					<span>Message Signed Result</span>
				</div>
			</div>
			<MyTextarea
				v-model="signedMessage"
				placeholder="Message signed result will be displayed here"
				:readonly="true"
				:copyable="true"
				:deletable="false"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from '../../utils/useToast';
import { useWalletStore } from '../../stores/wallet';
import MyTextarea from '@/components/m-textarea.vue'; // 导入封装的Textarea组件

// 钱包状态管理
const walletStore = useWalletStore();
const { getWalletInfo } = walletStore;

// 消息提示
const toastApi = useToast();

// 提交状态
const isSubmitting = ref(false);

// 编码类型选项
const options = [
	{ label: 'UTF-8', value: 'utf-8' },
	{ label: 'Hex', value: 'hex' },
	{ label: 'Base64', value: 'base64' },
];

// 状态管理
const signMessage = ref('');
const signedMessage = ref('');
const selectedOption = ref<{ label: string; value: string }>(
	options[0] ?? { label: 'UTF-8', value: 'utf-8' },
);
const isOpen = ref(false);

// 切换下拉菜单
const toggleDropdown = () => {
	isOpen.value = !isOpen.value;
};

// 选择下拉选项
const selectOption = (option: { label: string; value: string }) => {
	selectedOption.value = option;
	isOpen.value = false;
};

// 签名消息逻辑
const handleSignMessage = async () => {
	if (!signMessage.value) {
		toastApi.showError('Please enter a message to sign', 3000);
		return;
	}
	
	isSubmitting.value = true;
	
	try {
		const response = await window.Turing.signMessage({
			message: signMessage.value,
			encoding: selectedOption.value.value,
		});
		const formattedResponse = JSON.stringify(response, null, 2);
		signedMessage.value = formattedResponse;
		toastApi.showSuccess('Message signed successfully', 3000);
	} catch (error) {
		console.error('Sign message error:', error);
		toastApi.showError('Failed to sign message', 3000);
		signedMessage.value = '';
	} finally {
		isSubmitting.value = false;
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
