<template>
	<div class="m-textarea-container">
		<!-- 文本域核心组件 -->
		<textarea
			ref="textareaRef"
			v-model="value"
			:placeholder="placeholder"
			:readonly="readonly"
			:disabled="disabled"
			:maxlength="maxLength"
			@input="handleInput"
			@blur="$emit('blur')"
			@focus="$emit('focus')"
			class="form-item-textarea m-textarea"
		></textarea>
		<!-- 操作按钮区域（仅在需要时显示） -->
		<div v-if="copyable || deletable" class="m-textarea-actions-wrapper">
			<!-- 分割线 -->
			<div class="m-textarea-divider"></div>
			<!-- flex 布局 -->
			<div class="m-textarea-actions">
				<!-- copy -->
				<button
					v-if="copyable"
					@click="handleCopy"
					type="button"
					class="m-textarea-btn m-textarea-copy"
					:disabled="!value || disabled"
					aria-label="Copy content"
				>
					<span v-if="!isCopied">Copy</span>
					<span v-if="isCopied">Copied</span>
				</button>
				<!-- delete -->
				<button
					v-if="deletable"
					@click="handleDelete"
					type="button"
					class="m-textarea-btn m-textarea-del"
					:disabled="!value || disabled"
					aria-label="Clear content"
				>
					Delete
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';

// 1. 定义 Props（maxHeight 仅支持字符串类型，添加合法值校验）
const props = defineProps<{
	// 双向绑定值
	modelValue: string;
	// 占位提示文本
	placeholder?: string;
	// 是否只读
	readonly?: boolean;
	// 是否禁用（禁用时复制/删除按钮失效）
	disabled?: boolean;
	// 是否显示复制按钮
	copyable?: boolean;
	// 是否显示删除按钮
	deletable?: boolean;
	// 最大输入长度
	maxLength?: number;
	// 最大高度（仅支持：'none'/'auto'/'数字px'，如 '100px'）
	maxHeight?: 'none' | 'auto' | `${number}px`;
}>();

// 2. 定义事件（支持双向绑定、状态回调）
const emits = defineEmits([
	'update:modelValue', // v-model 双向绑定事件
	'input', // 输入内容变化事件
	'blur', // 失去焦点事件
	'focus', // 获取焦点事件
	'copy-success', // 复制成功事件
	'copy-error', // 复制失败事件
	'delete-success', // 删除成功事件
	'delete-error', // 删除失败事件
]);

// 3. 内部状态管理
const textareaRef = ref<HTMLTextAreaElement | null>(null); // 文本域DOM引用
const value = ref(props.modelValue); // 内部绑定值（与v-model同步）
const isCopied = ref(false); // 复制状态标记
let copyTimer: NodeJS.Timeout | null = null; // 复制状态重置定时器

// 4. 核心逻辑：清除定时器（统一管理，避免内存泄漏）
const clearCopyTimer = () => {
	if (copyTimer) {
		clearTimeout(copyTimer);
		copyTimer = null;
	}
};

// 5. 核心逻辑：自适应高度计算（仅处理字符串类型maxHeight）
const calculateHeight = () => {
	if (!textareaRef.value) return;

	// 步骤1：重置高度，获取真实内容高度（scrollHeight）
	textareaRef.value.style.height = 'auto';
	const scrollHeight = textareaRef.value.scrollHeight;

	// 步骤2：计算实际padding（通过getComputedStyle获取）
	const computedStyle = window.getComputedStyle(textareaRef.value);
	const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
	const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
	const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;
	const borderBottom = parseFloat(computedStyle.borderBottomWidth) || 0;
	const totalPadding = paddingTop + paddingBottom + borderTop + borderBottom;

	// 步骤3：设置基础高度（使用实际计算的padding值）
	const baseHeight = scrollHeight + totalPadding;
	textareaRef.value.style.height = `${baseHeight}px`;

	// 步骤4：处理最大高度限制（仅当maxHeight为'数字px'时生效）
	const currentMaxHeight = props.maxHeight ?? 'none';
	if (currentMaxHeight !== 'none' && currentMaxHeight !== 'auto') {
		// 提取maxHeight中的数字（如 '200px' → 200）
		const heightMatch = currentMaxHeight.match(/^(\d+)px$/);
		const maxHeightNum = heightMatch ? parseInt(heightMatch[1] || '0', 10) : 0;

		// 若内容高度超过最大高度，限制高度并显示滚动条
		if (maxHeightNum > 0 && baseHeight > maxHeightNum) {
			textareaRef.value.style.height = currentMaxHeight;
			textareaRef.value.style.overflowY = 'auto';
		} else {
			textareaRef.value.style.overflowY = 'hidden'; // 隐藏滚动条
		}
	} else {
		textareaRef.value.style.overflowY = 'hidden'; // 无最大高度时隐藏滚动条
	}
};

