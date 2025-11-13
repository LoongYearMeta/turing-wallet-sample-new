<template>
	<div class="history-records-page">
		<div class="page-header">
			<h2>Transaction History</h2>
			<button v-if="historyList.length > 0" @click="handleClearHistory" class="clear-btn">
				Clear History
			</button>
		</div>
		
		<div v-if="historyList.length === 0" class="empty-state">
			<svg
				t="1762506088732"
				class="icon empty-icon"
				viewBox="0 0 1024 1024"
				version="1.1"
				xmlns="http://www.w3.org/2000/svg"
				width="64"
				height="64"
			>
				<path
					d="M464.896 134.912c78.848-71.5776 200.192-86.4768 297.5232-36.352 98.5088 50.7904 152.6272 151.4496 137.4208 255.6416-23.04 156.3136-169.3184 247.9616-329.0112 204.7488-25.0368-6.7584-42.2912-3.7376-58.0608 17.2032-18.8928 25.088-41.216 47.9232-62.8736 72.704 9.3184 8.704 16.64 15.1552 23.552 21.8112 33.3824 32.5632 37.5296 70.2464 11.0592 101.0688-25.7536 30.0032-66.56 33.1264-104.8576 7.3216-16.1792-11.0592-32-29.2864-44.544 2.6624 51.0976 58.0608 59.392 90.6752 31.6928 123.1872-29.2864 34.2528-65.536 31.5904-133.8368-10.752-3.6864 2.2528-8.0384 4.4544-12.032 7.2192-41.984 28.672-76.8 28.416-104.2432-1.024-28.4672-30.464-27.8528-68.608 4.3008-105.0624a23307.264 23307.264 0 0 1 276.736-310.1696c20.736-22.6816 22.528-39.7824 9.0112-66.9184C359.2192 322.2528 384 208.4864 464.896 134.912z m193.4336 71.168c-70.0416-9.9328-134.656 36.9152-144.384 104.7552-10.2912 70.4512 38.8608 138.2912 107.2128 148.5824 70.656 10.6496 135.0656-37.5808 145.664-109.056 10.7008-73.3696-34.56-133.4272-108.544-144.2304z"
					fill="#ff8c01"
					opacity="0.3"
				></path>
			</svg>
			<p>No transaction history yet</p>
			<p class="empty-hint">Transaction records will appear here after you send transactions</p>
		</div>
		
		<div v-else class="history-list">
			<div
				v-for="(item, index) in historyList"
				:key="index"
				class="history-item"
			>
				<div class="history-item-header">
					<div class="history-item-meta">
						<span class="history-method">{{ item.method }}</span>
						<span class="history-time">{{ formatTime(item.timestamp) }}</span>
					</div>
					<button
						@click="toggleExpand(index)"
						class="expand-btn"
						:class="{ expanded: expandedItems.has(index) }"
					>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="6 9 12 15 18 9"></polyline>
						</svg>
					</button>
				</div>
				
				<div class="history-item-content">
					<div class="history-field">
						<label>TXID:</label>
						<div class="history-value txid-value">{{ item.txid }}</div>
					</div>
					
					<div v-if="expandedItems.has(index)" class="history-details">
						<div class="history-field">
							<label>Request Params:</label>
							<MyTextarea
								:model-value="JSON.stringify(item.requestParams, null, 2)"
								:readonly="true"
								:copyable="true"
								:deletable="false"
								class="history-textarea"
							/>
						</div>
						
						<div class="history-field">
							<label>Response:</label>
							<MyTextarea
								:model-value="JSON.stringify(item.response, null, 2)"
								:readonly="true"
								:copyable="true"
								:deletable="false"
								class="history-textarea"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getTransactionHistory, clearTransactionHistory, type TransactionHistoryItem } from '../../utils/transactionHistory';
import { useToast } from '../../utils/useToast';
import MyTextarea from '../../components/m-textarea.vue';

const toastApi = useToast();

// 历史记录列表
const historyList = ref<TransactionHistoryItem[]>([]);

// 展开的项目索引集合
const expandedItems = ref<Set<number>>(new Set());

// 加载历史记录
const loadHistory = () => {
	historyList.value = getTransactionHistory();
};

// 切换展开/收起
const toggleExpand = (index: number) => {
	if (expandedItems.value.has(index)) {
		expandedItems.value.delete(index);
	} else {
		expandedItems.value.add(index);
	}
};

