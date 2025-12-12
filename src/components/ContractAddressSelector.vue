<template>
	<div class="contract-address-selector">
		<!-- 输入框（使用插槽将地址按钮合并到操作栏） -->
		<MyTextarea
			:model-value="modelValue"
			@update:model-value="handleInput"
			:placeholder="placeholder"
			:readonly="readonly"
			:copyable="true"
			:deletable="true"
			class="selector-input"
		>
			<template #actions>
				<!-- 地址选择按钮 -->
				<button
					@click.stop="toggleDropdown"
					class="selector-dropdown-btn"
					:class="{ active: isDropdownOpen, 'has-addresses': addressList.length > 0 }"
					type="button"
					:disabled="readonly"
					:title="isDropdownOpen ? 'Close address list' : `Open address list (${addressList.length} ${props.allowedSources ? 'matching' : 'cached'})`"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="6 9 12 15 18 9"></polyline>
					</svg>
					<span class="btn-text">{{ props.buttonText }}</span>
					<span v-if="addressList.length > 0" class="btn-badge">{{ addressList.length }}</span>
				</button>
			</template>
		</MyTextarea>

		<!-- 下拉选择框 -->
		<div v-if="isDropdownOpen" class="selector-dropdown" ref="dropdownRef">
			<!-- 搜索框 -->
			<div class="dropdown-search">
				<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="11" cy="11" r="8"></circle>
					<path d="m21 21-4.35-4.35"></path>
				</svg>
				<input
					v-model="searchKeyword"
					type="text"
					placeholder="Search address..."
					class="search-input"
					@keydown.esc="closeDropdown"
					@keydown.enter.prevent="handleEnterKey"
					ref="searchInputRef"
				/>
				<button
					v-if="searchKeyword"
					@click="clearSearch"
					class="clear-search-btn"
					type="button"
					title="Clear search"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>

			<!-- 地址列表 -->
			<div class="dropdown-list">
				<div
					v-for="item in filteredAddressList"
					:key="item.id"
					@click="selectAddress(item)"
					class="dropdown-item"
					:class="{ selected: item.address === modelValue, 'recently-used': item.lastUsed && Date.now() - item.lastUsed < 3600000 }"
				>
					<div class="item-header">
						<div class="item-address">{{ item.address }}</div>
						<button
							v-if="item.address === modelValue"
							@click.stop="emit('update:modelValue', '')"
							class="item-remove-btn"
							type="button"
							title="Clear selection"
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<line x1="18" y1="6" x2="6" y2="18"></line>
								<line x1="6" y1="6" x2="18" y2="18"></line>
							</svg>
						</button>
					</div>
					<div class="item-meta">
						<span class="item-source">{{ item.source }}</span>
						<span class="item-time">{{ formatTime(item.timestamp) }}</span>
					</div>
				</div>
				<div v-if="filteredAddressList.length === 0" class="dropdown-empty">
					<svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="11" cy="11" r="8"></circle>
						<path d="m21 21-4.35-4.35"></path>
					</svg>
					<p v-if="searchKeyword">No addresses found</p>
					<p v-else>No addresses cached yet</p>
					<p v-if="!searchKeyword" class="empty-hint">
						<span v-if="props.allowedSources && props.allowedSources.length > 0">
							Click "Refresh from History" to load addresses from {{ props.allowedSources.join(', ') }}
						</span>
						<span v-else>Click "Refresh from History" to load addresses</span>
					</p>
				</div>
			</div>

			<!-- 操作按钮 -->
			<div class="dropdown-actions">
				<button @click="refreshFromHistory" class="action-btn refresh-btn" type="button">
					Refresh from History
				</button>
				<button
					v-if="filteredAddressList.length > 0"
					@click="clearAll"
					class="action-btn clear-btn"
					type="button"
				>
					Clear All
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import MyTextarea from './m-textarea.vue';
import {
	getContractAddresses,
	updateAddressLastUsed,
	clearContractAddresses,
	rebuildAddressCacheFromHistory,
	findAddressByValue,
	type AddressType,
	type ContractAddressItem,
} from '../utils/contractAddressCache';
import { useWalletStore } from '../stores/wallet';
import { storeToRefs } from 'pinia';

