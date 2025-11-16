import { AppRouteRecord } from '@/types/router'
// 新的工作台路由模块
import { systemDashboardRoutes } from './system-dashboard'
import { userDashboardRoutes } from './user-dashboard'
// 系统基础路由模块
import { systemRoutes } from './system'
// import { exceptionRoutes } from './exception' // 异常页面已注释

// 以下为模板示例路由模块，已注释
// import { dashboardRoutes } from './dashboard'
// import { templateRoutes } from './template'
// import { widgetsRoutes } from './widgets'
// import { examplesRoutes } from './examples'
// import { articleRoutes } from './article'
// import { resultRoutes } from './result'
// import { safeguardRoutes } from './safeguard'
// import { helpRoutes } from './help'

/**
 * 导出所有模块化路由
 */
export const routeModules: AppRouteRecord[] = [
  systemDashboardRoutes, // 系统后台管理员工作台
  userDashboardRoutes, // 用户工作台
  systemRoutes // 系统管理模块
  // 模板示例路由已注释
  // exceptionRoutes,     // 异常页面已注释
  // dashboardRoutes,
  // templateRoutes,
  // widgetsRoutes,
  // examplesRoutes,
  // articleRoutes,
  // resultRoutes,
  // safeguardRoutes,
  // ...helpRoutes
]
