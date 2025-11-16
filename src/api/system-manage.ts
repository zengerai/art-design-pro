import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'

// 获取用户列表
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  return request.get<Api.SystemManage.UserList>({
    url: '/api/user/list',
    params
  })
}

// 创建用户
export function fetchCreateUser(params: Api.SystemManage.CreateUserParams) {
  return request.post<{ userId: number }>({
    url: '/api/user',
    params,
    showSuccessMessage: true
  })
}

// 更新用户
export function fetchUpdateUser(id: number, params: Api.SystemManage.UpdateUserParams) {
  return request.put({
    url: `/api/user/${id}`,
    params,
    showSuccessMessage: true
  })
}

// 删除用户
export function fetchDeleteUser(id: number) {
  return request.del({
    url: `/api/user/${id}`,
    showSuccessMessage: true
  })
}

// 获取角色列表
export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return request.get<Api.SystemManage.RoleList>({
    url: '/api/role/list',
    params
  })
}

// 创建角色
export function fetchCreateRole(params: Api.SystemManage.CreateRoleParams) {
  return request.post<{ roleId: number }>({
    url: '/api/role',
    params,
    showSuccessMessage: true
  })
}

// 更新角色
export function fetchUpdateRole(id: number, params: Api.SystemManage.UpdateRoleParams) {
  return request.put({
    url: `/api/role/${id}`,
    params,
    showSuccessMessage: true
  })
}

// 删除角色
export function fetchDeleteRole(id: number) {
  return request.del({
    url: `/api/role/${id}`,
    showSuccessMessage: true
  })
}

// 获取菜单列表
export function fetchGetMenuList() {
  return request.get<AppRouteRecord[]>({
    url: '/api/v3/system/menus'
  })
}
