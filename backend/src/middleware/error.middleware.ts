import { Request, Response } from 'express'

export interface ApiError extends Error {
  statusCode?: number
  code?: number
}

export function errorHandler(err: ApiError, req: Request, res: Response): void {
  const statusCode = err.statusCode || 500
  const code = err.code || statusCode
  const message = err.message || '服务器内部错误'

  console.error(`[错误] ${req.method} ${req.path}:`, err)

  res.status(statusCode).json({
    code,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

export function createError(message: string, statusCode: number = 500, code?: number): ApiError {
  const error: ApiError = new Error(message)
  error.statusCode = statusCode
  error.code = code || statusCode
  return error
}