interface Props {
	modelValue: string;
	addressType: AddressType;
	placeholder?: string;
	readonly?: boolean;
	/**
	 * 允许的地址来源交易类型数组
	 * 如果提供，只显示 source 匹配这些交易类型的地址
	 * 例如：['FT_MINT'] 表示只显示来自 FT_MINT 的地址
	 */
	allowedSources?: string[];
	/**
	 * 自定义按钮文本（可选）
	 * 如果不提供，默认显示 "Address"
	 * 例如：对于 Collection ID，可以设置为 "Collection ID"
	 */
	buttonText?: string;
}

const props = withDefaults(defineProps<Props>(), {
	placeholder: 'Please input contract address',
	readonly: false,
	allowedSources: undefined,
	buttonText: 'Address',
});

const emit = defineEmits<{
	'update:modelValue': [value: string];
}>();

// 钱包状态
const walletStore = useWalletStore();
const { walletInfo } = storeToRefs(walletStore);

// 下拉框状态
const isDropdownOpen = ref(false);
const searchKeyword = ref('');
const dropdownRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);

// 地址列表
const addressList = ref<ContractAddressItem[]>([]);

// 加载地址列表
const loadAddressList = () => {
	let addresses = getContractAddresses(props.addressType);
	
	// 如果指定了 allowedSources，则只显示匹配的地址
	if (props.allowedSources && props.allowedSources.length > 0) {
		addresses = addresses.filter((item) => 
			props.allowedSources!.includes(item.source)
		);
	}
	
	addressList.value = addresses;
};

// 过滤后的地址列表
const filteredAddressList = computed(() => {
	if (!searchKeyword.value.trim()) {
		return addressList.value;
	}

	const keyword = searchKeyword.value.trim().toLowerCase();
	return addressList.value.filter((item) => {
		return (
			item.address.toLowerCase().includes(keyword) ||
			item.source.toLowerCase().includes(keyword) ||
			(item.label && item.label.toLowerCase().includes(keyword))
		);
	});
});

// 切换下拉框
const toggleDropdown = () => {
	if (props.readonly) return;
	isDropdownOpen.value = !isDropdownOpen.value;
	if (isDropdownOpen.value) {
		loadAddressList();
		// 聚焦搜索框
		setTimeout(() => {
			searchInputRef.value?.focus();
		}, 100);
	}
};

// 处理 Enter 键（选择第一个匹配的地址）
const handleEnterKey = () => {
	const firstItem = filteredAddressList.value[0];
	if (firstItem) {
		selectAddress(firstItem);
	}
};

// 关闭下拉框
const closeDropdown = () => {
	isDropdownOpen.value = false;
	searchKeyword.value = '';
};

// 选择地址
const selectAddress = (item: ContractAddressItem) => {
	emit('update:modelValue', item.address);
	updateAddressLastUsed(item.id);
	closeDropdown();
};

// 处理输入
const handleInput = (value: string) => {
	emit('update:modelValue', value);
	// 如果输入的是已缓存的地址，更新使用时间
	if (value) {
		const found = findAddressByValue(value, props.addressType);
		if (found) {
			updateAddressLastUsed(found.id);
		}
	}
};

// 清除搜索
const clearSearch = () => {
	searchKeyword.value = '';
};

// 从历史记录刷新（重建缓存）
const refreshFromHistory = () => {
	rebuildAddressCacheFromHistory(walletInfo.value.curAddress);
	loadAddressList();
};

// 清除所有地址
const clearAll = () => {
	if (confirm(`Are you sure you want to clear all ${props.addressType} addresses?`)) {
		clearContractAddresses(props.addressType);
		loadAddressList();
	}
};

// 格式化时间
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

// 点击外部关闭下拉框
const handleClickOutside = (event: MouseEvent) => {
	if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
		// 检查是否点击了地址按钮
		const addressBtn = (event.target as HTMLElement)?.closest('.selector-dropdown-btn');
		if (!addressBtn) {
			closeDropdown();
		}
	}
};