// 6. 输入事件处理（同步高度+触发外部事件）
const handleInput = () => {
	calculateHeight();
	emits('input', value.value);
};

// 7. 复制功能（支持Clipboard API，添加状态反馈）
const handleCopy = async (event: Event) => {
	// 阻止事件冒泡，防止触发父级form的submit事件
	event.preventDefault();
	event.stopPropagation();
	
	if (!value.value || props.disabled) return;

	try {
		// 使用Clipboard API复制内容（原生支持，无需额外依赖）
		await navigator.clipboard.writeText(value.value);
		isCopied.value = true; // 切换复制成功状态
		emits('copy-success'); // 触发复制成功事件

		// 2秒后重置复制状态（提升用户体验）
		clearCopyTimer();
		copyTimer = setTimeout(() => {
			isCopied.value = false;
		}, 2000);
	} catch (error) {
		isCopied.value = false; // 复制失败重置状态
		console.error('Textarea copy failed:', error);
		emits('copy-error', error); // 触发复制失败事件
	}
};

// 8. 删除功能（清空内容+同步高度+触发外部事件）
const handleDelete = (event: Event) => {
	// 阻止事件冒泡，防止触发父级form的submit事件
	event.preventDefault();
	event.stopPropagation();
	
	if (props.disabled) return;

	try {
		value.value = ''; // 清空内部值
		calculateHeight(); // 同步高度（恢复初始高度）
		textareaRef.value?.focus(); // 清空后聚焦文本域（方便重新输入）
		emits('delete-success'); // 触发删除成功事件
	} catch (error) {
		console.error('Textarea delete failed:', error);
		emits('delete-error', error); // 触发删除失败事件
	}
};

// 9. 监听外部值变化（v-model同步）
watch(
	() => props.modelValue,
	(newVal) => {
		value.value = newVal;
		// 使用nextTick确保DOM更新后再计算高度，特别是对于只读模式下的回显
		nextTick(() => {
			calculateHeight();
		});
	},
	{ immediate: true }, // 立即执行一次（初始化时同步）
);

// 10. 监听内部值变化（同步v-model）
watch(value, (newVal) => {
	emits('update:modelValue', newVal); // 触发双向绑定更新
});

// 11. 组件挂载后初始化高度（使用nextTick确保样式已应用）
onMounted(() => {
	nextTick(() => {
		calculateHeight();
	});
});

// 12. 组件销毁前清理资源（避免内存泄漏）
onUnmounted(() => {
	clearCopyTimer();
});
</script>

<style scoped>
@import '@/assets/form-page.css';
/* 容器样式：flex布局，垂直排列 */
.m-textarea-container {
	position: relative;
	width: 100%;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	border: 1px solid var(--form-border-color);
	border-radius: var(--radius-sm);
	background-color: var(--form-item-bg-color);
	overflow: hidden;
}

/* 操作按钮包装器 */
.m-textarea-actions-wrapper {
	display: flex;
	flex-direction: column;
	width: 100%;
	background-color: var(--form-item-bg-color);
}

/* 分割线样式 */
.m-textarea-divider {
	width: 100%;
	height: 1px;
	background-color: var(--form-border-color);
	margin: 0;
}

/* 操作按钮容器 */
.m-textarea-actions {
	display: flex;
	justify-content: flex-end;
	align-items: center;
	gap: var(--spacing-xs);
	padding: var(--spacing-sm) var(--spacing-xs);
	width: 100%;
	box-sizing: border-box;
}

