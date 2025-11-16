import { Response, NextFunction } from 'express'
import pool from '../config/database.js'
import { AuthRequest } from '../middleware/auth.middleware.js'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

/**
 * 获取角色列表
 */
export async function getRoleList(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { current = 1, size = 20, roleName, roleCode } = req.query

    let query = `SELECT id as roleId, role_name as roleName, role_code as roleCode, description, status as enabled, created_at as createTime FROM roles WHERE 1=1`
    const params: any[] = []

    if (roleName) {
      query += ' AND role_name LIKE ?'
      params.push(`%${roleName}%`)
    }
    if (roleCode) {
      query += ' AND role_code LIKE ?'
      params.push(`%${roleCode}%`)
    }

    const [countResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM (${query}) as t`,
      params
    )
    const total = countResult[0].total

    const offset = (Number(current) - 1) * Number(size)
    query += ' ORDER BY id ASC LIMIT ? OFFSET ?'
    params.push(Number(size), offset)

    const [records] = await pool.execute<RowDataPacket[]>(query, params)

    res.json({
      code: 200,
      data: {
        records: records.map((r) => ({ ...r, enabled: r.enabled === 1 })),
        total,
        current: Number(current),
        size: Number(size)
      }
    })
  } catch (error) {
    next(error)
  }
}

export async function createRole(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { roleName, roleCode, description, enabled } = req.body

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO roles (role_name, role_code, dashboard_path, description, status, created_at) VALUES (?, ?, '/user/dashboard/console', ?, ?, NOW())`,
      [roleName, roleCode, description, enabled ? 1 : 0]
    )

    res.json({ code: 200, message: '创建成功', data: { roleId: result.insertId } })
  } catch (error) {
    next(error)
  }
}

export async function updateRole(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const { roleName, roleCode, description, enabled } = req.body

    await pool.execute(
      `UPDATE roles SET role_name=?, role_code=?, description=?, status=? WHERE id=?`,
      [roleName, roleCode, description, enabled ? 1 : 0, id]
    )

    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    next(error)
  }
}

export async function deleteRole(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params

    await pool.execute('DELETE FROM roles WHERE id = ?', [id])

    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    next(error)
  }
}
