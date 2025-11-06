<template>
  <div class="home-page">
    <h2 class="home-page-title">测试工具</h2>
    <p class="home-page-subtitle">选择测试项目开始</p>
    <Address />
    <FunctionsNav />
  </div>
</template>

<script setup lang="ts">
import Address from './components/address.vue'
import FunctionsNav from './components/functions-nav.vue'
</script>

<style scoped>
.home-page {
  padding: var(--spacing-lg);
  min-height: calc(100vh - var(--header-height) - var(--spacing-lg)*2);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.home-page-title, .home-page-subtitle {
  margin: 0;
  margin-left: var(--spacing-md);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home-page {
    padding: var(--spacing-md);
    min-width: 0;
  }
}

@media (max-width: 480px) {
  .home-page {
    padding: var(--spacing-sm);
    min-width: 0;
  }
}
</style>

