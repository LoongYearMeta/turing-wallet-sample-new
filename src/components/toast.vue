<template>
	<Transition name="toast-fade">
		<div
			v-if="props.visible && props.message"
			class="toast"
			:class="`toast--${props.type}`"
			role="status"
			@click="close"
		>
			<span class="toast__icon" aria-hidden="true">
				<!-- 成功图标 -->
				<svg v-if="props.type === 'success'" width="32" height="32" viewBox="0 0 24 24" focusable="false">
					<circle cx="12" cy="12" r="10" fill="var(--toast-accent-surface)" />
					<path
						d="M8.75 12.5L11 14.75L15.5 9.75"
						fill="none"
						stroke="var(--toast-accent)"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				<!-- 错误图标 -->
				<svg v-else width="32" height="32" viewBox="0 0 24 24" focusable="false">
					<circle cx="12" cy="12" r="10" fill="var(--toast-accent-surface)" />
					<path
						d="M9.5 9.5L14.5 14.5M14.5 9.5L9.5 14.5"
						fill="none"
						stroke="var(--toast-accent)"
						stroke-width="2"
						stroke-linecap="round"
					/>
				</svg>
			</span>
			<!-- 消息内容 -->
			<div class="toast__content">
				<span class="toast__title">{{ props.type === 'success' ? 'Success' : 'Error' }}</span>
				<p class="toast__message">{{ props.message }}</p>
			</div>
			<!-- 关闭按钮 -->
			<button class="toast__close" type="button" aria-label="Close notification" @click.stop="close">
				<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
					<path
						d="M4.75 4.75L11.25 11.25M11.25 4.75L4.75 11.25"
						stroke="currentColor"
						stroke-width="1.6"
						stroke-linecap="round"
					/>
				</svg>
			</button>
		</div>
	</Transition>
</template>

<script setup lang="ts">
import { watch, onUnmounted } from 'vue'

// Props: 消息类型、消息内容、显示时长
const props = defineProps<{
	type: 'success' | 'error'
	message: string
	duration: number
	visible: boolean
}>()

// Emit: 关闭消息时通知父级清除状态
const emit = defineEmits<{
	(e: 'close'): void
}>()

// 定时器
let timer: ReturnType<typeof setTimeout> | null = null

// 监听提示展示，自动关闭
watch(
	() => [props.visible, props.message, props.duration] as [boolean, string, number],
	([visible, message, duration]) => {
		// 清除之前的定时器
		if (timer) clearTimeout(timer)
		// 自动关闭消息
		if (visible && message) {
			timer = setTimeout(() => {
				emit('close')
			}, duration)
		}
	},
	{ immediate: true },
)

// 手动关闭消息
const close = () => {
	if (timer) clearTimeout(timer)
	timer = null
	emit('close')
}

// 组件卸载时清除定时器
onUnmounted(() => {
	if (timer) clearTimeout(timer)
})
</script>

<style>
.toast {
  --toast-bg: #ffffff;
  --toast-fg: #1f2937;
  --toast-accent: #6366f1;
  --toast-accent-surface: rgba(99, 102, 241, 0.12);

  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-width: 260px;
  max-width: min(360px, calc(100vw - 48px));
  padding: 16px 22px 16px 18px;
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.16), 0 4px 12px rgba(15, 23, 42, 0.12);
  background: var(--toast-bg);
  color: var(--toast-fg);
  cursor: pointer;
  backdrop-filter: blur(12px);
	will-change: opacity, transform, box-shadow; /* 告诉浏览器提前优化渲染 */
  backface-visibility: hidden; /* 避免动画过程中出现模糊 */
}

.toast--success {
  --toast-bg: #f0fdf4;
  --toast-fg: #166534;
  --toast-accent: #16a34a;
  --toast-accent-surface: rgba(22, 163, 74, 0.16);
}

.toast--error {
  --toast-bg: #fef2f2;
  --toast-fg: #991b1b;
  --toast-accent: #dc2626;
  --toast-accent-surface: rgba(220, 38, 38, 0.12);
}

.toast__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  flex-shrink: 0;
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.06);
}

.toast__icon svg {
  display: block;
}

.toast__content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: inherit;
}

.toast__title {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
  color: inherit;
  letter-spacing: 0.01em;
}

.toast__message {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.5;
  color: var(--toast-fg);
  color: color-mix(in srgb, var(--toast-fg) 88%, #0f172a);
}

.toast__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  margin-left: auto;
  border-radius: 10px;
  border: none;
  background: none;
  color: var(--toast-fg);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.toast__close svg {
  display: block;
	width: 24px !important;
  height: 24px !important;
	overflow: visible;
}

.toast__close:hover {
  background: #fbfefc;
}

.toast__close:active {
  transform: translateY(0);
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.92); /* 增加缩放效果，增强空间感 */
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.08); /* 离开时阴影变浅 */
}

.toast-fade-enter-active {
  /* 拆分过渡属性，分别设置时长和缓动，更细腻 */
  transition:
    opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1), /* 进入缓动：快进慢停 */
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.toast-fade-leave-active {
  transition:
    opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), /* 离开缓动：慢进快停 */
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 优化关闭按钮交互动画 */
.toast__close {
  /* 原有样式保留，增加以下过渡属性 */
  transition:
    background 0.2s ease-in-out,
    color 0.2s ease-in-out,
    transform 0.15s ease-in-out;
}

.toast__close:hover {
  background: rgba(15, 23, 42, 0.05); /* 更柔和的hover背景 */
  transform: scale(1.1); /* 轻微放大，增强反馈 */
}

.toast__close:active {
  transform: scale(0.95); /* 按压收缩，模拟物理反馈 */
}
</style>
