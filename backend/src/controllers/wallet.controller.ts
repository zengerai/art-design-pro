import { Request, Response } from 'express'
import pool from '../config/database'
import { randomUUID } from 'crypto'
import { recordOperationLog } from './operationLog.controller'

/**
 * EVM钱包监控控制器
 */

/**
 * 查询钱包列表（支持懒加载）
 */
export const getWalletList = async (req: Request, res: Response) => {
  try {
    const { offset = 0, limit = 50, filterCondition = {}, sortRules = [] } = req.body

    // 构建WHERE子句
    const conditions: string[] = []
    const params: any[] = []

    // 处理筛选条件
    if (filterCondition.ownership && Array.isArray(filterCondition.ownership)) {
      filterCondition.ownership.forEach((value: string) => {
        conditions.push('JSON_CONTAINS(ownership, ?)')
        params.push(JSON.stringify(value))
      })
    }

    if (filterCondition.mainChains && Array.isArray(filterCondition.mainChains)) {
      filterCondition.mainChains.forEach((value: string) => {
        conditions.push('JSON_CONTAINS(mainChains, ?)')
        params.push(JSON.stringify(value))
      })
    }

    if (filterCondition.status && Array.isArray(filterCondition.status)) {
      filterCondition.status.forEach((value: string) => {
        conditions.push('JSON_CONTAINS(status, ?)')
        params.push(JSON.stringify(value))
      })
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
    const countSql = `SELECT COUNT(*) as total FROM wallet_monitoring ${whereClause}`
    const [countResult] = (await pool.query(countSql, params)) as any[]
    const total = countResult[0].total

    // 查询数据
    const dataSql = `
      SELECT * FROM wallet_monitoring 
      ${whereClause} 
      ${orderClause} 
      LIMIT ? OFFSET ?
    `
    const dataParams = [...params, parseInt(limit as string), parseInt(offset as string)]
    const [records] = (await pool.query(dataSql, dataParams)) as any[]

    // 解析JSON字段
    const formattedRecords = records.map((record: any) => ({
      ...record,
      ownership:
        typeof record.ownership === 'string'
          ? JSON.parse(record.ownership)
          : record.ownership || [],
      mainChains:
        typeof record.mainChains === 'string'
          ? JSON.parse(record.mainChains)
          : record.mainChains || [],
      activityTags:
        typeof record.activityTags === 'string'
          ? JSON.parse(record.activityTags)
          : record.activityTags || [],
      categoryTags:
        typeof record.categoryTags === 'string'
          ? JSON.parse(record.categoryTags)
          : record.categoryTags || [],
      status: typeof record.status === 'string' ? JSON.parse(record.status) : record.status || [],
      alertMark:
        typeof record.alertMark === 'string' ? JSON.parse(record.alertMark) : record.alertMark || []
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
    console.error('查询钱包列表失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '查询失败',
      data: null
    })
  }
}

/**
 * 创建钱包记录
 */
export const createWallet = async (req: Request, res: Response) => {
  try {
    const {
      walletAddress,
      ownership = [],
      lastQueryTime,
      totalValue = 0,
      mainChains = [],
      addressActivity = 0,
      activityTags = [],
      categoryTags = [],
      status = [],
      alertMark = [],
      remark = ''
    } = req.body

    // 验证必填字段
    if (!walletAddress) {
      return res.status(400).json({
        code: 400,
        message: '钱包地址不能为空',
        data: null
      })
    }

    // 检查钱包地址是否已存在
    const checkSql = 'SELECT id FROM wallet_monitoring WHERE walletAddress = ?'
    const [existing] = (await pool.query(checkSql, [walletAddress])) as any[]

    if (existing.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '钱包地址已存在',
        data: null
      })
    }

    const id = randomUUID()
    const sql = `
      INSERT INTO wallet_monitoring (
        id, walletAddress, ownership, lastQueryTime, totalValue, 
        mainChains, addressActivity, activityTags, categoryTags, 
        status, alertMark, remark
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const params = [
      id,
      walletAddress,
      JSON.stringify(ownership),
      lastQueryTime || null,
      totalValue,
      JSON.stringify(mainChains),
      addressActivity,
      JSON.stringify(activityTags),
      JSON.stringify(categoryTags),
      JSON.stringify(status),
      JSON.stringify(alertMark),
      remark
    ]

    await pool.query(sql, params)

    // 记录操作日志
    await recordOperationLog({
      userId: (req as any).userId || 'system',
      userName: (req as any).userName || 'System',
      operationType: 'create',
      category: 'wallet',
      targetId: walletAddress,
      afterData: { walletAddress, ownership, totalValue, mainChains, status },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      remark: '创建钱包记录'
    })

    res.json({
      code: 200,
      message: '创建成功',
      data: { id, walletAddress }
    })
  } catch (error: any) {
    console.error('创建钱包记录失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '创建失败',
      data: null
    })
  }
}

/**
 * 更新钱包记录
 */
export const updateWallet = async (req: Request, res: Response) => {
  try {
    const { walletAddress, updateFields } = req.body

    if (!walletAddress) {
      return res.status(400).json({
        code: 400,
        message: '钱包地址不能为空',
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

    // 检查钱包是否存在，同时获取更新前数据
    const checkSql = 'SELECT * FROM wallet_monitoring WHERE walletAddress = ?'
    const [existing] = (await pool.query(checkSql, [walletAddress])) as any[]

    if (existing.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '钱包地址不存在',
        data: null
      })
    }

    const beforeData = existing[0]

    // 构建更新语句
    const updateParts: string[] = []
    const params: any[] = []

    Object.entries(updateFields).forEach(([key, value]) => {
      // 对于JSON数组字段，需要序列化
      if (
        ['ownership', 'mainChains', 'activityTags', 'categoryTags', 'status', 'alertMark'].includes(
          key
        )
      ) {
        updateParts.push(`${key} = ?`)
        params.push(JSON.stringify(value))
      } else {
        updateParts.push(`${key} = ?`)
        params.push(value)
      }
    })

    params.push(walletAddress)

    const sql = `
      UPDATE wallet_monitoring 
      SET ${updateParts.join(', ')} 
      WHERE walletAddress = ?
    `

    await pool.query(sql, params)

    // 记录操作日志
    const changedFields = Object.keys(updateFields).map((key) => ({
      field: key,
      oldValue: beforeData[key],
      newValue: updateFields[key]
    }))

    await recordOperationLog({
      userId: (req as any).userId || 'system',
      userName: (req as any).userName || 'System',
      operationType: 'update',
      category: 'wallet',
      targetId: walletAddress,
      beforeData: { walletAddress, ...beforeData },
      afterData: { walletAddress, ...updateFields },
      changedFields,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      remark: '更新钱包记录'
    })

    res.json({
      code: 200,
      message: '更新成功',
      data: { walletAddress }
    })
  } catch (error: any) {
    console.error('更新钱包记录失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '更新失败',
      data: null
    })
  }
}

/**
 * 批量更新钱包记录
 */
export const batchUpdateWallet = async (req: Request, res: Response) => {
  try {
    const { walletAddresses, updateFields } = req.body

    if (!walletAddresses || !Array.isArray(walletAddresses) || walletAddresses.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '钱包地址列表不能为空',
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

    // 构建更新语句
    const updateParts: string[] = []
    const params: any[] = []

    Object.entries(updateFields).forEach(([key, value]: [string, any]) => {
      if (
        ['ownership', 'mainChains', 'activityTags', 'categoryTags', 'status', 'alertMark'].includes(
          key
        )
      ) {
        // 处理JSON数组字段的追加或替换
        if (value.operation === 'append') {
          // 追加模式：合并数组
          updateParts.push(`${key} = JSON_MERGE_PRESERVE(COALESCE(${key}, '[]'), ?)`)
          params.push(JSON.stringify(value.value))
        } else {
          // 替换模式
          updateParts.push(`${key} = ?`)
          params.push(JSON.stringify(value.value || value))
        }
      } else {
        updateParts.push(`${key} = ?`)
        params.push(value)
      }
    })

    const placeholders = walletAddresses.map(() => '?').join(',')
    const sql = `
      UPDATE wallet_monitoring 
      SET ${updateParts.join(', ')} 
      WHERE walletAddress IN (${placeholders})
    `

    await pool.query(sql, [...params, ...walletAddresses])

    // 记录操作日志
    await recordOperationLog({
      userId: (req as any).userId || 'system',
      userName: (req as any).userName || 'System',
      operationType: 'batchUpdate',
      category: 'wallet',
      targetId: walletAddresses.join(','),
      afterData: { count: walletAddresses.length, updateFields },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      remark: `批量更新${walletAddresses.length}条钱包记录`
    })

    res.json({
      code: 200,
      message: '批量更新成功',
      data: { count: walletAddresses.length }
    })
  } catch (error: any) {
    console.error('批量更新钱包记录失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '批量更新失败',
      data: null
    })
  }
}

/**
 * 批量创建钱包记录
 */
export const batchCreateWallet = async (req: Request, res: Response) => {
  try {
    const { wallets } = req.body

    if (!wallets || !Array.isArray(wallets) || wallets.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '钱包数据不能为空',
        data: null
      })
    }

    // 验证所有钱包地址
    const invalidWallets = wallets.filter((w: any) => !w.walletAddress)
    if (invalidWallets.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '存在无效的钱包地址',
        data: null
      })
    }

    // 检查是否有重复的钱包地址（在输入数据中）
    const addresses = wallets.map((w: any) => w.walletAddress)
    const uniqueAddresses = new Set(addresses)
    if (uniqueAddresses.size !== addresses.length) {
      return res.status(400).json({
        code: 400,
        message: '导入数据中存在重复的钱包地址',
        data: null
      })
    }

    // 检查数据库中是否已存在
    const placeholders = addresses.map(() => '?').join(',')
    const checkSql = `SELECT walletAddress FROM wallet_monitoring WHERE walletAddress IN (${placeholders})`
    const [existing] = (await pool.query(checkSql, addresses)) as any[]

    if (existing.length > 0) {
      const existingAddresses = existing.map((row: any) => row.walletAddress)
      return res.status(400).json({
        code: 400,
        message: `以下钱包地址已存在: ${existingAddresses.join(', ')}`,
        data: null
      })
    }

    // 批量插入
    const sql = `
      INSERT INTO wallet_monitoring (
        id, walletAddress, ownership, lastQueryTime, totalValue, 
        mainChains, addressActivity, activityTags, categoryTags, 
        status, alertMark, remark
      ) VALUES ?
    `

    const values = wallets.map((wallet: any) => [
      randomUUID(),
      wallet.walletAddress,
      JSON.stringify(wallet.ownership || []),
      wallet.lastQueryTime || null,
      wallet.totalValue || 0,
      JSON.stringify(wallet.mainChains || []),
      wallet.addressActivity || 0,
      JSON.stringify(wallet.activityTags || []),
      JSON.stringify(wallet.categoryTags || []),
      JSON.stringify(wallet.status || []),
      JSON.stringify(wallet.alertMark || []),
      wallet.remark || ''
    ])

    await pool.query(sql, [values])

    // 记录操作日志
    await recordOperationLog({
      userId: (req as any).userId || 'system',
      userName: (req as any).userName || 'System',
      operationType: 'import',
      category: 'wallet',
      afterData: { count: wallets.length },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      remark: `导入${wallets.length}条钱包记录`
    })

    res.json({
      code: 200,
      message: `成功导入 ${wallets.length} 条记录`,
      data: { count: wallets.length }
    })
  } catch (error: any) {
    console.error('批量创建钱包记录失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '批量创建失败',
      data: null
    })
  }
}

/**
 * 删除钱包记录
 */
export const deleteWallet = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params

    if (!walletAddress) {
      return res.status(400).json({
        code: 400,
        message: '钱包地址不能为空',
        data: null
      })
    }

    // 先获取删除前数据
    const getDataSql = 'SELECT * FROM wallet_monitoring WHERE walletAddress = ?'
    const [beforeData] = (await pool.query(getDataSql, [walletAddress])) as any[]

    const sql = 'DELETE FROM wallet_monitoring WHERE walletAddress = ?'
    const [result] = (await pool.query(sql, [walletAddress])) as any

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '钱包地址不存在',
        data: null
      })
    }

    // 记录操作日志
    if (beforeData.length > 0) {
      await recordOperationLog({
        userId: (req as any).userId || 'system',
        userName: (req as any).userName || 'System',
        operationType: 'delete',
        category: 'wallet',
        targetId: walletAddress,
        beforeData: beforeData[0],
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        remark: '删除钱包记录'
      })
    }

    res.json({
      code: 200,
      message: '删除成功',
      data: { walletAddress }
    })
  } catch (error: any) {
    console.error('删除钱包记录失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '删除失败',
      data: null
    })
  }
}

/**
 * 随机抽样钱包记录
 */
export const randomSampleWallet = async (req: Request, res: Response) => {
  try {
    const { count, percentage, filterCondition = {} } = req.body

    // 验证参数
    if (!count && !percentage) {
      return res.status(400).json({
        code: 400,
        message: '请指定抽样数量或抽样比例',
        data: null
      })
    }

    if (count && percentage) {
      return res.status(400).json({
        code: 400,
        message: '抽样数量和抽样比例不能同时指定',
        data: null
      })
    }

    if (count && (count <= 0 || !Number.isInteger(count))) {
      return res.status(400).json({
        code: 400,
        message: '抽样数量必须是正整数',
        data: null
      })
    }

    if (percentage && (percentage <= 0 || percentage > 100)) {
      return res.status(400).json({
        code: 400,
        message: '抽样比例必须在0-100之间',
        data: null
      })
    }

    // 构建WHERE子句
    const conditions: string[] = []
    const params: any[] = []

    // 处理筛选条件
    if (filterCondition.ownership && Array.isArray(filterCondition.ownership)) {
      filterCondition.ownership.forEach((value: string) => {
        conditions.push('JSON_CONTAINS(ownership, ?)')
        params.push(JSON.stringify(value))
      })
    }

    if (filterCondition.mainChains && Array.isArray(filterCondition.mainChains)) {
      filterCondition.mainChains.forEach((value: string) => {
        conditions.push('JSON_CONTAINS(mainChains, ?)')
        params.push(JSON.stringify(value))
      })
    }

    if (filterCondition.status && Array.isArray(filterCondition.status)) {
      filterCondition.status.forEach((value: string) => {
        conditions.push('JSON_CONTAINS(status, ?)')
        params.push(JSON.stringify(value))
      })
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // 查询总数
    const countSql = `SELECT COUNT(*) as total FROM wallet_monitoring ${whereClause}`
    const [countResult] = (await pool.query(countSql, params)) as any[]
    const total = countResult[0].total

    if (total === 0) {
      return res.json({
        code: 200,
        message: '没有符合条件的记录',
        data: {
          records: [],
          total: 0,
          sampleSize: 0
        }
      })
    }

    // 计算实际抽样数量
    let sampleSize = count || Math.ceil((total * percentage!) / 100)
    sampleSize = Math.min(sampleSize, total) // 不能超过总数

    // 使用优化的随机抽样SQL
    // 对于大数据量，先随机ID再关联查询，避免全表ORDER BY RAND()
    let dataSql: string
    let dataParams: any[]

    if (total > 1000) {
      // 大数据量优化方案：先获取随机ID
      const idSql = `
        SELECT id FROM wallet_monitoring 
        ${whereClause} 
        ORDER BY RAND() 
        LIMIT ?
      `
      const idParams = [...params, sampleSize]
      const [ids] = (await pool.query(idSql, idParams)) as any[]
      const idList = ids.map((row: any) => row.id)

      if (idList.length === 0) {
        return res.json({
          code: 200,
          message: '抽样完成',
          data: {
            records: [],
            total,
            sampleSize: 0
          }
        })
      }

      // 根据ID列表查询完整记录
      const placeholders = idList.map(() => '?').join(',')
      dataSql = `SELECT * FROM wallet_monitoring WHERE id IN (${placeholders})`
      dataParams = idList
    } else {
      // 小数据量直接随机排序
      dataSql = `
        SELECT * FROM wallet_monitoring 
        ${whereClause} 
        ORDER BY RAND() 
        LIMIT ?
      `
      dataParams = [...params, sampleSize]
    }

    const [records] = (await pool.query(dataSql, dataParams)) as any[]

    // 解析JSON字段
    const formattedRecords = records.map((record: any) => ({
      ...record,
      ownership:
        typeof record.ownership === 'string'
          ? JSON.parse(record.ownership)
          : record.ownership || [],
      mainChains:
        typeof record.mainChains === 'string'
          ? JSON.parse(record.mainChains)
          : record.mainChains || [],
      activityTags:
        typeof record.activityTags === 'string'
          ? JSON.parse(record.activityTags)
          : record.activityTags || [],
      categoryTags:
        typeof record.categoryTags === 'string'
          ? JSON.parse(record.categoryTags)
          : record.categoryTags || [],
      status: typeof record.status === 'string' ? JSON.parse(record.status) : record.status || [],
      alertMark:
        typeof record.alertMark === 'string' ? JSON.parse(record.alertMark) : record.alertMark || []
    }))

    res.json({
      code: 200,
      message: `成功抽样 ${formattedRecords.length} 条记录`,
      data: {
        records: formattedRecords,
        total,
        sampleSize: formattedRecords.length
      }
    })
  } catch (error: any) {
    console.error('随机抽样失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '随机抽样失败',
      data: null
    })
  }
}
