import express, { Router } from 'express'
import { getOperationLogList, getOperationLogDetail } from '../controllers/operationLog.controller'

const router: Router = express.Router()

// 查询操作日志列表
router.post('/query', getOperationLogList)

// 获取日志详情
router.get('/detail/:id', getOperationLogDetail)

export default router
