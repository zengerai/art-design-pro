import { Request, Response } from 'express'
import pool from '../config/database'
import { randomUUID } from 'crypto'

/**
 * 字段元数据控制器
 */

/**
 * 获取字段列表
 */
export const getFieldMetadataList = async (req: Request, res: Response) => {
  try {
    const { category } = req.query

    let sql = 'SELECT * FROM field_metadata'
    const params: any[] = []

    if (category) {
      sql += ' WHERE category = ?'
      params.push(category)
    }

    sql += ' ORDER BY sortOrder ASC'

    const [records] = (await pool.query(sql, params)) as any[]

    res.json({
      code: 200,
      message: 'success',
      data: records
    })
  } catch (error: any) {
    console.error('获取字段列表失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '获取失败',
      data: null
    })
  }
}

/**
 * 创建字段元数据
 */
export const createFieldMetadata = async (req: Request, res: Response) => {
  try {
    const {
      fieldName,
      fieldLabel,
      fieldType,
      category,
      isSystem = 0,
      sortOrder = 0,
      isVisible = 1
    } = req.body

    // 验证必填字段
    if (!fieldName || !fieldLabel || !fieldType || !category) {
      return res.status(400).json({
        code: 400,
        message: '字段名称、显示名称、类型和分类不能为空',
        data: null
      })
    }

    // 检查字段名是否已存在
    const checkSql = 'SELECT id FROM field_metadata WHERE fieldName = ?'
    const [existing] = (await pool.query(checkSql, [fieldName])) as any[]

    if (existing.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '字段名称已存在',
        data: null
      })
    }

    const id = randomUUID()
    const sql = `
      INSERT INTO field_metadata (
        id, fieldName, fieldLabel, fieldType, category, isSystem, sortOrder, isVisible
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `

    await pool.query(sql, [
      id,
      fieldName,
      fieldLabel,
      fieldType,
      category,
      isSystem,
      sortOrder,
      isVisible
    ])

    res.json({
      code: 200,
      message: '创建成功',
      data: { id, fieldName }
    })
  } catch (error: any) {
    console.error('创建字段元数据失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '创建失败',
      data: null
    })
  }
}

/**
 * 更新字段元数据
 */
export const updateFieldMetadata = async (req: Request, res: Response) => {
  try {
    const { id, updateFields } = req.body

    if (!id) {
      return res.status(400).json({
        code: 400,
        message: '字段ID不能为空',
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

    // 检查字段是否存在
    const checkSql = 'SELECT id, isSystem FROM field_metadata WHERE id = ?'
    const [existing] = (await pool.query(checkSql, [id])) as any[]

    if (existing.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '字段不存在',
        data: null
      })
    }

    // 系统字段不允许修改某些属性
    if (
      existing[0].isSystem &&
      (updateFields.fieldName || updateFields.fieldType || updateFields.category)
    ) {
      return res.status(403).json({
        code: 403,
        message: '系统字段不允许修改字段名称、类型和分类',
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
      UPDATE field_metadata 
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
    console.error('更新字段元数据失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '更新失败',
      data: null
    })
  }
}

/**
 * 删除字段元数据
 */
export const deleteFieldMetadata = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        code: 400,
        message: '字段ID不能为空',
        data: null
      })
    }

    // 检查是否为系统字段
    const checkSql = 'SELECT isSystem FROM field_metadata WHERE id = ?'
    const [existing] = (await pool.query(checkSql, [id])) as any[]

    if (existing.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '字段不存在',
        data: null
      })
    }

    if (existing[0].isSystem) {
      return res.status(403).json({
        code: 403,
        message: '系统字段不允许删除',
        data: null
      })
    }

    const sql = 'DELETE FROM field_metadata WHERE id = ?'
    await pool.query(sql, [id])

    res.json({
      code: 200,
      message: '删除成功',
      data: { id }
    })
  } catch (error: any) {
    console.error('删除字段元数据失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '删除失败',
      data: null
    })
  }
}

/**
 * 调整字段排序
 */
export const reorderFieldMetadata = async (req: Request, res: Response) => {
  try {
    const { fieldOrders } = req.body

    if (!fieldOrders || !Array.isArray(fieldOrders) || fieldOrders.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '排序数据不能为空',
        data: null
      })
    }

    // 批量更新排序
    const updatePromises = fieldOrders.map(({ id, sortOrder }) => {
      const sql = 'UPDATE field_metadata SET sortOrder = ? WHERE id = ?'
      return pool.query(sql, [sortOrder, id])
    })

    await Promise.all(updatePromises)

    res.json({
      code: 200,
      message: '排序更新成功',
      data: { count: fieldOrders.length }
    })
  } catch (error: any) {
    console.error('调整字段排序失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '排序失败',
      data: null
    })
  }
}
