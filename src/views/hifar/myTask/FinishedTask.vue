<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-30 11:14:51
 * @LastEditTime: 2021-09-14 11:29:19
 * @LastEditors: 赵峰
 * @Description: 
 * @FilePath: \hifar-platform-client\src\views\hifar\myTask\FinishedTask.vue
-->
<template>
  <div ref="myTaskWrapper" style="height: 100%; position: relative">
    <h-card fixed>
      <h-search slot="search-form" v-model="queryParams" :data="searchForm" @change="refresh" />
      <h-vex-table ref="myTask" slot="content" :columns="columns" :data="loadData">
        <a href="javascript:;" slot="proTitle" slot-scope="text, record" @click="() => handleDetail(record)">
          {{ record.proTitle }}
        </a>
        <span slot="actions" slot-scope="text, record">
          <a-icon
            type="eye"
            title="查看"
            class="primary-text"
            style="cursor: pointer"
            @click="() => handleDetail(record)"
          />
          <a-divider type="vertical" />
          <a-icon
            type="arrow-left"
            title="撤销"
            class="danger-text"
            style="cursor: pointer"
            @click="() => handleRevoke(record)"
          />
        </span>
      </h-vex-table>
    </h-card>
    <finished-task-detail ref="finishedTaskDetail" @change="refresh"></finished-task-detail>
  </div>
</template>

<script>
import { postAction } from '@/api/manage'
import moment from 'moment'
import FinishedTaskDetail from './modules/FinishedTaskDetail.vue'
export default {
  components: { FinishedTaskDetail },
  provide() {
    return {
      getContainer: () => this.$refs.myTaskWrapper,
    }
  },
  data() {
    return {
      queryParams: {},
      searchForm: [
        {
          title: '标题',
          key: 'c_proTitle_7',
          formType: 'input',
        },
        // {
        //   title: '任务编号',
        //   key: 'c_taskCode_7',
        //   formType: 'input',
        // },
        {
          title: '发起人',
          key: 'c_createUserName_7',
          formType: 'input',
        },
      ],
      // 任务名称 任务编号 开始时间 当前环节 审批人 发起人 发起时间 流程分类 流程名称 操作
      columns: [
        {
          title: '标题',
          dataIndex: 'proTitle',
          minWidth: 242,
          scopedSlots: {
            customRender: 'proTitle',
          },
        },
        // {
        //   title: '任务编号',
        //   dataIndex: 'taskCode',
        //   minWidth: 156,
        // },
        {
          title: '开始时间',
          dataIndex: 'taskCreateTime',
          customRender: (text) => {
            return text ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
          minWidth: 140,
        },
        {
          title: '当前环节',
          dataIndex: 'nodeName',
          minWidth: 100,
        },
        {
          title: '审批人',
          dataIndex: 'userName',
          customRender: (text) => {
            return text || '--'
          },
          minWidth: 100,
        },
        {
          title: '发起人',
          dataIndex: 'createUserName',
          minWidth: 100,
        },
        {
          title: '发起时间',
          dataIndex: 'taskCreateTime',
          minWidth: 140,
          customRender: (text) => {
            return text ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '流程分类',
          dataIndex: 'proTypeName',
          minWidth: 100,
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
          ...this.queryParams,
          ...params,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
      url: {
        list: '/FlowBusiness/listPageMyDealTask',
        revoke: '/FlowBusiness/revokeTask',
      },
    }
  },
  methods: {
    refresh(bool = false) {
      this.$refs.myTask.refresh(bool)
    },
    handleDetail(record) {
      this.$refs.finishedTaskDetail.show(record)
    },
    handleRevoke(record) {
      this.$confirm({
        title: '确认撤销',
        content: '撤销后请在代办任务中查看',
        onOk: () => {
          let params = {
            taskId: record.taskId,
          }
          postAction(this.url.revoke, params).then((res) => {
            if (res.code == 200) {
              this.$message.success('撤销成功')
              this.refresh()
            }
          })
        },
      })
    },
  },
}
</script>