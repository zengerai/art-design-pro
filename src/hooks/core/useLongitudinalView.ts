/**
 * 纵向视图管理 Composable
 * 负责纵向视图的生成、统计计算、筛选条件合并等功能
 */

import { ref, computed, watch, type Ref } from 'vue'
import type { VerticalViewConfig, ViewStats, ViewFilter } from '@/types/view'

/** 分组字段配置 */
export interface GroupFieldConfig {
  key: string
  label: string
  options: string[]
}

/** useLongitudinalView 选项 */
export interface UseLongitudinalViewOptions {
  /** 数据列表 */
  data: Ref<any[]>
  /** 分组字段配置列表 */
  groupFields: GroupFieldConfig[]
  /** 横向视图筛选条件 */
  horizontalFilter: Ref<ViewFilter>
}

/** LocalStorage 键名 */
const LONGITUDINAL_STORAGE_KEY = 'wallet_monitoring_longitudinal_config'

/**
 * 生成唯一ID
 */
const generateId = (): string => {
  return `vertical_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 纵向视图管理 Hook
 */
export function useLongitudinalView(options: UseLongitudinalViewOptions) {
  const { data, groupFields, horizontalFilter } = options

  // 当前分组字段
  const groupField = ref<string>(groupFields[0]?.key || '')

  // 当前激活的纵向视图ID
  const activeViewId = ref<string>('all')

  // 纵向视图列表
  const views = ref<VerticalViewConfig[]>([])

  // 侧边栏折叠状态
  const collapsed = ref(false)

  // 展开的分组集合
  const expandedGroups = ref(new Set<string>(['main-group']))

  /**
   * 获取当前分组字段的配置
   */
  const currentGroupFieldConfig = computed(() => {
    return groupFields.find((f) => f.key === groupField.value) || groupFields[0]
  })

  /**
   * 计算视图统计数据
   * 注意：统计计数始终基于原始数据，不受任何筛选条件影响
   */
  const viewStats = computed<ViewStats>(() => {
    // 全量视图计数：始终是原始数据总数
    const total = data.value.length

    // 计算各分组的计数：基于原始数据统计
    const groups = currentGroupFieldConfig.value.options.map((option) => {
      const count = data.value.filter((record) => {
        const fieldValue = record[groupField.value]
        return Array.isArray(fieldValue) && fieldValue.includes(option)
      }).length

      return {
        value: option,
        count
      }
    })

    return { total, groups }
  })

  /**
   * 当前激活的视图配置
   */
  const activeView = computed(() => {
    return views.value.find((v) => v.id === activeViewId.value) || null
  })

  /**
   * 生成纵向视图列表
   */
  function generateLongitudinalViews(): void {
    const now = new Date().toISOString()
    const newViews: VerticalViewConfig[] = []

    // 创建全量视图
    newViews.push({
      id: 'all',
      name: '全量视图',
      type: 'vertical',
      groupField: groupField.value,
      groupValue: '',
      isAllView: true,
      order: 0,
      createdAt: now
    })

    // 创建分组子视图
    currentGroupFieldConfig.value.options.forEach((option, index) => {
      newViews.push({
        id: generateId(),
        name: option,
        type: 'vertical',
        groupField: groupField.value,
        groupValue: option,
        isAllView: false,
        order: index + 1,
        createdAt: now
      })
    })

    views.value = newViews
  }

  /**
   * 设置分组字段
   */
  function setGroupField(field: string): void {
    if (field === groupField.value) return

    groupField.value = field
    generateLongitudinalViews()
    activeViewId.value = 'all' // 切换字段后重置为全量视图
    saveConfig()
  }

  /**
   * 切换纵向视图
   */
  function switchView(viewId: string): void {
    activeViewId.value = viewId
    saveConfig()
  }

  /**
   * 获取纵向视图的筛选条件
   */
  function getLongitudinalFilter(): ViewFilter {
    if (activeViewId.value === 'all') {
      return {} // 全量视图不添加筛选条件
    }

    const view = activeView.value
    if (!view || view.isAllView) {
      return {}
    }

    // 返回分组字段的筛选条件
    return {
      [view.groupField]: [view.groupValue]
    }
  }

  /**
   * 获取合并后的筛选条件（纵向 + 横向）
   */
  function getCombinedFilter(): ViewFilter {
    const longitudinalFilter = getLongitudinalFilter()
    return {
      ...horizontalFilter.value,
      ...longitudinalFilter
    }
  }

  /**
   * 切换折叠状态
   */
  function toggleCollapse(): void {
    collapsed.value = !collapsed.value
    saveConfig()
  }

  /**
   * 切换分组展开状态
   */
  function toggleGroup(groupKey: string): void {
    if (expandedGroups.value.has(groupKey)) {
      expandedGroups.value.delete(groupKey)
    } else {
      expandedGroups.value.add(groupKey)
    }
    saveConfig()
  }

  /**
   * 保存配置到 LocalStorage
   */
  function saveConfig(): void {
    try {
      const config = {
        groupField: groupField.value,
        activeViewId: activeViewId.value,
        collapsed: collapsed.value,
        expandedGroups: Array.from(expandedGroups.value)
      }
      localStorage.setItem(LONGITUDINAL_STORAGE_KEY, JSON.stringify(config))
    } catch (error) {
      console.error('保存纵向视图配置失败:', error)
    }
  }

  /**
   * 从 LocalStorage 加载配置
   */
  function loadConfig(): void {
    try {
      const stored = localStorage.getItem(LONGITUDINAL_STORAGE_KEY)
      if (!stored) {
        generateLongitudinalViews()
        return
      }

      const config = JSON.parse(stored)

      // 恢复分组字段
      if (config.groupField && groupFields.find((f) => f.key === config.groupField)) {
        groupField.value = config.groupField
      }

      // 恢复折叠状态
      if (config.collapsed !== undefined) {
        collapsed.value = config.collapsed
      }

      // 恢复展开的分组
      if (config.expandedGroups && Array.isArray(config.expandedGroups)) {
        expandedGroups.value = new Set(config.expandedGroups)
      }

      // 生成视图列表
      generateLongitudinalViews()

      // 恢复激活的视图
      if (config.activeViewId) {
        const viewExists = views.value.some((v) => v.id === config.activeViewId)
        if (viewExists) {
          activeViewId.value = config.activeViewId
        }
      }
    } catch (error) {
      console.error('加载纵向视图配置失败:', error)
      generateLongitudinalViews()
    }
  }

  // 监听数据和筛选条件变化，触发统计计算
  watch(
    [data, horizontalFilter],
    () => {
      // viewStats 是 computed，会自动重新计算
    },
    { deep: true }
  )

  // 初始化加载
  loadConfig()

  return {
    // 状态
    groupField,
    activeViewId,
    views,
    viewStats,
    collapsed,
    expandedGroups,
    currentGroupFieldConfig,
    activeView,

    // 方法
    setGroupField,
    switchView,
    getLongitudinalFilter,
    getCombinedFilter,
    toggleCollapse,
    toggleGroup,
    generateLongitudinalViews,
    saveConfig,
    loadConfig
  }
}
