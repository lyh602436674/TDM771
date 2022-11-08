<template>
  <div>
    <a-modal
      centered
      cancelText="关闭"
      :title="title"
      :width="1000"
      :visible="visible"
      :bodyStyle="{
        padding: '5px',
      }"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <!-- 查询区域 -->
      <h-card>
        <template slot="table-operator">
          <a-row :gutter="10">
            <a-col :span="8">
              <h-input v-model="queryParam.c_userCode_7" size="small" type="" placeholder="请输入用户账号">
                <span slot="addonBefore">用户账号</span>
              </h-input>
            </a-col>
            <a-col :span="8">
              <h-input v-model="queryParam.c_idName_7" size="small" type="" placeholder="请输入用户姓名">
                <span slot="addonBefore">用户姓名</span>
              </h-input>
            </a-col>
            <a-col :span="8">
              <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
                <a-button size="small" type="primary" icon="search" @click="searchQuery">查询</a-button>
                <a-button size="small" icon="reload" style="margin-left: 8px" @click="searchReset">重置</a-button>
              </span>
            </a-col>
          </a-row>
        </template>
        <!-- table区域-begin -->
        <h-table
          ref="selectUserTable"
          size="small"
          bordered
          rowKey="id"
          :showPagination="true"
          :columns="columns"
          :data="loadData"
          :loading="loading"
          :scroll="{ x: true }"
          :rowSelection="{
            selectedRowKeys: selectedRowKeys,
            onChange: onSelectChange,
          }"
          @change="handleTableChange"
        >
        </h-table>
        <!-- table区域-end -->
      </h-card>
    </a-modal>
  </div>
</template>

<script>
import { filterObj } from '@/utils/util'
import { getAction } from '@/api/manage'
export default {
  name: 'SelectUserModal',
  data() {
    return {
      title: '添加已有用户',
      names: [],
      visible: false,
      placement: 'right',
      description: '',
      // 查询条件
      queryParam: {},
      // 表头
      columns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 50,
          align: 'center',
          customRender: function (t, r, index) {
            return parseInt(index) + 1
          },
        },
        {
          title: '用户账号',
          align: 'center',
          width: 100,
          dataIndex: 'userCode',
        },
        {
          title: '用户名称',
          align: 'center',
          width: 100,
          dataIndex: 'idName',
        },
        {
          title: '性别',
          align: 'center',
          width: 100,
          customRender: (text, record) => {
            return record.sex == 0 ? '保密' : record.sex == 1 ? '男' : '女'
          },
        },
        {
          title: '电话',
          align: 'center',
          width: 100,
          dataIndex: 'mobile',
          customRender: (text, record) => {
            return record.mobile || '--'
          },
        },
        {
          title: '座机',
          align: 'center',
          width: 100,
          customRender: (text, record) => {
            return record.telephone || '--'
          },
        },
        {
          title: '部门',
          align: 'center',
          width: 150,
          dataIndex: 'orgCode',
        },
      ],
      //数据集
      dataSource: [],
      isorter: {
        column: 'createTime',
        order: 'desc',
      },
      loading: false,
      selectedRowKeys: [],
      selectedRows: [],
    }
  },
  methods: {
    show(roleId) {
      this.roleId = roleId
      this.visible = true
      this.$nextTick(() => {
        this.refresh()
      })
    },
    searchQuery() {
      this.refresh(true)
    },
    searchReset() {
      this.queryParam = {}
      this.refresh(true)
    },
    handleCancel() {
      this.selectedRowKeys = []
      this.selectedRows = []
      this.visible = false
    },
    handleOk() {
      this.$emit('selectFinished', this.selectedRowKeys)
      this.handleCancel()
    },
    loadData(params) {
      let data = {
        ...params,
        ...this.getQueryParams(),
        roleId: this.roleId,
      }
      return getAction('/OrgRoleUserBusiness/listPageUserByNotRoleId', data).then((res) => {
        if (res.code == 200) {
          return res.data
        }
      })
    },
    refresh(type = false) {
      this.$refs.selectUserTable.refresh(type)
    },
    getQueryParams() {
      var param = Object.assign({}, this.queryParam, this.isorter)
      return filterObj(param)
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      console.log('这里是onSelectChange', selectedRowKeys, selectedRows)
      this.selectedRowKeys = selectedRowKeys
      this.selectionRows = selectedRows
    },
    handleTableChange(pagination, filters, sorter) {
      //分页、排序、筛选变化时触发
      console.log("分页、排序、筛选变化时触发",pagination,filters,sorter)
      //TODO 筛选
      if (Object.keys(sorter).length > 0) {
        this.isorter.column = sorter.field
        this.isorter.order = 'ascend' == sorter.order ? 'asc' : 'desc'
      }
      this.refresh()
    },
  },
}
</script>
<style lang="less" scoped>
.ant-card-body .table-operator {
  margin-bottom: 18px;
}

.ant-table-tbody .ant-table-row td {
  padding-top: 15px;
  padding-bottom: 15px;
}

.anty-row-operator button {
  margin: 0 5px;
}

.ant-modal-cust-warp {
  height: 100%;
}

.ant-modal-cust-warp .ant-modal-body {
  height: calc(100% - 110px) !important;
  overflow-y: auto;
}

.ant-modal-cust-warp .ant-modal-content {
  height: 90% !important;
  overflow-y: hidden;
}
</style>