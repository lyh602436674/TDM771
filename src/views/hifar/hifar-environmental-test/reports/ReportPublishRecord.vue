<!--
 * @Author: 赵峰
 * @Date: 2021-09-14 15:36:35
 * @LastEditTime: 2021-10-14 09:56:15
 * @LastEditors: 赵峰
 * @Descripttion: 发放记录
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\reports\ReportPublishRecord.vue
-->
<template>
  <div ref="pageWrapper" class="h-custom-layout" style="height: 100%; position: relative">
    <h-card fixed :bordered="false">
      <template slot="title"> 发放记录</template>
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
          <a-badge :color="record.status | reportStatusColorFilter" :text="record.status | reportStatusFilter"/>
        </span>
        <div slot="action" slot-scope="text, record">
          <a-icon
            type="eye"
            title="详情"
            class="primary-text"
            style="cursor: pointer"
            @click="() => handleDetail(record)"
          />
          <span v-has="'reportPublish:provide'" v-if="record.receiveFlag == 1">
            <a-divider type="vertical" style="color: #409eff"/>
            <h-icon
              type="icon-fafang"
              title="发放"
              class="primary-text"
              style="cursor: pointer"
              @click="() => handlePublish(record)"
            />
          </span>
        </div>
      </h-vex-table>
      <report-detail-modal ref="ReportDetailModal"></report-detail-modal>
      <report-publish-modal ref="ReportPublishModal" @change="refresh"></report-publish-modal>
    </h-card>
  </div>
</template>

<script>
import moment from 'moment'
import {postAction} from '@/api/manage'
import mixin from './mixin.js'
import ReportDetailModal from './modules/ReportDetailModal'
import ReportPublishModal from './modules/ReportPublishModal'

export default {
  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper,
    }
  },
  mixins: [mixin],
  props: ['queryType'],
  components: {ReportDetailModal, ReportPublishModal},
  watch: {
    queryType(val) {
      this.queryType = val
      this.refresh()
    },
  },
  data() {
    return {
      moment,
      queryParams: {},
      selectedRowKeys: [],
      selectedRow: [],
      id: '',
      title: '',
      url: {
        list: '/HfEnvReportReceiveBusiness/receiveListPage',
      },
      unitId: '',
      searchBar: [
        {
          title: '报告编号',
          key: 'c_reportCode_7',
          formType: 'input',
        },
        {
          title: '试验编号',
          key: 'c_testCode_7',
          formType: 'input',
        },
        {
          title: '接收人',
          key: 'c_receiveUserName_7',
          formType: 'input',
        },
        {
          title: '委托单位',
          key: 'c_custName_7',
          formType: 'input',
        },
        {
          title: '联系人',
          key: 'c_custLinkName_7',
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
          scopedSlots: {customRender: 'status'},
        },
        {
          title: '试验编号',
          align: 'left',
          width: 140,
          dataIndex: 'testCode',
        },
        {
          title: '接收人',
          align: 'left',
          dataIndex: 'receiveUserName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '接收时间',
          align: 'left',
          dataIndex: 'receiveTime',
          width: 100,
          customRender: (time, record) => {
            return time && time != 0 ? moment(parseInt(time)).format('YYYY-MM-DD') : '--'
          },
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
          title: '委托单号',
          align: 'left',
          dataIndex: 'entrustNo',
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
          title: '发放数量',
          align: 'center',
          dataIndex: 'receiveNum',
        },
        {
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          width: 90,
          align: 'center',
          scopedSlots: {customRender: 'action'},
        },
      ],
      type: 'publishRecord',
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
    }
  },

  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    },
  },
  created() {
    let reportCode = this.$route.query.reportCode
    if (reportCode) {
      this.queryParams.c_reportCode_7 = reportCode
      setTimeout(() => {
        this.refresh()
      }, 10)
    }
  },
  methods: {
    refresh(bool = true) {
      this.selectedRowKeys = []
      this.selectedRow = []
      this.$refs.dataCheckTable.refresh(bool)
    },
    handleDetail(record) {
      let type = this.type
      let activeKey = '2'
      this.$refs.ReportDetailModal.show(record.id, type, activeKey)
    },
    handlePublish(record) {
      this.$refs.ReportPublishModal.show(record)
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