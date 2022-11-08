<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-18 11:12:53
 * @LastEditTime: 2021-08-18 17:41:41
 * @LastEditors: 陈乾龙
 * @Description: 流程图发布历史
 * @FilePath: \hifar-platform-client\src\views\hifar\flowProcess\modules\FlowProcessHistoryModal.vue
-->
<template>
  <h-modal
    inner
    fullScreen
    :getContainer="getContainer"
    :visible="visible"
    :footer="false"
    :title="title"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <h-card fixed>
      <h-search v-model="queryParams" slot="search-form" :showToggleButton="false" :data="searchForm" @change="refresh" />
      <template slot="table-operator">
        <a-button v-if="selectedRowKeys.length" size="small" type="danger" icon="delete" @click="deleteBatch">
          批量删除
        </a-button>
      </template>
      <h-vex-table
        v-if="visible"
        slot="content"
        ref="flowProcessHistory"
        :columns="columns"
        :data="loadData"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelect }"
      >
        <a-popconfirm slot="actions" slot-scope="text, record" title="确认删除？" @confirm="() => handleDelete(record.id)">
          <a-icon type="delete" class="danger-text" />
        </a-popconfirm>
      </h-vex-table>
    </h-card>
  </h-modal>
</template>

<script>
import { getAction, postAction } from '@/api/manage'
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
      visible: false,
      id: null,
      title: '流程历史版本',
      queryParams: {},
      searchForm: [
        {
          title: '流程名称',
          key: 'c_proName_7',
          formType: 'input',
        },
        {
          title: '流程编号',
          key: 'c_proCode_7',
          formType: 'input',
        },
      ],
      url: {
        list: '/FlowDefBusiness/listPageHisPublish',
        del: '/FlowDefBusiness/logicRemoveById',
      },
      columns: [
        {
          title: '流程名称',
          dataIndex: 'proName',
          customRender: (text,record) => {
            console.log(text,record)
            return text || '--'
          },
        },
        {
          title: '流程编号',
          dataIndex: 'proCode',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '版本号',
          dataIndex: 'proVersion',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '操作',
          dataIndex: 'actions',
          align: 'center',
          fixed: 'right',
          width: 80,
          scopedSlots: {
            customRender: 'actions',
          },
        },
      ],
      selectedRowKeys: [],
    }
  },
  methods: {
    show(id) {
      this.id = id
      this.visible = true
    },
    refresh(bool = true) {
      this.$refs.flowProcessHistory.refresh(bool)
    },
    deleteBatch() {
      this.$confirm({
        title: '确定删除？',
        content: '删除后数据不可恢复，确认删除？',
        onOk: () => {
          let ids = this.selectedRowKeys.join(',')
          this.handleDelete(ids)
        },
      })
    },
    handleDelete(ids) {
      postAction(this.url.del, { id: ids }).then((res) => {
        if (res.code == 200) {
          this.$message.success('删除成功')
          this.selectedRowKeys = []
          this.refresh(true)
        }
      })
    },
    onSelect(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    loadData(params) {
      let data = {
        ...params,
        ...this.queryParams,
        id: this.id,
      }
      return getAction(this.url.list, data).then((res) => {
        if (res.code == 200) {
          return res.data
        }
      })
    },
    handleSubmit() {},
    handleCancel() {
      this.visible = false
      this.id = null
      this.selectedRowKeys = []
    },
  },
}
</script>

<style>
</style>