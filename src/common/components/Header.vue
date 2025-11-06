<template>
  <header class="header">
    <div class="header-left">
      <h1 class="page-title">{{ pageTitle }}</h1>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 从路由获取页面标题，可以通过路由 meta 配置
const pageTitle = computed(() => {
  return (route.meta?.title as string) || '控制台'
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

@media (max-width: 768px) {
  .page-title {
    font-size: 1.25rem;
  }
}
</style>

