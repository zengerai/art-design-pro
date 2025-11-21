-- ========================================
-- Database Backup
-- Generated: 2025-11-20
-- Database: art-design-pro
-- ========================================

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- ========================================
-- Table: roles
-- ========================================
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `role_code` varchar(50) NOT NULL,
  `dashboard_path` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `enabled` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_code` (`role_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` VALUES 
(1, '系统后台管理员', 'R_SUPER', '/system/dashboard/console', '超级管理员，拥有所有权限', 1, '2025-11-16 23:44:09', '2025-11-16 23:44:09'),
(2, '系统管理员', 'R_ADMIN', '/user/dashboard/console', '系统管理员', 1, '2025-11-16 23:44:09', '2025-11-16 23:44:09'),
(3, '系统用户', 'R_USER', '/user/dashboard/console', '普通用户', 1, '2025-11-16 23:44:09', '2025-11-16 23:44:09'),
(4, 'test', 'test', '/user/dashboard/console4', '4', 1, '2025-11-17 00:09:14', '2025-11-17 00:09:14');

-- ========================================
-- Table: users
-- ========================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `real_name` varchar(50) DEFAULT NULL,
  `nickname` varchar(50) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `gender` tinyint(1) DEFAULT NULL COMMENT '0:女 1:男',
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  `status` tinyint(1) DEFAULT 1 COMMENT '0:禁用 1:启用',
  `create_by` int DEFAULT NULL,
  `update_by` int DEFAULT NULL,
  `last_login_time` datetime DEFAULT NULL,
  `last_login_ip` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` VALUES 
(1, 'Super', '$2b$10$ErHxhkE6FnW/ssxgfdkT3.eqbUzpVAtR7M7WGnHHY6LMCJkWm1l6e', '超级管理员', 'Dong', NULL, 1, 'super@example.com', '13800000001', '北京市', '无法简介', 1, 1, NULL, 1, '2025-11-20 00:13:24', '::1', '2025-11-16 23:44:25', '2025-11-20 00:13:24'),
(2, 'Admin', '$2a$10$4VhhfMXEkawcV6X6p8urgeHnJkSVZAiCunBO44V81DNs5bjYGTYNG', '系统管理员', 'Admin', NULL, NULL, 'admin@example.com', '13800000002', NULL, NULL, 2, 1, NULL, NULL, NULL, NULL, '2025-11-16 23:44:25', '2025-11-17 00:04:05'),
(3, 'User', '$2b$10$IPZlMOZtT1p876dwoiwtZ.isUReug4N8CIChZsQ8llcChuOsO9q2C', '普通用户', 'User', NULL, 1, 'user@example.com', '13800000004', NULL, NULL, 3, 1, NULL, 1, '2025-11-17 23:19:21', '::1', '2025-11-16 23:44:25', '2025-11-18 00:07:28');

-- ========================================
-- Table: menus
-- ========================================
DROP TABLE IF EXISTS `menus`;
CREATE TABLE `menus` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parent_id` int DEFAULT NULL,
  `menu_type` varchar(20) NOT NULL DEFAULT 'menu' COMMENT 'menu:菜单 button:按钮',
  `name` varchar(100) NOT NULL,
  `path` varchar(255) DEFAULT NULL,
  `component` varchar(255) DEFAULT NULL,
  `title` varchar(100) NOT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `sort` int DEFAULT 0,
  `enabled` tinyint(1) DEFAULT 1,
  `is_hide` tinyint(1) DEFAULT 0,
  `is_hide_tab` tinyint(1) DEFAULT 0,
  `keep_alive` tinyint(1) DEFAULT 0,
  `link` varchar(255) DEFAULT NULL,
  `is_iframe` tinyint(1) DEFAULT 0,
  `show_badge` tinyint(1) DEFAULT 0,
  `show_text_badge` varchar(50) DEFAULT NULL,
  `fixed_tab` tinyint(1) DEFAULT 0,
  `active_path` varchar(255) DEFAULT NULL,
  `is_full_page` tinyint(1) DEFAULT 0,
  `auth_mark` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `create_by` int DEFAULT NULL,
  `update_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `menus` VALUES 
