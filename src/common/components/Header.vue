<template>
  <header class="header">
    <div class="header-left">
      <h1 class="page-title">{{ pageTitle }}</h1>
    </div>
    
    <div class="header-right">
      <div class="header-actions">
        <button class="action-btn" title="通知">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>
        
        <div class="user-menu">
          <button class="user-btn" @click="toggleUserMenu">
            <div class="user-avatar">
              <span>{{ userInitial }}</span>
            </div>
            <span class="user-name">{{ userName }}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          
          <div v-if="showUserMenu" class="user-dropdown">
            <a href="#" class="dropdown-item">个人资料</a>
            <a href="#" class="dropdown-item">账户设置</a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item">退出登录</a>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showUserMenu = ref(false)

// 从路由获取页面标题，可以通过路由 meta 配置
const pageTitle = computed(() => {
  return (route.meta?.title as string) || '控制台'
})

// 用户信息（可以从 store 或 props 获取）
const userName = ref('用户')
const userInitial = computed(() => {
  return userName.value.charAt(0).toUpperCase()
})

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

// 点击外部关闭菜单
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.user-menu')) {
    showUserMenu.value = false
  }
}

// 组件挂载时添加事件监听
import { onMounted, onUnmounted } from 'vue'
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  padding: 0 var(--spacing-lg);
  background-color: var(--color-bg-darker);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  flex: 1;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.header-right {
  display: flex;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.action-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.action-btn:hover {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.action-btn svg {
  width: 20px;
  height: 20px;
}

.user-menu {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-btn:hover {
  background-color: rgba(255, 165, 0, 0.1);
  border-color: var(--color-primary);
}

.user-btn svg {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.user-menu:hover .user-btn svg {
  transform: rotate(180deg);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), #ff8c00);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-name {
  font-size: 0.95rem;
  font-weight: 500;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + var(--spacing-xs));
  right: 0;
  min-width: 180px;
  background-color: var(--color-bg-darker);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 1000;
}

.dropdown-item {
  display: block;
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.dropdown-item:hover {
  background-color: rgba(255, 165, 0, 0.1);
  color: var(--color-primary);
}

.dropdown-divider {
  height: 1px;
  background-color: var(--color-border);
  margin: var(--spacing-xs) 0;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.25rem;
  }
  
  .user-name {
    display: none;
  }
  
  .action-btn {
    width: 36px;
    height: 36px;
  }
}
</style>

