import { AppRouteRecord } from '@/types/router'

/**
 * 用户工作台路由模块
 * 供系统管理员（R_ADMIN）和普通用户（R_USER）访问
 */
export const userDashboardRoutes: AppRouteRecord = {
  name: 'UserDashboard',
  path: '/user/dashboard',
  component: '/index/index',
  meta: {
    title: '工作台',
    icon: 'ri:dashboard-line',
    roles: ['R_ADMIN', 'R_USER']
  },
  children: [
    {
      path: 'console',
      name: 'UserConsole',
      component: '/user/dashboard/console',
      meta: {
        title: '控制台',
        icon: 'ri:home-smile-2-line',
        keepAlive: false,
        fixedTab: true
      }
    }
  ]
}
