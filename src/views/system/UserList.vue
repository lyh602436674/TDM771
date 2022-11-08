`<template>
  <h-card fixed title="用户管理">
    <h-search
      v-model="queryParam"
      slot="search-form"
      size="small"
      :showToggleButton="true"
      :data="searchBar"
      @change="refresh"
    />
    <!-- 操作按钮 -->
    <div slot="table-operator">
      <a-button v-has="'userlist:add'" type="ghost-primary" size="small" @click="handleAdd" icon="plus">添加用户</a-button>
      <a-button v-has="'userlist:derive'" size="small" type="ghost-success" icon="download" @click="handleExportXls('用户管理')">导出</a-button>
      <a-button type="ghost-success" size="small" icon="import" @click="handleImportExcel">导入</a-button>
      <!-- <a-button type="success" size="small" @click="handleSyncUser">
        <h-icon type="icon-tongbu"></h-icon>
        同步流程
      </a-button>
      <a-button type="ghost-warning" size="small" icon="download" @click="handleExportXls('用户信息')">导出</a-button>
      <a-upload
        name="file"
        :showUploadList="false"
        :multiple="false"
        :headers="tokenHeader"
        :action="importExcelUrl"
        @change="handleImportExcel"
      >
        <a-button type="ghost-success" size="small" icon="import">导入</a-button>
      </a-upload>
      <a-button type="ghost-danger" size="small" icon="delete" @click="recycleBinVisible = true">回收站</a-button> -->
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay" @click="handleMenuClick">
          <!-- <a-menu-item key="1" class="danger-text">
            <a-icon type="delete" @click="batchDel" />
            删除
          </a-menu-item> -->
          <a-menu-item key="2">
            <a-icon type="lock" @click="batchFrozen('2')" />
            冻结
          </a-menu-item>
          <a-menu-item key="3">
            <a-icon type="unlock" @click="batchFrozen('1')" />
            解冻
          </a-menu-item>
        </a-menu>
        <a-button size="small" style="margin-left: 8px">
          批量操作
          <a-icon type="down" />
        </a-button>
      </a-dropdown>
    </div>
    <!-- 列表区域 -->
    <template slot="content">
      <h-vex-table
        ref="table"
        :columns="columns"
        :data="loadData"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelect }"
      >
        <span slot="userCode" slot-scope="text, record">
          <a href="javascript:;" @click="handleDetailCode(record)">
            {{ record.userCode ? record.userCode : '--' }}
          </a>
        </span>
        <h-tag
          slot="status"
          slot-scope="text, record"
          type="1"
          :status="record.status == 1 ? 'start' : 'stop'"
          style="font-size: 26px"
        />
        <template slot="orgCodeTxt" slot-scope="text, record">
          <template v-if="record.deptName">
            <a-tag v-for="(item, index) in record.deptName.split(',')" :key="index" style="margin: 2px">
              {{ item || '--' }}
            </a-tag>
          </template>
          <span v-else>--</span>
        </template>
        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical" />

          <a-dropdown>
            <a class="ant-dropdown-link"> 更多 <a-icon type="down" /> </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a href="javascript:;" @click="handleDetail(record)">详情</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a class="danger-text">删除</a>
                </a-popconfirm>
              </a-menu-item>

              <a-menu-item v-if="record.status == 1">
                <a-popconfirm title="确定冻结吗?" @confirm="() => handleFrozen(record.id, 2, record.userCode)">
                  <a>冻结</a>
                </a-popconfirm>
              </a-menu-item>

              <a-menu-item v-if="record.status == 2">
                <a-popconfirm title="确定解冻吗?" @confirm="() => handleFrozen(record.id, 1, record.userCode)">
                  <a>解冻</a>
                </a-popconfirm>
              </a-menu-item>

              <a-menu-item>
                <a-popconfirm title="确定重置密码吗?" @confirm="() => handleChangePassword(record.id)">
                  重置密码
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
      </h-vex-table>
      <!-- table区域-end -->

      <user-modal ref="modalForm" @ok="refresh"></user-modal>

      <password-modal ref="passwordmodal" @ok="passwordModalOk"></password-modal>

      <!-- 用户回收站 -->
      <user-recycle-bin-modal :visible.sync="recycleBinVisible" @ok="refresh" />
      <h-file-import ref="HFileImport" @change="refresh(true)" @downloadExcel="downloadChange"/>
    </template>
  </h-card>
</template>

<script>
import UserModal from './modules/UserModal'
import PasswordModal from './modules/PasswordModal'
import {downloadFile, getFileAccessHttpUrl, putAction} from '@/api/manage'
import {frozenBatch, getUserList} from '@/api/api'
import UserRecycleBinModal from './modules/UserRecycleBinModal'
import {postAction} from '../../api/manage'
import moment from 'moment'

export default {
  name: 'UserList',
  components: {
    UserModal,
    PasswordModal,
    UserRecycleBinModal,
  },
  data() {
    return {
      // 查询条件
      queryParam: {},
      searchBar: [
        {
          title: '用户账号',
          key: 'c_userCode_7',
          formType: 'input',
        },
        {
          title: '用户性别',
          key: 'c_sex_7',
          formType: 'select',
          options: [
            {
              key: '1',
              label: '男',
              value: '1',
            },
            {
              key: '2',
              label: '女',
              value: '2',
            },
            {
              key: '0',
              label: '保密',
              value: '0',
            },
          ],
        },
        {
          title: '用户姓名',
          key: 'c_idName_7',
          formType: 'input',
        },
        {
          title: '手机号码',
          key: 'c_mobile_7',
          formType: 'input',
        },
        {
          title: '用户座机',
          key: 'c_telephone_7',
          formType: 'input',
        },
        {
          title: '用户状态',
          key: 'c_status_1',
          formType: 'select',
          options: [
            {
              key: '1',
              label: '正常',
              value: '1',
            },
            {
              key: '2',
              label: '冻结',
              value: '2',
            },
          ],
        },
      ],
      recycleBinVisible: false,
      columns: [
        {
          title: '用户账号',
          align: 'center',
          dataIndex: 'userCode',
          sorter: true,
          scopedSlots: { customRender: 'userCode' },
        },
        {
          title: '用户姓名',
          align: 'center',
          dataIndex: 'idName',
        },
        {
          title: '性别',
          align: 'center',
          width: 80,
          dataIndex: 'sex',
          sorter: true,
          customRender: (text, record) => {
            return record.sex == 0 ? '保密' : record.sex == 1 ? '男' : '女'
          },
        },
        {
          title: '生日',
          align: 'center',
          width: 100,
          dataIndex: 'birthday',
          customRender: (text) => {
            return text ? moment(text.toString()).format('YYYY-MM-DD') : '--'
          },
        },
        {
          title: '手机号码',
          align: 'center',
          width: 100,
          dataIndex: 'mobile',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '用户座机',
          align: 'center',
          width: 100,
          dataIndex: 'telephone',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '部门',
          align: 'center',
          width: 180,
          dataIndex: 'deptName',
          scopedSlots: {
            customRender: 'orgCodeTxt',
          },
        },
        {
          title: '状态',
          align: 'center',
          width: 100,
          dataIndex: 'status',
          scopedSlots: {
            customRender: 'status',
          },
        },
        {
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          scopedSlots: { customRender: 'action' },
          align: 'center',
          width: 140,
        },
      ],
      url: {
        delete: '/OrgUserBusiness/logicRemoveById',
        deleteBatch: '/OrgUserBusiness/logicRemoveById',
        export: '/OrgUserExport/exportExcel',
        importExcelUrl: '/BaseOrgUserImport/importExcel',
      },
      disableMixinCreated: true,
      selectedRowKeys: [],
      selectionRows: [],
    }
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
  },
  methods: {
    onSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    refresh(bool = false) {
      this.$refs.table.refresh(bool)
    },
    loadData(params) {
      if (this.loading) return
      let data = {
        ...params,
        ...this.queryParam,
      }
      this.loading = true
      return getUserList(data)
        .then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    getAvatarView: function (avatar) {
      return getFileAccessHttpUrl(avatar)
    },

    batchFrozen: function (status) {
      if (this.selectedRowKeys.length <= 0) {
        this.$message.warning('请选择一条记录！')
        return false
      } else {
        let ids = ''
        let that = this
        let isAdmin = false
        that.selectionRows.forEach(function (row) {
          if (row.username == 'admin') {
            isAdmin = true
          }
        })
        if (isAdmin) {
          that.$message.warning('管理员账号不允许此操作,请重新选择！')
          return
        }
        ids = this.selectedRowKeys.join(',')
        that.$confirm({
          title: '确认操作',
          content: '是否' + (status == 1 ? '解冻' : '冻结') + '选中账号?',
          onOk: function () {
            frozenBatch({ ids: ids, status: status }).then((res) => {
              if (res.code == 200) {
                that.$message.success((status == 1 ? '解冻' : '冻结') + '成功')
                that.refresh()
                that.onClearSelected()
              }
            })
          },
        })
      }
    },
    handleMenuClick(e) {
      if (e.key == 1) {
        this.batchDel()
      } else if (e.key == 2) {
        this.batchFrozen(2)
      } else if (e.key == 3) {
        this.batchFrozen(1)
      }
    },
    handleFrozen(id, status, username) {
      //TODO 后台校验管理员角色
      if ('admin' == username) {
        this.$message.warning('管理员账号不允许此操作！')
        return
      }
      let params = {
        ids: id,
        status: status,
      }
      frozenBatch(params).then((res) => {
        if (res.code == 200) {
          this.$message.success(status == 1 ? '启用成功' : '冻结成功')
          this.refresh()
        }
      })
    },
    handleChangePassword(id) {
      postAction('/OrgUserBusiness/resetDefaultPwdById', { id: id }).then((res) => {
        if (res.code == 200) {
          this.$message.success('重置成功')
        }
      })
    },
    handleSyncUser() {
      var that = this
      putAction(that.url.syncUser, {}).then((res) => {
        if (res.code == 200) {
          that.$message.success(res.message)
        } else {
          that.$message.warning(res.message)
        }
      })
    },
    handleAdd() {
      this.handleEdit({})
    },
    handleEdit(record) {
      this.$refs.modalForm.disableSubmit = false
      this.$refs.modalForm.edit(record)
    },
    handleDetail(record) {
      this.$refs.modalForm.disableSubmit = true
      this.$refs.modalForm.edit(record)
    },
    handleDetailCode(record) {
      this.handleDetail(record)
    },
    passwordModalOk() {
      //TODO 密码修改完成 不需要刷新页面，可以把datasource中的数据更新一下
    },
    batchDel() {
      this.handleDelete(this.selectedRowKeys.join(','))
    },
    handleDelete(id) {
      postAction(this.url.delete, {id: id}).then((res) => {
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.refresh(true)
        } else {
          this.$message.warning(res.msg)
        }
      })
    },
    handleImportExcel() {
      this.$refs.HFileImport.show('用户管理', this.url.importExcelUrl, {})
    },
    downloadChange() {
      this.handleExportXls('用户管理', {type: 'template'})
    },
    // 导出
    async handleExportXls(name) {
      let data = {
        ...this.queryParam,
        ids: this.selectedRowKeys.join(','),
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