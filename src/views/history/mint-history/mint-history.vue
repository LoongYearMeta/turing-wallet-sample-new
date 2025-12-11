<template>
	<div class="history-records-page">
		<div class="page-header">
			<h2>Mint History</h2>
			<button v-if="historyList.length > 0" @click="handleClearAll" class="clear-btn">
				Clear History
			</button>
		</div>

		<div v-if="historyList.length > 0" class="search-section">
			<div class="search-box">
				<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="11" cy="11" r="8"></circle>
					<path d="m21 21-4.35-4.35"></path>
				</svg>
				<input
					v-model="searchKeyword"
					type="text"
					placeholder="Search by method (e.g., FT_MINT, NFT_CREATE...)"
					class="search-input"
				/>
				<button
					v-if="searchKeyword"
					@click="clearSearch"
					class="clear-search-btn"
					title="Clear search"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>
			<div v-if="searchKeyword" class="search-result-info">
				Found {{ filteredHistoryList.length }} result{{ filteredHistoryList.length !== 1 ? 's' : '' }}
				{{ searchKeyword ? `for "${searchKeyword}"` : '' }}
			</div>
		</div>

		<div v-if="filteredHistoryList.length === 0" class="empty-state">
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
			<p v-if="!searchKeyword">No mint history yet</p>
			<p v-else>No results found</p>
			<p class="empty-hint" v-if="!searchKeyword">Mint records will appear here after mint transactions</p>
			<p class="empty-hint" v-else>Try adjusting your search keyword</p>
		</div>

		<div v-else class="history-list">
			<div v-for="item in filteredHistoryList" :key="item.txid" class="history-item">
				<div class="history-item-header">
					<div class="history-item-meta">
						<span class="history-method">{{ item.type }}</span>
						<span class="history-time">{{ formatTime(item.timestamp) }}</span>
					</div>
					<button
						@click="toggleExpand(item.txid)"
						class="expand-btn"
						:class="{ expanded: expandedItems.has(item.txid) }"
					>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="6 9 12 15 18 9"></polyline>
						</svg>
					</button>
				</div>

				<div class="history-item-content">
					<div class="history-field">
						<label>
							<span class="copy-btn" @click="copyTxid(item.txid)">copy</span>
							TXID:
						</label>
						<div class="history-value txid-value">{{ item.txid || 'N/A' }}</div>
					</div>

					<div v-if="expandedItems.has(item.txid)" class="history-details">
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
import { computed, onMounted, onUnmounted, ref } from 'vue';
// @ts-ignore - Vue SFC default export typing
import MyTextarea from '../../../components/m-textarea.vue';
import {
	clearMintHistory,
	getMintHistory,
	type MintHistoryItem,
} from '../../../utils/mintHistory';
import { useToast } from '../../../utils/useToast';

const toastApi = useToast();

const historyList = ref<MintHistoryItem[]>([]);
const searchKeyword = ref('');
const expandedItems = ref<Set<string>>(new Set());

const loadHistory = () => {
	historyList.value = getMintHistory();
	expandedItems.value.clear();
};

const filteredHistoryList = computed(() => {
	if (!searchKeyword.value.trim()) {
		return historyList.value;
	}
	const keyword = searchKeyword.value.trim().toLowerCase();
	return historyList.value.filter((item: MintHistoryItem) => {
		return item.type.toLowerCase().includes(keyword);
	});
});

const clearSearch = () => {
	searchKeyword.value = '';
};

const toggleExpand = (txid: string) => {
	if (expandedItems.value.has(txid)) {
		expandedItems.value.delete(txid);
	} else {
		expandedItems.value.add(txid);
	}
};

const handleClearAll = () => {
	if (historyList.value.length === 0) return;
	if (confirm('Are you sure you want to clear all mint history?')) {
		clearMintHistory();
		loadHistory();
		toastApi.showSuccess('Mint history cleared', 2000);
	}
};

const copyTxid = (txid: string) => {
	if (!txid) return;
	navigator.clipboard.writeText(txid);
	toastApi.showSuccess('TXID copied to clipboard', 2000);
};

const formatTime = (timestamp: number): string => {
	const date = new Date(timestamp);
	const now = new Date();
	const diff = now.getTime() - date.getTime();

	if (diff < 60000) {
		return 'Just now';
	}

	if (diff < 3600000) {
		const minutes = Math.floor(diff / 60000);
		return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
	}

	if (diff < 86400000) {
		const hours = Math.floor(diff / 3600000);
		return `${hours} hour${hours > 1 ? 's' : ''} ago`;
	}

	if (diff < 604800000) {
		const days = Math.floor(diff / 86400000);
		return `${days} day${days > 1 ? 's' : ''} ago`;
	}

	return date.toLocaleString();
};

const handleStorageChange = (e: StorageEvent) => {
	if (e.key === 'mint_history_global') {
		loadHistory();
	}
};

onMounted(() => {
	loadHistory();
	window.addEventListener('storage', handleStorageChange);
});

onUnmounted(() => {
	window.removeEventListener('storage', handleStorageChange);
});
</script>

<style scoped>
@import '../../../assets/form-page.css';

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

.copy-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	color: var(--color-primary);
	font-size: var(--font-size-small);
	cursor: pointer;
	border: 1px solid var(--color-primary);
	padding: 4px 6px;
	border-radius: 6px;
	background-color: #432d15;
	transition: all 0.3s ease;
	line-height: 1;
}
.copy-btn:hover {
	background-color: #ec8304;
	color: white;
}

.search-section {
	margin-bottom: var(--spacing-lg);
}

.search-box {
	position: relative;
	display: flex;
	align-items: center;
	background-color: var(--form-bg-color);
	border: 1px solid var(--form-border-color);
	border-radius: var(--radius-md);
	padding: var(--spacing-sm) var(--spacing-md);
	transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-box:focus-within {
	border-color: var(--color-primary);
	box-shadow: 0 0 0 2px rgba(236, 131, 4, 0.1);
}

.search-icon {
	width: 20px;
	height: 20px;
	color: var(--color-text-secondary);
	margin-right: var(--spacing-sm);
	flex-shrink: 0;
}

.search-input {
	flex: 1;
	border: none;
	outline: none;
	background: transparent;
	color: var(--color-text-primary);
	font-size: var(--font-size-subtitle);
	padding: 0;
}

.search-input::placeholder {
	color: var(--color-text-secondary);
	opacity: 0.6;
}

.clear-search-btn {
	background: none;
	border: none;
	cursor: pointer;
	color: var(--color-text-secondary);
	padding: var(--spacing-xs);
	display: flex;
	align-items: center;
	justify-content: center;
	transition: color 0.2s ease;
	margin-left: var(--spacing-xs);
	flex-shrink: 0;
}

.clear-search-btn:hover {
	color: var(--color-text-primary);
}

.clear-search-btn svg {
	width: 18px;
	height: 18px;
}

.search-result-info {
	margin-top: var(--spacing-sm);
	color: var(--color-text-secondary);
	font-size: var(--font-size-small);
}
</style>

