<!-- 用户管理API文档 -->
<template>
  <div class="user-api-doc-page p-5">
    <!-- 页面标题区域 -->
    <div class="api-doc-header mb-6">
      <h2 class="text-2xl font-bold mb-2 text-g-900">用户管理 API 文档</h2>
      <p class="text-g-700">包含用户列表查询、用户CRUD等用户管理相关接口</p>
    </div>

    <!-- API文档内容区域 -->
    <ElCard shadow="never" class="api-doc-content">
      <div v-for="(api, index) in userApiDocs" :key="index" class="api-doc-card mb-8 last:mb-0">
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

  defineOptions({ name: 'SystemApiDocUser' })

  // API文档数据
  const userApiDocs = ref([
    {
      name: '获取用户列表',
      description: '分页查询用户列表，支持按用户名、性别、手机号、邮箱、状态等条件筛选',
      path: '/api/user/list',
      method: 'GET',
      params: [
        { name: 'current', type: 'number', required: false, description: '当前页码，默认1' },
        { name: 'size', type: 'number', required: false, description: '每页条数，默认10' },
        { name: 'id', type: 'number', required: false, description: '用户ID' },
        {
          name: 'userName',
          type: 'string',
          required: false,
          description: '用户名（支持模糊查询）'
        },
        { name: 'userGender', type: 'string', required: false, description: '用户性别' },
        { name: 'userPhone', type: 'string', required: false, description: '用户手机号' },
        { name: 'userEmail', type: 'string', required: false, description: '用户邮箱' },
        { name: 'status', type: 'string', required: false, description: '用户状态' }
      ],
      requestExample: JSON.stringify(
        {
          params: {
            current: 1,
            size: 10,
            userName: 'admin',
            status: '1'
          }
        },
        null,
        2
      ),
      responseFields: [
        { name: 'records', type: 'UserListItem[]', description: '用户列表数据' },
        { name: 'current', type: 'number', description: '当前页码' },
        { name: 'size', type: 'number', description: '每页条数' },
        { name: 'total', type: 'number', description: '总记录数' }
      ],
      responseExample: JSON.stringify(
        {
          code: 200,
          data: {
            records: [
              {
                id: 1,
                avatar: 'https://example.com/avatar1.jpg',
                status: '1',
                userName: 'admin',
                userGender: '男',
                nickName: '管理员',
                userPhone: '13800138000',
                userEmail: 'admin@example.com',
                userRoles: ['R_SUPER'],
                createBy: 'system',
                createTime: '2024-01-01 00:00:00',
                updateBy: 'system',
                updateTime: '2024-01-01 00:00:00'
              }
            ],
            current: 1,
            size: 10,
            total: 1
          },
          message: '查询成功'
        },
        null,
        2
      ),
      roles: ['R_SUPER', 'R_ADMIN']
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
      {
        label: 'TypeScript类型',
        value: 'Api.SystemManage.UserSearchParams → Api.SystemManage.UserList'
      }
    ]
  }
</script>

<style scoped lang="scss">
  .user-api-doc-page {
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
