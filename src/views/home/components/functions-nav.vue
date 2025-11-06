<template>
  <div class="nav-card-container" ref="rootEl">
		<!-- 功能快捷导航（数据同侧边菜单，无图标） -->
		<div class="quick-nav">
			<ul class="quick-list">
				<li
					v-for="item in menuItems"
					:key="item.path || item.label"
					class="quick-item glass-style"
					:class="{
						'has-children': item.children && item.children.length > 0,
						expanded: expandedKeys.includes(item.path || item.label),
					}"
				>
					<button class="quick-button" @click="onItemClick(item)">
						<span class="quick-text">{{ item.label }}</span>
						<span
							v-if="item.children && item.children.length > 0"
							class="quick-arrow"
							:class="{ expanded: expandedKeys.includes(item.path || item.label) }"
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
								<polyline points="6 9 12 15 18 9"></polyline>
							</svg>
						</span>
					</button>
          <transition name="submenu">
            <div
              v-if="
                item.children &&
                item.children.length > 0 &&
                expandedKeys.includes(item.path || item.label)
              "
              class="quick-popover"
            >
              <ul class="quick-sublist">
                <li v-for="child in item.children" :key="child.path" class="quick-subitem">
                  <button class="quick-subbutton" @click="go(child.path)">
                    <span class="quick-subtext">{{ child.label }}</span>
                  </button>
                </li>
              </ul>
            </div>
          </transition>
				</li>
			</ul>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { appMenu, type MenuItem } from '../../../common/menu';

const router = useRouter();
const rootEl = ref<HTMLElement | null>(null);

const isMobile = ref(false);

// 检测是否为移动端
const checkMobile = () => {
	isMobile.value = window.innerWidth <= 768;
};

onMounted(async () => {
	checkMobile();
	window.addEventListener('resize', checkMobile);
  const onDocClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (!rootEl.value) return
    const inPopover = target.closest('.quick-popover')
    const inButton = target.closest('.quick-button')
    if (!inPopover && !inButton) {
      expandedKeys.value = []
    }
  }
  document.addEventListener('click', onDocClick)
  // cleanup
  onUnmounted(() => document.removeEventListener('click', onDocClick))
});

onUnmounted(() => {
	window.removeEventListener('resize', checkMobile);
});

const menuItems: MenuItem[] = appMenu.slice(1);

const expandedKeys = ref<string[]>([]);

const onItemClick = (item: MenuItem) => {
	if (item.children && item.children.length > 0) {
		const key = item.path || item.label;
		const idx = expandedKeys.value.indexOf(key);
		if (idx > -1) expandedKeys.value.splice(idx, 1);
		else expandedKeys.value = [key]; // 手风琴，只展开一个
	} else if (item.path) {
		go(item.path);
	}
};

const go = (path: string) => {
	router.push(path);
};
</script>

<style scoped>
.nav-card-container {
	width: 100%;
	max-width: 1200px;
	margin: 0 auto;
	padding: var(--spacing-md);
	box-sizing: border-box;
}

.glass-style {
	backdrop-filter: blur(10px);
	border-radius: var(--radius-md);
	backdrop-filter: blur(10px);
	-webkit-backdrop-filter: blur(10px);
}

/* 响应式设计 */
/* 快捷导航样式 */
.quick-nav {
	margin-top: var(--spacing-lg);
}
.quick-list {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: var(--spacing-md);
	list-style: none;
	margin: 0;
	padding: 0;
}
.quick-item {
  list-style: none;
  position: relative;
  overflow: visible;
  z-index: 1;
}
.quick-button {
	width: 100%;
	padding: var(--spacing-md);
	background: var(--color-bg-darker);
	border: 2px solid rgba(255, 255, 255, 0.3);
	color: var(--color-text-primary);
	border-radius: var(--radius-sm);
	display: flex;
	align-items: center;
	justify-content: space-between;
	transition: all 0.2s ease;
	cursor: pointer;
}
.quick-button:hover {
	border-color: var(--color-primary);
	background: rgba(255, 140, 0, 0.08);
	color: var(--color-primary);
}
.quick-text {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.quick-arrow {
	margin-left: var(--spacing-sm);
	transition: transform 0.2s ease;
}
.quick-arrow.expanded {
	transform: rotate(180deg);
}
.quick-item.expanded {
  z-index: 20;
}
.quick-sublist {
	list-style: none;
	margin: 0;
	padding: 0;
}
.quick-popover {
  position: absolute;
  top: calc(100% + var(--spacing-xs));
  left: 0;
  right: 0;
  min-width: 220px;
  background: var(--color-bg-darker);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-xs);
  z-index: 30;
}
.quick-subitem:not(:last-child) {
	margin-bottom: var(--spacing-xs);
}
.quick-subbutton {
	width: 100%;
	padding: var(--spacing-sm) var(--spacing-md);
	background: transparent;
	border: 1px dashed var(--color-border);
	border-radius: var(--radius-sm);
	color: var(--color-text-secondary);
	text-align: left;
	cursor: pointer;
	transition: all 0.2s ease;
}
.quick-subbutton:hover {
	border-color: var(--color-primary);
	color: var(--color-primary);
	background: rgba(255, 140, 0, 0.06);
}

/* 子菜单动画 */
.submenu-enter-active,
.submenu-leave-active {
	transition: all 0.2s ease;
	max-height: 500px;
	opacity: 1;
}
.submenu-enter-from,
.submenu-leave-to {
	max-height: 0;
	opacity: 0;
}
@media (max-width: 768px) {
	.nav-card-container {
		padding: var(--spacing-md);
		width: 100%;
	}

	.quick-list {
		grid-template-columns: repeat(2, 1fr);
		gap: var(--spacing-sm);
	}
}

@media (max-width: 480px) {
	.nav-card-container {
		padding: var(--spacing-sm);
		width: 100%;
	}

	.quick-list {
		grid-template-columns: 1fr;
	}
}
</style>
