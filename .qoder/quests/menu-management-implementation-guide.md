# 菜单管理功能实施指南

本文档提供菜单管理功能的完整实现代码和实施步骤。

## 实施步骤概览

- [x] 步骤1：数据库表创建（已完成）
- [ ] 步骤2：创建后端工具函数
- [ ] 步骤3：创建后端控制器
- [ ] 步骤4：创建后端路由
- [ ] 步骤5：注册路由到主文件
- [ ] 步骤6：前端API集成
- [ ] 步骤7：前端类型定义
- [ ] 步骤8：前端页面逻辑调整
- [ ] 步骤9：测试验证

---

## 步骤2：创建后端工具函数

**文件路径**：`backend/src/utils/menu.util.ts`

```typescript
import { RowDataPacket, PoolConnection } from 'mysql2/promise'

/**
 * 驼峰命名转下划线命名
 */
export function camelToSnake(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
      result[snakeKey] = obj[key]
    }
  }
  return result
}

/**
 * 下划线命名转驼峰命名
 */
export function snakeToCamel(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      result[camelKey] = obj[key]
    }
  }
  return result
}

/**
 * 布尔值转整型
 */
export function convertBooleanToInt(obj: Record<string, any>): Record<string, any> {
  const booleanFields = [
    'enabled',
    'isHide',
    'isHideTab',
    'keepAlive',
    'isIframe',
    'showBadge',
    'fixedTab',
    'isFullPage'
  ]

  const result = { ...obj }
  for (const field of booleanFields) {
    if (typeof result[field] === 'boolean') {
      result[field] = result[field] ? 1 : 0
    }
  }
  return result
}

/**
 * 整型转布尔值
 */
export function convertIntToBoolean(obj: Record<string, any>): Record<string, any> {
  const booleanFields = [
    'enabled',
    'is_hide',
    'is_hide_tab',
    'keep_alive',
    'is_iframe',
    'show_badge',
    'fixed_tab',
    'is_full_page'
  ]

  const result = { ...obj }
  for (const field of booleanFields) {
    if (result[field] === 0 || result[field] === 1) {
      result[field] = result[field] === 1
    }
  }
  return result
}

/**
 * 构建菜单树形结构
 */
export function buildMenuTree(flatList: any[]): any[] {
  const map: Record<number, any> = {}
  const tree: any[] = []

  // 创建映射表并初始化 children
  for (const item of flatList) {
    map[item.id] = { ...item, children: [] }
  }

  // 建立父子关系
  for (const item of flatList) {
    if (item.parentId === null || item.parentId === undefined) {
      tree.push(map[item.id])
    } else {
      const parent = map[item.parentId]
      if (parent) {
        if (item.menuType === 'button') {
          // 按钮类型转为 authList
          if (!parent.meta) {
            parent.meta = {}
          }
          if (!parent.meta.authList) {
            parent.meta.authList = []
          }
          parent.meta.authList.push({
            title: item.title,
            authMark: item.authMark,
            sort: item.sort
          })
        } else {
          // 菜单类型添加到 children
          parent.children.push(map[item.id])
        }
      }
    }
  }

  // 递归排序
  function sortTree(nodes: any[]) {
    nodes.sort((a, b) => (a.sort || 0) - (b.sort || 0))
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        sortTree(node.children)
      }
      if (node.meta?.authList && node.meta.authList.length > 0) {
        node.meta.authList.sort((a: any, b: any) => (a.sort || 0) - (b.sort || 0))
      }
    }
  }

  sortTree(tree)

  // 清理空 children
  function cleanEmptyChildren(nodes: any[]) {
    for (const node of nodes) {
      if (node.children && node.children.length === 0) {
        delete node.children
      } else if (node.children) {
        cleanEmptyChildren(node.children)
      }
    }
  }

  cleanEmptyChildren(tree)

  return tree
}

/**
 * 递归获取所有子菜单ID（用于级联删除）
 */
export async function getChildMenuIds(
  menuId: number,
  connection: PoolConnection
): Promise<number[]> {
  const ids: number[] = [menuId]

  const [children] = await connection.execute<RowDataPacket[]>(
    'SELECT id FROM menus WHERE parent_id = ?',
    [menuId]
  )

  for (const child of children) {
    const childIds = await getChildMenuIds(child.id, connection)
    ids.push(...childIds)
  }

  return ids
}
```

---

## 步骤3：创建后端控制器

**文件路径**：`backend/src/controllers/menu.controller.ts`

由于代码较长（约500行），请在终端执行以下命令创建文件：

```bash
cd /Users/yy/walletPro/art-design-pro/backend/src/controllers
```

