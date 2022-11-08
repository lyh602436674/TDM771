<!--
 * @Author: 赵峰
 * @Date: 2021-09-03 16:35:55
 * @LastEditTime: 2021-10-14 09:56:57
 * @LastEditors: 赵峰
 * @Descripttion: 报告查阅
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\reports\ReportCheckOut.vue
-->
<template>
  <div ref="pageWrapper" class="h-custom-layout" style="height: 100%; position: relative">
    <h-card fixed :bordered="false">
      <template slot="title"> 报告查阅 </template>
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
        :scroll="{ x: true }"
        :columns="columns"
        :data="loadData"
        :rowKey="(record) => record.id"
      >
        <span slot="status" slot-scope="text, record">
          <a-badge :color="record.status | reportStatusColorFilter" :text="record.status | reportStatusFilter" />
        </span>
        <span slot="action" slot-scope="text, record">
          <a-icon
            type="eye"
            title="详情"
            class="primary-text"
            style="cursor: pointer"
            @click="() => handleDetail(record)"
          />
        </span>
      </h-vex-table>
    </h-card>
    <report-detail-modal ref="ReportDetailModal"></report-detail-modal>
  </div>
</template>

<script>
import moment from 'moment'
import { postAction } from '@/api/manage'
import ReportDetailModal from './modules/ReportDetailModal'
import mixin from './mixin.js'
export default {
  mixins: [mixin],
  components: {
    ReportDetailModal,
  },
  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper,
    }
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
        list: '/HfEnvReportBusiness/listPage',
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
          title: '委托单位',
          key: 'c_custName_7',
          formType: 'input',
        },
        {
          title: '试验编号',
          key: 'c_testCode_7',
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
      ],
      columns: [
        {
          title: '报告编号',
          align: 'left',
          width: 140,
          dataIndex: 'reportCode',
          customRender: (t)=>{
            return t || '--'
          }
        },
        {
          title: '状态',
          align: 'left',
          width: 100,
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
        },
        {
          title: '试验编号',
          align: 'left',
          width: 100,
          dataIndex: 'testCode',
        },
        {
          title: '委托单位',
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
        {
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          width: 90,
          align: 'center',
          scopedSlots: { customRender: 'action' },
        },
      ],
      type: 'checkOut',
      loadData: (params) => {
        let data = {
          ...this.queryParams,
          ...params,
          queryType: 9,
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
      this.$refs.dataCheckTable.refresh(bool)
    },
    handleDetail(record) {
      let type = this.type
      let activeKey = '2'
      this.$refs.ReportDetailModal.show(record.id, type, activeKey)
    },
    handleCheck(record, title) {
      let type = this.type
      this.$refs.TaskApplyModal.show(record, title, type)
    },
    // 委托详情
    handleWtDetail(record) {
      this.$router.push({
        path: '/entrustlistDetail',
        query: {
          id: record.entrustId,
        },
      })
    },
  },
}
</script>
<style lang='less' scoped>
</style>