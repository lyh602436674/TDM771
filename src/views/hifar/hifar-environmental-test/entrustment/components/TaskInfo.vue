<!--
 * @Author: 赵峰
 * @Date: 2021-09-18 09:53:20
 * @LastEditTime: 2021-11-08 10:44:11
 * @LastEditors: 赵峰
 * @Descripttion: 任务信息
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\entrustment\components\TaskInfo.vue
-->
<template>
  <h-card fixed :bordered="false">
    <h-vex-table
      ref="taskInfoTable"
      slot="content"
      :columns="columns"
      :data="loadData"
      :rowKey="(record) => record.id"
      :scroll="{ x: true }"
    >
      <span slot="status" slot-scope="text, record">
        <a-tag class="status_tag" :color="record.status | taskStatusColorFilter">
          {{ record.status | taskStatusFilter }}
        </a-tag>
      </span>
      <span slot="workName" slot-scope="text, record">
        <a href="javascript:;" @click="handleWorkUser(record)">{{ record.workName }}</a>
      </span>
      <div slot="action" slot-scope="text, record">
        <a-icon
          type="eye"
          title="查看"
          class="primary-text"
          style="cursor: pointer"
          @click="() => handleGoDetail(record)"
        />
      </div>
    </h-vex-table>
    <work-center-user-modal ref="WorkCenterUserModal"></work-center-user-modal>
  </h-card>
</template>

<script>
import moment from 'moment'
import mixin from '@/views/hifar/mixin.js'
import { postAction } from '@/api/manage'
import WorkCenterUserModal from '../modules/WorkCenterUserModal'
export default {
  components: {
    WorkCenterUserModal,
  },
  mixins: [mixin],
  props: {
    entrustId: {
      type: String,
      default: '',
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
      url: '/HfEnvTaskBusiness/listPage',
      columns: [
        {
          title: '任务状态',
          align: 'left',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
        },
        {
          title: '试品编号',
          align: 'left',
          dataIndex: 'productCodes',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '试品名称',
          align: 'left',
          dataIndex: 'productNames',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        // {
        //   title: '检测人',
        //   align: 'left',
        //   dataIndex: 'receiveUserName',
        //   customRender: (text, record) => {
        //     return text || '--'
        //   },
        // },
        {
          title: '工作中心',
          align: 'left',
          dataIndex: 'workName',
          scopedSlots: { customRender: 'workName' },
        },
        {
          title: '检测项目',
          align: 'left',
          dataIndex: 'unitName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '检测期限',
          align: 'left',
          dataIndex: 'taskExpectEndTime',
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD') : '--'
          },
        },
        // {
        //   title: '操作',
        //   dataIndex: 'action',
        //   fixed: 'right',
        //   width: 60,
        //   align: 'center',
        //   scopedSlots: { customRender: 'action' },
        // },
      ],
    }
  },

  methods: {
    loadData() {
      let data = {
        ...this.queryParams,
        queryType: 11,
        c_entrustId_1: this.entrustId,
      }
      return postAction(this.url, data).then((res) => {
        if (res.code == 200) {
          return res.data
        }
      })
    },
    refresh(bool = true) {
      this.$refs.taskInfoTable.refresh(bool)
    },
    handleGoDetail(record) {},
    handleWorkUser(record) {
      this.$refs.WorkCenterUserModal.show(record.workId)
    },
  },
}
</script>
<style lang='less' scoped>
</style>