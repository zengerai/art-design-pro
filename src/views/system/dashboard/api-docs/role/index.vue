<template>
  <div class="api-docs-container art-full-height overflow-y-auto p-4">
    <ElPageHeader content="角色管理模块 API 文档" class="mb-4" />

    <ElRow :gutter="20">
      <!-- 左侧锚点导航 -->
      <ElCol :xs="0" :sm="5" :md="5" :lg="4" :xl="4">
        <ElAffix :offset="80">
          <ElCard shadow="hover" class="anchor-nav-card">
            <template #header>
              <div class="text-sm font-semibold">接口导航</div>
            </template>
            <div class="anchor-list">
              <div
                v-for="api in roleApiDocs"
                :key="api.id"
                class="anchor-item"
                @click="scrollToApi(api.id)"
              >
                {{ api.name }}
              </div>
            </div>
          </ElCard>
        </ElAffix>
      </ElCol>

      <!-- 右侧API内容 -->
      <ElCol :xs="24" :sm="19" :md="19" :lg="20" :xl="20">
        <div class="space-y-6">
          <!-- API接口列表 -->
          <div v-for="api in roleApiDocs" :id="api.id" :key="api.id">
            <ElCard shadow="hover" class="api-card">
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <ElTag :type="getMethodType(api.method)" size="large">{{ api.method }}</ElTag>
                    <span class="text-lg font-semibold">{{ api.name }}</span>
                  </div>
                  <code class="text-sm text-gray-600">{{ api.path }}</code>
                </div>
              </template>

              <!-- 接口描述 -->
              <div class="mb-4">
                <h4 class="text-base font-medium mb-2">接口描述</h4>
                <p class="text-gray-600">{{ api.description }}</p>
              </div>

              <!-- 请求头 -->
              <div v-if="api.headers && api.headers.length" class="mb-4">
                <h4 class="text-base font-medium mb-2">请求头</h4>
                <ElTable :data="api.headers" border size="small">
                  <ElTableColumn prop="name" label="参数名" width="180" />
                  <ElTableColumn prop="type" label="类型" width="120" />
                  <ElTableColumn prop="required" label="必填" width="80">
                    <template #default="{ row }">
                      <ElTag :type="row.required ? 'danger' : 'info'" size="small">
                        {{ row.required ? '是' : '否' }}
                      </ElTag>
                    </template>
                  </ElTableColumn>
                  <ElTableColumn prop="description" label="说明" />
                </ElTable>
              </div>

              <!-- 请求参数 -->
              <div v-if="api.params && api.params.length" class="mb-4">
                <h4 class="text-base font-medium mb-2">请求参数</h4>
                <ElTable :data="api.params" border size="small">
                  <ElTableColumn prop="name" label="参数名" width="180" />
                  <ElTableColumn prop="type" label="类型" width="120" />
                  <ElTableColumn prop="required" label="必填" width="80">
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
                <h4 class="text-base font-medium mb-2">请求示例</h4>
                <pre
                  class="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto"
                ><code class="text-sm">{{ api.requestExample }}</code></pre>
              </div>

              <!-- 响应参数 -->
              <div v-if="api.responseFields && api.responseFields.length" class="mb-4">
                <h4 class="text-base font-medium mb-2">响应参数</h4>
                <ElTable :data="api.responseFields" border size="small">
                  <ElTableColumn prop="name" label="参数名" width="180" />
                  <ElTableColumn prop="type" label="类型" width="120" />
                  <ElTableColumn prop="description" label="说明" />
                </ElTable>
              </div>

              <!-- 响应示例 -->
              <div class="mb-4">
                <h4 class="text-base font-medium mb-2">响应示例</h4>
                <pre
                  class="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto"
                ><code class="text-sm">{{ api.responseExample }}</code></pre>
              </div>

              <!-- 错误码 -->
              <div v-if="api.errorCodes && api.errorCodes.length" class="mb-4">
                <h4 class="text-base font-medium mb-2">错误码</h4>
                <ElTable :data="api.errorCodes" border size="small">
                  <ElTableColumn prop="code" label="错误码" width="120" />
                  <ElTableColumn prop="message" label="错误信息" width="200" />
                  <ElTableColumn prop="description" label="说明" />
                </ElTable>
              </div>

              <!-- 业务逻辑 -->
              <div v-if="api.businessLogic && api.businessLogic.length" class="mb-4">
                <h4 class="text-base font-medium mb-2">业务逻辑</h4>
                <ol class="list-decimal list-inside space-y-1 text-gray-600">
                  <li v-for="(logic, index) in api.businessLogic" :key="index">{{ logic }}</li>
                </ol>
              </div>
            </ElCard>
          </div>
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  defineOptions({ name: 'SystemApiDocRole' })

  type ApiDocItem = Api.ApiDoc.ApiDocItem

  // 角色管理模块API文档数据
  const roleApiDocs = ref<ApiDocItem[]>([
    {
      id: 'role-list',
      name: '获取角色列表',
      description: '分页获取系统中所有角色的列表，支持搜索和排序。仅超级管理员可访问',
      path: '/api/role/list',
      method: 'GET',
      headers: [
        {
          name: 'Authorization',
          type: 'string',
          required: true,
          description: 'Bearer {token}（需要R_SUPER权限）'
        }
      ],
      params: [
        { name: 'page', type: 'number', required: false, description: '页码，默认1' },
        { name: 'pageSize', type: 'number', required: false, description: '每页数量，默认10' },
        {
          name: 'keyword',
          type: 'string',
          required: false,
          description: '搜索关键词（角色名称/角色代码）'
        },
        {
          name: 'status',
          type: 'number',
          required: false,
          description: '按状态筛选：0-禁用，1-启用'
        }
      ],
      requestExample: `GET /api/role/list?page=1&pageSize=10&keyword=管理员
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`,
      responseFields: [
        { name: 'total', type: 'number', required: true, description: '总记录数' },
        { name: 'page', type: 'number', required: true, description: '当前页码' },
        { name: 'pageSize', type: 'number', required: true, description: '每页数量' },
        { name: 'list', type: 'array', required: true, description: '角色列表' },
        { name: 'list[].id', type: 'number', required: true, description: '角色ID' },
        { name: 'list[].roleName', type: 'string', required: true, description: '角色名称' },
        { name: 'list[].roleCode', type: 'string', required: true, description: '角色代码' },
        { name: 'list[].dashboardPath', type: 'string', required: true, description: '控制台路径' },
        { name: 'list[].description', type: 'string', required: false, description: '角色描述' },
        {
          name: 'list[].status',
          type: 'number',
          required: true,
          description: '状态：0-禁用，1-启用'
        },
        { name: 'list[].createdAt', type: 'string', required: true, description: '创建时间' },
        { name: 'list[].updatedAt', type: 'string', required: true, description: '更新时间' }
      ],
      responseExample: `{
  "total": 5,
  "page": 1,
  "pageSize": 10,
  "list": [
    {
      "id": 1,
      "roleName": "超级管理员",
      "roleCode": "R_SUPER",
      "dashboardPath": "/system/dashboard/console",
      "description": "系统最高权限角色",
      "status": 1,
      "createdAt": "2023-01-01 00:00:00",
      "updatedAt": "2023-01-01 00:00:00"
    },
    {
      "id": 2,
      "roleName": "普通用户",
      "roleCode": "R_NORMAL",
      "dashboardPath": "/user/dashboard/console",
      "description": "普通用户角色",
      "status": 1,
      "createdAt": "2023-01-01 00:00:00",
      "updatedAt": "2023-01-01 00:00:00"
    }
  ]
}`,
      errorCodes: [
        { code: 403, message: '权限不足', description: '当前用户不是超级管理员（R_SUPER）' },
        { code: 401, message: 'Token无效', description: 'Token已过期或无效' }
      ],
      businessLogic: [
        '解析Token获取userId和roleCode',
        '验证用户是否拥有R_SUPER权限',
        '构建SQL查询条件（关键词模糊匹配roleName或roleCode）',
        '如果指定status，添加状态筛选条件',
        '查询roles表',
        '计算分页偏移量：offset = (page - 1) * pageSize',
        '执行分页查询并统计总数',
        '返回分页结果'
      ]
    },
    {
      id: 'role-create',
      name: '创建角色',
      description: '创建新的系统角色，仅超级管理员可操作',
      path: '/api/role',
      method: 'POST',
      headers: [
        {
          name: 'Authorization',
          type: 'string',
          required: true,
          description: 'Bearer {token}（需要R_SUPER权限）'
        }
      ],
      params: [
        { name: 'roleName', type: 'string', required: true, description: '角色名称，2-50字符' },
        {
          name: 'roleCode',
          type: 'string',
          required: true,
          description: '角色代码，大写字母下划线，以R_开头'
        },
        { name: 'dashboardPath', type: 'string', required: true, description: '控制台跳转路径' },
        {
          name: 'description',
          type: 'string',
          required: false,
          description: '角色描述，最大500字符'
        },
        {
          name: 'status',
          type: 'number',
          required: false,
          description: '状态：0-禁用，1-启用，默认1'
        }
      ],
      requestExample: `{
  "roleName": "产品经理",
  "roleCode": "R_PRODUCT_MANAGER",
  "dashboardPath": "/product/dashboard/console",
  "description": "产品管理角色，负责产品管理相关功能",
  "status": 1
}`,
      responseFields: [
        { name: 'code', type: 'number', required: true, description: '响应码' },
        { name: 'message', type: 'string', required: true, description: '提示信息' },
        { name: 'data.roleId', type: 'number', required: true, description: '新创建的角色ID' }
      ],
      responseExample: `{
  "code": 200,
  "message": "创建成功",
  "data": {
    "roleId": 6
  }
}`,
      errorCodes: [
        { code: 400, message: '角色代码已存在', description: '数据库中已存在相同roleCode' },
        { code: 400, message: '参数验证失败', description: '必填字段缺失或格式不正确' },
        { code: 403, message: '权限不足', description: '当前用户不是超级管理员（R_SUPER）' },
        {
          code: 400,
          message: 'roleCode格式错误',
          description: 'roleCode必须以R_开头且只包含大写字母和下划线'
        }
      ],
      businessLogic: [
        '解析Token获取当前操作用户的roleCode',
        '验证是否拥有R_SUPER权限',
        '验证roleCode是否已存在',
        '验证roleCode格式（必须以R_开头，只包含大写字母和下划线）',
        '验证所有必填字段和格式',
        '插入roles表，status默认为1',
        '返回新角色ID'
      ]
    },
    {
      id: 'role-update',
      name: '更新角色',
      description: '更新指定角色的信息，仅超级管理员可操作',
      path: '/api/role/{id}',
      method: 'PUT',
      headers: [
        {
          name: 'Authorization',
          type: 'string',
          required: true,
          description: 'Bearer {token}（需要R_SUPER权限）'
        }
      ],
      params: [
        { name: 'id', type: 'number', required: true, description: '角色ID（URL路径参数）' },
        { name: 'roleName', type: 'string', required: false, description: '角色名称' },
        {
          name: 'roleCode',
          type: 'string',
          required: false,
          description: '角色代码（不建议修改）'
        },
        { name: 'dashboardPath', type: 'string', required: false, description: '控制台路径' },
        { name: 'description', type: 'string', required: false, description: '角色描述' },
        { name: 'status', type: 'number', required: false, description: '状态：0-禁用，1-启用' }
      ],
      requestExample: `PUT /api/role/6
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "roleName": "产品经理",
  "dashboardPath": "/product/dashboard/home",
  "description": "产品管理角色，负责产品全生命周期管理",
  "status": 1
}`,
      responseExample: `{
  "code": 200,
  "message": "更新成功"
}`,
      errorCodes: [
        { code: 403, message: '权限不足', description: '当前用户不是超级管理员（R_SUPER）' },
        { code: 404, message: '角色不存在', description: '指定ID的角色不存在' },
        { code: 400, message: 'roleCode已存在', description: '修改后的roleCode与其他角色冲突' },
        {
          code: 400,
          message: '不能修改系统角色',
          description: '不允许修改R_SUPER和R_NORMAL等系统预设角色'
        }
      ],
      businessLogic: [
        '解析Token获取当前操作用户的roleCode',
        '验证是否拥有R_SUPER权限',
        '验证目标角色是否存在',
        '检查是否为系统预设角色（R_SUPER、R_NORMAL），禁止修改',
        '如果更新roleCode，验证新roleCode是否已存在',
        '验证所有字段格式',
        '更新roles表对应字段（只更新提供的字段）',
        '自动更新updated_at字段',
        '返回更新结果'
      ]
    },
    {
      id: 'role-delete',
      name: '删除角色',
      description: '删除指定角色，仅超级管理员可操作。注意：不能删除系统角色和有用户关联的角色',
      path: '/api/role/{id}',
      method: 'DELETE',
      headers: [
        {
          name: 'Authorization',
          type: 'string',
          required: true,
          description: 'Bearer {token}（需要R_SUPER权限）'
        }
      ],
      params: [
        { name: 'id', type: 'number', required: true, description: '角色ID（URL路径参数）' }
      ],
      requestExample: `DELETE /api/role/6
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`,
      responseExample: `{
  "code": 200,
  "message": "删除成功"
}`,
      errorCodes: [
        { code: 403, message: '权限不足', description: '当前用户不是超级管理员（R_SUPER）' },
        { code: 404, message: '角色不存在', description: '指定ID的角色不存在' },
        {
          code: 400,
          message: '不能删除系统角色',
          description: '不允许删除R_SUPER和R_NORMAL等系统预设角色'
        },
        { code: 400, message: '角色有关联用户', description: '存在使用该角色的用户，无法删除' }
      ],
      businessLogic: [
        '解析Token获取当前操作用户的roleCode',
        '验证是否拥有R_SUPER权限',
        '验证目标角色是否存在',
        '检查是否为系统预设角色（R_SUPER、R_NORMAL），禁止删除',
        '检查users表中是否有用户使用该角色（WHERE role_id = id）',
        '如果有关联用户，返回错误',
        '删除roles表中的角色记录',
        '返回删除结果'
      ]
    }
  ])

  // 根据HTTP方法返回不同的tag类型
  function getMethodType(method: string) {
    const typeMap: Record<string, any> = {
      GET: 'success',
      POST: 'primary',
      PUT: 'warning',
      DELETE: 'danger'
    }
    return typeMap[method] || 'info'
  }

  // 滚动到指定API
  const scrollToApi = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      // 直接使用 scrollIntoView，并设置适当的 block 位置
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }
</script>

<style scoped lang="scss">
  .api-docs-container {
    max-width: 1600px;
    margin: 0 auto;
    background: var(--el-bg-color-page);
  }

  .anchor-nav-card {
    :deep(.el-card__header) {
      padding: 12px 16px;
      background: var(--el-fill-color-light);
    }

    :deep(.el-card__body) {
      padding: 12px;
    }

    .anchor-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .anchor-item {
      padding: 8px 12px;
      font-size: 13px;
      color: var(--el-text-color-regular);
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s;

      &:hover {
        color: var(--el-color-primary);
        background: var(--el-fill-color-light);
      }
    }
  }

  .api-card {
    scroll-margin-top: 120px;
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
