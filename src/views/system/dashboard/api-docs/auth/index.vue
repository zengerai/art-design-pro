<template>
  <div class="api-docs-container art-full-height overflow-y-auto p-4">
    <ElPageHeader content="认证模块 API 文档" />

    <div class="mt-4 space-y-6">
      <!-- API接口列表 -->
      <ElCard v-for="api in authApiDocs" :key="api.name" shadow="hover">
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
  defineOptions({ name: 'SystemApiDocAuth' })

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

  // 认证模块API文档数据
  const authApiDocs = ref<ApiDocItem[]>([
    {
      name: '用户登录',
      description: '用户通过用户名和密码进行登录认证',
      path: '/api/auth/login',
      method: 'POST',
      params: [
        { name: 'userName', type: 'string', required: true, description: '用户名' },
        { name: 'password', type: 'string', required: true, description: '密码' }
      ],
      requestExample: `{
  "userName": "Super",
  "password": "123456"
}`,
      responseFields: [
        { name: 'code', type: 'number', required: true, description: '响应码' },
        { name: 'data', type: 'object', required: true, description: '返回数据' },
        {
          name: 'data.token',
          type: 'string',
          required: true,
          description: 'Access Token（有效期30分钟）'
        },
        {
          name: 'data.refreshToken',
          type: 'string',
          required: true,
          description: 'Refresh Token（有效期7天）'
        },
        {
          name: 'data.dashboardPath',
          type: 'string',
          required: true,
          description: '控制台跳转路径'
        }
      ],
      responseExample: `{
  "code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "dashboardPath": "/system/dashboard/console"
  }
}`,
      errorCodes: [
        { code: 400, message: '用户名和密码不能为空', description: '请求参数缺失' },
        { code: 401, message: '用户名或密码错误', description: '用户不存在或密码不匹配' },
        { code: 403, message: '用户已被禁用', description: '用户status字段为0' },
        { code: 500, message: '服务器内部错误', description: '数据库或服务器错误' }
      ],
      businessLogic: [
        '1. 验证userName和password是否为空',
        '2. 查询users表和roles表（LEFT JOIN），获取用户信息、角色编码和dashboard_path',
        '3. 验证用户是否存在',
        '4. 使用bcrypt比对password和数据库中的加密密码',
        '5. 检查用户status是否为1（启用状态）',
        '6. 生成JWT Token（包含userId、username、roleCode）',
        '7. 生成Refresh Token',
        '8. 更新users表的last_login_time和last_login_ip字段',
        '9. 返回token、refreshToken和dashboardPath'
      ]
    },
    {
      name: '获取用户信息',
      description: '根据Token获取当前登录用户的基本信息，用于前端用户状态初始化',
      path: '/api/user/info',
      method: 'GET',
      headers: [
        {
          name: 'Authorization',
          type: 'string',
          required: true,
          description: 'Bearer {token}（必须）'
        }
      ],
      requestExample: `GET /api/user/info
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`,
      responseFields: [
        { name: 'code', type: 'number', required: true, description: '响应码' },
        { name: 'data', type: 'object', required: true, description: '用户信息对象' },
        { name: 'data.userId', type: 'number', required: true, description: '用户ID' },
        { name: 'data.userName', type: 'string', required: true, description: '用户名' },
        { name: 'data.email', type: 'string', required: false, description: '邮箱' },
        { name: 'data.avatar', type: 'string', required: false, description: '头像URL' },
        {
          name: 'data.roles',
          type: 'array',
          required: true,
          description: '用户角色数组，如["R_SUPER"]'
        },
        {
          name: 'data.buttons',
          type: 'array',
          required: true,
          description: '按钮权限数组（当前为空数组）'
        }
      ],
      responseExample: `{
  "code": 200,
  "data": {
    "userId": 1,
    "userName": "Super",
    "email": "super@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "roles": ["R_SUPER"],
    "buttons": []
  }
}`,
      errorCodes: [
        { code: 401, message: '未提供认证令牌', description: '请求头缺少Authorization' },
        { code: 401, message: 'Token验证失败', description: 'Token已过期或格式不正确' },
        { code: 404, message: '用户不存在', description: 'Token中的userId对应的用户不存在' }
      ],
      businessLogic: [
        '1. 从请求头获取Authorization字段',
        '2. 验证Token格式（Bearer {token}）',
        '3. 解析Token获取userId',
        '4. 查询users表和roles表（LEFT JOIN on u.role_id = r.id）',
        '5. 获取用户的id、username、email、avatar和role_code',
        '6. 将role_code放入roles数组返回',
        '7. 前端使用此接口初始化用户状态、注册动态路由'
      ]
    },
    {
      name: '刷新Token',
      description: '使用RefreshToken获取新的AccessToken',
      path: '/api/auth/refresh-token',
      method: 'POST',
      headers: [
        {
          name: 'Authorization',
          type: 'string',
          required: true,
          description: 'Bearer {refreshToken}'
        }
      ],
      params: [{ name: 'refreshToken', type: 'string', required: true, description: '刷新Token' }],
      requestExample: `{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}`,
      responseFields: [
        { name: 'token', type: 'string', required: true, description: '新的访问Token' },
        { name: 'refreshToken', type: 'string', required: true, description: '新的刷新Token' }
      ],
      responseExample: `{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}`,
      errorCodes: [
        {
          code: 401,
          message: 'Refresh Token无效或已过期',
          description: '提供的刷新令牌无效或已超过有效期'
        },
        { code: 403, message: '用户已被禁用', description: '该用户账号已被管理员禁用' }
      ],
      businessLogic: [
        '验证refreshToken的有效性',
        '检查refreshToken是否过期（有效期7天）',
        '解析refreshToken获取userId',
        '查询users表确认用户仍然存在且启用',
        '生成新的JWT Token（有效期30分钟）',
        '生成新的Refresh Token（有效期7天）',
        '返回新的Token信息'
      ]
    },
    {
      name: '用户登出',
      description: '退出登录，清除用户会话',
      path: '/api/auth/logout',
      method: 'POST',
      headers: [
        { name: 'Authorization', type: 'string', required: true, description: 'Bearer {token}' }
      ],
      requestExample: `POST /api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`,
      responseExample: `{
  "code": 200,
  "message": "登出成功"
}`,
      businessLogic: [
        '解析Token获取userId',
        '（可选）将Token加入黑名单，防止复用',
        '（可选）记录登出日志',
        '返回登出成功消息',
        '前端清除本地存储的Token、清空用户状态、跳转到登录页'
      ]
    },
    {
      name: '用户注册',
      description: '新用户自助注册账号，默认分配普通用户角色（R_USER）',
      path: '/api/auth/register',
      method: 'POST',
      params: [
        { name: 'username', type: 'string', required: true, description: '用户名，3-20字符' },
        { name: 'password', type: 'string', required: true, description: '密码，最少6位' }
      ],
      requestExample: `{
  "username": "newuser",
  "password": "password123"
}`,
      responseFields: [
        { name: 'code', type: 'number', required: true, description: '响应码' },
        { name: 'message', type: 'string', required: true, description: '提示信息' },
        { name: 'data', type: 'object', required: true, description: '返回数据' },
        { name: 'data.userId', type: 'number', required: true, description: '新创建的用户ID' }
      ],
      responseExample: `{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userId": 10
  }
}`,
      errorCodes: [
        { code: 400, message: '参数验证失败', description: '用户名或密码不符合要求' },
        { code: 409, message: '用户名已存在', description: '该用户名已被其他用户使用' }
      ],
      businessLogic: [
        '检查username长度（3-20字符）和password长度（最少6位）',
        '查询users表检查username是否已存在',
        '使用bcrypt对密码进行加密（加密强度10-12轮）',
        '插入users表：username、password（加密）、role_id=3（普通用户）、status=1（启用）',
        '返回新创建的用户ID',
        '建议：限制注册频率（同一IP每小时最多注册3次）'
      ]
    },
    {
      name: '检查用户名是否存在',
      description: '验证用户名是否可用',
      path: '/api/auth/check-username',
      method: 'GET',
      params: [
        { name: 'username', type: 'string', required: true, description: '需要检查的用户名' }
      ],
      requestExample: `GET /api/auth/check-username?username=newuser`,
      responseFields: [
        { name: 'code', type: 'number', required: true, description: '响应码' },
        { name: 'data', type: 'object', required: true, description: '返回数据' },
        {
          name: 'data.exists',
          type: 'boolean',
          required: true,
          description: 'true-已存在，false-可用'
        }
      ],
      responseExample: `{
  "code": 200,
  "data": {
    "exists": false
  }
}`,
      businessLogic: [
        '接收username参数',
        '查询users表检查该用户名是否存在',
        '返回检查结果',
        '使用场景：注册表单实时验证用户名是否可用'
      ]
    }
  ])
</script>

<style scoped lang="scss">
  .api-docs-container {
    max-width: 1400px;
    margin: 0 auto;
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
