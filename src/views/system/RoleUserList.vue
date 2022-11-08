<!--
 * @Author: JEECG
 * @Date: 2021-07-02 11:43:06
 * @LastEditTime: 2021-11-30 15:10:53
 * @LastEditors: 马潭龙
 * @Description: 角色的用户管理列表
 * @FilePath: \hifar-platform-client\src\views\system\RoleUserList.vue
-->
<template>
  <a-row :gutter="10" style="height: 100%">
    <a-col :md="leftColMd" :sm="24" style="height: 100%">
      <h-card>
        <template slot="title">角色管理</template>
        <h-search
          v-model="queryParam"
          slot="search-form"
          size="small"
          :showToggleButton="false"
          :data="searchBar1"
          @change="searchQuery"
        />
        <!-- 操作按钮区域 -->
        <div slot="table-operator">
          <a-button v-has="'role:add'" size="small" type="ghost-primary" icon="plus" @click="handleAdd">新建角色</a-button>
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
          <a-button v-has="'role:derive'" size="small" type="ghost-warning" icon="download" @click="handleExportXls('角色管理')">
            导出
          </a-button>
        </div>

        <!-- 列表 -->
        <a-table
          slot="content"
          ref="table"
          size="small"
          style="height: 100%"
          bordered
          rowKey="id"
          :columns="columns"
          :dataSource="dataSource"
          :pagination="ipagination"
          :loading="loading"
          :rowSelection="{ selectedRowKeys: selectedRowKeys1, onChange: onSelectChange1, type: 'radio' }"
          @change="handleTableChange"
        >
          <span slot="action" slot-scope="text, record">
            <a @click="handleOpen(record)">用户</a>
            <a-divider type="vertical" />
            <!-- 这个按钮暂时隐藏，如果用到该功能时再打开，切勿删除 :QianlongChen-->
            <!-- <a @click="handleDesign(record.id)">工单授权</a>
            <a-divider type="vertical" /> -->

            <a-dropdown>
              <a class="ant-dropdown-link"> 更多 <a-icon type="down" /> </a>
              <a-menu slot="overlay">
                <a-menu-item>
                  <a @click="handlePerssion(record.id)">授权</a>
                </a-menu-item>
                <a-menu-item>
                  <a @click="handleEdit(record)">编辑</a>
                </a-menu-item>
                <a-menu-item>
                  <a-popconfirm title="确定删除吗?" @confirm="() => handleDeleteRole(record.id)">
                    <a class="danger-text">删除</a>
                  </a-popconfirm>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </span>
        </a-table>
        <!-- 右侧的角色权限配置 -->
        <user-role-modal ref="modalUserRole"></user-role-modal>
        <!-- 新建角色的modal -->
        <role-modal ref="modalForm" @ok="modalFormOk"></role-modal>
        <!-- <sys-role-design-modal ref="roleDesignModal"></sys-role-design-modal> -->
      </h-card>
    </a-col>
    <a-col :md="rightColMd" :sm="24" v-if="this.rightcolval == 1" style="height: 100%">
      <h-card :bordered="false" :title="(selectionRows1.length && selectionRows1[0].roleName) + '用户'">
        <div slot="extra" style="text-align: right">
          <a-icon type="close-circle" @click="hideUserList" />
        </div>
        <!-- 查询区域 -->
        <h-search
          v-model="queryUser"
          slot="search-form"
          size="small"
          :showToggleButton="false"
          :data="userSearchBar"
          @change="roleUserRefresh"
        />

        <!-- 操作按钮区域 -->
        <div slot="table-operator">
          <a-button size="small" type="success" ghost icon="plus" @click="handleAddUserRole">已有用户</a-button>
          <a-button
            v-if="selectedUserKeys.length"
            size="small"
            type="danger"
            icon="delete"
            @click="handleDeleteRoleUserBatch"
          >
            批量删除
          </a-button>
        </div>
        <!-- table区域-begin -->
        <h-table
          slot="content"
          ref="roleUserTable"
          :columns="roleUserColumns"
          :data="loadRoleUser"
          :rowKey="(record) => record.id"
          :rowSelection="{ selectedRowKeys: selectedUserKeys, onChange: onSelectUserChange }"
        >
          <span slot="action" slot-scope="text, record">
            <a-tooltip title="用户详情">
              <a href="javascript:;" class="primary-text" @click="() => showRoleUserDetail(record)">
                <h-icon type="icon-guidang" />
              </a>
            </a-tooltip>
            <a-divider type="vertical" />
            <a-popconfirm title="确定删除吗？" @confirm="() => handleDeleteRoleUser(record.id)">
              <a href="javascript:;" class="danger-text"> <h-icon type="icon-shanchu" /> </a>
            </a-popconfirm>
          </span>
        </h-table>
        <!-- 表单区域 -->
        <!-- 用户详情modal -->
        <user-modal ref="userModal"></user-modal>
        <!-- 选择用户的model -->
        <Select-User-Modal ref="selectUserModal" @selectFinished="handleSelectUser"></Select-User-Modal>
      </h-card>
    </a-col>
  </a-row>
