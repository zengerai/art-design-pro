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
-- 5. 创建菜单表 (menus)
-- ==========================================
DROP TABLE IF EXISTS menus;

CREATE TABLE menus (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '菜单ID，主键',
  parent_id INT DEFAULT NULL COMMENT '父菜单ID，NULL表示顶级菜单',
  menu_type VARCHAR(20) NOT NULL DEFAULT 'menu' COMMENT '菜单类型：menu-菜单，button-按钮',
  name VARCHAR(100) NOT NULL COMMENT '路由名称（唯一标识），如 User',
  path VARCHAR(255) DEFAULT NULL COMMENT '路由路径，按钮类型为NULL',
  component VARCHAR(255) DEFAULT NULL COMMENT '组件路径',
  title VARCHAR(100) NOT NULL COMMENT '菜单标题（支持国际化键名）',
  icon VARCHAR(100) DEFAULT NULL COMMENT '图标名称',
  sort INT NOT NULL DEFAULT 1 COMMENT '排序号，数字越小越靠前',
  enabled TINYINT NOT NULL DEFAULT 1 COMMENT '启用状态：1-启用，0-禁用',
  is_hide TINYINT NOT NULL DEFAULT 0 COMMENT '是否隐藏菜单：1-是，0-否',
  is_hide_tab TINYINT NOT NULL DEFAULT 0 COMMENT '是否隐藏标签页：1-是，0-否',
  keep_alive TINYINT NOT NULL DEFAULT 0 COMMENT '是否缓存页面：1-是，0-否',
  link VARCHAR(500) DEFAULT NULL COMMENT '外部链接URL',
  is_iframe TINYINT NOT NULL DEFAULT 0 COMMENT '是否内嵌页面：1-是，0-否',
  show_badge TINYINT NOT NULL DEFAULT 0 COMMENT '是否显示徽章：1-是，0-否',
  show_text_badge VARCHAR(50) DEFAULT NULL COMMENT '文本徽章内容',
  fixed_tab TINYINT NOT NULL DEFAULT 0 COMMENT '是否固定标签：1-是，0-否',
  active_path VARCHAR(255) DEFAULT NULL COMMENT '激活菜单路径',
  is_full_page TINYINT NOT NULL DEFAULT 0 COMMENT '是否全屏页面：1-是，0-否',
  auth_mark VARCHAR(100) DEFAULT NULL COMMENT '权限标识（按钮类型使用）',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  create_by INT DEFAULT NULL COMMENT '创建人ID',
  update_by INT DEFAULT NULL COMMENT '更新人ID',
  INDEX idx_parent_id (parent_id) COMMENT '加速父子查询',
  INDEX idx_menu_type (menu_type) COMMENT '加速类型筛选',
  INDEX idx_sort (sort) COMMENT '加速排序查询',
  UNIQUE KEY uk_name (name) COMMENT '确保路由名称唯一性',
  CONSTRAINT fk_menu_parent FOREIGN KEY (parent_id) REFERENCES menus(id) ON DELETE CASCADE,
  CONSTRAINT fk_menu_creator FOREIGN KEY (create_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_menu_updater FOREIGN KEY (update_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='菜单表';

-- ==========================================
-- 6. 创建菜单角色关联表 (menu_roles)
-- ==========================================
DROP TABLE IF EXISTS menu_roles;

CREATE TABLE menu_roles (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '关联ID，主键',
  menu_id INT NOT NULL COMMENT '菜单ID',
  role_id INT NOT NULL COMMENT '角色ID',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY uk_menu_role (menu_id, role_id) COMMENT '防止重复关联',
  INDEX idx_role_id (role_id) COMMENT '加速角色查询',
  CONSTRAINT fk_menu_role_menu FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
  CONSTRAINT fk_menu_role_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='菜单角色关联表';

-- ==========================================
-- 7. 创建EVM钱包监控表 (wallet_monitoring)
-- ==========================================
DROP TABLE IF EXISTS wallet_monitoring;

CREATE TABLE wallet_monitoring (
  id VARCHAR(36) PRIMARY KEY COMMENT '逻辑主键UUID',
  walletAddress VARCHAR(42) NOT NULL UNIQUE COMMENT '钱包地址',
  ownership JSON COMMENT '归属标签（JSON数组）',
  lastQueryTime DATETIME DEFAULT NULL COMMENT '查询更新时间',
  totalValue DECIMAL(20,2) DEFAULT 0 COMMENT '钱包总价值USD',
  mainChains JSON COMMENT '主链列表（JSON数组）',
  addressActivity INT DEFAULT 0 COMMENT '地址活跃天数',
  activityTags JSON COMMENT '活动标签（JSON数组）',
  categoryTags JSON COMMENT '分类标签（JSON数组）',
  status JSON COMMENT '状态标签（JSON数组）',
  alertMark JSON COMMENT '警报标记（JSON数组）',
  remark TEXT COMMENT '备注信息',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_wallet_address (walletAddress),
  INDEX idx_created_at (createdAt),
  INDEX idx_updated_at (updatedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='EVM钱包监控表';

-- 插入测试数据
INSERT INTO wallet_monitoring (id, walletAddress, ownership, lastQueryTime, totalValue, mainChains, addressActivity, activityTags, categoryTags, status, alertMark, remark) VALUES
(UUID(), '0xB23c45E67fA90123bCdE4567aBcD8901eF234567', JSON_ARRAY('个人'), '2025-10-20 10:00:00', 122.00, JSON_ARRAY('BASE', 'ARB', 'OP', 'LINEA'), 365, JSON_ARRAY('L0', 'BASE'), JSON_ARRAY('已归集'), JSON_ARRAY('休眠中'), JSON_ARRAY('正常'), '每周查询一次'),
(UUID(), '0xD45e67A89bC34567dEfA0123aBcD6789eF012345', JSON_ARRAY('外部'), '2025-10-20 10:00:00', 144.00, JSON_ARRAY('ETH', 'ARB'), 180, JSON_ARRAY('ZKS'), JSON_ARRAY('女巫号'), JSON_ARRAY('休眠中'), JSON_ARRAY('异常交互'), ''),
(UUID(), '0xA12b34C56dE78F90aBcD1234eF5678aBcD123456', JSON_ARRAY('团队'), '2025-10-20 10:00:00', 155.00, JSON_ARRAY('OP', 'LINEA'), 1, JSON_ARRAY('L0', 'ZKS'), JSON_ARRAY('精品号'), JSON_ARRAY('进行中'), JSON_ARRAY('正常'), '');

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

-- ==========================================
-- 8. 创建字段元数据表 (field_metadata)
-- ==========================================
DROP TABLE IF EXISTS field_metadata;

CREATE TABLE field_metadata (
  id VARCHAR(36) PRIMARY KEY COMMENT '主键UUID',
  fieldName VARCHAR(100) UNIQUE NOT NULL COMMENT '字段名称',
  fieldLabel VARCHAR(100) NOT NULL COMMENT '字段显示名称',
  fieldType VARCHAR(50) NOT NULL COMMENT '字段类型',
  category VARCHAR(50) NOT NULL COMMENT '字段分类',
  isSystem TINYINT(1) DEFAULT 0 COMMENT '是否系统字段',
  sortOrder INT DEFAULT 0 COMMENT '显示排序',
  isVisible TINYINT(1) DEFAULT 1 COMMENT '是否默认显示',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='字段元数据表';

-- ==========================================
-- 9. 创建枚举值表 (enum_values)
-- ==========================================
DROP TABLE IF EXISTS enum_values;

CREATE TABLE enum_values (
  id VARCHAR(36) PRIMARY KEY COMMENT '主键UUID',
  fieldName VARCHAR(100) NOT NULL COMMENT '关联字段名',
  value VARCHAR(200) NOT NULL COMMENT '枚举值',
  label VARCHAR(200) NOT NULL COMMENT '显示标签',
  color VARCHAR(50) NULL COMMENT '标签颜色',
  sortOrder INT DEFAULT 0 COMMENT '显示排序',
  isActive TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY unique_field_value (fieldName, value),
  INDEX idx_fieldName (fieldName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='枚举值表';

-- 插入字段元数据
INSERT INTO field_metadata (id, fieldName, fieldLabel, fieldType, category, isSystem, sortOrder, isVisible) VALUES
(UUID(), 'walletAddress', '钱包地址', 'text', 'wallet', 1, 1, 1),
(UUID(), 'ownership', '归属标签', 'multiSelect', 'wallet', 1, 2, 1),
(UUID(), 'lastQueryTime', '查询更新时间', 'datetime', 'wallet', 1, 3, 1),
(UUID(), 'totalValue', '钱包总价值(USD)', 'number', 'wallet', 1, 4, 1),
(UUID(), 'mainChains', '主链列表', 'multiSelect', 'wallet', 1, 5, 1),
(UUID(), 'addressActivity', '地址活跃天数', 'number', 'wallet', 1, 6, 1),
(UUID(), 'activityTags', '活动标签', 'multiSelect', 'wallet', 1, 7, 1),
(UUID(), 'categoryTags', '分类标签', 'multiSelect', 'wallet', 1, 8, 1),
(UUID(), 'status', '状态标签', 'multiSelect', 'wallet', 1, 9, 1),
(UUID(), 'alertMark', '警报标记', 'multiSelect', 'wallet', 1, 10, 1),
(UUID(), 'remark', '备注信息', 'text', 'wallet', 1, 11, 1);

-- 插入枚举值数据
INSERT INTO enum_values (id, fieldName, value, label, color, sortOrder, isActive) VALUES
-- ownership 枚举值
(UUID(), 'ownership', '个人', '个人', 'primary', 1, 1),
(UUID(), 'ownership', '团队', '团队', 'success', 2, 1),
(UUID(), 'ownership', '外部', '外部', 'warning', 3, 1),
(UUID(), 'ownership', '合作方', '合作方', 'info', 4, 1),
-- mainChains 枚举值
(UUID(), 'mainChains', 'ETH', 'ETH', 'primary', 1, 1),
(UUID(), 'mainChains', 'ARB', 'ARB', 'success', 2, 1),
(UUID(), 'mainChains', 'OP', 'OP', 'warning', 3, 1),
(UUID(), 'mainChains', 'BASE', 'BASE', 'danger', 4, 1),
(UUID(), 'mainChains', 'ZKSYNC', 'ZKSYNC', 'info', 5, 1),
(UUID(), 'mainChains', 'POLYGON', 'POLYGON', 'primary', 6, 1),
(UUID(), 'mainChains', 'BSC', 'BSC', 'success', 7, 1),
(UUID(), 'mainChains', 'AVAX', 'AVAX', 'warning', 8, 1),
-- activityTags 枚举值
(UUID(), 'activityTags', '活跃', '活跃', 'success', 1, 1),
(UUID(), 'activityTags', '休眠', '休眠', 'info', 2, 1),
(UUID(), 'activityTags', '新增', '新增', 'primary', 3, 1),
(UUID(), 'activityTags', '高频', '高频', 'warning', 4, 1),
-- categoryTags 枚举值
(UUID(), 'categoryTags', '交易', '交易', 'primary', 1, 1),
(UUID(), 'categoryTags', 'DeFi', 'DeFi', 'success', 2, 1),
(UUID(), 'categoryTags', 'NFT', 'NFT', 'warning', 3, 1),
(UUID(), 'categoryTags', 'GameFi', 'GameFi', 'danger', 4, 1),
(UUID(), 'categoryTags', 'DAO', 'DAO', 'info', 5, 1),
-- status 枚举值
(UUID(), 'status', '正常', '正常', 'success', 1, 1),
(UUID(), 'status', '监控中', '监控中', 'warning', 2, 1),
(UUID(), 'status', '已归档', '已归档', 'info', 3, 1),
(UUID(), 'status', '待处理', '待处理', 'primary', 4, 1),
-- alertMark 枚举值
(UUID(), 'alertMark', '高风险', '高风险', 'danger', 1, 1),
(UUID(), 'alertMark', '异常交易', '异常交易', 'warning', 2, 1),
(UUID(), 'alertMark', '大额转账', '大额转账', 'warning', 3, 1),
(UUID(), 'alertMark', '需关注', '需关注', 'primary', 4, 1);