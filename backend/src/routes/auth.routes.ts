import { Router } from 'express'
import * as authController from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

// 公开接口（无需认证）
router.post('/login', authController.login)
router.post('/register', authController.register)
router.get('/check-username', authController.checkUsername)

// 需要认证的接口
router.post('/refresh-token', authController.refreshToken)
router.post('/logout', authenticate, authController.logout)

export default router
