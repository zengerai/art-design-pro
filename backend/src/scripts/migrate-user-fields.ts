import pool from '../config/database'

async function migrateUserFields() {
  const connection = await pool.getConnection()

  try {
    console.log('开始数据库迁移...\n')

    // 第一步：添加新字段
    console.log('第一步：添加新字段...')

    await connection.execute(`
      ALTER TABLE users 
      ADD COLUMN phone VARCHAR(20) DEFAULT NULL COMMENT '手机号' AFTER mobile
    `)
    console.log('✓ 添加 phone 字段')

    await connection.execute(`
      ALTER TABLE users 
      ADD COLUMN gender TINYINT DEFAULT NULL COMMENT '性别：1-男，2-女' AFTER sex
    `)
    console.log('✓ 添加 gender 字段')

    await connection.execute(`
      ALTER TABLE users 
      ADD COLUMN create_by INT DEFAULT NULL COMMENT '创建人ID' AFTER status
    `)
    console.log('✓ 添加 create_by 字段')

    await connection.execute(`
      ALTER TABLE users 
      ADD COLUMN update_by INT DEFAULT NULL COMMENT '更新人ID' AFTER create_by
    `)
    console.log('✓ 添加 update_by 字段\n')

    // 第二步：数据迁移
    console.log('第二步：数据迁移...')

    const [result1]: any = await connection.execute(`
      UPDATE users SET phone = mobile WHERE mobile IS NOT NULL
    `)
    console.log(`✓ 迁移 mobile → phone (${result1.affectedRows} 行)`)

    const [result2]: any = await connection.execute(`
      UPDATE users SET gender = sex WHERE sex IS NOT NULL
    `)
    console.log(`✓ 迁移 sex → gender (${result2.affectedRows} 行)\n`)

    // 第三步：删除旧字段
    console.log('第三步：删除旧字段...')

    try {
      await connection.execute(`ALTER TABLE users DROP INDEX idx_mobile`)
      console.log('✓ 删除 idx_mobile 索引')
    } catch (error: any) {
      if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('⚠ idx_mobile 索引不存在，跳过')
      } else {
        throw error
      }
    }

    await connection.execute(`ALTER TABLE users DROP COLUMN mobile`)
    console.log('✓ 删除 mobile 字段')

    await connection.execute(`ALTER TABLE users DROP COLUMN sex`)
    console.log('✓ 删除 sex 字段\n')

    // 第四步：添加索引
    console.log('第四步：添加索引...')

    await connection.execute(`ALTER TABLE users ADD INDEX idx_phone (phone)`)
    console.log('✓ 添加 idx_phone 索引\n')

    // 第五步：验证数据
    console.log('第五步：验证数据...')

    const [rows]: any = await connection.execute(`
      SELECT 
        id,
        username,
        real_name,
        nickname,
        phone,
        email,
        gender,
        role_id,
        status,
        create_by,
        update_by,
        created_at,
        updated_at
      FROM users
      ORDER BY id
    `)

    console.log('\n用户数据验证：')
    console.table(rows)

    console.log('\n✅ 数据库迁移完成！')
    console.log('\n字段变更总结：')
    console.log('1. mobile → phone（数据已迁移）')
    console.log('2. sex → gender（数据已迁移）')
    console.log('3. 新增 create_by（创建人ID）')
    console.log('4. 新增 update_by（更新人ID）')
  } catch (error) {
    console.error('\n❌ 迁移失败：', error)
    throw error
  } finally {
    connection.release()
  }
}

// 执行迁移
migrateUserFields()
  .then(() => {
    console.log('\n迁移脚本执行完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('迁移脚本执行失败：', error)
    process.exit(1)
  })
