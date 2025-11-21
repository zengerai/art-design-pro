import { Request, Response } from 'express'
import pool from '../config/database'
import { randomUUID } from 'crypto'

/**
 * 枚举值控制器
 */

/**
 * 获取枚举值列表
 */
export const getEnumValuesList = async (req: Request, res: Response) => {
  try {
    const { fieldName } = req.query

    let sql = 'SELECT * FROM enum_values WHERE 1=1'
    const params: any[] = []

    if (fieldName) {
      sql += ' AND fieldName = ?'
      params.push(fieldName)
    }

    sql += ' ORDER BY fieldName ASC, sortOrder ASC'

    const [records] = (await pool.query(sql, params)) as any[]

    res.json({
      code: 200,
      message: 'success',
      data: records
    })
  } catch (error: any) {
    console.error('获取枚举值列表失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '获取失败',
      data: null
    })
  }
}

/**
 * 创建枚举值
 */
export const createEnumValue = async (req: Request, res: Response) => {
  try {
    const { fieldName, value, label, color = null, sortOrder = 0, isActive = 1 } = req.body

    // 验证必填字段
    if (!fieldName || !value || !label) {
      return res.status(400).json({
        code: 400,
        message: '字段名、枚举值和显示标签不能为空',
        data: null
      })
    }

    // 检查枚举值是否已存在
    const checkSql = 'SELECT id FROM enum_values WHERE fieldName = ? AND value = ?'
    const [existing] = (await pool.query(checkSql, [fieldName, value])) as any[]

    if (existing.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '该字段的枚举值已存在',
        data: null
      })
    }

    const id = randomUUID()
    const sql = `
      INSERT INTO enum_values (
        id, fieldName, value, label, color, sortOrder, isActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `

    await pool.query(sql, [id, fieldName, value, label, color, sortOrder, isActive])

    res.json({
      code: 200,
      message: '创建成功',
      data: { id, fieldName, value }
    })
  } catch (error: any) {
    console.error('创建枚举值失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '创建失败',
      data: null
    })
  }
}

/**
 * 批量创建枚举值
 */
export const batchCreateEnumValues = async (req: Request, res: Response) => {
  try {
    const { values } = req.body

    if (!values || !Array.isArray(values) || values.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '枚举值数据不能为空',
        data: null
      })
    }

    // 验证所有枚举值
    const invalidValues = values.filter((v: any) => !v.fieldName || !v.value || !v.label)
    if (invalidValues.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '存在无效的枚举值数据',
        data: null
      })
    }

    // 批量插入
    const sql = `
      INSERT INTO enum_values (
        id, fieldName, value, label, color, sortOrder, isActive
      ) VALUES ?
    `

    const insertValues = values.map((v: any) => [
      randomUUID(),
      v.fieldName,
      v.value,
      v.label,
      v.color || null,
      v.sortOrder || 0,
      v.isActive !== undefined ? v.isActive : 1
    ])

    await pool.query(sql, [insertValues])

    res.json({
      code: 200,
      message: `成功创建 ${values.length} 个枚举值`,
      data: { count: values.length }
    })
  } catch (error: any) {
    console.error('批量创建枚举值失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '批量创建失败',
      data: null
    })
  }
}

/**
 * 更新枚举值
 */
export const updateEnumValue = async (req: Request, res: Response) => {
  try {
    const { id, updateFields } = req.body

    if (!id) {
      return res.status(400).json({
        code: 400,
        message: '枚举值ID不能为空',
        data: null
      })
    }

    if (!updateFields || Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        code: 400,
        message: '更新字段不能为空',
        data: null
      })
    }

    // 检查枚举值是否存在
    const checkSql = 'SELECT id FROM enum_values WHERE id = ?'
    const [existing] = (await pool.query(checkSql, [id])) as any[]

    if (existing.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '枚举值不存在',
        data: null
      })
    }

    // 构建更新语句
    const updateParts: string[] = []
    const params: any[] = []

    Object.entries(updateFields).forEach(([key, value]) => {
      updateParts.push(`${key} = ?`)
      params.push(value)
    })

    params.push(id)

    const sql = `
      UPDATE enum_values 
      SET ${updateParts.join(', ')} 
      WHERE id = ?
    `

    await pool.query(sql, params)

    res.json({
      code: 200,
      message: '更新成功',
      data: { id }
    })
  } catch (error: any) {
    console.error('更新枚举值失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '更新失败',
      data: null
    })
  }
}

/**
 * 删除枚举值
 */
export const deleteEnumValue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        code: 400,
        message: '枚举值ID不能为空',
        data: null
      })
    }

    const sql = 'DELETE FROM enum_values WHERE id = ?'
    const [result] = (await pool.query(sql, [id])) as any

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '枚举值不存在',
        data: null
      })
    }

    res.json({
      code: 200,
      message: '删除成功',
      data: { id }
    })
  } catch (error: any) {
    console.error('删除枚举值失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '删除失败',
      data: null
    })
  }
}

/**
 * 调整枚举值排序
 */
export const reorderEnumValues = async (req: Request, res: Response) => {
  try {
    const { valueOrders } = req.body

    if (!valueOrders || !Array.isArray(valueOrders) || valueOrders.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '排序数据不能为空',
        data: null
      })
    }

    // 批量更新排序
    const updatePromises = valueOrders.map(({ id, sortOrder }) => {
      const sql = 'UPDATE enum_values SET sortOrder = ? WHERE id = ?'
      return pool.query(sql, [sortOrder, id])
    })

    await Promise.all(updatePromises)

    res.json({
      code: 200,
      message: '排序更新成功',
      data: { count: valueOrders.length }
    })
  } catch (error: any) {
    console.error('调整枚举值排序失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '排序失败',
      data: null
    })
  }
}
