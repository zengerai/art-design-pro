import { Response, NextFunction } from 'express'
import pool from '../config/database.js'
import { AuthRequest } from '../middleware/auth.middleware.js'
import { createError } from '../middleware/error.middleware.js'
import { RowDataPacket } from 'mysql2'

/**
 * 保存视图配置
 */
export async function saveViewConfig(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId
    const { namespace, viewData } = req.body

    if (!namespace || !viewData) {
      throw createError('命名空间和视图数据不能为空', 400)
    }

    // 检查是否已存在
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM user_view_configs WHERE user_id = ? AND namespace = ?',
      [userId, namespace]
    )

    if (existing.length > 0) {
      // 更新
      await pool.execute(
        'UPDATE user_view_configs SET view_data = ?, updated_at = NOW() WHERE user_id = ? AND namespace = ?',
        [JSON.stringify(viewData), userId, namespace]
      )
    } else {
      // 新增
      await pool.execute(
        'INSERT INTO user_view_configs (user_id, namespace, view_data, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
        [userId, namespace, JSON.stringify(viewData)]
      )
    }

    res.json({
      code: 200,
      message: '保存成功',
      data: null
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 加载视图配置
 */
export async function loadViewConfig(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId
    const { namespace } = req.query

    if (!namespace) {
      throw createError('命名空间不能为空', 400)
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT view_data, updated_at FROM user_view_configs WHERE user_id = ? AND namespace = ?',
      [userId, namespace]
    )

    if (rows.length === 0) {
      // 返回 null 表示不存在
      res.json({
        code: 200,
        data: null
      })
      return
    }

    // MySQL 的 JSON 字段可能返回字符串或对象，需要判断
    const viewData =
      typeof rows[0].view_data === 'string' ? JSON.parse(rows[0].view_data) : rows[0].view_data

    res.json({
      code: 200,
      data: viewData
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 获取所有视图配置列表
 */
export async function getAllViewConfigs(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT namespace, updated_at as updatedAt FROM user_view_configs WHERE user_id = ? ORDER BY updated_at DESC',
      [userId]
    )

    res.json({
      code: 200,
      data: rows
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 删除视图配置
 */
export async function deleteViewConfig(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId
    const { namespace } = req.query

    if (!namespace) {
      throw createError('命名空间不能为空', 400)
    }

    await pool.execute('DELETE FROM user_view_configs WHERE user_id = ? AND namespace = ?', [
      userId,
      namespace
    ])

    res.json({
      code: 200,
      message: '删除成功',
      data: null
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 同步所有视图配置（批量保存）
 */
export async function syncAllViewConfigs(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId
    const { configs } = req.body

    if (!Array.isArray(configs)) {
      throw createError('配置数据格式错误', 400)
    }

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      for (const config of configs) {
        const { namespace, viewData } = config

        if (!namespace || !viewData) {
          continue
        }

        // 检查是否已存在
        const [existing] = await connection.execute<RowDataPacket[]>(
          'SELECT id FROM user_view_configs WHERE user_id = ? AND namespace = ?',
          [userId, namespace]
        )

        if (existing.length > 0) {
          // 更新
          await connection.execute(
            'UPDATE user_view_configs SET view_data = ?, updated_at = NOW() WHERE user_id = ? AND namespace = ?',
            [JSON.stringify(viewData), userId, namespace]
          )
        } else {
          // 新增
          await connection.execute(
            'INSERT INTO user_view_configs (user_id, namespace, view_data, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
            [userId, namespace, JSON.stringify(viewData)]
          )
        }
      }

      await connection.commit()

      res.json({
        code: 200,
        message: '同步成功',
        data: null
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
