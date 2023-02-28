<!--
 * @Author: 赵峰
 * @Date: 2021-09-09 11:14:48
 * @LastEditTime: 2021-11-18 13:56:29
 * @LastEditors: 马潭龙
 * @Descripttion: 报告详情
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\reports\modules\ReportDetailModal.vue
-->
<template>
  <h-modal
    title=""
    inner
    fullScreen
    destroyOnClose
    :getContainer="getContainer"
    :visible="visible"
    @cancel="handleCancel"
  >
    <div class="footer" slot="footer">
      <a-space>
        <template v-if="queryType === '1'">
          <template v-if="type === 'check'">
            <a-popconfirm title="确定审核通过吗?" @confirm="() => handleCheckPass(detailData.id, 20)">
              <a-button type="primary"> 审核通过</a-button>
            </a-popconfirm>
            <report-reject-popover :showWrite="!drawerVisible" @reject="handleCheck(detailData)"
                                   @write="drawerVisible = true">
              <a-button type="ghost-primary"> 审核驳回</a-button>
            </report-reject-popover>
          </template>
          <template v-if="type === 'approve'">
            <a-popconfirm title="确定审核通过吗?" @confirm="() => handleCheckApprovePass(detailData.id, 40)">
              <a-button type="primary"> 批准通过</a-button>
            </a-popconfirm>
            <report-reject-popover :showWrite="!drawerVisible" @reject="handleCheck(detailData)"
                                   @write="drawerVisible = true">
              <a-button type="ghost-primary"> 批准驳回</a-button>
            </report-reject-popover>
          </template>
          <template v-if="type === 'examine'">
            <a-popconfirm title="确定审批通过吗?" @confirm="() => handleCheckAmendPass(detailData.id, 70)">
              <a-button type="primary"> 审批通过</a-button>
            </a-popconfirm>
            <report-reject-popover :showWrite="!drawerVisible" @reject="handleCheck(detailData)"
                                   @write="drawerVisible = true">
              <a-button type="ghost-primary"> 审批驳回</a-button>
            </report-reject-popover>
          </template>
        </template>
        <a-button type="ghost-danger" @click="handleCancel"> 关闭</a-button>
      </a-space>
    </div>
    <h-card :bordered="false">
      <h-tabs fixed :activeKey="activeKey" :animated="true" @change="handleTabsChange">
        <a-tab-pane key="1" tab="基本信息">
          <report-detail :detailData="detailData"></report-detail>
        </a-tab-pane>
        <a-tab-pane key="2" tab="报告信息">
          <div v-if="pdfPath" :style="{width:'100%',height:'100%',display:'flex'}">
            <embed
              ref="iframe"
              :src="detailData.pdfPath"
              :style="{width:drawerVisible ? '60%' : '100%'}"
              frameborder="0"
              height="100%"
              scrolling="auto"
            />
            <report-reject-info-table v-if="drawerVisible" ref="reportRejectInfoTable"
                                      :reportId="reportId" :type="type"
                                      style="flex:1"/>
          </div>
          <a-empty v-else style="margin-top: 160px"/>
        </a-tab-pane>
        <a-tab-pane key="3" tab="流转信息">
          <report-flow-info-table ref="ReportFlowInfoTable" :reportId="reportId"></report-flow-info-table>
        </a-tab-pane>
      </h-tabs>
    </h-card>
  </h-modal>
</template>

<script>
import {postAction} from '@/api/manage'
import ReportDetail from './ReportDetail'
import ReportFlowInfoTable from '../components/ReportFlowInfoTable'
import ReportRejectInfoTable from "@views/hifar/hifar-environmental-test/reports/components/ReportRejectInfoTable";
import ReportRejectPopover from "@views/hifar/hifar-environmental-test/reports/components/ReportRejectPopover";

export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  components: {
    ReportRejectPopover,
    ReportRejectInfoTable,
    ReportDetail,
    ReportFlowInfoTable,
  },
  props: ['queryType'],
  computed: {
    pdfPath() {
      return !!this.detailData.pdfPath;
    }
  },

  data() {
    return {
      visible: false,
      drawerVisible: false,
      activeKey: '1',
      detailData: {},
      model: {},
      reportId: '',
      type: '',
      url: {
        detail: '/HfEnvReportBusiness/queryDetailById',
        check: '/HfEnvReportExamineBusiness/examineById',
        checkApprove: '/HfEnvReportApproveBusiness/approveById',
        amendById: '/HfEnvReportAmendBusiness/amendById',
      },
      numPages: 1, // pdf文件总页数
      pdfUrl: null,
      currentPage: 0,
      pageCount: 0,
    }
  },
  methods: {
    show(id, type = 'checkOut', activeKey = 1, bool = false) {
      // bool 是否打开填写意见弹框
      this.visible = true
      this.type = type
      this.activeKey = activeKey
      this.reportId = id
      if (bool) {
        this.drawerVisible = true
      }
      this.loadDetail(id)
    },
    handleCancel() {
      this.visible = false
      this.drawerVisible = false
      this.$emit('change', true)
    },
    handleTabsChange(v) {
      this.activeKey = v
    },
    loadDetail(id) {
      let url = this.url.detail
      postAction(url, {id}).then((res) => {
        if (res.code === 200) {
          this.detailData = res.data
        }
      })
    },
    handleCheck(record) {
      let params = {
        id: record.id,
        examineFlag: this.type === 'check' ? 30 : this.type === 'approve' ? 50 : this.type === 'examine' ? 80 : null,
        // rejectType 驳回节点 1 报告生成 2 报告审核 3 报告批准 4 修改审批
        rejectType: this.type === 'check' ? '2' : this.type === 'approve' ? '3' : this.type === 'examine' ? '4' : null,
        reportRejectList: this.$refs.reportRejectInfoTable.getTableData()
      }
      postAction(this.url.check, params).then((res) => {
        if (res.code === 200) {
          this.$message.success('驳回成功')
          this.handleCancel()
        }
      })
    },
    handleCheckPass(id, examineFlag) {
      postAction(this.url.check, {id, examineFlag}).then((res) => {
        if (res.code === 200) {
          this.$message.success('审核成功')
          this.handleCancel()
        }
      })
    },
    handleCheckApprovePass(id, examineFlag) {
      postAction(this.url.checkApprove, {id, examineFlag}).then((res) => {
        if (res.code === 200) {
          this.$message.success('批准成功')
          this.handleCancel()
        }
      })
    },
    handleCheckAmendPass(id, examineFlag) {
      postAction(this.url.amendById, {id, examineFlag}).then((res) => {
        if (res.code === 200) {
          this.$message.success('审批成功')
          this.handleCancel()
        }
      })
    },
  },
}
</script>
<style lang='less' scoped>
iframe {
  position: absolute;
  top: 48px;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
  border: 0;
}
</style>