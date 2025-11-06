<template>
  <!-- 遮罩层 -->
  <transition name="drawer-overlay">
    <div 
      v-if="visible"
      class="drawer-overlay"
      @click="handleOverlayClick"
    ></div>
  </transition>

  <!-- 抽屉 -->
  <transition name="drawer-slide">
    <aside 
      v-if="visible"
      class="drawer"
      @click.stop
    >
      <div class="drawer-header">
        <div class="drawer-logo">
          <h2>Turing Wallet Sample</h2>
        </div>
        <button class="drawer-close-btn" @click="handleClose">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <nav class="drawer-nav">
        <ul class="drawer-nav-list">
          <li
            v-for="item in menuItems"
            :key="item.path || item.label"
            class="drawer-nav-item"
            :class="{ 
              'has-children': item.children && item.children.length > 0,
              'expanded': item.children && expandedItems.includes(item.path || item.label),
              'active': item.children ? false : activeRoute === item.path,
              'active-parent': item.children && isActiveParent(item)
            }"
          >
            <!-- 有子菜单的项 -->
            <div 
              v-if="item.children && item.children.length > 0"
              class="drawer-nav-link parent-link"
              @click="toggleSubmenu(item)"
            >
              <span class="drawer-nav-icon" v-html="item.icon"></span>
              <span class="drawer-nav-text">{{ item.label }}</span>
              <span 
                class="drawer-nav-arrow"
                :class="{ 'expanded': expandedItems.includes(item.path || item.label) }"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </div>
            <!-- 没有子菜单的项 -->
            <router-link 
              v-else 
              :to="item.path || '/'"
              class="drawer-nav-link"
              @click="handleClose"
            >
              <span class="drawer-nav-icon" v-html="item.icon"></span>
              <span class="drawer-nav-text">{{ item.label }}</span>
            </router-link>
            
            <!-- 子菜单 -->
            <transition name="submenu">
              <ul 
                v-if="item.children && item.children.length > 0 && expandedItems.includes(item.path || item.label)"
                class="drawer-submenu-list"
              >
                <li
                  v-for="child in item.children"
                  :key="child.path"
                  class="drawer-submenu-item"
                  :class="{ active: activeRoute === child.path }"
                >
                  <router-link :to="child.path" class="drawer-submenu-link" @click="handleClose">
                    <span class="drawer-submenu-text">{{ child.label }}</span>
                  </router-link>
                </li>
              </ul>
            </transition>
          </li>
        </ul>
      </nav>
    </aside>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

interface SubMenuItem {
  path: string
  label: string
}

interface MenuItem {
  path?: string
  label: string
  icon: string
  children?: SubMenuItem[]
}

interface Props {
  visible: boolean
  menuItems: MenuItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'close': []
}>()

const route = useRoute()
const expandedItems = ref<string[]>([])

const activeRoute = computed(() => route.path)

// 切换子菜单展开/收起
const toggleSubmenu = (item: MenuItem) => {
  if (!item.children || item.children.length === 0) return
  
  const key = item.path || item.label
  const index = expandedItems.value.indexOf(key)
  
  if (index > -1) {
    expandedItems.value.splice(index, 1)
  } else {
    expandedItems.value = [key]
  }
}

// 检查是否为激活的父菜单
const isActiveParent = (item: MenuItem): boolean => {
  if (!item.children || item.children.length === 0) return false
  return item.children.some(child => activeRoute.value === child.path)
}

// 监听路由变化，自动展开包含当前路由的父菜单
watch(() => route.path, () => {
  const activePath = activeRoute.value
  let activeParentKey: string | null = null
  
  props.menuItems.forEach(item => {
    if (item.children && item.children.length > 0) {
      const hasActiveChild = item.children.some(child => child.path === activePath)
      if (hasActiveChild) {
        activeParentKey = item.path || item.label
      }
    }
  })
  
  if (activeParentKey && !expandedItems.value.includes(activeParentKey)) {
    expandedItems.value = [activeParentKey]
  }
}, { immediate: true })

