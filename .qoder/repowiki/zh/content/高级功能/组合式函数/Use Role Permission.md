# 使用角色权限

<cite>
**本文档引用的文件**
- [role.controller.ts](file://backend/src/controllers/role.controller.ts)
- [auth.middleware.ts](file://backend/src/middleware/auth.middleware.ts)
- [useRolePermission.ts](file://src/hooks/core/useRolePermission.ts)
- [roles.ts](file://src/directives/core/roles.ts)
- [auth.ts](file://src/directives/core/auth.ts)
- [user.ts](file://src/store/modules/user.ts)
- [beforeEach.ts](file://src/router/guards/beforeEach.ts)
- [RoutePermissionValidator.ts](file://src/router/core/RoutePermissionValidator.ts)
- [index.ts](file://src/types/common/index.ts)
- [button-auth/index.vue](file://src/views/examples/permission/button-auth/index.vue)
- [page-visibility/index.vue](file://src/views/system/role/index.vue)
</cite>

## 目录

1. [简介](#简介)
2. [项目结构](#项目结构)
3. [核心权限机制](#核心权限机制)
4. [后端权限控制](#后端权限控制)
5. [前端权限控制](#前端权限控制)
6. [权限验证流程](#权限验证流程)
7. [角色管理功能](#角色管理功能)
8. [最佳实践](#最佳实践)

## 简介

本项目实现了一套完整的角色权限控制系统，采用前后端分离的架构设计。系统定义了三级角色权限模型，通过JWT认证和细粒度的权限控制，确保不同用户只能访问其被授权的功能和数据。权限控制覆盖了路由级别、页面级别和按钮级别，提供了灵活且安全的访问控制机制。

## 项目结构

项目采用典型的前后端分离架构，后端使用Node.js + Express + MySQL，前端使用Vue 3 + TypeScript + Pinia。权限相关的核心文件分布在前后端的不同目录中。

```mermaid
graph TB
subgraph "后端"
A[controllers]
B[middleware]
C[routes]
D[config]
end
subgraph "前端"
E[views]
F[components]
G[directives]
H[store]
I[router]
J[api]
end
A --> B
B --> C
C --> D
E --> F
F --> G
H --> I
J --> E
```

**图源**

- [role.controller.ts](file://backend/src/controllers/role.controller.ts)
- [auth.middleware.ts](file://backend/src/middleware/auth.middleware.ts)
- [useRolePermission.ts](file://src/hooks/core/useRolePermission.ts)

## 核心权限机制

系统实现了基于角色的访问控制（RBAC）模型，定义了三种角色：超级管理员（R_SUPER）、系统管理员（R_ADMIN）和普通用户（R_USER）。权限控制分为前端和后端两个层面，确保安全性。

```mermaid
classDiagram
class UserRole {
+R_SUPER : string
+R_ADMIN : string
+R_USER : string
}
class AuthRequest {
+user : User
}
class User {
+userId : number
+username : string
+roleCode : string
}
class RoleConfig {
+roleCode : UserRole
+roleName : string
+homePath : string
+priority : number
}
UserRole --> RoleConfig : "定义"
AuthRequest --> User : "包含"
```

**图源**

- [index.ts](file://src/types/common/index.ts)
- [auth.middleware.ts](file://backend/src/middleware/auth.middleware.ts)

## 后端权限控制

后端通过Express中间件实现JWT认证和角色权限验证。所有需要权限的接口都必须通过认证中间件和授权中间件的检查。

### 认证与授权中间件

后端使用`auth.middleware.ts`文件中的`authenticate`和`authorize`中间件来处理认证和授权。`authenticate`中间件负责验证JWT令牌，`authorize`中间件负责检查用户角色是否具有访问特定接口的权限。

```mermaid
sequenceDiagram
participant Client as "客户端"
participant AuthMiddleware as "认证中间件"
participant AuthController as "认证控制器"
participant RoleController as "角色控制器"
Client->>AuthMiddleware : 发送请求 (Bearer Token)
AuthMiddleware->>AuthMiddleware : 验证JWT令牌
AuthMiddleware-->>AuthController : 令牌有效，继续处理
AuthController->>RoleController : 调用角色管理接口
RoleController->>RoleController : 检查角色权限 (R_SUPER)
RoleController-->>AuthController : 权限验证通过
AuthController-->>Client : 返回响应
```

**图源**

- [auth.middleware.ts](file://backend/src/middleware/auth.middleware.ts)
- [role.controller.ts](file://backend/src/controllers/role.controller.ts)

### 角色管理接口

角色管理模块提供了四个核心接口，全部需要超级管理员权限才能访问。这些接口用于角色的增删改查操作。

```mermaid
flowchart TD
Start([获取角色列表]) --> ValidateAuth["验证认证令牌"]
ValidateAuth --> CheckRole["检查角色权限 (R_SUPER)"]
CheckRole --> QueryDB["查询数据库"]
QueryDB --> FormatData["格式化响应数据"]
FormatData --> ReturnResult["返回角色列表"]
CreateRole([创建角色]) --> ValidateAuth2["验证认证令牌"]
ValidateAuth2 --> CheckRole2["检查角色权限 (R_SUPER)"]
CheckRole2 --> InsertDB["插入数据库"]
InsertDB --> ReturnSuccess["返回创建成功"]
UpdateRole([更新角色]) --> ValidateAuth3["验证认证令牌"]
ValidateAuth3 --> CheckRole3["检查角色权限 (R_SUPER)"]
CheckRole3 --> UpdateDB["更新数据库"]
UpdateDB --> ReturnSuccess2["返回更新成功"]
DeleteRole([删除角色]) --> ValidateAuth4["验证认证令牌"]
DeleteRole4 --> CheckRole4["检查角色权限 (R_SUPER)"]
CheckRole4 --> DeleteDB["删除数据库记录"]
DeleteDB --> ReturnSuccess3["返回删除成功"]
```

**图源**

- [role.controller.ts](file://backend/src/controllers/role.controller.ts)
- [role.routes.ts](file://backend/src/routes/role.routes.ts)

## 前端权限控制

前端实现了多层次的权限控制机制，包括路由级别、页面级别和按钮级别的权限控制。通过组合式函数、自定义指令和状态管理，提供了灵活的权限验证能力。

### 组合式函数权限验证

`useRolePermission.ts`提供了基于角色的权限验证组合式函数，支持单个角色、任意角色和所有角色的验证。

```mermaid
classDiagram
class UseRolePermission {
+currentRoles : ComputedRef<UserRole[]>
+hasRole(role : UserRole | UserRole[]) : boolean
+hasAnyRole(roles : UserRole[]) : boolean
+hasAllRoles(roles : UserRole[]) : boolean
+canAccessRoute(routeRoles? : UserRole[]) : boolean
}
class UserRole {
+R_SUPER : string
+R_ADMIN : string
+R_USER : string
}
UseRolePermission --> UserRole : "使用"
```

**图源**

- [useRolePermission.ts](file://src/hooks/core/useRolePermission.ts)
- [index.ts](file://src/types/common/index.ts)

### 自定义指令权限控制

前端实现了两个自定义指令：`v-roles`和`v-auth`，分别用于基于角色和基于权限码的DOM元素控制。

```mermaid
classDiagram
class RolesDirective {
+mounted : Function
+updated : Function
}
class AuthDirective {
+mounted : Function
+updated : Function
}
class UserStore {
+getUserInfo : ComputedRef<UserInfo>
}
class Router {
+currentRoute : Ref<RouteLocationNormalized>
}
RolesDirective --> UserStore : "获取用户角色"
AuthDirective --> Router : "获取路由权限"
```

**图源**

- [roles.ts](file://src/directives/core/roles.ts)
- [auth.ts](file://src/directives/core/auth.ts)
- [user.ts](file://src/store/modules/user.ts)

## 权限验证流程

系统的权限验证流程涵盖了从用户登录到页面访问的完整过程，确保每个环节都有相应的权限检查。

```mermaid
sequenceDiagram
participant User as "用户"
participant Frontend as "前端"
participant Backend as "后端"
User->>Frontend : 登录
Frontend->>Backend : 发送登录请求
Backend->>Backend : 验证用户名密码
Backend-->>Frontend : 返回JWT令牌
Frontend->>Frontend : 存储令牌，获取用户信息
Frontend->>Frontend : 获取菜单列表
Frontend->>Frontend : 动态注册路由
User->>Frontend : 访问页面
Frontend->>Frontend : 路由守卫检查权限
alt 有权限
Frontend-->>User : 显示页面内容
else 无权限
Frontend-->>User : 跳转到403页面
end
```

**图源**

- [beforeEach.ts](file://src/router/guards/beforeEach.ts)
- [RoutePermissionValidator.ts](file://src/router/core/RoutePermissionValidator.ts)

## 角色管理功能

角色管理功能提供了完整的角色CRUD操作界面，包括角色列表、搜索、新增、编辑和删除功能。

### 角色管理界面

角色管理页面使用了`ArtTable`组件展示角色列表，支持分页、排序和搜索功能。通过`RoleEditDialog`和`RolePermissionDialog`组件实现角色的编辑和权限配置。

```mermaid
flowchart TD
A[角色管理页面] --> B[搜索栏]
A --> C[操作按钮]
A --> D[角色列表表格]
D --> E[角色ID]
D --> F[角色名称]
D --> G[角色编码]
D --> H[角色描述]
D --> I[角色状态]
D --> J[创建日期]
D --> K[操作列]
K --> L[菜单权限]
K --> M[编辑角色]
K --> N[删除角色]
```

**图源**

- [index.vue](file://src/views/system/role/index.vue)
- [role-search.vue](file://src/views/system/role/modules/role-search.vue)

## 最佳实践

系统实现了一系列权限控制的最佳实践，确保了系统的安全性和可维护性。

1. **多层权限验证**：在前端路由、后端接口、UI组件等多个层面实施权限控制
2. **基于角色的访问控制**：采用RBAC模型，通过角色分配权限，简化权限管理复杂度
3. **细粒度权限控制**：支持页面级、按钮级、数据级等多种粒度的权限控制
4. **安全性优先原则**：始终遵循最小权限原则，确保用户只能访问必要的功能和数据

```mermaid
graph TD
A[权限控制最佳实践] --> B[多层权限验证]
A --> C[基于角色的访问控制]
A --> D[细粒度权限控制]
A --> E[安全性优先原则]
B --> F[前端路由验证]
B --> G[后端接口验证]
B --> H[UI组件验证]
C --> I[角色定义]
C --> J[权限分配]
D --> K[页面级控制]
D --> L[按钮级控制]
D --> M[数据级控制]
E --> N[最小权限原则]
E --> O[权限审计]
```

**图源**

- [page-visibility/index.vue](file://src/views/examples/permission/page-visibility/index.vue)
