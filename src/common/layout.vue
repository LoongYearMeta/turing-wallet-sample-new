<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <Sidebar :collapsed="sidebarCollapsed" @update:collapsed="sidebarCollapsed = $event" />
    
    <!-- 主内容区 -->
    <div class="main-wrapper" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <!-- 头部导航 -->
      <Header />
      
      <!-- 内容区域 -->
      <main class="content-area">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'

const sidebarCollapsed = ref(false)

// 检测是否为移动端
const checkMobile = () => {
  const isMobile = window.innerWidth <= 768
  if (isMobile) {
    sidebarCollapsed.value = true
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
  background-color: var(--color-bg-dark);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-wrapper {
    margin-left: 0 !important;
  }
}
</style>

