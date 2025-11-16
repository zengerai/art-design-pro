<template>
  <div class="api-docs-container art-full-height overflow-y-auto p-4">
    <ElPageHeader content="用户管理模块 API 文档" />

    <ElAlert class="mt-4" type="info" :closable="false">
      <template #title>
        <div class="space-y-1">
          <div>本模块包含11个API接口，分为两类：</div>
          <div>• 个人中心接口（5个）：当前用户管理自己的信息 - 权限：当前用户</div>
          <div>• 用户管理接口（4个）：系统管理员管理所有用户 - 权限：R_SUPER</div>
        </div>
      </template>
    </ElAlert>

    <div class="mt-6 space-y-6">
      <!-- API接口列表 -->
      <ElCard v-for="api in userApiDocs" :key="api.name" shadow="hover">
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
</template>

<script setup lang="ts">
  defineOptions({ name: 'SystemApiDocUser' })

  type ApiDocItem = Api.ApiDoc.ApiDocItem

  // 用户管理模块API文档数据
  const userApiDocs = ref<ApiDocItem[]>([
    // === 个人中心接口 ===
    {
      name: '获取用户详情',
      description: '获取当前登录用户的完整个人信息，包括基本信息、角色信息和标签列表',
      path: '/api/user/profile',
      method: 'GET',
      headers: [
        { name: 'Authorization', type: 'string', required: true, description: 'Bearer {token}' }
      ],
      requestExample: `GET /api/user/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`,
      responseFields: [
        { name: 'id', type: 'number', required: true, description: '用户ID' },
        { name: 'username', type: 'string', required: true, description: '用户名' },
        { name: 'realName', type: 'string', required: false, description: '真实姓名' },
        { name: 'nickname', type: 'string', required: false, description: '昵称' },
        { name: 'avatar', type: 'string', required: false, description: '头像URL' },
        { name: 'sex', type: 'number', required: false, description: '性别：1-男，2-女' },
        { name: 'email', type: 'string', required: false, description: '邮箱' },
        { name: 'mobile', type: 'string', required: false, description: '手机号' },
        { name: 'address', type: 'string', required: false, description: '地址' },
        { name: 'description', type: 'string', required: false, description: '个人介绍' },
        { name: 'roleId', type: 'number', required: true, description: '角色ID' },
        { name: 'roleName', type: 'string', required: true, description: '角色名称' },
        { name: 'tags', type: 'string[]', required: false, description: '用户标签数组' }
      ],
      responseExample: `{
  "id": 1,
  "username": "admin",
  "realName": "管理员",
  "nickname": "Admin",
  "avatar": "https://example.com/avatar.jpg",
  "sex": 1,
  "email": "admin@example.com",
  "mobile": "13800138000",
  "address": "北京市朝阳区",
  "description": "系统管理员",
  "roleId": 1,
  "roleName": "超级管理员",
  "tags": ["开发", "管理"],
  "lastLoginTime": "2024-01-01 12:00:00",
  "createdAt": "2023-01-01 00:00:00"
}`,
      businessLogic: [
        '解析Token获取userId',
        '查询users表获取用户完整信息',
        '查询roles表获取角色名称',
        '查询user_tags表获取用户标签列表',
        '返回完整的用户信息（不包含password）'
      ]
    },
    {
      name: '更新用户信息',
      description: '更新当前登录用户的个人信息',
      path: '/api/user/profile',
      method: 'PUT',
      headers: [
        { name: 'Authorization', type: 'string', required: true, description: 'Bearer {token}' }
      ],
      params: [
        { name: 'realName', type: 'string', required: true, description: '真实姓名，2-50字符' },
        { name: 'nickname', type: 'string', required: true, description: '昵称，2-50字符' },
        { name: 'sex', type: 'number', required: true, description: '性别，1或1' },
        { name: 'email', type: 'string', required: true, description: '邮箱，符合邮箱格式' },
        { name: 'mobile', type: 'string', required: true, description: '手机号，11位手机号' },
        { name: 'address', type: 'string', required: true, description: '地址' },
        {
          name: 'description',
          type: 'string',
          required: false,
          description: '个人介绍，最大500字符'
        }
      ],
      requestExample: `{
  "realName": "张三",
  "nickname": "小张",
  "sex": 1,
  "email": "zhangsan@example.com",
  "mobile": "13800138000",
  "address": "北京市朝阳区",
  "description": "产品经理"
}`,
      responseExample: `{
  "code": 200,
  "message": "更新成功"
}`,
      businessLogic: [
        '解析Token获取userId',
        '验证请求参数格式和长度',
        '更新users表对应字段',
        '自动更新updated_at字段',
        '返回更新结果'
      ]
    },
    {
      name: '修改密码',
      description: '修改当前用户的登录密码',
      path: '/api/user/change-password',
      method: 'POST',
      headers: [
        { name: 'Authorization', type: 'string', required: true, description: 'Bearer {token}' }
      ],
      params: [
        { name: 'oldPassword', type: 'string', required: true, description: '当前密码' },
        { name: 'newPassword', type: 'string', required: true, description: '新密码' }
      ],
      requestExample: `{
  "oldPassword": "old_password",
  "newPassword": "new_password"
}`,
      responseExample: `{
  "code": 200,
  "message": "密码修改成功"
}`,
      errorCodes: [
        { code: 400, message: '当前密码错误', description: '输入的旧密码不正确' },
        { code: 401, message: 'Token无效', description: 'Token已过期或无效' },
        { code: 500, message: '服务器内部错误', description: '服务器处理请求时发生错误' }
      ],
      businessLogic: [
        '解析Token获取userId',
        '查询users表获取当前用户的加密密码',
        '使用bcrypt验证oldPassword是否正确',
        '如果验证成功，使用bcrypt加密newPassword',
        '更新users表的password字段',
        '返回修改结果'
      ]
    },
    {
      name: '更新用户标签',
      description: '更新当前用户的个性化标签，支持批量替换',
      path: '/api/user/tags',
      method: 'POST',
      headers: [
        { name: 'Authorization', type: 'string', required: true, description: 'Bearer {token}' }
      ],
      params: [{ name: 'tags', type: 'string[]', required: true, description: '标签数组' }],
      requestExample: `{
  "tags": ["开发", "前端", "Vue"]
}`,
      responseExample: `{
  "code": 200,
  "message": "标签更新成功"
}`,
      businessLogic: [
        '解析Token获取userId',
        '删除user_tags表中该用户的所有标签（WHERE user_id = userId）',
        '批量插入新的标签列表',
        '返回更新结果'
      ]
    },
    {
      name: '上传用户头像',
      description: '上传并更新当前用户的头像，multipart/form-data格式',
      path: '/api/user/avatar',
      method: 'POST',
      headers: [
        { name: 'Authorization', type: 'string', required: true, description: 'Bearer {token}' },
        { name: 'Content-Type', type: 'string', required: true, description: 'multipart/form-data' }
      ],
      requestExample: `Content-Type: multipart/form-data
file: [图片文件]`,
      responseFields: [
        { name: 'code', type: 'number', required: true, description: '响应码' },
        { name: 'message', type: 'string', required: true, description: '提示信息' },
        { name: 'data.avatarUrl', type: 'string', required: true, description: '头像URL地址' }
      ],
      responseExample: `{
  "code": 200,
  "message": "上传成功",
  "data": {
    "avatarUrl": "https://example.com/avatar.jpg"
  }
}`,
      businessLogic: [
        '解析Token获取userId',
        '验证文件类型（只允许jpg、png、gif等图片格式）',
        '验证文件大小（建议不超过2MB）',
        '将文件上传到文件存储服务（本地或云存储）',
        '获取文件访问URL',
        '更新users表的avatar字段',
        '返回头像URL'
      ]
    },
    // === 用户管理接口 ===
    {
      name: '获取用户列表',
      description: '分页获取系统中所有用户的列表，支持搜索和排序。仅超级管理员可访问',
      path: '/api/user/list',
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
          description: '搜索关键词（用户名/真实姓名/昵称）'
        },
        { name: 'roleId', type: 'number', required: false, description: '按角色ID筛选' },
        {
          name: 'status',
          type: 'number',
          required: false,
          description: '按状态筛选：0-禁用，1-启用'
        }
      ],
      requestExample: `GET /api/user/list?page=1&pageSize=10&keyword=admin&roleId=1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`,
      responseFields: [
        { name: 'total', type: 'number', required: true, description: '总记录数' },
        { name: 'page', type: 'number', required: true, description: '当前页码' },
        { name: 'pageSize', type: 'number', required: true, description: '每页数量' },
        { name: 'list', type: 'array', required: true, description: '用户列表' },
        { name: 'list[].id', type: 'number', required: true, description: '用户ID' },
        { name: 'list[].username', type: 'string', required: true, description: '用户名' },
        { name: 'list[].realName', type: 'string', required: false, description: '真实姓名' },
        { name: 'list[].nickname', type: 'string', required: false, description: '昵称' },
        { name: 'list[].avatar', type: 'string', required: false, description: '头像URL' },
        { name: 'list[].email', type: 'string', required: false, description: '邮箱' },
        { name: 'list[].mobile', type: 'string', required: false, description: '手机号' },
        { name: 'list[].roleId', type: 'number', required: true, description: '角色ID' },
        { name: 'list[].roleName', type: 'string', required: true, description: '角色名称' },
        {
          name: 'list[].status',
          type: 'number',
          required: true,
          description: '状态：0-禁用，1-启用'
        },
        {
          name: 'list[].lastLoginTime',
          type: 'string',
          required: false,
          description: '最后登录时间'
        },
        { name: 'list[].createdAt', type: 'string', required: true, description: '创建时间' }
      ],
      responseExample: `{
  "total": 100,
  "page": 1,
  "pageSize": 10,
  "list": [
    {
      "id": 1,
      "username": "admin",
      "realName": "管理员",
      "nickname": "Admin",
      "avatar": "https://example.com/avatar.jpg",
      "email": "admin@example.com",
      "mobile": "13800138000",
      "roleId": 1,
      "roleName": "超级管理员",
      "status": 1,
      "lastLoginTime": "2024-01-01 12:00:00",
      "createdAt": "2023-01-01 00:00:00"
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
        '构建SQL查询条件（关键词模糊匹配username/realName/nickname）',
        '如果指定roleId，添加角色筛选条件',
        '如果指定status，添加状态筛选条件',
        '查询users表并JOIN roles表获取角色名称',
        '计算分页偏移量：offset = (page - 1) * pageSize',
        '执行分页查询并统计总数',
        '返回分页结果（不包含password字段）'
      ]
    },
    {
      name: '创建用户',
      description: '创建新用户账号，仅超级管理员可操作',
      path: '/api/user',
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
        {
          name: 'username',
          type: 'string',
          required: true,
          description: '用户名，3-20字符，字母数字下划线'
        },
        { name: 'password', type: 'string', required: true, description: '密码，6-20字符' },
        { name: 'realName', type: 'string', required: true, description: '真实姓名，2-50字符' },
        { name: 'nickname', type: 'string', required: true, description: '昵称，2-50字符' },
        { name: 'roleId', type: 'number', required: true, description: '角色ID' },
        { name: 'email', type: 'string', required: false, description: '邮箱' },
        { name: 'mobile', type: 'string', required: false, description: '手机号' },
        { name: 'sex', type: 'number', required: false, description: '性别：1-男，2-女' },
        { name: 'address', type: 'string', required: false, description: '地址' },
        { name: 'description', type: 'string', required: false, description: '描述' },
        {
          name: 'status',
          type: 'number',
          required: false,
          description: '状态：0-禁用，1-启用，默认1'
        }
      ],
      requestExample: `{
  "username": "zhangsan",
  "password": "123456",
  "realName": "张三",
  "nickname": "小张",
  "roleId": 2,
  "email": "zhangsan@example.com",
  "mobile": "13800138001",
  "sex": 1,
  "address": "北京市海淀区",
  "description": "开发工程师",
  "status": 1
}`,
      responseFields: [
        { name: 'code', type: 'number', required: true, description: '响应码' },
        { name: 'message', type: 'string', required: true, description: '提示信息' },
        { name: 'data.userId', type: 'number', required: true, description: '新创建的用户ID' }
      ],
      responseExample: `{
  "code": 200,
  "message": "创建成功",
  "data": {
    "userId": 10
  }
}`,
      errorCodes: [
        { code: 400, message: '用户名已存在', description: '数据库中已存在相同username' },
        { code: 400, message: '参数验证失败', description: '必填字段缺失或格式不正确' },
        { code: 403, message: '权限不足', description: '当前用户不是超级管理员（R_SUPER）' },
        { code: 404, message: '角色不存在', description: '指定的roleId在roles表中不存在' }
      ],
      businessLogic: [
        '解析Token获取当前操作用户的roleCode',
        '验证是否拥有R_SUPER权限',
        '验证username是否已存在',
        '验证roleId是否存在于roles表',
        '验证所有必填字段和格式（用户名、密码、邮箱、手机号等）',
        '使用bcrypt加密password',
        '插入users表，status默认为1',
        '返回新用户ID'
      ]
    },
    {
      name: '更新用户',
      description: '更新指定用户的信息，仅超级管理员可操作',
      path: '/api/user/{id}',
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
        { name: 'id', type: 'number', required: true, description: '用户ID（URL路径参数）' },
        { name: 'realName', type: 'string', required: false, description: '真实姓名' },
        { name: 'nickname', type: 'string', required: false, description: '昵称' },
        { name: 'roleId', type: 'number', required: false, description: '角色ID' },
        { name: 'email', type: 'string', required: false, description: '邮箱' },
        { name: 'mobile', type: 'string', required: false, description: '手机号' },
        { name: 'sex', type: 'number', required: false, description: '性别：1-男，2-女' },
        { name: 'address', type: 'string', required: false, description: '地址' },
        { name: 'description', type: 'string', required: false, description: '描述' },
        { name: 'status', type: 'number', required: false, description: '状态：0-禁用，1-启用' }
      ],
      requestExample: `PUT /api/user/10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "realName": "张三",
  "nickname": "小张",
  "roleId": 3,
  "email": "zhangsan@example.com",
  "status": 1
}`,
      responseExample: `{
  "code": 200,
  "message": "更新成功"
}`,
      errorCodes: [
        { code: 403, message: '权限不足', description: '当前用户不是超级管理员（R_SUPER）' },
        { code: 404, message: '用户不存在', description: '指定ID的用户不存在' },
        { code: 404, message: '角色不存在', description: '指定的roleId在roles表中不存在' },
        { code: 400, message: '参数验证失败', description: '字段格式不正确（如邮箱、手机号）' }
      ],
      businessLogic: [
        '解析Token获取当前操作用户的roleCode',
        '验证是否拥有R_SUPER权限',
        '验证目标用户是否存在',
        '如果更新roleId，验证角色是否存在',
        '验证所有字段格式（邮箱、手机号等）',
        '更新users表对应字段（只更新提供的字段）',
        '自动更新updated_at字段',
        '返回更新结果'
      ]
    },
    {
      name: '删除用户',
      description: '删除指定用户，仅超级管理员可操作。注意：不能删除自己',
      path: '/api/user/{id}',
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
        { name: 'id', type: 'number', required: true, description: '用户ID（URL路径参数）' }
      ],
      requestExample: `DELETE /api/user/10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`,
      responseExample: `{
  "code": 200,
  "message": "删除成功"
}`,
      errorCodes: [
        { code: 403, message: '权限不足', description: '当前用户不是超级管理员（R_SUPER）' },
        { code: 400, message: '不能删除自己', description: '尝试删除当前登录用户' },
        { code: 404, message: '用户不存在', description: '指定ID的用户不存在' },
        {
          code: 400,
          message: '该用户有关联数据',
          description: '用户有未删除的关联数据（如创建的内容）'
        }
      ],
      businessLogic: [
        '解析Token获取当前操作用户的userId和roleCode',
        '验证是否拥有R_SUPER权限',
        '验证目标用户是否存在',
        '检查是否尝试删除自己（id !== userId）',
        '检查用户是否有关联数据（可选业务逻辑）',
        '删除user_tags表中该用户的所有标签',
        '删除users表中的用户记录',
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
</script>

<style scoped>
  .api-docs-container {
    background: var(--el-bg-color-page);
  }
</style>
