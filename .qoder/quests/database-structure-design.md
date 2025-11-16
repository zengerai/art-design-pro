# 用户登录模块设计

## 设计目标

为虚拟币数据分析系统设计简洁实用的数据库结构，支持小规模用户（少于20人）的登录认证和权限管理功能。

## 设计原则

- 保持简单：避免过度设计，满足基本需求即可
- 快速开发：表结构清晰，易于实现
- 易于维护：字段少而精，便于后期调整

## 前端界面设计

### 1. 登录界面

**访问路径**：http://localhost:3006/#/auth/login

**功能说明**：

- 支持用户名密码登录
- 集成拖拽验证组件，提高安全性
- 支持记住密码功能
- 提供快捷账号切换（超级管理员、管理员、普通用户）

**表单字段**：

| 字段名           | 字段类型 | 是否必填 | 验证规则 | 说明     |
| ---------------- | -------- | -------- | -------- | -------- |
| username         | string   | 是       | 非空     | 用户名   |
| password         | string   | 是       | 非空     | 密码     |
| rememberPassword | boolean  | 否       | -        | 记住密码 |

**预置测试账号**：

| 角色类型   | 用户名 | 密码   | 角色标识    |
| ---------- | ------ | ------ | ----------- |
| 超级管理员 | Super  | 123456 | super_admin |
| 管理员     | Admin  | 123456 | admin       |
| 普通用户   | User   | 123456 | user        |

### 2. 用户个人中心界面

**访问路径**：http://localhost:3006/#/system/user-center

**功能说明**：

- 展示用户基本信息和个人资料
- 支持编辑个人信息
- 支持修改登录密码
- 展示用户个性化标签

**基本设置表单字段**：

| 界面字段 | 表单字段名 | 字段类型 | 是否必填 | 验证规则    | 说明         |
| -------- | ---------- | -------- | -------- | ----------- | ------------ |
| 姓名     | realName   | string   | 是       | 2-50字符    | 用户真实姓名 |
| 昵称     | nickname   | string   | 是       | 2-50字符    | 用户昵称     |
| 性别     | sex        | string   | 是       | 1或2        | 1-男，2-女   |
| 邮箱     | email      | string   | 是       | 邮箱格式    | 邮箱地址     |
| 手机     | mobile     | string   | 是       | 11位手机号  | 手机号码     |
| 地址     | address    | string   | 是       | 非空        | 详细地址     |
| 个人介绍 | des        | string   | 否       | 最大500字符 | 个人简介     |

**修改密码表单字段**：

| 界面字段   | 表单字段名      | 字段类型 | 是否必填 | 验证规则          | 说明         |
| ---------- | --------------- | -------- | -------- | ----------------- | ------------ |
| 当前密码   | oldPassword     | string   | 是       | 非空              | 当前登录密码 |
| 新密码     | newPassword     | string   | 是       | 非空              | 新设置的密码 |
| 确认新密码 | confirmPassword | string   | 是       | 与newPassword一致 | 确认密码     |

### 3. 注册界面

**访问路径**：http://localhost:3006/#/auth/register

**功能说明**：

- 支持新用户注册
- 用户名唯一性验证
- 密码强度验证
- 用户协议确认
- 注册成功后自动跳转登录页

**表单字段**：

| 字段名          | 字段类型 | 是否必填 | 验证规则       | 说明         |
| --------------- | -------- | -------- | -------------- | ------------ |
| username        | string   | 是       | 3-20字符，唯一 | 用户名       |
| password        | string   | 是       | 最少6位        | 密码         |
| confirmPassword | string   | 是       | 与password一致 | 确认密码     |
| agreement       | boolean  | 是       | 必须为true     | 同意用户协议 |

**验证规则**：

1. **用户名验证**：
   - 长度：3-20个字符
   - 唯一性：需要后端验证用户名是否已存在
   - 建议格式：字母、数字、下划线

2. **密码验证**：
   - 最小长度：6位
   - 建议包含：大小写字母、数字、特殊字符

3. **确认密码验证**：
   - 必须与密码字段完全一致

4. **用户协议**：
   - 必须勾选才能注册

## 后端 API 设计

### 1. 认证相关接口

#### 1.1 用户登录

