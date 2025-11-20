<template>
  <div class="wallet-monitoring-page art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" :icon="Plus" @click="handleAdd">新增钱包</ElButton>
            <ArtExcelImport @import-success="handleImportSuccess" @import-error="handleImportError">
              <template #import-text>导入Excel</template>
            </ArtExcelImport>
            <ArtExcelExport
              :data="data"
              :columns="exportColumns"
              filename="钱包监控数据"
              sheetName="钱包列表"
              button-text="导出Excel"
              @export-success="handleExportSuccess"
            />
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        ref="tableRef"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <!-- 归属标签 - 可编辑 -->
        <template #ownership="{ row }">
          <EditableCell
            v-model="row.ownership"
            type="multiSelect"
            :options="ownershipOptions"
            placeholder="选择归属标签"
            @save="(value) => handleCellSave(row, 'ownership', value)"
          >
            <template #display="{ value }">
              <div class="flex flex-wrap gap-1">
                <ElTag v-for="tag in value" :key="tag" size="small" type="primary">{{ tag }}</ElTag>
                <span v-if="!value || value.length === 0" class="text-gray-400">-</span>
              </div>
            </template>
          </EditableCell>
        </template>

        <!-- 查询更新时间 - 可编辑 -->
        <template #lastQueryTime="{ row }">
          <EditableCell
            v-model="row.lastQueryTime"
            type="datetime"
            placeholder="选择时间"
            @save="(value) => handleCellSave(row, 'lastQueryTime', value)"
            :formatter="(value) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-')"
          />
        </template>

        <!-- 钱包总价值 - 可编辑 -->
        <template #totalValue="{ row }">
          <EditableCell
            v-model="row.totalValue"
            type="number"
            :min="0"
            :precision="2"
            placeholder="输入金额"
            @save="(value) => handleCellSave(row, 'totalValue', value)"
            :formatter="(value) => (value ? `$${value.toLocaleString()}` : '$0')"
          />
        </template>

        <!-- 主链列表 - 可编辑 -->
        <template #mainChains="{ row }">
          <EditableCell
            v-model="row.mainChains"
            type="multiSelect"
            :options="chainOptions"
            placeholder="选择主链"
            @save="(value) => handleCellSave(row, 'mainChains', value)"
          >
            <template #display="{ value }">
              <div class="flex flex-wrap gap-1">
                <ElTag v-for="chain in value" :key="chain" size="small" type="success">{{
                  chain
                }}</ElTag>
                <span v-if="!value || value.length === 0" class="text-gray-400">-</span>
              </div>
            </template>
          </EditableCell>
        </template>

        <!-- 地址活跃天数 - 可编辑 -->
        <template #addressActivity="{ row }">
          <EditableCell
            v-model="row.addressActivity"
            type="number"
            :min="0"
            :precision="0"
            placeholder="输入天数"
            @save="(value) => handleCellSave(row, 'addressActivity', value)"
            :formatter="(value) => (value ? String(value) : '0')"
          />
        </template>

        <!-- 活动标签 - 可编辑 -->
        <template #activityTags="{ row }">
          <EditableCell
            v-model="row.activityTags"
            type="multiSelect"
            :options="activityTagOptions"
            placeholder="选择活动标签"
            @save="(value) => handleCellSave(row, 'activityTags', value)"
          >
            <template #display="{ value }">
              <div class="flex flex-wrap gap-1">
                <ElTag v-for="tag in value" :key="tag" size="small" type="warning">{{ tag }}</ElTag>
                <span v-if="!value || value.length === 0" class="text-gray-400">-</span>
              </div>
            </template>
          </EditableCell>
        </template>

        <!-- 分类标签 - 可编辑 -->
        <template #categoryTags="{ row }">
          <EditableCell
            v-model="row.categoryTags"
            type="multiSelect"
            :options="categoryTagOptions"
            placeholder="选择分类标签"
            @save="(value) => handleCellSave(row, 'categoryTags', value)"
          >
            <template #display="{ value }">
              <div class="flex flex-wrap gap-1">
                <ElTag v-for="tag in value" :key="tag" size="small" type="info">{{ tag }}</ElTag>
                <span v-if="!value || value.length === 0" class="text-gray-400">-</span>
              </div>
            </template>
          </EditableCell>
        </template>

        <!-- 状态标签 - 可编辑 -->
        <template #status="{ row }">
          <EditableCell
            v-model="row.status"
            type="multiSelect"
            :options="statusOptions"
            placeholder="选择状态"
            @save="(value) => handleCellSave(row, 'status', value)"
          >
            <template #display="{ value }">
              <div class="flex flex-wrap gap-1">
                <ElTag v-for="tag in value" :key="tag" size="small">{{ tag }}</ElTag>
                <span v-if="!value || value.length === 0" class="text-gray-400">-</span>
              </div>
            </template>
          </EditableCell>
        </template>

        <!-- 警报标记 - 可编辑 -->
        <template #alertMark="{ row }">
          <EditableCell
            v-model="row.alertMark"
            type="multiSelect"
            :options="alertMarkOptions"
            placeholder="选择警报标记"
            @save="(value) => handleCellSave(row, 'alertMark', value)"
          >
            <template #display="{ value }">
              <div class="flex flex-wrap gap-1">
                <ElTag v-for="tag in value" :key="tag" size="small" type="danger">{{ tag }}</ElTag>
                <span v-if="!value || value.length === 0" class="text-gray-400">-</span>
              </div>
            </template>
          </EditableCell>
        </template>

        <!-- 备注信息 - 可编辑 -->
        <template #remark="{ row }">
          <EditableCell
            v-model="row.remark"
            type="text"
            placeholder="输入备注"
            @save="(value) => handleCellSave(row, 'remark', value)"
            :formatter="(value) => value || '-'"
          />
        </template>
      </ArtTable>
    </ElCard>

    <!-- 新增/编辑对话框 -->
    <ElDialog
      v-model="dialogVisible"
      :title="editData ? '编辑钱包' : '新增钱包'"
      width="600px"
      @close="handleDialogClose"
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="120px">
        <ElFormItem label="钱包地址" prop="walletAddress">
          <ElInput
            v-model="form.walletAddress"
            placeholder="请输入钱包地址(0x...)"
            :disabled="!!editData"
          />
        </ElFormItem>
        <ElFormItem label="归属标签" prop="ownership">
          <ElSelect
            v-model="form.ownership"
            multiple
            filterable
            allow-create
            placeholder="请选择或输入归属标签"
            style="width: 100%"
          >
            <ElOption v-for="item in ownershipOptions" :key="item" :label="item" :value="item" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="主链列表" prop="mainChains">
          <ElSelect
            v-model="form.mainChains"
            multiple
            filterable
            allow-create
            placeholder="请选择或输入主链"
            style="width: 100%"
          >
            <ElOption v-for="item in chainOptions" :key="item" :label="item" :value="item" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="钱包总价值" prop="totalValue">
          <ElInputNumber
            v-model="form.totalValue"
            :min="0"
            :precision="2"
            :controls="false"
            placeholder="请输入钱包总价值(USD)"
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem label="地址活跃天数" prop="addressActivity">
          <ElInputNumber
            v-model="form.addressActivity"
            :min="0"
            :controls="false"
            placeholder="请输入地址活跃天数"
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem label="活动标签" prop="activityTags">
          <ElSelect
            v-model="form.activityTags"
            multiple
            filterable
            allow-create
            placeholder="请选择或输入活动标签"
            style="width: 100%"
          >
            <ElOption v-for="item in activityTagOptions" :key="item" :label="item" :value="item" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="分类标签" prop="categoryTags">
          <ElSelect
            v-model="form.categoryTags"
            multiple
            filterable
            allow-create
            placeholder="请选择或输入分类标签"
            style="width: 100%"
          >
            <ElOption v-for="item in categoryTagOptions" :key="item" :label="item" :value="item" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="状态标签" prop="status">
          <ElSelect
            v-model="form.status"
            multiple
            filterable
            allow-create
            placeholder="请选择或输入状态标签"
            style="width: 100%"
          >
            <ElOption v-for="item in statusOptions" :key="item" :label="item" :value="item" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="警报标记" prop="alertMark">
          <ElSelect
            v-model="form.alertMark"
            multiple
            filterable
            allow-create
            placeholder="请选择或输入警报标记"
            style="width: 100%"
          >
            <ElOption v-for="item in alertMarkOptions" :key="item" :label="item" :value="item" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="备注信息" prop="remark">
          <ElInput v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit" :loading="submitLoading">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, h } from 'vue'
  import { ElMessage, ElMessageBox, ElTag, FormRules, FormInstance } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import ArtTableHeader from '@/components/core/tables/art-table-header/index.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtExcelImport from '@/components/core/forms/art-excel-import/index.vue'
  import ArtExcelExport from '@/components/core/forms/art-excel-export/index.vue'
  import EditableCell from '@/components/editable-cell/EditableCell.vue'
  import { useTable } from '@/hooks/core/useTable'
  import {
    fetchWalletList,
    createWallet,
    batchCreateWallet,
    updateWallet,
    deleteWallet
  } from '@/api/wallet'
  import dayjs from 'dayjs'

  defineOptions({ name: 'WalletMonitoring' })

  // 对话框
  const dialogVisible = ref(false)
  const editData = ref<Api.Wallet.WalletRecord | null>(null)
  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const tableRef = ref()

  // 表单数据
  const form = reactive<Partial<Api.Wallet.CreateWalletParams>>({
    walletAddress: '',
    ownership: [],
    mainChains: [],
    totalValue: 0,
    addressActivity: 0,
    activityTags: [],
    categoryTags: [],
    status: [],
    alertMark: [],
    remark: ''
  })

  // 枚举选项
  const ownershipOptions = ref(['个人', '团队', '外部', '合作方'])
  const chainOptions = ref(['ETH', 'ARB', 'OP', 'BASE', 'ZKSYNC', 'POLYGON', 'BSC', 'AVAX'])
  const activityTagOptions = ref(['活跃', '休眠', '新增', '高频'])
  const categoryTagOptions = ref(['交易', 'DeFi', 'NFT', 'GameFi', 'DAO'])
  const statusOptions = ref(['正常', '监控中', '已归档', '待处理'])
  const alertMarkOptions = ref(['高风险', '异常交易', '大额转账', '需关注'])

  // 表单验证规则
  const rules: FormRules = {
    walletAddress: [
      { required: true, message: '请输入钱包地址', trigger: 'blur' },
      { min: 42, max: 42, message: '钱包地址长度应为42个字符', trigger: 'blur' }
    ]
  }

  // 导出列配置
  const exportColumns = [
    { prop: 'walletAddress', label: '钱包地址' },
    { prop: 'ownership', label: '归属标签' },
    { prop: 'lastQueryTime', label: '查询更新时间' },
    { prop: 'totalValue', label: '钱包总价值(USD)' },
    { prop: 'mainChains', label: '主链列表' },
    { prop: 'addressActivity', label: '地址活跃天数' },
    { prop: 'activityTags', label: '活动标签' },
    { prop: 'categoryTags', label: '分类标签' },
    { prop: 'status', label: '状态标签' },
    { prop: 'alertMark', label: '警报标记' },
    { prop: 'remark', label: '备注信息' }
  ]

  // 使用 useTable hook
  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    refreshData,
    handleSizeChange,
    handleCurrentChange
  } = useTable({
    core: {
      apiFn: fetchWalletList,
      apiParams: {
        current: 1,
        size: 20
      },
      // 自定义分页字段映射，将current/size映射为offset/limit
      paginationKey: {
        current: 'offset',
        size: 'limit'
      },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        { prop: 'walletAddress', label: '钱包地址', minWidth: 180, fixed: 'left' },
        {
          prop: 'ownership',
          label: '归属标签',
          width: 200,
          useSlot: true
        },
        {
          prop: 'lastQueryTime',
          label: '查询更新时间',
          width: 200,
          useSlot: true
        },
        {
          prop: 'totalValue',
          label: '钱包总价值(USD)',
          width: 180,
          sortable: true,
          useSlot: true
        },
        {
          prop: 'mainChains',
          label: '主链列表',
          width: 220,
          useSlot: true
        },
        {
          prop: 'addressActivity',
          label: '地址活跃天数',
          width: 160,
          sortable: true,
          useSlot: true
        },
        {
          prop: 'activityTags',
          label: '活动标签',
          width: 200,
          useSlot: true
        },
        {
          prop: 'categoryTags',
          label: '分类标签',
          width: 200,
          useSlot: true
        },
        {
          prop: 'status',
          label: '状态标签',
          width: 180,
          useSlot: true
        },
        {
          prop: 'alertMark',
          label: '警报标记',
          width: 200,
          useSlot: true
        },
        {
          prop: 'remark',
          label: '备注信息',
          minWidth: 200,
          useSlot: true
        },
        {
          prop: 'action',
          label: '操作',
          width: 150,
          fixed: 'right',
          formatter: (row: Api.Wallet.WalletRecord) =>
            h('div', { class: 'flex' }, [
              h(ArtButtonTable, { type: 'edit', onClick: () => handleEdit(row) }),
              h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row) })
            ])
        }
      ]
    }
  })

  // 添加
  const handleAdd = () => {
    editData.value = null
    Object.assign(form, {
      walletAddress: '',
      ownership: [],
      mainChains: [],
      totalValue: 0,
      addressActivity: 0,
      activityTags: [],
      categoryTags: [],
      status: [],
      alertMark: [],
      remark: ''
    })
    dialogVisible.value = true
  }

  // 编辑
  const handleEdit = (row: Api.Wallet.WalletRecord) => {
    editData.value = row
    Object.assign(form, {
      walletAddress: row.walletAddress,
      ownership: row.ownership || [],
      mainChains: row.mainChains || [],
      totalValue: row.totalValue || 0,
      addressActivity: row.addressActivity || 0,
      activityTags: row.activityTags || [],
      categoryTags: row.categoryTags || [],
      status: row.status || [],
      alertMark: row.alertMark || [],
      remark: row.remark || ''
    })
    dialogVisible.value = true
  }

  // 删除
  const handleDelete = async (row: Api.Wallet.WalletRecord) => {
    try {
      await ElMessageBox.confirm(`确定要删除钱包地址 ${row.walletAddress} 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await deleteWallet(row.walletAddress)
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
        await updateWallet({
          walletAddress: form.walletAddress!,
          updateFields: {
            ownership: form.ownership,
            mainChains: form.mainChains,
            totalValue: form.totalValue,
            addressActivity: form.addressActivity,
            activityTags: form.activityTags,
            categoryTags: form.categoryTags,
            status: form.status,
            alertMark: form.alertMark,
            remark: form.remark
          }
        })
      } else {
        // 新增
        await createWallet(form as Api.Wallet.CreateWalletParams)
      }

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

  // 导入成功
  const handleImportSuccess = async (data: any[]) => {
    try {
      if (!data || data.length === 0) {
        ElMessage.warning('导入数据为空')
        return
      }

      // 数据转换：将 Excel 中的列名映射为后端字段名
      const wallets = data.map((row: any) => {
        // 处理数组字段（Excel 中可能是逗号分隔的字符串）
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

        return {
          walletAddress: row['钱包地址'] || row['walletAddress'] || '',
          ownership: parseArrayField(row['归属标签'] || row['ownership']),
          mainChains: parseArrayField(row['主链列表'] || row['mainChains']),
          totalValue: parseFloat(row['钱包总价值(USD)'] || row['totalValue'] || 0),
          addressActivity: parseInt(row['地址活跃天数'] || row['addressActivity'] || 0),
          activityTags: parseArrayField(row['活动标签'] || row['activityTags']),
          categoryTags: parseArrayField(row['分类标签'] || row['categoryTags']),
          status: parseArrayField(row['状态标签'] || row['status']),
          alertMark: parseArrayField(row['警报标记'] || row['alertMark']),
          lastQueryTime: row['查询更新时间'] || row['lastQueryTime'] || null,
          remark: row['备注信息'] || row['remark'] || ''
        }
      })

      // 调用批量创建接口
      await batchCreateWallet(wallets)
      ElMessage.success(`成功导入 ${wallets.length} 条数据`)
      refreshData()
    } catch (error: any) {
      console.error('导入失败:', error)
      ElMessage.error(`错误信息：${error.response?.data?.message || error.message || '导入失败'}`)
    }
  }

  // 导入失败
  const handleImportError = (error: any) => {
    ElMessage.error('导入失败: ' + error.message)
  }

  // 导出成功
  const handleExportSuccess = () => {
    ElMessage.success('导出成功')
  }

  // 单元格编辑保存
  const handleCellSave = async (row: Api.Wallet.WalletRecord, field: string, value: any) => {
    try {
      // 构造更新参数
      const updateFields: any = {}
      updateFields[field] = value

      // 调用更新API
      await updateWallet({
        walletAddress: row.walletAddress,
        updateFields
      })

      // 更新本地数据
      Object.assign(row, updateFields)

      ElMessage.success('更新成功')
    } catch (error) {
      console.error('更新失败:', error)
      ElMessage.error('更新失败')
      // 刷新数据以恢复原值
      refreshData()
    }
  }
</script>

<style scoped lang="scss">
  .wallet-monitoring-page {
    padding: 16px;
  }
</style>
