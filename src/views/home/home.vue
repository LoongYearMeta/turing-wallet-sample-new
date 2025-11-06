<template>
  <div class="home-page">
    <NavCard />
  </div>
</template>

<script setup lang="ts">
import NavCard from './components/nav.vue'
</script>

<style scoped>
.home-page {
  padding: var(--spacing-lg);
  min-height: calc(100vh - var(--header-height));
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
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

