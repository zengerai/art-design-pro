<template>
  <div class="editable-cell" @click="handleClick">
    <!-- 显示模式 -->
    <div v-if="!isEditing" class="cell-display">
      <slot name="display" :value="modelValue">
        {{ displayValue }}
      </slot>
    </div>

    <!-- 编辑模式 -->
    <div v-else class="cell-edit" @click.stop>
      <!-- 文本输入 -->
      <ElInput
        v-if="type === 'text'"
        ref="inputRef"
        v-model="editValue"
        :placeholder="placeholder"
        @blur="handleSave"
        @keydown.enter="handleSave"
        @keydown.esc="handleCancel"
      />

      <!-- 数字输入 -->
      <ElInputNumber
        v-else-if="type === 'number'"
        ref="inputRef"
        v-model="editValue"
        :min="min"
        :max="max"
        :precision="precision"
        :controls="false"
        :placeholder="placeholder"
        style="width: 100%"
        @blur="handleSave"
        @keydown.enter="handleSave"
        @keydown.esc="handleCancel"
      />

      <!-- 日期时间选择 -->
      <ElDatePicker
        v-else-if="type === 'datetime'"
        ref="inputRef"
        v-model="editValue"
        type="datetime"
        :placeholder="placeholder"
        style="width: 100%"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
        @blur="handleSave"
      />

      <!-- 多选下拉框 -->
      <ElSelect
        v-else-if="type === 'multiSelect'"
        ref="inputRef"
        v-model="editValue"
        multiple
        filterable
        allow-create
        default-first-option
        :placeholder="placeholder"
        style="width: 100%"
        @blur="handleSave"
      >
        <ElOption v-for="item in options" :key="item" :label="item" :value="item" />
      </ElSelect>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, nextTick } from 'vue'
  import { ElInput, ElInputNumber, ElDatePicker, ElSelect, ElOption } from 'element-plus'

  defineOptions({ name: 'EditableCell' })

  interface Props {
    /** 单元格值 */
    modelValue?: any
    /** 编辑器类型 */
    type?: 'text' | 'number' | 'datetime' | 'multiSelect'
    /** 占位符 */
    placeholder?: string
    /** 数字最小值 */
    min?: number
    /** 数字最大值 */
    max?: number
    /** 数字精度 */
    precision?: number
    /** 多选选项 */
    options?: string[]
    /** 是否禁用编辑 */
    disabled?: boolean
    /** 自定义显示格式化函数 */
    formatter?: (value: any) => string
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'text',
    placeholder: '点击编辑',
    precision: 2,
    options: () => [],
    disabled: false
  })

  const emit = defineEmits<{
    'update:modelValue': [value: any]
    change: [value: any, oldValue: any]
    save: [value: any]
    cancel: []
  }>()

  const isEditing = ref(false)
  const editValue = ref<any>(null)
  const inputRef = ref()

  // 显示值
  const displayValue = computed(() => {
    if (props.formatter) {
      return props.formatter(props.modelValue)
    }

    if (props.modelValue === null || props.modelValue === undefined) {
      return '-'
    }

    if (props.type === 'multiSelect' && Array.isArray(props.modelValue)) {
      return props.modelValue.join(', ') || '-'
    }

    return String(props.modelValue)
  })

  // 点击单元格进入编辑模式
  const handleClick = () => {
    if (props.disabled || isEditing.value) return

    isEditing.value = true
    editValue.value = props.modelValue

    // 自动聚焦输入框
    nextTick(() => {
      if (inputRef.value) {
        if (inputRef.value.focus) {
          inputRef.value.focus()
        } else if (inputRef.value.$el) {
          const input = inputRef.value.$el.querySelector('input')
          input?.focus()
        }
      }
    })
  }

  // 保存编辑
  const handleSave = () => {
    const oldValue = props.modelValue
    const newValue = editValue.value

    // 值未变化
    if (
      oldValue === newValue ||
      (Array.isArray(oldValue) &&
        Array.isArray(newValue) &&
        JSON.stringify(oldValue) === JSON.stringify(newValue))
    ) {
      handleCancel()
      return
    }

    emit('update:modelValue', newValue)
    emit('change', newValue, oldValue)
    emit('save', newValue)
    isEditing.value = false
  }

  // 取消编辑
  const handleCancel = () => {
    isEditing.value = false
    editValue.value = props.modelValue
    emit('cancel')
  }

  // 监听外部值变化
  watch(
    () => props.modelValue,
    (newVal) => {
      if (!isEditing.value) {
        editValue.value = newVal
      }
    },
    { immediate: true }
  )
</script>

<style scoped lang="scss">
  .editable-cell {
    display: flex;
    align-items: center;
    min-height: 32px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    .cell-display {
      width: 100%;
      padding: 4px 8px;
      color: var(--el-text-color-regular);
    }

    .cell-edit {
      width: 100%;
      padding: 0;
    }
  }
</style>
