#!/bin/bash

# ===========================================
# 菜单管理功能快速部署脚本
# ===========================================
# 使用说明：
# 1. 确保已创建数据库表
# 2. 赋予执行权限：chmod +x quick-setup.sh
# 3. 执行脚本：./quick-setup.sh
# ===========================================

set -e  # 遇到错误立即退出

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="/Users/yy/walletPro/art-design-pro"

echo -e "${GREEN}=======================================${NC}"
echo -e "${GREEN}  菜单管理功能快速部署脚本${NC}"
echo -e "${GREEN}=======================================${NC}"
echo ""

# 步骤1：检查数据库表
echo -e "${YELLOW}[步骤1/6] 检查数据库表...${NC}"
read -p "数据库表已创建？(y/n): " db_created
if [ "$db_created" != "y" ]; then
    echo -e "${RED}请先创建数据库表！${NC}"
    echo "执行以下SQL脚本："
    echo "mysql -u root -p < $PROJECT_ROOT/scripts/init-database.sql"
    exit 1
fi
echo -e "${GREEN}✓ 数据库表检查通过${NC}"
echo ""

# 步骤2：创建后端工具函数
echo -e "${YELLOW}[步骤2/6] 创建后端工具函数...${NC}"
UTIL_FILE="$PROJECT_ROOT/backend/src/utils/menu.util.ts"

if [ -f "$UTIL_FILE" ]; then
    read -p "文件已存在，是否覆盖？(y/n): " overwrite
    if [ "$overwrite" != "y" ]; then
        echo "跳过创建工具函数"
    else
        echo "请手动从文档中复制代码到: $UTIL_FILE"
    fi
else
    echo "请手动创建文件并复制代码到: $UTIL_FILE"
fi
echo ""

# 步骤3：创建后端控制器
echo -e "${YELLOW}[步骤3/6] 创建后端控制器...${NC}"
CONTROLLER_FILE="$PROJECT_ROOT/backend/src/controllers/menu.controller.ts"

if [ -f "$CONTROLLER_FILE" ]; then
    read -p "文件已存在，是否覆盖？(y/n): " overwrite
    if [ "$overwrite" != "y" ]; then
        echo "跳过创建控制器"
    else
        echo "请手动从文档中复制代码到: $CONTROLLER_FILE"
    fi
else
    echo "请手动创建文件并复制代码到: $CONTROLLER_FILE"
fi
echo ""

# 步骤4：创建后端路由
echo -e "${YELLOW}[步骤4/6] 创建后端路由...${NC}"
ROUTE_FILE="$PROJECT_ROOT/backend/src/routes/menu.routes.ts"

if [ -f "$ROUTE_FILE" ]; then
    read -p "文件已存在，是否覆盖？(y/n): " overwrite
    if [ "$overwrite" != "y" ]; then
        echo "跳过创建路由"
    else
        echo "请手动从文档中复制代码到: $ROUTE_FILE"
    fi
else
    echo "请手动创建文件并复制代码到: $ROUTE_FILE"
fi
echo ""

# 步骤5：提示修改主文件
echo -e "${YELLOW}[步骤5/6] 修改后端主文件...${NC}"
echo "请手动修改 backend/src/index.ts，添加以下内容："
echo ""
echo "// 在文件顶部添加："
echo "import menuRoutes from './routes/menu.routes.js'"
echo ""
echo "// 在路由注册部分添加："
echo "app.use(menuRoutes)"
echo ""
read -p "是否已完成修改？(y/n): " main_modified
echo ""

# 步骤6：前端集成提示
echo -e "${YELLOW}[步骤6/6] 前端代码集成...${NC}"
echo "请参考文档完成以下前端修改："
echo "1. src/api/system-manage.ts - 添加5个API函数"
echo "2. src/types/api/system-manage.d.ts - 添加类型定义"
echo "3. src/views/system/menu/index.vue - 修改页面逻辑"
echo ""
echo "详细步骤请查看: .qoder/quests/menu-management-frontend-guide.md"
echo ""

# 完成提示
echo -e "${GREEN}=======================================${NC}"
echo -e "${GREEN}  部署准备完成！${NC}"
echo -e "${GREEN}=======================================${NC}"
echo ""
echo "下一步操作："
echo "1. 检查后端代码是否正确复制"
echo "2. 完成前端代码集成"
echo "3. 启动后端服务: cd backend && pnpm dev"
echo "4. 启动前端服务: pnpm dev"
echo "5. 访问测试: http://localhost:3008/#/system/menu"
echo ""
echo "参考文档："
echo "- 后端实施指南: .qoder/quests/menu-management-implementation-guide.md"
echo "- 前端实施指南: .qoder/quests/menu-management-frontend-guide.md"
echo "- 实施检查清单: .qoder/quests/IMPLEMENTATION_CHECKLIST.md"
echo ""
echo -e "${GREEN}祝您实施顺利！${NC}"
