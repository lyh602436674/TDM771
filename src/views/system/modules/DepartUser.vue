<!--
 * @Author: 陈乾龙
 * @Date: 2021-07-22 09:40:58
 * @LastEditTime: 2021-08-03 16:48:33
 * @LastEditors: 陈乾龙
 * @Description:  部门下的用户列表
 * @FilePath: \hifar-platform-client\src\views\system\modules\DepartUser.vue
-->
<template>
  <h-card :bordered="false">
    <div slot="table-operator">
      <a-button type="ghost-primary" size="small" icon="plus" @click="handleClickAdd">添加员工</a-button>
      <a-button v-if="selectedRowKeys.length" type="danger" size="small" icon="delete" @click="deleteBatch">
        批量删除
      </a-button>
    </div>
    <template slot="content">
      <h-table
        ref="departUserTable"
        :showAlertInfo="true"
        :scroll="{ x: true }"
        :columns="columns"
        :data="loadData"
        :rowKey="(record) => record.id"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectedChange }"
      >
        <template slot="status" slot-scope="text, record">
          <div style="font-size: 16px">
            <h-icon v-if="record.status == 2" class="danger-text" type="icon-dongjie" />
            <h-icon v-if="record.status == 1" class="success-text" type="icon-zaizhi" />
            <h-icon v-if="record.status == 88" class="danger-text" type="icon-lizhi" />
          </div>
        </template>
        <template slot="userRole" slot-scope="text, record">
          <a-tag
            v-if="record.userRole && record.userRole.length"
            v-for="(role, roleIndex) in record.userRole"
            :key="roleIndex"
          >
            {{ role }}
          </a-tag>
          <span v-else> -- </span>
        </template>
        <div slot="actions" slot-scope="text, record">
          <a-popconfirm title="确定删除吗?" @confirm="() => handleDeleteUserFromDepart(record.id)">
            <a href="javascript:;" class="danger-text">
              <h-icon type="icon-shanchu" />
            </a>
          </a-popconfirm>
        </div>
      </h-table>
    </template>
  </h-card>
</template>

<script>
import { getUserByDeptId } from '@/api/api'
import { postAction } from '@/api/manage'

export default {
  inject: ['handleClickAdd'],
  data() {
    return {
      columns: [
        {
          title: '姓名',
          dataIndex: 'idName',
        },
        {
          title: '电话',
          dataIndex: 'mobile',
          customRender: (text, record) => {
            return record.mobile || '--'
          },
        },
        {
          title: '座机号',
          dataIndex: 'telephone',
          customRender: (text, record) => {
            return record.telephone || '--'
          },
        },
        {
          title: '状态',
          align: 'center',
          scopedSlots: {
            customRender: 'status',
          },
        },
        {
          title: '角色',
          scopedSlots: {
            customRender: 'userRole',
          },
        },
        {
          title: '操作',
          align: 'center',
          fixed: 'right',
          width: 80,
          scopedSlots: {
            customRender: 'actions',
          },
        },
      ],
      deptId: null,
      selectedRowKeys: [],
      selectedRows: [],
      url: {
        delUser: '/OrgDeptUserBusiness/removeDeptUsers',
      },
    }
  },
  methods: {
    show(deptId) {
      if (deptId) {
        this.deptId = deptId
      }
      this.refresh(true)
    },
    refresh(type = false) {
      this.$refs.departUserTable.refresh(type)
    },
    loadData(params) {
      let query = {
        ...params,
        deptId: this.deptId,
      }
      return getUserByDeptId(query).then((res) => {
        if (res.code == 200) {
          res.data.data.map((item) => {
            if (item.userRole && item.userRole.length) {
              item.userRole = item.userRole.split(',')
            } else {
              item.userRole = []
            }
          })
          return res.data
        }
      })
    },
    onSelectedChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    deleteBatch() {
      this.$confirm({
        title: '确认删除',
        content: '删除员工后可以重新添加，确认删除?',
        onOk: () => {
          this.handleDeleteUserFromDepart(this.selectedRowKeys.join(','))
        },
      })
    },
    handleDeleteUserFromDepart(ids) {
      console.log(ids)
      let params = {
        deptId: this.deptId,
        userIds: ids,
      }
      postAction(this.url.delUser, params).then((res) => {
        if (res.code == 200) {
          this.$message.success('删除成功')
          this.refresh(true)
        }
      })
    },
  },
}
</script>

<style>
</style>