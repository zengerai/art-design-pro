<!-- 支持预览和字段映射的 Excel 导入组件 -->
<template>
  <div class="inline-block">
    <ElUpload
      :auto-upload="false"
      accept=".xlsx, .xls"
      :show-file-list="false"
      @change="handleFileChange"
    >
      <ElButton type="primary" v-ripple>
        <slot>{{ importText }}</slot>
      </ElButton>
    </ElUpload>

    <!-- 导入预览对话框 -->
    <ElDialog
      v-model="previewVisible"
      title="导入数据预览"
      width="90%"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <!-- 步骤指示器 -->
      <ElSteps :active="currentStep" finish-status="success" align-center class="mb-4">
        <ElStep title="上传文件" />
        <ElStep title="字段映射" />
        <ElStep title="数据预览" />
        <ElStep title="导入确认" />
      </ElSteps>

      <!-- 步骤1: 文件信息 -->
      <div v-if="currentStep === 0" class="step-content">
        <ElAlert type="success" :closable="false" class="mb-4">
          <template #title>
            文件已上传成功：{{ fileName }} (共 {{ rawData.length }} 行数据)
          </template>
        </ElAlert>
        <ElButton type="primary" @click="nextStep">下一步：配置字段映射</ElButton>
      </div>

      <!-- 步骤2: 字段映射 -->
      <div v-if="currentStep === 1" class="step-content">
        <ElAlert type="info" :closable="false" class="mb-4">
          请为每个系统字段选择对应的Excel列。系统会自动检测匹配的列名。
        </ElAlert>

        <div class="field-mapping-container">
          <div v-for="field in fieldMappings" :key="field.systemField" class="mapping-row">
            <div class="field-label">
              <span class="field-name">{{ field.label }}</span>
              <span v-if="field.required" class="required-mark">*</span>
              <span class="field-type">{{ getFieldTypeLabel(field.type) }}</span>
            </div>
            <ElSelect
              v-model="field.excelColumn"
              placeholder="选择Excel列"
              clearable
              class="field-select"
            >
              <ElOption v-for="col in excelColumns" :key="col" :label="col" :value="col" />
            </ElSelect>
            <div class="field-preview">
              <span v-if="field.excelColumn && rawData[0]">
                示例: {{ rawData[0][field.excelColumn] || '-' }}
              </span>
            </div>
          </div>
        </div>

        <div class="step-actions">
          <ElButton @click="prevStep">上一步</ElButton>
          <ElButton type="primary" @click="applyMapping">下一步：预览数据</ElButton>
        </div>
      </div>

      <!-- 步骤3: 数据预览 -->
      <div v-if="currentStep === 2" class="step-content">
        <ElAlert type="info" :closable="false" class="mb-4">
          以下是根据字段映射转换后的数据预览（显示前10条）
        </ElAlert>

        <ElTable :data="previewData.slice(0, 10)" border max-height="400">
          <ElTableColumn
            v-for="field in fieldMappings.filter((f) => f.excelColumn)"
            :key="field.systemField"
            :label="field.label"
            :prop="field.systemField"
            min-width="120"
          >
            <template #default="{ row }">
              <span v-if="field.type === 'array'" class="preview-array">
                {{
                  Array.isArray(row[field.systemField]) ? row[field.systemField].join(', ') : '-'
                }}
              </span>
              <span v-else-if="field.type === 'number'">
                {{ row[field.systemField] ?? '-' }}
              </span>
              <span v-else>
                {{ row[field.systemField] || '-' }}
              </span>
            </template>
          </ElTableColumn>
        </ElTable>

        <div class="preview-summary mt-4">
          <ElDescriptions :column="3" border>
            <ElDescriptionsItem label="总行数">{{ previewData.length }}</ElDescriptionsItem>
            <ElDescriptionsItem label="已映射字段">
              {{ fieldMappings.filter((f) => f.excelColumn).length }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="必填字段完整性">
              {{ checkRequiredFields() ? '✓ 完整' : '✗ 缺失' }}
            </ElDescriptionsItem>
          </ElDescriptions>
        </div>

        <div class="step-actions mt-4">
          <ElButton @click="prevStep">上一步</ElButton>
          <ElButton type="primary" @click="nextStep">下一步：确认导入</ElButton>
        </div>
      </div>

      <!-- 步骤4: 确认导入 -->
      <div v-if="currentStep === 3" class="step-content">
        <ElAlert type="warning" :closable="false" class="mb-4">
          <template #title>
            即将导入 {{ previewData.length }} 条数据，请确认无误后点击"确认导入"按钮
          </template>
        </ElAlert>

        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="文件名">{{ fileName }}</ElDescriptionsItem>
          <ElDescriptionsItem label="数据行数">{{ previewData.length }}</ElDescriptionsItem>
          <ElDescriptionsItem label="必填字段" :span="2">
            <ElTag
              v-for="field in fieldMappings.filter((f) => f.required && f.excelColumn)"
              :key="field.systemField"
              type="success"
              size="small"
              class="mr-2"
            >
              {{ field.label }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="可选字段" :span="2">
            <ElTag
              v-for="field in fieldMappings.filter((f) => !f.required && f.excelColumn)"
              :key="field.systemField"
              type="info"
              size="small"
              class="mr-2"
            >
              {{ field.label }}
            </ElTag>
          </ElDescriptionsItem>
        </ElDescriptions>

        <div class="step-actions mt-4">
          <ElButton @click="prevStep">上一步</ElButton>
          <ElButton type="primary" :loading="importing" @click="confirmImport"> 确认导入 </ElButton>
        </div>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import * as XLSX from 'xlsx'
  import type { UploadFile } from 'element-plus'
  import { ElMessage } from 'element-plus'

  defineOptions({ name: 'ArtExcelImportPreview' })

  interface Props {
    importText?: string
    fieldMappingConfig?: FieldMapping[]
  }

  interface FieldMapping {
    systemField: string // 系统字段名
    label: string // 字段显示名称
    excelColumn?: string // Excel列名（用户选择）
    type: 'string' | 'number' | 'array' | 'datetime' // 字段类型
    required: boolean // 是否必填
    defaultValue?: any // 默认值
    transform?: (value: any) => any // 转换函数
  }

  const props = withDefaults(defineProps<Props>(), {
    importText: '导入Excel',
    fieldMappingConfig: () => []
  })

  const emit = defineEmits<{
    'import-success': [data: Array<Record<string, any>>]
    'import-error': [error: Error]
  }>()

  // 状态
  const previewVisible = ref(false)
  const currentStep = ref(0)
  const fileName = ref('')
  const rawData = ref<Array<Record<string, any>>>([])
  const excelColumns = ref<string[]>([])
  const previewData = ref<Array<Record<string, any>>>([])
  const importing = ref(false)

  // 字段映射配置（如果没有传入，使用默认配置）
  const fieldMappings = ref<FieldMapping[]>(
    props.fieldMappingConfig.length > 0
      ? props.fieldMappingConfig
      : [
          {
            systemField: 'walletAddress',
            label: '钱包地址',
            type: 'string',
            required: true
          },
          {
            systemField: 'ownership',
            label: '归属标签',
            type: 'array',
            required: false
          },
          {
            systemField: 'mainChains',
            label: '主链列表',
            type: 'array',
            required: false
          },
          {
            systemField: 'totalValue',
            label: '钱包总价值',
            type: 'number',
            required: false,
            defaultValue: 0
          },
          {
            systemField: 'addressActivity',
            label: '地址活跃天数',
            type: 'number',
            required: false,
            defaultValue: 0
          },
          {
            systemField: 'activityTags',
            label: '活动标签',
            type: 'array',
            required: false
          },
          {
            systemField: 'categoryTags',
            label: '分类标签',
            type: 'array',
            required: false
          },
          {
            systemField: 'status',
            label: '状态标签',
            type: 'array',
            required: false
          },
          {
            systemField: 'alertMark',
            label: '警报标记',
            type: 'array',
            required: false
          },
          {
            systemField: 'lastQueryTime',
            label: '查询更新时间',
            type: 'datetime',
            required: false
          },
          {
            systemField: 'remark',
            label: '备注信息',
            type: 'string',
            required: false,
            defaultValue: ''
          }
        ]
  )

  // Excel 导入工具函数
  async function importExcel(file: File): Promise<Array<Record<string, any>>> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const results = XLSX.utils.sheet_to_json(worksheet)
          resolve(results as Array<Record<string, any>>)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = (error) => reject(error)
      reader.readAsArrayBuffer(file)
    })
  }

  // 自动检测字段映射
  const autoDetectMapping = () => {
    if (excelColumns.value.length === 0 || rawData.value.length === 0) return

    fieldMappings.value.forEach((field) => {
      // 尝试通过标签名称匹配
      const matchedColumn = excelColumns.value.find(
        (col) => col === field.label || col === field.systemField
      )
      if (matchedColumn) {
        field.excelColumn = matchedColumn
      }
    })
  }

  // 处理文件上传
  const handleFileChange = async (uploadFile: UploadFile) => {
    try {
      if (!uploadFile.raw) return

      fileName.value = uploadFile.name
      rawData.value = await importExcel(uploadFile.raw)

      if (rawData.value.length === 0) {
        ElMessage.warning('Excel文件中没有数据')
        return
      }

      // 提取Excel列名
      excelColumns.value = Object.keys(rawData.value[0])

      // 自动检测字段映射
      autoDetectMapping()

      // 重置步骤并显示对话框
      currentStep.value = 0
      previewVisible.value = true
    } catch (error) {
      ElMessage.error('文件读取失败: ' + (error as Error).message)
      emit('import-error', error as Error)
    }
  }

  // 应用字段映射并生成预览数据
  const applyMapping = () => {
    // 检查必填字段
    const missingRequired = fieldMappings.value
      .filter((f) => f.required && !f.excelColumn)
      .map((f) => f.label)

    if (missingRequired.length > 0) {
      ElMessage.warning(`请映射以下必填字段: ${missingRequired.join(', ')}`)
      return
    }

    // 转换数据
    previewData.value = rawData.value.map((row) => {
      const transformed: Record<string, any> = {}

      fieldMappings.value.forEach((field) => {
        if (!field.excelColumn) {
          // 如果没有映射，使用默认值
          if (field.defaultValue !== undefined) {
            transformed[field.systemField] = field.defaultValue
          }
          return
        }

        const value = row[field.excelColumn]

        // 根据字段类型转换
        if (field.type === 'array') {
          transformed[field.systemField] = parseArrayField(value)
        } else if (field.type === 'number') {
          transformed[field.systemField] = parseFloat(value) || field.defaultValue || 0
        } else if (field.type === 'datetime') {
          transformed[field.systemField] = value || null
        } else {
          transformed[field.systemField] = value || field.defaultValue || ''
        }

        // 应用自定义转换函数
        if (field.transform) {
          transformed[field.systemField] = field.transform(transformed[field.systemField])
        }
      })

      return transformed
    })

    nextStep()
  }

  // 解析数组字段
  const parseArrayField = (value: any): string[] => {
    if (Array.isArray(value)) return value
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v)
    }
    return []
  }

  // 检查必填字段
  const checkRequiredFields = (): boolean => {
    return fieldMappings.value.filter((f) => f.required).every((f) => f.excelColumn)
  }

  // 获取字段类型标签
  const getFieldTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      string: '文本',
      number: '数字',
      array: '数组',
      datetime: '时间'
    }
    return typeMap[type] || type
  }

  // 步骤控制
  const nextStep = () => {
    if (currentStep.value < 3) {
      currentStep.value++
    }
  }

  const prevStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--
    }
  }

  // 确认导入
  const confirmImport = async () => {
    try {
      importing.value = true
      emit('import-success', previewData.value)
      previewVisible.value = false
      handleDialogClose()
    } catch (error) {
      ElMessage.error('导入失败')
      emit('import-error', error as Error)
    } finally {
      importing.value = false
    }
  }

  // 关闭对话框
  const handleDialogClose = () => {
    currentStep.value = 0
    rawData.value = []
    excelColumns.value = []
    previewData.value = []
    fileName.value = ''
    // 重置字段映射
    fieldMappings.value.forEach((f) => {
      f.excelColumn = undefined
    })
  }
</script>

<style scoped lang="scss">
  .step-content {
    min-height: 300px;
    padding: 20px 0;
  }

  .field-mapping-container {
    max-height: 400px;
    overflow-y: auto;
  }

  .mapping-row {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid var(--el-border-color);

    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }

  .field-label {
    display: flex;
    flex: 0 0 200px;
    gap: 8px;
    align-items: center;

    .field-name {
      font-weight: 500;
    }

    .required-mark {
      font-weight: bold;
      color: var(--el-color-danger);
    }

    .field-type {
      padding: 2px 8px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      background-color: var(--el-fill-color);
      border-radius: 4px;
    }
  }

  .field-select {
    flex: 1;
  }

  .field-preview {
    flex: 0 0 200px;
    overflow: hidden;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .preview-array {
    color: var(--el-color-primary);
  }

  .preview-summary {
    margin-top: 16px;
  }

  .step-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    margin-top: 24px;
  }
</style>
