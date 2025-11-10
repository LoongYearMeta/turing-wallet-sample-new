<script setup lang="ts">
import Layout from './common/layout.vue'
import { RouterView } from 'vue-router'
import { useToast } from './utils/useToast'

const toastApi = useToast()
</script>

<template>
  <Layout>
    <RouterView />
  </Layout>
  <!-- 全局消息提示 -->
  <Toast
    v-if="toastApi.state.visible"
    :visible="toastApi.state.visible"
    :type="toastApi.state.type"
    :message="toastApi.state.message"
    :duration="toastApi.state.duration"
    @close="toastApi.close"
  />
</template>

<style scoped>
/* App.vue 样式已移至全局样式文件 */
</style>