然后创建 `menu.controller.ts` 文件，内容如下：

<details>
<summary>点击展开完整代码</summary>

```typescript
import { Response, NextFunction } from 'express'
import pool from '../config/database.js'
import { AuthRequest } from '../middleware/auth.middleware.js'
import { createError } from '../middleware/error.middleware.js'
import { RowDataPacket, ResultSetHeader } from 'mysql2'
import {
  camelToSnake,
  snakeToCamel,
  convertBooleanToInt,
  convertIntToBoolean,
  buildMenuTree,
  getChildMenuIds
} from '../utils/menu.util.js'

/**
 * 获取菜单列表
 */
export async function getMenuList(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const {
      current = 1,
      size = 20,
      menuName,
      menuPath,
      menuType,
      enabled,
      returnTree = 'true'
    } = req.query

    const isTreeMode = returnTree === 'true' || returnTree === true

    let query = `
      SELECT
        m.id, m.parent_id as parentId, m.menu_type as menuType,
        m.name, m.path, m.component, m.title, m.icon, m.sort,
        m.enabled, m.is_hide as isHide, m.is_hide_tab as isHideTab,
        m.keep_alive as keepAlive, m.link, m.is_iframe as isIframe,
        m.show_badge as showBadge, m.show_text_badge as showTextBadge,
        m.fixed_tab as fixedTab, m.active_path as activePath,
        m.is_full_page as isFullPage, m.auth_mark as authMark,
        m.created_at as createTime, m.updated_at as updateTime,
        GROUP_CONCAT(r.role_code) as roles
      FROM menus m
      LEFT JOIN menu_roles mr ON m.id = mr.menu_id
      LEFT JOIN roles r ON mr.role_id = r.id
      WHERE 1=1
    `
    const params: any[] = []

    if (menuName) {
      query += ' AND m.title LIKE ?'
      params.push(`%${menuName}%`)
    }
    if (menuPath) {
      query += ' AND m.path LIKE ?'
      params.push(`%${menuPath}%`)
    }
    if (menuType) {
      query += ' AND m.menu_type = ?'
      params.push(menuType)
    }
    if (enabled !== undefined && enabled !== null) {
      query += ' AND m.enabled = ?'
      params.push(enabled)
    }

    query += ' GROUP BY m.id'

    if (isTreeMode) {
      // 树形模式：查询所有数据
      query += ' ORDER BY m.parent_id ASC, m.sort ASC'
      const [records] = await pool.execute<RowDataPacket[]>(query, params)

      // 转换数据格式
      const processedRecords = records.map((r) => {
        const converted = convertIntToBoolean(r)
        return {
          id: converted.id,
          name: converted.name,
          path: converted.path,
          component: converted.component,
          menuType: converted.menuType,
          meta: {
            title: converted.title,
            icon: converted.icon,
            sort: converted.sort,
            isHide: converted.isHide,
            isHideTab: converted.isHideTab,
            keepAlive: converted.keepAlive,
            link: converted.link,
            isIframe: converted.isIframe,
            showBadge: converted.showBadge,
            showTextBadge: converted.showTextBadge,
            fixedTab: converted.fixedTab,
            activePath: converted.activePath,
            isFullPage: converted.isFullPage,
            authMark: converted.authMark,
            roles: converted.roles ? converted.roles.split(',') : []
          },
          parentId: converted.parentId,
          authMark: converted.authMark
        }
      })

      // 构建树形结构
      const tree = buildMenuTree(processedRecords)

      res.json({
        code: 200,
        data: tree
      })
    } else {
      // 分页模式
      const [countResult] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(DISTINCT m.id) as total FROM menus m WHERE 1=1${
          menuName ? ' AND m.title LIKE ?' : ''
        }${menuPath ? ' AND m.path LIKE ?' : ''}${menuType ? ' AND m.menu_type = ?' : ''}${
          enabled !== undefined ? ' AND m.enabled = ?' : ''
        }`,
        params.filter((_, index) => {
          if (menuName && index === 0) return true
          if (menuPath && (index === 0 || index === 1)) return true
          if (menuType) return true
          if (enabled !== undefined) return true
          return false
        })
      )
      const total = countResult[0].total

      // 分页
      const offset = (Number(current) - 1) * Number(size)
      query += ' ORDER BY m.id DESC LIMIT ? OFFSET ?'
      params.push(Number(size), offset)

      const [records] = await pool.execute<RowDataPacket[]>(query, params)

      res.json({
        code: 200,
        data: {
          records: records.map((r) => {
            const converted = convertIntToBoolean(r)
            return {
              ...converted,
              roles: converted.roles ? converted.roles.split(',') : []
            }
          }),
          total,
          current: Number(current),
          size: Number(size)
        }
      })
    }
  } catch (error) {
    next(error)
  }
}

