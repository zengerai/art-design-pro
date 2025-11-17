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
          title: converted.title, // 添加 title 字段到顶层，供 buildMenuTree 使用
          sort: converted.sort, // 添加 sort 字段到顶层，供 buildMenuTree 使用
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
      const countParams = []
      let countQuery = 'SELECT COUNT(DISTINCT m.id) as total FROM menus m WHERE 1=1'

      if (menuName) {
        countQuery += ' AND m.title LIKE ?'
        countParams.push(`%${menuName}%`)
      }
      if (menuPath) {
        countQuery += ' AND m.path LIKE ?'
        countParams.push(`%${menuPath}%`)
      }
      if (menuType) {
        countQuery += ' AND m.menu_type = ?'
        countParams.push(menuType)
      }
      if (enabled !== undefined && enabled !== null) {
        countQuery += ' AND m.enabled = ?'
        countParams.push(enabled)
      }

      const [countResult] = await pool.execute<RowDataPacket[]>(countQuery, countParams)
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
    })
  } catch (error) {
    next(error)
  }
}

// 创建菜单/权限按钮
export async function createMenu(req: AuthRequest, res: Response, next: NextFunction) {
  const connection = await pool.getConnection()
  try {
    // 权限验证：仅管理员可操作
    if (req.user?.role !== 'admin') {
      throw createError(403, '无权限执行此操作')
    }

    const { roles, ...menuData } = req.body

    // 必填字段验证
    if (!menuData.menuType || !menuData.name || !menuData.title) {
      throw createError(400, '缺少必填字段：menuType, name, title')
    }

    // 唯一性检查
    const [existingMenu] = await connection.execute<RowDataPacket[]>(
      'SELECT id FROM menus WHERE name = ?',
      [menuData.name]
    )
    if (existingMenu.length > 0) {
      throw createError(400, `菜单名称 ${menuData.name} 已存在`)
    }

    // 数据转换
    const convertedData = convertBooleanToInt(menuData)
    const snakeData = camelToSnake(convertedData)
    snakeData.create_by = req.user?.id
    snakeData.update_by = req.user?.id

    await connection.beginTransaction()

    // 插入菜单
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO menus (${Object.keys(snakeData).join(', ')})
       VALUES (${Object.keys(snakeData)
         .map(() => '?')
         .join(', ')})`,
      Object.values(snakeData)
    )

    const menuId = result.insertId

    // 处理角色关联
    if (Array.isArray(roles) && roles.length > 0) {
      const roleValues = roles.map((roleId: number) => [menuId, roleId])
      await connection.query('INSERT INTO menu_roles (menu_id, role_id) VALUES ?', [roleValues])
    }

    await connection.commit()

    res.status(201).json({
      code: 201,
      message: '菜单创建成功',
      data: { id: menuId }
    })
  } catch (error) {
    await connection.rollback()
    next(error)
  } finally {
    connection.release()
  }
}

// 更新菜单
export async function updateMenu(req: AuthRequest, res: Response, next: NextFunction) {
  const connection = await pool.getConnection()
  try {
    // 权限验证
    if (req.user?.role !== 'admin') {
      throw createError(403, '无权限执行此操作')
    }

    const menuId = parseInt(req.params.id, 10)
    const { roles, ...menuData } = req.body

    // 验证菜单是否存在
    const [existing] = await connection.execute<RowDataPacket[]>(
      'SELECT id FROM menus WHERE id = ?',
      [menuId]
    )
    if (existing.length === 0) {
      throw createError(404, '菜单不存在')
    }

    // 如果修改了name，检查唯一性
    if (menuData.name) {
      const [duplicate] = await connection.execute<RowDataPacket[]>(
        'SELECT id FROM menus WHERE name = ? AND id != ?',
        [menuData.name, menuId]
      )
      if (duplicate.length > 0) {
        throw createError(400, `菜单名称 ${menuData.name} 已存在`)
      }
    }

    await connection.beginTransaction()

    // 更新菜单数据
    if (Object.keys(menuData).length > 0) {
      const convertedData = convertBooleanToInt(menuData)
      const snakeData = camelToSnake(convertedData)
      snakeData.update_by = req.user?.id

      const updateFields = Object.keys(snakeData)
        .map((key) => `${key} = ?`)
        .join(', ')
      const updateValues = [...Object.values(snakeData), menuId]

      await connection.execute(`UPDATE menus SET ${updateFields} WHERE id = ?`, updateValues)
    }

    // 更新角色关联
    if (Array.isArray(roles)) {
      await connection.execute('DELETE FROM menu_roles WHERE menu_id = ?', [menuId])
      if (roles.length > 0) {
        const roleValues = roles.map((roleId: number) => [menuId, roleId])
        await connection.query('INSERT INTO menu_roles (menu_id, role_id) VALUES ?', [roleValues])
      }
    }

    await connection.commit()

    res.json({
      code: 200,
      message: '菜单更新成功',
      data: null
    })
  } catch (error) {
    await connection.rollback()
    next(error)
  } finally {
    connection.release()
  }
}

// 删除菜单（级联删除）
export async function deleteMenu(req: AuthRequest, res: Response, next: NextFunction) {
  const connection = await pool.getConnection()
  try {
    // 权限验证
    if (req.user?.role !== 'admin') {
      throw createError(403, '无权限执行此操作')
    }

    const menuId = parseInt(req.params.id, 10)

    // 验证菜单是否存在
    const [existing] = await connection.execute<RowDataPacket[]>(
      'SELECT id FROM menus WHERE id = ?',
      [menuId]
    )
    if (existing.length === 0) {
      throw createError(404, '菜单不存在')
    }

    await connection.beginTransaction()

    // 递归获取所有子菜单ID
    const menuIds = await getChildMenuIds(menuId, connection)

    // 删除角色关联
    await connection.execute(`DELETE FROM menu_roles WHERE menu_id IN (${menuIds.join(',')})`, [])

    // 级联删除所有菜单（外键约束会自动处理）
    await connection.execute('DELETE FROM menus WHERE id = ?', [menuId])

    await connection.commit()

    res.json({
      code: 200,
      message: '菜单删除成功',
      data: null
    })
  } catch (error) {
    await connection.rollback()
    next(error)
  } finally {
    connection.release()
  }
}
