// 封装Toast组件的调用逻辑
import { reactive, inject } from 'vue'
import type { App, InjectionKey } from 'vue'

export type ToastType = 'success' | 'error'

export interface ToastState {
  visible: boolean
  type: ToastType
  message: string
  duration: number
}

export interface ToastApi {
  state: ToastState
  showSuccess: (message: string, duration?: number) => void
  showError: (message: string, duration?: number) => void
  close: () => void
}

// 定义Toast组件的注入键, 确保类型安全
const toastKey: InjectionKey<ToastApi> = Symbol('toast');

// 全局状态： 存储当前显示的提示信息
const toastState = reactive<ToastState>({
  visible: false,
  type: 'success',
  message: '',
  duration: 3000,
})

// 提供全局Tosat实例（在main.ts中注入）
export function provideToast(app: App) {
  const setToast = (type: ToastType, message: string, duration: number) => {
    toastState.type = type
    toastState.message = message
    toastState.duration = duration
    toastState.visible = true
  }

  const resetToast = () => {
    toastState.visible = false
    toastState.message = ''
    toastState.duration = 3000
    toastState.type = 'success'
  }

  const toastApi: ToastApi = {
    state: toastState,
    showSuccess: (message: string, duration: number = 3000) => {
      setToast('success', message, duration)
    },
    showError: (message: string, duration: number = 3000) => {
      setToast('error', message, duration)
    },
    close: () => {
      resetToast()
    },
  }

  app.provide(toastKey, toastApi)
}

// 在组件中使用Toast
export const useToast = (): ToastApi => {
  const toastApi = inject(toastKey)
  if (!toastApi) {
    throw new Error('请先在main.ts中调用 provideToast 注入Toast')
  }
  return toastApi
}