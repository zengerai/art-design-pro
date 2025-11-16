# 虚拟币数据分析系统 - 项目重构设计

## 一、项目概述

### 1.1 背景说明

基于现有 Art Design Pro 模板系统，重构为全新的虚拟币数据分析系统。现有系统内容仅作为模板和资源库参考使用，需重新构建完整的业务体系。

### 1.2 技术栈说明

项目采用现代化前端技术栈：

- **核心框架**：Vue 3.5.21（使用 Composition API 和 script setup 语法）
- **状态管理**：Pinia 3.0.3 + pinia-plugin-persistedstate 4.3.0
- **路由管理**：Vue Router 4.5.1
- **UI 组件库**：Element Plus 2.11.2
- **样式方案**：Tailwind CSS 4.1.14
- **构建工具**：Vite 7.1.5
- **类型支持**：TypeScript 5.6.3
- **工具库**：@vueuse/core 13.9.0
- **HTTP 请求**：Axios 1.12.2
- **国际化**：Vue I18n 9.14.0

### 1.3 核心目标

- 复用现有登录界面和基础框架
- 重构用户体系和权限模型
- 建立面向虚拟币数据分析的工作台
- 清理模板示例内容，保留基础架构
- 使用 Vue 3 Composition API 和最新依赖包 API

## 二、用户体系设计

### 2.1 角色定义

系统定义三类用户角色：

| 角色名称 | 角色标识 | 角色说明 | 权限范围 |
| --- | --- | --- | --- |
| 系统后台管理员（超级管理员） | R_SUPER | 系统最高权限角色 | 拥有系统全部功能访问权限，包括系统管理、数据分析、用户管理等 |
| 系统管理员 | R_ADMIN | 系统运营管理角色 | 拥有数据分析、用户数据查看等业务功能权限，无系统配置权限 |
| 系统用户（普通用户） | R_USER | 普通业务用户角色 | 拥有基础数据查看和个人数据分析功能 |

### 2.2 登录与路由跳转策略

#### 2.2.1 登录界面

- 直接复用现有登录界面：`/src/views/auth/login/index.vue`
- 保留拖拽验证、记住密码、账号切换等交互功能
- 更新账号列表，仅保留三类角色：super（超级管理员）、admin（管理员）、user（普通用户）

#### 2.2.2 登录后跳转规则

不同角色登录后跳转到不同的工作台界面：

| 角色    | 登录后跳转路径              | 说明                 |
| ------- | --------------------------- | -------------------- |
| R_SUPER | `/system/dashboard/console` | 系统后台管理员工作台 |
| R_ADMIN | `/user/dashboard/console`   | 系统管理员工作台     |
| R_USER  | `/user/dashboard/console`   | 普通用户工作台       |

跳转逻辑实现位置：`/src/router/guards/beforeEach.ts` 路由守卫模块

## 三、工作台页面设计

### 3.1 页面结构规划

创建两个独立的工作台页面：

#### 3.1.1 系统后台管理员工作台

- **路由路径**：`/system/dashboard/console`
- **路由名称**：`SystemConsole`
- **组件路径**：`/src/views/system/dashboard/console/index.vue`
- **设计思路**：以 `/src/views/dashboard/console/index.vue` 为模板进行复制，保留页面整体布局框架，删除所有业务组件和左侧菜单内容

#### 3.1.2 系统管理员/普通用户工作台

- **路由路径**：`/user/dashboard/console`
- **路由名称**：`UserConsole`
- **组件路径**：`/src/views/user/dashboard/console/index.vue`
- **设计思路**：同样以 `/src/views/dashboard/console/index.vue` 为模板进行复制，保留页面整体布局框架，删除所有业务组件和左侧菜单内容

### 3.2 页面框架保留内容

两个工作台页面均需保留以下框架元素：

- 页面顶部导航栏（Header）
- 页面主体容器结构
- 面包屑导航区域
- 主题切换、语言切换等系统设置功能
- 用户信息展示和退出登录功能

### 3.3 页面框架删除内容

删除模板页面中的以下内容：

- 左侧菜单栏及所有菜单项
- 所有业务数据展示组件（如 CardList、ActiveUser、SalesOverview、NewUser、Dynamic、TodoList、AboutProject 等）
- 示例图表和数据面板
- 模板说明和演示内容

### 3.4 页面组件结构设计

#### 3.4.1 组件定义规范

所有新建页面组件均采用 Vue 3 Composition API 的 `<script setup>` 语法糖：

**基本结构模式**：

