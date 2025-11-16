<!-- 角色管理API文档 -->
<template>
  <div class="role-api-doc-page p-5">
    <!-- 页面标题区域 -->
    <div class="api-doc-header mb-6">
      <h2 class="text-2xl font-bold mb-2 text-g-900">角色管理 API 文档</h2>
      <p class="text-g-700">包含角色列表查询、角色CRUD、权限配置等角色管理相关接口</p>
    </div>

    <!-- API文档内容区域 -->
    <ElCard shadow="never" class="api-doc-content">
      <div v-for="(api, index) in roleApiDocs" :key="index" class="api-doc-card mb-8 last:mb-0">
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

  defineOptions({ name: 'SystemApiDocRole' })

  // API文档数据
  const roleApiDocs = ref([
    {
      name: '获取角色列表',
      description: '分页查询角色列表，支持按角色ID、角色名称、角色编码、描述、启用状态等条件筛选',
      path: '/api/role/list',
      method: 'GET',
      params: [
        { name: 'current', type: 'number', required: false, description: '当前页码，默认1' },
        { name: 'size', type: 'number', required: false, description: '每页条数，默认10' },
        { name: 'roleId', type: 'number', required: false, description: '角色ID' },
        {
          name: 'roleName',
          type: 'string',
          required: false,
          description: '角色名称（支持模糊查询）'
        },
        { name: 'roleCode', type: 'string', required: false, description: '角色编码' },
        { name: 'description', type: 'string', required: false, description: '角色描述' },
        { name: 'enabled', type: 'boolean', required: false, description: '是否启用' }
      ],
      requestExample: JSON.stringify(
        {
          params: {
            current: 1,
            size: 10,
            roleName: '管理员',
            enabled: true
          }
        },
        null,
        2
      ),
      responseFields: [
        { name: 'records', type: 'RoleListItem[]', description: '角色列表数据' },
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
                roleId: 1,
                roleName: '超级管理员',
                roleCode: 'R_SUPER',
                description: '系统超级管理员，拥有所有权限',
                enabled: true,
                createTime: '2024-01-01 00:00:00'
              },
              {
                roleId: 2,
                roleName: '管理员',
                roleCode: 'R_ADMIN',
                description: '系统管理员，拥有部分管理权限',
                enabled: true,
                createTime: '2024-01-01 00:00:00'
              }
            ],
            current: 1,
            size: 10,
            total: 2
          },
          message: '查询成功'
        },
        null,
        2
      ),
      roles: ['R_SUPER']
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
        value: 'Api.SystemManage.RoleSearchParams → Api.SystemManage.RoleList'
      }
    ]
  }
</script>

<style scoped lang="scss">
  .role-api-doc-page {
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
