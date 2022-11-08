<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-12 10:28:10
 * @LastEditTime: 2021-11-30 15:20:44
 * @LastEditors: 马潭龙
 * @Description: 流程管理列表
 * @FilePath: \hifar-platform-client\src\views\hifar\flowProcess\FlowProcessList.vue
-->
<template>
  <div ref="flowProcessListWrapper" style="height: 100%; width: 100%; position: relative">
    <h-card fixed title="流程管理">
      <h-search v-model="queryParams" slot="search-form" :data="searchBar" @change="refresh" />
      <template slot="table-operator">
        <a-button v-has="'flow:add'" type="primary" icon="plus" size="small" @click="handleAdd">新建流程</a-button>
        <!-- <a-button v-if="selectedRowKeys.length" type="danger" icon="delete" size="small" @click="deleteBatch">
          批量删除
        </a-button> -->
        <template>
          <a-button v-has="'flow:delete'" type="danger" size="small" icon="delete" @click="deleteBatch">
            批量删除
          </a-button>
        </template>
      </template>
      <h-vex-table
        slot="content"
        ref="flowProcessTable"
        :columns="columns"
        :data="loadData"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelect }"
      >
        <template slot="actions" slot-scope="text, record">
          <a href="javascript:;" class="primary-text" @click="() => handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link"> 更多 <a-icon type="down" /> </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a href="javascript:;" class="warning-text" @click="() => handleShowHistory(record.id)">历史版本</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确认删除？" @confirm="() => handleDelete(record.id)">
                  <a href="javascript:;" class="danger-text">删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </template>
      </h-vex-table>
    </h-card>
    <flow-process-modal ref="flowProcessModal" @change="() => refresh(true)"></flow-process-modal>
    <flow-process-history-modal ref="flowProcessHistoryModal"></flow-process-history-modal>
  </div>
</template>

<script>
import { getAction, postAction } from '@/api/manage'
import FlowProcessModal from './modules/FlowProcessModal'
import FlowProcessHistoryModal from './modules/FlowProcessHistoryModal'
import mixin from '@/views/hifar/mixin.js'
export default {
  provide() {
    return {
      getContainer: () => this.$refs.flowProcessListWrapper,
    }
  },
  components: { FlowProcessModal, FlowProcessHistoryModal },
  mixins:[mixin],
  data() {
    return {
      queryParams: {},
      searchBar: [
        {
          title: '流程名称',
          key: 'c_proName_7',
          formType: 'input',
        },
        {
          title: '类型名称',
          key: 'c_proTypeName_7',
          formType: 'input',
        },
        {
          title: '流程编码',
          key: 'c_proCode_7',
          formType: 'input',
        },
      ],
      columns: [
        {
          title: '流程名称',
          dataIndex: 'proName',
          customRender: (text) => {
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
        // {
        //   title: '流程版本',
        //   dataIndex: 'proVersion',
        //   customRender: (text) => {
        //     return text || '--'
        //   },
        // },
        {
          title: '流程类型',
          dataIndex: 'proTypeName',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '操作',
          width: 120,
          align: 'center',
          fixed: 'right',
          scopedSlots: {
            customRender: 'actions',
          },
        },
      ],
      selectedRowKeys: [],
      url: {
        list: '/FlowDefBusiness/listPage',
        del: '/FlowDefBusiness/logicRemoveById',
      },
    }
  },
  methods: {
    refresh(bool = true) {
      this.$refs.flowProcessTable.refresh(bool)
    },
    loadData(params) {
      let data = {
        ...params,
        ...this.queryParams,
      }
      return getAction(this.url.list, data).then((res) => {
        if (res.code == 200) {
          return res.data
        }
      })
    },
    onSelect(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    handleAdd() {
      this.$refs.flowProcessModal.add()
    },
    handleEdit(record) {
      this.$refs.flowProcessModal.edit(record)
    },
    deleteBatch() {
      if(this.selectedRowKeys.length){
      this.$confirm({
        title: '确定删除？',
        content: '删除后数据不可恢复，确认删除？',
        onOk: () => {
          let ids = this.selectedRowKeys.join(',')
          this.handleDelete(ids)
        },
      })
      }else{
        this.openNotificationWithIcon('error','删除提示', '请至少选择一项')
      }
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
    handleShowHistory(id) {
      this.$refs.flowProcessHistoryModal.show(id)
    },
  },
}
</script>

<style>
</style>