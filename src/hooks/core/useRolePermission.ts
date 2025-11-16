/**
 * 角色权限验证组合式函数
 *
 * 提供基于角色的权限验证功能
 *
 * @module hooks/core/useRolePermission
 */

import { computed, type ComputedRef } from 'vue'
import { useUserStore } from '@/store/modules/user'
import type { UserRole } from '@/types/common'

/**
 * 角色权限验证组合式函数
 */
export function useRolePermission() {
  const userStore = useUserStore()

  /**
   * 当前用户的角色列表
   */
  const currentRoles: ComputedRef<UserRole[]> = computed(() => {
    return (userStore.getUserInfo.roles as UserRole[]) || []
  })

  /**
   * 判断用户是否拥有指定角色
   * @param role 角色标识，可以是单个角色或角色数组
   * @returns 是否拥有角色
   */
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    const roles = currentRoles.value
    if (!roles || roles.length === 0) {
      return false
    }

    if (Array.isArray(role)) {
      // 如果传入的是数组，判断用户是否拥有其中任意一个角色
      return role.some((r) => roles.includes(r))
    } else {
      // 如果传入的是单个角色，判断用户是否拥有该角色
      return roles.includes(role)
    }
  }

  /**
   * 判断用户是否拥有任意一个指定角色
   * @param roles 角色数组
   * @returns 是否拥有任意一个角色
   */
  const hasAnyRole = (roles: UserRole[]): boolean => {
    const userRoles = currentRoles.value
    if (!userRoles || userRoles.length === 0) {
      return false
    }
    return roles.some((role) => userRoles.includes(role))
  }

  /**
   * 判断用户是否拥有所有指定角色
   * @param roles 角色数组
   * @returns 是否拥有所有角色
   */
  const hasAllRoles = (roles: UserRole[]): boolean => {
    const userRoles = currentRoles.value
    if (!userRoles || userRoles.length === 0) {
      return false
    }
    return roles.every((role) => userRoles.includes(role))
  }

  /**
   * 判断用户是否有权限访问指定路由
   * @param routeRoles 路由要求的角色列表，如果未定义则表示不需要角色验证
   * @returns 是否有权限访问
   */
  const canAccessRoute = (routeRoles?: UserRole[]): boolean => {
    // 如果路由没有定义角色要求，则允许访问
    if (!routeRoles || routeRoles.length === 0) {
      return true
    }

    // 判断用户是否拥有路由要求的任意一个角色
    return hasAnyRole(routeRoles)
  }

  return {
    /** 当前用户角色列表 */
    currentRoles,
    /** 判断是否拥有指定角色 */
    hasRole,
    /** 判断是否拥有任意一个角色 */
    hasAnyRole,
    /** 判断是否拥有所有角色 */
    hasAllRoles,
    /** 判断是否有权限访问路由 */
    canAccessRoute
  }
}