```
<template>
  <!-- 页面内容区域 -->
  <div class="页面容器样式类">
    <!-- 页面主体内容 -->
  </div>
</template>

<script setup lang="ts">
  // 引入依赖
  import { ref, computed, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useUserStore } from '@/store/modules/user'

  // 定义组件名称
  defineOptions({ name: '组件名称' })

  // 响应式数据定义
  // 计算属性定义
  // 方法定义
  // 生命周期钩子
</script>

<style scoped lang="scss">
  // 组件样式
</style>
```

#### 3.4.2 响应式数据管理

使用 Vue 3 响应式 API：

- **ref**：用于基本类型和对象的响应式包装
- **reactive**：用于复杂对象的响应式包装
- **computed**：用于计算属性
- **watch/watchEffect**：用于监听数据变化

#### 3.4.3 组合式函数（Composables）

利用项目现有的组合式函数：

- **useCommon**：通用工具函数（获取首页路径等）
- **useAuth**：权限验证函数
- **useTable**：表格数据处理函数
- **useChart**：图表配置函数
- **useTheme**：主题切换函数

从 `@vueuse/core` 引入实用工具：

- **useStorage**：本地存储管理
- **useToggle**：布尔值切换
- **useDebounceFn**：防抖函数
- **useThrottleFn**：节流函数
- **useBreakpoints**：响应式断点

## 四、路由系统设计

### 4.1 静态路由配置

在 `/src/router/routes/staticRoutes.ts` 中保留：

- 登录路由 `/auth/login`
- 异常页面路由（404、403、500 等）
- 其他认证相关路由（注册、忘记密码等，如需保留）

### 4.2 动态路由配置

#### 4.2.1 系统后台管理员路由模块

创建新的路由模块文件：`/src/router/modules/system-dashboard.ts`

路由配置结构：

```
路由模块：系统后台管理
  - 路由路径：/system/dashboard
  - 父级组件：/index/index
  - 菜单标题：系统管理工作台
  - 权限角色：R_SUPER
  - 子路由：
    - console（工作台首页）
      - 路由路径：console
      - 组件路径：/system/dashboard/console
      - 菜单标题：控制台
      - 固定标签页：是
```

#### 4.2.2 用户工作台路由模块

创建新的路由模块文件：`/src/router/modules/user-dashboard.ts`

路由配置结构：

```
路由模块：用户工作台
  - 路由路径：/user/dashboard
  - 父级组件：/index/index
  - 菜单标题：工作台
  - 权限角色：R_ADMIN, R_USER
  - 子路由：
    - console（工作台首页）
      - 路由路径：console
      - 组件路径：/user/dashboard/console
      - 菜单标题：控制台
      - 固定标签页：是
```

### 4.3 路由守卫调整

#### 4.3.1 登录后跳转逻辑

在 `/src/router/guards/beforeEach.ts` 的路由守卫中，修改首页重定向逻辑：

**首页路径判断规则**：

1. 获取用户角色信息（从 userStore.getUserInfo.roles）
2. 根据角色判断首页路径：
   - 如果用户角色包含 `R_SUPER`，首页路径为 `/system/dashboard/console`
   - 如果用户角色包含 `R_ADMIN` 或 `R_USER`，首页路径为 `/user/dashboard/console`
3. 在处理根路径 `/` 时，根据角色跳转到对应的首页

**实现方式**：

在 `handleRootPathRedirect` 函数中添加角色判断逻辑：

```
处理流程：
1. 检查目标路由是否为根路径 /
2. 获取用户角色信息：userStore.getUserInfo.roles
3. 判断角色优先级：
   - 角色数组包含 R_SUPER → 返回 /system/dashboard/console
   - 角色数组包含 R_ADMIN 或 R_USER → 返回 /user/dashboard/console
   - 无匹配角色 → 返回默认路径或跳转登录页
4. 执行路由跳转：next({ path: homePath, replace: true })
```

**角色判断工具函数**：

创建通用角色判断函数（可放置在 `/src/utils/router.ts` 中）：

```
函数名：getHomePathByRoles
入参：roles: string[]（用户角色数组）
返回：string（首页路径）
逻辑：
  - 判断 roles 是否包含 'R_SUPER'
    是 → 返回 '/system/dashboard/console'
    否 → 继续判断
  - 判断 roles 是否包含 'R_ADMIN' 或 'R_USER'
    是 → 返回 '/user/dashboard/console'
    否 → 返回 '/auth/login'
```

#### 4.3.2 权限验证流程