(1, NULL, 'menu', 'SystemDashboard', '/system/dashboard', '/index/index', '系统管理工作台', 'ri:dashboard-line', 1, 1, 0, 0, 0, NULL, 0, 0, NULL, 0, NULL, 0, NULL, '2025-11-17 19:47:36', '2025-11-17 19:47:36', NULL, NULL),
(2, 1, 'menu', 'SystemConsole', 'console', '/system/dashboard/console', '控制台', 'ri:home-smile-2-line', 1, 1, 0, 0, 0, NULL, 0, 0, NULL, 1, NULL, 0, NULL, '2025-11-17 19:47:36', '2025-11-17 19:47:36', NULL, NULL),
(3, 1, 'menu', 'SystemApiDocs', 'api-docs', '', 'API文档', 'ri:file-list-3-line', 2, 1, 0, 0, 1, NULL, 0, 0, NULL, 0, NULL, 0, NULL, '2025-11-17 19:47:36', '2025-11-17 20:26:38', NULL, NULL),
(4, 3, 'menu', 'SystemApiDocAuth', 'auth', '/system/dashboard/api-docs/auth', '认证模块', 'ri:shield-keyhole-line', 1, 1, 0, 0, 1, NULL, 0, 0, NULL, 0, NULL, 0, NULL, '2025-11-17 19:47:36', '2025-11-17 20:26:38', NULL, NULL),
(5, 3, 'menu', 'SystemApiDocUser', 'user', '/system/dashboard/api-docs/user', '用户管理', 'ri:user-line', 2, 1, 0, 0, 1, NULL, 0, 0, NULL, 0, NULL, 0, NULL, '2025-11-17 19:47:36', '2025-11-17 20:26:38', NULL, NULL),
(6, 3, 'menu', 'SystemApiDocRole', 'role', '/system/dashboard/api-docs/role', '角色管理', 'ri:user-settings-line', 3, 1, 0, 0, 1, NULL, 0, 0, NULL, 0, NULL, 0, NULL, '2025-11-17 19:48:05', '2025-11-17 20:26:38', NULL, NULL),
(7, NULL, 'menu', 'UserDashboard', '/user/dashboard', '/index/index', '工作台', 'ri:dashboard-line', 2, 1, 0, 0, 0, NULL, 0, 0, NULL, 0, NULL, 0, NULL, '2025-11-17 19:48:05', '2025-11-17 19:48:05', NULL, NULL),
(9, NULL, 'menu', 'System', '/system', '/index/index', '系统管理', 'ri:user-3-line', 3, 1, 0, 0, 0, NULL, 0, 0, NULL, 0, NULL, 0, NULL, '2025-11-17 19:48:05', '2025-11-17 20:26:38', NULL, NULL),
(10, 9, 'menu', 'User', 'user', '/system/user', '用户管理', 'ri:user-line', 1, 1, 0, 0, 1, NULL, 0, 0, NULL, 0, NULL, 0, NULL, '2025-11-17 19:48:05', '2025-11-17 20:26:38', NULL, NULL),
(11, 9, 'menu', 'Role', 'role', '/system/role', '角色管理', 'ri:user-settings-line', 2, 1, 0, 0, 1, NULL, 0, 0, NULL, 0, NULL, 0, NULL, '2025-11-17 19:48:05', '2025-11-17 20:26:38', NULL, NULL),
(12, 9, 'menu', 'UserCenter', 'user-center', '/system/user-center', '个人中心', 'ri:user-line', 3, 1, 1, 1, 1, NULL, 0, 0, NULL, 0, NULL, 0, NULL, '2025-11-17 19:48:05', '2025-11-17 20:26:38', NULL, NULL),
(13, 9, 'menu', 'Menus', 'menu', '/system/menu', '菜单管理', 'ri:menu-line', 4, 1, 0, 0, 1, NULL, 0, 0, NULL, 0, NULL, 0, NULL, '2025-11-17 19:48:05', '2025-11-17 20:26:37', NULL, NULL),
(15, 13, 'button', 'Menus_edit', NULL, NULL, '编辑', NULL, 2, 1, 0, 0, 0, NULL, 0, 0, NULL, 0, NULL, 0, 'edit', '2025-11-17 19:48:05', '2025-11-17 19:48:05', NULL, NULL),
(16, 13, 'button', 'Menus_delete', NULL, NULL, '删除', NULL, 3, 1, 0, 0, 0, NULL, 0, 0, NULL, 0, NULL, 0, 'delete', '2025-11-17 19:48:05', '2025-11-17 19:48:05', NULL, NULL),
(17, 7, 'menu', 'UserConsole', 'console', '/user/dashboard/console', '控制台', 'ri:home-smile-2-line', 1, 1, 0, 0, 0, NULL, 0, 0, NULL, 1, NULL, 0, NULL, '2025-11-17 19:48:23', '2025-11-17 19:48:23', NULL, NULL),
(18, 13, 'button', 'Menus_add', NULL, NULL, '新增', NULL, 1, 1, 0, 0, 0, NULL, 0, 0, NULL, 0, NULL, 0, 'add', '2025-11-17 19:48:23', '2025-11-17 19:48:23', NULL, NULL),
(19, 3, 'menu', 'SystemApiDocMenu', 'menu', '/system/dashboard/api-docs/menu', '菜单管理', 'ri:menu-line', 4, 1, 0, 0, 1, NULL, 0, 0, NULL, 0, NULL, 0, NULL, '2025-11-17 23:41:44', '2025-11-17 23:41:44', NULL, NULL),
(20, NULL, 'menu', 'Blockchain', '/blockchain', '/index/index', '区块链', 'ri:home-line', 3, 1, 0, 0, 1, '', 0, 0, '', 0, '', 0, NULL, '2025-11-18 00:54:19', '2025-11-18 21:54:51', 1, 1),
(21, 20, 'menu', 'EvmChain', 'evmchain', '/blockchain/evmchain', 'EVM链', 'ri:bitcoin-line', 1, 1, 0, 0, 1, '', 0, 0, '', 0, '', 0, NULL, '2025-11-18 14:27:27', '2025-11-18 20:59:29', NULL, 1),
(26, 20, 'MENU', 'WalletMonitoring', 'wallet-monitoring', '/blockchain/wallet-monitoring/index', 'EVM钱包监控', 'ri:wallet-3-line', 2, 1, 0, 0, 1, NULL, 0, 0, NULL, 0, NULL, 0, NULL, '2025-11-19 20:41:11', '2025-11-19 20:41:11', NULL, NULL);

