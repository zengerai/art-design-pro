import { Response, NextFunction } from 'express'
import pool from '../config/database.js'
import {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../utils/auth.util.js'
import { AuthRequest } from '../middleware/auth.middleware.js'
import { createError } from '../middleware/error.middleware.js'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

/**
 * 用户登录
 */
export async function login(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { userName, password } = req.body

    if (!userName || !password) {
      throw createError('用户名和密码不能为空', 400)
    }

    // 查询用户
    const [users] = await pool.execute<RowDataPacket[]>(
      `SELECT u.id, u.username, u.password, u.status, u.role_id, 
              r.role_code, r.dashboard_path, r.enabled as role_enabled
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.username = ?`,
      [userName]
    )

    if (users.length === 0) {
      throw createError('用户名或密码错误', 401)
    }

    const user = users[0]

    // 验证密码
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      throw createError('用户名或密码错误', 401)
    }

    // 检查用户状态
    if (user.status !== 1) {
      throw createError('用户已被禁用', 403)
    }

    // 检查角色状态
    if (user.role_enabled !== 1) {
      throw createError('用户角色已被禁用', 403)
    }

    // 生成Token
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      roleCode: user.role_code
    }

    const token = generateToken(tokenPayload)
    const refreshToken = generateRefreshToken(tokenPayload)

    // 更新最后登录时间和IP
    await pool.execute('UPDATE users SET last_login_time = NOW(), last_login_ip = ? WHERE id = ?', [
      req.ip,
      user.id
    ])

    res.json({
      code: 200,
      data: {
        token,
        refreshToken,
        dashboardPath: user.dashboard_path
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 获取用户信息
 */
export async function getUserInfo(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId

    const [users] = await pool.execute<RowDataPacket[]>(
      `SELECT u.id, u.username, u.email, u.avatar, r.role_code
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [userId]
    )

    if (users.length === 0) {
      throw createError('用户不存在', 404)
    }

    const user = users[0]

    res.json({
      code: 200,
      data: {
        userId: user.id,
        userName: user.username,
        email: user.email,
        avatar: user.avatar,
        roles: [user.role_code],
        buttons: []
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 刷新Token
 */
export async function refreshToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { refreshToken: oldRefreshToken } = req.body

    if (!oldRefreshToken) {
      throw createError('Refresh Token不能为空', 400)
    }

    // 验证Refresh Token
    const decoded = verifyRefreshToken(oldRefreshToken)

    // 查询用户
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT id, username, status FROM users WHERE id = ?',
      [decoded.userId]
    )

    if (users.length === 0) {
      throw createError('用户不存在', 404)
    }

    const user = users[0]

    if (user.status !== 1) {
      throw createError('用户已被禁用', 403)
    }

    // 生成新Token
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      roleCode: decoded.roleCode
    }

    const newToken = generateToken(tokenPayload)
    const newRefreshToken = generateRefreshToken(tokenPayload)

    res.json({
      code: 200,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 用户登出
 */
export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json({
      code: 200,
      message: '登出成功'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 用户注册
 */
export async function register(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      throw createError('用户名和密码不能为空', 400)
    }

    if (username.length < 3 || username.length > 20) {
      throw createError('用户名长度必须在3-20个字符之间', 400)
    }

    if (password.length < 6) {
      throw createError('密码长度至少6位', 400)
    }

    // 检查用户名是否存在
    const [existingUsers] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE username = ?',
      [username]
    )

    if (existingUsers.length > 0) {
      throw createError('用户名已被使用', 409)
    }

    // 加密密码
    const hashedPassword = await hashPassword(password)

    // 创建用户
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO users (username, password, role_id, status, created_at, updated_at) 
       VALUES (?, ?, 3, 1, NOW(), NOW())`,
      [username, hashedPassword]
    )

    res.json({
      code: 200,
      message: '注册成功',
      data: {
        userId: result.insertId
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 检查用户名是否存在
 */
export async function checkUsername(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { username } = req.query

    if (!username) {
      throw createError('用户名不能为空', 400)
    }

    const [users] = await pool.execute<RowDataPacket[]>('SELECT id FROM users WHERE username = ?', [
      username
    ])

    res.json({
      code: 200,
      data: {
        exists: users.length > 0
      }
    })
  } catch (error) {
    next(error)
  }
}