/* 文本域样式：基础样式+过渡效果 */
.m-textarea {
	width: 100%;
	min-height: 60px;
	padding: var(--spacing-xs);
	padding-bottom: var(--spacing-xs);
	border: none;
	border-radius: 0;
	resize: none; /* 禁用手动调整大小 */
	font-size: var(--font-size-subtitle);
	line-height: 1.5;
	color: var(--color-text-primary);
	background-color: transparent;
	transition: all 0.2s ease;
	box-sizing: border-box;
	overflow-y: hidden; /* 默认隐藏滚动条 */
}

/* 容器聚焦样式：强化视觉反馈 */
.m-textarea-container:focus-within {
	border-color: var(--color-primary);
	box-shadow: 0 0 0 2px rgba(255, 140, 0, 0.1);
}

/* 文本域聚焦样式 */
.m-textarea:focus {
	outline: none;
}

/* 只读/禁用样式：区分状态 */
.m-textarea:read-only {
	background-color: var(--form-item-bg-color);
	cursor: default;
	opacity: 0.9;
}
.m-textarea:disabled {
	background-color: var(--form-btn-disabled-color);
	border-color: var(--form-border-color);
	color: var(--color-text-tertiary);
	cursor: not-allowed;
	opacity: 0.6;
}

/* 按钮通用样式：基础样式 */
.m-textarea-btn {
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
}

/* 复制按钮：主题色样式 */
.m-textarea-copy {
	background-color: var(--form-btn-primary-color);
	color: var(--color-primary);
	border: 1px solid var(--color-primary);
}
.m-textarea-copy:hover:not(:disabled) {
	color: var(--color-text-primary);
	background-color: var(--color-primary);
	border-color: var(--color-primary);
	transform: translateY(-1px);
	box-shadow: var(--shadow-sm);
}
.m-textarea-copy:active:not(:disabled) {
	transform: translateY(0);
	box-shadow: none;
}
.m-textarea-copy:disabled {
	background-color: var(--form-btn-disabled-color);
	color: var(--color-text-secondary);
	border-color: var(--form-border-color);
	cursor: not-allowed;
	opacity: 0.6;
	transform: none;
}

/* 删除按钮：错误色样式 */
.m-textarea-del {
	background-color: var(--form-btn-error-color);
	color: var(--color-error);
	border: 1px solid var(--color-error);
}
.m-textarea-del:hover:not(:disabled) {
	color: var(--color-text-primary);
	background-color: var(--color-error);
	border-color: var(--color-error);
	transform: translateY(-1px);
	box-shadow: var(--shadow-sm);
}
.m-textarea-del:active:not(:disabled) {
	transform: translateY(0);
	box-shadow: none;
}
.m-textarea-del:disabled {
	background-color: var(--form-btn-disabled-color);
	color: var(--color-text-secondary);
	border-color: var(--form-border-color);
	cursor: not-allowed;
	opacity: 0.6;
	transform: none;
}

/* 响应式优化 */
@media (max-width: 768px) {
	.m-textarea-actions {
		padding: var(--spacing-xs);
		gap: var(--spacing-xs);
	}
	
	.m-textarea-btn {
		padding: 6px 12px;
		font-size: var(--font-size-small);
	}
	
	.m-textarea {
		font-size: var(--font-size-small);
		min-height: 50px;
		padding: var(--spacing-xs);
	}
}

@media (max-width: 480px) {
	.m-textarea-actions {
		padding: var(--spacing-xs);
		gap: var(--spacing-xs);
		/* 保持横向排列 */
		flex-direction: row;
		justify-content: flex-end;
	}
	
	.m-textarea-btn {
		padding: 6px 10px;
		font-size: var(--font-size-tiny);
		/* 不设置width: 100%，保持按钮自然宽度 */
		min-width: auto;
		flex-shrink: 0;
	}
	
	.m-textarea {
		font-size: var(--font-size-small);
		min-height: 50px;
		padding: var(--spacing-xs);
	}
}
</style>
