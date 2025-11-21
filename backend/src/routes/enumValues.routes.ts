import express, { Router } from 'express'
import {
  getEnumValuesList,
  createEnumValue,
  batchCreateEnumValues,
  updateEnumValue,
  deleteEnumValue,
  reorderEnumValues
} from '../controllers/enumValues.controller'
import { authenticate } from '../middleware/auth.middleware'

const router: Router = express.Router()

// 所有路由都需要认证
router.use(authenticate)

// 获取枚举值列表
router.get('/list', getEnumValuesList)

// 创建枚举值
router.post('/create', createEnumValue)

// 批量创建枚举值
router.post('/batchCreate', batchCreateEnumValues)

// 更新枚举值
router.put('/update', updateEnumValue)

// 删除枚举值
router.delete('/delete/:id', deleteEnumValue)

// 调整排序
router.post('/reorder', reorderEnumValues)

export default router
