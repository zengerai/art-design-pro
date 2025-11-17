import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import {
  getMenuList,
  getMenuDetail,
  createMenu,
  updateMenu,
  deleteMenu
} from '../controllers/menu.controller.js'

const router = Router()

// 所有菜单路由都需要认证
router.use(authenticate)

// 获取菜单列表（支持树形和分页两种模式）
// GET /api/menus?mode=tree&enabledOnly=true
// GET /api/menus?page=1&pageSize=10&keyword=xxx&menuType=menu
router.get('/', getMenuList)

// 获取菜单详情
router.get('/:id', getMenuDetail)

// 创建菜单（仅管理员）
router.post('/', createMenu)

// 更新菜单（仅管理员）
router.put('/:id', updateMenu)

// 删除菜单（仅管理员，级联删除）
router.delete('/:id', deleteMenu)

export default router
