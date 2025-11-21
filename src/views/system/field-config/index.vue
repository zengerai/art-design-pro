<template>
  <div class="field-config-page art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" :icon="Plus" @click="handleAdd">新增字段</ElButton>
            <ElButton :icon="Upload" @click="handleAddEnumValue">管理枚举值</ElButton>
          </ElSpace>
        </template>
        <template #right>
          <ElSelect
            v-model="selectedCategory"
            placeholder="筛选类别"
            style="width: 200px"
            clearable
            @change="handleCategoryChange"
          >
            <ElOption label="全部" value="" />
            <ElOption label="钱包监控" value="wallet_monitoring" />
          </ElSelect>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ElTable v-loading="loading" :data="data" border style="width: 100%">
        <ElTableColumn type="index" width="60" label="序号" />
        <ElTableColumn prop="fieldName" label="字段名称" min-width="150" />
        <ElTableColumn prop="fieldLabel" label="字段标签" min-width="120" />
        <ElTableColumn prop="fieldType" label="字段类型" width="120">
          <template #default="{ row }">
            <ElTag v-if="row.fieldType === 'text'" type="info">文本</ElTag>
            <ElTag v-else-if="row.fieldType === 'number'" type="success">数字</ElTag>
            <ElTag v-else-if="row.fieldType === 'datetime'" type="warning">日期时间</ElTag>
            <ElTag v-else-if="row.fieldType === 'multiSelect'" type="primary">多选</ElTag>
            <ElTag v-else>{{ row.fieldType }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="category" label="所属类别" width="120" />
        <ElTableColumn prop="isSystem" label="字段属性" width="100">
          <template #default="{ row }">
            <ElTag v-if="row.isSystem" type="danger">系统字段</ElTag>
            <ElTag v-else type="success">自定义</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="sortOrder" label="排序值" width="80" />
        <ElTableColumn prop="isVisible" label="是否可见" width="100">
          <template #default="{ row }">
            <ElSwitch
              v-model="row.isVisible"
              :disabled="loading"
              @change="handleVisibilityChange(row)"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <ElButton type="primary" link :icon="Edit" @click="handleEdit(row)">编辑</ElButton>
            <ElButton
              type="danger"
              link
              :icon="Delete"
              :disabled="row.isSystem"
              @click="handleDelete(row)"
            >
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <!-- 新增/编辑字段对话框 -->
    <ElDialog
      v-model="dialogVisible"
      :title="editData ? '编辑字段' : '新增字段'"
      width="600px"
      @close="handleDialogClose"
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="120px">
        <ElFormItem label="字段名称" prop="fieldName">
          <ElInput
            v-model="form.fieldName"
            placeholder="请输入字段名称（英文，如：ownership）"
            :disabled="!!editData"
          />
        </ElFormItem>
        <ElFormItem label="字段标签" prop="fieldLabel">
          <ElInput v-model="form.fieldLabel" placeholder="请输入字段标签（中文，如：归属标签）" />
        </ElFormItem>
        <ElFormItem label="字段类型" prop="fieldType">
          <ElSelect v-model="form.fieldType" placeholder="请选择字段类型" style="width: 100%">
            <ElOption label="文本" value="text" />
            <ElOption label="数字" value="number" />
            <ElOption label="日期时间" value="datetime" />
            <ElOption label="多选" value="multiSelect" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="所属类别" prop="category">
          <ElSelect v-model="form.category" placeholder="请选择所属类别" style="width: 100%">
            <ElOption label="钱包监控" value="wallet_monitoring" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="排序值" prop="sortOrder">
          <ElInputNumber
            v-model="form.sortOrder"
            :min="0"
            :controls="false"
            placeholder="请输入排序值"
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem label="是否可见" prop="isVisible">
          <ElSwitch v-model="form.isVisible" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit" :loading="submitLoading">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 枚举值管理对话框 -->
    <ElDialog
      v-model="enumDialogVisible"
      title="管理枚举值"
      width="800px"
      @close="handleEnumDialogClose"
    >
      <div style="margin-bottom: 16px">
        <ElSpace wrap>
          <ElSelect
            v-model="selectedFieldName"
            placeholder="选择字段"
            style="width: 200px"
            @change="loadEnumValues"
          >
            <ElOption
              v-for="field in multiSelectFields"
              :key="field.fieldName"
              :label="field.fieldLabel"
              :value="field.fieldName"
            />
          </ElSelect>
          <ElButton
            type="primary"
            :icon="Plus"
            :disabled="!selectedFieldName"
            @click="handleAddEnum"
          >
            新增枚举值
          </ElButton>
        </ElSpace>
      </div>

      <ElTable v-loading="enumLoading" :data="enumValues" border>
        <ElTableColumn prop="value" label="值" width="150" />
        <ElTableColumn prop="label" label="标签" width="150" />
        <ElTableColumn prop="color" label="颜色" width="120">
          <template #default="{ row }">
            <ElTag v-if="row.color" :type="row.color">{{ row.color }}</ElTag>
            <span v-else>-</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="sortOrder" label="排序" width="80" />
        <ElTableColumn prop="isActive" label="启用状态" width="100">
          <template #default="{ row }">
            <ElSwitch
              v-model="row.isActive"
              :disabled="enumLoading"
              @change="handleEnumActiveChange(row)"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <ElButton type="primary" link :icon="Edit" @click="handleEditEnum(row)">编辑</ElButton>
            <ElButton type="danger" link :icon="Delete" @click="handleDeleteEnum(row)"
              >删除</ElButton
            >
          </template>
        </ElTableColumn>
      </ElTable>

      <template #footer>
        <ElButton @click="enumDialogVisible = false">关闭</ElButton>
      </template>
    </ElDialog>

    <!-- 新增/编辑枚举值对话框 -->
    <ElDialog
      v-model="enumFormDialogVisible"
      :title="editEnumData ? '编辑枚举值' : '新增枚举值'"
      width="500px"
      @close="handleEnumFormDialogClose"
    >
      <ElForm ref="enumFormRef" :model="enumForm" :rules="enumRules" label-width="100px">
        <ElFormItem label="值" prop="value">
          <ElInput v-model="enumForm.value" placeholder="请输入枚举值" :disabled="!!editEnumData" />
        </ElFormItem>
        <ElFormItem label="标签" prop="label">
          <ElInput v-model="enumForm.label" placeholder="请输入标签" />
        </ElFormItem>
        <ElFormItem label="颜色" prop="color">
          <ElSelect
            v-model="enumForm.color"
            placeholder="请选择颜色（可选）"
            style="width: 100%"
            clearable
          >
            <ElOption label="Primary" value="primary" />
            <ElOption label="Success" value="success" />
            <ElOption label="Warning" value="warning" />
            <ElOption label="Danger" value="danger" />
            <ElOption label="Info" value="info" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="排序值" prop="sortOrder">
          <ElInputNumber
            v-model="enumForm.sortOrder"
            :min="0"
            :controls="false"
            placeholder="请输入排序值"
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem label="启用状态" prop="isActive">
          <ElSwitch v-model="enumForm.isActive" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="enumFormDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleEnumSubmit" :loading="enumSubmitLoading"
          >确定</ElButton
        >
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue'
  import { ElMessage, ElMessageBox, FormRules, FormInstance } from 'element-plus'
  import { Plus, Edit, Delete, Upload } from '@element-plus/icons-vue'
  import ArtTableHeader from '@/components/core/tables/art-table-header/index.vue'
  import {
    fetchFieldMetadataList,
    createFieldMetadata,
    updateFieldMetadata,
    deleteFieldMetadata,
    fetchEnumValuesList,
    createEnumValue,
    updateEnumValue,
    deleteEnumValue
  } from '@/api/field-config'

  defineOptions({ name: 'FieldConfig' })

  // 对话框
  const dialogVisible = ref(false)
  const editData = ref<Api.FieldMetadata.FieldMetadata | null>(null)
  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)

  // 数据和加载状态
  const data = ref<Api.FieldMetadata.FieldMetadata[]>([])
  const loading = ref(false)
  const columnChecks = ref<string[]>([])

  // 枚举值管理
  const enumDialogVisible = ref(false)
  const enumFormDialogVisible = ref(false)
  const selectedFieldName = ref('')
  const enumLoading = ref(false)
  const enumValues = ref<Api.EnumValues.EnumValue[]>([])
  const editEnumData = ref<Api.EnumValues.EnumValue | null>(null)
  const enumFormRef = ref<FormInstance>()
  const enumSubmitLoading = ref(false)

  // 类别筛选
  const selectedCategory = ref('')

  // 表单数据
  const form = reactive<Partial<Api.FieldMetadata.CreateFieldParams>>({
    fieldName: '',
    fieldLabel: '',
    fieldType: 'text',
    category: 'wallet_monitoring',
    sortOrder: 0,
    isVisible: true
  })

  // 枚举值表单数据
  const enumForm = reactive<Partial<Api.EnumValues.CreateEnumValueParams>>({
    fieldName: '',
    value: '',
    label: '',
    color: undefined,
    sortOrder: 0,
    isActive: true
  })

  // 表单验证规则
  const rules: FormRules = {
    fieldName: [{ required: true, message: '请输入字段名称', trigger: 'blur' }],
    fieldLabel: [{ required: true, message: '请输入字段标签', trigger: 'blur' }],
    fieldType: [{ required: true, message: '请选择字段类型', trigger: 'change' }],
    category: [{ required: true, message: '请选择所属类别', trigger: 'change' }]
  }

  // 枚举值表单验证规则
  const enumRules: FormRules = {
    value: [{ required: true, message: '请输入枚举值', trigger: 'blur' }],
    label: [{ required: true, message: '请输入标签', trigger: 'blur' }]
  }

  // 多选字段列表（用于枚举值管理）
  const multiSelectFields = computed(() => {
    return data.value.filter((field) => field.fieldType === 'multiSelect')
  })

  // 加载字段列表
  const refreshData = async () => {
    try {
      loading.value = true
      const res = await fetchFieldMetadataList(selectedCategory.value || undefined)
      data.value = res || []
    } catch (error) {
      console.error('加载字段列表失败:', error)
      ElMessage.error('加载字段列表失败')
    } finally {
      loading.value = false
    }
  }

  // 类别变化
  const handleCategoryChange = () => {
    refreshData()
  }

  // 添加
  const handleAdd = () => {
    editData.value = null
    Object.assign(form, {
      fieldName: '',
      fieldLabel: '',
      fieldType: 'text',
      category: 'wallet_monitoring',
      sortOrder: 0,
      isVisible: true
    })
    dialogVisible.value = true
  }

  // 编辑
  const handleEdit = (row: Api.FieldMetadata.FieldMetadata) => {
    editData.value = row
    Object.assign(form, {
      fieldName: row.fieldName,
      fieldLabel: row.fieldLabel,
      fieldType: row.fieldType,
      category: row.category,
      sortOrder: row.sortOrder,
      isVisible: row.isVisible
    })
    dialogVisible.value = true
  }

  // 删除
  const handleDelete = async (row: Api.FieldMetadata.FieldMetadata) => {
    if (row.isSystem) {
      ElMessage.warning('系统字段不可删除')
      return
    }
    try {
      await ElMessageBox.confirm(`确定要删除字段 ${row.fieldLabel} 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await deleteFieldMetadata(row.id)
      ElMessage.success('删除成功')
      refreshData()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除失败:', error)
      }
    }
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return
    try {
      await formRef.value.validate()
      submitLoading.value = true

      if (editData.value) {
        // 更新
        await updateFieldMetadata({
          id: editData.value.id,
          updateFields: form
        } as Api.FieldMetadata.UpdateFieldParams)
      } else {
        // 新增
        await createFieldMetadata(form as Api.FieldMetadata.CreateFieldParams)
      }

      ElMessage.success(editData.value ? '更新成功' : '新增成功')
      dialogVisible.value = false
      refreshData()
    } catch (error) {
      console.error('操作失败:', error)
    } finally {
      submitLoading.value = false
    }
  }

  // 关闭对话框
  const handleDialogClose = () => {
    formRef.value?.resetFields()
  }

  // 可见性变化
  const handleVisibilityChange = async (row: Api.FieldMetadata.FieldMetadata) => {
    try {
      await updateFieldMetadata({
        id: row.id,
        updateFields: { isVisible: row.isVisible }
      } as Api.FieldMetadata.UpdateFieldParams)
      ElMessage.success('更新成功')
    } catch (error) {
      console.error('更新失败:', error)
      ElMessage.error('更新失败')
      row.isVisible = !row.isVisible // 恢复原值
    }
  }

  // 管理枚举值
  const handleAddEnumValue = () => {
    enumDialogVisible.value = true
    if (multiSelectFields.value.length > 0 && !selectedFieldName.value) {
      selectedFieldName.value = multiSelectFields.value[0].fieldName
      loadEnumValues()
    }
  }

  // 加载枚举值
  const loadEnumValues = async () => {
    if (!selectedFieldName.value) return
    try {
      enumLoading.value = true
      const res = await fetchEnumValuesList(selectedFieldName.value)
      enumValues.value = res || []
    } catch (error) {
      console.error('加载枚举值失败:', error)
      ElMessage.error('加载枚举值失败')
    } finally {
      enumLoading.value = false
    }
  }

  // 关闭枚举值对话框
  const handleEnumDialogClose = () => {
    selectedFieldName.value = ''
    enumValues.value = []
  }

  // 添加枚举值
  const handleAddEnum = () => {
    editEnumData.value = null
    Object.assign(enumForm, {
      fieldName: selectedFieldName.value,
      value: '',
      label: '',
      color: undefined,
      sortOrder: 0,
      isActive: true
    })
    enumFormDialogVisible.value = true
  }

  // 编辑枚举值
  const handleEditEnum = (row: Api.EnumValues.EnumValue) => {
    editEnumData.value = row
    Object.assign(enumForm, {
      fieldName: row.fieldName,
      value: row.value,
      label: row.label,
      color: row.color,
      sortOrder: row.sortOrder,
      isActive: row.isActive
    })
    enumFormDialogVisible.value = true
  }

  // 删除枚举值
  const handleDeleteEnum = async (row: Api.EnumValues.EnumValue) => {
    try {
      await ElMessageBox.confirm(`确定要删除枚举值 ${row.label} 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await deleteEnumValue(row.id)
      ElMessage.success('删除成功')
      loadEnumValues()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除失败:', error)
      }
    }
  }

  // 提交枚举值表单
  const handleEnumSubmit = async () => {
    if (!enumFormRef.value) return
    try {
      await enumFormRef.value.validate()
      enumSubmitLoading.value = true

      if (editEnumData.value) {
        // 更新
        await updateEnumValue({
          id: editEnumData.value.id,
          updateFields: enumForm
        } as Api.EnumValues.UpdateEnumValueParams)
      } else {
        // 新增
        await createEnumValue(enumForm as Api.EnumValues.CreateEnumValueParams)
      }

      ElMessage.success(editEnumData.value ? '更新成功' : '新增成功')
      enumFormDialogVisible.value = false
      loadEnumValues()
    } catch (error) {
      console.error('操作失败:', error)
    } finally {
      enumSubmitLoading.value = false
    }
  }

  // 关闭枚举值表单对话框
  const handleEnumFormDialogClose = () => {
    enumFormRef.value?.resetFields()
  }

  // 枚举值启用状态变化
  const handleEnumActiveChange = async (row: Api.EnumValues.EnumValue) => {
    try {
      await updateEnumValue({
        id: row.id,
        updateFields: { isActive: row.isActive }
      } as Api.EnumValues.UpdateEnumValueParams)
      ElMessage.success('更新成功')
    } catch (error) {
      console.error('更新失败:', error)
      ElMessage.error('更新失败')
      row.isActive = !row.isActive // 恢复原值
    }
  }

  onMounted(() => {
    // 页面加载时获取数据
    refreshData()
  })
</script>

<style scoped lang="scss">
  .field-config-page {
    padding: 16px;
  }
</style>
