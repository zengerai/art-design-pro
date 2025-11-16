import { AppRouteRecord } from '@/types/router'

/**
 * 系统后台管理员工作台路由模块
 * 仅供系统后台管理员（R_SUPER）访问
 */
export const systemDashboardRoutes: AppRouteRecord = {
  name: 'SystemDashboard',
  path: '/system/dashboard',
  component: '/index/index',
  meta: {
    title: '系统管理工作台',
    icon: 'ri:dashboard-line',
    roles: ['R_SUPER']
  },
  children: [
    {
      path: 'console',
      name: 'SystemConsole',
      component: '/system/dashboard/console',
      meta: {
        title: '控制台',
        icon: 'ri:home-smile-2-line',
        keepAlive: false,
        fixedTab: true
      }
    }
  ]
}
