# 数据库备份说明

## 备份信息

- **备份时间**: 2025-11-20
- **备份文件**: `database_backup_20251120.sql`
- **数据库**: art-design-pro
- **备份工具**: MCP MySQL

## 备份内容

### 数据库表统计

| 表名              | 记录数 | 说明                              |
| ----------------- | ------ | --------------------------------- |
| roles             | 4      | 角色表 - 系统角色信息             |
| users             | 3      | 用户表 - 用户基本信息             |
| menus             | 19     | 菜单表 - 系统菜单和按钮权限       |
| menu_roles        | 26     | 菜单角色关联表 - 角色菜单权限映射 |
| user_tags         | 2      | 用户标签表 - 用户个性化标签       |
| wallet_monitoring | 10     | 钱包监控表 - EVM钱包监控数据      |

**总计**: 6个表，64条记录

## 表结构说明

### 1. roles (角色表)

- 主键: `id`
- 唯一键: `role_code`
- 包含字段: 角色名称、角色代码、仪表板路径、描述、启用状态等
- 默认角色: R_SUPER(超级管理员)、R_ADMIN(系统管理员)、R_USER(普通用户)

### 2. users (用户表)

- 主键: `id`
- 唯一键: `username`
- 外键: `role_id` -> `roles(id)`
- 包含字段: 用户名、密码(加密)、真实姓名、昵称、头像、性别、邮箱、手机、地址、描述、角色ID、状态、最后登录时间/IP等

### 3. menus (菜单表)

- 主键: `id`
- 外键: `parent_id` -> `menus(id)` (自关联)
- 菜单类型: menu(菜单)、button(按钮)
- 包含字段: 父级ID、菜单类型、名称、路径、组件、标题、图标、排序、各种显示控制标志等

### 4. menu_roles (菜单角色关联表)

- 主键: `id`
- 外键:
  - `menu_id` -> `menus(id)` (级联删除)
  - `role_id` -> `roles(id)` (级联删除)
- 实现角色与菜单的多对多关联

### 5. user_tags (用户标签表)

- 主键: `id`
- 外键: `user_id` -> `users(id)` (级联删除)
- 存储用户的个性化标签

### 6. wallet_monitoring (钱包监控表)

- 主键: `id` (UUID)
- 唯一键: `walletAddress`
- JSON字段: ownership、mainChains、activityTags、categoryTags、status、alertMark
- 用于EVM区块链钱包监控数据

## 恢复数据库

### 方式一：使用 MySQL 命令行

```bash
# 先创建数据库(如果不存在)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS art_design_pro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 导入备份文件
mysql -u root -p art_design_pro < backup/database_backup_20251120.sql
```

### 方式二：使用 MySQL Workbench

1. 打开 MySQL Workbench
2. 连接到数据库服务器
3. 选择 File -> Run SQL Script
4. 选择备份文件 `database_backup_20251120.sql`
5. 选择目标数据库
6. 点击 Run 执行

### 方式三：使用 phpMyAdmin

1. 登录 phpMyAdmin
2. 选择目标数据库
3. 点击"导入"选项卡
4. 选择备份文件
5. 点击"执行"

## 注意事项

1. **外键约束**: 备份文件中已包含 `SET FOREIGN_KEY_CHECKS = 0/1`，确保导入顺序不会引起外键错误
2. **数据覆盖**: 恢复时会先删除现有表(`DROP TABLE IF EXISTS`)，请谨慎操作
3. **字符集**: 所有表使用 `utf8mb4` 字符集，支持完整的Unicode字符
4. **密码安全**: users表中的密码已经过bcrypt加密
5. **JSON字段**: wallet_monitoring表包含多个JSON字段，需要MySQL 5.7+版本

## 备份策略建议

- **日常备份**: 建议每天自动备份一次
- **重要操作前**: 在进行数据迁移、大量修改前务必备份
- **版本管理**: 保留最近7天的备份文件
- **异地存储**: 建议将备份文件存储到云存储服务

## 定期备份脚本

可以创建一个定时任务来自动备份：

```bash
#!/bin/bash
# 设置变量
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/Users/yy/walletPro/art-design-pro/backup"
DB_NAME="art_design_pro"
DB_USER="root"
DB_PASS="your_password"

# 创建备份
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# 删除7天前的备份
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql"
```

## 联系信息

如有任何问题，请联系系统管理员。