// 清除历史记录
const handleClearHistory = () => {
	if (confirm('Are you sure you want to clear all transaction history?')) {
		clearTransactionHistory();
		historyList.value = [];
		expandedItems.value.clear();
		toastApi.showSuccess('History cleared successfully', 3000);
	}
};

// 格式化时间
const formatTime = (timestamp: number): string => {
	const date = new Date(timestamp);
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	
	// 小于1分钟
	if (diff < 60000) {
		return 'Just now';
	}
	
	// 小于1小时
	if (diff < 3600000) {
		const minutes = Math.floor(diff / 60000);
		return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
	}
	
	// 小于24小时
	if (diff < 86400000) {
		const hours = Math.floor(diff / 3600000);
		return `${hours} hour${hours > 1 ? 's' : ''} ago`;
	}
	
	// 小于7天
	if (diff < 604800000) {
		const days = Math.floor(diff / 86400000);
		return `${days} day${days > 1 ? 's' : ''} ago`;
	}
	
	// 显示完整日期时间
	return date.toLocaleString();
};

// 组件挂载时加载历史记录
onMounted(() => {
	loadHistory();
	
	// 监听 storage 变化（用于跨标签页同步）
	window.addEventListener('storage', (e) => {
		if (e.key === 'transaction_history') {
			loadHistory();
		}
	});
});
</script>

<style scoped>
@import '../../assets/form-page.css';

.history-records-page {
	padding: var(--spacing-lg);
	max-width: 1200px;
	margin: 0 auto;
}

.page-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: var(--spacing-lg);
}

.page-header h2 {
	color: var(--color-text-primary);
	margin: 0;
	font-size: var(--font-size-title);
}

.clear-btn {
	padding: var(--spacing-xs) var(--spacing-sm);
	border-radius: var(--radius-sm);
	background-color: var(--color-error);
	color: white;
	border: none;
	cursor: pointer;
	font-size: var(--font-size-subtitle);
	transition: background-color 0.2s ease;
}

.clear-btn:hover {
	background-color: #d32f2f;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: var(--spacing-xl) var(--spacing-lg);
	text-align: center;
}

.empty-icon {
	margin-bottom: var(--spacing-md);
}

.empty-state p {
	color: var(--color-text-secondary);
	margin: var(--spacing-xs) 0;
	font-size: var(--font-size-subtitle);
}

.empty-hint {
	font-size: var(--font-size-small);
	opacity: 0.7;
}

.history-list {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-md);
}

.history-item {
	background-color: var(--form-bg-color);
	border: 1px solid var(--form-border-color);
	border-radius: var(--radius-md);
	padding: var(--spacing-md);
	transition: box-shadow 0.2s ease;
}

.history-item:hover {
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.history-item-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: var(--spacing-sm);
}

.history-item-meta {
	display: flex;
	align-items: center;
	gap: var(--spacing-sm);
}

.history-method {
	display: inline-block;
	padding: 4px 12px;
	background-color: var(--color-primary);
	color: white;
	border-radius: var(--radius-sm);
	font-size: var(--font-size-small);
	font-weight: 600;
}

.history-time {
	color: var(--color-text-secondary);
	font-size: var(--font-size-small);
}

.expand-btn {
	background: none;
	border: none;
	cursor: pointer;
	color: var(--color-text-secondary);
	padding: var(--spacing-xs);
	display: flex;
	align-items: center;
	justify-content: center;
	transition: transform 0.2s ease, color 0.2s ease;
}

.expand-btn:hover {
	color: var(--color-primary);
}

.expand-btn.expanded {
	transform: rotate(180deg);
}

.expand-btn svg {
	width: 20px;
	height: 20px;
}

.history-item-content {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-sm);
}

.history-field {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xs);
}

.history-field label {
	font-weight: 600;
	color: var(--color-text-primary);
	font-size: var(--font-size-subtitle);
}

.history-value {
	color: var(--color-text-secondary);
	/* font-family: 'Courier New', monospace; */
	font-size: var(--font-size-small);
	word-break: break-all;
	padding: var(--spacing-xs);
	background-color: rgba(0, 0, 0, 0.02);
	border-radius: var(--radius-sm);
}

.txid-value {
	color: var(--color-primary);
	font-weight: 500;
}

.history-details {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-md);
	margin-top: var(--spacing-sm);
	padding-top: var(--spacing-sm);
	border-top: 1px solid var(--form-border-color);
}

.history-textarea {
	font-size: var(--font-size-small);
}
</style>