**接口路径**：`POST /api/auth/login`

**请求参数**：

```
{
  "userName": "string",    // 用户名，必填
  "password": "string"     // 密码，必填
}
```

**返回数据**：

```
{
  "token": "string",           // 访问Token
  "refreshToken": "string",     // 刷新Token
  "dashboardPath": "string"     // 控制台跳转路径
}
```

**返回示例**：

```
// 系统后台管理员登录
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "dashboardPath": "/system/dashboard/console"
}

// 系统管理员/普通用户登录
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "dashboardPath": "/user/dashboard/console"
}
```

**业务逻辑**：

1. 根据userName查询users表，检查用户是否存在
2. 验证password是否匹配（使用bcrypt比对加密密码）
3. 检查用户status是否为启用状态（1）
4. 查询roles表获取用户角色信息和dashboard_path字段
5. 生成JWT Token和Refresh Token
6. 更新users表的last_login_time和last_login_ip
7. 返回Token信息和控制台跳转路径（dashboardPath）

**错误码**：

- 401：用户名或密码错误
- 403：用户已被禁用
- 500：服务器内部错误

#### 1.2 获取用户信息

**接口路径**：`GET /api/user/info`

**请求头**：

```
Authorization: Bearer {token}
```

**返回数据**：

```
{
  "userId": "number",        // 用户ID
  "userName": "string",      // 用户名
  "email": "string",         // 邮箱
  "avatar": "string",        // 头像URL
  "roles": ["string"],       // 角色数组
  "buttons": ["string"]      // 按钮权限数组
}
```

**业务逻辑**：

1. 解析Token获取userId
2. 查询users表获取用户基本信息
3. 通过role_id查询roles表获取角色信息
4. 返回用户信息（不包含password字段）

#### 1.3 刷新Token

**接口路径**：`POST /api/auth/refresh-token`

**请求头**：

```
Authorization: Bearer {refreshToken}
```

**请求参数**：

```
{
  "refreshToken": "string"   // 刷新Token
}
```

**返回数据**：

```
{
  "token": "string",           // 新的访问Token
  "refreshToken": "string"     // 新的刷新Token
}
```

**业务逻辑**：

1. 验证refreshToken的有效性
2. 检查refreshToken是否过期（有效期7天）
3. 解析refreshToken获取userId
4. 查询users表确认用户仍然存在且启用
5. 生成新的JWT Token（有效期30分钟）
6. 生成新的Refresh Token（有效期7天）
7. 返回新的Token信息

**错误码**：

- 401：Refresh Token无效或已过期
- 403：用户已被禁用
- 500：服务器内部错误

#### 1.4 用户登出

**接口路径**：`POST /api/auth/logout`

**请求头**：

```
Authorization: Bearer {token}
```

**返回数据**：

```
{
  "code": 200,
  "message": "登出成功"
}
```

**业务逻辑**：

1. 解析Token获取userId
2. （可选）将Token加入黑名单，防止复用
3. （可选）记录登出日志
4. 返回登出成功消息

**前端配合**：

- 清除本地存储的Token
- 清空用户状态
- 跳转到登录页

#### 1.5 用户注册

**接口路径**：`POST /api/auth/register`

**请求参数**：

```
{
  "username": "string",    // 用户名，必填，3-20字符
  "password": "string"     // 密码，必填，最少6位
}
```

**返回数据**：

```
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userId": "number"      // 新创建的用户ID
  }
}
```

**业务逻辑**：

1. **参数验证**：
   - 检查username长度（3-20字符）
   - 检查password长度（最少6位）
   - 验证username格式（建议：字母、数字、下划线）

2. **用户名唯一性检查**：
   - 查询users表检查username是否已存在
   - 如果存在，返回错误：“用户名已被使用”

3. **密码加密**：
   - 使用bcrypt对密码进行加密
   - 加密强度：10-12轮

4. **创建用户记录**：
   - 插入users表，设置以下字段：
     - username: 用户输入的用户名
     - password: 加密后的密码
     - role_id: 3（默认为普通用户）
     - status: 1（默认启用）
     - created_at: 当前时间
     - updated_at: 当前时间

5. **返回结果**：
   - 返回新创建的用户ID
   - 提示注册成功