// 关闭抽屉
const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

// 点击遮罩层关闭
const handleOverlayClick = () => {
  handleClose()
}

// 监听 visible 变化，控制 body 滚动
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 打开抽屉时禁止背景滚动
    document.body.style.overflow = 'hidden'
  } else {
    // 关闭抽屉时恢复滚动
    document.body.style.overflow = ''
  }
})

// 组件卸载时恢复滚动
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* 遮罩层 */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1998;
  backdrop-filter: blur(4px);
}

/* 抽屉 */
.drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  max-width: 85vw;
  background-color: var(--color-bg-darker);
  border-right: 1px solid var(--color-border);
  z-index: 1999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  min-height: var(--header-height);
  flex-shrink: 0;
}

.drawer-logo h2 {
  margin: 0;
  color: var(--color-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.drawer-close-btn {
  width: 32px;
  height: 32px;
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
  flex-shrink: 0;
}

.drawer-close-btn:hover {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.drawer-close-btn svg {
  width: 16px;
  height: 16px;
}

.drawer-nav {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm) 0;
}

.drawer-nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.drawer-nav-item {
  margin: var(--spacing-xs) var(--spacing-sm);
}

.drawer-nav-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: all 0.3s ease;
  cursor: pointer;
}

.drawer-nav-link:hover {
  background-color: rgba(255, 165, 0, 0.1);
  color: var(--color-primary);
}

.drawer-nav-item.active .drawer-nav-link {
  background-color: var(--color-primary);
  color: white;
}

.drawer-nav-item.active-parent .drawer-nav-link {
  color: var(--color-primary);
}

.drawer-nav-item.expanded .drawer-nav-link {
  background-color: rgba(255, 165, 0, 0.1);
  color: var(--color-primary);
}

.drawer-nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drawer-nav-icon svg {
  width: 100%;
  height: 100%;
}

.drawer-nav-text {
  white-space: nowrap;
  font-size: 0.95rem;
  flex: 1;
}

.drawer-nav-arrow {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.drawer-nav-arrow svg {
  width: 100%;
  height: 100%;
}

.drawer-nav-arrow.expanded {
  transform: rotate(180deg);
}

/* 子菜单样式 */
.drawer-submenu-list {
  list-style: none;
  margin: 0;
  padding: 0;
  padding-left: var(--spacing-md);
  overflow: hidden;
}

.drawer-submenu-item {
  margin: var(--spacing-xs) 0;
}

.drawer-submenu-link {
  display: flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-md);
  color: var(--color-text-tertiary);
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: all 0.3s ease;
  font-size: 0.9rem;
  padding-left: calc(var(--spacing-md) + 20px + var(--spacing-sm));
}

.drawer-submenu-link:hover {
  background-color: rgba(255, 165, 0, 0.1);
  color: var(--color-primary);
}

.drawer-submenu-item.active .drawer-submenu-link {
  background-color: var(--color-primary);
  color: white;
}

.drawer-submenu-text {
  white-space: nowrap;
}

/* 子菜单动画 */
.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  opacity: 1;
}

.submenu-enter-from {
  max-height: 0;
  opacity: 0;
}

.submenu-leave-to {
  max-height: 0;
  opacity: 0;
}

/* 遮罩层动画 */
.drawer-overlay-enter-active,
.drawer-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-overlay-enter-from,
.drawer-overlay-leave-to {
  opacity: 0;
}

/* 抽屉滑动动画 */
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s ease;
}

.drawer-slide-enter-from {
  transform: translateX(-100%);
}

.drawer-slide-leave-to {
  transform: translateX(-100%);
}

/* 滚动条样式 */
.drawer-nav::-webkit-scrollbar {
  width: 4px;
}

.drawer-nav::-webkit-scrollbar-track {
  background: transparent;
}

.drawer-nav::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}

.drawer-nav::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary);
}
</style>

