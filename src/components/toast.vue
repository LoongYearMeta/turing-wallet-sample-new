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
				<svg v-if="props.type === 'success'" width="20" height="20" viewBox="0 0 20 20">
					<path
						d="M10 1.25C5.16751 1.25 1.25 5.16751 1.25 10C1.25 14.8325 5.16751 18.75 10 18.75C14.8325 18.75 18.75 14.8325 18.75 10C18.75 5.16751 14.8325 1.25 10 1.25Z"
						fill="currentColor"
						fill-opacity="0.12"
					/>
					<path
						d="M13.9582 8.04166L9.14571 12.8541L6.87495 10.5833"
						stroke="currentColor"
						stroke-width="1.75"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				<svg v-else width="20" height="20" viewBox="0 0 20 20">
					<path
						d="M10 1.25C5.16751 1.25 1.25 5.16751 1.25 10C1.25 14.8325 5.16751 18.75 10 18.75C14.8325 18.75 18.75 14.8325 18.75 10C18.75 5.16751 14.8325 1.25 10 1.25Z"
						fill="currentColor"
						fill-opacity="0.12"
					/>
					<path
						d="M12.8284 7.17157L7.17157 12.8284"
						stroke="currentColor"
						stroke-width="1.75"
						stroke-linecap="round"
					/>
					<path
						d="M7.17157 7.17157L12.8284 12.8284"
						stroke="currentColor"
						stroke-width="1.75"
						stroke-linecap="round"
					/>
				</svg>
			</span>
			<div class="toast__content">
				<span class="toast__title">{{ props.type === 'success' ? 'Success' : 'Error' }}</span>
				<p class="toast__message">{{ props.message }}</p>
			</div>
			<button class="toast__close" type="button" aria-label="Close notification" @click.stop="close">
				<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
					<path
						d="M12 4L4 12M4 4L12 12"
						stroke="currentColor"
						stroke-width="1.5"
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

<style scoped>
.toast {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 260px;
  max-width: min(360px, calc(100vw - 48px));
  padding: 14px 18px;
  border-radius: 12px;
  border: 1px solid transparent;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.16), 0 4px 12px rgba(15, 23, 42, 0.12);
  cursor: pointer;
  background: #fff;
}

.toast--success {
  background: #f0fdf4;
  border-color: rgba(34, 197, 94, 0.35);
  color: #166534;
}

.toast--error {
  background: #fef2f2;
  border-color: rgba(248, 113, 113, 0.35);
  color: #991b1b;
}

.toast__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: currentColor;
  color: inherit;
  flex-shrink: 0;
}

.toast--success .toast__icon {
  color: #16a34a;
  background: rgba(34, 197, 94, 0.16);
}

.toast--error .toast__icon {
  color: #dc2626;
  background: rgba(248, 113, 113, 0.16);
}

.toast__content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: inherit;
}

.toast__title {
  font-size: 0.82rem;
  font-weight: 600;
  text-transform: capitalize;
  color: inherit;
}

.toast__message {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
  color: inherit;
}

.toast__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(148, 163, 184, 0.16);
  color: inherit;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.toast__close:hover {
  background: rgba(148, 163, 184, 0.28);
}

:deep(.toast-fade-enter-from),
:deep(.toast-fade-leave-to){
  opacity: 0;
  transform: translateY(-12px);
}

:deep(.toast-fade-enter-active),
:deep(.toast-fade-leave-active) {
  transition: all 0.25s ease;
}
</style>
