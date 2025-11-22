<template>
  <div class="view-tabs-container">
    <div class="view-tabs-header">
      <ElTabs
        :model-value="activeViewId"
        type="card"
        closable
        addable
        @update:model-value="handleTabChange"
        @tab-remove="handleTabRemove"
        @tab-add="handleAddView"
        @contextmenu.prevent="handleContextMenu"
      >
        <ElTabPane
          v-for="view in views"
          :key="view.id"
          :label="view.name"
          :name="view.id"
          :closable="views.length > 1"
        >
          <template #label>
            <span
              class="tab-label"
              :class="{ 'is-default': view.isDefault, 'is-temporary': view.isTemporary }"
              @contextmenu.prevent.stop="showContextMenu($event, view)"
            >
              {{ view.name }}
              <ElIcon v-if="view.isDefault" class="default-icon"><Star /></ElIcon>
              <ElIcon v-if="view.isTemporary" class="temporary-icon"><Timer /></ElIcon>
            </span>
          </template>
        </ElTabPane>
      </ElTabs>

      <!-- 同步状态显示 -->
      <div v-if="enableServerSync" class="sync-status">
        <ElTooltip
          :content="
            isSyncing
              ? '同步中...'
              : lastSyncTime
                ? `上次同步: ${formatSyncTime(lastSyncTime)}`
                : '未同步'
          "
        >
          <ElIcon :class="['sync-icon', { 'is-syncing': isSyncing }]">
            <Loading v-if="isSyncing" />
            <Finished v-else-if="lastSyncTime" />
            <Warning v-else />
          </ElIcon>
        </ElTooltip>
        <ElButton
          v-if="!isSyncing"
          link
          type="primary"
          size="small"
          :icon="Refresh"
          @click="handleManualSync"
        >
          手动同步
        </ElButton>
      </div>
    </div>

    <!-- 右键菜单 -->
    <ElDropdown
      ref="contextMenuRef"
      trigger="contextmenu"
      :virtual-ref="virtualRef"
      :virtual-triggering="true"
      @command="handleContextMenuCommand"
    >
      <span></span>
      <template #dropdown>
        <ElDropdownMenu>
          <ElDropdownItem command="edit" :icon="Edit">编辑视图</ElDropdownItem>
          <ElDropdownItem command="duplicate" :icon="DocumentCopy">复制视图</ElDropdownItem>
          <ElDropdownItem command="setDefault" :icon="Star" :disabled="contextMenuView?.isDefault">
            设为默认
          </ElDropdownItem>
          <ElDropdownItem command="export" :icon="Download">导出视图</ElDropdownItem>
          <ElDropdownItem command="delete" :icon="Delete" divided :disabled="views.length === 1">
            删除视图
          </ElDropdownItem>
        </ElDropdownMenu>
      </template>
    </ElDropdown>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { ElMessageBox, ElMessage } from 'element-plus'
  import {
    Edit,
    Delete,
    DocumentCopy,
    Star,
    Timer,
    Download,
    Loading,
    Finished,
    Warning,
    Refresh
  } from '@element-plus/icons-vue'
  import type { HorizontalViewConfig } from '@/types/view'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import 'dayjs/locale/zh-cn'

  dayjs.extend(relativeTime)
  dayjs.locale('zh-cn')

  interface Props {
    views: HorizontalViewConfig[]
    activeViewId: string
    /** 是否启用服务器同步 */
    enableServerSync?: boolean
    /** 是否正在同步 */
    isSyncing?: boolean
    /** 最后同步时间 */
    lastSyncTime?: string
  }

  interface Emits {
    (e: 'update:activeViewId', value: string): void
    (e: 'view-change', viewId: string): void
    (e: 'add-view'): void
    (e: 'edit-view', view: HorizontalViewConfig): void
    (e: 'delete-view', viewId: string): void
    (e: 'duplicate-view', viewId: string): void
    (e: 'set-default', viewId: string): void
    (e: 'export-view', view: HorizontalViewConfig): void
    (e: 'manual-sync'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 右键菜单相关
  const contextMenuRef = ref()
  const contextMenuView = ref<HorizontalViewConfig | null>(null)
  const virtualRef = ref<HTMLElement>()

  /**
   * Tab切换事件
   */
  const handleTabChange = (viewId: string | number) => {
    emit('update:activeViewId', viewId as string)
    emit('view-change', viewId as string)
  }

  /**
   * Tab删除事件（点击关闭按钮）
   */
  const handleTabRemove = async (viewId: string | number) => {
    if (props.views.length === 1) {
      ElMessage.warning('至少需要保留一个视图')
      return
    }

    const view = props.views.find((v) => v.id === viewId)
    if (!view) return

    try {
      await ElMessageBox.confirm(`确定删除视图【${view.name}】吗？`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      emit('delete-view', viewId as string)
    } catch {
      // 用户取消删除
    }
  }

  /**
   * 新增视图
   */
  const handleAddView = () => {
    emit('add-view')
  }

  /**
   * 显示右键菜单
   */
  const showContextMenu = (event: MouseEvent, view: HorizontalViewConfig) => {
    contextMenuView.value = view
    virtualRef.value = event.currentTarget as HTMLElement

    // 触发右键菜单显示
    setTimeout(() => {
      const el = event.currentTarget as HTMLElement
      el.dispatchEvent(
        new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          clientX: event.clientX,
          clientY: event.clientY
        })
      )
    }, 0)
  }

  /**
   * 处理右键菜单命令
   */
  const handleContextMenuCommand = async (command: string) => {
    if (!contextMenuView.value) return

    const view = contextMenuView.value

    switch (command) {
      case 'edit':
        emit('edit-view', view)
        break

      case 'duplicate':
        emit('duplicate-view', view.id)
        break

      case 'setDefault':
        emit('set-default', view.id)
        break

      case 'export':
        emit('export-view', view)
        break

      case 'delete':
        try {
          await ElMessageBox.confirm(`确定删除视图【${view.name}】吗？`, '确认删除', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })

          emit('delete-view', view.id)
        } catch {
          // 用户取消删除
        }
        break
    }

    contextMenuView.value = null
  }

  /**
   * 阻止原生右键菜单
   */
  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault()
  }

  /**
   * 格式化同步时间
   */
  const formatSyncTime = (time: string) => {
    return dayjs(time).fromNow()
  }

  /**
   * 手动同步
   */
  const handleManualSync = () => {
    emit('manual-sync')
  }
</script>

<style scoped lang="scss">
  .view-tabs-container {
    margin-top: 16px;
    margin-bottom: 16px;

    .view-tabs-header {
      display: flex;
      gap: 16px;
      align-items: center;

      :deep(.el-tabs) {
        flex: 1;
      }

      .sync-status {
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 0 12px;
        font-size: 14px;
        color: var(--el-text-color-secondary);

        .sync-icon {
          font-size: 16px;
          transition: all 0.3s ease;

          &.is-syncing {
            color: var(--el-color-primary);
            animation: rotate 1s linear infinite;
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }
      }
    }

    :deep(.el-tabs__header) {
      margin-bottom: 0;
    }

    :deep(.el-tabs__new-tab) {
      margin-left: 8px;
    }

    .tab-label {
      display: inline-flex;
      gap: 4px;
      align-items: center;

      &.is-default {
        font-weight: 600;
      }

      &.is-temporary {
        opacity: 0.8;
      }

      .default-icon {
        font-size: 14px;
        color: var(--el-color-warning);
      }

      .temporary-icon {
        font-size: 14px;
        color: var(--el-color-info);
      }
    }
  }
</style>
