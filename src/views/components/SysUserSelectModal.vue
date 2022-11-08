<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-16 16:26:17
 * @LastEditTime: 2021-09-13 14:30:15
 * @LastEditors: 赵峰
 * @Description: 系统内用户选择弹窗组件
 * @FilePath: \hifar-platform-client\src\views\components\SysUserSelectModal.vue
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
        :rowSelection="{ selectedRowKeys: selectedRowKeys, selectedRows: selectedRows, onChange: onSelected }"
      ></h-vex-table>
    </h-card>
  </h-modal>
</template>

<script>
import { getUserList } from '@/api/api'
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
      title: '用户选择',
      visible: false,
      confirmLoading: false,
      columns: [
        {
          title: '用户姓名',
          align: 'center',
          dataIndex: 'idName',
        },
        {
          title: '性别',
          align: 'center',
          dataIndex: 'sex',
          sorter: true,
          customRender: (text, record) => {
            return record.sex == 0 ? '保密' : record.sex == 1 ? '男' : '女'
          },
        },
        {
          title: '生日',
          align: 'center',
          dataIndex: 'birthday',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '手机号码',
          align: 'center',
          dataIndex: 'mobile',
          customRender: (text) => {
            return text || '--'
          },
        },
      ],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
        }
        return getUserList(data).then((res) => {
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

<style>
</style>