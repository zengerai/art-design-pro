-- ==========================================
-- 虚拟币数据分析系统 - 数据库初始化脚本
-- ==========================================
-- 说明：此脚本用于初始化项目数据库和基础数据
-- 数据库：virtualProject_dev
-- 字符集：utf8mb4
-- 创建时间：2024-11-16
-- ==========================================

-- 1. 创建数据库
CREATE DATABASE IF NOT EXISTS virtualProject_dev 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_general_ci;

-- 切换到目标数据库
USE virtualProject_dev;

-- ==========================================
-- 2. 创建角色表 (roles)
-- ==========================================
DROP TABLE IF EXISTS roles;

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '角色ID，主键',
  role_name VARCHAR(50) NOT NULL COMMENT '角色名称',
  role_code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码，唯一',
  dashboard_path VARCHAR(200) NOT NULL COMMENT '登录后跳转的控制台路径',
  description VARCHAR(200) DEFAULT NULL COMMENT '角色描述',
  enabled TINYINT DEFAULT 1 COMMENT '启用状态：1-启用，0-禁用',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_role_code (role_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='角色表';

-- 插入预置角色数据
INSERT INTO roles (id, role_name, role_code, dashboard_path, description, enabled) VALUES 
(1, '系统后台管理员', 'R_SUPER', '/system/dashboard/console', '超级管理员，拥有所有权限', 1),
(2, '系统管理员', 'R_ADMIN', '/user/dashboard/console', '系统管理员', 1),
(3, '系统用户', 'R_USER', '/user/dashboard/console', '普通用户', 1);

-- ==========================================
-- 3. 创建用户表 (users)
-- ==========================================
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID，主键',
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名，唯一，用于登录',
  password VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
  real_name VARCHAR(50) DEFAULT NULL COMMENT '真实姓名',
  nickname VARCHAR(50) DEFAULT NULL COMMENT '昵称',
  avatar VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  gender TINYINT DEFAULT NULL COMMENT '性别：1-男，2-女',
  email VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  phone VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  address VARCHAR(200) DEFAULT NULL COMMENT '地址',
  description VARCHAR(500) DEFAULT NULL COMMENT '个人介绍',
  role_id INT NOT NULL DEFAULT 3 COMMENT '角色ID，关联角色表',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  create_by INT DEFAULT NULL COMMENT '创建人ID',
  update_by INT DEFAULT NULL COMMENT '更新人ID',
  last_login_time DATETIME DEFAULT NULL COMMENT '最后登录时间',
  last_login_ip VARCHAR(50) DEFAULT NULL COMMENT '最后登录IP',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间（自动更新）',
  INDEX idx_username (username),
  INDEX idx_role_id (role_id),
  INDEX idx_phone (phone),
  FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='用户表';

-- 插入测试用户数据
-- 注意：密码为 bcrypt 加密后的 "123456"
INSERT INTO users (username, password, real_name, nickname, role_id, status, email, phone) VALUES 
('Super', '$2a$10$4VhhfMXEkawcV6X6p8urgeHnJkSVZAiCunBO44V81DNs5bjYGTYNG', '超级管理员', 'Super', 1, 1, 'super@example.com', '13800000001'),
('Admin', '$2a$10$4VhhfMXEkawcV6X6p8urgeHnJkSVZAiCunBO44V81DNs5bjYGTYNG', '系统管理员', 'Admin', 2, 1, 'admin@example.com', '13800000002'),
('User', '$2a$10$4VhhfMXEkawcV6X6p8urgeHnJkSVZAiCunBO44V81DNs5bjYGTYNG', '普通用户', 'User', 3, 1, 'user@example.com', '13800000003');

-- ==========================================
-- 4. 创建用户标签表 (user_tags)
-- ==========================================
DROP TABLE IF EXISTS user_tags;

CREATE TABLE user_tags (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '标签ID，主键',
  user_id INT NOT NULL COMMENT '用户ID，关联用户表',
  tag_name VARCHAR(50) NOT NULL COMMENT '标签名称',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_user_id (user_id),
  UNIQUE KEY uk_user_tag (user_id, tag_name) COMMENT '防止重复添加相同标签',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='用户标签表';

-- ==========================================
-- 5. 验证数据
-- ==========================================
-- 查看所有表
SHOW TABLES;

-- 查看用户和角色关联数据
SELECT 
  u.id,
  u.username,
  u.real_name,
  u.email,
  u.mobile,
  u.role_id,
  r.role_name,
  r.role_code,
  r.dashboard_path,
  u.status,
  u.created_at
FROM users u
JOIN roles r ON u.role_id = r.id
ORDER BY u.id;

-- ==========================================
-- 初始化完成提示
-- ==========================================
-- 数据库初始化完成！
-- 
-- 预置测试账号：
-- 1. 超级管理员
--    用户名：Super
--    密码：123456
--    角色：R_SUPER
--    控制台：/system/dashboard/console
--
-- 2. 系统管理员
--    用户名：Admin
--    密码：123456
--    角色：R_ADMIN
--    控制台：/user/dashboard/console
--
-- 3. 普通用户
--    用户名：User
--    密码：123456
--    角色：R_USER
--    控制台：/user/dashboard/console
-- ==========================================
