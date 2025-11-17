import { Response, NextFunction } from 'express'
import pool from '../config/database.js'
import { AuthRequest } from '../middleware/auth.middleware.js'
import { createError } from '../middleware/error.middleware.js'
import { hashPassword, comparePassword } from '../utils/auth.util.js'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

/**
 * 获取用户列表
 */
export async function getUserList(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { current = 1, size = 20, userName, userGender, userPhone, userEmail, status } = req.query

    let query = `
      SELECT u.id, u.username as userName, u.nickname as nickName, u.avatar, u.gender as userGender,
             u.phone as userPhone, u.email as userEmail, u.status,
             u.created_at as createTime, u.updated_at as updateTime,
             r.role_code as userRoles
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE 1=1
    `
    const params: any[] = []

    if (userName) {
      query += ' AND u.username LIKE ?'
      params.push(`%${userName}%`)
    }
    if (userGender) {
      query += ' AND u.gender = ?'
      params.push(userGender)
    }
    if (userPhone) {
      query += ' AND u.phone LIKE ?'
      params.push(`%${userPhone}%`)
    }
    if (userEmail) {
      query += ' AND u.email LIKE ?'
      params.push(`%${userEmail}%`)
    }
    if (status) {
      query += ' AND u.status = ?'
      params.push(status)
    }

    // 获取总数
    const [countResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM (${query}) as t`,
      params
    )
    const total = countResult[0].total

    // 分页查询
    const offset = (Number(current) - 1) * Number(size)
    query += ' ORDER BY u.id DESC LIMIT ? OFFSET ?'
    params.push(Number(size), offset)

    const [records] = await pool.execute<RowDataPacket[]>(query, params)

    res.json({
      code: 200,
      data: {
        records: records.map((r) => ({
          ...r,
          userRoles: r.userRoles ? [r.userRoles] : []
        })),
        total,
        current: Number(current),
        size: Number(size)
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 获取当前用户详情（个人中心）
 */
export async function getProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId

    // 查询用户基本信息和角色信息
    const [users] = await pool.execute<RowDataPacket[]>(
      `SELECT u.id, u.username, u.real_name as realName, u.nickname, u.avatar,
              u.gender, u.email, u.phone, u.address, u.description,
              u.status, u.last_login_time as lastLoginTime, u.last_login_ip as lastLoginIp,
              u.created_at as createdAt, u.updated_at as updatedAt,
              r.id as roleId, r.role_name as roleName, r.role_code as roleCode
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [userId]
    )

    if (users.length === 0) {
      throw createError('用户不存在', 404)
    }

    const user = users[0]

    // 查询用户标签
    const [tags] = await pool.execute<RowDataPacket[]>(
      `SELECT tag_name FROM user_tags WHERE user_id = ? ORDER BY id`,
      [userId]
    )

    res.json({
      code: 200,
      data: {
        ...user,
        tags: tags.map((t) => t.tag_name)
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 更新当前用户个人信息
 */
export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId
    const { realName, nickname, sex, email, mobile, address, description } = req.body

    await pool.execute(
      `UPDATE users SET real_name=?, nickname=?, gender=?, email=?, phone=?, address=?, description=?, update_by=?, updated_at=NOW() WHERE id=?`,
      [realName, nickname, sex, email, mobile, address, description, userId, userId]
    )

    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    next(error)
  }
}

/**
 * 修改当前用户密码
 */
export async function changePassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId
    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
      throw createError('旧密码和新密码不能为空', 400)
    }

    // 查询当前密码
    const [users] = await pool.execute<RowDataPacket[]>(`SELECT password FROM users WHERE id = ?`, [
      userId
    ])

    if (users.length === 0) {
      throw createError('用户不存在', 404)
    }

    // 验证旧密码
    const isPasswordValid = await comparePassword(oldPassword, users[0].password)
    if (!isPasswordValid) {
      throw createError('旧密码错误', 400)
    }

    // 更新新密码
    const hashedPassword = await hashPassword(newPassword)
    await pool.execute(`UPDATE users SET password=?, update_by=?, updated_at=NOW() WHERE id=?`, [
      hashedPassword,
      userId,
      userId
    ])

    res.json({ code: 200, message: '密码修改成功' })
  } catch (error) {
    next(error)
  }
}

