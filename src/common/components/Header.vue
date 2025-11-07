<template>
  <header class="header">
    <button
      v-if="isMobile"
      class="mobile-menu-btn"
      @click="$emit('toggleDrawer')"
      aria-label="打开菜单"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>
    <div class="header-left">
      <h1 class="page-title">{{ pageTitle }}</h1>
    </div>
    <div class="header-right" v-if="walletAddress">
      <div class="wallet-address-badge">
        <span class="wallet-address-text">{{ displayAddress }}</span>
      </div>
    </div>
    <button v-else @click="walletStore.getAddress">Connect Wallet</button>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useWalletStore } from '../../stores/wallet'
import { storeToRefs } from 'pinia'

const route = useRoute()
const isMobile = ref(false)

const emit = defineEmits<{
  toggleDrawer: []
}>()

const walletStore = useWalletStore()
const { walletInfo, isConnected } = storeToRefs(walletStore)

// 从路由获取页面标题，可以通过路由 meta 配置
const pageTitle = computed(() => {
  return (route.meta?.title as string) || '控制台'
})

// 钱包地址（仅在连接时显示）
const walletAddress = computed(() => {
  return isConnected.value ? walletInfo.value.address : ''
})

// 格式化地址显示
const formatAddress = (address: string) => {
  if (!address) return ''
  if (address.length <= 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// 根据屏幕大小决定显示完整地址还是格式化地址
const displayAddress = computed(() => {
  if (!walletAddress.value) return ''
  // 移动端或小窗口时使用格式化地址
  if (isMobile.value) {
    return formatAddress(walletAddress.value)
  }
  // 桌面端显示完整地址
  return walletAddress.value
})

// 检测是否为移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  height: var(--header-height);
  padding: 0 var(--spacing-lg);
  background-color: var(--color-bg-darker);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
  min-width: 0;
  overflow: visible;
  gap: var(--spacing-sm);
}

.mobile-menu-btn {
  display: none;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  flex-shrink: 0;
  margin-right: var(--spacing-sm);
}

.mobile-menu-btn:hover {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.mobile-menu-btn svg {
  width: 20px;
  height: 20px;
}

.header-left {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.header-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  min-width: 0;
}

.wallet-address-badge {
  display: flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: rgba(255, 140, 0, 0.1);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  transition: all 0.3s ease;
  max-width: 100%;
  min-width: 0;
}

.wallet-address-badge:hover {
  background-color: rgba(255, 140, 0, 0.15);
}

.wallet-address-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-primary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace;
  letter-spacing: 0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

@media (max-width: 768px) {
  .header {
    padding: 0 var(--spacing-md);
    gap: var(--spacing-xs);
    overflow: hidden;
  }

  .mobile-menu-btn {
    display: flex;
    flex-shrink: 0;
  }

  .page-title {
    font-size: 1.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1;
    min-width: 0;
  }

  .header-right {
    margin-left: 0;
    flex-shrink: 0;
  }

  .wallet-address-badge {
    width: 120px;
    min-width: 120px;
    max-width: 120px;
    overflow: hidden;
    position: relative;
  }

  .wallet-address-text {
    font-size: 0.8rem;
    display: block;
    width: max-content;
    min-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    cursor: grab;
    user-select: none;
  }

  .wallet-address-text:active {
    cursor: grabbing;
  }

  .wallet-address-text::-webkit-scrollbar {
    display: none;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 0 var(--spacing-sm);
    gap: var(--spacing-xs);
    overflow: hidden;
  }

  .page-title {
    font-size: 1.1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1;
    min-width: 0;
  }

  .header-right {
    margin-left: 0;
    flex-shrink: 0;
  }

  .wallet-address-badge {
    padding: 4px var(--spacing-xs);
    width: 100px;
    min-width: 100px;
    max-width: 100px;
    overflow: hidden;
    position: relative;
  }

  .wallet-address-text {
    font-size: 0.75rem;
    display: block;
    width: max-content;
    min-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    cursor: grab;
    user-select: none;
  }

  .wallet-address-text:active {
    cursor: grabbing;
  }

  .wallet-address-text::-webkit-scrollbar {
    display: none;
  }
}
</style>

