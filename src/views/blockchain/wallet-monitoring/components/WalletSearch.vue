<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  >
  </ArtSearchBar>
</template>

<script setup lang="ts">
  interface Props {
    modelValue: Record<string, any>
    ownershipOptions?: string[]
    chainOptions?: string[]
    statusOptions?: string[]
  }

  interface Emits {
    (e: 'update:modelValue', value: Record<string, any>): void
    (e: 'search', params: Record<string, any>): void
    (e: 'reset'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    ownershipOptions: () => [],
    chainOptions: () => [],
    statusOptions: () => []
  })
  const emit = defineEmits<Emits>()

  const searchBarRef = ref()

  /**
   * 表单数据双向绑定
   */
  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  /**
   * 表单校验规则
   */
  const rules = {}

  /**
   * 搜索表单配置项
   */
  const formItems = computed(() => [
    {
      label: '钱包地址',
      key: 'walletAddress',
      type: 'input',
      placeholder: '请输入钱包地址',
      clearable: true
    },
    {
      label: '归属标签',
      key: 'ownership',
      type: 'select',
      props: {
        placeholder: '请选择归属标签',
        options: props.ownershipOptions.map((item) => ({ label: item, value: item })),
        multiple: true,
        clearable: true
      }
    },
    {
      label: '主链列表',
      key: 'mainChains',
      type: 'select',
      props: {
        placeholder: '请选择主链',
        options: props.chainOptions.map((item) => ({ label: item, value: item })),
        multiple: true,
        clearable: true
      }
    },
    {
      label: '状态标签',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        options: props.statusOptions.map((item) => ({ label: item, value: item })),
        multiple: true,
        clearable: true
      }
    },
    {
      label: '钱包总价值',
      key: 'totalValueRange',
      type: 'input',
      placeholder: '最小值-最大值',
      clearable: true
    },
    {
      label: '查询日期',
      key: 'daterange',
      type: 'datetime',
      props: {
        style: { width: '100%' },
        placeholder: '请选择日期范围',
        type: 'daterange',
        rangeSeparator: '至',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期',
        valueFormat: 'YYYY-MM-DD',
        shortcuts: [
          { text: '今日', value: [new Date(), new Date()] },
          { text: '最近一周', value: [new Date(Date.now() - 604800000), new Date()] },
          { text: '最近一个月', value: [new Date(Date.now() - 2592000000), new Date()] }
        ]
      }
    }
  ])

  /**
   * 处理重置事件
   */
  const handleReset = () => {
    emit('reset')
  }

  /**
   * 处理搜索事件
   * 验证表单后触发搜索
   */
  const handleSearch = async () => {
    await searchBarRef.value.validate()
    emit('search', formData.value)
  }
</script>
