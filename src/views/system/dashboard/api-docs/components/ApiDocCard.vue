<template>
  <ElCard shadow="hover" class="api-card">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <ElTag :type="getMethodType(api.method)" size="large">{{ api.method }}</ElTag>
          <span class="text-lg font-semibold">{{ api.name }}</span>
          <ElTag v-if="api.permission" type="warning" size="small">{{ api.permission }}</ElTag>
        </div>
        <code class="text-sm text-gray-600 dark:text-gray-400">{{ api.path }}</code>
      </div>
    </template>

    <!-- 接口描述 -->
    <div class="mb-4">
      <p class="text-gray-600 dark:text-gray-300">{{ api.description }}</p>
    </div>

    <!-- 请求示例 -->
    <div class="mb-4">
      <h4 class="text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">请求示例</h4>
      <pre
        class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-md overflow-x-auto text-xs"
      ><code>{{ api.requestExample }}</code></pre>
    </div>

    <!-- 响应示例 -->
    <div>
      <h4 class="text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">响应示例</h4>
      <pre
        class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-md overflow-x-auto text-xs"
      ><code>{{ api.responseExample }}</code></pre>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  interface Props {
    api: {
      name: string
      path: string
      method: string
      description: string
      permission?: string
      requestExample: string
      responseExample: string
    }
  }

  defineProps<Props>()

  const getMethodType = (method: string) => {
    const types: Record<string, 'success' | 'primary' | 'warning' | 'danger'> = {
      GET: 'success',
      POST: 'primary',
      PUT: 'warning',
      DELETE: 'danger'
    }
    return types[method] || 'info'
  }
</script>

<style scoped lang="scss">
  .api-card {
    :deep(.el-card__header) {
      padding: 16px 20px;
      background-color: var(--el-fill-color-light);
    }
  }

  pre {
    font-family: 'Courier New', Courier, monospace;
    line-height: 1.5;
  }

  code {
    word-wrap: break-word;
    white-space: pre-wrap;
  }
</style>
