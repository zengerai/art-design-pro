import { Router, type Router as ExpressRouter } from 'express'
import * as userController from '../controllers/user.controller.js'
import * as viewConfigController from '../controllers/viewConfig.controller.js'
import { authenticate, authorize } from '../middleware/auth.middleware.js'

const router: ExpressRouter = Router()

// 个人中心接口 - 需要认证
router.get('/info', authenticate, userController.getProfile)
router.get('/profile', authenticate, userController.getProfile)
router.put('/profile', authenticate, userController.updateProfile)
router.post('/password', authenticate, userController.changePassword)
router.post('/tags', authenticate, userController.updateTags)
router.post('/avatar', authenticate, userController.uploadAvatar)
router.get('/menus', authenticate, userController.getUserMenus)

// 视图配置接口 - 需要认证
router.post('/view-config', authenticate, viewConfigController.saveViewConfig)
router.get('/view-config', authenticate, viewConfigController.loadViewConfig)
router.get('/view-config/list', authenticate, viewConfigController.getAllViewConfigs)
router.delete('/view-config', authenticate, viewConfigController.deleteViewConfig)
router.post('/view-config/sync-all', authenticate, viewConfigController.syncAllViewConfigs)

// 需要超级管理员权限的接口
router.get('/list', authenticate, authorize('R_SUPER'), userController.getUserList)
router.post('/', authenticate, authorize('R_SUPER'), userController.createUser)
router.put('/:id', authenticate, authorize('R_SUPER'), userController.updateUser)
router.delete('/:id', authenticate, authorize('R_SUPER'), userController.deleteUser)
router.put('/:id/reset-password', authenticate, authorize('R_SUPER'), userController.resetPassword)

export default router
