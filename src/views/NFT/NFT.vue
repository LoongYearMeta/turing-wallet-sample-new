<template>
	<div class="message-signing-page">
		<!-- header -->
		<div class="page-header">
			<div>
				<h2 class="page-title">NFT Transaction</h2>
				<p class="page-description">
					Create collection, create NFT, or transfer NFT using the form below.
				</p>
			</div>
			<router-link to="/history/records" class="history-link">
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
		<CreateCollectionForm
			v-if="currentFunction === 'COLLECTION_CREATE'"
			@update-result="handleUpdateResult"
		/>

		<!-- NFT_CREATE Form -->
		<CreateNftForm v-if="currentFunction === 'NFT_CREATE'" @update-result="handleUpdateResult" />

		<!-- NFT_TRANSFER Form -->
		<NftTransferForm
			v-if="currentFunction === 'NFT_TRANSFER'"
			@update-result="handleUpdateResult"
		/>

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
import { ref, watch } from 'vue';
import MyTextarea from '../../components/m-textarea.vue';
import CreateCollectionForm from './components/CREATE_COLLECTION.vue';
import CreateNftForm from './components/CREATE_NFT.vue';
import NftTransferForm from './components/NFT_TRANSFER.vue';

// 当前功能类型
const currentFunction = ref<'COLLECTION_CREATE' | 'NFT_CREATE' | 'NFT_TRANSFER'>(
	'COLLECTION_CREATE',
);

// 发送结果
const sendResult = ref('');

// 子表单通过事件更新统一结果
const handleUpdateResult = (result: string) => {
	sendResult.value = result;
};

// 切换功能时清空结果
watch(currentFunction, () => {
	sendResult.value = '';
});
</script>

<style scoped>
@import '../../assets/form-page.css';

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
