import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const SALT_ROUNDS = 10
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30m'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

/**
 * 密码加密
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * 验证密码
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * 生成Access Token
 */
export function generateToken(payload: any): string {
  // @ts-expect-error - JWT类型定义问题
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

/**
 * 生成Refresh Token
 */
export function generateRefreshToken(payload: any): string {
  // @ts-expect-error - JWT类型定义问题
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN })
}

/**
 * 验证Access Token
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    throw new Error('Token无效或已过期')
  }
}

/**
 * 验证Refresh Token
 */
export function verifyRefreshToken(token: string): any {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET)
  } catch {
    throw new Error('Refresh Token无效或已过期')
  }
}