保持现有权限验证机制：

- 在动态路由注册时，通过 `RoutePermissionValidator` 验证用户对目标路径的访问权限
- 无权限时跳转到首页或 403 页面
- 菜单过滤通过 `MenuProcessor` 根据用户角色筛选可访问菜单

### 4.4 原有路由模块处理

删除或清理以下模板示例路由模块：

- `/src/router/modules/dashboard.ts`（原工作台路由，替换为新的 system-dashboard.ts 和 user-dashboard.ts）
- `/src/router/modules/article.ts`（文章管理模块）
- `/src/router/modules/examples.ts`（示例页面模块）
- `/src/router/modules/template.ts`（模板页面模块）
- `/src/router/modules/widgets.ts`（组件示例模块）

保留以下系统基础路由模块（后续可根据业务扩展）：

- `/src/router/modules/system.ts`（系统管理模块，仅保留用户管理、角色管理等基础功能）
- `/src/router/modules/exception.ts`（异常页面路由）
- `/src/router/modules/result.ts`（结果页面路由）

## 五、状态管理调整

### 5.1 用户状态模块

在 `/src/store/modules/user.ts` 中调整：

- 保留 `setUserInfo`、`setToken`、`setLoginStatus`、`logOut` 等核心方法
- 保留角色信息存储和获取逻辑
- 调整 `logOut` 方法中的跳转逻辑，确保登出后跳转到登录页

### 5.2 菜单状态模块

在 `/src/store/modules/menu.ts` 中：

- 保留菜单数据存储和动态路由注册功能
- 清理模板示例菜单数据
- 更新 `homePath` 计算逻辑，根据用户角色返回不同的首页路径

**homePath 计算逻辑调整**：

在菜单状态模块中添加 computed 属性，根据用户角色动态计算首页路径：

```
computed 属性：homePath
依赖项：
  - menuList（菜单列表数据）
  - userStore.getUserInfo.roles（用户角色）
计算逻辑：
  1. 获取用户角色数组
  2. 调用 getHomePathByRoles 工具函数
  3. 返回对应的首页路径
  4. 如果菜单列表为空，返回角色对应的默认路径
```

### 5.3 其他状态模块

保留以下状态模块：

- `/src/store/modules/setting.ts`（系统设置）
- `/src/store/modules/worktab.ts`（工作标签页）
- `/src/store/modules/table.ts`（表格状态）

## 六、API 接口设计

### 6.1 认证接口

保留并使用现有认证接口：

| 接口名称     | 接口路径          | 请求方法 | 功能说明                                        |
| ------------ | ----------------- | -------- | ----------------------------------------------- |
| 用户登录     | `/api/auth/login` | POST     | 接收用户名和密码，返回 token 和 refreshToken    |
| 获取用户信息 | `/api/user/info`  | GET      | 根据 token 获取用户详细信息（包括角色、权限等） |

### 6.2 用户信息数据模型

用户信息响应数据结构（Api.Auth.UserInfo）应包含：

- userId：用户唯一标识
- userName：用户名
- nickName：昵称或显示名称
- avatar：用户头像地址
- roles：用户角色数组（如 ["R_SUPER"]、["R_ADMIN"]、["R_USER"]）
- permissions：用户权限标识数组（如需细粒度权限控制）
- 其他业务字段（邮箱、手机号等）

### 6.3 登录流程

登录成功后的处理流程：

1. 调用 `/api/auth/login` 接口，传入用户名和密码
2. 接口返回 token 和 refreshToken
3. 使用 `userStore.setToken` 存储 token
4. 使用 `userStore.setLoginStatus(true)` 标记登录状态
5. 路由守卫自动触发，获取用户信息并注册动态路由
6. 根据用户角色跳转到对应的工作台页面

## 七、视图文件组织

### 7.1 目录结构调整

创建新的视图目录结构：

```
/src/views/
  ├── auth/                    # 认证相关页面（保留）
  │   ├── login/              # 登录页面
  │   ├── register/           # 注册页面（如需）
  │   └── forget-password/    # 忘记密码页面（如需）
  ├── system/                  # 系统后台管理员专用页面
  │   ├── dashboard/          # 系统后台工作台
  │   │   └── console/        # 控制台页面（新建）
  │   ├── user/               # 用户管理页面（保留，可扩展）
  │   ├── role/               # 角色管理页面（保留，可扩展）
  │   └── menu/               # 菜单管理页面（保留，可扩展）
  ├── user/                    # 系统管理员和普通用户页面（新建）
  │   └── dashboard/          # 用户工作台
  │       └── console/        # 控制台页面（新建）
  ├── exception/               # 异常页面（保留）
  │   ├── 403/
  │   ├── 404/
  │   └── 500/
  └── index/                   # 布局容器（保留）
      └── index.vue           # 主布局组件
```

