# 登录Token传递问题修复报告

## 问题描述

用户点击登录后，控制台报错：

```
[2025-11-16T13:12:08.224Z] POST /api/auth/login
[2025-11-16T13:12:08.501Z] GET /api/user/info
[错误] GET /api/user/info: Error: 未提供认证令牌
```

## 问题分析

### 问题流程

1. **用户点击登录** → 调用 `POST /api/auth/login`
2. **登录成功** → 返回 `token` 和 `refreshToken`
3. **保存Token** → 调用 `userStore.setToken(token, refreshToken)`
4. **跳转首页** → 路由守卫触发
5. **获取用户信息** → 调用 `GET /api/user/info`
6. **❌ 错误发生** → 请求头中没有携带 `Authorization: Bearer <token>`

### 根本原因

**问题出在 `/src/utils/http/index.ts` 的请求拦截器中：**

```typescript
// ❌ 错误的代码（修复前）
axiosInstance.interceptors.request.use((request: InternalAxiosRequestConfig) => {
  const { accessToken } = useUserStore() // 解构赋值在拦截器注册时执行
  if (accessToken) request.headers.set('Authorization', `Bearer ${accessToken}`)
  // ...
})
```

**JavaScript解构赋值的特性：**

- `const { accessToken } = useUserStore()` 会在拦截器**注册时**立即执行
- 此时 `accessToken` 为空字符串（用户还未登录）
- 解构赋值会**复制值**，而不是创建引用
- 后续登录成功设置了新的token，但拦截器中的 `accessToken` 仍然是空字符串

**为什么这是个问题：**

1. 应用启动时，拦截器被注册，`accessToken` 被设置为空字符串 `""`
2. 用户登录成功，调用 `setToken()` 更新了 `userStore.accessToken`
3. 下一个请求发起时，拦截器中的 `accessToken` 仍然是空字符串
4. 导致 Authorization 头没有被添加到请求中

## 修复方案

### 修改 `/src/utils/http/index.ts`

```typescript
// ✅ 正确的代码（修复后）
axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    // 每次请求时动态获取最新的 accessToken
    const userStore = useUserStore()
    const accessToken = userStore.accessToken
    if (accessToken) request.headers.set('Authorization', `Bearer ${accessToken}`)

    if (request.data && !(request.data instanceof FormData) && !request.headers['Content-Type']) {
      request.headers.set('Content-Type', 'application/json')
      request.data = JSON.stringify(request.data)
    }

    return request
  },
  (error) => {
    showError(createHttpError($t('httpMsg.requestConfigError'), ApiStatus.error))
    return Promise.reject(error)
  }
)
```

### 修复要点

1. **不使用解构赋值** - 避免在拦截器注册时就固定accessToken的值
2. **每次动态获取** - 在每个请求发起时，都从store中获取最新的accessToken
3. **保持响应式** - 确保token更新后，下一个请求能立即使用新的token

## 验证测试

### 后端接口测试

1. **登录接口测试**

```bash
curl -X POST http://localhost:3009/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userName":"Super","password":"123456"}'

# 返回：
{
  "code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "dashboardPath": "/system/dashboard/console"
  }
}
```

2. **获取用户信息接口测试**

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
curl -X GET http://localhost:3009/api/user/info \
  -H "Authorization: Bearer $TOKEN"

# 返回：
{
  "code": 200,
  "data": {
    "id": 1,
    "username": "Super",
    "realName": "超级管理员",
    "roleCode": "R_SUPER",
    ...
  }
}
```

✅ 后端接口工作正常

### 前端测试步骤

1. **清理缓存**
   - 打开浏览器开发者工具
   - Application → Local Storage → 清空所有数据
   - 刷新页面

2. **测试登录**
   - 访问登录页：http://localhost:3008/#/auth/login
   - 选择"系统后台管理员"账号
   - 用户名：Super
   - 密码：123456
   - 完成滑块验证
   - 点击登录

3. **验证修复**
   - 查看Network标签
   - 应该看到两个请求：
     - `POST /api/auth/login` - 返回200，包含token
     - `GET /api/user/info` - 返回200，包含用户信息
   - **Request Headers应该包含：**
     ```
     Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

## 相关文件

- `/src/utils/http/index.ts` - HTTP请求拦截器（已修复）
- `/src/store/modules/user.ts` - 用户状态管理（setToken方法）
- `/src/api/auth.ts` - 认证API接口
- `/src/router/guards/beforeEach.ts` - 路由守卫（调用fetchGetUserInfo）
- `/backend/src/middleware/auth.middleware.ts` - 后端认证中间件

## 技术细节

### Pinia持久化机制

使用 `pinia-plugin-persistedstate` 插件：

- 配置文件：`/src/store/index.ts`
- 存储位置：localStorage
- 存储键：`sys-v{version}-user`（版本化）
- 序列化：JSON.stringify / JSON.parse
- **持久化是同步的**，不会影响token的读取

### JWT Token配置

后端配置（`/backend/src/utils/auth.util.ts`）：

- Access Token有效期：30分钟
- Refresh Token有效期：7天
- 算法：HS256
- 密钥：从环境变量读取

### 请求流程

```
用户登录
  ↓
调用 fetchLogin() API
  ↓
返回 { token, refreshToken }
  ↓
调用 userStore.setToken(token, refreshToken)
  ↓
Token保存到 Pinia Store + localStorage
  ↓
路由跳转到首页 "/"
  ↓
路由守卫触发 beforeEach
  ↓
检查 isLogin = true，路由未注册
  ↓
调用 fetchGetUserInfo() API
  ↓
请求拦截器执行：
  - const userStore = useUserStore()  ← 获取最新的store实例
  - const accessToken = userStore.accessToken  ← 读取最新的token
  - request.headers.set('Authorization', `Bearer ${accessToken}`)  ← 添加认证头
  ↓
请求发送，携带正确的Authorization头
  ↓
后端验证Token，返回用户信息
  ↓
前端保存用户信息到store
  ↓
注册动态路由
  ↓
跳转到工作台页面
```

## 总结

**问题根源：** JavaScript解构赋值在拦截器注册时就固定了accessToken的值，导致登录后的请求无法获取最新的token。

**修复方案：** 在每次请求时动态从store中获取最新的accessToken，而不是在拦截器注册时解构赋值。

**修复文件：** `/src/utils/http/index.ts`（1处修改，增加2行代码）

**修复效果：** 登录后所有需要认证的API请求都能正确携带Authorization头，用户可以正常访问系统。
