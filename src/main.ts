import { createApp } from 'vue'
import { createPinia } from 'pinia';
import './style.css'
import App from './App.vue'
import router from './router'
// 引入Toast组件 - 全局消息提示
import { provideToast } from './utils/useToast'
import Toast from './components/toast.vue'

const app = createApp(App)
app.use(router)
app.use(createPinia())
app.component('Toast', Toast)
// 注入Toast实例
provideToast(app)
// 挂载应用
app.mount('#app')

