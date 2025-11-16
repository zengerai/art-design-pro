# 字段映射一致性分析报告

> 分析时间：2024-11-16  
> 分析范围：用户管理、角色管理功能的前后端及数据库字段映射关系

## 目录

- [一、用户管理字段映射分析](#一用户管理字段映射分析)
- [二、角色管理字段映射分析](#二角色管理字段映射分析)
- [三、不一致问题汇总](#三不一致问题汇总)
- [四、修复建议](#四修复建议)

---

## 一、用户管理字段映射分析

### 1.1 数据库表结构（users表）

| 字段名          | 类型         | 说明                 | 是否必填 | 默认值            |
| --------------- | ------------ | -------------------- | -------- | ----------------- |
| id              | INT          | 用户ID，主键         | ✅       | AUTO_INCREMENT    |
| username        | VARCHAR(50)  | 用户名，唯一         | ✅       | -                 |
| password        | VARCHAR(255) | 密码（加密）         | ✅       | -                 |
| real_name       | VARCHAR(50)  | 真实姓名             | ❌       | NULL              |
| nickname        | VARCHAR(50)  | 昵称                 | ❌       | NULL              |
| avatar          | VARCHAR(255) | 头像URL              | ❌       | NULL              |
| sex             | TINYINT      | 性别：1-男，2-女     | ❌       | NULL              |
| email           | VARCHAR(100) | 邮箱                 | ❌       | NULL              |
| mobile          | VARCHAR(20)  | 手机号               | ❌       | NULL              |
| address         | VARCHAR(200) | 地址                 | ❌       | NULL              |
| description     | VARCHAR(500) | 个人介绍             | ❌       | NULL              |
| role_id         | INT          | 角色ID               | ✅       | 3                 |
| status          | TINYINT      | 状态：1-启用，0-禁用 | ✅       | 1                 |
| last_login_time | DATETIME     | 最后登录时间         | ❌       | NULL              |
| last_login_ip   | VARCHAR(50)  | 最后登录IP           | ❌       | NULL              |
| created_at      | DATETIME     | 创建时间             | ✅       | CURRENT_TIMESTAMP |
| updated_at      | DATETIME     | 更新时间             | ✅       | CURRENT_TIMESTAMP |

**总计：17个字段**

---

### 1.2 后端API - 创建用户接口

#### 请求参数（req.body）

```typescript
// POST /api/users
{
  username: string,    // 用户名
  phone: string,       // 手机号
  gender: string,      // 性别："男" | "女"
  role: string[]       // 角色编码数组，如 ["R_SUPER"]
}
```

**总计：4个字段**

#### 后端处理逻辑（user.controller.ts - createUser）

```typescript
// 接收的字段
const { username, phone, gender, role } = req.body;

// 处理逻辑
1. username → username (直接映射)
2. phone → mobile (字段名映射)
3. gender → sex (值转换："男"→1, "女"→2)
4. role → role_id (通过查询roles表转换)
   - role[0] (角色编码) → 查询 roles 表 → role_id (角色ID)

// 固定值
- password: bcrypt加密的 "123456"
- status: 固定为 1
- created_at: NOW()
- updated_at: NOW()

// 数据库插入字段
INSERT INTO users (
  username,      // ← username
  password,      // ← bcrypt('123456')
  mobile,        // ← phone
  sex,           // ← gender转换为1/2
  role_id,       // ← role查询转换
  status,        // ← 固定为1
  created_at,    // ← NOW()
  updated_at     // ← NOW()
)
```

**处理字段：8个**  
**未处理字段：9个（real_name, nickname, avatar, email, address, description, last_login_time, last_login_ip, id）**

---

### 1.3 后端API - 更新用户接口

#### 请求参数（req.body）

```typescript
// PUT /api/users/:id
{
  username: string,    // 用户名
  phone: string,       // 手机号
  gender: string,      // 性别："男" | "女"
  role?: string[]      // 角色编码数组（可选）
}
```

**总计：4个字段（role可选）**

#### 后端处理逻辑（user.controller.ts - updateUser）

```typescript
// 接收的字段
const { id } = req.params;
const { username, phone, gender, role } = req.body;

// 更新逻辑
UPDATE users SET
  username=?,       // ← username
  mobile=?,         // ← phone
  sex=?,            // ← gender转换为1/2
  role_id=? (可选), // ← role查询转换（如果提供）
  updated_at=NOW()  // ← 自动更新
WHERE id=?
```

**处理字段：5-6个（取决于是否提供role）**

---

### 1.4 后端API - 查询用户列表接口

#### 请求参数（query）

```typescript
// GET /api/users
{
  current?: number,      // 当前页
  size?: number,         // 每页条数
  userName?: string,     // 用户名搜索
  userGender?: string,   // 性别筛选
  userPhone?: string,    // 手机号搜索
  userEmail?: string,    // 邮箱搜索
  status?: string        // 状态筛选
}
```

#### 后端查询逻辑（user.controller.ts - getUserList）

```typescript
// SQL查询字段映射
SELECT
  u.id,                          // → id
  u.username as userName,        // username → userName
  u.nickname as nickName,        // nickname → nickName
  u.avatar,                      // → avatar
  u.sex as userGender,           // sex → userGender (需要转换：1→"1", 2→"2")
  u.mobile as userPhone,         // mobile → userPhone
  u.email as userEmail,          // email → userEmail
  u.status,                      // → status (1/0)
  u.created_at as createTime,    // created_at → createTime
  u.updated_at as updateTime,    // updated_at → updateTime
  r.role_code as userRoles       // role_code → userRoles (转为数组)
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
```

**返回字段：11个**

#### 响应数据结构（UserListItem）

```typescript
{
  id: number,           // ← u.id
  avatar: string,       // ← u.avatar
  status: string,       // ← u.status (需要转换：1→"1", 0→"0")
  userName: string,     // ← u.username
  userGender: string,   // ← u.sex (需要转换：1→"1", 2→"2")
  nickName: string,     // ← u.nickname
  userPhone: string,    // ← u.mobile
  userEmail: string,    // ← u.email
  userRoles: string[],  // ← [r.role_code] (转为数组)
  createBy: string,     // ← 后端未提供！❌
  createTime: string,   // ← u.created_at
  updateBy: string,     // ← 后端未提供！❌
  updateTime: string    // ← u.updated_at
}
```

**前端定义字段：13个**  
**后端提供字段：11个**  
**❌ 缺失字段：createBy, updateBy**

---

### 1.5 前端组件 - 用户表单（user-dialog.vue）

#### 表单数据结构

```typescript
const formData = {
  username: '',           // 用户名
  phone: '',              // 手机号
  gender: '男' | '女',    // 性别
  role: string[]          // 角色编码数组
}
```

**总计：4个字段**

#### 提交时字段映射

**创建用户**：

```typescript
fetchCreateUser({
  username: formData.username, // username → username
  phone: formData.phone, // phone → phone
  gender: formData.gender, // gender → gender
  role: formData.role // role → role
})
```

**更新用户**：

```typescript
fetchUpdateUser(userId, {
  username: formData.username, // username → username
  phone: formData.phone, // phone → phone
  gender: formData.gender, // gender → gender
  role: formData.role // role → role
})
```

#### 数据回填逻辑（编辑模式）

```typescript
// UserListItem → formData 映射
{
  username: row.userName,      // userName → username
  phone: row.userPhone,        // userPhone → phone
  gender: row.userGender === '1' || row.userGender === 1 ? '男' : '女',
         // userGender (1/2) → gender ("男"/"女")
  role: Array.isArray(row.userRoles) ? row.userRoles : []
         // userRoles (string[]) → role (string[])
}
```

---

### 1.6 用户管理完整数据流映射表

| 数据库字段 | 后端查询映射 | 前端显示字段 | 前端表单字段 | API参数字段 | 后端接收字段 | 数据库写入字段 | 值转换规则 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| id | id | id | - | - | - | id (AUTO) | - |
| username | userName | userName | username | username | username | username | 无 |
| password | - | - | - | - | - | password | bcrypt('123456') |
| real_name | - | - | - | - | - | real_name | ❌未使用 |
| nickname | nickName | nickName | - | - | - | nickname | ❌未使用 |
| avatar | avatar | avatar | - | - | - | avatar | ❌未使用 |
| sex | userGender | userGender | gender | gender | gender | sex | "男"→1, "女"→2 |
| email | userEmail | userEmail | - | - | - | email | ❌未使用 |
| mobile | userPhone | userPhone | phone | phone | phone | mobile | 无 |
| address | - | - | - | - | - | address | ❌未使用 |
| description | - | - | - | - | - | description | ❌未使用 |
| role_id | - | - | role | role | role | role_id | 通过roles表查询转换 |
| - | userRoles | userRoles | - | - | - | - | ← role_code (JOIN) |
| status | status | status | - | - | - | status | 固定为1 |
| last_login_time | - | - | - | - | - | last_login_time | ❌未使用 |
| last_login_ip | - | - | - | - | - | last_login_ip | ❌未使用 |
| created_at | createTime | createTime | - | - | - | created_at | NOW() |
| updated_at | updateTime | updateTime | - | - | - | updated_at | NOW() |
| - | createBy | createBy | - | - | - | - | ❌后端未提供 |
| - | updateBy | updateBy | - | - | - | - | ❌后端未提供 |

---

## 二、角色管理字段映射分析

### 2.1 数据库表结构（roles表）

| 字段名         | 类型         | 说明                 | 是否必填 | 默认值            |
| -------------- | ------------ | -------------------- | -------- | ----------------- |
| id             | INT          | 角色ID，主键         | ✅       | AUTO_INCREMENT    |
| role_name      | VARCHAR(50)  | 角色名称             | ✅       | -                 |
| role_code      | VARCHAR(50)  | 角色编码，唯一       | ✅       | -                 |
| dashboard_path | VARCHAR(200) | 登录后跳转路径       | ✅       | -                 |
| description    | VARCHAR(200) | 角色描述             | ❌       | NULL              |
| status         | TINYINT      | 状态：1-启用，0-禁用 | ✅       | 1                 |
| created_at     | DATETIME     | 创建时间             | ✅       | CURRENT_TIMESTAMP |
| updated_at     | DATETIME     | 更新时间             | ✅       | CURRENT_TIMESTAMP |

**总计：8个字段**

---

### 2.2 后端API - 创建角色接口

#### 请求参数（req.body）

```typescript
// POST /api/roles
{
  roleName: string,     // 角色名称
  roleCode: string,     // 角色编码
  description: string,  // 角色描述
  enabled: boolean      // 启用状态
}
```

**总计：4个字段**

#### 后端处理逻辑（role.controller.ts - createRole）

```typescript
// 接收的字段
const { roleName, roleCode, description, enabled } = req.body;

// 数据库插入字段
INSERT INTO roles (
  role_name,        // ← roleName
  role_code,        // ← roleCode
  dashboard_path,   // ← 固定为 '/user/dashboard/console'
  description,      // ← description
  status,           // ← enabled转换为1/0
  created_at        // ← NOW()
)
```

**处理字段：6个**  
**固定值字段：dashboard_path (硬编码为 '/user/dashboard/console')**

---

### 2.3 后端API - 更新角色接口

#### 请求参数（req.body）

```typescript
// PUT /api/roles/:id
{
  roleName: string,     // 角色名称
  roleCode: string,     // 角色编码
  description: string,  // 角色描述
  enabled: boolean      // 启用状态
}
```

**总计：4个字段**

#### 后端处理逻辑（role.controller.ts - updateRole）

```typescript
// 接收的字段
const { id } = req.params;
const { roleName, roleCode, description, enabled } = req.body;

// 更新逻辑
UPDATE roles SET
  role_name=?,      // ← roleName
  role_code=?,      // ← roleCode
  description=?,    // ← description
  status=?,         // ← enabled转换为1/0
  updated_at=NOW()  // ← 自动更新
WHERE id=?
```

**处理字段：5个**  
**❌ 未更新：dashboard_path**

---

### 2.4 后端API - 查询角色列表接口

#### 请求参数（query）

```typescript
// GET /api/roles
{
  current?: number,       // 当前页
  size?: number,          // 每页条数
  roleName?: string,      // 角色名称搜索
  roleCode?: string,      // 角色编码搜索
  description?: string,   // 描述搜索
  enabled?: string        // 状态筛选
}
```

#### 后端查询逻辑（role.controller.ts - getRoleList）

```typescript
// SQL查询字段映射
SELECT
  id as roleId,             // id → roleId
  role_name as roleName,    // role_name → roleName
  role_code as roleCode,    // role_code → roleCode
  description,              // → description
  status as enabled,        // status → enabled (需要转换：1→true, 0→false)
  created_at as createTime  // created_at → createTime
FROM roles
```

**返回字段：6个**

#### 响应数据处理

```typescript
records.map((r) => ({
  ...r,
  enabled: r.enabled === 1 // status (1/0) → enabled (true/false)
}))
```

#### 响应数据结构（RoleListItem）

```typescript
{
  roleId: number,        // ← id
  roleName: string,      // ← role_name
  roleCode: string,      // ← role_code
  description: string,   // ← description
  enabled: boolean,      // ← status (1→true, 0→false)
  createTime: string     // ← created_at
}
```

**前端定义字段：6个**  
**后端提供字段：6个**  
**✅ 完全一致**

---

### 2.5 前端组件 - 角色表单（role-edit-dialog.vue）

#### 表单数据结构

```typescript
const form: RoleListItem = {
  roleId: 0, // 角色ID
  roleName: '', // 角色名称
  roleCode: '', // 角色编码
  description: '', // 角色描述
  createTime: '', // 创建时间（仅用于显示）
  enabled: true // 启用状态
}
```

**总计：6个字段**

#### 提交时字段映射

**创建角色**：

```typescript
fetchCreateRole({
  roleName: form.roleName, // roleName → roleName
  roleCode: form.roleCode, // roleCode → roleCode
  description: form.description, // description → description
  enabled: form.enabled // enabled → enabled
})
```

**更新角色**：

```typescript
fetchUpdateRole(roleId, {
  roleName: form.roleName, // roleName → roleName
  roleCode: form.roleCode, // roleCode → roleCode
  description: form.description, // description → description
  enabled: form.enabled // enabled → enabled
})
```

**提交字段：4个（不包括 roleId 和 createTime）**

#### 数据回填逻辑（编辑模式）

```typescript
// RoleListItem → form 映射（完全一致）
form.roleId = row.roleId
form.roleName = row.roleName
form.roleCode = row.roleCode
form.description = row.description
form.enabled = row.enabled
form.createTime = row.createTime
```

---

### 2.6 角色管理完整数据流映射表

| 数据库字段 | 后端查询映射 | 前端显示字段 | 前端表单字段 | API参数字段 | 后端接收字段 | 数据库写入字段 | 值转换规则 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| id | roleId | roleId | roleId | - | - | id (AUTO) | - |
| role_name | roleName | roleName | roleName | roleName | roleName | role_name | 无 |
| role_code | roleCode | roleCode | roleCode | roleCode | roleCode | role_code | 无 |
| dashboard_path | - | - | - | - | - | dashboard_path | 固定'/user/dashboard/console' |
| description | description | description | description | description | description | description | 无 |
| status | enabled | enabled | enabled | enabled | enabled | status | true→1, false→0 |
| created_at | createTime | createTime | createTime | - | - | created_at | NOW() |
| updated_at | - | - | - | - | - | updated_at | NOW() |

---

## 三、不一致问题汇总

### 3.1 用户管理存在的问题

#### 🔴 严重问题

1. **前端定义但后端未提供的字段**
   - `createBy`：创建人字段
   - `updateBy`：更新人字段
   - **影响**：前端定义了这两个字段，但后端从未返回，可能导致前端显示 `undefined`

2. **数据库字段未被使用**
   - `real_name`：真实姓名
   - `nickname`：昵称（查询时有返回，但创建/更新时无法设置）
   - `avatar`：头像（查询时有返回，但创建/更新时无法设置）
   - `email`：邮箱（查询时有返回，但创建/更新时无法设置）
   - `address`：地址
   - `description`：个人介绍
   - `last_login_time`：最后登录时间
   - `last_login_ip`：最后登录IP
   - **影响**：这些字段在数据库中存在，但前端无法编辑，造成数据不完整

#### 🟡 中等问题

3. **字段名称不一致**
   - 前端：`phone` ↔ 后端API：`phone` ↔ 数据库：`mobile`
   - 前端：`gender` ↔ 后端API：`gender` ↔ 数据库：`sex`
   - **影响**：增加了代码理解难度，需要记忆映射关系

4. **值转换复杂度**
   - 性别：前端 `"男"/"女"` → 后端转换 → 数据库 `1/2` → 后端查询 → 前端显示 `"1"/"2"` (字符串)
   - 角色：前端 `["R_SUPER"]` → 后端查询 `role_id` → 数据库 `1` → 后端查询 `role_code` → 前端 `["R_SUPER"]`
   - **影响**：转换逻辑分散在多处，容易出错

#### 🟢 轻微问题

5. **类型不一致**
   - 前端 `userGender` 定义为 `string`，但后端查询返回的可能是 `number` (1/2)
   - 前端 `status` 定义为 `string`，但后端查询返回的是 `number` (1/0)
   - **影响**：需要在回填数据时进行类型兼容处理

---

### 3.2 角色管理存在的问题

#### 🟡 中等问题

1. **数据库字段硬编码**
   - `dashboard_path` 字段在创建时固定为 `'/user/dashboard/console'`
   - **影响**：无法为不同角色设置不同的控制台路径，灵活性受限

2. **缺失字段**
   - `updated_at` 字段在查询时未返回给前端
   - **影响**：前端无法显示角色的更新时间

#### 🟢 轻微问题

3. **字段名称不一致**
   - 数据库：`status` ↔ 前后端：`enabled`
   - **影响**：增加了代码理解难度

---

### 3.3 字段数量对比总结

#### 用户管理

| 层级 | 字段数量 | 说明 |
| --- | --- | --- |
| 数据库表（users） | 17个 | 完整的用户信息 |
| 后端创建接口接收 | 4个 | username, phone, gender, role |
| 后端创建接口写入 | 8个 | + password, mobile, sex, role_id, status, created_at, updated_at |
| 后端查询接口返回 | 11个 | id, userName, nickName, avatar, userGender, userPhone, userEmail, status, createTime, updateTime, userRoles |
| 前端类型定义（UserListItem） | 13个 | + createBy, updateBy |
| 前端表单字段 | 4个 | username, phone, gender, role |

**❌ 缺口**：

- 前端定义了 `createBy` 和 `updateBy`，但后端未提供
- 数据库有 9 个字段未被前端使用（real_name, address, description, last_login_time, last_login_ip 等）

#### 角色管理

| 层级 | 字段数量 | 说明 |
| --- | --- | --- |
| 数据库表（roles） | 8个 | 完整的角色信息 |
| 后端创建接口接收 | 4个 | roleName, roleCode, description, enabled |
| 后端创建接口写入 | 6个 | + dashboard_path (固定值), created_at |
| 后端查询接口返回 | 6个 | roleId, roleName, roleCode, description, enabled, createTime |
| 前端类型定义（RoleListItem） | 6个 | 完全一致 |
| 前端表单字段 | 6个 | 完全一致（但提交时只用4个） |

**⚠️ 缺口**：

- `dashboard_path` 被硬编码，无法通过前端设置
- `updated_at` 未返回给前端

---

## 四、修复建议

### 4.1 用户管理修复建议

#### 优先级 P0（必须修复）

1. **移除前端无用字段定义**

   ```typescript
   // src/types/api/api.d.ts
   interface UserListItem {
     // ❌ 删除这两个字段，因为后端不提供
     // createBy: string
     // updateBy: string
   }
   ```

2. **完善用户创建/更新接口**
   - 如果需要支持编辑昵称、邮箱等字段，需要：
     - 修改前端表单添加这些字段
     - 修改 API 参数类型定义
     - 修改后端控制器接收和处理这些字段

   ```typescript
   // 扩展后的参数
   interface CreateUserParams {
     username: string
     phone: string
     gender: '男' | '女'
     role: string[]
     // 新增字段
     nickname?: string // 昵称
     email?: string // 邮箱
     realName?: string // 真实姓名
     avatar?: string // 头像
   }
   ```

#### 优先级 P1（建议修复）

3. **统一字段命名**
   - 数据库：`mobile` → 改为 `phone` (需要数据库迁移)
   - 数据库：`sex` → 改为 `gender` (需要数据库迁移)
   - 或者在代码层统一使用 `mobile` 和 `sex`

4. **统一值类型**
   - 性别：统一使用数字类型 `1/2`，前端显示时再转换为文本
   - 状态：统一使用布尔类型或数字类型

5. **添加审计字段支持**
   - 数据库添加 `create_by` 和 `update_by` 字段
   - 后端从 JWT Token 中获取当前用户ID
   - 创建/更新时自动填充这些字段

#### 优先级 P2（可选优化）

6. **完善未使用字段**
   - 如果不需要 `real_name`, `address`, `description` 等字段，从数据库删除
   - 如果需要，在前端添加编辑功能

7. **登录信息记录**
   - 在登录接口更新 `last_login_time` 和 `last_login_ip`
   - 在用户列表显示最后登录信息

---

### 4.2 角色管理修复建议

#### 优先级 P0（必须修复）

1. **移除硬编码的 dashboard_path**

   ```typescript
   // backend/src/controllers/role.controller.ts

   // ❌ 删除硬编码
   // dashboard_path: '/user/dashboard/console'

   // ✅ 从前端接收
   const { roleName, roleCode, description, enabled, dashboardPath } = req.body;

   INSERT INTO roles (role_name, role_code, dashboard_path, description, status, created_at)
   VALUES (?, ?, ?, ?, ?, NOW())
   ```

   ```typescript
   // 前端类型定义
   interface CreateRoleParams {
     roleName: string
     roleCode: string
     description: string
     enabled: boolean
     dashboardPath: string // 新增
   }
   ```

#### 优先级 P1（建议修复）

2. **返回更新时间字段**

   ```typescript
   // backend/src/controllers/role.controller.ts
   SELECT
     id as roleId,
     role_name as roleName,
     role_code as roleCode,
     description,
     status as enabled,
     created_at as createTime,
     updated_at as updateTime  // 新增
   FROM roles
   ```

   ```typescript
   // 前端类型定义
   interface RoleListItem {
     roleId: number
     roleName: string
     roleCode: string
     description: string
     enabled: boolean
     createTime: string
     updateTime: string // 新增
   }
   ```

#### 优先级 P2（可选优化）

3. **统一字段命名**
   - 数据库：`status` → 改为 `enabled` (需要数据库迁移)
   - 或者代码层统一使用 `status`

---

### 4.3 通用优化建议

1. **建立字段映射文档**
   - 为每个模块创建字段映射表
   - 在代码注释中说明转换规则

2. **使用 DTO（数据传输对象）模式**

   ```typescript
   // 后端添加 DTO 转换层
   class UserDTO {
     static fromDatabase(dbRecord: any): UserListItem {
       return {
         id: dbRecord.id,
         userName: dbRecord.username,
         userPhone: dbRecord.mobile,
         userGender: dbRecord.sex === 1 ? '1' : '2'
         // ... 统一的转换逻辑
       }
     }

     static toDatabase(userData: CreateUserParams): any {
       return {
         username: userData.username,
         mobile: userData.phone,
         sex: userData.gender === '男' ? 1 : 2
         // ... 统一的转换逻辑
       }
     }
   }
   ```

3. **类型安全增强**
   - 使用 TypeScript 的严格模式
   - 为所有值转换添加类型守卫

4. **数据验证**
   - 前端：使用 Element Plus 的表单验证
   - 后端：使用 class-validator 或 joi 进行参数验证

---

## 五、总结

### 5.1 当前状态评估

| 功能模块 | 字段一致性 | 值转换正确性 | 数据完整性 | 综合评分 |
| -------- | ---------- | ------------ | ---------- | -------- |
| 用户管理 | ⚠️ 中等    | ✅ 良好      | ❌ 较差    | 60/100   |
| 角色管理 | ✅ 良好    | ✅ 良好      | ⚠️ 中等    | 80/100   |

### 5.2 主要问题

1. **用户管理**：
   - 前端定义了后端未提供的字段（createBy, updateBy）
   - 大量数据库字段未被使用（9个字段）
   - 字段命名不统一（phone/mobile, gender/sex）

2. **角色管理**：
   - dashboard_path 被硬编码，缺乏灵活性
   - updated_at 未返回给前端

### 5.3 建议行动计划

**第一阶段（立即执行）**：

1. 移除前端 UserListItem 中的 createBy 和 updateBy 字段
2. 移除角色创建时的 dashboard_path 硬编码，改为从前端传入

**第二阶段（短期优化）**：

1. 完善用户创建/更新接口，支持昵称、邮箱等字段编辑
2. 角色查询接口返回 updateTime 字段
3. 建立完整的字段映射文档

**第三阶段（长期优化）**：

1. 统一字段命名规范
2. 引入 DTO 模式统一数据转换
3. 清理未使用的数据库字段或补充前端功能

---

**报告结束**