// 监听点击外部事件
watch(isDropdownOpen, (isOpen) => {
	if (isOpen) {
		document.addEventListener('click', handleClickOutside);
	} else {
		document.removeEventListener('click', handleClickOutside);
	}
});

onUnmounted(() => {
	document.removeEventListener('click', handleClickOutside);
});

// 监听地址类型变化
watch(
	() => props.addressType,
	() => {
		loadAddressList();
	}
);

// 组件挂载时加载地址列表
onMounted(() => {
	loadAddressList();
	// 自动从历史记录提取地址（如果还没有缓存）
	if (addressList.value.length === 0) {
		refreshFromHistory();
	}
});
</script>

<style scoped>
.contract-address-selector {
	position: relative;
	width: 100%;
}

.selector-input {
	width: 100%;
}

.selector-dropdown-btn {
	/* 与 MyTextarea 的按钮样式保持一致 */
	position: static;
	padding: 6px 12px;
	border: none;
	border-radius: var(--radius-sm);
	font-size: var(--font-size-small);
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	box-sizing: border-box;
	white-space: nowrap;
	user-select: none;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 4px;
	/* 主题色样式 */
	background-color: var(--form-btn-primary-color);
	color: var(--color-primary);
	border: 1px solid var(--color-primary);
}

.selector-dropdown-btn .btn-text {
	display: inline-block;
}

.selector-dropdown-btn .btn-badge {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 18px;
	height: 18px;
	padding: 0 4px;
	background-color: var(--color-primary);
	color: white;
	border-radius: 9px;
	font-size: var(--font-size-tiny);
	font-weight: 600;
	line-height: 1;
	margin-left: 2px;
}

.selector-dropdown-btn.active .btn-badge {
	background-color: rgba(255, 255, 255, 0.3);
}

.selector-dropdown-btn:hover:not(:disabled) {
	color: var(--color-text-primary);
	background-color: var(--color-primary);
	border-color: var(--color-primary);
	box-shadow: var(--shadow-sm);
}

.selector-dropdown-btn:active:not(:disabled) {
	transform: translateY(0);
	box-shadow: none;
}

.selector-dropdown-btn.active {
	background-color: var(--color-primary);
	color: white;
	border-color: var(--color-primary);
}

.selector-dropdown-btn:disabled {
	background-color: var(--form-btn-disabled-color);
	color: var(--color-text-secondary);
	border-color: var(--form-border-color);
	cursor: not-allowed;
	opacity: 0.6;
	transform: none;
}

.selector-dropdown-btn svg {
	width: 16px;
	height: 16px;
	transition: transform 0.2s ease;
	flex-shrink: 0;
}

.selector-dropdown-btn.active svg {
	transform: rotate(180deg);
}

.selector-dropdown {
	position: absolute;
	top: calc(100% + var(--spacing-xs));
	left: 0;
	right: 0;
	background-color: var(--form-bg-color);
	border: 1px solid var(--form-border-color);
	border-radius: var(--radius-md);
	box-shadow: var(--shadow-lg);
	z-index: 1000;
	max-height: 450px;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	animation: dropdownFadeIn 0.2s ease-out;
}