/**
 * 更新当前用户标签
 */
export async function updateTags(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId
    const { tags } = req.body

    if (!Array.isArray(tags)) {
      throw createError('标签必须是数组', 400)
    }

    // 开启事务
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // 删除旧标签
      await connection.execute(`DELETE FROM user_tags WHERE user_id = ?`, [userId])

      // 插入新标签
      if (tags.length > 0) {
        const values = tags.map((tag) => `(${userId}, '${tag}', NOW())`).join(',')
        await connection.execute(
          `INSERT INTO user_tags (user_id, tag_name, created_at) VALUES ${values}`
        )
      }

      await connection.commit()
      res.json({ code: 200, message: '标签更新成功' })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    next(error)
  }
}

/**
 * 上传用户头像
 */
export async function uploadAvatar(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId
    const { avatar } = req.body

    if (!avatar) {
      throw createError('头像URL不能为空', 400)
    }

    await pool.execute(`UPDATE users SET avatar=?, update_by=?, updated_at=NOW() WHERE id=?`, [
      avatar,
      userId,
      userId
    ])

    res.json({
      code: 200,
      message: '头像更新成功',
      data: { avatar }
    })
  } catch (error) {
    next(error)
  }
}

export async function createUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { username, phone, gender, role } = req.body
    const hashedPassword = await hashPassword('123456')
    const currentUserId = req.user?.userId // 获取当前操作用户ID

    // 处理角色参数：前端传递的是角色编码数组，需要转换为角色ID
    let roleId = 3 // 默认普通用户
    if (Array.isArray(role) && role.length > 0) {
      // 取第一个角色（当前系统一个用户只能有一个角色）
      const roleCode = role[0]
      // 根据角色编码查询角色ID
      const [roles] = await pool.execute<RowDataPacket[]>(
        `SELECT id FROM roles WHERE role_code = ? LIMIT 1`,
        [roleCode]
      )
      if (roles.length > 0) {
        roleId = roles[0].id
      }
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO users (username, password, phone, gender, role_id, status, create_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, NOW(), NOW())`,
      [username, hashedPassword, phone, gender, roleId, currentUserId]
    )

    res.json({ code: 200, message: '创建成功', data: { userId: result.insertId } })
  } catch (error) {
    next(error)
  }
}

export async function updateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const { username, phone, gender, role } = req.body
    const currentUserId = req.user?.userId // 获取当前操作用户ID

    // 处理角色参数
    let updateFields = 'username=?, phone=?, gender=?, update_by=?'
    const updateParams: any[] = [username, phone, gender, currentUserId]

    if (Array.isArray(role) && role.length > 0) {
      const roleCode = role[0]
      // 根据角色编码查询角色ID
      const [roles] = await pool.execute<RowDataPacket[]>(
        `SELECT id FROM roles WHERE role_code = ? LIMIT 1`,
        [roleCode]
      )
      if (roles.length > 0) {
        updateFields += ', role_id=?'
        updateParams.push(roles[0].id)
      }
    }

    updateParams.push(id)

    await pool.execute(
      `UPDATE users SET ${updateFields}, updated_at=NOW() WHERE id=?`,
      updateParams
    )

    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    next(error)
  }
}

export async function deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params

    if (Number(id) === req.user?.userId) {
      throw createError('不允许删除自己', 400)
    }

    await pool.execute('DELETE FROM user_tags WHERE user_id = ?', [id])
    await pool.execute('DELETE FROM users WHERE id = ?', [id])

    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    next(error)
  }
}

/**
 * 重置用户密码
 */
export async function resetPassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const currentUserId = req.user?.userId

    // 验证用户是否存在
    const [users] = await pool.execute<RowDataPacket[]>('SELECT id FROM users WHERE id = ?', [id])
    if (users.length === 0) {
      throw createError('用户不存在', 404)
    }

    // 重置密码为123456
    const hashedPassword = await hashPassword('123456')
    await pool.execute('UPDATE users SET password=?, update_by=?, updated_at=NOW() WHERE id=?', [
      hashedPassword,
      currentUserId,
      id
    ])

    res.json({ code: 200, message: '密码已重置为123456' })
  } catch (error) {
    next(error)
  }
}
