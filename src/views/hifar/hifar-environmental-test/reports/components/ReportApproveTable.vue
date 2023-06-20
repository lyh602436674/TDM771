<!--
 * @Author: 赵峰
 * @Date: 2021-09-09 13:59:43
 * @LastEditTime: 2021-11-10 09:34:06
 * @LastEditors: 赵峰
 * @Descripttion: 报告批准table
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\reports\components\ReportApproveTable.vue
-->
<template>
  <h-card fixed :bordered="false">
    <h-search
      v-model="queryParams"
      slot="search-form"
      size="small"
      :showToggleButton="true"
      :data="searchBar"
      @change="refresh"
    />
    <h-vex-table
      slot="content"
      ref="dataCheckTable"
      :columns="columns"
      :data="loadData"
      :rowKey="(record) => record.id"
    >
      <span slot="reportCode" slot-scope="text, record">
            <a @click="$refs.ReportApproveBaseModal.show(record)">{{ text }}</a>
      </span>
      <span slot="status" slot-scope="text, record">
        <a-badge :color="record.status | reportStatusColorFilter" :text="record.status | reportStatusFilter"/>
      </span>
    </h-vex-table>
    <report-approve-base-modal ref="ReportApproveBaseModal" :queryType="queryType"
                               @change="refresh(false)"></report-approve-base-modal>
  </h-card>
</template>

<script>
import moment from 'moment'
import {officeOnlineEdit, postAction} from '@/api/manage'
import mixin from '../mixin.js'
import ReportRejectPopover from "@views/hifar/hifar-environmental-test/reports/components/ReportRejectPopover";
import ReportApproveBaseModal from "@views/hifar/hifar-environmental-test/reports/modules/ReportApproveBaseModal.vue";

export default {
  mixins: [mixin],
  props: ['queryType'],
  components: {
    ReportApproveBaseModal,
    ReportRejectPopover
  },
  watch: {
    queryType(val) {
      this.queryType = val
      this.refresh(true)
    },
  },
  data() {
    return {
      moment,
      queryParams: {},
      id: '',
      title: '',
      url: {
        list: '/HfEnvReportApproveBusiness/listPage',
        check: '/HfEnvReportExamineBusiness/examineById',
        checkApprove: '/HfEnvReportApproveBusiness/approveById',
      },
      unitId: '',
      searchBar: [
        {
          title: '报告编号',
          key: 'c_reportCode_7',
          formType: 'input',
        },
        {
          title: '委托单号',
          key: 'c_entrustNo_7',
          formType: 'input',
        },
        {
          title: '运行单号',
          key: 'c_entrustCode_7',
          formType: 'input',
        },
        {
          title: '试验编号',
          key: 'c_testCode_7',
          formType: 'input',
        },
        {
          title: '送试单位',
          key: 'c_custName_7',
          formType: 'input',
        },
        {
          title: '联系人',
          key: 'c_custLinkName_7',
          formType: 'input',
        },
        {
          title: '联系方式',
          key: 'c_custLinkMobile_7',
          formType: 'input',
        },
        {
          title: '试验项目',
          key: 'c_testName_7',
          formType: 'input',
        },
        {
          title: '生成时间',
          key: 'createTime',
          formType: 'dateRangePick',
          showTime: true,
          format: 'YYYY-MM-DD HH:mm',
        },
      ],
      columns: [
        {
          title: '报告编号',
          align: 'left',
          dataIndex: 'reportCode',
          width: 140,
          scopedSlots: {customRender: 'reportCode'}
        },
        {
          title: '报告编号',
          align: 'left',
          width: 140,
          dataIndex: 'reportCode',
          customRender: (t) => {
            return t || '--'
          }
        },
        {
          title: '状态',
          align: 'left',
          width: 120,
          dataIndex: 'status',
          scopedSlots: {customRender: 'status'},
        },
        {
          title: '试验编号',
          align: 'left',
          width: 140,
          dataIndex: 'testCode',
        },
        {
          title: '送试单位',
          align: 'left',
          dataIndex: 'custName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '联系人',
          align: 'left',
          dataIndex: 'custLinkName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '联系方式',
          align: 'left',
          dataIndex: 'custLinkMobile',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '运行单号',
          align: 'left',
          dataIndex: 'entrustCode',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '委托单号',
          align: 'left',
          dataIndex: 'entrustNo',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '试验项目',
          align: 'left',
          dataIndex: 'testName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '创建人',
          align: 'left',
          dataIndex: 'createUserName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '创建时间',
          align: 'left',
          dataIndex: 'createTime',
          customRender: (time, record) => {
            return time && time != 0 ? moment(parseInt(time)).format('YYYY-MM-DD') : '--'
          },
        },
      ],
      type: 'approve',
      loadData: (params) => {
        let data = {
          ...this.queryParams,
          ...params,
          queryType: this.queryType,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code === 200) {
            return res.data
          }
        })
      },
    }
  },

  methods: {
    refresh(bool = false) {
      this.$refs.dataCheckTable.refresh(bool)
    },
  },
}
</script>
<style lang='less' scoped>
/deep/ .h-card.ant-card .ant-card-body {
  padding: 0;
}
</style>