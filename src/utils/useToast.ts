// 封装Toast组件的调用逻辑
import { ref, inject } from 'vue';
import type { App } from 'vue';
import type { InjectionKey } from 'vue';

// 定义Toast组件的调用方法类型
interface ToastApi {
  state: {
    type: string;
    message: string;
    duration: number; // 默认 3000ms
  };
  showSuccess: (type: 'success', message: string, duration: number) => void;
  showError: (type: 'error', message: string, duration: number) => void;
  close: () => void;
}

// 定义Toast组件的注入键, 确保类型安全
const toastKey: InjectionKey<ToastApi> = Symbol('toast');

// 全局状态： 存储当前显示的提示信息
const toastState = ref({
  type: '',
  message: '',
  duration: 3000, // 默认时长
})

// 提供全局Tosat实例（在main.ts中注入）
export function provideToast(app: App) {
  const toastApi: ToastApi = {
    state: toastState.value,
    // 显示成功消息
    showSuccess: (type: 'success', message: string, duration: number = 3000) => {
      toastState.value.type = type;
      toastState.value.message = message;
      toastState.value.duration = duration as number;
    },
    // 显示错误消息
    showError: (type: 'error', message: string, duration: number = 3000) => {
      toastState.value.type = type;
      toastState.value.message = message;
      toastState.value.duration = duration as number;
    },
    // 关闭消息
    close: () => {
      toastState.value.type = '';
      toastState.value.message = '';
      toastState.value.duration = 3000;
    },
  };
  app.provide(toastKey, toastApi);
}

// 在组件中使用Toast
export const useToast = (): ToastApi => {
  const toastApi = inject(toastKey);
  if (!toastApi) {
    throw new Error('请先在main.ts中调用 provideToast 注入Toast');
  }
  return toastApi;
}