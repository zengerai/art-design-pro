import { RowDataPacket, PoolConnection } from 'mysql2/promise'

/**
 * 驼峰命名转下划线命名
 */
export function camelToSnake(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
      result[snakeKey] = obj[key]
    }
  }
  return result
}

/**
 * 下划线命名转驼峰命名
 */
export function snakeToCamel(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      result[camelKey] = obj[key]
    }
  }
  return result
}

/**
 * 布尔值转整型
 */
export function convertBooleanToInt(obj: Record<string, any>): Record<string, any> {
  const booleanFields = [
    'enabled',
    'isHide',
    'isHideTab',
    'keepAlive',
    'isIframe',
    'showBadge',
    'fixedTab',
    'isFullPage'
  ]

  const result = { ...obj }
  for (const field of booleanFields) {
    if (typeof result[field] === 'boolean') {
      result[field] = result[field] ? 1 : 0
    }
  }
  return result
}

/**
 * 整型转布尔值
 */
export function convertIntToBoolean(obj: Record<string, any>): Record<string, any> {
  const booleanFields = [
    'enabled',
    'is_hide',
    'is_hide_tab',
    'keep_alive',
    'is_iframe',
    'show_badge',
    'fixed_tab',
    'is_full_page'
  ]

  const result = { ...obj }
  for (const field of booleanFields) {
    if (result[field] === 0 || result[field] === 1) {
      result[field] = result[field] === 1
    }
  }
  return result
}

/**
 * 构建菜单树形结构
 */
export function buildMenuTree(flatList: any[]): any[] {
  const map: Record<number, any> = {}
  const tree: any[] = []

  // 创建映射表并初始化 children
  for (const item of flatList) {
    map[item.id] = { ...item, children: [] }
  }

  // 建立父子关系
  for (const item of flatList) {
    if (item.parentId === null || item.parentId === undefined) {
      tree.push(map[item.id])
    } else {
      const parent = map[item.parentId]
      if (parent) {
        if (item.menuType === 'button') {
          // 按钮类型转为 authList
          if (!parent.meta) {
            parent.meta = {}
          }
          if (!parent.meta.authList) {
            parent.meta.authList = []
          }
          parent.meta.authList.push({
            title: item.title,
            authMark: item.authMark,
            sort: item.sort
          })
        } else {
          // 菜单类型添加到 children
          parent.children.push(map[item.id])
        }
      }
    }
  }

  // 递归排序
  function sortTree(nodes: any[]) {
    nodes.sort((a, b) => (a.sort || 0) - (b.sort || 0))
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        sortTree(node.children)
      }
      if (node.meta?.authList && node.meta.authList.length > 0) {
        node.meta.authList.sort((a: any, b: any) => (a.sort || 0) - (b.sort || 0))
      }
    }
  }

  sortTree(tree)

  // 清理空 children
  function cleanEmptyChildren(nodes: any[]) {
    for (const node of nodes) {
      if (node.children && node.children.length === 0) {
        delete node.children
      } else if (node.children) {
        cleanEmptyChildren(node.children)
      }
    }
  }

  cleanEmptyChildren(tree)

  return tree
}

/**
 * 递归获取所有子菜单ID（用于级联删除）
 */
export async function getChildMenuIds(
  menuId: number,
  connection: PoolConnection
): Promise<number[]> {
  const ids: number[] = [menuId]

  const [children] = await connection.execute<RowDataPacket[]>(
    'SELECT id FROM menus WHERE parent_id = ?',
    [menuId]
  )

  for (const child of children) {
    const childIds = await getChildMenuIds(child.id, connection)
    ids.push(...childIds)
  }

  return ids
}
