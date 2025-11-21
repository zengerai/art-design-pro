import { Request, Response } from 'express'
import pool from '../config/database'
import { randomUUID } from 'crypto'

/**
 * 操作日志控制器
 */

/**
 * 获取操作日志列表（支持分页和筛选）
 */
export const getOperationLogList = async (req: Request, res: Response) => {
  try {
    const { offset = 0, limit = 50, filterCondition = {}, sortRules = [] } = req.body

    // 构建WHERE子句
    const conditions: string[] = []
    const params: any[] = []

    // 处理筛选条件
    if (filterCondition.operationType) {
      conditions.push('operationType = ?')
      params.push(filterCondition.operationType)
    }

    if (filterCondition.userId) {
      conditions.push('userId = ?')
      params.push(filterCondition.userId)
    }

    if (filterCondition.targetId) {
      conditions.push('targetId LIKE ?')
      params.push(`%${filterCondition.targetId}%`)
    }

    if (filterCondition.startTime) {
      conditions.push('createdAt >= ?')
      params.push(filterCondition.startTime)
    }

    if (filterCondition.endTime) {
      conditions.push('createdAt <= ?')
      params.push(filterCondition.endTime)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // 构建ORDER BY子句
    let orderClause = 'ORDER BY createdAt DESC'
    if (sortRules.length > 0) {
      const sortItems = sortRules.map((rule: any) => {
        const order = rule.order === 'asc' ? 'ASC' : 'DESC'
        return `${rule.field} ${order}`
      })
      orderClause = `ORDER BY ${sortItems.join(', ')}`
    }

    // 查询总数
    const countSql = `SELECT COUNT(*) as total FROM operation_log ${whereClause}`
    const [countResult] = (await pool.query(countSql, params)) as any[]
    const total = countResult[0].total

    // 查询数据
    const dataSql = `
      SELECT * FROM operation_log 
      ${whereClause} 
      ${orderClause} 
      LIMIT ? OFFSET ?
    `
    const dataParams = [...params, parseInt(limit as string), parseInt(offset as string)]
    const [records] = (await pool.query(dataSql, dataParams)) as any[]

    // 解析JSON字段
    const formattedRecords = records.map((record: any) => ({
      ...record,
      beforeData:
        typeof record.beforeData === 'string' ? JSON.parse(record.beforeData) : record.beforeData,
      afterData:
        typeof record.afterData === 'string' ? JSON.parse(record.afterData) : record.afterData,
      changedFields:
        typeof record.changedFields === 'string'
          ? JSON.parse(record.changedFields)
          : record.changedFields
    }))

    const hasMore = parseInt(offset as string) + records.length < total

    res.json({
      code: 200,
      message: 'success',
      data: {
        records: formattedRecords,
        total,
        hasMore
      }
    })
  } catch (error: any) {
    console.error('查询操作日志失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '查询失败',
      data: null
    })
  }
}

/**
 * 获取操作日志详情
 */
export const getOperationLogDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        code: 400,
        message: '日志ID不能为空',
        data: null
      })
    }

    const sql = 'SELECT * FROM operation_log WHERE id = ?'
    const [rows] = (await pool.query(sql, [id])) as any[]

    if (rows.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '日志记录不存在',
        data: null
      })
    }

    const record = rows[0]

    // 解析JSON字段
    const formattedRecord = {
      ...record,
      beforeData:
        typeof record.beforeData === 'string' ? JSON.parse(record.beforeData) : record.beforeData,
      afterData:
        typeof record.afterData === 'string' ? JSON.parse(record.afterData) : record.afterData,
      changedFields:
        typeof record.changedFields === 'string'
          ? JSON.parse(record.changedFields)
          : record.changedFields
    }

    res.json({
      code: 200,
      message: 'success',
      data: formattedRecord
    })
  } catch (error: any) {
    console.error('查询日志详情失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '查询失败',
      data: null
    })
  }
}

/**
 * 记录操作日志（内部方法）
 */
export const recordOperationLog = async (logData: {
  userId: string
  userName: string
  operationType: string
  category?: string
  targetId?: string
  beforeData?: any
  afterData?: any
  changedFields?: any[]
  ipAddress?: string
  userAgent?: string
  remark?: string
}) => {
  try {
    const id = randomUUID()

    const sql = `
      INSERT INTO operation_log (
        id, userId, userName, operationType, category, targetId,
        beforeData, afterData, changedFields, ipAddress, userAgent, remark
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const params = [
      id,
      logData.userId,
      logData.userName,
      logData.operationType,
      logData.category || 'wallet',
      logData.targetId || null,
      logData.beforeData ? JSON.stringify(logData.beforeData) : null,
      logData.afterData ? JSON.stringify(logData.afterData) : null,
      logData.changedFields ? JSON.stringify(logData.changedFields) : null,
      logData.ipAddress || null,
      logData.userAgent || null,
      logData.remark || null
    ]

    await pool.query(sql, params)

    return { success: true, id }
  } catch (error: any) {
    console.error('记录操作日志失败:', error)
    return { success: false, error: error.message }
  }
}
