# 菜单管理功能 - 前端实现指南

本文档提供菜单管理功能的前端实现代码。

## 步骤6：前端API集成

**文件路径**：`src/api/system-manage.ts`

在现有文件中添加以下代码：

```typescript
/**
 * 获取菜单列表
 */
export function fetchGetMenuList(params?: {
  current?: number
  size?: number
  menuName?: string
  menuPath?: string
  menuType?: string
  enabled?: number
  returnTree?: boolean
}) {
  return request.get<any>('/api/menu/list', { params })
}

/**
 * 获取菜单详情
 */
export function fetchGetMenuDetail(id: number) {
  return request.get<any>(`/api/menu/${id}`)
}

/**
 * 创建菜单
 */
export function fetchCreateMenu(data: {
  menuType?: string
  parentId?: number
  name: string
  path?: string
  component?: string
  title: string
  icon?: string
  sort?: number
  enabled?: boolean
  isHide?: boolean
  isHideTab?: boolean
  keepAlive?: boolean
  link?: string
  isIframe?: boolean
  showBadge?: boolean
  showTextBadge?: string
  fixedTab?: boolean
  activePath?: string
  isFullPage?: boolean
  authMark?: string
  roles?: string[]
}) {
  return request.post<any>('/api/menu', data)
}

/**
 * 更新菜单
 */
export function fetchUpdateMenu(id: number, data: any) {
  return request.put<any>(`/api/menu/${id}`, data)
}

/**
 * 删除菜单
 */
export function fetchDeleteMenu(id: number) {
  return request.delete<any>(`/api/menu/${id}`)
}
```

---

## 步骤7：前端类型定义

**文件路径**：`src/types/api/system-manage.d.ts`

添加以下类型定义（如果文件不存在，请先创建）：

```typescript
declare namespace Api.SystemManage {
  /**
   * 菜单搜索参数
   */
  interface MenuSearchParams {
    current?: number
    size?: number
    menuName?: string
    menuPath?: string
    menuType?: string
    enabled?: number
    returnTree?: boolean
  }

  /**
   * 创建菜单参数
   */
  interface CreateMenuParams {
    menuType?: 'menu' | 'button'
    parentId?: number
    name: string
    path?: string
    component?: string
    title: string
    icon?: string
    sort?: number
    enabled?: boolean
    isHide?: boolean
    isHideTab?: boolean
    keepAlive?: boolean
    link?: string
    isIframe?: boolean
    showBadge?: boolean
    showTextBadge?: string
    fixedTab?: boolean
    activePath?: string
    isFullPage?: boolean
    authMark?: string
    roles?: string[]
  }

  /**
   * 更新菜单参数
   */
  type UpdateMenuParams = Partial<CreateMenuParams>

  /**
   * 菜单列表响应
   */
  interface MenuList {
    records: any[]
    total: number
    current: number
    size: number
  }
}
```

---

## 步骤8：前端页面逻辑调整

**文件路径**：`src/views/system/menu/index.vue`

需要修改的部分：

### 8.1 导入API函数

在文件顶部添加导入：

```vue
<script setup lang="ts">
// ... 现有导入 ...
import {
  fetchGetMenuList,
  fetchCreateMenu,
  fetchUpdateMenu,
  fetchDeleteMenu
} from '@/api/system-manage'
```

### 8.2 修改 getMenuList 方法

将第 105-117 行替换为：

```typescript
/**
 * 获取菜单列表数据
 */
const getMenuList = async (): Promise<void> => {
  loading.value = true

  try {
    const params = {
      menuName: appliedFilters.name,
      menuPath: appliedFilters.route,
      returnTree: true
    }

    const response = await fetchGetMenuList(params)

    if (response.code === 200) {
      tableData.value = response.data || []
    } else {
      ElMessage.error(response.message || '获取菜单列表失败')
      tableData.value = []
    }
  } catch (error) {
    ElMessage.error('获取菜单列表失败')
    tableData.value = []
    console.error('获取菜单列表失败:', error)
  } finally {
    loading.value = false
  }
}
```

### 8.3 修改 handleSubmit 方法

将第 417-421 行替换为：

```typescript
/**
 * 提交表单数据
 */
const handleSubmit = async (formData: MenuFormData): Promise<void> => {
  try {
    loading.value = true

    if (editData.value) {
      // 编辑模式
      const response = await fetchUpdateMenu(editData.value.id, formData)
      if (response.code === 200) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        await getMenuList()
      } else {
        ElMessage.error(response.message || '更新失败')
      }
    } else {
      // 新增模式
      const response = await fetchCreateMenu(formData)
      if (response.code === 200) {
        ElMessage.success('创建成功')
        dialogVisible.value = false
        await getMenuList()
      } else {
        ElMessage.error(response.message || '创建失败')
      }
    }
  } catch (error: any) {
    console.error('提交失败:', error)
    ElMessage.error(error.message || '操作失败')
  } finally {
    loading.value = false
  }
}
```

### 8.4 修改删除菜单方法

将第 426-440 行的 `handleDeleteMenu` 函数替换为：

```typescript
/**
 * 删除菜单
 */
const handleDeleteMenu = async (row: AppRouteRecord): Promise<void> => {
  try {
    await ElMessageBox.confirm('确定要删除该菜单吗？删除后无法恢复', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    loading.value = true
    const response = await fetchDeleteMenu(row.id as number)

    if (response.code === 200) {
      ElMessage.success('删除成功')
      await getMenuList()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  } finally {
    loading.value = false
  }
}
```

