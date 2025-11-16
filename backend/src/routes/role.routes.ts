import { Router } from 'express'
import * as roleController from '../controllers/role.controller.js'
import { authenticate, authorize } from '../middleware/auth.middleware.js'

const router = Router()

// 需要超级管理员权限的接口
router.get('/list', authenticate, authorize('R_SUPER'), roleController.getRoleList)
router.post('/', authenticate, authorize('R_SUPER'), roleController.createRole)
router.put('/:id', authenticate, authorize('R_SUPER'), roleController.updateRole)
router.delete('/:id', authenticate, authorize('R_SUPER'), roleController.deleteRole)

export default router
