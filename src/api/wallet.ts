import request from '@/utils/http'

/**
 * 查询钱包列表（支持懒加载）
 * @param params 查询参数
 * @returns 钱包列表响应
 */
export function fetchWalletList(params: Api.Wallet.QueryParams) {
  return request.post<Api.Wallet.WalletListResponse>({
    url: '/api/wallet/query',
    params
  })
}

/**
 * 创建钱包记录
 * @param params 创建参数
 * @returns 创建的钱包记录
 */
export function createWallet(params: Api.Wallet.CreateWalletParams) {
  return request.post<Api.Wallet.WalletRecord>({
    url: '/api/wallet/create',
    params,
    showSuccessMessage: true
  })
}

/**
 * 批量创建钱包记录（用于 Excel 导入）
 * @param wallets 钱包数据列表
 * @returns 批量创建结果
 */
export function batchCreateWallet(wallets: Api.Wallet.CreateWalletParams[]) {
  return request.post<{ count: number }>({
    url: '/api/wallet/batchCreate',
    params: { wallets },
    showSuccessMessage: true
  })
}

/**
 * 更新钱包记录
 * @param params 更新参数
 * @returns 更新的钱包记录
 */
export function updateWallet(params: Api.Wallet.UpdateWalletParams) {
  return request.put<Api.Wallet.WalletRecord>({
    url: '/api/wallet/update',
    params,
    showSuccessMessage: true
  })
}

/**
 * 批量更新钱包记录
 * @param params 批量更新参数
 * @returns 批量更新结果
 */
export function batchUpdateWallet(params: Api.Wallet.BatchUpdateParams) {
  return request.post<{ successCount: number; failedCount: number }>({
    url: '/api/wallet/batchUpdate',
    params,
    showSuccessMessage: true
  })
}

/**
 * 删除钱包记录
 * @param walletAddress 钱包地址
 * @returns 删除结果
 */
export function deleteWallet(walletAddress: string) {
  return request.del<{ success: boolean }>({
    url: `/api/wallet/delete/${walletAddress}`,
    showSuccessMessage: true
  })
}
