<!--
 * @Author: 赵峰
 * @Date: 2021-09-06 16:31:13
 * @LastEditTime: 2021-09-06 17:16:31
 * @LastEditors: 赵峰
 * @Descripttion: 人员档案-选择弹窗组件
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-physico-chemical\resource\user\components\UserSelectModal.vue
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
        :rowKey="(record) => record.id"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, selectedRows: selectedRows, onChange: onSelected }"
      ></h-vex-table>
    </h-card>
  </h-modal>
</template>

<script>
import { postAction } from '@/api/manage'
import { isArray } from 'lodash'
import moment from 'moment'
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
      url: {
        list: '/HfResPersonBusiness/listPage'
      },
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
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD') : '--'
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
          ...this.queryParams,
          ...params,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
      queryParams:{},
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
        this.queryParams.c_id_99=selectedKeys
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