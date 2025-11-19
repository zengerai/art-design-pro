<!-- 图标选择器组件 -->
<template>
  <div class="art-icon-picker">
    <ElPopover
      :visible="visible"
      :width="480"
      trigger="click"
      placement="bottom-start"
      @update:visible="handleVisibleChange"
    >
      <template #reference>
        <ElInput
          :model-value="modelValue"
          :placeholder="placeholder"
          clearable
          @clear="handleClear"
          @click="handleInputClick"
        >
          <template #prefix>
            <ArtSvgIcon v-if="modelValue" :icon="modelValue" class="text-lg" />
            <ArtSvgIcon v-else icon="ri:search-line" class="text-lg text-g-400" />
          </template>
        </ElInput>
      </template>

      <div class="icon-picker-panel">
        <!-- 搜索框 -->
        <div class="mb-3">
          <ElInput v-model="searchText" placeholder="搜索图标..." clearable @input="handleSearch">
            <template #prefix>
              <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
            </template>
          </ElInput>
        </div>

        <!-- 图标分类标签 -->
        <div class="mb-3">
          <ElScrollbar max-height="60px">
            <div class="flex flex-wrap gap-2">
              <ElTag
                v-for="category in categories"
                :key="category.value"
                :type="selectedCategory === category.value ? 'primary' : 'info'"
                :effect="selectedCategory === category.value ? 'dark' : 'plain'"
                class="cursor-pointer"
                @click="handleCategoryChange(category.value)"
              >
                {{ category.label }}
              </ElTag>
            </div>
          </ElScrollbar>
        </div>

        <!-- 图标列表 -->
        <ElScrollbar max-height="320px">
          <div v-if="filteredIcons.length > 0" class="icon-list">
            <div
              v-for="icon in filteredIcons"
              :key="icon"
              class="icon-item"
              :class="{ active: modelValue === icon }"
              :title="icon"
              @click="handleSelect(icon)"
            >
              <ArtSvgIcon :icon="icon" class="text-xl" />
            </div>
          </div>
          <div v-else class="text-center py-8 text-g-400">
            <ArtSvgIcon icon="ri:inbox-line" class="text-4xl mb-2" />
            <div>未找到相关图标</div>
          </div>
        </ElScrollbar>

        <!-- 底部信息 -->
        <div class="mt-3 pt-3 border-t border-g-200 text-xs text-g-400 flex justify-between">
          <span>共 {{ filteredIcons.length }} 个图标</span>
          <span v-if="modelValue">已选择: {{ modelValue }}</span>
        </div>
      </div>
    </ElPopover>
  </div>
</template>

