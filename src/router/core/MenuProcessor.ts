/**
 * 菜单处理器
 *
 * 负责菜单数据的获取、过滤和处理
 *
 * @module router/core/MenuProcessor
 * @author Art Design Pro Team
 */

import type { AppRouteRecord } from '@/types/router'
import { useUserStore } from '@/store/modules/user'
import { useAppMode } from '@/hooks/core/useAppMode'
import { asyncRoutes } from '../routes/asyncRoutes'
import { RoutesAlias } from '../routesAlias'
import { formatMenuTitle } from '@/utils'

export class MenuProcessor {
  /**
   * 获取菜单数据
   */
  async getMenuList(): Promise<AppRouteRecord[]> {
    const { isFrontendMode } = useAppMode()

    let menuList: AppRouteRecord[]
    if (isFrontendMode.value) {
      menuList = await this.processFrontendMenu()
    } else {
      menuList = await this.processBackendMenu()
    }

    // 在规范化路径之前，验证原始路径配置
    this.validateMenuPaths(menuList)

    // 规范化路径（将相对路径转换为完整路径）
    return this.normalizeMenuPaths(menuList)
  }

  /**
   * 处理前端控制模式的菜单
   */
  private async processFrontendMenu(): Promise<AppRouteRecord[]> {
    const userStore = useUserStore()
    const roles = userStore.info?.roles
    const menuPermissions = userStore.info?.menuPermissions // 用户有权限的菜单名称列表

    let menuList = [...asyncRoutes]

    // 优先使用 menuPermissions 进行菜单过滤（基于数据库权限配置）
    if (menuPermissions && menuPermissions.length > 0) {
      console.log('🔑 使用数据库菜单权限过滤:', menuPermissions)
      menuList = this.filterMenuByPermissions(menuList, menuPermissions)
    }
    // 否则使用角色过滤（兼容旧逻辑）
    else if (roles && roles.length > 0) {
      console.log('⚠️ 使用角色过滤（旧逻辑）:', roles)
      menuList = this.filterMenuByRoles(menuList, roles)
    }

    return this.filterEmptyMenus(menuList)
  }

  /**
   * 处理后端控制模式的菜单
   * 从后端接口加载菜单数据
   */
  private async processBackendMenu(): Promise<AppRouteRecord[]> {
    try {
      const { fetchGetUserMenus } = await import('@/api/system-manage')
      const menuList = await fetchGetUserMenus()

      console.log('🔑 使用后端菜单模式，从数据库加载菜单')

      // 转换后端数据为前端路由格式
      return this.transformBackendMenuToRoutes(menuList)
    } catch (error) {
      console.error('获取后端菜单失败:', error)
      return []
    }
  }

  /**
   * 转换后端菜单数据为前端路由格式
   */
  private transformBackendMenuToRoutes(menuList: any[]): AppRouteRecord[] {
    return menuList.map((item) => {
      const route: AppRouteRecord = {
        id: item.id,
        name: item.name,
        path: item.path,
        component: item.component,
        meta: {
          ...item.meta,
          // 确保 icon 字段正确传递
          icon: item.meta?.icon || item.icon
        },
        _backendId: item.id,
        parentId: item.parentId
      }

      // 递归处理子菜单
      if (item.children && item.children.length > 0) {
        route.children = this.transformBackendMenuToRoutes(item.children)
      }

      return route
    })
  }

  /**
   * 根据角色过滤菜单
   */
  private filterMenuByRoles(menu: AppRouteRecord[], roles: string[]): AppRouteRecord[] {
    return menu.reduce((acc: AppRouteRecord[], item) => {
      const itemRoles = item.meta?.roles
      const hasPermission = !itemRoles || itemRoles.some((role) => roles?.includes(role))

      if (hasPermission) {
        const filteredItem = { ...item }
        if (filteredItem.children?.length) {
          filteredItem.children = this.filterMenuByRoles(filteredItem.children, roles)
        }
        acc.push(filteredItem)
      }

      return acc
    }, [])
  }

  /**
   * 根据菜单权限列表过滤菜单（基于数据库配置）
   *
   * 核心改进：智能父菜单保留机制
   * - 当前菜单有权限：保留菜单（递归过滤子菜单）
   * - 当前菜单无权限但有子菜单：递归过滤子菜单
   *   - 若过滤后子菜单有结果：保留父菜单作为容器
   *   - 若过滤后子菜单为空：过滤掉父菜单
   * - 当前菜单无权限且无子菜单：过滤掉
   *
   * @param menu 菜单数组
   * @param menuPermissions 用户有权限的菜单名称列表
   */
  private filterMenuByPermissions(
    menu: AppRouteRecord[],
    menuPermissions: string[]
  ): AppRouteRecord[] {
    // 性能优化：将数组转为 Set，查找时间复杂度从 O(m) 降为 O(1)
    const permissionSet = new Set(menuPermissions)

    return menu.reduce((acc: AppRouteRecord[], item) => {
      // 检查当前菜单项是否在权限列表中
      const hasPermission = permissionSet.has(item.name as string)

      if (hasPermission) {
        // 情况1：当前菜单有权限，保留菜单
        const filteredItem = { ...item }
        // 递归处理子菜单
        if (filteredItem.children?.length) {
          filteredItem.children = this.filterMenuByPermissions(
            filteredItem.children,
            menuPermissions
          )
        }
        acc.push(filteredItem)
      } else if (item.children && item.children.length > 0) {
        // 情况2：当前菜单无权限但有子菜单，先递归过滤子菜单
        const filteredChildren = this.filterMenuByPermissions(item.children, menuPermissions)

        // 如果过滤后子菜单非空，保留父菜单作为容器
        if (filteredChildren.length > 0) {
          const filteredItem = { ...item }
          filteredItem.children = filteredChildren
          acc.push(filteredItem)

          // 开发环境输出日志，便于调试
          if (import.meta.env.DEV) {
            const menuName =
              typeof item.name === 'symbol' ? item.name.toString() : String(item.name)
            console.log(
              `[菜单过滤] 保留父菜单容器: ${menuName}, 子菜单数: ${filteredChildren.length}`
            )
          }
        }
      }
      // 情况3：当前菜单无权限且无子菜单，跳过（不添加到结果集）

      return acc
    }, [])
  }

