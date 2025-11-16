# API文档更新说明

> **更新日期**: 2025-11-16  
> **文档版本**: v2.0  
> **更新范围**: 认证模块、用户管理模块、角色管理模块

---

## 📋 更新概述

本次更新基于backend实际代码(Express + TypeScript + MySQL2),对前端API文档进行了全面更新,确保文档与实际API实现完全一致。

---

## 一、认证模块 (Auth)

**文档路径**: `/system/dashboard/api-docs/auth`  
**后端控制器**: `backend/src/controllers/auth.controller.ts`  
**路由文件**: `backend/src/routes/auth.routes.ts`

### 1.1 接口列表 (6个)

| 序号 | 接口名称     | 路径                       | 方法 | 权限要求 |
| ---- | ------------ | -------------------------- | ---- | -------- |
| 1    | 用户登录     | `/api/auth/login`          | POST | 公开     |
| 2    | 获取用户信息 | `/api/user/info`           | GET  | 需认证   |
| 3    | 刷新Token    | `/api/auth/refresh-token`  | POST | 公开     |
| 4    | 用户登出     | `/api/auth/logout`         | POST | 需认证   |
| 5    | 用户注册     | `/api/auth/register`       | POST | 公开     |
| 6    | 检查用户名   | `/api/auth/check-username` | GET  | 公开     |

### 1.2 主要更新内容

#### **用户登录 (`/api/auth/login`)**

**请求参数**:

```json
{
  "userName": "Super",
  "password": "123456"
}
```

**响应数据**:

```json
{
  "code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "dashboardPath": "/system/dashboard/console"
  }
}
```

**业务逻辑**:

1. 验证userName和password是否为空
2. 查询users表和roles表(LEFT JOIN),获取用户信息、角色编码和dashboard_path
3. 验证用户是否存在
4. 使用bcrypt比对password和数据库中的加密密码
5. 检查用户status是否为1(启用状态)
6. 生成JWT Token(包含userId、username、roleCode)
7. 生成Refresh Token
8. 更新users表的last_login_time和last_login_ip字段
9. 返回token、refreshToken和dashboardPath

**错误码**:

- 400: 用户名和密码不能为空
- 401: 用户名或密码错误
- 403: 用户已被禁用
- 500: 服务器内部错误

---

#### 🔹 **获取用户信息 (`/api/user/info`)**

**请求头**:

```
Authorization: Bearer {token}
```

**响应数据**:

```json
{
  "code": 200,
  "data": {
    "userId": 1,
    "userName": "Super",
    "email": "super@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "roles": ["R_SUPER"],
    "buttons": []
  }
}
```

**业务逻辑**:

1. 从请求头获取Authorization字段
2. 验证Token格式(Bearer {token})
3. 解析Token获取userId
4. 查询users表和roles表(LEFT JOIN on u.role_id = r.id)
5. 获取用户的id、username、email、avatar和role_code
6. 将role_code放入roles数组返回
7. 前端使用此接口初始化用户状态、注册动态路由

**注意事项**:

- 此接口由authenticate中间件保护
- Token有效期30分钟
- 返回的buttons字段当前为空数组(预留)

---

#### 🔹 **刷新Token (`/api/auth/refresh-token`)**

**请求参数**:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**响应数据**:

```json
{
  "code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**业务逻辑**:

1. 验证refreshToken参数是否为空
2. 使用verifyRefreshToken验证Refresh Token的签名和有效期
3. 解析Refresh Token获取userId和roleCode
4. 查询users表验证用户是否存在
5. 检查用户status是否为1
6. 生成新的Access Token(包含userId、username、roleCode)
7. 生成新的Refresh Token
8. 返回新的token和refreshToken
9. 前端替换本地存储的Token,无需重新登录

**Token有效期**:

- Access Token: 30分钟
- Refresh Token: 7天

---

#### 🔹 **用户登出 (`/api/auth/logout`)**

**请求头**:

```
Authorization: Bearer {token}
```

**响应数据**:

```json
{
  "code": 200,
  "message": "登出成功"
}
```

**业务逻辑**:

1. 验证Token(通过authenticate中间件)
2. 解析Token获取用户信息
3. 返回登出成功消息
4. 前端收到响应后:清除本地存储的Token和refreshToken、清空用户状态、跳转到登录页

**注意**:

- 当前后端未实现Token黑名单机制
- Token在有效期内仍可使用
- 实际登出操作由前端完成

---

#### 🔹 **用户注册 (`/api/auth/register`)**

**请求参数**:

```json
{
  "username": "newuser",
  "password": "password123"
}
```

**响应数据**:

```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userId": 10
  }
}
```

**业务逻辑**:

1. 验证username和password是否为空
2. 验证username长度是否在3-20字符之间
3. 验证password长度是否至少6位
4. 查询users表检查username是否已存在
5. 如果已存在,返回409错误
6. 使用bcrypt加密password(10轮salt)
7. 插入users表:username、password、role_id=3(普通用户角色)、status=1(启用)
8. 自动设置created_at和updated_at为NOW()
9. 返回新用户ID
10. 注册成功后用户需要调用登录接口获取Token

**错误码**:

- 400: 用户名和密码不能为空
- 400: 用户名长度必须在3-20个字符之间
- 400: 密码长度至少6位
- 409: 用户名已被使用
- 500: 服务器内部错误

---

#### 🔹 **检查用户名是否存在 (`/api/auth/check-username`)**

**请求参数**:

```
GET /api/auth/check-username?username=Super
```

**响应数据**:

```json
{
  "code": 200,
  "data": {
    "exists": true
  }
}
```

**业务逻辑**:

1. 从Query参数获取username
2. 验证username参数是否为空
3. 查询users表:SELECT id FROM users WHERE username = ?
4. 如果查询结果长度大于0,exists = true
5. 否则exists = false
6. 返回exists布尔值
7. 前端可用于注册表单的实时验证,避免重复提交

**使用场景**:

- 注册表单实时验证用户名是否可用
- 用户输入用户名时触发防抖请求

---

## 二、用户管理模块 (User)

**文档路径**: `/system/dashboard/api-docs/user` (已存在)  
**后端控制器**: `backend/src/controllers/user.controller.ts`  
**路由文件**: `backend/src/routes/user.routes.ts`

### 2.1 接口分类

#### 2.1.1 个人中心接口 (5个) - 当前用户

| 序号 | 接口名称     | 路径                 | 方法 | 权限要求 |
| ---- | ------------ | -------------------- | ---- | -------- |
| 1    | 获取用户详情 | `/api/user/profile`  | GET  | 需认证   |
| 2    | 更新用户信息 | `/api/user/profile`  | PUT  | 需认证   |
| 3    | 修改密码     | `/api/user/password` | POST | 需认证   |
| 4    | 更新用户标签 | `/api/user/tags`     | POST | 需认证   |
| 5    | 上传用户头像 | `/api/user/avatar`   | POST | 需认证   |

#### 2.1.2 用户管理接口 (4个) - 需要R_SUPER权限

| 序号 | 接口名称     | 路径             | 方法   | 权限要求 |
| ---- | ------------ | ---------------- | ------ | -------- |
| 1    | 获取用户列表 | `/api/user/list` | GET    | R_SUPER  |
| 2    | 创建用户     | `/api/user`      | POST   | R_SUPER  |
| 3    | 更新用户     | `/api/user/:id`  | PUT    | R_SUPER  |
| 4    | 删除用户     | `/api/user/:id`  | DELETE | R_SUPER  |

### 2.2 核心接口说明

#### 获取用户列表

**查询参数**:

- `current`: 页码(默认1)
- `size`: 每页数量(默认20)
- `userName`: 用户名模糊搜索
- `userGender`: 性别过滤(1-男,2-女)
- `userPhone`: 手机号模糊搜索
- `userEmail`: 邮箱模糊搜索
- `status`: 状态过滤(0-禁用,1-启用)

**SQL查询**:

```sql
SELECT u.id, u.username as userName, u.nickname as nickName, u.avatar,
       u.gender as userGender, u.phone as userPhone, u.email as userEmail,
       u.status, u.created_at as createTime, u.updated_at as updateTime,
       r.role_code as userRoles
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE 1=1
  -- 条件筛选...
