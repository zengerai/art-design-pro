import request from '@/utils/http'

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

// 重置用户密码
export function fetchResetPassword(id: number) {
  return request.put({
    url: `/api/user/${id}/reset-password`,
    showSuccessMessage: true
  })
}

// 获取当前用户个人信息
export function fetchGetProfile() {
  return request.get<Api.SystemManage.UserProfile>({
    url: '/api/user/profile'
  })
}

// 更新当前用户个人信息
export function fetchUpdateProfile(params: Api.SystemManage.UpdateProfileParams) {
  return request.put({
    url: '/api/user/profile',
    params,
    showSuccessMessage: true
  })
}

// 修改当前用户密码
export function fetchChangePassword(params: Api.SystemManage.ChangePasswordParams) {
  return request.post({
    url: '/api/user/password',
    params,
    showSuccessMessage: true
  })
}

// 更新当前用户标签
export function fetchUpdateTags(tags: string[]) {
  return request.post({
    url: '/api/user/tags',
    params: { tags },
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

// 获取角色的菜单权限
export function fetchGetRoleMenus(roleId: number) {
  return request.get<number[]>({
    url: `/api/role/${roleId}/menus`
  })
}

// 更新角色的菜单权限
export function fetchUpdateRoleMenus(roleId: number, menuIds: number[]) {
  return request.put({
    url: `/api/role/${roleId}/menus`,
    params: { menuIds },
    showSuccessMessage: true
  })
}

// ===== 菜单管理 API =====

// 获取菜单列表（树形结构）
export function fetchGetMenuTree(params?: { enabledOnly?: boolean }) {
  return request.get<Api.SystemManage.MenuTreeItem[]>({
    url: '/api/menus',
    params: { mode: 'tree', ...params }
  })
}

// 获取菜单列表（分页）
export function fetchGetMenuList(params: Api.SystemManage.MenuSearchParams) {
  return request.get<Api.SystemManage.MenuList>({
    url: '/api/menus',
    params
  })
}

// 获取菜单详情
export function fetchGetMenuDetail(id: number) {
  return request.get<Api.SystemManage.MenuDetail>({
    url: `/api/menus/${id}`
  })
}

// 创建菜单
export function fetchCreateMenu(params: Api.SystemManage.CreateMenuParams) {
  return request.post<{ id: number }>({
    url: '/api/menus',
    params,
    showSuccessMessage: true
  })
}

// 更新菜单
export function fetchUpdateMenu(id: number, params: Api.SystemManage.UpdateMenuParams) {
  return request.put({
    url: `/api/menus/${id}`,
    params,
    showSuccessMessage: true
  })
}

// 删除菜单
export function fetchDeleteMenu(id: number) {
  return request.del({
    url: `/api/menus/${id}`,
    showSuccessMessage: true
  })
}
