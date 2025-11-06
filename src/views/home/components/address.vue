<template>
  <div class="nav-card-container">
    <div class="nav-header">
      <div v-if="!isConnected" class="nav-button">
        <button @click="connectWallet">
          <span class="nav-button-text">连接钱包</span>
          <svg t="1762419533042" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="36965" width="24" height="24">
            <path d="M926.5 491.64c-0.34-6.78-0.84-13.55-1.5-20.31-0.67-6.76-1.5-13.5-2.49-20.21-1-6.72-2.16-13.41-3.48-20.07-1.32-6.66-2.81-13.29-4.47-19.87-1.65-6.59-3.46-13.13-5.43-19.63-1.97-6.5-4.1-12.95-6.39-19.34-2.29-6.4-4.73-12.73-7.33-19-2.6-6.28-5.35-12.48-8.25-18.62-2.91-6.14-5.96-12.2-9.16-18.19-3.2-5.99-6.55-11.9-10.04-17.72-3.49-5.83-7.12-11.56-10.89-17.21-3.77-5.65-7.68-11.2-11.73-16.65a413.95 413.95 0 0 0-12.53-16.06c-4.31-5.25-8.75-10.39-13.31-15.42a415.894 415.894 0 0 0-28.79-28.8c-5.03-4.56-10.17-9-15.43-13.3-5.25-4.31-10.6-8.49-16.06-12.53a411.595 411.595 0 0 0-33.86-22.62c-5.82-3.49-11.73-6.84-17.72-10.04a412.64 412.64 0 0 0-18.2-9.16c-6.14-2.9-12.35-5.65-18.62-8.25a416.318 416.318 0 0 0-38.35-13.72 416.033 416.033 0 0 0-39.5-9.89c-6.66-1.32-13.35-2.49-20.07-3.48-6.72-0.99-13.46-1.83-20.22-2.49-6.76-0.66-13.53-1.17-20.31-1.5-6.79-0.4-13.58-0.56-20.37-0.56s-13.58 0.16-20.36 0.5c-6.78 0.33-13.55 0.83-20.31 1.5s-13.5 1.5-20.22 2.49c-6.72 1-13.41 2.16-20.07 3.48-6.66 1.33-13.29 2.81-19.88 4.46s-13.13 3.46-19.63 5.43c-6.5 1.97-12.95 4.1-19.34 6.39-6.4 2.29-12.73 4.73-19.01 7.33-6.28 2.6-12.48 5.35-18.62 8.25s-12.21 5.96-18.19 9.16c-5.99 3.2-11.9 6.55-17.72 10.04-5.83 3.49-11.56 7.12-17.21 10.89-5.65 3.77-11.2 7.68-16.65 11.73a413.95 413.95 0 0 0-46.23 39.88c-4.8 4.8-9.49 9.72-14.05 14.75-4.56 5.03-9 10.17-13.3 15.42-4.31 5.25-8.49 10.6-12.53 16.06-4.04 5.46-7.95 11.01-11.73 16.65a415.648 415.648 0 0 0-20.94 34.93c-3.2 5.99-6.25 12.05-9.16 18.19a415.937 415.937 0 0 0-21.97 56.96 416.033 416.033 0 0 0-9.89 39.5c-1.33 6.66-2.49 13.35-3.48 20.07-1 6.72-1.83 13.46-2.49 20.21-0.67 6.76-1.17 13.53-1.5 20.31-0.35 6.84-0.52 13.63-0.52 20.42s0.17 13.58 0.5 20.36c0.34 6.79 0.83 13.55 1.5 20.31 0.66 6.76 1.49 13.5 2.49 20.22s2.16 13.41 3.48 20.07a416.033 416.033 0 0 0 9.89 39.5c1.97 6.5 4.1 12.95 6.39 19.34 2.29 6.4 4.73 12.73 7.33 19.01 2.6 6.28 5.35 12.48 8.25 18.62 2.9 6.14 5.96 12.21 9.16 18.2 3.2 5.99 6.55 11.9 10.04 17.72s7.12 11.56 10.9 17.21c3.77 5.65 7.68 11.2 11.73 16.65a423.95 423.95 0 0 0 12.53 16.06c4.31 5.25 8.75 10.4 13.3 15.43 4.56 5.03 9.25 9.95 14.05 14.75 4.8 4.8 9.72 9.48 14.75 14.05 5.03 4.56 10.17 9 15.42 13.3 5.25 4.31 10.6 8.49 16.06 12.53 5.46 4.04 11.01 7.95 16.65 11.73 5.65 3.77 11.38 7.4 17.21 10.89 5.83 3.5 11.73 6.84 17.72 10.04 5.99 3.2 12.05 6.25 18.19 9.16 6.14 2.91 12.35 5.66 18.62 8.25a408.651 408.651 0 0 0 38.35 13.72c6.5 1.97 13.04 3.78 19.63 5.43s13.22 3.14 19.88 4.47c6.66 1.32 13.35 2.48 20.07 3.48 6.72 0.99 13.46 1.83 20.22 2.49 6.76 0.66 13.53 1.17 20.31 1.5 6.78 0.33 13.57 0.5 20.36 0.5s13.58-0.17 20.36-0.5c6.78-0.33 13.55-0.83 20.31-1.5 6.76-0.67 13.5-1.5 20.22-2.49 6.72-1 13.41-2.16 20.07-3.48 6.66-1.33 13.29-2.81 19.87-4.47 6.59-1.65 13.13-3.46 19.63-5.43 6.5-1.97 12.94-4.1 19.34-6.38 6.39-2.29 12.73-4.74 19.01-7.34 6.27-2.6 12.48-5.35 18.62-8.25 6.14-2.9 12.21-5.96 18.2-9.16 5.99-3.2 11.9-6.55 17.72-10.04 5.83-3.49 11.57-7.12 17.21-10.89 5.65-3.78 11.2-7.69 16.65-11.73 5.45-4.05 10.81-8.22 16.06-12.53 5.25-4.31 10.39-8.75 15.43-13.3a416.175 416.175 0 0 0 42.1-44.23c4.31-5.25 8.49-10.6 12.53-16.06 4.04-5.45 7.95-11 11.73-16.65 3.77-5.65 7.41-11.39 10.89-17.21 3.49-5.83 6.84-11.73 10.04-17.72 3.2-5.99 6.25-12.06 9.16-18.2 2.9-6.14 5.65-12.35 8.25-18.62s5.04-12.61 7.33-19.01c2.29-6.39 4.41-12.84 6.39-19.34 1.97-6.5 3.78-13.04 5.43-19.63a409.962 409.962 0 0 0 7.95-39.94c0.99-6.72 1.83-13.46 2.49-20.22 0.66-6.76 1.16-13.53 1.5-20.31 0.33-6.78 0.5-13.57 0.5-20.36s-0.13-13.58-0.47-20.36zM717.21 343.95l-164.3 426.11a29.032 29.032 0 0 1-26.52 18.6c-11.8 0.23-22.56-6.7-27.23-17.53L424.85 598.8l-171.99-74.02a29.028 29.028 0 0 1-17.53-27.2 29.012 29.012 0 0 1 18.54-26.52l425.77-164.64v0.05a29.019 29.019 0 0 1 30.98 6.53 28.97 28.97 0 0 1 6.59 30.95z" p-id="36966" fill="#ff8c01"></path><path d="M443.96 554.36a48.375 48.375 0 0 1 23.27 21.12l2.03 4.16L524.8 708.4l131.52-341.1-340.81 131.76 128.45 55.3z" p-id="36967" fill="#ff8c01">
            </path>
          </svg>
        </button>
      </div>
    </div>
    <div class="wallet-status-card glass-style">
      <div class="status-indicator" :class="{ connected: isConnected, disconnected: !isConnected }">
        <svg v-if="isConnected" class="status-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <path d="M465.472 553.088L329.344 416.96a63.552 63.552 0 0 0-89.856 0l-0.64 0.64a63.552 63.552 0 0 0 0 89.92l181.632 181.632a63.36 63.36 0 0 0 89.92 0l317.44-317.44a63.552 63.552 0 0 0 0-89.856l-0.64-0.64a63.552 63.552 0 0 0-89.92 0L465.472 553.088zM512 1024A512 512 0 1 1 512 0a512 512 0 0 1 0 1024z" fill="#ff8c01" p-id="29415"></path>
        </svg>
        <svg v-else class="status-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <path d="M512 1024A512 512 0 1 1 512 0a512 512 0 0 1 0 1024z" fill="#FF3939" p-id="29416"></path>
          <path
            d="M350 350L674 674M674 350L350 674"
            fill="none"
            stroke="#FFFFFF"
            stroke-width="70"
            stroke-linecap="round"
            p-id="29417"
          ></path>
        </svg>
      </div>
      <div class="wallet-info">
        <div class="wallet-address" v-if="isConnected && walletInfo.address">
          {{ displayAddress }}
        </div>
        <div class="wallet-address" v-else>
          0x0000...0000
        </div>
        <div class="wallet-status-text" :class="{ connected: isConnected, disconnected: !isConnected }">
          {{ isConnected ? '已连接' : '未连接' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, onUnmounted } from 'vue'
import { useWalletStore } from '../../../stores/wallet'
import { storeToRefs } from 'pinia'

const walletStore = useWalletStore()
const { walletInfo, isConnected } = storeToRefs(walletStore)
const { getWalletInfo } = walletStore

const isMobile = ref(false)

// 格式化地址显示（中间省略）
const formatAddress = (address: string) => {
  if (!address) return '--'
  if (address.length <= 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// 根据屏幕大小决定显示完整地址还是格式化地址
const displayAddress = computed(() => {
  if (!isConnected.value || !walletInfo.value.address) return ''
  // 移动端或小窗口时使用格式化地址
  if (isMobile.value) {
    return formatAddress(walletInfo.value.address)
  }
  // 桌面端显示完整地址
  return walletInfo.value.address
})

// 检测是否为移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 连接钱包（主动触发授权连接）
const connectWallet = async () => {
  try {
    if (walletStore.getAddress) {
      await walletStore.getAddress()
    } else {
      await getWalletInfo()
    }
  } catch (e) {
    console.error('连接钱包失败', e)
  }
}

// 初始化时检查钱包连接状态
onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  // 调用store的方法检查钱包信息
  await getWalletInfo()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.nav-card-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-md);
  box-sizing: border-box;
}

.nav-header {
  padding: 0;
  width: 100%;
  box-sizing: border-box;
}

/* 连接钱包按钮容器与样式 */
.nav-button {
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-button button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-primary);
  background: rgba(255, 140, 0, 0.15);
  color: var(--color-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-button button.nav-button:hover {
  background: var(--color-primary);
  color: #fff;
}

.nav-button-text {
  white-space: nowrap;
  margin-right: 4px;
}

.nav-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  line-height: 1.2;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.nav-subtitle {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

.glass-style {
  backdrop-filter: blur(10px);
  border-radius: var(--radius-md);
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.wallet-status-card {
  padding: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  transition: all 0.3s ease;
}

.wallet-status-card:hover {
  border-color: var(--color-border-light);
  box-shadow: var(--shadow-sm);
  background-color: rgba(255, 255, 255, 0.08);
}

.status-indicator {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background-color: #ff6b00;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.status-indicator.connected {
  background-color: rgba(255, 140, 1, 0.2);
  color: #51cf66;
}

.status-indicator.disconnected {
  background-color: rgba(255, 57, 57, 0.2);
  color: #ff3939;
}

.status-indicator svg {
  width: 100%;
  height: 100%;
}

.status-icon {
  display: block;
}

.wallet-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.wallet-address {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text-primary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace;
  word-break: break-all;
  line-height: 1.4;
  letter-spacing: 0.5px;
}

.wallet-address.placeholder {
  color: var(--color-text-tertiary);
  opacity: 0.6;
}

.wallet-status-text {
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
  transition: color 0.3s ease;
  font-weight: 400;
}

.wallet-status-text.connected {
  color: #51cf66;
}
.wallet-status-text.disconnected {
  color: #ff3939;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-card-container {
    padding: var(--spacing-md);
    width: 100%;
  }

  .nav-header {
    margin-bottom: var(--spacing-md);
    padding: 0;
  }

  .nav-title {
    font-size: 1.5rem;
    word-break: break-word;
    overflow-wrap: break-word;
  }

  .nav-subtitle {
    font-size: 0.9rem;
    word-break: break-word;
    overflow-wrap: break-word;
  }

  .wallet-status-card {
    padding: var(--spacing-sm);
    gap: var(--spacing-sm);
    width: 100%;
    box-sizing: border-box;
  }

  .status-indicator {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
  }

  .status-indicator svg {
    width: 20px;
    height: 20px;
  }

  .wallet-address {
    font-size: 0.9rem;
    word-break: break-all;
    overflow-wrap: break-word;
  }

  .wallet-status-text {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .nav-card-container {
    padding: var(--spacing-sm);
    width: 100%;
  }

  .nav-header {
    margin-bottom: var(--spacing-sm);
    padding: 0;
  }

  .nav-title {
    font-size: 1.25rem;
    line-height: 1.3;
    word-break: break-word;
    overflow-wrap: break-word;
  }

  .nav-subtitle {
    font-size: 0.85rem;
    word-break: break-word;
    overflow-wrap: break-word;
  }

  .wallet-status-card {
    flex-direction: row;
    align-items: center;
    text-align: left;
    padding: var(--spacing-sm);
    gap: var(--spacing-sm);
    width: 100%;
    box-sizing: border-box;
  }

  .status-indicator {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
  }

  .status-indicator svg {
    width: 18px;
    height: 18px;
  }

  .wallet-info {
    min-width: 0;
    flex: 1;
  }

  .wallet-address {
    font-size: 0.85rem;
    word-break: break-all;
    overflow-wrap: break-word;
  }

  .wallet-status-text {
    font-size: 0.75rem;
  }
}
</style>