ORDER BY u.id DESC
LIMIT ? OFFSET ?
```

**数据处理**:

- 将userRoles字符串转换为数组: `userRoles: r.userRoles ? [r.userRoles] : []`
- 分页计算: `offset = (current - 1) * size`

---

#### 创建用户

**请求参数**:

```json
{
  "username": "testuser",
  "phone": "13900139000",
  "gender": "男",
  "role": ["R_USER"]
}
```

**字段转换**:

- `gender`: "男" → 1, "女" → 2
- `role`: ["R_USER"] → role_id = 3 (查询roles表转换)
- 默认密码: "123456" (bcrypt加密)
- 默认状态: 1 (启用)

**审计字段**:

- `create_by`: 从JWT Token获取当前操作用户ID
- `created_at`: NOW()
- `updated_at`: NOW()

---

#### 获取用户详情 (个人中心)

**查询范围**:

- 用户基本信息(users表)
- 角色信息(roles表, LEFT JOIN)
- 用户标签(user_tags表)

**响应字段**:

- id, username, realName, nickname, avatar
- gender, email, phone, address, description
- status, lastLoginTime, lastLoginIp
- createdAt, updatedAt
- roleId, roleName, roleCode
- tags (数组)

---

#### 更新用户标签

**事务处理**:

```typescript
1. 开启事务
2. 删除旧标签: DELETE FROM user_tags WHERE user_id = ?
3. 插入新标签: INSERT INTO user_tags (user_id, tag_name, created_at) VALUES ...
4. 提交事务
5. 如果出错则回滚
```

---

#### 删除用户

**级联删除**:

```typescript
1. 验证不能删除自己
2. 删除用户标签: DELETE FROM user_tags WHERE user_id = ?
3. 删除用户: DELETE FROM users WHERE id = ?
```

---

## 三、角色管理模块 (Role)

**文档路径**: `/system/dashboard/api-docs/role` (已存在)  
**后端控制器**: `backend/src/controllers/role.controller.ts`  
**路由文件**: `backend/src/routes/role.routes.ts`

### 3.1 接口列表 (4个) - 全部需要R_SUPER权限

| 序号 | 接口名称     | 路径             | 方法   | 权限要求 |
| ---- | ------------ | ---------------- | ------ | -------- |
| 1    | 获取角色列表 | `/api/role/list` | GET    | R_SUPER  |
| 2    | 创建角色     | `/api/role`      | POST   | R_SUPER  |
| 3    | 更新角色     | `/api/role/:id`  | PUT    | R_SUPER  |
| 4    | 删除角色     | `/api/role/:id`  | DELETE | R_SUPER  |

### 3.2 核心接口说明

#### 获取角色列表

**查询参数**:

- `current`: 页码(默认1)
- `size`: 每页数量(默认20)
- `roleName`: 角色名称模糊搜索
- `roleCode`: 角色代码模糊搜索

**SQL查询**:

```sql
SELECT id as roleId, role_name as roleName, role_code as roleCode,
       description, enabled, created_at as createTime, updated_at as updateTime
FROM roles
WHERE 1=1
  -- 条件筛选...
ORDER BY id ASC
LIMIT ? OFFSET ?
```

**数据处理**:

- enabled字段转换: `enabled: r.enabled === 1` (TINYINT → boolean)

---

#### 创建角色

**请求参数**:

```json
{
  "roleName": "产品经理",
  "roleCode": "R_PRODUCT_MANAGER",
  "dashboardPath": "/product/dashboard/console",
  "description": "产品管理角色",
  "enabled": true
}
```

**字段转换**:

- `enabled`: true → 1, false → 0
- `dashboardPath`: 默认值 "/user/dashboard/console"

**SQL插入**:

```sql
INSERT INTO roles (role_name, role_code, dashboard_path, description, enabled, created_at)
VALUES (?, ?, ?, ?, ?, NOW())
```

---

#### 更新角色

**动态字段**:

- 基础字段: roleName, roleCode, description, enabled
- 可选字段: dashboardPath (如果提供则更新)
- 自动字段: updated_at = NOW()

**SQL更新**:

```sql
UPDATE roles
SET role_name=?, role_code=?, description=?, enabled=?,
    dashboard_path=?, updated_at=NOW()