**错误码**：

- 400：参数验证失败（用户名或密码不符合要求）
- 409：用户名已存在
- 500：服务器内部错误

**安全建议**：

1. **限制注册频率**：
   - 同一IP每小时最多注册3次
   - 防止恶意批量注册

2. **用户名黑名单**（可选）：
   - 禁止admin、root等敏感用户名
   - 防止保留关键词被注册

3. **邮箱验证**（可选、后期扩展）：
   - 注册时需要提供邮箱
   - 发送验证邮件
   - 激活后才能登录

#### 1.6 检查用户名是否存在

**接口路径**：`GET /api/auth/check-username`

**请求参数**：

```
?username=string    // 需要检查的用户名
```

**返回数据**：

```
{
  "code": 200,
  "data": {
    "exists": "boolean"    // true-已存在，false-可用
  }
}
```

**业务逻辑**：

1. 接收username参数
2. 查询users表检查该用户名是否存在
3. 返回检查结果

**使用场景**：

- 注册表单实时验证用户名是否可用
- 用户输入用户名后失焦时触发检查

### 2. 用户个人中心相关接口

#### 2.1 获取用户详细信息

**接口路径**：`GET /api/user/profile`

**请求头**：

```
Authorization: Bearer {token}
```

**返回数据**：

```
{
  "id": "number",
  "username": "string",
  "realName": "string",
  "nickname": "string",
  "avatar": "string",
  "sex": "number",
  "email": "string",
  "mobile": "string",
  "address": "string",
  "description": "string",
  "roleId": "number",
  "roleName": "string",
  "tags": ["string"],           // 用户标签数组
  "lastLoginTime": "string",
  "lastLoginIp": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**业务逻辑**：

1. 解析Token获取userId
2. 查询users表获取用户完整信息
3. 查询roles表获取角色名称
4. 查询user_tags表获取用户标签列表
5. 返回完整的用户信息（不包含password）

#### 2.2 更新用户信息

**接口路径**：`PUT /api/user/profile`

**请求头**：

```
Authorization: Bearer {token}
```

**请求参数**：

```
{
  "realName": "string",      // 姓名，必填，2-50字符
  "nickname": "string",      // 昵称，必填，2-50字符
  "sex": "number",           // 性别，必填，1或2
  "email": "string",         // 邮箱，必填，符合邮箱格式
  "mobile": "string",        // 手机，必填，11位手机号
  "address": "string",       // 地址，必填
  "description": "string"   // 个人介绍，可选，最大500字符
}
```

**返回数据**：

```
{
  "code": 200,
  "message": "更新成功"
}
```

**业务逻辑**：

1. 解析Token获取userId
2. 验证请求参数格式和长度
3. 更新users表对应字段
4. 自动更新updated_at字段
5. 返回更新结果

#### 2.3 修改密码

**接口路径**：`POST /api/user/change-password`

**请求头**：

```
Authorization: Bearer {token}
```

**请求参数**：

```
{
  "oldPassword": "string",   // 当前密码，必填
  "newPassword": "string"    // 新密码，必填
}
```

**返回数据**：

```
{
  "code": 200,
  "message": "密码修改成功"
}
```

**业务逻辑**：

1. 解析Token获取userId
2. 查询users表获取当前用户的加密密码
3. 使用bcrypt验证oldPassword是否正确
4. 如果验证成功，使用bcrypt加密newPassword
5. 更新users表的password字段
6. 返回修改结果

**错误码**：

- 400：当前密码错误
- 401：Token无效
- 500：服务器内部错误

#### 2.4 更新用户标签

**接口路径**：`POST /api/user/tags`

**请求头**：

```
Authorization: Bearer {token}
```

**请求参数**：

```
{
  "tags": ["string"]         // 标签数组
}
```

**返回数据**：

```
{
  "code": 200,
  "message": "标签更新成功"
}
```

**业务逻辑**：

1. 解析Token获取userId
2. 删除user_tags表中该用户的所有标签（WHERE user_id = userId）
3. 批量插入新的标签列表
4. 返回更新结果

#### 2.5 上传用户头像

**接口路径**：`POST /api/user/avatar`

**请求头**：

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**请求参数**：

```
file: 文件对象（图片文件）
```

**返回数据**：

```
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "avatarUrl": "string"    // 头像URL地址
  }
}
```

**业务逻辑**：

1. 解析Token获取userId
2. 验证文件类型（只允许jpg、png、gif等图片格式）
3. 验证文件大小（建议不超过2MB）
4. 将文件上传到文件存储服务（本地或云存储）
5. 获取文件访问URL
6. 更新users表的avatar字段
7. 返回头像URL

### 3. 角色管理相关接口

#### 3.1 获取角色列表

**接口路径**：`GET /api/roles`

**请求头**：

```
Authorization: Bearer {token}
```

**返回数据**：

```
{
  "code": 200,
  "data": [
    {
      "id": "number",
      "roleName": "string",
      "roleCode": "string",
      "dashboardPath": "string",
      "description": "string",
      "status": "number",
      "createdAt": "string"
    }
  ]
}
```

**业务逻辑**：

1. 查询roles表获取所有角色
2. 按照id升序排列
3. 返回角色列表

## 前后端数据库字段对齐关系

### 1. 登录流程字段映射

| 前端字段 | 后端API字段  | 数据库字段 | 数据表 | 说明                  |
| -------- | ------------ | ---------- | ------ | --------------------- |
| username | userName     | username   | users  | 用户名                |
| password | password     | password   | users  | 密码（加密）          |
| -        | token        | -          | -      | JWT Token（后端生成） |
| -        | refreshToken | -          | -      | 刷新Token（后端生成） |

### 2. 用户信息字段映射

| 前端字段 | 后端API字段 | 数据库字段  | 数据表    | 说明         |
| -------- | ----------- | ----------- | --------- | ------------ |
| -        | userId      | id          | users     | 用户ID       |
| -        | userName    | username    | users     | 用户名       |
| realName | realName    | real_name   | users     | 真实姓名     |
| nickname | nickname    | nickname    | users     | 昵称         |
| -        | avatar      | avatar      | users     | 头像URL      |
| sex      | sex         | sex         | users     | 性别         |
| email    | email       | email       | users     | 邮箱         |
| mobile   | mobile      | mobile      | users     | 手机号       |
| address  | address     | address     | users     | 地址         |
| des      | description | description | users     | 个人介绍     |
| -        | roleId      | role_id     | users     | 角色ID       |
| -        | roleName    | role_name   | roles     | 角色名称     |
| -        | tags        | tag_name    | user_tags | 用户标签数组 |

### 3. 角色信息字段映射

| 前端字段 | 后端API字段   | 数据库字段     | 数据表 | 说明       |
| -------- | ------------- | -------------- | ------ | ---------- |
| -        | id            | id             | roles  | 角色ID     |
| -        | roleName      | role_name      | roles  | 角色名称   |
| -        | roleCode      | role_code      | roles  | 角色编码   |
| -        | dashboardPath | dashboard_path | roles  | 控制台路径 |
| -        | description   | description    | roles  | 角色描述   |
| -        | status        | status         | roles  | 角色状态   |

### 4. 注册流程字段映射

| 前端字段        | 后端API字段 | 数据库字段 | 数据表 | 说明                   |
| --------------- | ----------- | ---------- | ------ | ---------------------- |
| username        | username    | username   | users  | 用户名，唯一           |
| password        | password    | password   | users  | 密码（加密后存储）     |
| confirmPassword | -           | -          | -      | 仅前端验证，不传输后端 |
| agreement       | -           | -          | -      | 仅前端验证，不传输后端 |
| -               | -           | role_id    | users  | 默认3（普通用户）      |
| -               | -           | status     | users  | 默认1（启用）          |
| -               | userId      | id         | users  | 注册成功后返回         |

## 数据库基本信息

- **数据库类型**：MySQL 5.7
- **数据库名称**：virtualProject_dev
- **字符集**：utf8mb4
- **排序规则**：utf8mb4_general_ci

## 核心数据表设计

系统共包含3张核心数据表：

1. **users（用户表）**：存储用户基本信息、认证信息和个人资料
2. **roles（角色表）**：定义系统角色及权限配置
3. **user_tags（用户标签表）**：存储用户个性化标签

### 1. 用户表 (users)

存储系统所有用户的基本信息和认证数据。

| 字段名          | 数据类型 | 长度 | 是否必填 | 默认值            | 说明                   |
| --------------- | -------- | ---- | -------- | ----------------- | ---------------------- |
| id              | INT      | -    | 是       | 自增              | 用户ID，主键           |
| username        | VARCHAR  | 50   | 是       | -                 | 用户名，唯一，用于登录 |
| password        | VARCHAR  | 255  | 是       | -                 | 密码（加密存储）       |
| real_name       | VARCHAR  | 50   | 否       | NULL              | 真实姓名               |
| nickname        | VARCHAR  | 50   | 否       | NULL              | 昵称                   |
| avatar          | VARCHAR  | 255  | 否       | NULL              | 头像URL                |
| sex             | TINYINT  | -    | 否       | NULL              | 性别：1-男，2-女       |
| email           | VARCHAR  | 100  | 否       | NULL              | 邮箱                   |
| mobile          | VARCHAR  | 20   | 否       | NULL              | 手机号                 |
| address         | VARCHAR  | 200  | 否       | NULL              | 地址                   |
| description     | VARCHAR  | 500  | 否       | NULL              | 个人介绍               |
| role_id         | INT      | -    | 是       | 3                 | 角色ID，关联角色表     |
| status          | TINYINT  | -    | 是       | 1                 | 状态：1-启用，0-禁用   |
| last_login_time | DATETIME | -    | 否       | NULL              | 最后登录时间           |
| last_login_ip   | VARCHAR  | 50   | 否       | NULL              | 最后登录IP             |
| created_at      | DATETIME | -    | 是       | CURRENT_TIMESTAMP | 创建时间               |
| updated_at      | DATETIME | -    | 是       | CURRENT_TIMESTAMP | 更新时间（自动更新）   |

**索引设计**：

- 主键索引：id
- 唯一索引：username
- 普通索引：role_id
- 普通索引：mobile（可选，方便按手机号查询）

### 2. 角色表 (roles)

定义系统中的三种角色类型及其权限范围。

| 字段名         | 数据类型 | 长度 | 是否必填 | 默认值            | 说明                   |
| -------------- | -------- | ---- | -------- | ----------------- | ---------------------- |
| id             | INT      | -    | 是       | 自增              | 角色ID，主键           |
| role_name      | VARCHAR  | 50   | 是       | -                 | 角色名称               |
| role_code      | VARCHAR  | 50   | 是       | -                 | 角色编码，唯一         |
| dashboard_path | VARCHAR  | 200  | 是       | -                 | 登录后跳转的控制台路径 |
| description    | VARCHAR  | 200  | 否       | NULL              | 角色描述               |
| status         | TINYINT  | -    | 是       | 1                 | 状态：1-启用，0-禁用   |
| created_at     | DATETIME | -    | 是       | CURRENT_TIMESTAMP | 创建时间               |

**索引设计**：

- 主键索引：id
- 唯一索引：role_code

**预置数据**：

| id  | role_name      | role_code   | dashboard_path            | description              |
| --- | -------------- | ----------- | ------------------------- | ------------------------ |
| 1   | 系统后台管理员 | super_admin | /system/dashboard/console | 超级管理员，拥有所有权限 |
| 2   | 系统管理员     | admin       | /user/dashboard/console   | 系统管理员               |
| 3   | 系统用户       | user        | /user/dashboard/console   | 普通用户                 |

### 3. 用户标签表 (user_tags)

存储用户的个性化标签信息。

| 字段名     | 数据类型 | 长度 | 是否必填 | 默认值            | 说明               |
| ---------- | -------- | ---- | -------- | ----------------- | ------------------ |
| id         | INT      | -    | 是       | 自增              | 标签ID，主键       |
| user_id    | INT      | -    | 是       | -                 | 用户ID，关联用户表 |
| tag_name   | VARCHAR  | 50   | 是       | -                 | 标签名称           |
| created_at | DATETIME | -    | 是       | CURRENT_TIMESTAMP | 创建时间           |

**索引设计**：

- 主键索引：id
- 普通索引：user_id
- 联合索引：(user_id, tag_name) 防止重复添加相同标签

## 数据表关系说明

```mermaid
erDiagram
    users ||--o{ user_tags : "拥有"
    roles ||--o{ users : "分配给"

    users {
        int id PK
        varchar username UK
        varchar password
        varchar real_name
        varchar nickname
        varchar avatar
        tinyint sex
        varchar email
        varchar mobile
        varchar address
        varchar description
        int role_id FK
        tinyint status
        datetime last_login_time
        varchar last_login_ip
        datetime created_at
        datetime updated_at
    }

    roles {
        int id PK
        varchar role_name
        varchar role_code UK
        varchar dashboard_path
        varchar description
        tinyint status
        datetime created_at
    }

    user_tags {
        int id PK
        int user_id FK
        varchar tag_name
        datetime created_at
    }
```

## 登录认证流程

### 登录流程

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant B as 后端
    participant D as 数据库

    U->>F: 输入用户名和密码
    F->>B: POST /api/auth/login
    B->>D: 查询用户信息（users表）
    D-->>B: 返回用户数据

    alt 用户存在且密码正确
        B->>D: 查询角色信息（roles表）
        D-->>B: 返回角色信息和dashboard_path
        B->>D: 更新最后登录时间和IP（users表）
        B-->>F: 返回Token和dashboardPath
        Note over B,F: dashboardPath示例：<br/>/system/dashboard/console<br/>/user/dashboard/console
        F->>F: 存储Token到localStorage
        F->>F: router.push(dashboardPath)

        alt 角色为super_admin
            F->>U: 跳转到 /system/dashboard/console
        else 角色为admin或user
            F->>U: 跳转到 /user/dashboard/console
        end
    else 用户不存在或密码错误
        B-->>F: 返回错误信息
        F->>U: 显示登录失败提示
    end
```

### 注册流程

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant B as 后端
    participant D as 数据库

    U->>F: 输入注册信息
    F->>F: 前端表单验证

    alt 验证通过
        F->>B: 检查用户名是否存在
        B->>D: 查询users表
        D-->>B: 返回查询结果

        alt 用户名不存在
            F->>B: 提交注册请求
            B->>B: 参数验证
            B->>B: 密码加密（bcrypt）
            B->>D: 插入新用户记录
            Note over D: username, password(加密)<br/>role_id=3, status=1
            D-->>B: 返回新用户ID
            B-->>F: 注册成功
            F->>U: 显示成功消息
            F->>F: 延迟1秒后跳转
            F->>U: 跳转到登录页
        else 用户名已存在
            B-->>F: 返回错误：用户名已被使用
            F->>U: 显示错误提示
        end
    else 验证失败
        F->>U: 显示验证错误
    end
```

## 权限控制逻辑

### 角色跳转规则

根据用户的角色类型，登录成功后跳转到不同的控制台界面：

| 角色编码 | 角色名称 | 跳转路径 | 完整URL |
| --- | --- | --- | --- |
| super_admin | 系统后台管理员 | /system/dashboard/console | http://localhost:3006/system/dashboard/console |
| admin | 系统管理员 | /user/dashboard/console | http://localhost:3006/user/dashboard/console |
| user | 系统用户 | /user/dashboard/console | http://localhost:3006/user/dashboard/console |

**跳转逻辑实现**：

1. **后端返回跳转路径**：
   - 登录接口 `POST /api/auth/login` 返回数据中包含 `dashboardPath` 字段
   - 该字段值从 `roles` 表的 `dashboard_path` 字段获取
   - 示例：super_admin 返回 `/system/dashboard/console`

2. **前端执行跳转**：
   - 登录成功后，接收后端返回的 `dashboardPath`
   - 存储 Token 到 localStorage
   - 使用路由跳转：`router.push(dashboardPath)`
   - 自动导航到对应角色的控制台页面

3. **跳转时机**：
   - 用户点击登录按钮
   - 后端验证成功返回 Token 和 dashboardPath
   - 前端立即执行跳转，无需用户手动操作

### 权限验证流程

```mermaid
flowchart TD
    A[用户访问页面] --> B{检查Token}
    B -->|无Token| C[跳转登录页]
    B -->|有Token| D{验证Token有效性}
    D -->|无效| C
    D -->|有效| E{检查Token是否过期}
    E -->|已过期| C
    E -->|未过期| F[获取用户角色]
    F --> G{检查角色权限}
    G -->|有权限| H[允许访问]
    G -->|无权限| I[跳转403页面]
    H --> J[更新最后活动时间]
```

### 路由守卫拦截机制

**前置守卫（beforeEach）**：

在用户访问任何路由之前执行以下验证：

1. **白名单判断**：
   - 登录页、注册页、忘记密码页等公开页面直接放行
   - 白名单路径：['/auth/login', '/auth/register', '/auth/forget-password']

2. **Token验证**：
   - 从本地存储（localStorage/sessionStorage）获取Token
   - 如果无Token，跳转到登录页，并保存redirect参数
   - 示例：`/auth/login?redirect=/system/user-center`

3. **Token有效性检查**：
   - 解析JWT Token，检查是否过期
   - 如果已过期，尝试使用Refresh Token刷新
   - 刷新失败，清除Token并跳转登录页

4. **用户信息获取**：
   - 如果用户信息未加载，调用 `/api/user/info` 接口
   - 获取用户角色和权限信息

5. **权限验证**：
   - 根据用户角色判断是否有权访问该路由
   - 无权限跳转到403页面或首页

**实现示例逻辑**：

```
白名单路径 = ['/auth/login', '/auth/register', '/auth/forget-password']

if (当前路径 in 白名单路径) {
  直接放行
} else {
  Token = 获取本地Token()

  if (!Token) {
    跳转('/auth/login?redirect=' + 当前路径)
    return
  }

  if (Token已过期) {
    尝试刷新Token()
    if (刷新失败) {
      清除Token()
      跳转('/auth/login?redirect=' + 当前路径)
      return
    }
  }

  if (!用户信息) {
    用户信息 = await 调用获取用户信息API()
  }

  if (用户无权限访问该路由) {
    跳转('/403')
    return
  }

  允许访问
}
```

### 无操作超时自动登出机制

**功能说明**：为提高系统安全性，当用户在系统中无任何操作超过设定时间后，自动登出并跳转到登录页。

**配置参数**：

| 参数名   | 推荐值                                        | 说明                     |
| -------- | --------------------------------------------- | ------------------------ |
| 超时时间 | 30分钟                                        | 用户无操作后多久自动登出 |
| 提醒时间 | 28分钟                                        | 提前多久弹出提醒         |
| 监听事件 | mousemove, keydown, click, scroll, touchstart | 视为用户活动的事件       |

**实现逻辑**：

```mermaid
flowchart TD
    A[用户登录成功] --> B[启动超时监听]
    B --> C[记录最后活动时间]
    C --> D{用户有操作?}
    D -->|有| E[更新最后活动时间]
    E --> C
    D -->|无| F{检查超时时间}
    F -->|达到提醒时间| G[弹出提醒对话框]
    G --> H{用户点击继续?}
    H -->|是| E
    H -->|否/超时| I[执行登出操作]
    F -->|达到超时时间| I
    F -->|未超时| C
    I --> J[清除Token和用户信息]
    J --> K[跳转登录页]
    K --> L[显示超时登出提示]
```

**前端实现方案**：

1. **初始化超时监听**：
   - 用户登录成功后启动监听
   - 使用 `setInterval` 每隔一定时间（如1分钟）检查一次

2. **监听用户活动**：
   - 监听鼠标移动、键盘输入、点击、滚动等事件
   - 任何活动发生时，更新 `lastActivityTime`

3. **定时检查**：
   - 计算当前时间与 `lastActivityTime` 的差值
   - 如果超过提醒时间，弹出提醒对话框
   - 如果超过超时时间，执行登出

4. **提醒对话框**：
   - 显示倒计时（如：“2分钟后将自动登出”）
   - 提供“继续使用”按钮，点击后重置计时器

5. **自动登出执行**：
   - 清除本地存储的Token和用户信息
   - 清空 Pinia Store 中的用户状态
   - 跳转到登录页，显示提示消息

**后端配合机制**：

1. **Token过期时间**：
   - JWT Token 设置过期时间为 30分钟（与前端超时时间一致）
   - Refresh Token 过期时间为 7天

2. **Token刷新机制**：
   - 提供 `/api/auth/refresh-token` 接口
   - 前端在Token即将过期时自动刷新

3. **并发登录检测**（可选）：
   - 记录用户最后活动时间到数据库（users.last_login_time）
   - 检测同一账号在不同设备登录，可选择强制登出旧会话

**安全增强建议**：

1. **敏感操作二次验证**：
   - 修改密码、更改邮箱等敏感操作需要重新验证密码

2. **记录登录日志**（可选）：
   - 记录登录时间、IP、设备信息等
   - 定期清理过期日志

3. **多设备管理**（可选）：
   - 允许用户查看当前登录设备列表
   - 支持远程登出指定设备

## 初始化数据建议

### 默认管理员账号

系统初始化时建议创建一个超级管理员账号：

- **用户名**：admin
- **密码**：需加密后存储（建议使用bcrypt）
- **角色**：super_admin（id=1）
- **状态**：启用

## 用户个人中心业务流程

### 查询用户信息流程

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant B as 后端
    participant D as 数据库

    U->>F: 访问个人中心页面
    F->>B: 请求用户详情接口
    B->>D: 查询users表获取用户信息
    D-->>B: 返回用户基本信息
    B->>D: 查询user_tags表获取用户标签
    D-->>B: 返回标签列表
    B-->>F: 返回完整用户信息
    F->>U: 展示用户资料和标签
```

### 更新用户信息流程

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant B as 后端
    participant D as 数据库

    U->>F: 点击编辑按钮
    F->>U: 表单变为可编辑
    U->>F: 修改信息后点击保存
    F->>F: 表单验证

    alt 验证通过
        F->>B: 提交更新请求
        B->>D: 更新users表对应字段
        D-->>B: 返回更新结果
        B-->>F: 返回成功信息
        F->>U: 显示更新成功，表单变为只读
    else 验证失败
        F->>U: 显示错误提示
    end
```

### 修改密码流程

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant B as 后端
    participant D as 数据库

    U->>F: 点击修改密码编辑
    F->>U: 密码输入框变为可编辑
    U->>F: 输入当前密码、新密码、确认密码
    U->>F: 点击保存
    F->>F: 验证新密码和确认密码是否一致

    alt 验证通过
        F->>B: 提交密码修改请求
        B->>D: 查询users表验证当前密码

        alt 当前密码正确
            B->>D: 更新password字段（加密后存储）
            D-->>B: 返回更新结果
            B-->>F: 返回成功
            F->>U: 显示修改成功，表单变为只读
        else 当前密码错误
            B-->>F: 返回错误信息
            F->>U: 显示当前密码错误
        end
    else 验证失败
        F->>U: 显示验证错误
    end
```

## 数据安全建议

### 密码存储

- 使用bcrypt或类似的单向加密算法
- 不存储明文密码
- 密码字段长度设置为255以适应加密后的长度

### 敏感信息保护

- 用户密码必须加密存储
- API响应中不返回密码字段
- 登录失败次数可考虑添加限制（后期扩展）

## 后期扩展预留

虽然当前设计保持简洁，但预留了以下扩展能力：

1. **用户表**：预留了email、mobile字段，便于后续增加多因素认证
2. **角色表**：可通过新增记录扩展更多角色类型
3. **用户标签**：支持灵活添加用户个性化标签
4. **索引设计**：为常用查询字段建立索引，保证查询性能

## 建表SQL语句参考结构

由于设计文档不包含具体代码实现，建表SQL将由开发人员根据以上表结构定义编写，需要注意：

- 设置正确的字符集和排序规则
- 添加适当的索引以优化查询性能
- 为自增字段设置合理的起始值
- 为必填字段添加NOT NULL约束
- 为datetime字段设置默认值和自动更新
- 为外键字段添加合适的约束或说明

## 数据维护建议

### 定期维护任务

- 定期备份用户数据
- 监控用户状态，及时处理异常账号
- 定期检查用户权限配置是否合理

### 数据完整性

- 删除用户前需评估影响，建议使用禁用而非物理删除
- 角色删除前需确保没有用户关联该角色
- 用户标签可随时删除，不影响用户主体数据
