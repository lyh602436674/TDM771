<template>
  <r-l-layout :leftMinWidth="395" style="height: 100%">
    <h-card title="部门管理" slot="left" :bordered="true">
      <template slot="search-form">
        <a-input-search
          v-model="queryParam.deptName"
          size="small"
          allowClear
          placeholder="请输入部门名称"
          @search="loadData"
          @keyup.enter.native="loadData"
        >
          <a-button type="primary" size="small" icon="search" slot="enterButton"> 搜索 </a-button>
        </a-input-search>
      </template>

      <template slot="table-operator">
        <a-button size="small" type="ghost-primary" icon="plus" @click="handleAdd(1)">添加部门</a-button>
        <a-button
          v-if="this.selectedKeys && this.selectedKeys.length"
          size="small"
          type="primary"
          icon="plus"
          ghost
          @click="handleAdd(2)"
          >添加下级</a-button
        >
        <a-button size="small" type="ghost-warning" icon="download" @click="handleExportXls('部门信息')">
          导出
        </a-button>
        <!-- <a-upload
          name="file"
          :showUploadList="false"
          :multiple="false"
          :headers="tokenHeader"
          :action="importExcelUrl"
          @change="handleImportExcel"
        >
          <a-button size="small" type="ghost-success" icon="import">导入</a-button>
        </a-upload> -->
      </template>
      <div slot="content" style="margin-top: 5px">
        <a-alert type="info" :showIcon="true">
          <div slot="message">
            当前选择：
            <span v-if="this.currSelected.deptName">
              {{ this.currSelected.deptName }}
              <a style="margin-left: 10px" @click="onClearSelected">取消选择</a>
            </span>
          </div>
        </a-alert>
        <!-- 树-->
        <div style="display: block">
          <a-dropdown :trigger="[this.dropTrigger]" @visibleChange="dropStatus">
            <div style="user-select: none">
              <a-tree
                multiple
                checked
                :selectedKeys="selectedKeys"
                :checkedKeys="checkedKeys"
                :treeData="departTree"
                :checkStrictly="checkStrictly"
                :expandedKeys="iExpandedKeys"
                :autoExpandParent="autoExpandParent"
                :replaceFields="{
                  title: 'deptName',
                  key: 'id',
                  children: 'children',
                }"
                @expand="onExpand"
                @select="onSelect"
                @rightClick="rightHandle"
              />
            </div>
            <!--新增右键点击事件,和增加添加和删除功能-->
            <a-menu slot="overlay">
              <a-menu-item @click="handleAdd(3)" key="1"> <a-icon type="plus" /> 添加 </a-menu-item>
              <a-menu-item @click="handleDelete" key="2">
                <a href="javascript:;" class="danger-text"> <h-icon type="icon-shanchu" /> 删除 </a>
              </a-menu-item>
              <a-menu-item @click="closeDrop" key="3"> <a-icon type="close" /> 取消 </a-menu-item>
            </a-menu>
          </a-dropdown>
        </div>
      </div>
      <depart-modal ref="departModal" @ok="loadData"></depart-modal>
    </h-card>
    <h-card id="departListRight" slot="right" style="position: relative">
      <a-tabs slot="content" size="small" type="card" defaultActiveKey="1" style="height: 100%">
        <a-tab-pane class="ant-tab-panel" tab="基本信息" key="1">
          <a-card
            type="inner"
            :bordered="false"
            v-if="selectedKeys.length > 0"
            :bodyStyle="{ minHeight: '643px', padding: '10px' }"
          >
            <h-form ref="departInfo" v-model="model" :column="1" :formData="formData" @change="handleSubmit"></h-form>
            <div class="anty-form-btn">
              <a-button type="primary" htmlType="button" icon="form" @click="submitCurrForm">保存</a-button>
            </div>
          </a-card>
          <a-card v-else>
            <a-empty>
              <span slot="description"> 请先选择一个部门! </span>
            </a-empty>
          </a-card>
        </a-tab-pane>
        <a-tab-pane class="ant-tab-panel" tab="部门人员" key="2" forceRender>
          <depart-user ref="departUser" style="height: 100%"></depart-user>
          <depart-user-select-modal ref="departUserSelect" :inner="true" :fullScreen="true" @change="handleSubmitAdd" />
        </a-tab-pane>
      </a-tabs>
    </h-card>
  </r-l-layout>
