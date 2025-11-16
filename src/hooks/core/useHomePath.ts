/**
 * 首页路径管理组合式函数
 *
 * 根据用户角色动态计算和管理首页路径
 *
 * @module hooks/core/useHomePath
 */

import { computed, type ComputedRef } from 'vue'
import { useUserStore } from '@/store/modules/user'
import type { UserRole } from '@/types/common'

/**
 * 根据用户角色数组获取首页路径
 * @param roles 用户角色数组
 * @returns 首页路径
 */
export function getHomePathByRoles(roles: UserRole[] | undefined): string {
  if (!roles || roles.length === 0) {
    return '/auth/login'
  }

  // 优先级：R_SUPER > R_ADMIN > R_USER
  if (roles.includes('R_SUPER')) {
    return '/system/dashboard/console'
  }

  if (roles.includes('R_ADMIN') || roles.includes('R_USER')) {
    return '/user/dashboard/console'
  }

  // 默认返回登录页
  return '/auth/login'
}

/**
 * 首页路径管理组合式函数
 */
export function useHomePath() {
  const userStore = useUserStore()

  /**
   * 响应式首页路径
   * 根据用户角色自动计算
   */
  const homePath: ComputedRef<string> = computed(() => {
    const roles = userStore.getUserInfo.roles as UserRole[] | undefined
    return getHomePathByRoles(roles)
  })

  /**
   * 判断当前用户是否为系统后台管理员
   */
  const isSystemAdmin: ComputedRef<boolean> = computed(() => {
    const roles = userStore.getUserInfo.roles as UserRole[] | undefined
    return roles?.includes('R_SUPER') ?? false
  })

  /**
   * 判断当前用户是否为普通用户或管理员
   */
  const isNormalUser: ComputedRef<boolean> = computed(() => {
    const roles = userStore.getUserInfo.roles as UserRole[] | undefined
    return roles?.includes('R_ADMIN') || roles?.includes('R_USER') || false
  })

  return {
    /** 响应式首页路径 */
    homePath,
    /** 根据角色数组获取首页路径的静态方法 */
    getHomePathByRole: getHomePathByRoles,
    /** 是否为系统后台管理员 */
    isSystemAdmin,
    /** 是否为普通用户或管理员 */
    isNormalUser
  }
}
