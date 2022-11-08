<!--
 * @Author: 赵峰
 * @Date: 2021-10-25 14:47:55
 * @LastEditTime: 2021-10-26 14:49:32
 * @LastEditors: 赵峰
 * @Descripttion: 岗位管理选择用户弹窗组件
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\work\modules\WorkListSelectUser.vue
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
        ref="postionNotUser"
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
  inject: ['customGetContainer', 'searchBar', 'postId'],
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
        list: '/OrgPostUserBusiness/listPageUserByNotPostId',
        add: '/OrgPostUserBusiness/addPostUsers',
      },
    }
  },
  computed: {
    postId() {
      return this.postId()
    },
  },
  methods: {
    show() {
      this.selectedRowKeys = []
      this.visible = true
    },
    refresh(bool = false) {
      this.$refs.postionNotUser.refresh(bool)
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
        postId: this.postId(),
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
        postId: this.postId(),
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