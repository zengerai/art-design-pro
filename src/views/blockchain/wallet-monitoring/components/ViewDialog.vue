<template>
  <ElDialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑视图' : '新建视图'"
    width="700px"
    @close="handleClose"
  >
    <ElForm
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      @submit.prevent="handleSubmit"
    >
      <ElFormItem label="视图名称" prop="name">
        <ElInput
          v-model="form.name"
          placeholder="请输入视图名称（1-20个字符）"
          maxlength="20"
          show-word-limit
          clearable
        />
      </ElFormItem>

      <ElFormItem label="筛选条件">
        <div class="filter-container">
          <!-- 归属标签 -->
          <div class="filter-item">
            <span class="filter-label">归属标签：</span>
            <ElSelect
              v-model="form.filterCondition.ownership"
              multiple
              filterable
              allow-create
              placeholder="选择归属标签"
              style="flex: 1"
            >
              <ElOption v-for="item in ownershipOptions" :key="item" :label="item" :value="item" />
            </ElSelect>
          </div>

          <!-- 主链 -->
          <div class="filter-item">
            <span class="filter-label">主链列表：</span>
            <ElSelect
              v-model="form.filterCondition.mainChains"
              multiple
              filterable
              allow-create
              placeholder="选择主链"
              style="flex: 1"
            >
              <ElOption v-for="item in chainOptions" :key="item" :label="item" :value="item" />
            </ElSelect>
          </div>

          <!-- 状态 -->
          <div class="filter-item">
            <span class="filter-label">状态标签：</span>
            <ElSelect
              v-model="form.filterCondition.status"
              multiple
              filterable
              allow-create
              placeholder="选择状态"
              style="flex: 1"
            >
              <ElOption v-for="item in statusOptions" :key="item" :label="item" :value="item" />
            </ElSelect>
          </div>

          <!-- 钱包总价值范围 -->
          <div class="filter-item">
            <span class="filter-label">钱包总价值：</span>
            <div class="range-input">
              <ElInputNumber
                v-model="form.filterCondition.totalValueMin"
                :min="0"
                :precision="2"
                placeholder="最小值"
                controls-position="right"
                style="width: 140px"
              />
              <span class="range-separator">~</span>
              <ElInputNumber
                v-model="form.filterCondition.totalValueMax"
                :min="0"
                :precision="2"
                placeholder="最大值"
                controls-position="right"
                style="width: 140px"
              />
            </div>
          </div>

          <!-- 地址活跃天数范围 -->
          <div class="filter-item">
            <span class="filter-label">地址活跃天数：</span>
            <div class="range-input">
              <ElInputNumber
                v-model="form.filterCondition.addressActivityMin"
                :min="0"
                :precision="0"
                placeholder="最小值"
                controls-position="right"
                style="width: 140px"
              />
              <span class="range-separator">~</span>
              <ElInputNumber
                v-model="form.filterCondition.addressActivityMax"
                :min="0"
                :precision="0"
                placeholder="最大值"
                controls-position="right"
                style="width: 140px"
              />
            </div>
          </div>

          <ElAlert
            v-if="hasFilters"
            type="info"
            :closable="false"
            style="margin-top: 12px"
            show-icon
          >
            <template #title>
              已配置 <strong>{{ filterCount }}</strong> 个筛选条件
            </template>
          </ElAlert>
        </div>
      </ElFormItem>

      <ElFormItem label="设为默认视图">
        <ElSwitch v-model="form.isDefault" />
        <span class="form-item-tip">默认视图将在页面加载时自动激活</span>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { ViewFormData, HorizontalViewConfig } from '@/types/view'

  interface Props {
    visible: boolean
    editView?: HorizontalViewConfig | null
    ownershipOptions?: string[]
    chainOptions?: string[]
    statusOptions?: string[]
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', formData: ViewFormData): void
  }

  const props = withDefaults(defineProps<Props>(), {
    editView: null,
    ownershipOptions: () => ['个人', '团队', '外部', '合作方'],
    chainOptions: () => ['ETH', 'ARB', 'OP', 'BASE', 'ZKSYNC', 'POLYGON', 'BSC', 'AVAX'],
    statusOptions: () => ['正常', '监控中', '已归档', '待处理']
  })

  const emit = defineEmits<Emits>()

  // 对话框显示状态
  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  // 是否为编辑模式
  const isEdit = computed(() => !!props.editView)

  // 表单引用
  const formRef = ref<FormInstance>()

  // 提交加载状态
  const submitLoading = ref(false)

  // 表单数据
  const form = ref<ViewFormData>({
    name: '',
    filterCondition: {},
    sortRules: [],
    visibleFields: [],
    isDefault: false
  })

  // 表单验证规则
  const rules: FormRules = {
    name: [
      { required: true, message: '请输入视图名称', trigger: 'blur' },
      { min: 1, max: 20, message: '视图名称长度为1-20个字符', trigger: 'blur' }
    ]
  }

  // 已配置的筛选条件数量
  const filterCount = computed(() => {
    let count = 0
    const filter = form.value.filterCondition

    if (filter.ownership && filter.ownership.length > 0) count++
    if (filter.mainChains && filter.mainChains.length > 0) count++
    if (filter.status && filter.status.length > 0) count++
    if (filter.totalValueMin !== undefined || filter.totalValueMax !== undefined) count++
    if (filter.addressActivityMin !== undefined || filter.addressActivityMax !== undefined) count++

    return count
  })

  // 是否有筛选条件
  const hasFilters = computed(() => filterCount.value > 0)

  /**
   * 重置表单
   */
  const resetForm = () => {
    form.value = {
      name: '',
      filterCondition: {},
      sortRules: [],
      visibleFields: [],
      isDefault: false
    }
    formRef.value?.clearValidate()
  }

  /**
   * 初始化表单（编辑模式）
   */
  const initForm = (view: HorizontalViewConfig) => {
    form.value = {
      name: view.name,
      filterCondition: { ...view.filterCondition },
      sortRules: [...view.sortRules],
      visibleFields: [...view.visibleFields],
      isDefault: view.isDefault
    }
  }

  /**
   * 处理表单提交
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      submitLoading.value = true

      // 触发提交事件
      emit('submit', { ...form.value })

      // 提交成功后关闭对话框
      setTimeout(() => {
        submitLoading.value = false
        dialogVisible.value = false
      }, 300)
    } catch (error) {
      console.error('表单验证失败:', error)
      submitLoading.value = false
    }
  }

  /**
   * 处理对话框关闭
   */
  const handleClose = () => {
    resetForm()
  }

  // 监听编辑视图变化
  watch(
    () => props.editView,
    (newVal) => {
      if (newVal) {
        initForm(newVal)
      } else {
        resetForm()
      }
    },
    { immediate: true }
  )

  // 监听对话框显示状态
  watch(dialogVisible, (val) => {
    if (val && props.editView) {
      initForm(props.editView)
    } else if (!val) {
      resetForm()
    }
  })
</script>

<style scoped lang="scss">
  .filter-container {
    width: 100%;

    .filter-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      .filter-label {
        min-width: 110px;
        font-size: 14px;
        color: var(--el-text-color-regular);
      }

      .range-input {
        display: flex;
        gap: 8px;
        align-items: center;

        .range-separator {
          color: var(--el-text-color-placeholder);
        }
      }
    }
  }

  .form-item-tip {
    margin-left: 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
</style>
