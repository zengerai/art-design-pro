import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
})

// 测试数据库连接
pool
  .getConnection()
  .then((connection) => {
    console.log('✅ 数据库连接成功')
    connection.release()
  })
  .catch((err) => {
    console.error('❌ 数据库连接失败:', err.message)
  })

export default pool