  /**
   * 递归过滤空菜单项
   */
  private filterEmptyMenus(menuList: AppRouteRecord[]): AppRouteRecord[] {
    return menuList
      .map((item) => {
        // 如果有子菜单，先递归过滤子菜单
        if (item.children && item.children.length > 0) {
          const filteredChildren = this.filterEmptyMenus(item.children)
          return {
            ...item,
            children: filteredChildren
          }
        }
        return item
      })
      .filter((item) => {
        // 如果定义了 children 属性（即使是空数组），说明这是一个目录菜单，应该保留
        if ('children' in item) {
          return true
        }

        // 如果有外链或 iframe，保留
        if (item.meta?.isIframe === true || item.meta?.link) {
          return true
        }

        // 如果有有效的 component，保留
        if (item.component && item.component !== '' && item.component !== RoutesAlias.Layout) {
          return true
        }

        // 其他情况过滤掉
        return false
      })
  }

  /**
   * 验证菜单列表是否有效
   */
  validateMenuList(menuList: AppRouteRecord[]): boolean {
    return Array.isArray(menuList) && menuList.length > 0
  }

  /**
   * 规范化菜单路径
   * 将相对路径转换为完整路径，确保菜单跳转正确
   */
  private normalizeMenuPaths(menuList: AppRouteRecord[], parentPath = ''): AppRouteRecord[] {
    return menuList.map((item) => {
      // 构建完整路径
      const fullPath = this.buildFullPath(item.path || '', parentPath)

      // 递归处理子菜单
      const children = item.children?.length
        ? this.normalizeMenuPaths(item.children, fullPath)
        : item.children

      return {
        ...item,
        path: fullPath,
        children
      }
    })
  }

  /**
   * 验证菜单路径配置
   * 检测非一级菜单是否错误使用了 / 开头的路径
   */
  /**
   * 验证菜单路径配置
   * 检测非一级菜单是否错误使用了 / 开头的路径
   */
  private validateMenuPaths(menuList: AppRouteRecord[], level = 1): void {
    menuList.forEach((route) => {
      if (!route.children?.length) return

      const parentName = String(route.name || route.path || '未知路由')

      route.children.forEach((child) => {
        const childPath = child.path || ''

        // 跳过合法的绝对路径：外部链接和 iframe 路由
        if (this.isValidAbsolutePath(childPath)) return

        // 检测非法的绝对路径
        if (childPath.startsWith('/')) {
          this.logPathError(child, childPath, parentName, level)
        }
      })

      // 递归检查更深层级的子路由
      this.validateMenuPaths(route.children, level + 1)
    })
  }

  /**
   * 判断是否为合法的绝对路径
   */
  private isValidAbsolutePath(path: string): boolean {
    return (
      path.startsWith('http://') ||
      path.startsWith('https://') ||
      path.startsWith('/outside/iframe/')
    )
  }

  /**
   * 输出路径配置错误日志
   */
  private logPathError(
    route: AppRouteRecord,
    path: string,
    parentName: string,
    level: number
  ): void {
    const routeName = String(route.name || path || '未知路由')
    const menuTitle = route.meta?.title || routeName
    const suggestedPath = path.split('/').pop() || path.slice(1)

    console.error(
      `[路由配置错误] 菜单 "${formatMenuTitle(menuTitle)}" (name: ${routeName}, path: ${path}) 配置错误\n` +
        `  位置: ${parentName} > ${routeName}\n` +
        `  问题: ${level + 1}级菜单的 path 不能以 / 开头\n` +
        `  当前配置: path: '${path}'\n` +
        `  应该改为: path: '${suggestedPath}'`
    )
  }

  /**
   * 构建完整路径
   */
  private buildFullPath(path: string, parentPath: string): string {
    if (!path) return ''

    // 外部链接直接返回
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }

    // 如果已经是绝对路径，直接返回
    if (path.startsWith('/')) {
      return path
    }

    // 拼接父路径和当前路径
    if (parentPath) {
      // 移除父路径末尾的斜杠，移除子路径开头的斜杠，然后拼接
      const cleanParent = parentPath.replace(/\/$/, '')
      const cleanChild = path.replace(/^\//, '')
      return `${cleanParent}/${cleanChild}`
    }

    // 没有父路径，添加前导斜杠
    return `/${path}`
  }
}
