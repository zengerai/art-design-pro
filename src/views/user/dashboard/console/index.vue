<!-- 用户工作台 -->
<template>
  <div class="p-5">
    <div class="bg-default-box-color rounded-lg shadow-sm p-6">
      <h2 class="text-2xl font-bold mb-4 text-g-900">用户工作台</h2>
      <p class="text-g-700">欢迎使用虚拟币数据分析系统</p>
      <!-- 后续在此添加普通用户和管理员共享的数据面板和功能模块 -->
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted } from 'vue'
  import { useUserStore } from '@/store/modules/user'

  defineOptions({ name: 'UserConsole' })

  const userStore = useUserStore()

  // 获取当前用户信息
  const currentUser = computed(() => userStore.getUserInfo)

  onMounted(() => {
    console.log('[UserConsole] 用户工作台已加载', currentUser.value)
  })
</script>

<style scoped lang="scss">
  // 自定义样式
</style>
