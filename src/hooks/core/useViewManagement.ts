/**
 * 视图管理 Composable
 * 负责视图的 CRUD 操作、LocalStorage 持久化、视图切换等功能
 * 支持命名空间隔离，不同纵向视图的横向视图标签相互独立
 */

import { ref, computed, watch, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { HorizontalViewConfig, ViewStorage, ViewFormData, ViewFilter } from '@/types/view'

/** LocalStorage 基础键名 */
const STORAGE_KEY_PREFIX = 'wallet_monitoring_views'
const STORAGE_VERSION = '1.0.0'

/** 默认视图配置 */
const createDefaultView = (): HorizontalViewConfig => ({
  id: 'default-view',
  name: '全部钱包',
  type: 'horizontal',
  filterCondition: {},
  sortRules: [],
  visibleFields: [],
  isDefault: true,
  order: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})

/**
 * 生成唯一ID
 */
const generateId = (): string => {
  return `view_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 检查 LocalStorage 是否可用
 */
const checkStorageAvailable = (): boolean => {
  try {
    const testKey = '_storage_test_'
    const testData = 'test'
    localStorage.setItem(testKey, testData)
    const retrieved = localStorage.getItem(testKey)
    localStorage.removeItem(testKey)
    return retrieved === testData
  } catch {
    return false
  }
}

/**
 * 视图管理 Hook 参数
 */
export interface UseViewManagementOptions {
  /** 命名空间，用于隔离不同纵向视图的横向视图数据，支持响应式 */
  namespace?: Ref<string> | string
}

/**
 * 视图管理 Hook
 * @param options - 配置选项
 * @param options.namespace - 命名空间，默认为 'default'，不同命名空间的视图数据相互独立
 */
export function useViewManagement(options: UseViewManagementOptions = {}) {
  // 支持传入 ref 或普通字符串
  const namespaceInput = options.namespace || 'default'
  const namespace = ref(typeof namespaceInput === 'string' ? namespaceInput : namespaceInput.value)

  // 如果传入的是 ref，监听其变化
  if (typeof namespaceInput !== 'string') {
    watch(namespaceInput, (newVal) => {
      namespace.value = newVal
    })
  }

  // 根据命名空间生成唯一的存储键名（响应式）
  const STORAGE_KEY = computed(() => `${STORAGE_KEY_PREFIX}_${namespace.value}`)
  // 视图列表
  const views = ref<HorizontalViewConfig[]>([])

  // 当前激活的视图ID
  const activeViewId = ref<string>('')

  // 加载状态
  const loading = ref(false)

  // 当前激活的视图
  const activeView = computed(() => {
    return views.value.find((v) => v.id === activeViewId.value) || views.value[0]
  })

  /**
   * 从 LocalStorage 加载视图配置
   */
  const loadViews = (): void => {
    try {
      if (!checkStorageAvailable()) {
        ElMessage.warning('浏览器存储不可用，视图配置将无法保存')
        views.value = [createDefaultView()]
        activeViewId.value = views.value[0].id
        return
      }

      const stored = localStorage.getItem(STORAGE_KEY.value)

      if (!stored) {
        // 首次加载，创建默认视图
        const defaultView = createDefaultView()
        views.value = [defaultView]
        activeViewId.value = defaultView.id
        saveViews()
        return
      }

      // 解析存储的数据
      const data: ViewStorage = JSON.parse(stored)

      // 版本校验（未来可用于数据迁移）
      if (data.version !== STORAGE_VERSION) {
        console.warn(`视图配置版本不匹配：${data.version} -> ${STORAGE_VERSION}`)
      }

      // 加载视图列表
      views.value = data.horizontal || []

      // 清理过期的临时视图
      views.value = views.value.filter((view) => {
        if (view.isTemporary && view.expiresAt) {
          return new Date(view.expiresAt) > new Date()
        }
        return true
      })

      // 确保至少有一个视图
      if (views.value.length === 0) {
        const defaultView = createDefaultView()
        views.value = [defaultView]
      }

      // 设置激活视图
      activeViewId.value = data.activeView?.horizontalId || views.value[0].id

      // 如果激活的视图不存在，切换到第一个视图
      if (!views.value.find((v) => v.id === activeViewId.value)) {
        activeViewId.value = views.value[0].id
      }
    } catch (error) {
      console.error('加载视图配置失败:', error)
      ElMessage.error('视图配置数据损坏，已恢复为默认配置')
      const defaultView = createDefaultView()
      views.value = [defaultView]
      activeViewId.value = defaultView.id
      saveViews()
    }
  }

  /**
   * 保存视图配置到 LocalStorage
   */
  const saveViews = (): void => {
    try {
      if (!checkStorageAvailable()) {
        return
      }

      const data: ViewStorage = {
        version: STORAGE_VERSION,
        horizontal: views.value,
        activeView: {
          horizontalId: activeViewId.value
        }
      }

      localStorage.setItem(STORAGE_KEY.value, JSON.stringify(data))
    } catch (error) {
      console.error('保存视图配置失败:', error)
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        ElMessage.error('存储空间不足，请删除一些不常用的视图')
      } else {
        ElMessage.error('保存视图配置失败')
      }
    }
  }

  /**
   * 创建新视图
   */
  const createView = (formData: ViewFormData): boolean => {
    try {
      // 检查视图名称是否重复
      if (views.value.some((v) => v.name === formData.name)) {
        ElMessage.warning('视图名称已存在，请使用其他名称')
        return false
      }

      // 检查视图数量限制
      if (views.value.length >= 50) {
        ElMessage.warning('视图数量已达上限（50个），请删除一些不常用的视图')
        return false
      }

      const now = new Date().toISOString()
      const newView: HorizontalViewConfig = {
        id: generateId(),
        name: formData.name,
        type: 'horizontal',
        filterCondition: formData.filterCondition,
        sortRules: formData.sortRules,
        visibleFields: formData.visibleFields,
        isDefault: formData.isDefault,
        order: views.value.length,
        createdAt: now,
        updatedAt: now,
        lastUsedAt: now
      }

      // 如果设为默认视图，取消其他视图的默认标记
      if (newView.isDefault) {
        views.value.forEach((v) => {
          v.isDefault = false
        })
      }

      views.value.push(newView)
      saveViews()

      ElMessage.success('视图创建成功')
      return true
    } catch (error) {
      console.error('创建视图失败:', error)
      ElMessage.error('创建视图失败')
      return false
    }
  }

  /**
   * 更新视图
   */
  const updateView = (viewId: string, formData: ViewFormData): boolean => {
    try {
      const viewIndex = views.value.findIndex((v) => v.id === viewId)
      if (viewIndex === -1) {
        ElMessage.error('视图不存在')
        return false
      }

      // 检查名称是否与其他视图重复
      const duplicate = views.value.find((v) => v.id !== viewId && v.name === formData.name)
      if (duplicate) {
        ElMessage.warning('视图名称已存在，请使用其他名称')
        return false
      }

      const view = views.value[viewIndex]

      // 如果设为默认视图，取消其他视图的默认标记
      if (formData.isDefault && !view.isDefault) {
        views.value.forEach((v) => {
          v.isDefault = false
        })
      }

      // 更新视图配置
      views.value[viewIndex] = {
        ...view,
        name: formData.name,
        filterCondition: formData.filterCondition,
        sortRules: formData.sortRules,
        visibleFields: formData.visibleFields,
        isDefault: formData.isDefault,
        updatedAt: new Date().toISOString()
      }

      saveViews()

      ElMessage.success('视图更新成功')
      return true
    } catch (error) {
      console.error('更新视图失败:', error)
      ElMessage.error('更新视图失败')
      return false
    }
  }

  /**
   * 删除视图
   */
  const deleteView = (viewId: string): boolean => {
    try {
      // 不能删除最后一个视图
      if (views.value.length === 1) {
        ElMessage.warning('至少需要保留一个视图')
        return false
      }

      const viewIndex = views.value.findIndex((v) => v.id === viewId)
      if (viewIndex === -1) {
        ElMessage.error('视图不存在')
        return false
      }

      const isActiveView = viewId === activeViewId.value

      views.value.splice(viewIndex, 1)
      saveViews()

      // 如果删除的是当前激活视图，切换到第一个视图
      if (isActiveView) {
        activeViewId.value = views.value[0].id
      }

      ElMessage.success('视图删除成功')
      return true
    } catch (error) {
      console.error('删除视图失败:', error)
      ElMessage.error('删除视图失败')
      return false
    }
  }

  /**
   * 复制视图
   */
  const duplicateView = (viewId: string): boolean => {
    try {
      const sourceView = views.value.find((v) => v.id === viewId)
      if (!sourceView) {
        ElMessage.error('视图不存在')
        return false
      }

      // 检查视图数量限制
      if (views.value.length >= 50) {
        ElMessage.warning('视图数量已达上限（50个），请删除一些不常用的视图')
        return false
      }

      const now = new Date().toISOString()
      const newView: HorizontalViewConfig = {
        ...sourceView,
        id: generateId(),
        name: `${sourceView.name}（副本）`,
        isDefault: false,
        order: views.value.length,
        createdAt: now,
        updatedAt: now,
        lastUsedAt: now
      }

      views.value.push(newView)
      saveViews()

      ElMessage.success('视图复制成功')
      return true
    } catch (error) {
      console.error('复制视图失败:', error)
      ElMessage.error('复制视图失败')
      return false
    }
  }

  /**
   * 切换视图
   */
  const switchView = (viewId: string): void => {
    const view = views.value.find((v) => v.id === viewId)
    if (!view) {
      ElMessage.error('视图不存在')
      return
    }

    activeViewId.value = viewId

    // 更新最后使用时间
    view.lastUsedAt = new Date().toISOString()
    saveViews()
  }

  /**
   * 调整视图顺序
   */
  const reorderViews = (newViews: HorizontalViewConfig[]): void => {
    views.value = newViews.map((view, index) => ({
      ...view,
      order: index
    }))
    saveViews()
  }

  /**
   * 创建临时视图（用于随机取数等场景）
   */
  const createTemporaryView = (
    name: string,
    filterCondition: ViewFilter,
    expiresIn: number = 30 * 24 * 60 * 60 * 1000 // 默认30天后过期
  ): boolean => {
    try {
      const now = new Date()
      const expiresAt = new Date(now.getTime() + expiresIn)

      const newView: HorizontalViewConfig = {
        id: generateId(),
        name,
        type: 'horizontal',
        filterCondition,
        sortRules: [],
        visibleFields: [],
        isDefault: false,
        order: views.value.length,
        isTemporary: true,
        expiresAt: expiresAt.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        lastUsedAt: now.toISOString()
      }

      views.value.push(newView)
      activeViewId.value = newView.id
      saveViews()

      ElMessage.success(
        `临时视图创建成功，将在${Math.floor(expiresIn / (24 * 60 * 60 * 1000))}天后自动删除`
      )
      return true
    } catch (error) {
      console.error('创建临时视图失败:', error)
      ElMessage.error('创建临时视图失败')
      return false
    }
  }

  /**
   * 导出视图配置
   */
  const exportViews = (): void => {
    try {
      const data: ViewStorage = {
        version: STORAGE_VERSION,
        horizontal: views.value,
        activeView: {
          horizontalId: activeViewId.value
        }
      }

      const dataStr = JSON.stringify(data, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `wallet_views_${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)

      ElMessage.success('视图配置导出成功')
    } catch (error) {
      console.error('导出视图配置失败:', error)
      ElMessage.error('导出视图配置失败')
    }
  }

  /**
   * 导入视图配置
   */
  const importViews = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data: ViewStorage = JSON.parse(e.target?.result as string)

          // 验证数据格式
          if (!data.horizontal || !Array.isArray(data.horizontal)) {
            throw new Error('无效的视图配置文件')
          }

          // 合并导入的视图（避免覆盖现有视图）
          const importedViews = data.horizontal.map((view) => ({
            ...view,
            id: generateId(), // 生成新ID避免冲突
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }))

          views.value.push(...importedViews)
          saveViews()

          ElMessage.success(`成功导入 ${importedViews.length} 个视图`)
          resolve()
        } catch (error) {
          console.error('导入视图配置失败:', error)
          ElMessage.error('导入视图配置失败：文件格式错误')
          reject(error)
        }
      }

      reader.onerror = () => {
        ElMessage.error('读取文件失败')
        reject(new Error('读取文件失败'))
      }

      reader.readAsText(file)
    })
  }

  // 监听激活视图变化，保存到 LocalStorage
  watch(activeViewId, () => {
    saveViews()
  })

  // 监听 namespace 变化，重新加载视图
  watch(namespace, () => {
    console.log(`纵向视图切换，加载命名空间: ${namespace.value}`)
    loadViews()
  })

  // 初始化加载
  loadViews()

  return {
    // 状态
    views,
    activeViewId,
    activeView,
    loading,

    // 方法
    createView,
    updateView,
    deleteView,
    duplicateView,
    switchView,
    reorderViews,
    createTemporaryView,
    exportViews,
    importViews,
    loadViews,
    saveViews
  }
}
