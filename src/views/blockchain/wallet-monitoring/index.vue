<template>
  <div class="wallet-monitoring-container">
    <!-- 纵向视图侧边栏 -->
    <LongitudinalView
      :stats="longitudinalStats"
      :group-fields="groupFieldsConfig"
      :group-field="longitudinalGroupField"
      :active-view-id="activeLongitudinalViewId"
      :collapsed="longitudinalCollapsed"
      :expanded-groups="longitudinalExpandedGroups"
      @group-field-change="handleLongitudinalGroupFieldChange"
      @view-change="handleLongitudinalViewChange"
      @update:collapsed="handleLongitudinalCollapseChange"
      @toggle-group="handleToggleLongitudinalGroup"
    />

    <!-- 主内容区 -->
    <div class="main-content-area">
      <!-- 搜索区域 -->
      <WalletSearch
        v-show="showSearchBar"
        v-model="searchForm"
        :ownership-options="ownershipOptions"
        :chain-options="chainOptions"
        :status-options="statusOptions"
        @search="handleSearch"
        @reset="resetSearchParams"
      ></WalletSearch>

      <ElCard class="art-table-card" shadow="never" :style="{ 'margin-top': '0' }">
        <!-- 表格头部 -->
        <ArtTableHeader
          v-model:columns="columnChecks"
          v-model:showSearchBar="showSearchBar"
          :loading="loading"
          @refresh="refreshData"
        >
          <template #left>
            <ElSpace wrap>
              <ElButton type="primary" :icon="Plus" @click="handleAdd">新增钱包</ElButton>
              <!-- 批量操作按钮 -->
              <ElButton
                v-show="selectedRows.length > 0"
                type="primary"
                :icon="Edit"
                @click="handleBatchEdit"
              >
                批量编辑 ({{ selectedRows.length }})
              </ElButton>
              <ElButton
                v-show="selectedRows.length > 0"
                type="danger"
                :icon="Delete"
                @click="handleBatchDelete"
              >
                批量删除 ({{ selectedRows.length }})
              </ElButton>
              <ElButton v-show="selectedRows.length > 0" @click="clearSelection">清空选择</ElButton>
              <ElButton type="success" :icon="Operation" @click="handleRandomSample"
                >随机取数</ElButton
              >
              <ArtExcelImportPreview
                @import-success="handleImportSuccess"
                @import-error="handleImportError"
              >
                导入Excel
              </ArtExcelImportPreview>
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

        <!-- 视图Tabs -->
        <ViewTabs
          v-model:activeViewId="activeViewId"
          :views="views"
          @view-change="handleViewChange"
          @add-view="handleAddView"
          @edit-view="handleEditView"
          @delete-view="handleDeleteView"
          @duplicate-view="handleDuplicateView"
          @set-default="handleSetDefaultView"
          @export-view="handleExportView"
        />

        <!-- 表格 -->
        <ArtTable
          ref="tableRef"
          :loading="loading"
          :data="data"
          :columns="columns"
          :pagination="pagination"
          @selection-change="handleSelectionChange"
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
                <div class="flex gap-1" style="overflow: hidden">
                  <ElTag v-for="tag in value" :key="tag" size="small" type="primary">{{
                    tag
                  }}</ElTag>
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
                <div class="flex gap-1" style="overflow: hidden">
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
                <div class="flex gap-1" style="overflow: hidden">
                  <ElTag v-for="tag in value" :key="tag" size="small" type="warning">{{
                    tag
                  }}</ElTag>
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
                <div class="flex gap-1" style="overflow: hidden">
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
                <div class="flex gap-1" style="overflow: hidden">
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
                <div class="flex gap-1" style="overflow: hidden">
                  <ElTag v-for="tag in value" :key="tag" size="small" type="danger">{{
                    tag
                  }}</ElTag>
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
              <ElOption
                v-for="item in activityTagOptions"
                :key="item"
                :label="item"
                :value="item"
              />
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
              <ElOption
                v-for="item in categoryTagOptions"
                :key="item"
                :label="item"
                :value="item"
              />
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

      <!-- 批量编辑对话框 -->
      <ElDialog
        v-model="batchDialogVisible"
        title="批量编辑钱包"
        width="600px"
        @close="batchFormRef?.resetFields()"
      >
        <ElForm ref="batchFormRef" :model="batchForm" label-width="140px">
          <ElFormItem label="选择要编辑的字段" prop="fields">
            <ElCheckboxGroup v-model="batchForm.fields">
              <ElCheckbox
                v-for="field in editableFields"
                :key="field.value"
                :label="field.value"
                :value="field.value"
              >
                {{ field.label }}
              </ElCheckbox>
            </ElCheckboxGroup>
          </ElFormItem>

          <ElDivider />

          <!-- 多选字段的操作模式 -->
          <ElFormItem
            v-if="
              batchForm.fields.some((f) =>
                [
                  'ownership',
                  'mainChains',
                  'activityTags',
                  'categoryTags',
                  'status',
                  'alertMark'
                ].includes(f)
              )
            "
            label="多选字段操作模式"
          >
            <ElRadioGroup v-model="batchMode">
              <ElRadio value="replace">替换模式（覆盖原有值）</ElRadio>
              <ElRadio value="append">追加模式（保留原有值并追加）</ElRadio>
            </ElRadioGroup>
          </ElFormItem>

          <ElDivider />

          <!-- 根据选择的字段显示对应的表单项 -->
          <ElFormItem v-if="batchForm.fields.includes('ownership')" label="归属标签">
            <ElSelect
              v-model="batchForm.ownership"
              multiple
              filterable
              allow-create
              placeholder="请选择或输入归属标签"
              style="width: 100%"
            >
              <ElOption v-for="item in ownershipOptions" :key="item" :label="item" :value="item" />
            </ElSelect>
          </ElFormItem>

          <ElFormItem v-if="batchForm.fields.includes('mainChains')" label="主链列表">
            <ElSelect
              v-model="batchForm.mainChains"
              multiple
              filterable
              allow-create
              placeholder="请选择或输入主链"
              style="width: 100%"
            >
              <ElOption v-for="item in chainOptions" :key="item" :label="item" :value="item" />
            </ElSelect>
          </ElFormItem>

          <ElFormItem v-if="batchForm.fields.includes('totalValue')" label="钱包总价值">
            <ElInputNumber
              v-model="batchForm.totalValue"
              :min="0"
              :precision="2"
              :controls="false"
              placeholder="请输入钱包总价值(USD)"
              style="width: 100%"
            />
          </ElFormItem>

          <ElFormItem v-if="batchForm.fields.includes('addressActivity')" label="地址活跃天数">
            <ElInputNumber
              v-model="batchForm.addressActivity"
              :min="0"
              :controls="false"
              placeholder="请输入地址活跃天数"
              style="width: 100%"
            />
          </ElFormItem>

          <ElFormItem v-if="batchForm.fields.includes('activityTags')" label="活动标签">
            <ElSelect
              v-model="batchForm.activityTags"
              multiple
              filterable
              allow-create
              placeholder="请选择或输入活动标签"
              style="width: 100%"
            >
              <ElOption
                v-for="item in activityTagOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem v-if="batchForm.fields.includes('categoryTags')" label="分类标签">
            <ElSelect
              v-model="batchForm.categoryTags"
              multiple
              filterable
              allow-create
              placeholder="请选择或输入分类标签"
              style="width: 100%"
            >
              <ElOption
                v-for="item in categoryTagOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem v-if="batchForm.fields.includes('status')" label="状态标签">
            <ElSelect
              v-model="batchForm.status"
              multiple
              filterable
              allow-create
              placeholder="请选择或输入状态标签"
              style="width: 100%"
            >
              <ElOption v-for="item in statusOptions" :key="item" :label="item" :value="item" />
            </ElSelect>
          </ElFormItem>

          <ElFormItem v-if="batchForm.fields.includes('alertMark')" label="警报标记">
            <ElSelect
              v-model="batchForm.alertMark"
              multiple
              filterable
              allow-create
              placeholder="请选择或输入警报标记"
              style="width: 100%"
            >
              <ElOption v-for="item in alertMarkOptions" :key="item" :label="item" :value="item" />
            </ElSelect>
          </ElFormItem>

          <ElFormItem v-if="batchForm.fields.includes('remark')" label="备注信息">
            <ElInput
              v-model="batchForm.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
            />
          </ElFormItem>

          <ElAlert
            v-if="batchForm.fields.length > 0"
            type="info"
            :closable="false"
            style="margin-top: 16px"
          >
            <template #title>
              即将更新 <strong>{{ selectedRows.length }}</strong> 个钱包的
              <strong>{{ batchForm.fields.length }}</strong> 个字段
            </template>
          </ElAlert>
        </ElForm>
        <template #footer>
          <ElButton @click="batchDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleBatchSubmit" :loading="batchSubmitLoading">
            确定批量更新
          </ElButton>
        </template>
      </ElDialog>

      <!-- 随机取数对话框 -->
      <ElDialog v-model="randomSampleDialogVisible" title="随机抽样钱包" width="600px">
        <ElForm :model="randomSampleForm" label-width="120px">
          <ElFormItem label="抽样方式">
            <ElRadioGroup v-model="randomSampleForm.sampleType">
              <ElRadio value="count">按数量抽样</ElRadio>
              <ElRadio value="percentage">按比例抽样</ElRadio>
            </ElRadioGroup>
          </ElFormItem>

          <ElFormItem v-if="randomSampleForm.sampleType === 'count'" label="抽样数量">
            <ElInputNumber
              v-model="randomSampleForm.count"
              :min="1"
              :max="10000"
              :controls="true"
              placeholder="请输入抽样数量"
              style="width: 100%"
            />
          </ElFormItem>

          <ElFormItem v-else label="抽样比例">
            <ElInputNumber
              v-model="randomSampleForm.percentage"
              :min="1"
              :max="100"
              :controls="true"
              placeholder="请输入抽样比例(%)"
              style="width: 100%"
            />
          </ElFormItem>

          <ElDivider>筛选条件（可选）</ElDivider>

          <ElFormItem label="归属标签">
            <ElSelect
              v-model="randomSampleForm.ownership"
              multiple
              filterable
              placeholder="选择归属标签"
              style="width: 100%"
            >
              <ElOption v-for="item in ownershipOptions" :key="item" :label="item" :value="item" />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="主链列表">
            <ElSelect
              v-model="randomSampleForm.mainChains"
              multiple
              filterable
              placeholder="选择主链"
              style="width: 100%"
            >
              <ElOption v-for="item in chainOptions" :key="item" :label="item" :value="item" />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="状态标签">
            <ElSelect
              v-model="randomSampleForm.status"
              multiple
              filterable
              placeholder="选择状态标签"
              style="width: 100%"
            >
              <ElOption v-for="item in statusOptions" :key="item" :label="item" :value="item" />
            </ElSelect>
          </ElFormItem>

          <ElAlert
            v-if="randomSampleResult"
            type="success"
            :closable="false"
            style="margin-top: 16px"
          >
            <template #title>
              抽样成功！从
              <strong>{{ randomSampleResult.total }}</strong> 条符合条件的记录中，抽取了
              <strong>{{ randomSampleResult.sampleSize }}</strong> 条记录
            </template>
          </ElAlert>
        </ElForm>
        <template #footer>
          <ElButton @click="randomSampleDialogVisible = false">关闭</ElButton>
          <ElButton type="primary" @click="handleRandomSampleSubmit" :loading="randomSampleLoading">
            开始抽样
          </ElButton>
          <ElButton
            v-if="randomSampleResult && randomSampleResult.records.length > 0"
            type="success"
            @click="handleExportSampleResult"
          >
            导出抽样结果
          </ElButton>
        </template>
      </ElDialog>

      <!-- 视图配置对话框 -->
      <ViewDialog
        v-model:visible="viewDialogVisible"
        :edit-view="editingView"
        :ownership-options="ownershipOptions"
        :chain-options="chainOptions"
        :status-options="statusOptions"
        @submit="handleViewFormSubmit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, h, onMounted, nextTick } from 'vue'
  import * as XLSX from 'xlsx'
  import FileSaver from 'file-saver'
  import {
    ElMessage,
    ElMessageBox,
    ElTag,
    ElCheckboxGroup,
    ElCheckbox,
    ElRadioGroup,
    ElRadio,
    ElDivider,
    ElAlert,
    FormRules,
    FormInstance
  } from 'element-plus'
  import { Plus, Edit, Delete, Operation } from '@element-plus/icons-vue'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import ArtTableHeader from '@/components/core/tables/art-table-header/index.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtExcelImportPreview from '@/components/core/forms/art-excel-import-preview/index.vue'
  import ArtExcelExport from '@/components/core/forms/art-excel-export/index.vue'
  import EditableCell from '@/components/editable-cell/EditableCell.vue'
  import ViewTabs from './components/ViewTabs.vue'
  import ViewDialog from './components/ViewDialog.vue'
  import WalletSearch from './components/WalletSearch.vue'
  import LongitudinalView from './components/LongitudinalView.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { useViewManagement } from '@/hooks/core/useViewManagement'
  import { useLongitudinalView, type GroupFieldConfig } from '@/hooks/core/useLongitudinalView'
  import { computed } from 'vue'
  import {
    fetchWalletList,
    createWallet,
    batchCreateWallet,
    updateWallet,
    batchUpdateWallet,
    deleteWallet,
    randomSampleWallet
  } from '@/api/wallet'
  import dayjs from 'dayjs'
  import type { ViewFormData, HorizontalViewConfig } from '@/types/view'

  defineOptions({ name: 'WalletMonitoring' })

  // 对话框
  const dialogVisible = ref(false)
  const editData = ref<Api.Wallet.WalletRecord | null>(null)
  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const tableRef = ref()

  // 批量操作
  const selectedRows = ref<Api.Wallet.WalletRecord[]>([])
  const batchDialogVisible = ref(false)
  const batchFormRef = ref<FormInstance>()
  const batchSubmitLoading = ref(false)
  const batchMode = ref<'replace' | 'append'>('replace')

  // 随机取数
  const randomSampleDialogVisible = ref(false)
  const randomSampleLoading = ref(false)
  const randomSampleResult = ref<Api.RandomSample.RandomSampleResponse | null>(null)
  const randomSampleForm = reactive({
    sampleType: 'count' as 'count' | 'percentage',
    count: 10,
    percentage: 10,
    ownership: [] as string[],
    mainChains: [] as string[],
    status: [] as string[]
  })

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

  // 批量编辑表单数据
  const batchForm = reactive<{
    fields: string[]
    ownership?: string[]
    mainChains?: string[]
    totalValue?: number
    addressActivity?: number
    activityTags?: string[]
    categoryTags?: string[]
    status?: string[]
    alertMark?: string[]
    remark?: string
  }>({
    fields: [],
    ownership: [],
    mainChains: [],
    totalValue: undefined,
    addressActivity: undefined,
    activityTags: [],
    categoryTags: [],
    status: [],
    alertMark: [],
    remark: ''
  })

  // 搜索表单状态
  const searchForm = ref({
    walletAddress: undefined,
    ownership: undefined,
    mainChains: undefined,
    status: undefined,
    totalValueRange: undefined,
    daterange: undefined
  })

  // 控制搜索栏显隐
  const showSearchBar = ref(false)

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
  const exportColumns: Record<string, { title: string }> = {
    walletAddress: { title: '钱包地址' },
    ownership: { title: '归属标签' },
    lastQueryTime: { title: '查询更新时间' },
    totalValue: { title: '钱包总价值(USD)' },
    mainChains: { title: '主链列表' },
    addressActivity: { title: '地址活跃天数' },
    activityTags: { title: '活动标签' },
    categoryTags: { title: '分类标签' },
    status: { title: '状态标签' },
    alertMark: { title: '警报标记' },
    remark: { title: '备注信息' }
  }

  // 使用 useTable hook
  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    searchParams,
    refreshData,
    handleSizeChange,
    handleCurrentChange
  } = useTable({
    core: {
      apiFn: fetchWalletList,
      columnsFactory: () => [
        { type: 'selection', width: 55, fixed: 'left' },
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

  // 全量数据缓存（用于纵向视图统计，不受筛选条件影响）
  const allData = ref<Api.Wallet.WalletRecord[]>([])

  // 加载全量数据用于统计
  const loadAllDataForStats = async () => {
    try {
      const response = await fetchWalletList({ offset: 0, limit: 10000 })
      allData.value = response.records || []
      console.log('全量数据加载完成，共', allData.value.length, '条记录')
    } catch (error) {
      console.error('加载全量数据失败:', error)
    }
  }

  // 视图管理
  const {
    views,
    activeViewId,
    createView,
    updateView,
    deleteView,
    duplicateView,
    switchView,
    activeView
  } = useViewManagement()

  // 分组字段配置
  const groupFieldsConfig: GroupFieldConfig[] = [
    { key: 'ownership', label: '归属标签', options: ownershipOptions.value },
    { key: 'status', label: '状态标签', options: statusOptions.value },
    { key: 'mainChains', label: '主链列表', options: chainOptions.value },
    { key: 'activityTags', label: '活动标签', options: activityTagOptions.value },
    { key: 'categoryTags', label: '分类标签', options: categoryTagOptions.value },
    { key: 'alertMark', label: '警报标记', options: alertMarkOptions.value }
  ]

  // 横向视图筛选条件
  const horizontalFilter = computed(() => activeView.value?.filterCondition || {})

  // 纵向视图管理（使用全量数据进行统计）
  const {
    groupField: longitudinalGroupField,
    activeViewId: activeLongitudinalViewId,
    views: longitudinalViews,
    viewStats: longitudinalStats,
    collapsed: longitudinalCollapsed,
    expandedGroups: longitudinalExpandedGroups,
    setGroupField: setLongitudinalGroupField,
    switchView: switchLongitudinalView,
    getCombinedFilter,
    toggleCollapse: toggleLongitudinalCollapse,
    toggleGroup: toggleLongitudinalGroup
  } = useLongitudinalView({
    data: allData,
    groupFields: groupFieldsConfig,
    horizontalFilter
  })

  // 视图对话框
  const viewDialogVisible = ref(false)
  const editingView = ref<HorizontalViewConfig | null>(null)

  // 视图切换事件
  const handleViewChange = async (viewId: string) => {
    const view = views.value.find((v) => v.id === viewId)
    if (!view) return

    // 获取筛选条件
    const filter = view.filterCondition

    // 清除之前的筛选条件（保留current和size）
    const searchParamsObj = searchParams as Record<string, any>
    const paginationKeys = ['current', 'size']
    Object.keys(searchParamsObj).forEach((key) => {
      if (!paginationKeys.includes(key)) {
        delete searchParamsObj[key]
      }
    })

    // 应用新的筛选条件（仅应用非空值）
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // 处理数组类型
        if (Array.isArray(value) && value.length > 0) {
          searchParamsObj[key] = value
        }
        // 处理数值类型
        else if (typeof value === 'number') {
          searchParamsObj[key] = value
        }
        // 处理其他非空值
        else if (value) {
          searchParamsObj[key] = value
        }
      }
    })

    // 重置分页
    pagination.current = 1

    // 刷新数据
    await refreshData()

    // 切换视图
    switchView(viewId)
  }

  // 新增视图
  const handleAddView = () => {
    editingView.value = null
    viewDialogVisible.value = true
  }

  // 编辑视图
  const handleEditView = (view: HorizontalViewConfig) => {
    editingView.value = view
    viewDialogVisible.value = true
  }

  // 删除视图
  const handleDeleteView = (viewId: string) => {
    deleteView(viewId)
  }

  // 复制视图
  const handleDuplicateView = (viewId: string) => {
    duplicateView(viewId)
  }

  // 设为默认视图
  const handleSetDefaultView = (viewId: string) => {
    const view = views.value.find((v) => v.id === viewId)
    if (!view) return

    const formData: ViewFormData = {
      name: view.name,
      filterCondition: view.filterCondition,
      sortRules: view.sortRules,
      visibleFields: view.visibleFields,
      isDefault: true
    }

    updateView(viewId, formData)
  }

  // 导出视图
  const handleExportView = (view: HorizontalViewConfig) => {
    try {
      const dataStr = JSON.stringify([view], null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `view_${view.name}_${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)

      ElMessage.success('视图导出成功')
    } catch (error) {
      console.error('导出视图失败:', error)
      ElMessage.error('导出视图失败')
    }
  }

  // 视图表单提交
  const handleViewFormSubmit = async (formData: ViewFormData) => {
    if (editingView.value) {
      // 记录是否编辑的是当前激活的视图
      const isEditingActiveView = editingView.value.id === activeViewId.value

      updateView(editingView.value.id, formData)

      // 如果编辑的是当前激活视图，立即应用新的筛选条件
      if (isEditingActiveView) {
        await handleViewChange(editingView.value.id)
      }
    } else {
      createView(formData)
    }
    viewDialogVisible.value = false
  }

  // 纵向视图事件处理
  const handleLongitudinalGroupFieldChange = (field: string) => {
    setLongitudinalGroupField(field)
  }

  const handleLongitudinalViewChange = async (viewId: string, groupValue?: string) => {
    let realViewId = viewId

    if (viewId !== 'all' && groupValue) {
      const targetView = longitudinalViews.value.find(
        (v) => v.groupValue === groupValue && v.groupField === longitudinalGroupField.value
      )
      if (targetView) {
        realViewId = targetView.id
      }
    }

    switchLongitudinalView(realViewId)
    await nextTick()

    const combinedFilter = getCombinedFilter()

    const searchParamsObj = searchParams as Record<string, any>
    const paginationKeys = ['current', 'size']
    Object.keys(searchParamsObj).forEach((key) => {
      if (!paginationKeys.includes(key)) {
        delete searchParamsObj[key]
      }
    })

    Object.entries(combinedFilter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value) && value.length > 0) {
          searchParamsObj[key] = value
        } else if (typeof value === 'number') {
          searchParamsObj[key] = value
        } else if (value) {
          searchParamsObj[key] = value
        }
      }
    })

    pagination.current = 1
    await refreshData()
  }

  const handleLongitudinalCollapseChange = () => {
    toggleLongitudinalCollapse()
  }

  const handleToggleLongitudinalGroup = (groupId: string) => {
    toggleLongitudinalGroup(groupId)
  }

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
      await refreshData()
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
      await refreshData()
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

      // 数据已经由导入组件转换好，直接调用批量创建接口
      await batchCreateWallet(data)
      ElMessage.success(`成功导入 ${data.length} 条数据`)
      await refreshData()
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

  // 处理选择变化
  const handleSelectionChange = (rows: Api.Wallet.WalletRecord[]) => {
    selectedRows.value = rows
  }

  // 清空选择
  const clearSelection = () => {
    tableRef.value?.clearSelection()
    selectedRows.value = []
  }

  // 批量编辑
  const handleBatchEdit = () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请先选择要编辑的钱包')
      return
    }
    // 重置批量编辑表单
    Object.assign(batchForm, {
      fields: [],
      ownership: [],
      mainChains: [],
      totalValue: undefined,
      addressActivity: undefined,
      activityTags: [],
      categoryTags: [],
      status: [],
      alertMark: [],
      remark: ''
    })
    batchMode.value = 'replace'
    batchDialogVisible.value = true
  }

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请先选择要删除的钱包')
      return
    }
    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRows.value.length} 个钱包吗？`,
        '批量删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      // 逐个删除
      const deletePromises = selectedRows.value.map((row) => deleteWallet(row.walletAddress))
      await Promise.all(deletePromises)

      ElMessage.success(`成功删除 ${selectedRows.value.length} 个钱包`)
      clearSelection()
      await refreshData()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('批量删除失败:', error)
        ElMessage.error('批量删除失败')
      }
    }
  }

  // 提交批量编辑 [FIXED: 2025-11-21 15:25]
  const handleBatchSubmit = async () => {
    // 防止重复提交：如果正在提交中，直接返回
    if (batchSubmitLoading.value) {
      console.warn('批量更新正在进行中，忽略重复调用')
      return
    }

    if (!batchFormRef.value) return
    if (batchForm.fields.length === 0) {
      ElMessage.warning('请至少选择一个要编辑的字段')
      return
    }

    try {
      batchSubmitLoading.value = true
      console.log('[批量更新] 开始执行，当前表单数据:', JSON.stringify(batchForm, null, 2))

      // 构造批量更新参数
      const updateFields: any = {}
      const multiSelectFields = [
        'ownership',
        'mainChains',
        'activityTags',
        'categoryTags',
        'status',
        'alertMark'
      ]

      batchForm.fields.forEach((field) => {
        const value = batchForm[field as keyof typeof batchForm]

        // 对于多选字段，需要包装成 { operation, value } 格式
        if (multiSelectFields.includes(field)) {
          updateFields[field] = {
            operation: batchMode.value, // 'replace' 或 'append'
            value: value
          }
        } else {
          updateFields[field] = value
        }
      })

      const walletAddresses = selectedRows.value.map((row) => row.walletAddress)

      console.log(
        '[批量更新] 请求参数:',
        JSON.stringify({ walletAddresses, updateFields }, null, 2)
      )

      // 执行批量更新
      await batchUpdateWallet({
        walletAddresses,
        updateFields
      })

      console.log('[批量更新] 成功完成')

      // 成功后关闭对话框
      batchDialogVisible.value = false

      // 刷新数据
      await refreshData()

      // 清空选择（使用try-catch避免异常影响用户体验）
      try {
        clearSelection()
      } catch (clearError) {
        console.warn('[批量更新] 清空选择时发生异常（已忽略）:', clearError)
      }

      // 最后显示成功消息
      ElMessage.success(`成功批量更新 ${walletAddresses.length} 个钱包`)
    } catch (error) {
      console.error('[批量更新] 操作失败:', error)
      ElMessage.error('批量更新失败')
    } finally {
      batchSubmitLoading.value = false
    }
  }

  // 可编辑字段列表
  const editableFields = [
    { value: 'ownership', label: '归属标签' },
    { value: 'mainChains', label: '主链列表' },
    { value: 'totalValue', label: '钱包总价值' },
    { value: 'addressActivity', label: '地址活跃天数' },
    { value: 'activityTags', label: '活动标签' },
    { value: 'categoryTags', label: '分类标签' },
    { value: 'status', label: '状态标签' },
    { value: 'alertMark', label: '警报标记' },
    { value: 'remark', label: '备注信息' }
  ]

  // 打开随机取数对话框
  const handleRandomSample = () => {
    randomSampleResult.value = null
    randomSampleForm.sampleType = 'count'
    randomSampleForm.count = 10
    randomSampleForm.percentage = 10
    randomSampleForm.ownership = []
    randomSampleForm.mainChains = []
    randomSampleForm.status = []
    randomSampleDialogVisible.value = true
  }

  // 提交随机抽样
  const handleRandomSampleSubmit = async () => {
    try {
      // 验证输入
      if (
        randomSampleForm.sampleType === 'count' &&
        (!randomSampleForm.count || randomSampleForm.count <= 0)
      ) {
        ElMessage.warning('请输入有效的抽样数量')
        return
      }
      if (
        randomSampleForm.sampleType === 'percentage' &&
        (!randomSampleForm.percentage ||
          randomSampleForm.percentage <= 0 ||
          randomSampleForm.percentage > 100)
      ) {
        ElMessage.warning('请输入有效的抽样比例(1-100)')
        return
      }

      randomSampleLoading.value = true

      // 构建请求参数
      const params: Api.RandomSample.RandomSampleParams = {
        count: randomSampleForm.sampleType === 'count' ? randomSampleForm.count : undefined,
        percentage:
          randomSampleForm.sampleType === 'percentage' ? randomSampleForm.percentage : undefined,
        filterCondition: {
          ownership: randomSampleForm.ownership.length > 0 ? randomSampleForm.ownership : undefined,
          mainChains:
            randomSampleForm.mainChains.length > 0 ? randomSampleForm.mainChains : undefined,
          status: randomSampleForm.status.length > 0 ? randomSampleForm.status : undefined
        }
      }

      const result = await randomSampleWallet(params)
      randomSampleResult.value = result
      ElMessage.success(`成功抽样 ${result.sampleSize} 条记录`)
    } catch (error) {
      console.error('随机抽样失败:', error)
      ElMessage.error('随机抽样失败')
    } finally {
      randomSampleLoading.value = false
    }
  }

  // 导出抽样结果
  const handleExportSampleResult = () => {
    if (!randomSampleResult.value || randomSampleResult.value.records.length === 0) {
      ElMessage.warning('没有抽样结果可导出')
      return
    }

    try {
      // 处理数据
      const exportData = randomSampleResult.value.records.map((record) => ({
        钱包地址: record.walletAddress,
        归属标签: Array.isArray(record.ownership) ? record.ownership.join(', ') : '',
        查询更新时间: record.lastQueryTime
          ? dayjs(record.lastQueryTime).format('YYYY-MM-DD HH:mm:ss')
          : '',
        '钱包总价值(USD)': record.totalValue,
        主链列表: Array.isArray(record.mainChains) ? record.mainChains.join(', ') : '',
        地址活跃天数: record.addressActivity,
        活动标签: Array.isArray(record.activityTags) ? record.activityTags.join(', ') : '',
        分类标签: Array.isArray(record.categoryTags) ? record.categoryTags.join(', ') : '',
        状态标签: Array.isArray(record.status) ? record.status.join(', ') : '',
        警报标记: Array.isArray(record.alertMark) ? record.alertMark.join(', ') : '',
        备注信息: record.remark || ''
      }))

      // 创建工作表
      const worksheet = XLSX.utils.json_to_sheet(exportData)

      // 创建工作簿
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, '抽样结果')

      // 生成Excel文件
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array'
      })

      // 创建Blob并下载
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      const filename = `钱包抽样结果_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`
      FileSaver.saveAs(blob, filename)

      ElMessage.success('导出成功')
    } catch (error) {
      console.error('导出失败:', error)
      ElMessage.error('导出失败')
    }
  }

  // 搜索处理函数
  const handleSearch = (params: Record<string, any>) => {
    const { daterange, totalValueRange, ...filtersParams } = params

    // 处理日期范围
    const [startTime, endTime] = Array.isArray(daterange) ? daterange : [null, null]

    // 处理价值范围
    let minValue, maxValue
    if (totalValueRange && typeof totalValueRange === 'string') {
      const parts = totalValueRange.split('-').map((v) => v.trim())
      minValue = parts[0] ? parseFloat(parts[0]) : undefined
      maxValue = parts[1] ? parseFloat(parts[1]) : undefined
    }

    // 更新搜索参数
    Object.assign(searchParams, {
      ...filtersParams,
      startTime,
      endTime,
      minValue,
      maxValue
    })

    // 重置分页到第一页
    pagination.current = 1

    // 执行搜索
    refreshData()
  }

  // 重置搜索参数
  const resetSearchParams = () => {
    // 清空搜索表单
    searchForm.value = {
      walletAddress: undefined,
      ownership: undefined,
      mainChains: undefined,
      status: undefined,
      totalValueRange: undefined,
      daterange: undefined
    }

    // 清空搜索参数（保留分页参数）
    const searchParamsObj = searchParams as Record<string, any>
    const paginationKeys = ['current', 'size']
    Object.keys(searchParamsObj).forEach((key) => {
      if (!paginationKeys.includes(key)) {
        delete searchParamsObj[key]
      }
    })

    // 重置分页到第一页
    pagination.current = 1

    // 刷新数据
    refreshData()
  }

  // 页面初始化：应用当前激活视图的筛选条件
  onMounted(() => {
    // 首先加载全量数据用于纵向视图统计
    loadAllDataForStats()

    if (activeViewId.value) {
      handleViewChange(activeViewId.value)
    }
  })
</script>

<style scoped lang="scss">
  .wallet-monitoring-container {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }

  .main-content-area {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
  }

  .wallet-monitoring-page {
    flex: 1;
    padding: 16px;
    overflow: auto;
  }
</style>