/**
 * 获取菜单详情
 */
export async function getMenuDetail(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params

    const [records] = await pool.execute<RowDataPacket[]>(
      `SELECT
        m.*,
        GROUP_CONCAT(r.role_code) as roles
      FROM menus m
      LEFT JOIN menu_roles mr ON m.id = mr.menu_id
      LEFT JOIN roles r ON mr.role_id = r.id
      WHERE m.id = ?
      GROUP BY m.id`,
      [id]
    )

    if (records.length === 0) {
      throw createError('菜单不存在', 404)
    }

    const menu = records[0]
    const converted = convertIntToBoolean(snakeToCamel(menu))

    res.json({
      code: 200,
      data: {
        ...converted,
        roles: converted.roles ? converted.roles.split(',') : []
      }
    })}
  } catch (error) {
    next(error)
  }
}

/**
 * 创建菜单
 */
export async function createMenu(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const currentUserId = req.user?.userId
    const userRole = req.user?.role

    // 权限验证
    if (userRole !== 'R_SUPER' && userRole !== 'R_ADMIN') {
      throw createError('权限不足，仅管理员可操作', 403)
    }

    const {
      menuType = 'menu',
      parentId,
      name,
      path,
      component,
      title,
      icon,
      sort = 1,
      enabled = true,
      isHide = false,
      isHideTab = false,
      keepAlive = false,
      link,
      isIframe = false,
      showBadge = false,
      showTextBadge,
      fixedTab = false,
      activePath,
      isFullPage = false,
      authMark,
      roles
    } = req.body

    // 字段验证
    if (!name || !title) {
      throw createError('菜单名称和标题不能为空', 400)
    }

    if (menuType === 'menu' && !path) {
      throw createError('菜单类型必须提供路由路径', 400)
    }

    if (menuType === 'button' && (!authMark || !parentId)) {
      throw createError('按钮类型必须提供权限标识和父菜单', 400)
    }

    // 检查name唯一性
    const [existing] = await pool.execute<RowDataPacket[]>('SELECT id FROM menus WHERE name = ?', [
      name
    ])
    if (existing.length > 0) {
      throw createError('菜单名称已存在', 409)
    }

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // 准备插入数据
      const menuData = convertBooleanToInt({
        parentId,
        menuType,
        name,
        path,
        component,
        title,
        icon,
        sort,
        enabled,
        isHide,
        isHideTab,
        keepAlive,
        link,
        isIframe,
        showBadge,
        showTextBadge,
        fixedTab,
        activePath,
        isFullPage,
        authMark,
        createBy: currentUserId
      })

      const snakeData = camelToSnake(menuData)

      // 插入菜单
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO menus (
          parent_id, menu_type, name, path, component, title, icon, sort,
          enabled, is_hide, is_hide_tab, keep_alive, link, is_iframe,
          show_badge, show_text_badge, fixed_tab, active_path, is_full_page,
          auth_mark, create_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          snakeData.parent_id,
          snakeData.menu_type,
          snakeData.name,
          snakeData.path,
          snakeData.component,
          snakeData.title,
          snakeData.icon,
          snakeData.sort,
          snakeData.enabled,
          snakeData.is_hide,
          snakeData.is_hide_tab,
          snakeData.keep_alive,
          snakeData.link,
          snakeData.is_iframe,
          snakeData.show_badge,
          snakeData.show_text_badge,
          snakeData.fixed_tab,
          snakeData.active_path,
          snakeData.is_full_page,
          snakeData.auth_mark,
          snakeData.create_by
        ]
      )

      const menuId = result.insertId

      // 处理角色关联
      if (Array.isArray(roles) && roles.length > 0) {
        const [roleRecords] = await connection.execute<RowDataPacket[]>(
          `SELECT id FROM roles WHERE role_code IN (${roles.map(() => '?').join(',')})`,
          roles
        )

        if (roleRecords.length > 0) {
          const values = roleRecords.map((r) => [menuId, r.id, new Date()])
          await connection.query(
            'INSERT INTO menu_roles (menu_id, role_id, created_at) VALUES ?',
            [values]
          )
        }
      }

      await connection.commit()

      res.json({
        code: 200,
        message: '创建成功',
        data: { menuId }
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    next(error)
  }
}

/**
 * 更新菜单
 */