-- ========================================
-- Table: menu_roles
-- ========================================
DROP TABLE IF EXISTS `menu_roles`;
CREATE TABLE `menu_roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `menu_id` int NOT NULL,
  `role_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `menu_id` (`menu_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `menu_roles_ibfk_1` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`) ON DELETE CASCADE,
  CONSTRAINT `menu_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `menu_roles` VALUES 
(5, 7, 2, '2025-11-17 19:48:45'),
(7, 10, 2, '2025-11-17 19:48:45'),
(12, 17, 2, '2025-11-17 19:48:45'),
(15, 9, 2, '2025-11-17 19:48:45'),
(24, 7, 3, '2025-11-18 00:04:44'),
(25, 17, 3, '2025-11-18 00:04:44'),
(26, 12, 3, '2025-11-18 00:04:44'),
(27, 9, 3, '2025-11-18 00:04:44'),
(58, 1, 1, '2025-11-18 14:28:21'),
(59, 2, 1, '2025-11-18 14:28:21'),
(60, 3, 1, '2025-11-18 14:28:21'),
(61, 4, 1, '2025-11-18 14:28:21'),
(62, 5, 1, '2025-11-18 14:28:21'),
(63, 6, 1, '2025-11-18 14:28:21'),
(64, 19, 1, '2025-11-18 14:28:21'),
(65, 7, 1, '2025-11-18 14:28:21'),
(66, 17, 1, '2025-11-18 14:28:21'),
(67, 9, 1, '2025-11-18 14:28:21'),
(68, 10, 1, '2025-11-18 14:28:21'),
(69, 11, 1, '2025-11-18 14:28:21'),
(70, 12, 1, '2025-11-18 14:28:21'),
(71, 13, 1, '2025-11-18 14:28:21'),
(78, 21, 1, '2025-11-18 20:59:29'),
(79, 20, 1, '2025-11-18 21:54:51'),
(80, 20, 2, '2025-11-18 21:54:51'),
(81, 26, 1, '2025-11-19 20:41:56');

-- ========================================
-- Table: user_tags
-- ========================================
DROP TABLE IF EXISTS `user_tags`;
CREATE TABLE `user_tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `tag_name` varchar(50) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_tags_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `user_tags` VALUES 
(1, 1, '疯疯癫癫', '2025-11-17 17:47:18'),
(2, 1, '大长腿', '2025-11-17 17:47:18');

