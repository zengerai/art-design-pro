<!-- 认证模块API文档 -->
<template>
  <div class="auth-api-doc-page p-5">
    <!-- 页面标题区域 -->
    <div class="api-doc-header mb-6">
      <h2 class="text-2xl font-bold mb-2 text-g-900">认证模块 API 文档</h2>
      <p class="text-g-700">包含用户登录、获取用户信息等认证相关接口</p>
    </div>

    <!-- API文档内容区域 -->
    <ElCard shadow="never" class="api-doc-content">
      <div v-for="(api, index) in authApiDocs" :key="index" class="api-doc-card mb-8 last:mb-0">
        <!-- 接口标题 -->
        <div class="flex items-center mb-4">
          <ElTag :type="getMethodTagType(api.method)" class="mr-3">{{ api.method }}</ElTag>
          <h3 class="text-lg font-semibold text-g-900">{{ api.name }}</h3>
        </div>

        <!-- 接口描述 -->
        <p class="text-g-700 mb-4">{{ api.description }}</p>

        <ElDivider />

        <!-- 基本信息 -->
        <div class="mb-4">
          <h4 class="text-sm font-semibold text-g-800 mb-2">基本信息</h4>
          <ElTable :data="getBasicInfo(api)" border size="small" class="api-param-table">
            <ElTableColumn prop="label" label="属性" width="150" />
            <ElTableColumn prop="value" label="值" />
          </ElTable>
        </div>

        <!-- 请求参数 -->
        <div v-if="api.params && api.params.length" class="mb-4">
          <h4 class="text-sm font-semibold text-g-800 mb-2">请求参数</h4>
          <ElTable :data="api.params" border size="small" class="api-param-table">
            <ElTableColumn prop="name" label="参数名称" width="150" />
            <ElTableColumn prop="type" label="类型" width="120" />
            <ElTableColumn prop="required" label="必填" width="80" align="center">
              <template #default="{ row }">
                <ElTag :type="row.required ? 'danger' : 'info'" size="small">
                  {{ row.required ? '是' : '否' }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="description" label="说明" />
          </ElTable>
        </div>

        <!-- 请求示例 -->
        <div class="mb-4">
          <h4 class="text-sm font-semibold text-g-800 mb-2">请求示例</h4>
          <pre
            class="api-code-block p-4 bg-g-200 border-full-d rounded-md overflow-x-auto font-mono text-xs leading-[1.5]"
          ><code>{{ api.requestExample }}</code></pre>
        </div>

        <!-- 响应参数 -->
        <div v-if="api.responseFields && api.responseFields.length" class="mb-4">
          <h4 class="text-sm font-semibold text-g-800 mb-2">响应参数</h4>
          <ElTable :data="api.responseFields" border size="small" class="api-param-table">
            <ElTableColumn prop="name" label="参数名称" width="150" />
            <ElTableColumn prop="type" label="类型" width="120" />
            <ElTableColumn prop="description" label="说明" />
          </ElTable>
        </div>

        <!-- 响应示例 -->
        <div class="mb-4">
          <h4 class="text-sm font-semibold text-g-800 mb-2">响应示例</h4>
          <pre
            class="api-code-block p-4 bg-g-200 border-full-d rounded-md overflow-x-auto font-mono text-xs leading-[1.5]"
          ><code>{{ api.responseExample }}</code></pre>
        </div>

        <!-- 错误码说明 -->
        <div v-if="api.errorCodes && api.errorCodes.length" class="mb-4">
          <h4 class="text-sm font-semibold text-g-800 mb-2">错误码说明</h4>
          <ElTable :data="api.errorCodes" border size="small" class="api-param-table">
            <ElTableColumn prop="code" label="错误码" width="100" />
            <ElTableColumn prop="message" label="错误信息" width="200" />
            <ElTableColumn prop="description" label="说明" />
          </ElTable>
        </div>

        <!-- 权限要求 -->
        <div v-if="api.roles && api.roles.length">
          <h4 class="text-sm font-semibold text-g-800 mb-2">权限要求</h4>
          <div class="flex gap-2">
            <ElTag v-for="role in api.roles" :key="role" type="warning" size="small">
              {{ role }}
            </ElTag>
          </div>
        </div>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElCard, ElTable, ElTableColumn, ElTag, ElDivider } from 'element-plus'

  defineOptions({ name: 'SystemApiDocAuth' })

  // API文档数据
  const authApiDocs = ref([
    {
      name: '用户登录',
      description: '用户通过用户名和密码登录系统，成功后返回访问令牌和刷新令牌',
      path: '/api/auth/login',
      method: 'POST',
      params: [
        { name: 'userName', type: 'string', required: true, description: '用户账号' },
        { name: 'password', type: 'string', required: true, description: '用户密码' }
      ],
      requestExample: JSON.stringify(
        {
          userName: 'admin',
          password: '123456'
        },
        null,
        2
      ),
      responseFields: [
        { name: 'token', type: 'string', description: '访问令牌，用于后续API请求认证' },
        { name: 'refreshToken', type: 'string', description: '刷新令牌，用于获取新的访问令牌' }
      ],
      responseExample: JSON.stringify(
        {
          code: 200,
          data: {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          message: '登录成功'
        },
        null,
        2
      ),
      errorCodes: [
        { code: 401, message: 'Unauthorized', description: '用户名或密码错误' },
        { code: 403, message: 'Forbidden', description: '账号已被禁用' }
      ],
      roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
    },
    {
      name: '获取用户信息',
      description: '根据当前登录用户的Token获取用户详细信息，包括角色、权限等',
      path: '/api/user/info',
      method: 'GET',
      params: [],
      requestExample: JSON.stringify(
        {
          headers: {
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          }
        },
        null,
        2
      ),
      responseFields: [
        { name: 'userId', type: 'number', description: '用户ID' },
        { name: 'userName', type: 'string', description: '用户名' },
        { name: 'email', type: 'string', description: '用户邮箱' },
        { name: 'avatar', type: 'string', description: '用户头像URL（可选）' },
        { name: 'roles', type: 'string[]', description: '用户角色列表' },
        { name: 'buttons', type: 'string[]', description: '用户按钮权限列表' }
      ],
      responseExample: JSON.stringify(
        {
          code: 200,
          data: {
            userId: 1,
            userName: 'admin',
            email: 'admin@example.com',
            avatar: 'https://example.com/avatar.jpg',
            roles: ['R_SUPER'],
            buttons: ['add', 'edit', 'delete']
          },
          message: '获取成功'
        },
        null,
        2
      ),
      errorCodes: [
        { code: 401, message: 'Unauthorized', description: 'Token无效或已过期' },
        { code: 404, message: 'Not Found', description: '用户不存在' }
      ],
      roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
    }
  ])

  // 获取请求方法标签类型
  const getMethodTagType = (method: string) => {
    const typeMap: Record<string, 'success' | 'primary' | 'warning' | 'danger' | 'info'> = {
      GET: 'success',
      POST: 'primary',
      PUT: 'warning',
      DELETE: 'danger',
      PATCH: 'info'
    }
    return typeMap[method] || 'info'
  }

  // 获取基本信息
  const getBasicInfo = (api: any) => {
    return [
      { label: '请求路径', value: api.path },
      { label: '请求方法', value: api.method },
      { label: 'TypeScript类型', value: getTypeScriptType(api) }
    ]
  }

  // 获取TypeScript类型定义
  const getTypeScriptType = (api: any) => {
    if (api.name === '用户登录') {
      return 'Api.Auth.LoginParams → Api.Auth.LoginResponse'
    } else if (api.name === '获取用户信息') {
      return '无参数 → Api.Auth.UserInfo'
    }
    return '参考 /src/types/api/api.d.ts'
  }
</script>

<style scoped lang="scss">
  .auth-api-doc-page {
    min-height: 100%;

    :deep(.el-card__body) {
      padding: 24px;
    }

    .api-doc-card {
      padding-bottom: 32px;
      border-bottom: 1px solid var(--el-border-color-light);

      &:last-child {
        padding-bottom: 0;
        border-bottom: none;
      }
    }

    .api-code-block {
      code {
        font-family: Consolas, Monaco, 'Courier New', monospace;
        color: var(--el-text-color-primary);
      }
    }
  }
</style>
