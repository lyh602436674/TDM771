<template>
  <a-drawer
    :title="title"
    :maskClosable="true"
    width="650"
    placement="right"
    :closable="true"
    @close="close"
    :visible="visible"
    style="overflow: auto; padding-bottom: 53px"
  >
    <div class="h-drawer-body-wrapper">
      <a-form>
        <a-form-item label="所拥有的权限">
          <a-tree
            checkable
            :checkedKeys="checkedKeys"
            :treeData="treeData"
            :selectedKeys="selectedKeys"
            :expandedKeys="expandedKeys"
            :replaceFields="replaceFields"
            :autoExpandParent="true"
            @expand="onExpand"
            @select="onTreeNodeSelect"
            @check="onCheck"
          >
            <span slot="customTitle" slot-scope="record">
              <a-icon v-if="record.icon" :type="record.icon" />
              {{ record.title }}
            </span>
          </a-tree>
        </a-form-item>
      </a-form>
    </div>

    <div class="drawer-bootom-button">
      <a-dropdown style="float: left" :trigger="['click']" placement="topCenter">
        <a-menu slot="overlay">
          <a-menu-item key="3" @click="checkALL">全部勾选</a-menu-item>
          <a-menu-item key="4" @click="cancelCheckALL">取消全选</a-menu-item>
          <a-menu-item key="5" @click="expandAll">展开所有</a-menu-item>
          <a-menu-item key="6" @click="closeAll">合并所有</a-menu-item>
        </a-menu>
        <a-button> 树操作 <a-icon type="up" /> </a-button>
      </a-dropdown>
      <a-popconfirm title="确定放弃编辑？" @confirm="close" okText="确定" cancelText="取消">
        <a-button style="margin-right: 8px">取消</a-button>
      </a-popconfirm>
      <a-button type="primary" :loading="loading" ghost style="margin-right: 8px" @click="handleSubmit(false)">
        仅保存
      </a-button>
      <a-button type="primary" :loading="loading" @click="handleSubmit(true)">保存并关闭</a-button>
    </div>

    <role-datarule-modal ref="datarule"></role-datarule-modal>
  </a-drawer>
</template>
<script>
import { queryTreeListToTree, queryRolePermission, saveRolePermission } from '@/api/api'
import RoleDataruleModal from './RoleDataruleModal.vue'

export default {
  name: 'RoleModal',
  components: {
    RoleDataruleModal,
  },
  data() {
    return {
      roleId: '',
      treeData: [],
      defaultCheckedKeys: [],
      checkedKeys: [],
      expandedKeys: [],
      allTreeKeys: [],
      autoExpandParent: true,
      checkStrictly: true,
      title: '角色权限配置',
      visible: false,
      loading: false,
      selectedKeys: [],
      replaceFields: {
        children: 'children',
        key:'id'
      },
    }
  },
  methods: {
    onTreeNodeSelect(id) {
      if (id && id.length > 0) {
        this.selectedKeys = id
      }
      this.$refs.datarule.show(this.selectedKeys[0], this.roleId)
    },
    onCheck(o) {
      this.checkedKeys = o
    },
    show(roleId) {
      this.roleId = roleId
      this.visible = true
      this.$nextTick(() => {
        this.loadData()
      })
    },
    close() {
      this.reset()
      this.$emit('close')
      this.visible = false
    },
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
    },
    reset() {
      this.expandedKeys = []
      this.checkedKeys = []
      this.defaultCheckedKeys = []
      this.loading = false
    },
    expandAll() {
      this.expandedKeys = this.allTreeKeys
    },
    closeAll() {
      this.expandedKeys = []
    },
    checkALL() {
      this.checkedKeys = this.allTreeKeys
    },
    cancelCheckALL() {
      //this.checkedKeys = this.defaultCheckedKeys
      this.checkedKeys = []
    },
    handleCancel() {
      this.close()
    },
    handleSubmit(exit) {
      let params = {
        roleId: this.roleId,
        menuIds: this.checkedKeys.join(','),
      }
      this.loading = true
      console.log('请求参数：', params)
      saveRolePermission(params).then((res) => {
        if (res.code == 200) {
          this.$message.success("保存成功")
          this.loading = false
          if (exit) {
            this.close()
          }
        }
        this.loadData()
      })
    },
    loadData() {
      if (this.loading) return
      this.loading = true
      queryTreeListToTree({}, true)
        .then((treeRes) => {
          this.treeData = treeRes.treeData
          this.allTreeKeys = treeRes.allKeys
          console.log(this.treeData)
          return queryRolePermission({ roleId: this.roleId })
        })
        .then((res) => {
          if (res.code == 200) {
            this.checkedKeys = res.data
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
}
</script>