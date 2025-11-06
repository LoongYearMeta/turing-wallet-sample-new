<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <div class="logo" v-if="!isCollapsed">
        <h2>Turing Wallet Sample</h2>
      </div>
      <button class="collapse-btn" @click="toggleCollapse">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path v-if="!isCollapsed" d="M9 18l6-6-6-6" />
          <path v-else d="M15 18l-6-6 6-6" />
        </svg>
      </button>
    </div>
    
    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li
          v-for="item in menuItems"
          :key="item.path || item.label"
          class="nav-item"
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
            class="nav-link parent-link"
            @click="toggleSubmenu(item)"
          >
            <span class="nav-icon" v-html="item.icon"></span>
            <span class="nav-text" v-if="!isCollapsed">{{ item.label }}</span>
            <span 
              v-if="!isCollapsed && item.children && item.children.length > 0" 
              class="nav-arrow"
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
            class="nav-link"
          >
            <span class="nav-icon" v-html="item.icon"></span>
            <span class="nav-text" v-if="!isCollapsed">{{ item.label }}</span>
          </router-link>
          
          <!-- 子菜单 -->
          <transition name="submenu">
            <ul 
              v-if="item.children && item.children.length > 0 && expandedItems.includes(item.path || item.label) && !isCollapsed"
              class="submenu-list"
            >
              <li
                v-for="child in item.children"
                :key="child.path"
                class="submenu-item"
                :class="{ active: activeRoute === child.path }"
              >
                <router-link :to="child.path" class="submenu-link">
                  <span class="submenu-text">{{ child.label }}</span>
                </router-link>
              </li>
            </ul>
          </transition>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
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
  collapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false
})

const emit = defineEmits<{
  'update:collapsed': [value: boolean]
}>()

const route = useRoute()
const isCollapsed = ref(props.collapsed)
const expandedItems = ref<string[]>([])

// 同步 prop 和内部状态
watch(() => props.collapsed, (newVal) => {
  isCollapsed.value = newVal
  // 收起侧边栏时，关闭所有子菜单
  if (newVal) {
    expandedItems.value = []
  }
})

const activeRoute = computed(() => route.path)

const menuItems: MenuItem[] = [
  {
    path: '/',
    label: '首页',
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

// 切换子菜单展开/收起
const toggleSubmenu = (item: MenuItem) => {
  if (!item.children || item.children.length === 0) return
  
  const key = item.path || item.label
  const index = expandedItems.value.indexOf(key)
  
  if (index > -1) {
    // 收起
    expandedItems.value.splice(index, 1)
  } else {
    // 展开（手风琴效果：只展开一个）
    expandedItems.value = [key]
  }
}

// 检查是否为激活的父菜单
const isActiveParent = (item: MenuItem): boolean => {
  if (!item.children || item.children.length === 0) return false
  return item.children.some(child => activeRoute.value === child.path)
}

// 自动展开包含当前路由的父菜单（保持手风琴效果）
const expandActiveParent = () => {
  const activePath = activeRoute.value
  let activeParentKey: string | null = null
  
  // 查找包含当前路由的父菜单
  menuItems.forEach(item => {
    if (item.children && item.children.length > 0) {
      const hasActiveChild = item.children.some(child => child.path === activePath)
      if (hasActiveChild) {
        activeParentKey = item.path || item.label
      }
    }
  })
  
  // 如果找到激活的父菜单，展开它（手风琴效果：只展开一个）
  if (activeParentKey) {
    expandedItems.value = [activeParentKey]
  }
}

// 监听路由变化，自动展开包含当前路由的父菜单
watch(() => route.path, () => {
  expandActiveParent()
}, { immediate: true })

// 初始化时，如果当前路由在子菜单中，自动展开父菜单
onMounted(() => {
  expandActiveParent()
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  emit('update:collapsed', isCollapsed.value)
}

// 暴露菜单项给父组件，便于外部修改
defineExpose({
  menuItems
})
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: var(--sidebar-width);
  background-color: var(--color-bg-darker);
  border-right: 1px solid var(--color-border);
  transition: width 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  min-height: var(--header-height);
}

.logo h2 {
  margin: 0;
  color: var(--color-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.collapse-btn {
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

.collapse-btn:hover {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.collapse-btn svg {
  width: 16px;
  height: 16px;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm) 0;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin: var(--spacing-xs) var(--spacing-sm);
}

.nav-link {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: all 0.3s ease;
  cursor: pointer;
}

.nav-link:hover {
  background-color: rgba(255, 165, 0, 0.1);
  color: var(--color-primary);
}

.nav-item.active .nav-link {
  background-color: var(--color-primary);
  color: white;
}

/* 父菜单链接样式 */
.parent-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.nav-arrow {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.nav-arrow svg {
  width: 100%;
  height: 100%;
}

.nav-arrow.expanded {
  transform: rotate(180deg);
}

/* 激活的父菜单样式 */
.nav-item.active-parent .parent-link {
  color: var(--color-primary);
}

.nav-item.expanded .parent-link {
  background-color: rgba(255, 165, 0, 0.1);
  color: var(--color-primary);
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon svg {
  width: 100%;
  height: 100%;
}

.nav-text {
  white-space: nowrap;
  font-size: 0.95rem;
}

.sidebar.collapsed .nav-text {
  display: none;
}

.sidebar.collapsed .logo {
  display: none;
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
}

/* 收起状态下图标居中 */
.sidebar.collapsed .nav-link {
  justify-content: center;
  padding: var(--spacing-sm);
  gap: 0;
}

.sidebar.collapsed .nav-item {
  display: flex;
  justify-content: center;
  margin: var(--spacing-xs) var(--spacing-sm);
}

/* 滚动条样式 */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary);
}

/* 子菜单样式 */
.submenu-list {
  list-style: none;
  margin: 0;
  padding: 0;
  padding-left: var(--spacing-md);
  overflow: hidden;
}

.submenu-item {
  margin: var(--spacing-xs) 0;
}

.submenu-link {
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

.submenu-link:hover {
  background-color: rgba(255, 165, 0, 0.1);
  color: var(--color-primary);
}

.submenu-item.active .submenu-link {
  background-color: var(--color-primary);
  color: white;
}

.submenu-text {
  white-space: nowrap;
}

/* 子菜单展开/收起动画 */
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

/* 收起状态下隐藏子菜单 */
.sidebar.collapsed .submenu-list {
  display: none;
}

.sidebar.collapsed .nav-arrow {
  display: none;
}
</style>