<script setup lang="ts">
  import { ElInput, ElPopover, ElScrollbar, ElTag } from 'element-plus'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'

  interface Props {
    modelValue?: string
    placeholder?: string
  }

  interface Emits {
    (e: 'update:modelValue', value: string): void
  }

  withDefaults(defineProps<Props>(), {
    modelValue: '',
    placeholder: '请选择图标'
  })

  const emit = defineEmits<Emits>()

  const visible = ref(false)
  const searchText = ref('')
  const selectedCategory = ref('all')

  // 图标分类
  const categories = [
    { label: '全部', value: 'all' },
    { label: '常用', value: 'common' },
    { label: '箭头', value: 'arrow' },
    { label: '编辑', value: 'edit' },
    { label: '文件', value: 'file' },
    { label: '系统', value: 'system' },
    { label: '设备', value: 'device' },
    { label: '商业', value: 'business' },
    { label: '地图', value: 'map' },
    { label: '用户', value: 'user' },
    { label: '通讯', value: 'communication' },
    { label: '媒体', value: 'media' }
  ]

  // 常用图标列表 (使用 Remix Icon)
  const commonIcons = [
    'ri:home-line',
    'ri:dashboard-line',
    'ri:user-line',
    'ri:user-settings-line',
    'ri:team-line',
    'ri:settings-line',
    'ri:menu-line',
    'ri:file-list-line',
    'ri:folder-line',
    'ri:file-text-line',
    'ri:search-line',
    'ri:notification-line',
    'ri:mail-line',
    'ri:message-line',
    'ri:calendar-line',
    'ri:time-line',
    'ri:chart-line',
    'ri:bar-chart-line',
    'ri:pie-chart-line',
    'ri:table-line',
    'ri:database-line',
    'ri:server-line',
    'ri:cloud-line',
    'ri:lock-line',
    'ri:shield-line',
    'ri:key-line',
    'ri:eye-line',
    'ri:edit-line',
    'ri:delete-bin-line',
    'ri:add-line',
    'ri:close-line',
    'ri:check-line',
    'ri:star-line',
    'ri:heart-line',
    'ri:thumb-up-line',
    'ri:bookmark-line',
    'ri:bitcoin-line',
    'ri:stock-line',
    'ri:exchange-line'
  ]

  const arrowIcons = [
    'ri:arrow-up-line',
    'ri:arrow-down-line',
    'ri:arrow-left-line',
    'ri:arrow-right-line',
    'ri:arrow-up-circle-line',
    'ri:arrow-down-circle-line',
    'ri:arrow-left-circle-line',
    'ri:arrow-right-circle-line',
    'ri:arrow-drop-down-line',
    'ri:arrow-drop-up-line',
    'ri:arrow-drop-left-line',
    'ri:arrow-drop-right-line'
  ]

  const editIcons = [
    'ri:edit-line',
    'ri:edit-box-line',
    'ri:pencil-line',
    'ri:pen-nib-line',
    'ri:ball-pen-line',
    'ri:quill-pen-line',
    'ri:delete-bin-line',
    'ri:delete-bin-2-line',
    'ri:eraser-line',
    'ri:scissors-line',
    'ri:save-line',
    'ri:file-copy-line'
  ]

  const fileIcons = [
    'ri:file-line',
    'ri:file-text-line',
    'ri:file-list-line',
    'ri:file-copy-line',
    'ri:file-add-line',
    'ri:file-reduce-line',
    'ri:folder-line',
    'ri:folder-open-line',
    'ri:folder-add-line',
    'ri:folder-reduce-line',
    'ri:folder-transfer-line',
    'ri:folder-shared-line'
  ]

  const systemIcons = [
    'ri:settings-line',
    'ri:settings-2-line',
    'ri:settings-3-line',
    'ri:settings-4-line',
    'ri:settings-5-line',
    'ri:tools-line',
    'ri:hammer-line',
    'ri:bug-line',
    'ri:shield-line',
    'ri:shield-check-line',
    'ri:lock-line',
    'ri:lock-unlock-line',
    'ri:key-line',
    'ri:admin-line'
  ]

  const deviceIcons = [
    'ri:computer-line',
    'ri:macbook-line',
    'ri:smartphone-line',
    'ri:tablet-line',
    'ri:tv-line',
    'ri:device-line',
    'ri:router-line',
    'ri:database-line',
    'ri:server-line',
    'ri:hard-drive-line',
    'ri:save-line',
    'ri:usb-line'
  ]

  const businessIcons = [
    'ri:briefcase-line',
    'ri:suitcase-line',
    'ri:shopping-cart-line',
    'ri:shopping-bag-line',
    'ri:store-line',
    'ri:bank-line',
    'ri:money-dollar-circle-line',
    'ri:coin-line',
    'ri:wallet-line',
    'ri:bank-card-line',
    'ri:pie-chart-line',
    'ri:bar-chart-line',
    'ri:line-chart-line'
  ]

  const mapIcons = [
    'ri:map-pin-line',
    'ri:map-pin-2-line',
    'ri:map-line',
    'ri:route-line',
    'ri:compass-line',
    'ri:navigation-line',
    'ri:global-line',
    'ri:earth-line',
    'ri:road-map-line'
  ]

  const userIcons = [
    'ri:user-line',
    'ri:user-2-line',
    'ri:user-3-line',
    'ri:user-4-line',
    'ri:user-add-line',
    'ri:user-follow-line',
    'ri:user-unfollow-line',
    'ri:user-settings-line',
    'ri:team-line',
    'ri:group-line',
    'ri:account-circle-line',
    'ri:contacts-line'
  ]

  const communicationIcons = [
    'ri:mail-line',
    'ri:mail-send-line',
    'ri:message-line',
    'ri:message-2-line',
    'ri:chat-1-line',
    'ri:chat-2-line',
    'ri:chat-3-line',
    'ri:chat-4-line',
    'ri:question-answer-line',
    'ri:feedback-line',
    'ri:notification-line',
    'ri:notification-2-line'
  ]

  const mediaIcons = [
    'ri:image-line',
    'ri:image-2-line',
    'ri:gallery-line',
    'ri:camera-line',
    'ri:video-line',
    'ri:film-line',
    'ri:music-line',
    'ri:headphone-line',
    'ri:play-line',
    'ri:pause-line',
    'ri:stop-line',
    'ri:volume-up-line'
  ]

  // 所有图标映射
  const iconMap: Record<string, string[]> = {
    common: commonIcons,
    arrow: arrowIcons,
    edit: editIcons,
    file: fileIcons,
    system: systemIcons,
    device: deviceIcons,
    business: businessIcons,
    map: mapIcons,
    user: userIcons,
    communication: communicationIcons,
    media: mediaIcons
  }

  // 所有图标列表
  const allIcons = computed(() => {
    return Object.values(iconMap).flat()
  })

  // 过滤后的图标列表
  const filteredIcons = computed(() => {
    let icons =
      selectedCategory.value === 'all' ? allIcons.value : iconMap[selectedCategory.value] || []

    if (searchText.value.trim()) {
      const keyword = searchText.value.toLowerCase()
      icons = icons.filter((icon) => icon.toLowerCase().includes(keyword))
    }

    return icons
  })

  const handleVisibleChange = (val: boolean) => {
    visible.value = val
    if (val) {
      searchText.value = ''
      selectedCategory.value = 'all'
    }
  }

  const handleInputClick = () => {
    visible.value = !visible.value
  }

  const handleClear = () => {
    emit('update:modelValue', '')
  }

  const handleSelect = (icon: string) => {
    emit('update:modelValue', icon)
    visible.value = false
  }

  const handleSearch = () => {
    // 搜索时切换到全部分类
    if (searchText.value.trim()) {
      selectedCategory.value = 'all'
    }
  }

  const handleCategoryChange = (category: string) => {
    selectedCategory.value = category
    searchText.value = ''
  }
</script>

<style scoped lang="scss">
  .art-icon-picker {
    width: 100%;
  }

  .icon-picker-panel {
    padding: 4px;
  }

  .icon-list {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 8px;
  }

  .icon-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    cursor: pointer;
    background-color: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      background-color: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary);
      transform: scale(1.1);
    }

    &.active {
      background-color: var(--el-color-primary-light-8);
      border-color: var(--el-color-primary);
      box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
    }
  }
</style>
