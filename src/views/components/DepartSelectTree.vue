<!--
 * @Author: 陈乾龙
 * @Date: 2021-05-25 18:07:51
 * @LastEditTime: 2021-06-25 10:26:45
 * @LastEditors: 陈乾龙
 * @Description: 通用部门选择业务组件
 * @FilePath: \hifar-platform-vue\src\views\components\DepartSelectTree.vue
-->
<template>
  <div>
    <!-- 按钮操作区域 -->
    <div class="action-btns" v-if="showActionBtns">
      <a-button icon="plus" size="small" type="ghost-primary" @click="handleAdd(1)">添加部门</a-button>
      <a-button icon="plus" size="small" type="primary" ghost @click="handleAdd(2)">添加下级</a-button>
      <a-button icon="download" size="small" type="ghost-warning" @click="handleExportXls('部门信息')"> 导出 </a-button>
      <a-upload
        name="file"
        :showUploadList="false"
        :multiple="false"
        :headers="tokenHeader"
        :action="importExcelUrl"
        @change="handleImportExcel"
      >
        <a-button size="small" type="ghost-success" icon="import">导入</a-button>
      </a-upload>
      <a-button size="small" type="ghost-danger" icon="delete" title="删除多条数据" @click="batchDel">删除</a-button>
      <!-- <a-button @click="refresh" size="small" type="ghost-success" icon="reload" :loading="loading">刷新</a-button> -->
    </div>
    <div style="background: #fff; height: 100%">
      <a-alert type="info" :showIcon="true" v-if="selectable">
        <div slot="message">
          当前选择：<span v-if="this.currSelected.title">{{ getCurrSelectedTitle() || '点击部门名称选中' }}</span>
          <a v-if="this.currSelected.title" style="margin-left: 10px" @click="onClearSelected">取消选择</a>
        </div>
      </a-alert>
      <a-input-search
        v-if="showSearch"
        size="small"
        style="width: 100%; margin-top: 5px"
        placeholder="请输入部门名称"
        @search="onSearch"
        @keyup.enter.native="onSearch"
      >
        <a-button type="primary" icon="search" slot="enterButton"> 搜索 </a-button>
      </a-input-search>
      <!-- 树-->
      <a-col :md="10" :sm="24">
        <template>
          <a-dropdown :trigger="[this.dropTrigger]" @visibleChange="dropStatus">
            <span style="user-select: none">
              <a-tree
                showIcon
                :checkable="checkable"
                :multiple="multiple"
                :selectable="selectable"
                :selectedKeys="selectedKeys"
                :checkedKeys="checkedKeys"
                :treeData="departTree"
                :checkStrictly="checkStrictly"
                :expandedKeys="iExpandedKeys"
                :autoExpandParent="autoExpandParent"
                @expand="onExpand"
                @select="onSelect"
                @check="onCheck"
                @rightClick="rightHandle"
              ></a-tree>
            </span>
            <!--新增右键点击事件,和增加添加和删除功能-->
            <a-menu slot="overlay">
              <a-menu-item key="1" @click="handleEdit" >
                <a href="javascript:;" class="primary-text">编辑</a>
              </a-menu-item>
              <a-menu-item key="2" @click="handleAdd(3)" >
                <a href="javascript:;" class="success-text">添加</a>
              </a-menu-item>
              <a-menu-item key="3" @click="handleDelete">
                <a href="javascript:;" class="danger-text">删除</a>
              </a-menu-item>
              <a-menu-item key="4" @click="closeDrop">取消</a-menu-item>
            </a-menu>
          </a-dropdown>
        </template>
      </a-col>
    </div>
    <depart-modal ref="departModal" @ok="loadTree"></depart-modal>
    <depart-info-modal ref="departInfoModal" :treeData="treeData" @change="loadTree"></depart-info-modal>
  </div>
</template>

