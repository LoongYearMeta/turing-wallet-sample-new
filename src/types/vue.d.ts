import { ToastApi } from '../utils/useToast';

declare module 'vue' {
  interface ComponentCustomProperties {
    toastApi: ToastApi;
  }
}