### 7.2 删除的视图目录

删除以下模板示例相关的视图目录：

- `/src/views/dashboard/`（原工作台示例，将被 system/dashboard 和 user/dashboard 替代）
- `/src/views/article/`（文章管理示例）
- `/src/views/examples/`（组件示例）
- `/src/views/template/`（页面模板）
- `/src/views/widgets/`（组件演示）
- `/src/views/result/`（结果页面示例，可选保留）
- `/src/views/change/log/`（更新日志页面）
- `/src/views/outside/`（外部链接页面）
- `/src/views/safeguard/`（服务监控页面）

## 八、组件库保留策略

### 8.1 保留的核心组件

保留以下基础组件供业务开发使用：

#### 8.1.1 布局组件

- 页眉组件（Header）
- 侧边栏菜单（Sidebar Menu）
- 面包屑导航（Breadcrumb）
- 工作标签页（Worktab）
- 设置面板（Settings Panel）
- 全局搜索（Global Search）
- 快速入口（Fast Enter）

#### 8.1.2 表单组件

- 表单容器（art-form）
- 搜索栏（art-search-bar）
- 拖拽验证（art-drag-verify）
- Excel 导入导出（art-excel-import/export）
- 富文本编辑器（art-wang-editor）

#### 8.1.3 数据展示组件

- 表格组件（art-table）
- 图表组件（art-chart）
- 卡片组件（各类 card 组件）
- 文字效果组件（art-count-to、art-text-scroll 等）

#### 8.1.4 基础组件

- SVG 图标组件
- 返回顶部组件
- 通知组件
- 屏幕锁定组件

### 8.2 组件使用原则

- 所有组件仅作为资源库参考，可在新业务中按需引入使用
- 不在默认工作台页面中预置任何业务组件
- 组件目录 `/src/components/` 保持完整，便于后续业务开发复用

## 九、国际化与主题

### 9.1 国际化配置

保留现有国际化机制：

- 保留 `/src/locales/` 目录下的语言文件
- 保留中英文切换功能
- 清理模板示例相关的翻译文本，保留系统基础文本（登录、退出、设置、菜单等）

### 9.2 主题系统

保留现有主题系统：

- 保留亮色/暗色主题切换功能
- 保留主题色自定义功能
- 保留主题动画效果
- 相关配置位于 `/src/store/modules/setting.ts` 和 `/src/hooks/core/useTheme.ts`

## 十、构建与部署

### 10.1 构建配置

保持现有构建配置不变：

- Vite 构建工具
- TypeScript 类型检查
- 路径别名配置（@、@views、@utils 等）
- 代码规范工具（ESLint、Prettier、Stylelint）

### 10.2 环境配置

无需调整现有环境配置：

- 开发环境启动命令：`pnpm dev`
- 生产环境构建命令：`pnpm build`
- 预览命令：`pnpm serve`

## 十一、组合式函数（Composables）设计

### 11.1 useHomePath 组合式函数

创建专用的首页路径管理组合式函数：`/src/hooks/core/useHomePath.ts`

**函数职责**：

- 根据用户角色动态返回首页路径
- 提供首页路径变更的响应式监听
- 统一管理角色与路径的映射关系

**函数接口设计**：

```
函数名：useHomePath
返回值：
  - homePath: ComputedRef<string>（计算属性，响应式首页路径）
  - getHomePathByRole: (roles: string[]) => string（工具方法）
  - isSystemAdmin: ComputedRef<boolean>（是否为系统后台管理员）
  - isNormalUser: ComputedRef<boolean>（是否为普通用户或管理员）

实现逻辑：
  1. 引入 useUserStore
  2. 创建 computed 属性 homePath：
     - 获取 userStore.getUserInfo.roles
     - 判断角色类型
     - 返回对应路径
  3. 创建 computed 属性 isSystemAdmin：
     - 判断 roles 是否包含 R_SUPER
  4. 创建 computed 属性 isNormalUser：
     - 判断 roles 是否包含 R_ADMIN 或 R_USER
  5. 提供 getHomePathByRole 静态方法供外部调用
```

### 11.2 useRolePermission 组合式函数

创建角色权限验证组合式函数：`/src/hooks/core/useRolePermission.ts`

