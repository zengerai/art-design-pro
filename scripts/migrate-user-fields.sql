-- ==========================================
-- 用户表字段迁移脚本
-- ==========================================
-- 说明：
-- 1. 字段重命名：mobile → phone, sex → gender
-- 2. 添加审计字段：create_by, update_by
-- 3. 值类型统一：gender 使用数字类型 1/2
-- 执行时间：2024-11-16
-- ==========================================

USE virtualProject_dev;

-- ==========================================
-- 第一步：添加新字段
-- ==========================================

-- 添加 phone 字段（临时字段，用于数据迁移）
ALTER TABLE users 
ADD COLUMN phone VARCHAR(20) DEFAULT NULL COMMENT '手机号' AFTER mobile;

-- 添加 gender 字段（临时字段，用于数据迁移）
ALTER TABLE users 
ADD COLUMN gender TINYINT DEFAULT NULL COMMENT '性别：1-男，2-女' AFTER sex;

-- 添加审计字段
ALTER TABLE users 
ADD COLUMN create_by INT DEFAULT NULL COMMENT '创建人ID' AFTER status,
ADD COLUMN update_by INT DEFAULT NULL COMMENT '更新人ID' AFTER create_by;

-- ==========================================
-- 第二步：数据迁移
-- ==========================================

-- 迁移 mobile 数据到 phone
UPDATE users SET phone = mobile WHERE mobile IS NOT NULL;

-- 迁移 sex 数据到 gender
UPDATE users SET gender = sex WHERE sex IS NOT NULL;

-- ==========================================
-- 第三步：删除旧字段
-- ==========================================

-- 删除索引（如果存在）
ALTER TABLE users DROP INDEX idx_mobile;

-- 删除旧字段
ALTER TABLE users DROP COLUMN mobile;
ALTER TABLE users DROP COLUMN sex;

-- ==========================================
-- 第四步：添加索引
-- ==========================================

-- 为 phone 字段添加索引
ALTER TABLE users ADD INDEX idx_phone (phone);

-- ==========================================
-- 第五步：验证数据
-- ==========================================

-- 查看表结构
DESCRIBE users;

-- 查看数据
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
ORDER BY id;

-- ==========================================
-- 迁移完成说明
-- ==========================================
-- 
-- 字段变更：
-- 1. mobile → phone（数据已迁移）
-- 2. sex → gender（数据已迁移）
-- 3. 新增 create_by（创建人ID）
-- 4. 新增 update_by（更新人ID）
--
-- 注意事项：
-- 1. create_by 和 update_by 字段对于已存在的数据为 NULL
-- 2. 新创建/更新的用户将自动填充这些字段
-- 3. 后端需要从 JWT Token 中获取当前用户ID
-- ==========================================
