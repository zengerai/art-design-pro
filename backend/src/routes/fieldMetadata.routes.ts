import express, { Router } from 'express'
import {
  getFieldMetadataList,
  createFieldMetadata,
  updateFieldMetadata,
  deleteFieldMetadata,
  reorderFieldMetadata
} from '../controllers/fieldMetadata.controller'
import { authenticate } from '../middleware/auth.middleware'

const router: Router = express.Router()

// 所有路由都需要认证
router.use(authenticate)

// 获取字段列表
router.get('/list', getFieldMetadataList)

// 创建字段
router.post('/create', createFieldMetadata)

// 更新字段
router.put('/update', updateFieldMetadata)

// 删除字段
router.delete('/delete/:id', deleteFieldMetadata)

// 调整排序
router.post('/reorder', reorderFieldMetadata)

export default router