export async function updateMenu(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const currentUserId = req.user?.userId
    const userRole = req.user?.role

    // 权限验证
    if (userRole !== 'R_SUPER' && userRole !== 'R_ADMIN') {
      throw createError('权限不足，仅管理员可操作', 403)
    }

    // 验证菜单是否存在
    const [existing] = await pool.execute<RowDataPacket[]>('SELECT id FROM menus WHERE id = ?', [
      id
    ])
    if (existing.length === 0) {
      throw createError('菜单不存在', 404)
    }

    const { name, roles, ...updateFields } = req.body

    // 检查name唯一性（如果要修改name）
    if (name) {
      const [duplicates] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM menus WHERE name = ? AND id != ?',
        [name, id]
      )
      if (duplicates.length > 0) {
        throw createError('菜单名称已存在', 409)
      }
    }

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // 准备更新数据
      const updateData = convertBooleanToInt({
        ...updateFields,
        ...(name && { name }),
        updateBy: currentUserId
      })

      const snakeData = camelToSnake(updateData)

      // 构建动态UPDATE语句
      const updateKeys = Object.keys(snakeData).filter((key) => snakeData[key] !== undefined)
      if (updateKeys.length > 0) {
        const setClause = updateKeys.map((key) => `${key} = ?`).join(', ')
        const values = updateKeys.map((key) => snakeData[key])

        await connection.execute(
          `UPDATE menus SET ${setClause}, updated_at = NOW() WHERE id = ?`,
          [...values, id]
        )
      }

      // 更新角色关联
      if (Array.isArray(roles)) {
        // 删除旧关联
        await connection.execute('DELETE FROM menu_roles WHERE menu_id = ?', [id])

        // 插入新关联
        if (roles.length > 0) {
          const [roleRecords] = await connection.execute<RowDataPacket[]>(
            `SELECT id FROM roles WHERE role_code IN (${roles.map(() => '?').join(',')})`,
            roles
          )

          if (roleRecords.length > 0) {
            const values = roleRecords.map((r) => [id, r.id, new Date()])
            await connection.query(
              'INSERT INTO menu_roles (menu_id, role_id, created_at) VALUES ?',
              [values]
            )
          }
        }
      }

      await connection.commit()

      res.json({
        code: 200,
        message: '更新成功'
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    next(error)
  }
}

/**
 * 删除菜单
 */
export async function deleteMenu(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const userRole = req.user?.role

    // 权限验证
    if (userRole !== 'R_SUPER' && userRole !== 'R_ADMIN') {
      throw createError('权限不足，仅管理员可操作', 403)
    }

    // 验证菜单是否存在
    const [existing] = await pool.execute<RowDataPacket[]>('SELECT id FROM menus WHERE id = ?', [
      id
    ])
    if (existing.length === 0) {
      throw createError('菜单不存在', 404)
    }

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // 获取所有需要删除的菜单ID（包括子菜单）
      const menuIds = await getChildMenuIds(Number(id), connection)

      // 删除角色关联
      await connection.query(
        `DELETE FROM menu_roles WHERE menu_id IN (${menuIds.map(() => '?').join(',')})`,
        menuIds
      )

      // 删除菜单（级联删除子菜单）
      await connection.query(
        `DELETE FROM menus WHERE id IN (${menuIds.map(() => '?').join(',')})`,
        menuIds
      )

      await connection.commit()

      res.json({
        code: 200,
        message: '删除成功'
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    next(error)
  }
}
```

</details>

---

## 步骤4：创建后端路由

**文件路径**：`backend/src/routes/menu.routes.ts`

```typescript
import express from 'express'
import {
  getMenuList,
  getMenuDetail,
  createMenu,
  updateMenu,
  deleteMenu
} from '../controllers/menu.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

// 获取菜单列表
router.get('/api/menu/list', authMiddleware, getMenuList)

// 获取菜单详情
router.get('/api/menu/:id', authMiddleware, getMenuDetail)

// 创建菜单
router.post('/api/menu', authMiddleware, createMenu)

// 更新菜单
router.put('/api/menu/:id', authMiddleware, updateMenu)

// 删除菜单
router.delete('/api/menu/:id', authMiddleware, deleteMenu)

export default router
```

---

## 步骤5：注册路由到主文件

修改 `backend/src/index.ts`，添加菜单路由：

```typescript
// 在文件顶部添加导入
import menuRoutes from './routes/menu.routes.js'

// 在其他路由注册之后添加
app.use(menuRoutes)
```

---

## 后续步骤

由于后端实现完成后，还需要：

- 步骤6-8：前端代码修改
- 步骤9：测试验证

我将在下一个文档中提供前端实现代码。

---

**创建日期**：2024年  
**更新日期**：2024年
