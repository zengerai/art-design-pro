import request from '@/utils/http'
import type { ViewStorage } from '@/types/view.d'

/**
 * 保存视图配置到服务器
 * @param params 视图配置参数
 */
export function saveViewConfig(params: { namespace: string; viewData: ViewStorage }) {
  return request.post({
    url: '/api/user/view-config',
    params
  })
}

/**
 * 从服务器加载视图配置
 * @param namespace 命名空间
 */
export function loadViewConfig(namespace: string) {
  return request.get<ViewStorage>({
    url: '/api/user/view-config',
    params: { namespace }
  })
}

/**
 * 同步所有视图配置到服务器
 */
export function syncAllViewConfigs() {
  return request.post({
    url: '/api/user/view-config/sync-all'
  })
}

/**
 * 获取用户所有命名空间的视图配置列表
 */
export function getAllViewConfigs() {
  return request.get<{ namespace: string; updatedAt: string }[]>({
    url: '/api/user/view-config/list'
  })
}

/**
 * 删除指定命名空间的视图配置
 * @param namespace 命名空间
 */
export function deleteViewConfig(namespace: string) {
  return request.del({
    url: '/api/user/view-config',
    params: { namespace }
  })
}