### 8.5 修改删除权限按钮方法

将第 445-459 行的 `handleDeleteAuth` 函数替换为：

```typescript
/**
 * 删除权限按钮
 */
const handleDeleteAuth = async (row: AppRouteRecord): Promise<void> => {
  try {
    await ElMessageBox.confirm('确定要删除该权限吗？删除后无法恢复', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    loading.value = true
    const response = await fetchDeleteMenu(row.id as number)

    if (response.code === 200) {
      ElMessage.success('删除成功')
      await getMenuList()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  } finally {
    loading.value = false
  }
}
```

### 8.6 更新操作列按钮

修改操作列的删除按钮，传递 row 参数：

将第 225-227 行和第 209-210 行修改为：

```typescript
// 菜单删除按钮
h(ArtButtonTable, {
  type: 'delete',
  onClick: () => handleDeleteMenu(row) // 添加 row 参数
})

// 权限删除按钮
h(ArtButtonTable, {
  type: 'delete',
  onClick: () => handleDeleteAuth(row) // 添加 row 参数
})
```

---

## 步骤9：测试验证

### 9.1 启动后端服务

```bash
cd backend
pnpm dev
```

确保后端服务运行在 `http://localhost:3009`

### 9.2 启动前端服务

```bash
cd /Users/yy/walletPro/art-design-pro
pnpm dev
```

确保前端服务运行在 `http://localhost:3008`

### 9.3 功能测试清单

访问 `http://localhost:3008/#/system/menu` 进行以下测试：

- [ ] **菜单列表展示**：能否正常显示树形菜单列表
- [ ] **搜索功能**：输入菜单名称或路由地址能否正确过滤
- [ ] **展开/收起**：点击展开/收起按钮是否正常工作
- [ ] **新增一级菜单**：
  - 点击"添加菜单"按钮
  - 填写菜单信息（名称、路由、标题等）
  - 提交后检查是否创建成功
- [ ] **新增子菜单**：
  - 在一级菜单下添加子菜单
  - 检查是否正确显示在父菜单下
- [ ] **新增权限按钮**：
  - 点击菜单行的"新增权限"按钮
  - 填写权限信息
  - 提交后检查是否显示在 authList 中
- [ ] **编辑菜单**：
  - 点击"编辑"按钮
  - 修改菜单信息
  - 提交后检查是否更新成功
- [ ] **删除菜单**：
  - 删除没有子菜单的菜单项
  - 确认删除成功
- [ ] **级联删除**：
  - 删除有子菜单的菜单项
  - 确认子菜单也被删除
- [ ] **角色权限关联**：
  - 为菜单分配角色权限
  - 检查关联是否正确保存

### 9.4 数据一致性验证

使用浏览器开发者工具查看网络请求：

1. **请求格式检查**：
   - 查看请求参数是否符合设计文档
   - 检查字段命名是否为驼峰格式

2. **响应格式检查**：
   - 查看响应数据结构是否正确
   - 检查布尔值是否正确转换
   - 验证树形结构是否符合预期

3. **数据库验证**：

   ```sql
   -- 查看菜单表数据
   SELECT * FROM menus ORDER BY sort;

   -- 查看菜单角色关联
   SELECT m.name, r.role_code
   FROM menus m
   LEFT JOIN menu_roles mr ON m.id = mr.menu_id
   LEFT JOIN roles r ON mr.role_id = r.id
   WHERE m.menu_type = 'menu';
   ```

### 9.5 错误处理测试

- [ ] **必填字段验证**：不填必填字段提交，检查是否有错误提示
- [ ] **重复名称验证**：创建重名菜单，检查是否提示名称已存在
- [ ] **权限验证**：使用普通用户登录，尝试创建菜单，检查是否提示权限不足
- [ ] **网络异常**：断网或后端服务停止，检查是否有合适的错误提示

---

## 常见问题排查

### 问题1：菜单列表显示为空

**可能原因**：

- 后端服务未启动
- 数据库表未创建
- API路径配置错误

**排查步骤**：

1. 检查后端服务是否运行：`curl http://localhost:3009/api/menu/list`
2. 检查数据库表是否存在：`SHOW TABLES LIKE 'menus';`
3. 检查浏览器控制台是否有错误信息

### 问题2：创建菜单失败

**可能原因**：

- 字段验证失败
- 唯一性约束冲突
- 权限不足

**排查步骤**：

1. 查看浏览器网络请求的响应信息
2. 检查后端日志
3. 确认当前用户角色是否为管理员

### 问题3：删除菜单失败

**可能原因**：

- 外键约束问题
- 菜单不存在
- 权限不足

**排查步骤**：

1. 检查菜单ID是否正确
2. 查看后端错误日志
3. 检查数据库外键约束是否正确设置

---

## 性能优化建议

1. **缓存菜单数据**：对于不经常变化的菜单，可以使用 Redis 缓存
2. **限制树形深度**：建议菜单层级不超过5层
3. **分页查询优化**：大量菜单时使用分页模式而非树形模式
4. **索引优化**：确保 parent_id、menu_type、sort 字段有索引

---

## 下一步计划

菜单管理功能完成后，建议：

1. **添加菜单图标选择器**：提供可视化的图标选择界面
2. **拖拽排序功能**：支持拖拽调整菜单顺序
3. **菜单导入导出**：支持批量导入导出菜单配置
4. **菜单版本控制**：记录菜单配置的历史版本，支持回滚

---

**文档创建日期**：2024年  
**最后更新日期**：2024年
