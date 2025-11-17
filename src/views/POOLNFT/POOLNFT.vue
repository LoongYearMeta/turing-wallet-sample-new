<template>
	<div class="message-signing-page">
		<!-- header -->
		<div class="page-header">
			<div>
				<h2 class="page-title">POOLNFT Transaction</h2>
				<p class="page-description">
					Select a POOLNFT operation to configure and submit the transaction.
				</p>
			</div>
			<router-link to="/records" class="history-link">
				<span>View History</span>
			</router-link>
		</div>

		<!-- function selector -->
		<div class="function-selector">
			<label class="function-selector-label">Choose Function</label>
			<div class="function-selector-control">
				<div class="custom-select" @click.stop="toggleDropdown">
					<div class="select-trigger">
						<span>{{ currentOption.label }}</span>
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
					<!-- dropdown -->
					<transition name="fade">
						<div class="select-dropdown" v-if="isOpen">
							<div
								class="dropdown-option"
								v-for="option in functionOptions"
								:key="option.value"
								@click.stop="selectOption(option.value)"
							>
								{{ option.label }}
								<svg
									v-if="selectedFunction === option.value"
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
		</div>

		<!-- function content -->
		<component :is="currentComponent" :key="selectedFunction" />
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import PoolNftInit from './components/INIT.vue';
import PoolNftMint from './components/MINT.vue';
import PoolNftIncrease from './components/INCREASE.vue';
import PoolNftConsume from './components/CONSUME.vue';
import PoolNftToToken from './components/TO_TOKEN.vue';
import PoolNftToTbc from './components/TO_TBC.vue';
import PoolNftMerge from './components/MERGE-POOLNFT.vue';
import FTLPMerge from './components/MERGE-FTLP.vue';
import PoolNftBurn from './components/BURN.vue';

type PoolNftFunction =
	| 'POOLNFT_INIT'
	| 'POOLNFT_MINT'
	| 'POOLNFT_LP_INCREASE'
	| 'POOLNFT_LP_CONSUME'
	| 'POOLNFT_SWAP_TO_TOKEN'
	| 'POOLNFT_SWAP_TO_TBC'
	| 'POOLNFT_MERGE'
	| 'FTLP_MERGE'
	| 'POOLNFT_LP_BURN';

const functionOptions: Array<{ label: string; value: PoolNftFunction }> = [
	{ label: 'POOLNFT MINT', value: 'POOLNFT_MINT' },
	{ label: 'POOLNFT INIT', value: 'POOLNFT_INIT' },
	{ label: 'POOLNFT LP Increase', value: 'POOLNFT_LP_INCREASE' },
	{ label: 'POOLNFT LP Consume', value: 'POOLNFT_LP_CONSUME' },
	{ label: 'POOLNFT Swap To Token', value: 'POOLNFT_SWAP_TO_TOKEN' },
	{ label: 'POOLNFT Swap To TBC', value: 'POOLNFT_SWAP_TO_TBC' },
	{ label: 'POOLNFT Merge', value: 'POOLNFT_MERGE' },
	{ label: 'FTLP Merge', value: 'FTLP_MERGE' },
	{ label: 'POOLNFT LP Burn', value: 'POOLNFT_LP_BURN' },
];

const selectedFunction = ref<PoolNftFunction>('POOLNFT_MINT');

const componentMap: Record<PoolNftFunction, any> = {
	POOLNFT_INIT: PoolNftInit,
	POOLNFT_MINT: PoolNftMint,
	POOLNFT_LP_INCREASE: PoolNftIncrease,
	POOLNFT_LP_CONSUME: PoolNftConsume,
	POOLNFT_SWAP_TO_TOKEN: PoolNftToToken,
	POOLNFT_SWAP_TO_TBC: PoolNftToTbc,
	POOLNFT_MERGE: PoolNftMerge,
	FTLP_MERGE: FTLPMerge,
	POOLNFT_LP_BURN: PoolNftBurn,
};

const currentComponent = computed(() => componentMap[selectedFunction.value]);

const currentOption = computed(() => {
	const option =
		functionOptions.find((item) => item.value === selectedFunction.value) ?? functionOptions[0];
	return option ?? { label: '', value: selectedFunction.value };
});

const isOpen = ref(false);

const toggleDropdown = () => {
	isOpen.value = !isOpen.value;
};

const selectOption = (value: PoolNftFunction) => {
	selectedFunction.value = value;
	isOpen.value = false;
};
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

.function-selector {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xs);
	margin-bottom: var(--spacing-lg);
}

.function-selector-label {
	font-size: var(--font-size-subtitle);
	font-weight: 600;
	color: var(--color-text-secondary);
}

.function-selector-control {
	position: relative;
}

.function-select {
	width: 100%;
	padding: var(--spacing-sm) var(--spacing-md);
	border-radius: var(--radius-sm);
	border: 1px solid var(--form-border-color);
	background-color: var(--form-item-bg-color);
	color: var(--color-text-primary);
	font-size: var(--font-size-subtitle);
	font-family: var(--font-family-sans);
	appearance: none;
	cursor: pointer;
	transition: all 0.2s ease;
}

.function-select:focus {
	outline: none;
	border-color: var(--color-primary);
	box-shadow: 0 0 0 2px rgba(255, 140, 0, 0.1);
}

.function-select:hover {
	border-color: var(--color-primary);
}
</style>
