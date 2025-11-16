import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

async function migrateRoleFields() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })

  try {
    console.log('开始迁移角色表字段...\n')

    // 第一步：添加新字段 enabled (TINYINT)
    console.log('1. 添加新字段 enabled...')
    await connection.execute(`
      ALTER TABLE roles 
      ADD COLUMN enabled TINYINT DEFAULT 1 COMMENT '启用状态：1-启用，0-禁用' AFTER description
    `)
    console.log('✓ enabled 字段添加成功')

    // 第二步：数据迁移 status → enabled
    console.log('\n2. 迁移数据 status → enabled...')
    const [updateResult] = await connection.execute<any>(`
      UPDATE roles SET enabled = status WHERE status IS NOT NULL
    `)
    console.log(`✓ 迁移 ${updateResult.affectedRows} 行数据`)

    // 第三步：删除旧字段 status
    console.log('\n3. 删除旧字段 status...')
    await connection.execute(`ALTER TABLE roles DROP COLUMN status`)
    console.log('✓ status 字段删除成功')

    // 第四步：验证迁移结果
    console.log('\n4. 验证迁移结果...')
    const [columns] = await connection.execute<any>(`SHOW COLUMNS FROM roles`)
    console.log('\nroles 表当前字段：')
    columns.forEach((col: any) => {
      console.log(
        `  - ${col.Field} (${col.Type}${col.Null === 'NO' ? ' NOT NULL' : ''}) ${col.Default !== null ? `DEFAULT ${col.Default}` : ''}`
      )
    })

    const [roles] = await connection.execute<any>(`SELECT * FROM roles`)
    console.log(`\n数据记录数: ${roles.length}`)

    console.log('\n✅ 数据库迁移完成！')
  } catch (error: any) {
    console.error('\n❌ 迁移失败:', error.message)
    throw error
  } finally {
    await connection.end()
  }
}

migrateRoleFields().catch(console.error)
