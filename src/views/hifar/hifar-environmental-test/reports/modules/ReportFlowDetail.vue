<!--
 * @Author: 赵峰
 * @Date: 2021-09-09 11:14:48
 * @LastEditTime: 2021-11-18 13:56:29
 * @LastEditors: 马潭龙
 * @Descripttion: 报告详情
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\reports\modules\ReportDetailModal.vue
-->
<template>
  <h-card :bordered="false">
    <h-tabs fixed :activeKey="activeKey" :animated="true" @change="handleTabsChange">
      <a-tab-pane key="1" tab="基本信息">
        <report-detail :detailData="detailData"></report-detail>
      </a-tab-pane>
      <a-tab-pane key="2" tab="报告信息">
        <embed
          v-if="detailData.pdfPath"
          ref="iframe"
          scrolling="auto"
          width="100%"
          height="100%"
          frameborder="0"
          :src="detailData.pdfPath"
        />
        <!-- <div v-if="detailData.pdfPath">
          <p class="arrow">
            <span @click="changePdfPage(0)" class="turn" :class="{ grey: currentPage == 1 }">上一页</span>
            {{ currentPage }} / {{ pageCount }}
            <span @click="changePdfPage(1)" class="turn" :class="{ grey: currentPage == pageCount }">下一页</span>
          </p>
          <pdf
            :src="src"
            :page="currentPage"
            @loaded="loadPdfHandler"
            @num-pages="pageCount = $event"
            @page-loaded="currentPage = $event"
          >
          </pdf>
        </div> -->
        <a-empty v-else style="margin-top: 160px" />
      </a-tab-pane>
      <a-tab-pane key="3" tab="流转信息">
        <report-flow-info-table ref="ReportFlowInfoTable" :reportId="reportId"></report-flow-info-table>
      </a-tab-pane>
    </h-tabs>
  </h-card>
</template>

<script>
import pdf from 'vue-pdf'
import { postAction } from '@/api/manage'
import ReportDetail from './ReportDetail'
import ReportFlowInfoTable from '../components/ReportFlowInfoTable'
import ReportCheckModal from './ReportCheckModal'
export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  components: {
    pdf,
    ReportDetail,
    ReportFlowInfoTable,
    ReportCheckModal,
  },

  data() {
    return {
      visible: false,
      activeKey: '1',
      detailData: {},
      model: {},
      reportId: '',
      type: '',
      url: {
        detail: '/HfEnvReportBusiness/queryDetailById',
        check: '/HfEnvReportExamineBusiness/examineById',
        checkApprove: '/HfEnvReportApproveBusiness/approveById',
      },
    }
  },
  methods: {
    show(id, type = 'checkOut', activeKey = '1') {
      this.type = type
      this.activeKey = activeKey
      this.reportId = id
      // this.model = record
      this.loadDetail(id)
    },
    handleCancel() {
      this.visible = false
      if (this.type == 'check' || this.type == 'approve') {
        this.$emit('change', true)
      }
    },
    handleTabsChange(v) {
      this.activeKey = v
    },
    loadDetail(id) {
      let url = this.url.detail
      postAction(url, { id: id }).then((res) => {
        if (res.code === 200) {
          let record = res.data
          this.detailData = record
          // this.src = pdf.createLoadingTask(record.pdfPath)
          // this.pdfTask(record.pdfPath)
        }
      })
    },
    handleCheck(record, title) {
      let type = this.type
      this.$refs.ReportCheckModal.show(record, title, type)
    },
    handleCheckPass(id, examineFlag) {
      postAction(this.url.check, { id: id, examineFlag: examineFlag }).then((res) => {
        if (res.code === 200) {
          this.$message.success('操作成功')
          this.loadDetail(this.reportId)
        }
      })
    },
    handleCheckApprovePass(id, examineFlag) {
      postAction(this.url.checkApprove, { id: id, examineFlag: examineFlag }).then((res) => {
        if (res.code === 200) {
          this.$message.success('操作成功')
          this.loadDetail(this.reportId)
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