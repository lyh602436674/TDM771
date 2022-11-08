<!--
 * @Author: 赵峰
 * @Date: 2021-09-09 15:41:52
 * @LastEditTime: 2021-10-14 09:58:13
 * @LastEditors: 赵峰
 * @Descripttion:
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\reports\components\ReportPublishTable.vue
-->
<template>
  <h-card fixed :bordered="false">
    <template slot="title"> 报告发放 </template>
    <h-search
      v-model="queryParams"
      slot="search-form"
      size="small"
      :showToggleButton="true"
      :data="searchBar"
      @change="refresh"
    />
    <div slot="table-operator" style="border-top: 5px">
      <a-button v-if="hasSelected" type="ghost-primary" size="small" icon="plus" @click="batchAccess"
        >批量发放</a-button
      >
    </div>
    <h-vex-table
      slot="content"
      ref="dataCheckTable"
      :scroll="{ x: true }"
      :columns="columns"
      :data="loadData"
      :rowKey="(record) => record.id"
      :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
    >
      <span slot="reportCode" slot-scope="text, record">
        <a @click="handleDetail(record, 'check')"> {{ record.reportCode }}</a>
      </span>
      <span slot="status" slot-scope="text, record">
        <a-badge :color="record.status | reportStatusColorFilter" :text="record.status | reportStatusFilter" />
      </span>
      <span slot="receiveNumCount" slot-scope="text,record">
        <a @click="receiveHandle(record)">{{record.receiveNumCount || 0}}</a>
      </span>
      <div slot="action" slot-scope="text, record">
        <a-icon
          type="eye"
          title="详情"
          class="primary-text"
          style="cursor: pointer"
          @click="() => handleDetail(record)"
        />
        <span v-has="'reportPublish:provide'">
          <a-divider type="vertical" style="color: #409eff" />
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
    <report-publish-modal ref="ReportPublishModal" @change="refresh(true)"></report-publish-modal>
    <report-batch-access-modal ref="ReportBatchAccessModal" @change="refresh(true)"></report-batch-access-modal>
  </h-card>
</template>

<script>
import moment from 'moment'
import { postAction } from '@/api/manage'
import mixin from '../mixin.js'
import ReportDetailModal from '../modules/ReportDetailModal'
import ReportPublishModal from '../modules/ReportPublishModal'
import ReportBatchAccessModal from '../modules/ReportBatchAccessModal'
export default {
  mixins: [mixin],
  props: ['queryType'],
  components: { ReportDetailModal, ReportPublishModal, ReportBatchAccessModal },
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
      selectedRowKeys: [],
      selectedRow: [],
      id: '',
      title: '',
      url: {
        list: '/HfEnvReportReceiveBusiness/listPage',
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
          title: '委托单位',
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
          width: 140,
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
          title: '发放数量',
          align: 'center',
          dataIndex: 'receiveNumCount',
          scopedSlots: { customRender: 'receiveNumCount' },
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
          width: 100,
          align: 'center',
          scopedSlots: { customRender: 'action' },
        },
      ],
      type: 'publish',
      loadData: (params) => {
        let data = {
          ...this.queryParams,
          ...params,
          // receiveFlag: this.queryType,
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
    // 批量发放
    onSelectChange(selectedRowKeys, selectedRow) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRow = selectedRow
    },
    batchAccess() {
      let { selectedRow } = this
      console.log('selectedRow>>>>>>>', selectedRow)
      if (selectedRow.length > 0) {
        this.$refs.ReportBatchAccessModal.show(selectedRow)
      } else {
        this.$message.warning('至少选择一个报告')
      }
    },
    receiveHandle(record){
      this.$router.push({
        path:'reportPublishRecord',
        query:{
          reportCode:record.reportCode
        }
      })
    }
  },
}
</script>
<style lang='less' scoped>
</style>