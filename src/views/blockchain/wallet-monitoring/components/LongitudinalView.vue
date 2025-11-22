<template>
  <aside :class="['longitudinal-view', { 'is-collapsed': collapsed }]">
    <!-- 顶部折叠按钮 -->
    <div class="collapse-toggle" @click="handleToggleCollapse">
      <ElIcon>
        <Fold v-if="!collapsed" />
        <Expand v-else />
      </ElIcon>
    </div>

    <!-- 分组字段选择器（仅展开时显示） -->
    <transition name="fade">
      <div v-if="!collapsed" class="group-field-selector">
        <ElSelect
          v-model="currentGroupField"
          placeholder="选择分组字段"
          size="small"
          @change="handleGroupFieldChange"
        >
          <ElOption
            v-for="field in groupFields"
            :key="field.key"
            :label="field.label"
            :value="field.key"
          />
        </ElSelect>
      </div>
    </transition>

    <!-- 视图列表 -->
    <ElScrollbar class="view-list">
      <!-- 全量视图 -->
      <div
        :class="['view-item', 'all-view', { 'is-active': activeViewId === 'all' }]"
        @click="handleViewClick('all')"
      >
        <ElIcon class="view-icon">
          <Grid />
        </ElIcon>
        <span v-if="!collapsed" class="view-name">全量视图</span>
        <ElBadge
          :value="stats.total"
          :class="['count-badge', { 'is-collapsed': collapsed }]"
          :hidden="stats.total === 0"
        />
      </div>

      <!-- 分组视图 -->
      <div class="group-section">
        <div v-if="!collapsed" class="group-header" @click="handleToggleGroup('main-group')">
          <ElIcon class="expand-icon">
            <ArrowDown v-if="isGroupExpanded" />
            <ArrowRight v-else />
          </ElIcon>
          <span class="group-title">按{{ currentGroupFieldLabel }}分组</span>
        </div>

        <ElCollapseTransition>
          <div v-show="isGroupExpanded || collapsed" class="group-items">
            <div
              v-for="group in stats.groups"
              :key="group.value"
              :class="[
                'view-item',
                'group-item',
                {
                  'is-active': activeViewId !== 'all' && currentGroupValue === group.value,
                  'is-empty': group.count === 0
                }
              ]"
              @click="handleGroupItemClick(group.value)"
            >
              <span v-if="!collapsed" class="view-name">{{ group.value }}</span>
              <ElBadge
                :value="group.count"
                :class="['count-badge', { 'is-collapsed': collapsed }]"
                :hidden="group.count === 0"
              />
            </div>
          </div>
        </ElCollapseTransition>
      </div>
    </ElScrollbar>
  </aside>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { Grid, Fold, Expand, ArrowDown, ArrowRight } from '@element-plus/icons-vue'
  import type { ViewStats } from '@/types/view'
  import type { GroupFieldConfig } from '@/hooks/core/useLongitudinalView'

  defineOptions({ name: 'LongitudinalView' })

  // Props
  interface Props {
    /** 视图统计数据 */
    stats: ViewStats
    /** 分组字段配置列表 */
    groupFields: GroupFieldConfig[]
    /** 当前分组字段 */
    groupField: string
    /** 当前激活的视图ID */
    activeViewId: string
    /** 是否折叠状态 */
    collapsed: boolean
    /** 展开的分组集合 */
    expandedGroups: Set<string>
  }

  const props = withDefaults(defineProps<Props>(), {
    stats: () => ({ total: 0, groups: [] }),
    groupFields: () => [],
    groupField: '',
    activeViewId: 'all',
    collapsed: false,
    expandedGroups: () => new Set(['main-group'])
  })

  // Emits
  interface Emits {
    (e: 'group-field-change', field: string): void
    (e: 'view-change', viewId: string, groupValue?: string): void
    (e: 'update:collapsed', collapsed: boolean): void
    (e: 'toggle-group', groupKey: string): void
  }

  const emit = defineEmits<Emits>()

  // 当前分组字段（双向绑定）
  const currentGroupField = ref(props.groupField)

  // 当前分组字段配置
  const currentGroupFieldLabel = computed(() => {
    const field = props.groupFields.find((f) => f.key === currentGroupField.value)
    return field?.label || ''
  })

  // 主分组是否展开
  const isGroupExpanded = computed(() => {
    return props.expandedGroups.has('main-group')
  })

  // 当前激活的分组值
  const currentGroupValue = computed(() => {
    if (props.activeViewId === 'all') return ''
    // 从 activeViewId 中提取分组值
    const group = props.stats.groups.find((g) => {
      return props.activeViewId.includes(g.value)
    })
    return group?.value || ''
  })

  // 监听 props 变化同步到本地状态
  watch(
    () => props.groupField,
    (newVal) => {
      currentGroupField.value = newVal
    }
  )

  /**
   * 处理分组字段变更
   */
  function handleGroupFieldChange(field: string): void {
    emit('group-field-change', field)
  }

  /**
   * 处理视图点击
   */
  function handleViewClick(viewId: string): void {
    emit('view-change', viewId)
  }

  /**
   * 处理分组项点击
   */
  function handleGroupItemClick(groupValue: string): void {
    // 生成视图ID（可以根据实际需要调整格式）
    const viewId = `${currentGroupField.value}_${groupValue}`
    emit('view-change', viewId, groupValue)
  }

  /**
   * 处理折叠切换
   */
  function handleToggleCollapse(): void {
    emit('update:collapsed', !props.collapsed)
  }

  /**
   * 处理分组展开/折叠切换
   */
  function handleToggleGroup(groupKey: string): void {
    emit('toggle-group', groupKey)
  }