<script>
import { RLLayout } from '@/components/layouts'
import pick from 'lodash.pick'
import { queryDepartTreeList, searchByKeywords, deleteByDepartId } from '@/api/api'
import { deleteAction } from '@/api/manage'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import DepartModal from '../system/modules/DepartModal'
import DepartInfoModal from './modules/DepartInfoModal'
// 表头
const columns = [
  {
    title: '机构名称',
    dataIndex: 'departName',
  },
  {
    title: '机构类型',
    align: 'center',
    dataIndex: 'orgType',
  },
  {
    title: '机构编码',
    dataIndex: 'orgCode',
  },
  {
    title: '手机号',
    dataIndex: 'mobile',
  },
  {
    title: '传真',
    dataIndex: 'fax',
  },
  {
    title: '地址',
    dataIndex: 'address',
  },
  {
    title: '排序',
    align: 'center',
    dataIndex: 'departOrder',
  },
  {
    title: '操作',
    align: 'center',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
  },
]
export default {
  name: 'DepartSelectTree',
  props: {
    showActionBtns: {
      type: Boolean,
      default: true,
    },
    showSearch: {
      type: Boolean,
      default: true,
    },
    checkable: {
      type: Boolean,
      default: true,
    },
    multiple: {
      type: Boolean,
      default: true,
    },
    selectable: {
      type: Boolean,
      default: true,
    },
  },
  mixins: [JeecgListMixin],
  components: {
    DepartModal,
    RLLayout,
    DepartInfoModal,
  },
  data() {
    return {
      columns: columns,
      iExpandedKeys: [],
      loading: false,
      autoExpandParent: true,
      disable: true,
      treeData: [],
      visible: false,
      departTree: [],
      rightClickSelectedKey: '',
      rightClickSelectedOrgCode: '',
      dropTrigger: '',
      checkedKeys: [],
      selectedKeys: [],
      currSelected: {},
      allTreeKeys: [],
      checkStrictly: true,
      validatorRules: {
        departName: { rules: [{ required: true, message: '请输入机构/部门名称!' }] },
        orgCode: { rules: [{ required: true, message: '请输入机构编码!' }] },
        orgCategory: { rules: [{ required: true, message: '请输入机构类型!' }] },
        mobile: { rules: [{ validator: this.validateMobile }] },
      },
      url: {
        delete: '/sys/sysDepart/delete',
        edit: '/sys/sysDepart/edit',
        deleteBatch: '/sys/sysDepart/deleteBatch',
        exportXlsUrl: 'sys/sysDepart/exportXls',
        importExcelUrl: 'sys/sysDepart/importExcel',
      },
      orgCategoryDisabled: false,
    }
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
  },
  methods: {
    loadData() {
      this.refresh()
    },
    async loadTree() {
      var that = this
      that.treeData = []
      that.departTree = []
      let result = await queryDepartTreeList()
      console.log(result)
      if (result.success) {
        //部门全选后，再添加部门，选中数量增多
        this.allTreeKeys = []
        for (let i = 0; i < result.result.length; i++) {
          let temp = result.result[i]
          that.treeData.push(temp)
          that.departTree.push(temp)
          that.setThisExpandedKeys(temp)
          that.getAllKeys(temp)
        }
        this.loading = false
      }
    },
    setThisExpandedKeys(node) {
      if (node.children && node.children.length > 0) {
        this.iExpandedKeys.push(node.key)
        for (let a = 0; a < node.children.length; a++) {
          this.setThisExpandedKeys(node.children[a])
        }
      }
    },
    refresh() {
      this.loading = true
      this.loadTree()
    },
    // 右键操作方法
    rightHandle(node) {
      this.dropTrigger = 'contextmenu'
      this.rightClickSelectedKey = node.node.eventKey
      this.rightClickSelectedOrgCode = node.node.dataRef.orgCode
      this.rightClickSelectedDepart = node.node.dataRef
      console.log(this.rightClickSelectedKey, this.rightClickSelectedOrgCode, node)
    },
    onExpand(expandedKeys) {
      console.log('onExpand', expandedKeys)
      // if not set autoExpandParent to false, if children expanded, parent can not collapse.
      // or, you can remove all expanded children keys.
      this.iExpandedKeys = expandedKeys
      this.autoExpandParent = false
    },
    backFlowList() {
      this.$router.back(-1)
    },
    // 右键点击下拉框改变事件
    dropStatus(visible) {
      if (visible == false) {
        this.dropTrigger = ''
      }
    },
    // 右键店家下拉关闭下拉框
    closeDrop() {
      this.dropTrigger = ''
    },
    addRootNode() {
      this.$refs.nodeModal.add(this.currFlowId, '')
    },
    batchDel: function () {
      console.log(this.checkedKeys)
      if (this.checkedKeys.length <= 0) {
        this.$message.warning('请选择一条记录！')
      } else {
        var ids = ''
        for (var a = 0; a < this.checkedKeys.length; a++) {
          ids += this.checkedKeys[a] + ','
        }
        var that = this
        this.$confirm({
          title: '确认删除',
          content: '确定要删除所选中的 ' + this.checkedKeys.length + ' 条数据，以及子节点数据吗?',
          onOk: function () {
            deleteAction(that.url.deleteBatch, { ids: ids }).then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.loadTree()
                that.onClearSelected()
              } else {
                that.$message.warning(res.message)
              }
            })
          },
        })
      }
    },
    onSearch(value) {
      let that = this
      if (value) {
        searchByKeywords({ keyWord: value }).then((res) => {
          if (res.success) {
            that.departTree = []
            for (let i = 0; i < res.result.length; i++) {
              let temp = res.result[i]
              that.departTree.push(temp)
            }
          } else {
            that.$message.warning(res.message)
          }
        })
      } else {
        that.loadTree()
      }
    },
    onCheck(checkedKeys, info) {
      console.log('onCheck', checkedKeys, info)
      //this.checkedKeys = checkedKeys.checked
      // <!---- author:os_chengtgen -- date:20190827 --  for:切换父子勾选模式 =======------>
      if (this.checkStrictly) {
        this.checkedKeys = checkedKeys.checked
      } else {
        this.checkedKeys = checkedKeys
      }
      // <!---- author:os_chengtgen -- date:20190827 --  for:切换父子勾选模式 =======------>
      let checkedData = []
      checkedData = info.checkedNodes.map((vnode) => {
        return vnode.data.props
      })
      this.$emit('check', this.checkedKeys, checkedData)
    },
    onSelect(selectedKeys, e) {
      console.log('selected', selectedKeys, e)
      let record = e.node.dataRef
      console.log('onSelect-record', record)
      this.currSelected = Object.assign({}, record)
      this.selectedKeys = [record.key]
      this.$emit('select', this.selectedKeys)
    },
    getCurrSelectedTitle() {
      return !this.currSelected.title ? '' : this.currSelected.title
    },
    onClearSelected() {
      this.checkedKeys = []
      this.currSelected = {}
      this.selectedKeys = []
      this.$emit('select', this.selectedKeys)
    },
    handleNodeTypeChange(val) {
      this.currSelected.nodeType = val
    },
    notifyTriggerTypeChange(value) {
      this.currSelected.notifyTriggerType = value
    },
    receiptTriggerTypeChange(value) {
      this.currSelected.receiptTriggerType = value
    },
    handleAdd(num) {
      if (num == 1) {
        this.$refs.departModal.add()
        this.$refs.departModal.title = '新增'
      } else if (num == 2) {
        let key = this.currSelected.key
        if (!key) {
          this.$message.warning('请先点击选中上级部门！')
          return false
        }
        this.$refs.departModal.add(this.selectedKeys)
        this.$refs.departModal.title = '新增'
      } else {
        this.$refs.departModal.add(this.rightClickSelectedKey)
        this.$refs.departModal.title = '新增'
      }
    },
    handleDelete() {
      var that = this
      this.$confirm({
        title: '确认删除',
        content: '确定要删除此部门以及子节点数据吗?',
        onOk: function () {
          deleteByDepartId({ id: that.rightClickSelectedKey }).then((resp) => {
            if (resp.success) {
              //删除成功后，去除已选中中的数据
              that.checkedKeys.splice(
                that.checkedKeys.findIndex((key) => key === that.rightClickSelectedKey),
                1
              )
              that.$message.success('删除成功!')
              that.loadTree()
              this.$emit('delete', this.treeData)
            } else {
              that.$message.warning('删除失败!')
            }
          })
        },
      })
    },
    selectDirectiveOk(record) {
      console.log('选中指令数据', record)
      this.nodeSettingForm.setFieldsValue({ directiveCode: record.directiveCode })
      this.currSelected.sysCode = record.sysCode
    },
    // <!---- author:os_chengtgen -- date:20190827 --  for:切换父子勾选模式 =======------>
    expandAll() {
      this.iExpandedKeys = this.allTreeKeys
    },
    closeAll() {
      this.iExpandedKeys = []
    },
    checkALL() {
      this.checkStriccheckStrictlytly = false
      this.checkedKeys = this.allTreeKeys
    },
    cancelCheckALL() {
      //this.checkedKeys = this.defaultCheckedKeys
      this.checkedKeys = []
    },
    switchCheckStrictly(v) {
      if (v == 1) {
        this.checkStrictly = false
      } else if (v == 2) {
        this.checkStrictly = true
      }
    },
    getAllKeys(node) {
      // console.log('node',node);
      this.allTreeKeys.push(node.key)
      if (node.children && node.children.length > 0) {
        for (let a = 0; a < node.children.length; a++) {
          this.getAllKeys(node.children[a])
        }
      }
    },
    handleEdit() {
      if (!this.rightClickSelectedKey) {
        this.$message.warning('请先选择一个部门')
        return
      }
      this.$refs.departInfoModal.edit(
        pick(
          this.rightClickSelectedDepart,
          'id',
          'departName',
          'orgCategory',
          'parentId',
          'orgCode',
          'departOrder',
          'mobile',
          'fax',
          'address',
          'memo'
        )
      )
    },
  },
}
</script>

<style lang='less' scoped>
.action-btns {
  .ant-btn {
    margin: 0 5px 5px 0;
  }
}
</style>