import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import roleRoutes from './routes/role.routes.js'
import menuRoutes from './routes/menu.routes.js'
import walletRoutes from './routes/wallet.routes.js'
import fieldMetadataRoutes from './routes/fieldMetadata.routes.js'
import enumValuesRoutes from './routes/enumValues.routes.js'
import operationLogRoutes from './routes/operationLog.routes.js'
import { errorHandler } from './middleware/error.middleware.js'

// 加载环境变量
dotenv.config()

const app: Application = express()
const PORT = process.env.PORT || 3009

// 中间件
app.use(helmet()) // 安全头
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3008',
    credentials: true
  })
)
app.use(compression()) // 响应压缩
app.use(express.json()) // 解析JSON
app.use(express.urlencoded({ extended: true })) // 解析URL编码

// 请求日志
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// API路由
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/role', roleRoutes)
app.use('/api/menus', menuRoutes)
app.use('/api/wallet', walletRoutes)
app.use('/api/field-metadata', fieldMetadataRoutes)
app.use('/api/enum-values', enumValuesRoutes)
app.use('/api/operation-log', operationLogRoutes)

// 健康检查
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404处理
app.use((req: Request, res: Response) => {
  res.status(404).json({ code: 404, message: 'API接口不存在' })
})

// 错误处理
app.use(errorHandler)

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 后端服务器运行在 http://localhost:${PORT}`)
  console.log(`📝 环境: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 数据库: ${process.env.DB_NAME}`)
})

export default app