</template>
<script>
import DepartModal from './modules/DepartModal'
import DepartUser from './modules/DepartUser'
import { addDepart, editDepart, queryDepartTreeList, searchByKeywords, deleteByDepartId } from '@/api/api'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import departMixin from './modules/departMixin'
import DepartUserSelectModal from './modules/DepartUserSelectModal.vue'
import { postAction, downloadFile } from '@/api/manage'
// 表头
const columns = [
  {
    title: '机构名称',
    dataIndex: 'deptName',
  },
  {
    title: '机构编码',
    dataIndex: 'deptCode',
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
    dataIndex: 'rowSort',
  },
  {
    title: '操作',
    align: 'center',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
  },
]
export default {
  name: 'DepartList',
  mixins: [JeecgListMixin, departMixin],
  components: {
    DepartModal,
    DepartUser,
    DepartUserSelectModal,
  },
  provide() {
    return {
      getContainer: this.getContainer,
      handleClickAdd: this.handleClickAdd,
    }
  },
  data() {
    return {
      iExpandedKeys: [],
      loading: false,
      autoExpandParent: true,
      currFlowId: '',
      currFlowName: '',
      disable: true,
      treeData: [],
      visible: false,
      departTree: [],
      rightClickSelectedKey: '',
      rightClickSelectedOrgCode: '',
      model: {},
      dropTrigger: '',
      depart: {},
      columns: columns,
      checkedKeys: [],
      selectedKeys: [],
      currSelected: {},

      allTreeKeys: [],
      checkStrictly: true,

      form: this.$form.createForm(this),
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      graphDatasource: {
        nodes: [],
        edges: [],
      },
      validatorRules: {
        deptName: { rules: [{ required: true, message: '请输入机构/部门名称!' }] },
        deptCode: { rules: [{ required: true, message: '请输入机构编码!' }] },
        orgCategory: { rules: [{ required: true, message: '请输入机构类型!' }] },
        mobile: { rules: [{ validator: this.validateMobile }] },
      },
      url: {
        addDeptUsers: '/OrgDeptUserBusiness/addDeptUsers',
        export: '/BaseOrgDeptExport/exportExcel',
      },
      fieldKeys: ['deptName', 'deptCode', 'rowSort', 'mobile', 'fax', 'address', 'memo'],
    }
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
  },
  created() {
    this.currFlowId = this.$route.params.id
    this.currFlowName = this.$route.params.name
  },
  methods: {
    getContainer() {
      return document.getElementById('departListRight')
    },
    handleClickAdd() {
      if (!this.currSelected.id) {
        this.$message.warning('请在左侧部门树中选择一个部门')
        return
      }
      this.$refs.departUserSelect.show(this.currSelected.id)
    },
    async loadData() {
      if (this.loading) return
      this.loading = true
      this.treeData = []
      this.departTree = []
      let params = {
        ...this.queryParam,
      }
      let res = await queryDepartTreeList(params)
      if (res.code == 200) {
        this.allTreeKeys = []
        this.departTree = res.data
      }
      this.loading = false
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
      this.loadData()
    },
    // 右键操作方法
    rightHandle(node) {
      this.dropTrigger = 'contextmenu'
      this.rightClickSelectedKey = node.node.eventKey
      this.rightClickSelectedOrgCode = node.node.dataRef.deptCode
    },
    onExpand(expandedKeys) {
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
    hide() {
      this.visible = false
    },
    // 部门树被选中 select
    onSelect(selectedKeys, e) {
      let depart = e.node.dataRef
      this.currSelected = Object.assign({}, depart)
      this.model = depart
      // 这里需要设置成单选模式，所以selectedKeys 只保存最新选中的数据
      this.selectedKeys = [this.model.id]
      this.model.pid = depart.pid
      this.$refs.departUser.show(depart.id)
      this.$refs.departUserSelect.handleCancel()
    },
    onClearSelected() {
      this.checkedKeys = []
      this.currSelected = {}
      this.selectedKeys = []
      this.$refs.departUser.show()
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
    submitCurrForm() {
      this.$refs.departInfo.validateForm()
    },
    // 修改部门信息
    async handleSubmit(value) {
      let params = {
        ...value,
      }
      let res = null
      if (params.id) {
        res = await editDepart(params)
      } else {
        res = await addDepart(params)
      }
      if (res.code == 200) {
        this.$message.success('保存成功')
        this.loadData()
      }
    },
    openSelect() {
      this.$refs.sysDirectiveModal.show()
    },
    handleAdd(num) {
      if (num == 1) {
        this.$refs.departModal.add()
        this.$refs.departModal.title = '新增'
      } else if (num == 2) {
        let id = this.currSelected.id
        if (!id) {
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
      this.$confirm({
        title: '确认删除',
        content: '确定要删除此部门以及子节点数据吗?',
        onOk: () => {
          deleteByDepartId({ id: this.rightClickSelectedKey }).then((resp) => {
            if (resp.code == 200) {
              //删除成功后，去除已选中中的数据
              this.$message.success('删除成功!')
              this.loadData()
              //删除后同步清空右侧基本信息内容
              this.onClearSelected()
            }
          })
        },
      })
    },
    handleSubmitAdd(selectedRowKeys) {
      if (this.$refs.departUserSelect.loading) return
      this.$refs.departUserSelect.loading = true
      let params = {
        deptId: this.currSelected.id,
        userIds: selectedRowKeys.join(','),
      }
      postAction(this.url.addDeptUsers, params)
        .then((res) => {
          if (res.code == 200) {
            this.$message.success('添加用户成功')
            this.$refs.departUserSelect.handleCancel()
            this.$refs.departUser.show(this.currSelected.id)
          }
        })
        .finally(() => {
          this.$refs.departUserSelect.loading = false
        })
    },
    // 导出
    async handleExportXls(name) {
      let data = {
        ...this.queryParam,
      }
      let url = this.url.export
      let params = data
      let fileName = name + '.xls'
      await downloadFile(url, fileName, params)
    },
  },
}
</script>
<style lang="less" scoped>
@import '~@/assets/less/common.less';
/deep/ .ant-tabs {
  height: 100%;
  .ant-tabs-bar {
    margin-bottom: 0;
  }
}
/deep/ .depart-info {
  height: 100%;
  background: #e8e8e8;
  padding: 2px;
  .ant-tab-panel {
    background: #fff;
  }
}
.anty-form-btn {
  text-align: center;
  .ant-btn {
    margin-left: 10px;
  }
}
</style>