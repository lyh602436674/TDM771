<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-04 16:59:39
 * @LastEditTime: 2021-08-19 10:43:56
 * @LastEditors: 赵峰
 * @Description: 工作中心选择用户弹窗组件
 * @FilePath: \hifar-platform-client\src\views\hifar\workcenter\modules\WorkCenterSelectUser.vue
-->
<template>
  <h-modal
    title="选择人员"
    :getContainer="customGetContainer"
    :inner="true"
    :fullScreen="true"
    :visible="visible"
    :confirmLoading="loading"
    :destroyOnClose="true"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <h-card :bordered="false">
      <h-search
        v-model="queryParams"
        slot="search-form"
        size="small"
        :data="searchBar"
        :showToggleButton="true"
        @change="() => refresh(true)"
      ></h-search>
      <h-vex-table
        ref="workCenterNotUser"
        slot="content"
        :columns="columns"
        :data="loadData"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelect }"
      ></h-vex-table>
    </h-card>
  </h-modal>
</template>

<script>
import { postAction } from '@/api/manage'
export default {
  inject: ['customGetContainer', 'searchBar', 'workCenterId', 'dataType'],
  data() {
    return {
      visible: false,
      loading: false,
      queryParams: {},
      selectedRowKeys: [],
      columns: [
        {
          title: '姓名',
          dataIndex: 'idName',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '性别',
          dataIndex: 'sex',
          customRender: (text) => {
            return text == 1 ? '男' : text == 2 ? '女' : '保密'
          },
        },
        {
          title: '电话',
          dataIndex: 'mobile',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '座机',
          dataIndex: 'telephone',
          customRender: (text) => {
            return text || '--'
          },
        },
      ],
      url: {
        list: '/HfPrjWorkCenterUserBusiness/listPageUserByNotCenterId',
        add: '/HfPrjWorkCenterUserBusiness/addCenterUserIds',
      },
    }
  },
  computed: {
    centerId() {
      return this.workCenterId()
    },
  },
  methods: {
    show() {
      this.selectedRowKeys = []
      this.visible = true
    },
    refresh(bool = false) {
      this.$refs.workCenterNotUser.refresh(bool)
    },
    onSelect(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    handleCancel() {
      this.visible = false
      this.selectedRowKeys = []
    },
    handleSubmit() {
      if (!this.selectedRowKeys.length) {
        this.$message.warning('请先选择用户')
        return
      }
      if (this.loading) return
      this.loading = true
      let params = {
        centerId: this.centerId,
        dataType: 'user',
        userIds: this.selectedRowKeys.join(','),
      }
      postAction(this.url.add, params)
        .then((res) => {
          if (res.code == 200) {
            this.$message.success('添加成功')
            this.handleCancel()
            this.$emit('change', true)
          }
        })
        .finally((res) => {
          this.loading = false
        })
    },
    loadData(params) {
      let data = {
        ...params,
        ...this.queryParams,
        centerId: this.centerId,
        dataType: this.dataType,
      }
      return postAction(this.url.list, data).then((res) => {
        if (res.code == 200) {
          return res.data
        }
      })
    },
  },
}
</script>

<style>
</style>