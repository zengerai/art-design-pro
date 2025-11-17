<template>
  <ElDialog
    v-model="visible"
    title="菜单权限"
    width="520px"
    align-center
    class="el-dialog-border"
    @close="handleClose"
  >
    <ElScrollbar height="70vh">
      <ElTree
        ref="treeRef"
        :data="processedMenuList"
        show-checkbox
        node-key="name"
        :default-expand-all="isExpandAll"
        :props="defaultProps"
        @check="handleTreeCheck"
      >
        <template #default="{ data }">
          <div style="display: flex; align-items: center">
            <span v-if="data.isAuth">
              {{ data.label }}
            </span>
            <span v-else>{{ defaultProps.label(data) }}</span>
          </div>
        </template>
      </ElTree>
    </ElScrollbar>
    <template #footer>
      <ElButton @click="outputSelectedData" style="margin-left: 8px">获取选中数据</ElButton>

      <ElButton @click="toggleExpandAll">{{ isExpandAll ? '全部收起' : '全部展开' }}</ElButton>
      <ElButton @click="toggleSelectAll" style="margin-left: 8px">{{
        isSelectAll ? '取消全选' : '全部选择'
      }}</ElButton>
      <ElButton type="primary" @click="savePermission">保存</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { formatMenuTitle } from '@/utils/router'
  import { fetchGetRoleMenus, fetchUpdateRoleMenus, fetchGetMenuTree } from '@/api/system-manage'
  import { ElMessage } from 'element-plus'

  type RoleListItem = Api.SystemManage.RoleListItem
  type MenuTreeItem = Api.SystemManage.MenuTreeItem

  interface Props {
    modelValue: boolean
    roleData?: RoleListItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    roleData: undefined
  })

  const emit = defineEmits<Emits>()

  // 使用数据库菜单数据代替 menuStore
  const dbMenuList = ref<MenuTreeItem[]>([])
  const treeRef = ref()
  const isExpandAll = ref(true)
  const isSelectAll = ref(false)
  const loading = ref(false)

  /**
   * 弹窗显示状态双向绑定
   */
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  /**
   * 菜单节点类型
   */
  interface MenuNode {
    id?: string | number
    name?: string
    label?: string
    meta?: {
      title?: string
      authList?: Array<{
        authMark: string
        title: string
        checked?: boolean
      }>
    }
    children?: MenuNode[]
    [key: string]: any
  }

  /**
   * 处理菜单数据，将 authList 转换为树形子节点
   * 递归处理菜单树，将权限列表展开为可选择的子节点
   */
  const processedMenuList = computed(() => {
    const processNode = (node: MenuNode): MenuNode => {
      const processed = { ...node }

      // 如果有 authList，将其转换为子节点
      if (node.meta?.authList?.length) {
        const authNodes = node.meta.authList.map((auth) => ({
          id: `${node.id}_${auth.authMark}`,
          name: `${node.name}_${auth.authMark}`,
          label: auth.title,
          authMark: auth.authMark,
          isAuth: true,
          checked: auth.checked || false
        }))

        processed.children = processed.children ? [...processed.children, ...authNodes] : authNodes
      }

      // 递归处理子节点
      if (processed.children) {
        processed.children = processed.children.map(processNode)
      }

      return processed
    }

    return dbMenuList.value.map(processNode)
  })

  /**
   * 树形组件配置
   */
  const defaultProps = {
    children: 'children',
    label: (data: any) => formatMenuTitle(data.meta?.title) || data.label || ''
  }

  /**
   * 监听弹窗打开，初始化权限数据
   */
  watch(
    () => props.modelValue,
    async (newVal) => {
      if (newVal && props.roleData) {
        try {
          loading.value = true
          console.log('🔍 开始加载菜单和权限数据，角色ID:', props.roleData.roleId)

          // 1. 加载数据库菜单数据
          dbMenuList.value = await fetchGetMenuTree()
          console.log('📚 菜单数据加载成功，总数:', dbMenuList.value.length)

          // 2. 获取角色已有的菜单权限ID
          const menuIds = await fetchGetRoleMenus(props.roleData.roleId)
          console.log('📥 从服务器获取的菜单ID:', menuIds)

          // 3. 将菜单ID转换为菜单name（因为Tree组件使用name作为key）
          const menuNames: string[] = []
          const findMenuName = (nodes: any[], id: number): string | null => {
            for (const node of nodes) {
              if (node.id === id) {
                return node.name
              }
              if (node.children && node.children.length > 0) {
                const found = findMenuName(node.children, id)
                if (found !== null) return found
              }
            }
            return null
          }

          for (const id of menuIds) {
            const name = findMenuName(dbMenuList.value, id)
            if (name) {
              menuNames.push(name)
            } else {
              console.warn('⚠️ 未找到菜单ID对应的name:', id)
            }
          }

          console.log('🏷️ 转换后的菜单name列表:', menuNames)

          // 4. 等待树组件完全渲染后再设置选中状态
          await nextTick()
          await nextTick() // 双重nextTick确保组件完全渲染

          if (treeRef.value) {
            treeRef.value.setCheckedKeys(menuNames)
            console.log('✅ 已设置树形组件选中状态')

            // 验证设置结果
            const actualChecked = treeRef.value.getCheckedKeys()
            console.log('🔍 实际选中的keys:', actualChecked)
          } else {
            console.error('❌ 树形组件引用不存在')
          }
        } catch (error) {
          console.error('❌ 加载菜单或权限数据失败:', error)
          ElMessage.error('加载数据失败')
        } finally {
          loading.value = false
        }
      } else if (!newVal) {
        // 弹窗关闭时清空选中状态
        console.log('🔄 弹窗关闭，清空选中状态')
        // 延迟清空，避免影响保存操作
        setTimeout(() => {
          if (treeRef.value) {
            treeRef.value.setCheckedKeys([])
          }
        }, 300)
      }
    }
  )

  /**
   * 关闭弹窗并清空选中状态
   */
  const handleClose = () => {
    visible.value = false
    // 延迟清空选中状态，避免影响保存操作
    setTimeout(() => {
      treeRef.value?.setCheckedKeys([])
    }, 300)
  }

  /**
   * 保存权限配置
   */
  const savePermission = async () => {
    try {
      if (!props.roleData) {
        ElMessage.warning('角色数据不存在')
        return
      }

      console.log('💾 开始保存权限，角色ID:', props.roleData.roleId)

      // 获取所有选中的菜单name（包括半选状态的父节点）
      const checkedKeys = treeRef.value.getCheckedKeys()
      const halfCheckedKeys = treeRef.value.getHalfCheckedKeys()
      const allKeys = [...checkedKeys, ...halfCheckedKeys]

      console.log('📋 全选中的keys:', checkedKeys)
      console.log('📋 半选中的keys:', halfCheckedKeys)
      console.log('📋 合并后的所有keys:', allKeys)

      // 过滤出实际的菜单name（排除权限按钮的虚拟节点）
      // 权限按钮的 name 格式为: menuName_authMark
      const authMarks = ['add', 'edit', 'delete', 'view', 'export', 'import']
      const validMenuNames = allKeys.filter((key: any) => {
        const keyStr = String(key)
        // 如果不包含下划线，是菜单节点
        if (!keyStr.includes('_')) return true
        // 如果包含下划线，检查最后一部分是否为权限标识
        const parts = keyStr.split('_')
        const lastPart = parts[parts.length - 1]
        // 如果最后一部分是权限标识，则是权限按钮节点，需要过滤掉
        return !authMarks.includes(lastPart.toLowerCase())
      })

      console.log('✅ 过滤后的有效菜单name:', validMenuNames)

      // 将菜单name转换为菜单id
      const menuIds: number[] = []
      const findMenuId = (nodes: any[], name: string): number | null => {
        for (const node of nodes) {
          if (node.name === name) {
            return node.id
          }
          if (node.children && node.children.length > 0) {
            const found = findMenuId(node.children, name)
            if (found !== null) return found
          }
        }
        return null
      }

      // 调试：输出 dbMenuList 的所有 name
      const debugMenuList = (nodes: any[]): any[] => {
        const result: any[] = []
        nodes.forEach((node) => {
          result.push({ id: node.id, name: node.name, title: node.meta?.title || node.title })
          if (node.children?.length) {
            result.push(...debugMenuList(node.children))
          }
        })
        return result
      }
      console.log('📚 dbMenuList 中所有菜单的 name:', debugMenuList(dbMenuList.value))

      for (const name of validMenuNames) {
        const id = findMenuId(dbMenuList.value, String(name))
        if (id !== null && typeof id === 'number') {
          menuIds.push(id)
          console.log('✅ 找到菜单:', { name, id })
        } else {
          console.warn('⚠️ 未找到菜单name对应的ID:', name)
          console.warn('   检查 dbMenuList 中是否存在该 name')
        }
      }

      console.log('🏷️ 转换后的菜单ID列表:', menuIds)

      // 调用保存接口
      await fetchUpdateRoleMenus(props.roleData.roleId, menuIds)

      console.log('✅ 权限保存成功')
      emit('success')
      handleClose()
    } catch (error) {
      console.error('❌ 保存权限失败:', error)
      ElMessage.error('保存权限失败，请重试')
    }
  }

  /**
   * 切换全部展开/收起状态
   */
  const toggleExpandAll = () => {
    const tree = treeRef.value
    if (!tree) return

    const nodes = tree.store.nodesMap
    // 这里保留 any，因为 Element Plus 的内部节点类型较复杂
    Object.values(nodes).forEach((node: any) => {
      node.expanded = !isExpandAll.value
    })

    isExpandAll.value = !isExpandAll.value
  }

  /**
   * 切换全选/取消全选状态
   */
  const toggleSelectAll = () => {
    const tree = treeRef.value
    if (!tree) return

    if (!isSelectAll.value) {
      const allKeys = getAllNodeKeys(processedMenuList.value)
      tree.setCheckedKeys(allKeys)
    } else {
      tree.setCheckedKeys([])
    }

    isSelectAll.value = !isSelectAll.value
  }

  /**
   * 递归获取所有节点的 key
   * @param nodes 节点列表
   * @returns 所有节点的 key 数组
   */
  const getAllNodeKeys = (nodes: MenuNode[]): string[] => {
    const keys: string[] = []
    const traverse = (nodeList: MenuNode[]): void => {
      nodeList.forEach((node) => {
        if (node.name) keys.push(node.name)
        if (node.children?.length) traverse(node.children)
      })
    }
    traverse(nodes)
    return keys
  }

  /**
   * 处理树节点选中状态变化
   * 同步更新全选按钮状态
   */
  const handleTreeCheck = () => {
    const tree = treeRef.value
    if (!tree) return

    const checkedKeys = tree.getCheckedKeys()
    const allKeys = getAllNodeKeys(processedMenuList.value)

    isSelectAll.value = checkedKeys.length === allKeys.length && allKeys.length > 0
  }

  /**
   * 输出选中的权限数据到控制台
   * 用于调试和查看当前选中的权限配置
   */
  const outputSelectedData = () => {
    const tree = treeRef.value
    if (!tree) return

    const selectedData = {
      checkedKeys: tree.getCheckedKeys(),
      halfCheckedKeys: tree.getHalfCheckedKeys(),
      checkedNodes: tree.getCheckedNodes(),
      halfCheckedNodes: tree.getHalfCheckedNodes(),
      totalChecked: tree.getCheckedKeys().length,
      totalHalfChecked: tree.getHalfCheckedKeys().length
    }

    console.log('=== 选中的权限数据 ===', selectedData)
    ElMessage.success(`已输出选中数据到控制台，共选中 ${selectedData.totalChecked} 个节点`)
  }
</script>