-- ========================================
-- Table: wallet_monitoring
-- ========================================
DROP TABLE IF EXISTS `wallet_monitoring`;
CREATE TABLE `wallet_monitoring` (
  `id` varchar(36) NOT NULL,
  `walletAddress` varchar(42) NOT NULL,
  `ownership` json DEFAULT NULL,
  `lastQueryTime` datetime DEFAULT NULL,
  `totalValue` decimal(20,2) DEFAULT 0,
  `mainChains` json DEFAULT NULL,
  `addressActivity` int DEFAULT 0,
  `activityTags` json DEFAULT NULL,
  `categoryTags` json DEFAULT NULL,
  `status` json DEFAULT NULL,
  `alertMark` json DEFAULT NULL,
  `remark` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `walletAddress` (`walletAddress`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `wallet_monitoring` VALUES 
('6906673b-ef7e-47be-be42-9ec7704821cd', '0x1111111111111111111111111111111111111111', '[\"导入测试\", \"个人\"]', NULL, 0.00, '[]', 0, '[\"DeFi\", \"Trading\"]', '[]', '[\"活跃\"]', '[]', '导入测试钱包1', '2025-11-19 21:14:17', '2025-11-19 21:14:17'),
('7bd7a83f-c542-11f0-8ec2-20906f3fe187', '0xB23c45E67fA90123bCdE4567aBcD8901eF234567', '[\"个人\"]', '2025-10-20 10:00:00', 122.00, '[\"BASE\", \"ARB\", \"OP\", \"LINEA\"]', 365, '[\"L0\", \"BASE\"]', '[\"已归集\"]', '[\"休眠中\"]', '[\"正常\"]', '每周查询一次', '2025-11-19 20:22:58', '2025-11-19 20:22:58'),
('7bd7ae59-c542-11f0-8ec2-20906f3fe187', '0xD45e67A89bC34567dEfA0123aBcD6789eF012345', '[\"外部\"]', '2025-10-20 10:00:00', 144.00, '[\"ETH\", \"ARB\"]', 180, '[\"ZKS\"]', '[\"女巫号\"]', '[\"休眠中\"]', '[\"异常交互\"]', '', '2025-11-19 20:22:58', '2025-11-19 20:22:58'),
('7bd7afaa-c542-11f0-8ec2-20906f3fe187', '0xA12b34C56dE78F90aBcD1234eF5678aBcD123456', '[\"团队\"]', '2025-10-20 10:00:00', 155.00, '[\"OP\", \"LINEA\"]', 1, '[\"L0\", \"ZKS\"]', '[\"精品号\"]', '[\"进行中\"]', '[\"正常\"]', '', '2025-11-19 20:22:58', '2025-11-19 20:22:58'),
('86d52921-d785-4230-aed4-31848ee042dd', '0x3333333333333333333333333333333333333333', '[\"测试导入\", \"个人\"]', NULL, 25000.00, '[\"Ethereum\", \"Polygon\"]', 120, '[\"DeFi\", \"Staking\"]', '[\"投资\"]', '[\"活跃\"]', '[\"需关注\"]', '正确列名测试钱包1', '2025-11-19 21:24:09', '2025-11-20 08:48:26'),
('9fb6c125-52c3-45f5-8c1c-5684954c5ba2', '0x4444444444444444444444444444444444444444', '[\"测试导入\", \"团队\"]', NULL, 45000.00, '[\"Arbitrum\", \"Optimism\"]', 200, '[\"Trading\", \"NFT\"]', '[\"交易\", \"收藏\"]', '[\"监控中\"]', '[\"正常\"]', '编辑测试 - 功能验证成功', '2025-11-19 21:24:09', '2025-11-19 21:30:20'),
('a66f750d-3c13-483b-b3de-95450142fefa', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1', '[\"个人\"]', NULL, 15000.50, '[\"ETH\", \"ARB\"]', 365, '[\"活跃\", \"高频\"]', '[\"DeFi\", \"NFT\"]', '[\"正常\"]', '[]', '测试钱包1', '2025-11-19 21:05:58', '2025-11-19 21:05:58'),
('cf260fb7-0352-4a63-ad2e-5b6817c3239c', '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed', '[\"外部\"]', NULL, 8500.00, '[\"POLYGON\", \"BSC\"]', 90, '[\"休眠\"]', '[\"GameFi\"]', '[\"已归档\"]', '[]', '测试钱包3', '2025-11-19 21:05:58', '2025-11-19 21:05:58'),
('ee5d8d5b-76a7-4a23-b235-2f5303d2b964', '0x9999999999999999999999999999999999999999', '[]', NULL, 88888.88, '[]', 999, '[]', '[]', '[]', '[]', '新增功能测试钱包', '2025-11-19 21:31:19', '2025-11-19 21:31:19'),
('fdb92851-7eb0-4059-8855-dfc708849195', '0x8Ba1f109551bD432803012645Ac136ddd64DBA72', '[\"团队\"]', NULL, 50000.00, '[\"ETH\", \"BASE\", \"OP\"]', 180, '[\"活跃\"]', '[\"交易\", \"DeFi\"]', '[\"监控中\"]', '[\"需关注\"]', '测试钱包2', '2025-11-19 21:05:58', '2025-11-19 21:05:58');

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- Backup completed successfully
-- Total tables: 6
-- Total records: 66
-- ========================================
