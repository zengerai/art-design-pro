import express from 'express'
import {
  getWalletList,
  createWallet,
  batchCreateWallet,
  updateWallet,
  batchUpdateWallet,
  deleteWallet
} from '../controllers/wallet.controller'

const router = express.Router()

// 查询钱包列表
router.post('/query', getWalletList)

// 创建钱包记录
router.post('/create', createWallet)

// 批量创建钱包记录
router.post('/batchCreate', batchCreateWallet)

// 更新钱包记录
router.put('/update', updateWallet)

// 批量更新钱包记录
router.post('/batchUpdate', batchUpdateWallet)

// 删除钱包记录
router.delete('/delete/:walletAddress', deleteWallet)

export default router
