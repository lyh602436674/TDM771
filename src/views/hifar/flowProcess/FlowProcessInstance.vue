<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-30 09:54:24
 * @LastEditTime: 2021-09-07 15:09:50
 * @LastEditors: 陈乾龙
 * @Description: 流程历史实例
 * @FilePath: \hifar-platform-client\src\views\hifar\flowProcess\FlowProcessInstance.vue
-->
<template>
  <div ref="flowProcessInstanceWrapper" class="flow-process-instance">
    <h-card fixed title="流程实例">
      <h-search v-model="queryParams" slot="search-form" :data="searchForm" @change="refresh" />
      <h-vex-table slot="content" ref="flowProcessInstance" :columns="columns" :data="loadData">
        <a slot="proTitle" slot-scope="text,record" @click="() => handleDetail(record)">
          {{record.proTitle}}
        </a>
        <template slot="actions" slot-scope="text, record">
          <a-icon
            type="eye"
            title="查看"
            class="primary-text"
            style="cursor: pointer"
            @click="() => handleDetail(record)"
          />
        </template>
      </h-vex-table>
    </h-card>
    <flow-process-instance-modal ref="instanceModal" @change="refresh" />
  </div>
</template>

<script>
import { postAction } from '@/api/manage'
import FlowProcessInstanceModal from './modules/FlowProcessInstanceModal.vue'
export default {
  provide() {
    return {
      getContainer: () => {
        return this.$refs.flowProcessInstanceWrapper
      },
    }
  },
  components: { FlowProcessInstanceModal },
  data() {
    return {
      url: {
        list: '/FlowBusiness/listPageProcessInstance',
      },
      queryParams: {},
      searchForm: [
        {
          title: '实例名称',
          key: 'c_proTitle_7',
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
          title: '实例名称',
          dataIndex: 'proTitle',
          scopedSlots: {
            customRender: 'proTitle',
          },
        },
        {
          title: '实例编码',
          dataIndex: 'proCode',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '流程类型',
          dataIndex: 'proTypeName',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '操作',
          width: 80,
          align: 'center',
          fixed: 'right',
          scopedSlots: {
            customRender: 'actions',
          },
        },
      ],
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
    }
  },
  methods: {
    refresh(bool = true) {
      this.$refs.flowProcessInstance.refresh(bool)
    },
    handleDetail(record) {
      this.$refs.instanceModal.show(record)
    },
  },
}
</script>

<style lang="less" scoped>
.flow-process-instance {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>