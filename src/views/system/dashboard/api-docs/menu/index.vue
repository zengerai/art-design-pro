<template>
  <div class="api-docs-container art-full-height overflow-y-auto p-4">
    <ElPageHeader content="菜单管理模块 API 文档" class="mb-4" />

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
                v-for="api in menuApiDocs"
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
          <div v-for="api in menuApiDocs" :id="api.id" :key="api.id">
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

  defineOptions({ name: 'SystemApiDocMenu' })

  type ApiDocItem = Api.ApiDoc.ApiDocItem

  // 获取请求方法的Tag类型
  const getMethodType = (method: string) => {
    const types: Record<string, 'success' | 'primary' | 'warning' | 'danger'> = {
      GET: 'success',
      POST: 'primary',
      PUT: 'warning',
      DELETE: 'danger'
    }
    return types[method] || 'info'
  }

  // 菜单管理模块API文档数据
  const menuApiDocs = ref<ApiDocItem[]>([
    {
      id: 'get-menu-tree',
      name: '获取菜单树',
      description: '获取树形结构的菜单列表，用于前端菜单管理和角色权限分配',
      path: '/api/menus',
      method: 'GET',
      headers: [
        { name: 'Authorization', type: 'string', required: true, description: 'Bearer {token}' }
      ],
      params: [
        {
          name: 'mode',
          type: 'string',
          required: false,
          description: '返回模式：tree-树形结构（默认），list-分页列表'
        },
        {
          name: 'enabledOnly',
          type: 'boolean',
          required: false,
          description: '是否仅返回启用的菜单，默认false'
        }
      ],
      requestExample: `GET /api/menus?mode=tree&enabledOnly=false
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`,
      responseFields: [
        { name: 'code', type: 'number', description: '响应码' },
        { name: 'data', type: 'array', description: '菜单树数组' },
        { name: 'data[].id', type: 'number', description: '菜单ID' },
        { name: 'data[].parentId', type: 'number', description: '父菜单ID' },
        { name: 'data[].name', type: 'string', description: '路由名称（唯一标识）' },
        { name: 'data[].path', type: 'string', description: '路由路径' },
        { name: 'data[].component', type: 'string', description: '组件路径' },
        {
          name: 'data[].menuType',
          type: 'string',
          description: '菜单类型：menu-菜单，button-按钮'
        },
        { name: 'data[].title', type: 'string', description: '菜单标题' },
        { name: 'data[].icon', type: 'string', description: '图标名称' },
        { name: 'data[].sort', type: 'number', description: '排序号' },
        { name: 'data[].enabled', type: 'boolean', description: '启用状态' },
        { name: 'data[].roles', type: 'string[]', description: '关联的角色编码列表' },
        { name: 'data[].createdAt', type: 'string', description: '创建时间' },
        { name: 'data[].updatedAt', type: 'string', description: '更新时间' },
        { name: 'data[].children', type: 'array', description: '子菜单数组' },
        {
          name: 'data[].meta.authList',
          type: 'array',
          description: '权限按钮列表（仅button类型）'
        }
      ],
      responseExample: `{
  "code": 200,
  "data": [
    {
      "id": 1,
      "parentId": null,
      "name": "SystemDashboard",
      "path": "/system/dashboard",
      "component": "/index/index",
      "menuType": "menu",
      "title": "系统管理工作台",
      "icon": "ri:dashboard-line",
      "sort": 1,
      "enabled": true,
      "isHide": false,
      "isHideTab": false,
      "keepAlive": false,
      "roles": ["R_SUPER"],
      "createdAt": "2025-11-16T15:44:09.000Z",
      "updatedAt": "2025-11-16T15:44:09.000Z",
      "children": [
        {
          "id": 2,
          "parentId": 1,
          "name": "SystemConsole",
          "title": "控制台",
          "menuType": "menu",
          "path": "console",
          "component": "/system/dashboard/console",
          "sort": 1,
          "enabled": true,
          "roles": ["R_SUPER"]
        }
      ],
      "meta": {
        "title": "系统管理工作台",
        "icon": "ri:dashboard-line",
        "sort": 1,
        "roles": ["R_SUPER"]
      }
    }
  ]
}`,
      errorCodes: [
        { code: 401, message: '未授权', description: '缺少或无效的Authorization token' },
        { code: 403, message: '禁止访问该资源', description: '用户无权访问菜单管理接口' }
      ],
      businessLogic: [
        '1. 验证用户Token和权限',
        '2. 查询menus表，LEFT JOIN menu_roles和roles表',
        '3. 根据mode参数决定返回树形结构或分页列表',
        '4. 如果enabledOnly=true，仅返回enabled=1的菜单',
        '5. 使用GROUP_CONCAT聚合角色编码',
        '6. 将数据库字段映射为前端格式（蛇形转驼峰）',
        '7. 构建树形结构：使用buildMenuTree工具函数',
        '8. 处理权限按钮：将authList转换为子节点'
      ]
    },
    {
      id: 'get-menu-detail',
      name: '获取菜单详情',
      description: '根据菜单ID获取单个菜单的详细信息',
      path: '/api/menus/:id',
      method: 'GET',
      headers: [
        { name: 'Authorization', type: 'string', required: true, description: 'Bearer {token}' }
      ],
      params: [{ name: 'id', type: 'number', required: true, description: '菜单ID（路径参数）' }],
      requestExample: `GET /api/menus/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`,
      responseFields: [
        { name: 'code', type: 'number', description: '响应码' },
        { name: 'data', type: 'object', description: '菜单详情对象' },
        { name: 'data.id', type: 'number', description: '菜单ID' },
        { name: 'data.parentId', type: 'number', description: '父菜单ID' },
        { name: 'data.menuType', type: 'string', description: 'menu或button' },
        { name: 'data.name', type: 'string', description: '路由名称' },
        { name: 'data.title', type: 'string', description: '菜单标题' },
        { name: 'data.roles', type: 'string[]', description: '关联的角色编码数组' },
        { name: 'data.enabled', type: 'boolean', description: '启用状态' },
        { name: 'data...', type: 'any', description: '其他菜单属性字段' }
      ],
      responseExample: `{
  "code": 200,
  "data": {
    "id": 1,
    "parentId": null,
    "menuType": "menu",
    "name": "SystemDashboard",
    "path": "/system/dashboard",
    "component": "/index/index",
    "title": "系统管理工作台",
    "icon": "ri:dashboard-line",
    "sort": 1,
    "enabled": true,
    "isHide": false,
    "roles": ["R_SUPER"],
    "createdAt": "2025-11-16T15:44:09.000Z",
    "updatedAt": "2025-11-16T15:44:09.000Z"
  }
}`,
      errorCodes: [
        { code: 404, message: '菜单不存在', description: '指定ID的菜单未找到' },
        { code: 403, message: '无权限执行此操作', description: '非管理员用户' }
      ],
      businessLogic: [
        '1. 验证用户权限（仅管理员可操作）',
        '2. 根据id查询menus表',
        '3. LEFT JOIN menu_roles和roles获取关联角色',
        '4. 使用convertIntToBoolean转换布尔值字段',
        '5. 将roles字符串分割为数组',
        '6. 返回菜单详情'
      ]
    },
    {
      id: 'create-menu',
      name: '创建菜单',
      description: '创建新的菜单项或权限按钮',
      path: '/api/menus',
      method: 'POST',
      headers: [
        { name: 'Authorization', type: 'string', required: true, description: 'Bearer {token}' }
      ],
      params: [
        { name: 'menuType', type: 'string', required: true, description: 'menu或button' },
        { name: 'name', type: 'string', required: true, description: '路由名称（唯一）' },
        { name: 'title', type: 'string', required: true, description: '菜单标题' },
        { name: 'parentId', type: 'number', required: false, description: '父菜单ID' },
        { name: 'path', type: 'string', required: false, description: '路由路径' },
        { name: 'component', type: 'string', required: false, description: '组件路径' },
        { name: 'icon', type: 'string', required: false, description: '图标名称' },
        { name: 'sort', type: 'number', required: false, description: '排序号，默认1' },
        { name: 'enabled', type: 'boolean', required: false, description: '启用状态，默认true' },
        { name: 'isHide', type: 'boolean', required: false, description: '是否隐藏，默认false' },
        { name: 'keepAlive', type: 'boolean', required: false, description: '是否缓存，默认false' },
        { name: 'authMark', type: 'string', required: false, description: '权限标识（按钮类型）' },
        {
          name: 'roles',
          type: 'number[]',
          required: false,
          description: '关联的角色ID数组'
        }
      ],
      requestExample: `{
  "menuType": "menu",
  "name": "NewMenu",
  "title": "新菜单",
  "parentId": 1,
  "path": "new-menu",
  "component": "/system/new-menu",
  "icon": "ri:menu-line",
  "sort": 10,
  "enabled": true,
  "isHide": false,
  "keepAlive": true,
  "roles": [1, 2]
}`,
      responseFields: [
        { name: 'code', type: 'number', description: '响应码' },
        { name: 'message', type: 'string', description: '提示信息' },
        { name: 'data', type: 'object', description: '返回数据' },
        { name: 'data.id', type: 'number', description: '新创建的菜单ID' }
      ],
      responseExample: `{
  "code": 201,
  "message": "菜单创建成功",
  "data": {
    "id": 15
  }
}`,
      errorCodes: [
        { code: 400, message: '缺少必填字段', description: 'menuType、name或title缺失' },
        { code: 400, message: '菜单名称已存在', description: 'name字段违反唯一性约束' },
        { code: 403, message: '无权限执行此操作', description: '非管理员用户' }
      ],
      businessLogic: [
        '1. 验证用户权限（仅管理员）',
        '2. 验证必填字段：menuType、name、title',
        '3. 检查name唯一性（查询menus表）',
        '4. 使用convertBooleanToInt转换布尔值',
        '5. 使用camelToSnake转换字段名为蛇形',
        '6. 开启事务',
        '7. 插入menus表',
        '8. 如果提供roles，插入menu_roles关联表',
        '9. 提交事务',
        '10. 返回新菜单ID'
      ]
    },
    {
      id: 'update-menu',
      name: '更新菜单',
      description: '更新指定菜单的信息和角色权限',
      path: '/api/menus/:id',
      method: 'PUT',
      headers: [
        { name: 'Authorization', type: 'string', required: true, description: 'Bearer {token}' }
      ],
      params: [
        { name: 'id', type: 'number', required: true, description: '菜单ID（路径参数）' },
        { name: 'name', type: 'string', required: false, description: '路由名称' },
        { name: 'title', type: 'string', required: false, description: '菜单标题' },
        { name: 'path', type: 'string', required: false, description: '路由路径' },
        { name: 'enabled', type: 'boolean', required: false, description: '启用状态' },
        {
          name: 'roles',
          type: 'number[]',
          required: false,
          description: '角色ID数组（会完全替换现有关联）'
        },
        { name: '...其他字段', type: 'any', required: false, description: '其他可更新的菜单属性' }
      ],
      requestExample: `PUT /api/menus/1
{
  "title": "更新后的标题",
  "enabled": false,
  "sort": 5,
  "roles": [1]
}`,
      responseFields: [
        { name: 'code', type: 'number', description: '响应码' },
        { name: 'message', type: 'string', description: '提示信息' }
      ],
      responseExample: `{
  "code": 200,
  "message": "菜单更新成功",
  "data": null
}`,
      errorCodes: [
        { code: 404, message: '菜单不存在', description: '指定ID的菜单未找到' },
        { code: 400, message: '菜单名称已存在', description: 'name字段与其他菜单冲突' },
        { code: 403, message: '无权限执行此操作', description: '非管理员用户' }
      ],
      businessLogic: [
        '1. 验证用户权限（仅管理员）',
        '2. 验证菜单是否存在',
        '3. 如果修改name，检查唯一性（排除当前菜单ID）',
        '4. 开启事务',
        '5. 更新menus表字段',
        '6. 如果提供roles数组：',
        '   - 删除该菜单的所有menu_roles关联',
        '   - 重新插入新的角色关联',
        '7. 提交事务',
        '8. 返回成功消息'
      ]
    },
    {
      id: 'delete-menu',
      name: '删除菜单',
      description: '删除菜单（级联删除子菜单和角色关联）',
      path: '/api/menus/:id',
      method: 'DELETE',
      headers: [
        { name: 'Authorization', type: 'string', required: true, description: 'Bearer {token}' }
      ],
      params: [{ name: 'id', type: 'number', required: true, description: '菜单ID（路径参数）' }],
      requestExample: `DELETE /api/menus/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`,
      responseFields: [
        { name: 'code', type: 'number', description: '响应码' },
        { name: 'message', type: 'string', description: '提示信息' }
      ],
      responseExample: `{
  "code": 200,
  "message": "菜单删除成功",
  "data": null
}`,
      errorCodes: [
        { code: 404, message: '菜单不存在', description: '指定ID的菜单未找到' },
        { code: 403, message: '无权限执行此操作', description: '非管理员用户' }
      ],
      businessLogic: [
        '1. 验证用户权限（仅管理员）',
        '2. 验证菜单是否存在',
        '3. 开启事务',
        '4. 递归获取所有子菜单ID（使用getChildMenuIds工具函数）',
        '5. 删除所有子菜单的menu_roles关联',
        '6. 删除菜单（数据库外键约束会级联删除子菜单）',
        '7. 提交事务',
        '8. 返回成功消息',
        '注意：删除操作会级联删除所有子菜单和权限按钮'
      ]
    },
    {
      id: 'get-role-menus',
      name: '获取角色菜单权限',
      description: '获取指定角色拥有的菜单权限ID列表',
      path: '/api/role/:id/menus',
      method: 'GET',
      headers: [
        { name: 'Authorization', type: 'string', required: true, description: 'Bearer {token}' }
      ],
      params: [{ name: 'id', type: 'number', required: true, description: '角色ID（路径参数）' }],
      requestExample: `GET /api/role/3/menus
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`,
      responseFields: [
        { name: 'code', type: 'number', description: '响应码' },
        { name: 'data', type: 'number[]', description: '菜单ID数组' }
      ],
      responseExample: `{
  "code": 200,
  "data": [7, 17]
}`,
      businessLogic: [
        '1. 验证用户Token',
        '2. 查询menu_roles表',
        '3. WHERE role_id = :id',
        '4. 提取menu_id字段',
        '5. 返回菜单ID数组',
        '使用场景：角色权限对话框加载已有权限'
      ]
    },
    {
      id: 'update-role-menus',
      name: '更新角色菜单权限',
      description: '批量更新角色的菜单权限（完全替换）',
      path: '/api/role/:id/menus',
      method: 'PUT',
      headers: [
        { name: 'Authorization', type: 'string', required: true, description: 'Bearer {token}' }
      ],
      params: [
        { name: 'id', type: 'number', required: true, description: '角色ID（路径参数）' },
        {
          name: 'menuIds',
          type: 'number[]',
          required: true,
          description: '菜单ID数组（会完全替换现有权限）'
        }
      ],
      requestExample: `PUT /api/role/3/menus
{
  "menuIds": [1, 2, 7, 17]
}`,
      responseFields: [
        { name: 'code', type: 'number', description: '响应码' },
        { name: 'message', type: 'string', description: '提示信息' }
      ],
      responseExample: `{
  "code": 200,
  "message": "权限保存成功"
}`,
      businessLogic: [
        '1. 验证用户Token和权限',
        '2. 开启数据库事务',
        '3. 删除该角色的所有menu_roles关联',
        '   DELETE FROM menu_roles WHERE role_id = :id',
        '4. 如果menuIds非空，批量插入新关联',
        '   INSERT INTO menu_roles (menu_id, role_id) VALUES ...',
        '5. 提交事务',
        '6. 返回成功消息',
        '注意：这是完全替换操作，不是增量更新'
      ]
    }
  ])

  // 滚动到指定API
  const scrollToApi = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
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
