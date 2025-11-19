import { AppRouteRecord } from '@/types/router'

/**
 * 区块链管理路由模块
 */
export const blockchainRoutes: AppRouteRecord = {
  name: 'Blockchain',
  path: '/blockchain',
  component: '/index/index',
  meta: {
    title: '区块链',
    icon: 'ri:navigation-line',
    sort: 4
  },
  children: [
    {
      name: 'EvmChain',
      path: 'evm-chain',
      component: '/blockchain/evm-chain/index',
      meta: {
        title: 'EVM链管理',
        icon: 'ri:link',
        keepAlive: true
      }
    }
  ]
}
