<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-29 14:10:20
 * @LastEditTime: 2021-11-15 16:59:40
 * @LastEditors: 赵峰
 * @Description: 历史记录
 * @FilePath: \task\TaskHistory.vue
-->
<template>
  <div class="task-history" ref="taskHistory">
    <h-card fixed title="历史任务">
      <h-search v-model="queryParams" slot="search-form" :data="searchForm" @change="refresh" />

      <h-vex-table ref="taskHistoryTable" slot="content" :columns="columns" :data="loadData">
        <a href="javascript:;" slot="taskCode" slot-scope="text, record" @click="() => handleShowDetail(record)">
          {{ record.taskCode || '--' }}
        </a>
        <template slot="status" slot-scope="text, record">
          <a-badge v-if="text == 1" color="geekblue" text="待分配" />
          <a-badge v-else-if="text == 10" color="green" text="已分配" />
          <a-badge v-else-if="text == 20" color="volcano" text="强制结束" />
          <a-badge v-else-if="text == 30" color="grey" text="已完成" />
          <a-badge v-else-if="text == 99" color="red" text="删除" />
        </template>
        <a href="javascript:;" slot="testNum" slot-scope="text, record">
          {{ text }}
        </a>
        <template slot="actions" slot-scope="text, record">
          <a-tooltip title="查看">
            <a-icon class="primary-text" type="eye" @click="() => handleShowDetail(record)" />
          </a-tooltip>
        </template>
      </h-vex-table>
    </h-card>
    <test-task-base-info-modal ref="taskDetail" />
  </div>
</template>

<script>
import { postAction } from '@/api/manage'
import moment from 'moment'
import TestTaskBaseInfoModal from './TestTaskBaseInfoModal'

export default {
  provide() {
    return {
      getContainer: () => this.$refs.taskHistory,
    }
  },
  components: {
    TestTaskBaseInfoModal,
  },
  data() {
    return {
      queryParams: {},
      searchForm: [
        {
          title: '试品名称',
          key: 'productName',
          formType: 'input',
        },
        {
          title: '试品代号',
          key: 'productAlias',
          formType: 'input',
        },
        {
          title: '试验名称',
          key: 'c_testName_7',
          formType: 'input',
        },
        {
          title: '委托单位',
          key: 'c_custName_7',
          formType: 'input',
        },
        {
          title: '试验项目',
          key: 'c_unitName_7',
          formType: 'input',
        },
        {
          title: '实验室',
          key: 'c_workName_7',
          formType: 'input',
        },
        {
          title: '任务状态',
          key: 'c_status_1',
          formType: 'select',
          options: [
            {
              title: '待分配',
              key: 1,
              value: 1,
            },
            {
              title: '已分配',
              key: 10,
              value: 10,
            },
            {
              title: '强制结束',
              key: 20,
              value: 20,
            },
            {
              title: '已完成',
              key: 30,
              value: 30,
            },
          ],
        },
      ],
      columns: [
        {
          title: '任务编号',
          dataIndex: 'taskCode',
          minWidth: 160,
          scopedSlots: {
            customRender: 'taskCode',
          },
        },
        {
          title: '任务状态',
          dataIndex: 'status',
          scopedSlots: {
            customRender: 'status',
          },
          minWidth: 100,
        },
        {
          title: '试品名称',
          dataIndex: 'productNames',
          minWidth: 100,
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '试品代号',
          dataIndex: 'productAliass',
          minWidth: 100,
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '委托单位',
          dataIndex: 'custName',
          minWidth: 100,
        },
        {
          title: '试验名称',
          dataIndex: 'testName',
          align: 'center',
          minWidth: 100,
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '试验项目',
          dataIndex: 'unitName',
          minWidth: 100,
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '试品数量',
          dataIndex: 'productNums',
          minWidth: 100,
          align: 'center',
        },
        {
          title: '委托日期',
          dataIndex: 'entrustTime',
          minWidth: 160,
          customRender: (text) => {
            return text ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '期望开始时间',
          dataIndex: 'taskExpectStartTime',
          minWidth: 160,
          customRender: (text) => {
            return text ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '预计用时（小时）',
          dataIndex: 'predictDuration',
          minWidth: 140,
          align: 'center',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '异常数量',
          minWidth: 100,
          dataIndex: 'waitOverNum',
          align: 'center',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '实验室',
          dataIndex: 'workName',
          minWidth: 100,
        },
        {
          title: '试验',
          dataIndex: 'testNum',
          minWidth: 100,
          align: 'center',
          scopedSlots: {
            customRender: 'testNum',
          },
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          width: 80,
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
      url: {
        list: '/HfEnvTaskBusiness/listPage',
      },
    }
  },
  methods: {
    refresh(bool = false) {
      this.$refs.taskHistoryTable.refresh(bool)
    },
    handleShowDetail(record) {
      this.$refs.taskDetail.show(record)
    },
  },
}
</script>

<style lang="less">
.task-history {
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
}
</style>