</script>

<style lang="scss" scoped>
  .longitudinal-view {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 240px;
    height: 100vh;
    overflow: hidden;
    background-color: var(--el-bg-color);
    border-right: 1px solid var(--el-border-color-lighter);
    transition: width 0.3s ease-in-out;

    &.is-collapsed {
      width: 60px;

      .view-item {
        justify-content: center;
        padding: 0 8px;

        .view-icon {
          margin-right: 0;
        }
      }

      .count-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        transform: scale(0.85);
      }
    }

    // 折叠按钮
    .collapse-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 48px;
      cursor: pointer;
      border-bottom: 1px solid var(--el-border-color-lighter);
      transition: background-color 0.15s ease;

      &:hover {
        background-color: var(--el-fill-color-light);
      }

      .el-icon {
        font-size: 18px;
        color: var(--el-text-color-regular);
      }
    }

    // 分组字段选择器
    .group-field-selector {
      padding: 12px;
      border-bottom: 1px solid var(--el-border-color-lighter);

      .el-select {
        width: 100%;
      }
    }

    // 视图列表滚动区域
    .view-list {
      flex: 1;
      overflow-y: auto;
    }

    // 视图项通用样式
    .view-item {
      position: relative;
      display: flex;
      align-items: center;
      height: 40px;
      padding: 0 16px;
      color: var(--el-text-color-primary);
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background-color: var(--el-fill-color-light);
      }

      &.is-active {
        color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);

        .view-icon {
          color: var(--el-color-primary);
        }
      }

      &.is-empty {
        color: var(--el-text-color-disabled);
        cursor: not-allowed;

        &:hover {
          background-color: transparent;
        }
      }

      .view-icon {
        flex-shrink: 0;
        margin-right: 8px;
        font-size: 18px;
        color: var(--el-text-color-regular);
      }

      .view-name {
        flex: 1;
        overflow: hidden;
        font-size: 14px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .count-badge {
        flex-shrink: 0;
        margin-left: auto;

        &.is-collapsed {
          margin-left: 0;
        }

        :deep(.el-badge__content) {
          min-width: 18px;
          height: 18px;
          padding: 0 6px;
          font-size: 12px;
          line-height: 18px;
          background-color: var(--el-text-color-secondary);
        }
      }
    }

    // 全量视图特殊样式
    .all-view {
      margin-bottom: 4px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    // 分组区域
    .group-section {
      .group-header {
        display: flex;
        align-items: center;
        height: 36px;
        padding: 0 12px;
        font-size: 13px;
        color: var(--el-text-color-regular);
        cursor: pointer;
        transition: background-color 0.15s ease;

        &:hover {
          background-color: var(--el-fill-color-light);
        }

        .expand-icon {
          margin-right: 4px;
          font-size: 14px;
          transition: transform 0.2s ease;
        }

        .group-title {
          font-weight: 500;
        }
      }

      .group-items {
        .group-item {
          padding-left: 32px; // 二级缩进
        }
      }
    }

    // 过渡动画
    .fade-enter-active,
    .fade-leave-active {
      transition: opacity 0.2s ease;
    }

    .fade-enter-from,
    .fade-leave-to {
      opacity: 0;
    }
  }

  // 响应式设计
  @media (width <= 768px) {
    .longitudinal-view {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1000;
      box-shadow: 2px 0 8px rgb(0 0 0 / 15%);

      &.is-collapsed {
        transform: translateX(-100%);
      }
    }
  }
</style>
