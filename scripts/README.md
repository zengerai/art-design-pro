# 数据库初始化脚本使用说明

## 概述

本目录包含虚拟币数据分析系统的数据库初始化脚本，用于快速搭建项目所需的数据库环境。

## 文件说明

### init-database.sql

完整的数据库初始化脚本，包含：

- 创建数据库 `virtualProject_dev`
- 创建3张核心数据表（roles、users、user_tags）
- 插入预置角色数据
- 插入测试用户数据

## 使用方法

### 方法一：使用 MySQL 命令行

```bash
# 1. 连接到 MySQL 服务器
mysql -h gz-cdb-bgjuy46f.sql.tencentcdb.com -P 23981 -u root -p

# 2. 执行初始化脚本
source /path/to/scripts/init-database.sql

# 或者一步执行
mysql -h gz-cdb-bgjuy46f.sql.tencentcdb.com -P 23981 -u root -p < scripts/init-database.sql
```

### 方法二：使用 MySQL Workbench 或其他图形化工具

1. 打开 MySQL Workbench
2. 连接到数据库服务器
3. 打开 `init-database.sql` 文件
4. 执行脚本

### 方法三：使用 Node.js 代码执行

```typescript
import mysql from 'mysql2/promise'
import fs from 'fs'

async function initDatabase() {
  const connection = await mysql.createConnection({
    host: 'gz-cdb-bgjuy46f.sql.tencentcdb.com',
    port: 23981,
    user: 'root',
    password: 'YourNewPassword123!',
    multipleStatements: true
  })

  const sql = fs.readFileSync('./scripts/init-database.sql', 'utf8')
  await connection.query(sql)
  await connection.end()

  console.log('数据库初始化完成！')
}

initDatabase()
```

## 数据库配置

从 `.env.development` 文件中读取配置：

```env
DB_HOST=gz-cdb-bgjuy46f.sql.tencentcdb.com
DB_PORT=23981
DB_USER=root
DB_PASSWORD=YourNewPassword123!
DB_NAME=virtualProject_dev
```

## 数据表结构

### 1. roles（角色表）

存储系统角色信息，包含：

- 角色ID、名称、编码
- 控制台跳转路径
- 状态和时间戳

**预置角色：**

- R_SUPER：系统后台管理员
- R_ADMIN：系统管理员
- R_USER：系统用户

### 2. users（用户表）

存储用户基本信息和认证数据，包含：

- 用户ID、用户名、密码
- 个人资料（姓名、邮箱、手机等）
- 角色关联、状态和时间戳

**预置测试账号：** | 用户名 | 密码 | 角色 | 控制台路径 | |--------|--------|----------|---------------------------| | Super | 123456 | R_SUPER | /system/dashboard/console | | Admin | 123456 | R_ADMIN | /user/dashboard/console | | User | 123456 | R_USER | /user/dashboard/console |

### 3. user_tags（用户标签表）

存储用户个性化标签，包含：

- 标签ID、用户ID、标签名称
- 创建时间

## 注意事项

1. **密码加密**：脚本中的密码是 bcrypt 加密后的值，对应明文密码 `123456`
2. **外键约束**：users 表与 roles 表通过 role_id 关联
3. **级联删除**：删除用户时会自动删除该用户的所有标签
4. **字符集**：所有表使用 utf8mb4 字符集，支持 emoji 等特殊字符
5. **时间戳**：created_at 和 updated_at 字段自动维护

## 重新初始化

如果需要重新初始化数据库（**警告：会删除所有数据**）：

```bash
# 删除数据库
DROP DATABASE IF EXISTS virtualProject_dev;

# 重新执行初始化脚本
source scripts/init-database.sql
```

## 环境说明

- **开发环境**：virtualProject_dev
- **测试环境**：可创建 virtualProject_test
- **生产环境**：可创建 virtualProject_prod

建议为不同环境使用不同的数据库名称。

## 验证安装

执行以下 SQL 验证数据是否正确初始化：

```sql
-- 切换数据库
USE virtualProject_dev;

-- 查看所有表
SHOW TABLES;

-- 查看用户和角色数据
SELECT
  u.id,
  u.username,
  u.real_name,
  r.role_name,
  r.role_code
FROM users u
JOIN roles r ON u.role_id = r.id;
```

预期输出应包含3个用户和对应的角色信息。

## 故障排查

### 问题：无法连接数据库

**解决方案：**

- 检查网络连接
- 验证数据库服务器地址和端口
- 确认用户名和密码正确

### 问题：外键约束错误

**解决方案：**

- 确保按顺序执行脚本（先创建 roles 表，再创建 users 表）
- 检查 MySQL 版本是否支持 InnoDB 引擎

### 问题：字符集问题

**解决方案：**

- 确保 MySQL 服务器支持 utf8mb4
- 检查客户端连接的字符集设置

## 更新日志

- 2024-11-16：初始版本
  - 创建数据库初始化脚本
  - 包含3张核心表
  - 添加预置数据
