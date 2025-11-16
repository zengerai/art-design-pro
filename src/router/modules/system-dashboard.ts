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
    },
    {
      path: 'api-docs',
      name: 'SystemApiDocs',
      component: '',
      meta: {
        title: 'menus.systemDashboard.apiDocs.title',
        icon: 'ri:file-list-3-line',
        roles: ['R_SUPER'],
        keepAlive: true
      },
      children: [
        {
          path: 'auth',
          name: 'SystemApiDocAuth',
          component: '/system/dashboard/api-docs/auth',
          meta: {
            title: 'menus.systemDashboard.apiDocs.auth',
            icon: 'ri:shield-keyhole-line',
            roles: ['R_SUPER'],
            keepAlive: true
          }
        },
        {
          path: 'user',
          name: 'SystemApiDocUser',
          component: '/system/dashboard/api-docs/user',
          meta: {
            title: 'menus.systemDashboard.apiDocs.user',
            icon: 'ri:user-line',
            roles: ['R_SUPER'],
            keepAlive: true
          }
        },
        {
          path: 'role',
          name: 'SystemApiDocRole',
          component: '/system/dashboard/api-docs/role',
          meta: {
            title: 'menus.systemDashboard.apiDocs.role',
            icon: 'ri:user-settings-line',
            roles: ['R_SUPER'],
            keepAlive: true
          }
        }
      ]
    }
  ]
}