@keyframes dropdownFadeIn {
	from {
		opacity: 0;
		transform: translateY(-8px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.dropdown-search {
	position: relative;
	display: flex;
	align-items: center;
	padding: var(--spacing-sm);
	border-bottom: 1px solid var(--form-border-color);
	background-color: var(--form-item-bg-color);
}

.search-icon {
	width: 18px;
	height: 18px;
	color: var(--color-text-secondary);
	margin-right: var(--spacing-xs);
	flex-shrink: 0;
}

.dropdown-search .search-input {
	flex: 1;
	border: none;
	outline: none;
	background: transparent;
	color: var(--color-text-primary);
	font-size: var(--font-size-subtitle);
	padding: var(--spacing-xs);
}

.dropdown-search .search-input::placeholder {
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
	width: 16px;
	height: 16px;
}

.dropdown-list {
	flex: 1;
	overflow-y: auto;
	max-height: 320px;
	/* 自定义滚动条样式 */
}

.dropdown-list::-webkit-scrollbar {
	width: 6px;
}

.dropdown-list::-webkit-scrollbar-track {
	background: transparent;
}

.dropdown-list::-webkit-scrollbar-thumb {
	background-color: var(--form-border-color);
	border-radius: 3px;
}

.dropdown-list::-webkit-scrollbar-thumb:hover {
	background-color: var(--color-text-tertiary);
}

.dropdown-item {
	padding: var(--spacing-sm);
	border-bottom: 1px solid var(--form-border-color);
	cursor: pointer;
	transition: all 0.2s ease;
	position: relative;
}

.dropdown-item:hover {
	background-color: var(--form-item-bg-hover-color);
}

.dropdown-item.recently-used {
	border-left: 3px solid var(--color-primary);
}

.dropdown-item.selected {
	background-color: var(--color-primary);
	color: white;
}

.dropdown-item.selected .item-meta {
	color: rgba(255, 255, 255, 0.8);
}

.item-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: var(--spacing-xs);
	margin-bottom: var(--spacing-xs);
}

.item-address {
	font-size: var(--font-size-subtitle);
	font-weight: 500;
	color: var(--color-text-primary);
	word-break: break-all;
	flex: 1;
	line-height: 1.4;
}

.dropdown-item.selected .item-address {
	color: white;
}

.item-remove-btn {
	background: none;
	border: none;
	cursor: pointer;
	color: var(--color-text-secondary);
	padding: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;
	border-radius: var(--radius-sm);
	flex-shrink: 0;
	opacity: 0.6;
}

.item-remove-btn:hover {
	background-color: rgba(255, 255, 255, 0.1);
	color: var(--color-text-primary);
	opacity: 1;
}

.dropdown-item.selected .item-remove-btn {
	color: rgba(255, 255, 255, 0.8);
}

.dropdown-item.selected .item-remove-btn:hover {
	background-color: rgba(255, 255, 255, 0.2);
	color: white;
}

.item-remove-btn svg {
	width: 14px;
	height: 14px;
}

.dropdown-item.selected .item-address {
	color: white;
}

.item-meta {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: var(--font-size-small);
	color: var(--color-text-secondary);
}

.item-source {
	padding: 2px 8px;
	background-color: var(--color-primary);
	color: white;
	border-radius: var(--radius-sm);
	font-size: var(--font-size-tiny);
}

.dropdown-item.selected .item-source {
	background-color: rgba(255, 255, 255, 0.2);
}

.item-time {
	font-size: var(--font-size-small);
}

.dropdown-empty {
	padding: var(--spacing-xl) var(--spacing-lg);
	text-align: center;
	color: var(--color-text-secondary);
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: var(--spacing-sm);
}

.dropdown-empty .empty-icon {
	width: 48px;
	height: 48px;
	color: var(--color-text-tertiary);
	opacity: 0.5;
	margin-bottom: var(--spacing-xs);
}

.dropdown-empty p {
	margin: 0;
	font-size: var(--font-size-subtitle);
}

.dropdown-empty .empty-hint {
	font-size: var(--font-size-small);
	color: var(--color-text-tertiary);
	opacity: 0.7;
}

.dropdown-actions {
	display: flex;
	gap: var(--spacing-xs);
	padding: var(--spacing-sm);
	border-top: 1px solid var(--form-border-color);
	background-color: var(--form-item-bg-color);
}

.action-btn {
	flex: 1;
	padding: var(--spacing-xs) var(--spacing-sm);
	border-radius: var(--radius-sm);
	border: 1px solid var(--form-border-color);
	background-color: var(--form-item-bg-color);
	color: var(--color-text-primary);
	cursor: pointer;
	font-size: var(--font-size-small);
	transition: all 0.2s ease;
}

.action-btn:hover {
	background-color: var(--form-item-bg-hover-color);
}

.clear-btn {
	background-color: var(--color-error);
	color: white;
	border-color: var(--color-error);
}

.clear-btn:hover {
	background-color: #d32f2f;
}

.refresh-btn {
	background-color: var(--color-primary);
	color: white;
	border-color: var(--color-primary);
}

.refresh-btn:hover {
	background-color: var(--color-primary-hover);
}
</style>

