<!-- 菜单管理API文档 -->
<template>
  <div class="menu-api-doc-page p-5">
    <!-- 页面标题区域 -->
    <div class="api-doc-header mb-6">
      <h2 class="text-2xl font-bold mb-2 text-g-900">菜单管理 API 文档</h2>
      <p class="text-g-700">包含菜单列表查询、菜单CRUD等菜单管理相关接口</p>
    </div>

    <!-- API文档内容区域 -->
    <ElCard shadow="never" class="api-doc-content">
      <div v-for="(api, index) in menuApiDocs" :key="index" class="api-doc-card mb-8 last:mb-0">
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

  defineOptions({ name: 'SystemApiDocMenu' })

  // API文档数据
  const menuApiDocs = ref([
    {
      name: '获取菜单列表',
      description:
        '获取系统菜单树形结构列表，返回AppRouteRecord数组，包含路由路径、名称、组件、元数据等信息',
      path: '/api/v3/system/menus',
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
        { name: '[].id', type: 'number', description: '菜单ID（可选）' },
        { name: '[].path', type: 'string', description: '路由路径' },
        { name: '[].name', type: 'string', description: '路由名称' },
        { name: '[].component', type: 'string', description: '组件路径' },
        { name: '[].meta', type: 'RouteMeta', description: '路由元数据' },
        { name: '[].meta.title', type: 'string', description: '菜单标题' },
        { name: '[].meta.icon', type: 'string', description: '菜单图标（可选）' },
        { name: '[].meta.roles', type: 'string[]', description: '角色权限（可选）' },
        { name: '[].meta.keepAlive', type: 'boolean', description: '是否缓存（可选）' },
        { name: '[].meta.isHide', type: 'boolean', description: '是否隐藏（可选）' },
        { name: '[].children', type: 'AppRouteRecord[]', description: '子菜单（可选）' }
      ],
      responseExample: JSON.stringify(
        {
          code: 200,
          data: [
            {
              id: 1,
              path: '/system',
              name: 'System',
              component: '/index/index',
              meta: {
                title: 'menus.system.title',
                icon: 'ri:user-3-line',
                roles: ['R_SUPER', 'R_ADMIN']
              },
              children: [
                {
                  id: 11,
                  path: 'user',
                  name: 'User',
                  component: '/system/user',
                  meta: {
                    title: 'menus.system.user',
                    icon: 'ri:user-line',
                    keepAlive: true,
                    roles: ['R_SUPER', 'R_ADMIN']
                  }
                },
                {
                  id: 12,
                  path: 'role',
                  name: 'Role',
                  component: '/system/role',
                  meta: {
                    title: 'menus.system.role',
                    icon: 'ri:user-settings-line',
                    keepAlive: true,
                    roles: ['R_SUPER']
                  }
                }
              ]
            }
          ],
          message: '获取成功'
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
      { label: 'TypeScript类型', value: '无参数 → AppRouteRecord[]' }
    ]
  }
</script>

<style scoped lang="scss">
  .menu-api-doc-page {
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