</template>
<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { downloadFile, postAction, getAction } from '@/api/manage'
import SelectUserModal from './modules/SelectUserModal'
import RoleModal from './modules/RoleModal'
import UserModal from './modules/UserModal'
import { filterObj } from '@/utils/util'
import UserRoleModal from './modules/UserRoleModal'
import moment from 'moment'

export default {
  name: 'RoleUserList',
  mixins: [JeecgListMixin],
  components: {
    UserRoleModal,
    SelectUserModal,
    RoleModal,
    UserModal,
  },
  data() {
    return {
      // moment,
      model1: {},
      model2: {},
      currentRoleId: '',
      // 角色查询条件
      queryParam1: {},
      searchBar1: [
        {
          title: '角色名称',
          key: 'c_roleName_7',
          formType: 'input',
        },
      ],
      // 角色列表数据
      dataSource1: [],
      // 角色分页数据
      ipagination1: {
        current: 1,
        pageSize: 10,
        pageSizeOptions: ['10', '20', '30'],
        showTotal: (total, range) => {
          return range[0] + '-' + range[1] + ' 共' + total + '条'
        },
        showQuickJumper: true,
        showSizeChanger: true,
        total: 0,
      },
      // 角色下用户
      queryUser: {},
      userSearchBar: [
        {
          title: '用户账号',
          key: 'c_userCode_7',
          formType: 'input',
        },
      ],
      isorter1: {
        column: 'createTime',
        order: 'desc',
      },
      isorter2: {
        column: 'createTime',
        order: 'desc',
      },
      filters1: {},
      filters2: {},
      loading1: false,
      loading2: false,
      selectedRowKeys1: [],
      roleUserSelectedKeys: [],
      selectionRows1: [],
      rightcolval: 0,
      columns: [
        {
          title: '角色名称',
          align: 'center',
          dataIndex: 'roleName',
        },
        {
          title: '角色编码',
          align: 'center',
          dataIndex: 'roleCode',
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          align: 'center',
          sorter: true,
          customRender: (text) => {
            return moment(parseFloat(text)).format('YYYY-MM-DD')
          },
        },
        {
          title: '操作',
          dataIndex: 'action',
          width:120,
          align: 'center',
          scopedSlots: { customRender: 'action' },
        },
      ],
      roleUserColumns: [
        {
          title: '账号',
          align: 'center',
          dataIndex: 'userCode',
          width: 120,
        },
        {
          title: '姓名',
          align: 'center',
          width: 100,
          dataIndex: 'idName',
        },
        {
          title: '电话',
          align: 'center',
          dataIndex: 'mobile',
          customRender: (text, record) => {
            return record.mobile || '--'
          },
        },
        {
          title: '座机',
          align: 'center',
          dataIndex: 'telephone',
          customRender: (text, record) => {
            return record.telephone || '--'
          },
        },
        {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' },
          align: 'center',
          width: 80,
        },
      ],
      selectedUserKeys: [],
      selectedUserRows: [],
      url: {
        list: '/OrgRoleBusiness/listPage',
        delete: '/OrgRoleBusiness/removeById',
        roleUserList: '/OrgRoleUserBusiness/listPageUserByRoleId',
        addRoleUser: '/OrgRoleUserBusiness/addRoleUsers',
        delRoleUser: '/OrgRoleUserBusiness/removeRoleUsers',
        export: '/OrgRoleExport/exportExcel',
        importExcelUrl: 'sys/role/importExcel',
      },
      disableMixinCreated: true,
    }
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
    leftColMd() {
      return this.selectedRowKeys1.length === 0 ? 24 : 12
    },
    rightColMd() {
      return this.selectedRowKeys1.length === 0 ? 0 : 12
    },
  },
  created() {
    this.loadData()
  },
  methods: {
    onClearSelected1() {
      this.selectedRowKeys1 = []
      this.selectionRows1 = []
    },
    // 角色列表选择角色
    onSelectChange1(selectedRowKeys, selectionRows) {
      this.rightcolval = 1
      this.selectedRowKeys1 = selectedRowKeys
      this.selectionRows1 = selectionRows
      this.model1 = Object.assign({}, selectionRows[0])
      this.currentRoleId = selectedRowKeys[0]
      this.roleUserRefresh(true)
    },
    handleOpen(record) {
      console.log('>>>>>>>>>>>', record)
      this.rightcolval = 1
      this.selectedRowKeys1 = [record.id]
      this.selectionRows1 = [record]
      this.model1 = Object.assign({}, record)
      this.currentRoleId = record.id
      this.roleUserRefresh(true)
    },
    getUserQueryParams() {
      var param = Object.assign(this.queryUser, this.isorter2, this.filters2)
      param.field = this.getQueryField2()
      return filterObj(param)
    },
    getQueryField2() {
      //TODO 字段权限控制
      var str = 'id,'
      this.roleUserColumns.forEach(function (value) {
        str += ',' + value.dataIndex
      })
      return str
    },
    showRoleUserDetail(record) {
      this.selectedUserRows = [record]
      this.selectedUserKeys = [record.id]
      this.$refs.userModal.show(record)
    },
    loadRoleUser(params) {
      if (this.loading2) return
      this.loading2 = true
      let data = {
        ...params,
        ...this.getUserQueryParams(),
      }
      data.roleId = this.currentRoleId
      console.log(data)
      return getAction(this.url.roleUserList, data)
        .then((res) => {
          console.log(res)
          if (res.code == 200) {
            return res.data
          }
        })
        .finally(() => {
          this.loading2 = false
        })
    },
    handleDeleteRole(id) {
      this.handleDelete(id)
      this.currentRoleId = ''
    },
    handleDeleteRoleUser(ids) {
      if (!this.url.delRoleUser) {
        this.$message.error('请设置url.delRoleUser属性!')
        return
      }
      postAction(this.url.delRoleUser, { roleId: this.currentRoleId, userIds: ids }).then((res) => {
        if (res.code == 200) {
          this.$message.success('删除成功')
          this.roleUserRefresh(true)
          this.resetSelectedUser(ids)
        }
      })
    },
    handleDeleteRoleUserBatch() {
      this.$confirm({
        title: '确认删除',
        content: '确认删除用户？',
        onOk: () => {
          let useIds = this.selectedUserKeys.join(',')
          this.handleDeleteRoleUser(useIds)
        },
      })
    },
    // 删除操作后，需要对选中的用户selectedUserKeys 和 selectedUserRows 代码
    resetSelectedUser(ids) {},
    handleSelectUser(data) {
      console.log('选中的用户', data)
      if (!data || data.length <= 0) return
      let params = {
        roleId: this.currentRoleId,
        userIds: data.join(','),
      }
      console.log(params)
      postAction(this.url.addRoleUser, params).then((res) => {
        if (res.code == 200) {
          this.roleUserRefresh(true)
          this.$message.success('添加用户成功！')
        }
      })
    },
    onSelectUserChange(selectedRowKeys, selectedRows) {
      this.selectedUserKeys = selectedRowKeys
      this.selectedUserRows = selectedRows
    },
    handleAddUserRole() {
      if (this.currentRoleId == '') {
        this.$message.error('请选择一个角色!')
      } else {
        this.$refs.selectUserModal.show(this.currentRoleId)
      }
    },
    handleEdit(record) {
      if (this.currentRoleId == '') {
        this.$message.error('请选择一个角色!')
      } else {
        this.$refs.modalForm.edit(record)
        this.$refs.modalForm.title = '编辑'
      }
    },
    roleUserRefresh(type = false) {
      if (this.$refs.roleUserTable) this.$refs.roleUserTable.refresh(type)
    },
    searchReset2() {
      this.queryUser = {}
      this.loadRoleUser(1)
    },
    handleTableChange2(pagination, filters, sorter) {
      console.log('Is this pagination error?', pagination)
      //分页、排序、筛选变化时触发
      //TODO 筛选
      if (Object.keys(sorter).length > 0) {
        this.isorter2.column = sorter.field
        this.isorter2.order = 'ascend' == sorter.order ? 'asc' : 'desc'
      }
      this.loadRoleUser()
    },
    hideUserList() {
      //this.rightcolval = 0
      this.selectedRowKeys1 = []
    },
    handlePerssion(roleId) {
      this.$refs.modalUserRole.show(roleId)
    },
    handleDesign: function (id) {
      this.$refs.roleDesignModal.edit(id)
    },
    // 导出
    async handleExportXls(name) {
      let data = {
        ...this.queryParam,
        ids:this.selectedRowKeys.join(',')
      }
      let url = this.url.export
      let params = data
      let fileName = name + '.xls'
      await downloadFile(url, fileName, params)
    },
  },
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>