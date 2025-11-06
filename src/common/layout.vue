<template>
  <div class="layout-container">
    <!-- 侧边栏 - 桌面端显示 -->
    <Sidebar 
      v-if="!isMobile"
      :collapsed="sidebarCollapsed" 
      @update:collapsed="sidebarCollapsed = $event" 
    />
    
    <!-- 主内容区 -->
    <div class="main-wrapper" :class="{ 'sidebar-collapsed': sidebarCollapsed, 'mobile': isMobile }">
      <!-- 头部导航 -->
      <Header @toggleDrawer="drawerVisible = !drawerVisible" />
      
      <!-- 内容区域 -->
      <main class="content-area">
        <slot />
      </main>
    </div>

    <!-- 移动端抽屉菜单 -->
    <Drawer 
      v-if="isMobile"
      :visible="drawerVisible"
      :menuItems="menuItems"
      @update:visible="drawerVisible = $event"
      @close="drawerVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import Drawer from './components/Drawer.vue'

const sidebarCollapsed = ref(false)
const drawerVisible = ref(false)
const isMobile = ref(false)

// 菜单数据（从Sidebar组件复制，实际项目中应该从store或props获取）
const menuItems = [
  {
    path: '/',
    label: 'Home',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'
  },
  {
    path: '/signing-demo',
    label: 'Signing Demo',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><line x1="9" y1="10" x2="15" y2="10"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>',
    children: [
      {
        path: '/signing-demo/message-signing',
        label: 'Message Signing'
      },
      {
        path: '/signing-demo/sign-transaction',
        label: 'Sign Transaction'
      }
    ],
  },
  {
    path: '/crypt',
    label: 'Encrypt/Decrypt Demo',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>'
  },
  {
    path: '/decode-txraws',
    label: 'Decode Txraws',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>'
  },
  {
    path: '/keys-to-address',
    label: 'Keys to Address',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>'
  },
  {
    path: '/tbc',
    label: 'TBC',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>'
  },
  {
    path: '/ft',
    label: 'FT',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="3" y1="9" x2="21" y2="9"></line></svg>'
  },
  {
    path: '/nft',
    label: 'NFT',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>'
  },
  {
    path: '/poolnft',
    label: 'POOLNFT',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect><path d="M8 2v20M16 2v20M2 8h20M2 16h20"></path></svg>'
  },
  {
    path: '/wallet-test',
    label: 'Turing Wallet Test',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>'
  },
  {
    path: '/records',
    label: 'History Records',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>'
  }
]

// 检测是否为移动端
const checkMobile = () => {
  const mobile = window.innerWidth <= 768
  isMobile.value = mobile
  if (mobile) {
    sidebarCollapsed.value = true
    // 移动端自动关闭抽屉（如果从桌面端切换到移动端）
    if (drawerVisible.value) {
      drawerVisible.value = false
    }
  }
}

// 监听窗口大小变化
let mediaQuery: MediaQueryList | null = null
let handleMediaChange: ((e: MediaQueryListEvent) => void) | null = null

onMounted(() => {
  // 初始检测
  checkMobile()
  
  // 使用 matchMedia 监听屏幕尺寸变化
  mediaQuery = window.matchMedia('(max-width: 768px)')
  handleMediaChange = (e: MediaQueryListEvent) => {
    if (e.matches) {
      sidebarCollapsed.value = true
    }
  }
  
  // 现代浏览器支持
  if (mediaQuery.addEventListener && handleMediaChange) {
    mediaQuery.addEventListener('change', handleMediaChange)
  } else if (handleMediaChange) {
    // 兼容旧浏览器
    mediaQuery.addListener(handleMediaChange)
  }
  
  // 同时监听 resize 事件作为备用
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  if (mediaQuery && handleMediaChange) {
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', handleMediaChange)
    } else {
      mediaQuery.removeListener(handleMediaChange)
    }
  }
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.layout-container {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-bg-dark);
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: var(--sidebar-width);
  transition: margin-left 0.3s ease;
}

.main-wrapper.sidebar-collapsed {
  margin-left: var(--sidebar-collapsed-width);
}

.content-area {
  flex: 1;
  padding: var(--spacing-lg);
  overflow-y: auto;
  overflow-x: hidden;
  background-color: var(--color-bg-dark);
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-wrapper {
    margin-left: 0 !important;
    min-width: 0;
    overflow-x: hidden;
  }

  .content-area {
    padding: var(--spacing-md);
    min-width: 0;
    overflow-x: hidden;
  }

  /* 移动端完全隐藏侧边栏 */
  .layout-container :deep(.sidebar) {
    display: none !important;
  }
}

@media (max-width: 480px) {
  .content-area {
    padding: var(--spacing-sm);
    min-width: 0;
    overflow-x: hidden;
  }
}
</style>