**函数职责**：

- 提供角色权限判断方法
- 支持单个或多个角色验证
- 提供路由权限验证

**函数接口设计**：

```
函数名：useRolePermission
返回值：
  - hasRole: (role: string | string[]) => boolean（角色验证方法）
  - hasAnyRole: (roles: string[]) => boolean（任意角色匹配）
  - hasAllRoles: (roles: string[]) => boolean（全部角色匹配）
  - canAccessRoute: (routeRoles?: string[]) => boolean（路由权限验证）
  - currentRoles: ComputedRef<string[]>（当前用户角色）

实现逻辑：
  1. 引入 useUserStore
  2. 创建 computed 属性 currentRoles：
     - 返回 userStore.getUserInfo.roles 或空数组
  3. 实现 hasRole 方法：
     - 支持字符串或数组参数
     - 判断用户角色是否包含指定角色
  4. 实现 hasAnyRole 方法：
     - 判断用户是否拥有数组中的任意一个角色
  5. 实现 hasAllRoles 方法：
     - 判断用户是否拥有数组中的所有角色
  6. 实现 canAccessRoute 方法：
     - 接收路由角色配置
     - 判断用户是否有权限访问该路由
```

### 11.3 组合式函数使用示例

**在路由守卫中使用**：

```
引入：
import { useHomePath } from '@/hooks/core/useHomePath'
import { useRolePermission } from '@/hooks/core/useRolePermission'

使用场景：
1. 获取首页路径：
   const { homePath, isSystemAdmin } = useHomePath()

2. 权限验证：
   const { hasRole, canAccessRoute } = useRolePermission()
   if (hasRole('R_SUPER')) {
     // 系统管理员特定逻辑
   }

3. 路由跳转：
   if (to.path === '/') {
     next({ path: homePath.value, replace: true })
   }
```

**在页面组件中使用**：

```
引入：
import { useHomePath } from '@/hooks/core/useHomePath'
import { useRolePermission } from '@/hooks/core/useRolePermission'

使用场景：
1. 条件渲染：
   const { isSystemAdmin } = useHomePath()
   <div v-if="isSystemAdmin">系统管理员专属内容</div>

2. 功能权限控制：
   const { hasRole } = useRolePermission()
   const canEdit = computed(() => hasRole(['R_SUPER', 'R_ADMIN']))
```

## 十二、实施步骤建议

为确保项目重构顺利进行，建议按以下顺序实施：

### 第一阶段：基础架构准备

1. 创建新的目录结构：`/src/views/system/dashboard/console/` 和 `/src/views/user/dashboard/console/`
2. 复制 `/src/views/dashboard/console/index.vue` 到上述两个目录
3. 清理复制后页面中的业务组件，仅保留页面框架

### 第二阶段：路由系统调整

4. 创建路由模块文件：`/src/router/modules/system-dashboard.ts` 和 `/src/router/modules/user-dashboard.ts`
5. 配置路由元信息，设置正确的角色权限
6. 删除或注释掉原有示例路由模块
7. 在 `/src/router/modules/index.ts` 中更新路由模块导出

### 第三阶段：路由守卫调整

8. 修改 `/src/router/guards/beforeEach.ts`，实现基于角色的首页跳转逻辑
9. 调整 `handleRootPathRedirect` 函数，根据用户角色返回不同的首页路径
10. 测试不同角色登录后的跳转行为

### 第四阶段：状态管理调整

11. 在 `/src/store/modules/menu.ts` 中调整 `homePath` 计算逻辑
12. 确保用户状态模块正确存储和返回角色信息
13. 测试菜单权限过滤功能

### 第五阶段：视图清理

14. 删除 `/src/views/` 下不再需要的示例视图目录
15. 保留必要的异常页面和系统管理页面
16. 更新国际化文件，删除不再使用的翻译文本

### 第六阶段：测试与优化

17. 测试三种角色的登录和跳转流程
18. 测试权限验证和菜单过滤功能
19. 测试工作台页面的布局和交互
20. 检查并修复潜在的路由和权限问题

## 十三、TypeScript 类型定义

### 13.1 用户角色类型定义

在 `/src/types/common/index.ts` 中定义角色相关类型：

