/**
 * 视图管理类型定义
 */

/** 视图类型 */
export type ViewType = 'horizontal' | 'vertical'

/** 排序方向 */
export type SortOrder = 'asc' | 'desc'

/** 排序规则 */
export interface SortRule {
  /** 排序字段名 */
  field: string
  /** 排序方向 */
  order: SortOrder
}

/** 筛选条件 */
export interface ViewFilter {
  /** 归属标签筛选 */
  ownership?: string[]
  /** 主链筛选 */
  mainChains?: string[]
  /** 活动标签筛选 */
  activityTags?: string[]
  /** 分类标签筛选 */
  categoryTags?: string[]
  /** 状态筛选 */
  status?: string[]
  /** 警报标记筛选 */
  alertMark?: string[]
  /** 钱包总价值最小值 */
  totalValueMin?: number
  /** 钱包总价值最大值 */
  totalValueMax?: number
  /** 地址活跃天数最小值 */
  addressActivityMin?: number
  /** 地址活跃天数最大值 */
  addressActivityMax?: number
  /** 钱包地址列表（用于随机取数临时视图） */
  walletAddresses?: string[]
  /** 其他扩展字段 */
  [key: string]: unknown
}

/** 横向视图配置 */
export interface HorizontalViewConfig {
  /** 视图唯一标识 */
  id: string
  /** 视图名称 */
  name: string
  /** 视图类型 */
  type: 'horizontal'
  /** 筛选条件 */
  filterCondition: ViewFilter
  /** 排序规则 */
  sortRules: SortRule[]
  /** 可见字段列表 */
  visibleFields: string[]
  /** 是否为默认视图 */
  isDefault: boolean
  /** 视图排序序号 */
  order: number
  /** 是否为临时视图（如随机取数生成的视图） */
  isTemporary?: boolean
  /** 临时视图过期时间 */
  expiresAt?: string
  /** 创建时间 */
  createdAt: string
  /** 最后修改时间 */
  updatedAt: string
  /** 最后使用时间 */
  lastUsedAt?: string
}

/** 纵向视图配置 */
export interface VerticalViewConfig {
  /** 视图唯一标识 */
  id: string
  /** 视图名称 */
  name: string
  /** 视图类型 */
  type: 'vertical'
  /** 分组字段名 */
  groupField: string
  /** 分组值 */
  groupValue: string
  /** 是否为全量视图 */
  isAllView: boolean
  /** 父视图ID */
  parentId?: string
  /** 视图排序序号 */
  order: number
  /** 创建时间 */
  createdAt: string
}

/** 视图配置联合类型 */
export type ViewConfig = HorizontalViewConfig | VerticalViewConfig

/** 视图存储结构 */
export interface ViewStorage {
  /** 配置版本号 */
  version: string
  /** 横向视图列表 */
  horizontal: HorizontalViewConfig[]
  /** 纵向视图配置 */
  vertical?: {
    /** 分组字段 */
    groupField: string
    /** 视图列表 */
    views: VerticalViewConfig[]
  }
  /** 当前激活的视图 */
  activeView: {
    /** 横向视图ID */
    horizontalId: string
    /** 纵向视图ID */
    verticalId?: string
  }
}

/** 视图表单数据（用于创建/编辑对话框） */
export interface ViewFormData {
  /** 视图名称 */
  name: string
  /** 筛选条件 */
  filterCondition: ViewFilter
  /** 排序规则 */
  sortRules: SortRule[]
  /** 可见字段列表 */
  visibleFields: string[]
  /** 是否设为默认视图 */
  isDefault: boolean
}

/** 视图统计信息 */
export interface ViewStats {
  /** 总记录数 */
  total: number
  /** 分组统计 */
  groups: {
    /** 分组值 */
    value: string
    /** 该分组的记录数 */
    count: number
  }[]
}
