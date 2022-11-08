<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-25 10:44:10
 * @LastEditTime: 2021-08-25 10:57:05
 * @LastEditors: 陈乾龙
 * @Description: 系统内角色选择弹窗组件
 * @FilePath: \hifar-platform-client\src\views\components\SysRoleSelectModal.vue
-->
<template>
  <h-modal
    destroyOnClose
    inner
    fullScreen
    :title="title"
    :visible="visible"
    :width="800"
    :confirmLoading="confirmLoading"
    :getContainer="getContainer"
    @cancel="handleCancel"
    @submit="handleOk"
  >
    <h-card fixed :bordered="false">
      <h-vex-table
        slot="content"
        :columns="columns"
        :data="loadData"
        :rowSelection="{
          selectedRowKeys: selectedRowKeys,
          selectedRows: selectedRows,
          onChange: onSelected,
          type: 'radio',
        }"
      ></h-vex-table>
    </h-card>
  </h-modal>
</template>

<script>
import { postAction } from '@/api/manage'
import { isArray } from 'lodash'
export default {
  inject: {
    getContainer: {
      default: () => {
        return () => document.body
      },
    },
  },
  data() {
    return {
      title: '角色选择',
      visible: false,
      confirmLoading: false,
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
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '备注',
          align: 'center',
          dataIndex: 'remarks',
          customRender: (text) => {
            return text || '--'
          },
        },
      ],
      url: {
        list: '/OrgRoleBusiness/listPage',
      },
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
      selectedRowKeys: [],
      selectedRows: [],
    }
  },
  methods: {
    show(selectedRows = [], selectedKeys = []) {
      if (isArray(selectedRows)) {
        this.selectedRows = selectedRows
      }
      if (isArray(selectedKeys)) {
        this.selectedRowKeys = selectedKeys
      }
      this.visible = true
    },
    handleOk() {
      this.$emit('change', this.selectedRowKeys, this.selectedRows)
      this.handleCancel()
    },
    handleCancel() {
      this.visible = false
    },
    onSelected(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
  },
}
</script>