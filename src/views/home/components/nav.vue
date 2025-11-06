<template>
  <div class="nav-card-container">
    <div class="nav-header">
      <h2 class="nav-title">测试工具导航</h2>
      <p class="nav-subtitle">选择测试项目开始</p>
    </div>
    <div class="wallet-status-card">
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
  border-radius: var(--radius-md);
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.nav-header {
  margin-bottom: var(--spacing-lg);
  padding: 0;
  width: 100%;
  box-sizing: border-box;
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

.wallet-status-card {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
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

