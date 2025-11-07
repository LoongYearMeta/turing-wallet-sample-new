<template>
	<div class="toast">
		<Transition name="toast-success-fade">
			<div class="toast-success" v-if="props.type == 'success'" @click="close">
				{{ props.message }}
			</div>
		</Transition>
		<Transition name="toast-error-fade">
			<div class="toast-error" v-if="props.type == 'error'" @click="close">
        {{ props.message }}
      </div>
		</Transition>
	</div>
</template>

<script setup lang="ts">
import { watch, onUnmounted } from 'vue';

// Props: 消息类型、消息内容、显示时长
const props = defineProps<{
	type: 'success' | 'error';
	message: string;
	duration: number; // 默认 3000ms
}>();

// Emit: 关闭消息时通知父级清除状态
const emit = defineEmits<{
	(e: 'close'): void;
}>();

// 定时器
let timer: NodeJS.Timeout | null = null;

// 监听消息变化, 自动关闭
watch(
	() => props.message,
	(newMessage) => {
		// 清除之前的定时器
		if (timer) clearTimeout(timer);
		// 自动关闭消息
		if (newMessage) {
			timer = setTimeout(() => {
				emit('close');
			}, props.duration);
		}
	},
	{ immediate: true },
);

// 手动关闭消息
const close = () => {
	if (timer) clearTimeout(timer);
	emit('close');
};

// 组件卸载时清除定时器
onUnmounted(() => {
	if (timer) clearTimeout(timer);
});
</script>

<style scoped>
/* 基础样式：居中固定定位 */
.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  z-index: 9999; /* 确保在最上层 */
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 成功提示样式 */
.toast-success {
  background: #4cd263; /* 原成功色 */
}

/* 错误提示样式 */
.toast-error {
  background: #ff4d4f; /* 原错误色 */
}

/* 过渡动画（保留原有逻辑） */
.toast-success-fade-enter-from,
.toast-error-fade-enter-from {
  opacity: 0;
  transform: translate(-50%, -20px);
}

.toast-success-fade-enter-active,
.toast-error-fade-enter-active {
  transition: all 0.3s ease;
}

.toast-success-fade-leave-from,
.toast-error-fade-leave-from {
  opacity: 1;
}

.toast-success-fade-leave-active,
.toast-error-fade-leave-active {
  opacity: 0;
  transition: all 0.3s ease;
}
</style>