```
类型定义：

1. UserRole - 用户角色枚举类型
   类型：'R_SUPER' | 'R_ADMIN' | 'R_USER'
   说明：限定可用的角色标识

2. RoleConfig - 角色配置接口
   属性：
     - roleCode: UserRole（角色代码）
     - roleName: string（角色名称）
     - homePath: string（角色对应的首页路径）
     - priority: number（角色优先级，数字越大优先级越高）

3. UserRoleInfo - 用户角色信息接口
   属性：
     - userId: string | number（用户ID）
     - userName: string（用户名）
     - roles: UserRole[]（用户角色数组）
     - permissions?: string[]（用户权限标识数组，可选）
```

### 13.2 路由元信息类型扩展

在 `/src/types/router/index.ts` 中扩展路由元信息类型：

```
接口扩展：AppRouteMeta

新增属性：
  - roles?: UserRole[]（路由访问所需角色）
  - isSystemRoute?: boolean（是否为系统后台路由）
  - isUserRoute?: boolean（是否为普通用户路由）
  - requireAuth?: boolean（是否需要登录，默认 true）

说明：
  - roles 属性用于路由权限控制
  - isSystemRoute 标识系统后台管理员专属路由
  - isUserRoute 标识普通用户和系统管理员共享路由
  - requireAuth 控制是否需要登录才能访问
```

### 13.3 API 接口类型定义

在 `/src/types/api/api.d.ts` 中更新用户信息类型：

```
namespace Api.Auth {

  interface LoginParams {
    userName: string
    password: string
  }

  interface LoginResponse {
    token: string
    refreshToken: string
  }

  interface UserInfo {
    userId: string | number
    userName: string
    nickName?: string
    avatar?: string
    email?: string
    phone?: string
    roles: UserRole[]（使用前面定义的 UserRole 类型）
    permissions?: string[]
    createTime?: string
    updateTime?: string
  }
}
```

### 13.4 状态管理类型定义

在 `/src/types/store/index.ts` 中更新用户状态类型：

```
interface UserState {
  // 用户信息
  info: Partial<Api.Auth.UserInfo>
  // 登录状态
  isLogin: boolean
  // 访问令牌
  accessToken: string
  // 刷新令牌
  refreshToken: string
  // 语言设置
  language: LanguageEnum
  // 锁屏状态
  isLock: boolean
  // 锁屏密码
  lockPassword: string
  // 搜索历史
  searchHistory: AppRouteRecord[]
}

说明：
  - info 属性类型使用 Partial<Api.Auth.UserInfo>
  - 确保类型安全和智能提示
```

## 十四、注意事项

### 12.1 权限控制

- 路由守卫必须严格验证用户角色，避免权限绕过
- 菜单权限过滤应在前端和后端双重校验
- 敏感操作应通过接口层再次验证权限

### 12.2 数据隔离

- 不同角色的工作台应呈现不同的数据视图
- 后续业务开发中，应根据角色返回不同的数据集
- 避免在前端硬编码数据，应通过接口动态获取

### 12.3 代码复用

- 两个工作台页面虽然当前内容相似，但应保持独立，便于后续差异化扩展
- 共享的布局和组件应抽取为公共组件，避免重复代码
- 权限判断逻辑应封装为可复用的工具函数或组合式函数

### 12.4 扩展性设计

- 路由配置应支持未来动态菜单的扩展
- 用户角色体系应预留扩展空间，便于增加新角色
- 工作台页面应预留数据面板的插槽或扩展区域

### 14.5 性能优化

- 路由懒加载确保按需加载页面组件
- 工作标签页缓存配置应合理，避免内存占用过高
- 图表和数据组件应使用虚拟滚动或分页加载，避免大数据渲染卡顿
- 使用 Vue 3 的 Teleport 优化弹窗和浮层渲染
- 合理使用 shallowRef 和 shallowReactive 优化大对象响应式性能

### 14.6 Vue 3 最佳实践

- 优先使用 Composition API 和 `<script setup>` 语法
- 合理拆分组合式函数，提高代码复用性
- 使用 `defineOptions` 定义组件名称，便于调试
- 使用 `defineProps` 和 `defineEmits` 定义组件接口
- 避免在模板中使用复杂表达式，提取为 computed 属性
- 合理使用 `watch` 和 `watchEffect`，注意清理副作用
- 使用 `unref` 和 `toValue` 处理可能为 ref 的值

### 14.7 依赖包版本管理

- 项目使用 pnpm 作为包管理器，确保依赖安装一致性
- 核心依赖已锁定为稳定版本：
  - Vue 3.5.21
  - Pinia 3.0.3
  - Vue Router 4.5.1
  - Element Plus 2.11.2
  - Vite 7.1.5
- 后续升级依赖时需进行完整回归测试
- 使用 TypeScript 严格模式，确保类型安全
