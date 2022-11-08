<!--
 * @Author: 赵峰
 * @Date: 2021-11-08 09:57:32
 * @LastEditTime: 2021-11-09 17:52:35
 * @LastEditors: Please set LastEditors
 * @Descripttion: 试验任务信息
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\entrustment\components\TestTaskInfo.vue
-->
<template>
  <h-card fixed :bordered="false">
    <h-vex-table
      ref="testTaskInfoTable"
      slot="content"
      :columns="columns"
      :data="loadData"
      :rowKey="(record) => record.id"
      :scroll="{ x: true }"
    >
      <template slot="status" slot-scope="text">
        <a-badge v-if="text == 1" color="geekblue" text="未开始" />
        <a-badge v-else-if="text == 10" color="red" text="已撤销" />
        <a-badge v-else-if="text == 20" color="green" text="进行中" />
        <a-badge v-else-if="text == 25" color="orange" text="异常" />
        <a-badge v-else-if="text == 30" color="volcano" text="暂停" />
        <a-badge v-else-if="text == 40" color="red" text="终止" />
        <a-badge v-else-if="text == 50" color="grey" text="已完成" />
        <a-badge v-else-if="text == 60" color="grey" text="已出报告" />
      </template>
      <span slot="testCode" slot-scope="text, record">
        <a  @click="handleGoDetail(record)">{{ record.testCode }}</a>
      </span>
    </h-vex-table>
    <work-center-user-modal ref="WorkCenterUserModal"></work-center-user-modal>
    <task-detail-modal ref="TaskDetailModal" :entrustType="entrustType"/>
  </h-card>
</template>

<script>
import moment from 'moment'
import { postAction } from '@/api/manage'
import WorkCenterUserModal from '../modules/WorkCenterUserModal'
import TaskDetailModal from '@/views/hifar/hifar-environmental-test/task/TaskDetailModal'
export default {
  components: {
    WorkCenterUserModal,
    TaskDetailModal,
  },
  props: {
    entrustId: {
      type: String,
      default: '',
    },
    entrustType: {
      type: String,
      default: '1',
    },
  },
  watch: {
    entrustId(val) {
      if (val) {
        this.refresh(true)
      }
    },
  },
  data() {
    return {
      moment,
      queryParams: {},
      url: '/HfEnvTaskTestBusiness/listPageForEntrust',
      columns: [
        {
          title: '任务状态',
          align: 'left',
          dataIndex: 'status',
          minWidth: 100,
          scopedSlots: { customRender: 'status' },
        },
        {
          title: '试验编号',
          align: 'left',
          dataIndex: 'testCode',
          minWidth: 100,
          scopedSlots: { customRender: 'testCode' },
        },
        {
          title: '试验项目',
          align: 'left',
          dataIndex: 'testNames',
          minWidth: 100,
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '试验设备',
          align: 'left',
          dataIndex: 'equipName',
          minWidth: 100,
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '期望开始时间',
          dataIndex: 'predictStartTime',
          customRender: (time) => {
            return time && time != 0 ? moment(parseFloat(time)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
          minWidth: 100,
        },
        {
          title: '预计用时(h)',
          dataIndex: 'predictUseTime',
          minWidth: 80,
        },
        {
          title: '实际开始时间',
          dataIndex: 'realStartTime',
          customRender: (time) => {
            return time && time != 0 ? moment(parseFloat(time)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
          minWidth: 100,
        },
        {
          title: '实际用时(h)',
          dataIndex: 'realUseTime',
          minWidth: 80,
        },
      ],
    }
  },

  methods: {
    loadData() {
      let data = {
        ...this.queryParams,
        entrustId: this.entrustId,
      }
      return postAction(this.url, data).then((res) => {
        if (res.code == 200) {
          return res.data
        }
      })
    },
    refresh(bool = true) {
      this.$refs.testTaskInfoTable.refresh(bool)
    },
    handleGoDetail(record) {
      this.$refs.TaskDetailModal.show(record)
    },
    handleWorkUser(record) {
      if (record.workId && record.workId != 0) {
        this.$refs.WorkCenterUserModal.show(record.workId)
      }
    },
  },
}
</script>
<style lang='less' scoped>
</style>