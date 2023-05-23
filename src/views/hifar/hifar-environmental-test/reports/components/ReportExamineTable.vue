<!--
 * @Author: 雷宇航
 * @Date: 2023-02-24 17:14:16
 * @fileName: ReportExamineTable.vue
 * @FilePath: tdm771-client\src\views\hifar\hifar-environmental-test\reports\components\ReportExamineTable.vue
 * @Description: 报告批准完成后，可以提交修改审批，在此页面审批
-->
<template>
  <h-card :bordered="false" fixed>
    <h-search
      slot="search-form"
      v-model="queryParams"
      :data="searchBar"
      :showToggleButton="true"
      size="small"
      @change="refresh"
    />
    <h-vex-table
      ref="dataCheckTable"
      slot="content"
      :columns="columns"
      :data="loadData"
      :rowKey="(record) => record.id"
    >
      <span slot="status" slot-scope="text, record">
        <a-badge :color="record.status | reportStatusColorFilter" :text="record.status | reportStatusFilter"/>
      </span>
      <div slot="action" slot-scope="text, record">
        <a-icon
          class="primary-text"
          style="cursor: pointer"
          title="详情"
          type="eye"
          @click="() => handleDetail(record)"
        />
        <span v-if="record.status === 60">
          <a-divider style="color: #409eff" type="vertical"/>
          <a-popconfirm title="确定审核通过吗?" @confirm="() => handleCheckPass(record.id)">
            <h-icon v-has="'examine:pass'" class="success-text" style="cursor: pointer" title="审核通过"
                    type="icon-wancheng1"/>
          </a-popconfirm>
          <a-divider style="color: #409eff" type="vertical"/>
          <report-reject-popover style="display: inline-block" @reject="handleCheck(record.id)"
                                 @write="handleWrite(record.id)">
            <h-icon
              v-has="'examine:reject'"
              class="danger-text"
              style="cursor: pointer"
              title="驳回"
              type="icon-chacha"
            />
          </report-reject-popover>
        </span>
      </div>
    </h-vex-table>
    <report-detail-modal ref="ReportDetailModal" :queryType="queryType" @change="refresh(true)"></report-detail-modal>
  </h-card>
</template>

<script>
import moment from 'moment'
import {postAction} from '@/api/manage'
import mixin from '../mixin.js'
import ReportDetailModal from '../modules/ReportDetailModal'
import ReportRejectPopover from "@views/hifar/hifar-environmental-test/reports/components/ReportRejectPopover";

export default {
  mixins: [mixin],
  props: ['queryType'],
  components: {
    ReportDetailModal,
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
        list: '/HfEnvReportAmendBusiness/listPage',
        check: '/HfEnvReportExamineBusiness/examineById',
        amendById: '/HfEnvReportAmendBusiness/amendById',
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
      ],
      columns: [
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
        {
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          width: 100,
          align: 'center',
          scopedSlots: {customRender: 'action'},
        },
      ],
      type: 'examine',
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
    refresh(bool = true) {
      this.$refs.dataCheckTable.refresh(bool)
    },
    handleDetail(record) {
      this.$refs.ReportDetailModal.show(record.id, this.type, '2')
    },
    handleWrite(id) {
      this.$refs.ReportDetailModal.show(id, this.type, '2', true)
    },
    handleCheck(id) {
      postAction(this.url.check, {id, examineFlag: 80}).then((res) => {
        if (res.code === 200) {
          this.$message.success('驳回成功')
          this.refresh(true)
        }
      })
    },
    handleCheckPass(id) {
      postAction(this.url.amendById, {id, examineFlag: 70}).then((res) => {
        if (res.code === 200) {
          this.$message.success('批准成功')
          this.refresh(true)
        }
      })
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
/deep/ .h-card.ant-card .ant-card-body {
  padding: 0;
}
</style>