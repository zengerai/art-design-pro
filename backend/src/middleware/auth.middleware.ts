import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/auth.util.js'
import { createError } from './error.middleware.js'

export interface AuthRequest extends Request {
  user?: {
    userId: number
    username: string
    roleCode: string
  }
}

/**
 * JWT认证中间件
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('未提供认证令牌', 401)
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      roleCode: decoded.roleCode
    }

    next()
  } catch (error: any) {
    next(createError(error.message || 'Token验证失败', 401))
  }
}

/**
 * 权限验证中间件
 */
export function authorize(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw createError('未认证', 401)
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.roleCode)) {
        throw createError('权限不足', 403)
      }

      next()
    } catch (error: any) {
      next(error)
    }
  }
}
