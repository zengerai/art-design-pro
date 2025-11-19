<template>
  <div class="evm-chain-page art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton type="primary" :icon="Plus" @click="handleAdd">添加链</ElButton>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ElCard>

    <!-- 编辑对话框 -->
    <ElDialog
      v-model="dialogVisible"
      :title="editData ? '编辑链' : '添加链'"
      width="600px"
      @close="handleDialogClose"
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
        <ElFormItem label="链名称" prop="name">
          <ElInput v-model="form.name" placeholder="请输入链名称" />
        </ElFormItem>
        <ElFormItem label="Chain ID" prop="chainId">
          <ElInputNumber
            v-model="form.chainId"
            :min="1"
            :controls="false"
            placeholder="请输入Chain ID"
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem label="RPC地址" prop="rpcUrl">
          <ElInput v-model="form.rpcUrl" placeholder="请输入RPC地址" />
        </ElFormItem>
        <ElFormItem label="浏览器地址" prop="explorerUrl">
          <ElInput v-model="form.explorerUrl" placeholder="请输入区块浏览器地址" />
        </ElFormItem>
        <ElFormItem label="原生代币" prop="nativeCurrency">
          <ElInput v-model="form.nativeCurrency" placeholder="请输入原生代币符号" />
        </ElFormItem>
        <ElFormItem label="状态" prop="status">
          <ElSwitch v-model="form.status" :active-value="1" :inactive-value="0" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, h } from 'vue'
  import { ElMessage, ElMessageBox, ElTag, ElButton, FormRules, FormInstance } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import ArtTableHeader from '@/components/core/tables/art-table-header/index.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'

  defineOptions({ name: 'EvmChain' })

  // 对话框
  const dialogVisible = ref(false)
  const editData = ref<any>(null)
  const formRef = ref<FormInstance>()

  // 表单数据
  const form = reactive({
    name: '',
    chainId: null as number | null,
    rpcUrl: '',
    explorerUrl: '',
    nativeCurrency: '',
    status: 1
  })

  // 表单验证规则
  const rules: FormRules = {
    name: [{ required: true, message: '请输入链名称', trigger: 'blur' }],
    chainId: [{ required: true, message: '请输入Chain ID', trigger: 'blur' }],
    rpcUrl: [{ required: true, message: '请输入RPC地址', trigger: 'blur' }],
    nativeCurrency: [{ required: true, message: '请输入原生代币符号', trigger: 'blur' }]
  }

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
      apiFn: async () => {
        // TODO: 调用实际的API接口
        // 模拟数据
        await new Promise((resolve) => setTimeout(resolve, 500))
        return {
          data: {
            records: [
              {
                id: 1,
                name: 'Ethereum',
                chainId: 1,
                rpcUrl: 'https://eth.llamarpc.com',
                explorerUrl: 'https://etherscan.io',
                nativeCurrency: 'ETH',
                status: 1
              },
              {
                id: 2,
                name: 'BSC',
                chainId: 56,
                rpcUrl: 'https://bsc-dataseed.binance.org',
                explorerUrl: 'https://bscscan.com',
                nativeCurrency: 'BNB',
                status: 1
              },
              {
                id: 3,
                name: 'Polygon',
                chainId: 137,
                rpcUrl: 'https://polygon-rpc.com',
                explorerUrl: 'https://polygonscan.com',
                nativeCurrency: 'MATIC',
                status: 1
              }
            ],
            total: 3
          }
        }
      },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        { prop: 'name', label: '链名称', minWidth: 120 },
        { prop: 'chainId', label: 'Chain ID', width: 100 },
        { prop: 'rpcUrl', label: 'RPC地址', minWidth: 200 },
        { prop: 'explorerUrl', label: '浏览器地址', minWidth: 200 },
        { prop: 'nativeCurrency', label: '原生代币', width: 100 },
        {
          prop: 'status',
          label: '状态',
          width: 80,
          formatter: (row: any) =>
            h(ElTag, { type: row.status === 1 ? 'success' : 'danger' }, () =>
              row.status === 1 ? '启用' : '禁用'
            )
        },
        {
          prop: 'action',
          label: '操作',
          width: 150,
          fixed: 'right',
          formatter: (row: any) =>
            h('div', {}, [
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
      name: '',
      chainId: null,
      rpcUrl: '',
      explorerUrl: '',
      nativeCurrency: '',
      status: 1
    })
    dialogVisible.value = true
  }

  // 编辑
  const handleEdit = (row: any) => {
    editData.value = row
    Object.assign(form, {
      name: row.name,
      chainId: row.chainId,
      rpcUrl: row.rpcUrl,
      explorerUrl: row.explorerUrl,
      nativeCurrency: row.nativeCurrency,
      status: row.status
    })
    dialogVisible.value = true
  }

  // 删除
  const handleDelete = async () => {
    try {
      await ElMessageBox.confirm('确定要删除该链吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      // TODO: 调用实际的删除接口
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
      // TODO: 调用实际的保存接口
      ElMessage.success(editData.value ? '修改成功' : '添加成功')
      dialogVisible.value = false
      refreshData()
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  // 关闭对话框
  const handleDialogClose = () => {
    formRef.value?.resetFields()
  }
</script>

<style scoped lang="scss">
  .evm-chain-page {
    padding: 16px;
  }
</style>
