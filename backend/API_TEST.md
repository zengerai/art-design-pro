# API 接口测试指南

本文档提供所有后端API接口的测试示例。

## 前置准备

所有测试都需要先登录获取Token。

### 1. 登录获取Token

```bash
# 使用Super账号登录
curl -X POST http://localhost:3009/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userName":"Super","password":"123456"}' | python3 -m json.tool

# 提取token（后续所有请求都需要）
export TOKEN="你获取到的token"
```

预置账号：

- **Super** / 123456 - 超级管理员（R_SUPER）
- **Admin** / 123456 - 系统管理员（R_ADMIN）
- **User** / 123456 - 普通用户（R_USER）

---

## 认证模块 API

### 1. 用户登录

```bash
curl -X POST http://localhost:3009/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "Super",
    "password": "123456"
  }' | python3 -m json.tool
```

### 2. 获取用户信息

```bash
curl -X GET http://localhost:3009/api/user/info \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

### 3. 刷新Token

```bash
curl -X POST http://localhost:3009/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "你的refreshToken"
  }' | python3 -m json.tool
```

### 4. 用户登出

```bash
curl -X POST http://localhost:3009/api/auth/logout \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

### 5. 用户注册

```bash
curl -X POST http://localhost:3009/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "newuser",
    "password": "123456",
    "email": "newuser@example.com"
  }' | python3 -m json.tool
```

### 6. 检查用户名是否存在

```bash
curl -X GET "http://localhost:3009/api/auth/check-username?userName=Super" \
  | python3 -m json.tool
```

---

## 个人中心 API

### 1. 获取当前用户详情

```bash
curl -X GET http://localhost:3009/api/user/profile \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

### 2. 更新当前用户信息

```bash
curl -X PUT http://localhost:3009/api/user/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "realName": "张三",
    "nickname": "小张",
    "sex": 1,
    "email": "zhangsan@example.com",
    "mobile": "13800138001",
    "address": "北京市朝阳区",
    "description": "前端开发工程师"
  }' | python3 -m json.tool
```

### 3. 修改当前用户密码

```bash
curl -X POST http://localhost:3009/api/user/password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "123456",
    "newPassword": "654321"
  }' | python3 -m json.tool
```

### 4. 更新当前用户标签

```bash
curl -X POST http://localhost:3009/api/user/tags \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tags": ["专注设计", "很有想法", "大长腿", "川妹子"]
  }' | python3 -m json.tool
```

### 5. 上传当前用户头像

```bash
curl -X POST http://localhost:3009/api/user/avatar \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "avatar": "https://example.com/avatar/user.jpg"
  }' | python3 -m json.tool
```

---

## 用户管理 API（需要R_SUPER权限）

### 1. 获取用户列表

```bash
curl -X GET "http://localhost:3009/api/user/list?current=1&size=10" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

支持的查询参数：

- `current`: 页码（默认1）
- `size`: 每页数量（默认20）
- `userName`: 用户名模糊搜索
- `userGender`: 性别过滤（1-男，2-女）
- `userPhone`: 手机号模糊搜索
- `userEmail`: 邮箱模糊搜索
- `status`: 状态过滤（0-禁用，1-启用）

### 2. 创建用户

```bash
curl -X POST http://localhost:3009/api/user \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "phone": "13900139000",
    "gender": "男",
    "role": 3
  }' | python3 -m json.tool
```

### 3. 更新用户

```bash
curl -X PUT http://localhost:3009/api/user/5 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "updateduser",
    "phone": "13900139001",
    "gender": "女"
  }' | python3 -m json.tool
```

### 4. 删除用户

```bash
curl -X DELETE http://localhost:3009/api/user/5 \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

---

## 角色管理 API（需要R_SUPER权限）

### 1. 获取角色列表

```bash
curl -X GET "http://localhost:3009/api/role/list?current=1&size=10" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

支持的查询参数：

- `current`: 页码（默认1）
- `size`: 每页数量（默认20）
- `roleName`: 角色名称模糊搜索
- `roleCode`: 角色代码模糊搜索

### 2. 创建角色

```bash
curl -X POST http://localhost:3009/api/role \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleName": "测试角色",
    "roleCode": "R_TEST",
    "description": "测试角色描述"
  }' | python3 -m json.tool
```

### 3. 更新角色

```bash
curl -X PUT http://localhost:3009/api/role/4 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleName": "更新的角色",
    "roleCode": "R_UPDATED",
    "description": "更新后的描述"
  }' | python3 -m json.tool
```

### 4. 删除角色

```bash
curl -X DELETE http://localhost:3009/api/role/4 \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

---

## 完整测试流程示例

```bash
# 1. 登录
TOKEN=$(curl -X POST http://localhost:3009/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userName":"Super","password":"123456"}' -s \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")

echo "Token: $TOKEN"

# 2. 获取个人信息
curl -X GET http://localhost:3009/api/user/profile \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# 3. 更新个人标签
curl -X POST http://localhost:3009/api/user/tags \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tags":["开发","前端","Vue"]}' | python3 -m json.tool

# 4. 获取用户列表
curl -X GET "http://localhost:3009/api/user/list?current=1&size=5" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# 5. 获取角色列表
curl -X GET "http://localhost:3009/api/role/list?current=1&size=5" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

---

## 响应格式说明

### 成功响应

```json
{
  "code": 200,
  "data": {},
  "message": "操作成功"
}
```

### 错误响应

```json
{
  "code": 400,
  "message": "错误描述"
}
```

### 常见状态码

- `200`: 成功
- `400`: 请求参数错误
- `401`: 未认证或Token失效
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 注意事项

1. **Token有效期**：Access Token 30分钟，Refresh Token 7天
2. **权限要求**：部分接口需要R_SUPER权限，请使用Super账号测试
3. **密码加密**：所有密码使用bcryptjs加密存储
4. **CORS配置**：后端已配置允许前端跨域访问
5. **测试建议**：建议使用Postman或类似工具进行API测试
