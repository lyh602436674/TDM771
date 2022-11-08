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
      <template v-if="type == 'check' && detailData.status == 10">
        <a-button type="primary" @click="handleCheckPass(detailData.id, 20)"> 审核通过 </a-button>
        <a-button type="ghost-primary" @click="handleCheck(detailData, '审核驳回')"> 审核驳回 </a-button>
      </template>
      <template v-if="type == 'approve' && detailData.status == 20">
        <a-button type="primary" @click="handleCheckApprovePass(detailData.id, 40)"> 批准通过 </a-button>
        <a-button type="ghost-primary" @click="handleCheck(detailData, '批准驳回')"> 批准驳回 </a-button>
      </template>
      <a-button @click="handleCancel" type="ghost-danger"> 关闭 </a-button>
    </div>
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
    <report-check-modal ref="ReportCheckModal" @change="loadDetail(detailData.id)"></report-check-modal>
  </h-modal>
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
      numPages: 1, // pdf文件总页数
      pdfUrl: null,
      currentPage: 0,
      pageCount: 0,
    }
  },
  methods: {
    show(id, type = 'checkOut', activeKey = 1) {
      this.visible = true
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
    // pdf加载时
    loadPdfHandler(e) {
      this.currentPage = 1 // 加载的时候先加载第一页
    },
    pdfTask(src) {
      var self = this
      var loadingTask = pdf.createLoadingTask(src)
      loadingTask.promise
        .then((pdf) => {
          console.log('pdf加载成功>>>>>>>>>>>>>>>>>>>>>>>>>', pdf)
          self.pdfUrl = loadingTask
          self.numPages = pdf.numPages
        })
        .catch((err) => {
          console.error('pdf加载失败')
        })
    },
    changePdfPage(val) {
      // console.log(val)
      if (val === 0 && this.currentPage > 1) {
        this.currentPage--
      }
      if (val === 1 && this.currentPage < this.pageCount) {
        this.currentPage++
      }
    },
    handleTabsChange(v) {
      this.activeKey = v
    },
    loadDetail(id) {
      let url = this.url.detail
      postAction(url, { id: id }).then((res) => {
        if (res.code == 200) {
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
        if (res.code == 200) {
          this.$message.success('操作成功')
          this.loadDetail(this.reportId)
        }
      })
    },
    handleCheckApprovePass(id, examineFlag) {
      postAction(this.url.checkApprove, { id: id, examineFlag: examineFlag }).then((res) => {
        if (res.code == 200) {
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