WHERE id=?
```

---

#### 删除角色

**SQL删除**:

```sql
DELETE FROM roles WHERE id = ?
```

**注意事项**:

- 当前未实现系统角色保护
- 当前未实现用户关联检查
- 建议在后续版本中添加以下验证:
  - 不允许删除R_SUPER、R_ADMIN、R_USER等系统预设角色
  - 检查是否有用户正在使用该角色

---

## 四、数据库字段映射

### 4.1 用户表 (users)

| 前端字段   | API字段    | 数据库字段 | 类型         | 说明                |
| ---------- | ---------- | ---------- | ------------ | ------------------- |
| id         | id         | id         | INT          | 用户ID              |
| userName   | userName   | username   | VARCHAR(50)  | 用户名              |
| nickName   | nickName   | nickname   | VARCHAR(50)  | 昵称                |
| avatar     | avatar     | avatar     | VARCHAR(255) | 头像URL             |
| userGender | userGender | gender     | TINYINT      | 性别(1-男,2-女)     |
| userPhone  | userPhone  | phone      | VARCHAR(20)  | 手机号              |
| userEmail  | userEmail  | email      | VARCHAR(100) | 邮箱                |
| status     | status     | status     | TINYINT      | 状态(0-禁用,1-启用) |
| userRoles  | userRoles  | role_code  | VARCHAR(50)  | 角色编码(JOIN查询)  |
| createTime | createTime | created_at | DATETIME     | 创建时间            |
| updateTime | updateTime | updated_at | DATETIME     | 更新时间            |

### 4.2 角色表 (roles)

| 前端字段    | API字段     | 数据库字段  | 类型         | 说明                    |
| ----------- | ----------- | ----------- | ------------ | ----------------------- |
| roleId      | roleId      | id          | INT          | 角色ID                  |
| roleName    | roleName    | role_name   | VARCHAR(50)  | 角色名称                |
| roleCode    | roleCode    | role_code   | VARCHAR(50)  | 角色编码                |
| description | description | description | VARCHAR(200) | 角色描述                |
| enabled     | enabled     | enabled     | TINYINT      | 启用状态(1-启用,0-禁用) |
| createTime  | createTime  | created_at  | DATETIME     | 创建时间                |
| updateTime  | updateTime  | updated_at  | DATETIME     | 更新时间                |

---

## 五、JWT Token机制

### 5.1 Token结构

**Access Token Payload**:

```typescript
{
  userId: number,      // 用户ID
  username: string,    // 用户名
  roleCode: string     // 角色编码
}
```

**Token生成**:

- Access Token有效期: 30分钟
- Refresh Token有效期: 7天
- 签名算法: HS256
- 密钥: process.env.JWT_SECRET

### 5.2 认证中间件

**authenticate中间件**:

1. 检查Authorization请求头
2. 验证Bearer {token}格式
3. 使用verifyToken验证Token签名和有效期
4. 解析Token获取userId、username、roleCode
5. 将用户信息挂载到req.user
6. 调用next()继续后续处理

**authorize中间件**:

1. 验证req.user是否存在
2. 检查req.user.roleCode是否在允许的角色列表中
3. 如果不在,返回403错误(权限不足)

---

## 六、全局错误码

| 错误码 | 含义       | 使用场景                        |
| ------ | ---------- | ------------------------------- |
| 200    | 请求成功   | 所有成功响应                    |
| 400    | 参数错误   | 必填字段缺失、格式不正确        |
| 401    | 未认证     | Token缺失、Token无效、Token过期 |
| 403    | 权限不足   | 角色权限不足、用户被禁用        |
| 404    | 资源不存在 | 用户不存在、角色不存在          |
| 409    | 资源冲突   | 用户名已存在、角色编码已存在    |
| 500    | 服务器错误 | 数据库错误、未捕获的异常        |

---

## 七、更新记录

| 日期       | 模块         | 更新内容                                    | 更新人       |
| ---------- | ------------ | ------------------------------------------- | ------------ |
| 2025-11-16 | 认证模块     | 完整更新所有6个接口文档,基于backend实际代码 | AI Assistant |
| 2025-11-16 | 用户管理模块 | 文档已存在,本次更新说明中补充完善           | AI Assistant |
| 2025-11-16 | 角色管理模块 | 文档已存在,本次更新说明中补充完善           | AI Assistant |

---

## 八、相关文档

- **字段映射与转换规则**: `项目文档/字段映射与转换规则.md`
- **日期时间格式全局优化说明**: `项目文档/日期时间格式全局优化说明.md`
- **用户管理功能优化说明**: `项目文档/用户管理功能优化说明.md`
- **后端API测试指南**: `backend/API_TEST.md`
- **后端README**: `backend/README.md`

---

## 九、后续优化建议

### 9.1 认证模块

- [ ] 实现Token黑名单机制(Redis)
- [ ] 实现验证码登录功能
- [ ] 实现第三方登录(OAuth2.0)
- [ ] 添加登录日志记录

### 9.2 用户管理模块

- [ ] 实现用户批量导入/导出
- [ ] 实现用户权限细粒度控制
- [ ] 添加用户操作日志
- [ ] 实现用户头像上传到云存储

### 9.3 角色管理模块

- [ ] 实现角色权限菜单配置
- [ ] 添加系统角色保护机制
- [ ] 实现角色关联用户检查
- [ ] 添加角色复制功能

### 9.4 安全性

- [ ] 实现请求频率限制(Rate Limiting)
- [ ] 添加SQL注入防护
- [ ] 实现XSS防护
- [ ] 添加CORS白名单机制
- [ ] 实现敏感操作二次确认

---

**文档维护者**: 开发团队  
**最后更新时间**: 2025-11-16  
**文档状态**: ✅ 已完成
