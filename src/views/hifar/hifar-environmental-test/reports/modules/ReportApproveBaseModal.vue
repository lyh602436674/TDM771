<template>
  <div>
    <report-base-info-modal :reportId="reportId" :localLoading="localLoading" ref="reportBaseInfoModal"
                            :detailData="detailData"
                            @close="handleCancel">
      <a-space>
        <a-button icon="eye" @click="handleDetail(detailData)" type="primary">详情</a-button>
        <template v-if="detailData.status === 20">
<!--          <a-button type="primary" icon="edit" @click="handleOnlineEdit(detailData)">编辑</a-button>-->
          <a-popconfirm title="确定批准通过吗?" @confirm="() => handleCheckPass(detailData.id)">
            <a-button v-has="'reportApprove:pass'" type="primary" icon="check">批准通过</a-button>
          </a-popconfirm>
<!--          <report-reject-popover style="display: inline-block" @reject="handleCheck(detailData.id)"-->
          <!--                                 @write="handleWrite(detailData.id)">-->
            <a-button
              v-has="'reportApprove:reject'"
              icon="close"
              type="primary"
              @click="handleWrite(detailData.id)"
            >批准驳回
            </a-button>
<!--          </report-reject-popover>-->
        </template>
      </a-space>
    </report-base-info-modal>
    <report-detail-modal :queryType="queryType" @change="detailChange" ref="ReportDetailModal"/>
    <report-reject-info-modal ref="reportRejectInfoModal" @change="loadData"/>
  </div>
</template>

<script>
import {downloadFile, getAction, officeOnlineEdit, postAction} from "@api/manage";
import ReportBaseInfoModal from "@views/hifar/hifar-environmental-test/reports/modules/ReportBaseInfoModal.vue";
import ReportDetailModal from '@/views/hifar/hifar-environmental-test/reports/modules/ReportDetailModal'
import ReportRejectPopover from "@views/hifar/hifar-environmental-test/reports/components/ReportRejectPopover";
import ReportRejectInfoModal from "@views/hifar/hifar-environmental-test/reports/modules/ReportRejectInfoModal.vue";

export default {
  name: "ReportApproveBaseModal",
  components: {ReportRejectInfoModal, ReportDetailModal, ReportRejectPopover, ReportBaseInfoModal},
  inject: {
    getContainer: {
      default: () => document.body
    }
  },
  props: ['queryType'],
  data() {
    return {
      reportId: "",
      detailData: {},
      tableData: [],
      localLoading: false,
      refreshFlag: false,
      reportFileList: [],
      url: {
        check: '/HfEnvReportExamineBusiness/examineById',
        detail: "/HfEnvReportBusiness/listDetailByReportId",
        checkApprove: '/HfEnvReportApproveBusiness/approveById',
      },
    }
  },
  methods: {
    detailChange() {
      this.refreshFlag = true
      this.handleCancel()
    },
    handleDetail(record) {
      let fileUrl = record.filePath.split('?')[0]
      officeOnlineEdit(fileUrl, {IsSaveEnabled: false})
      // this.$refs.ReportDetailModal.show(record.id, 'approve', '2')
    },
    handleCheck(id) {
      this.localLoading = true
      postAction(this.url.check, {id, examineFlag: 50}).then((res) => {
        if (res.code === 200) {
          this.$message.success('驳回成功')
          this.loadData()
          this.refreshFlag = true
          this.handleCancel()
        }
      }).finally(() => {
        this.localLoading = false
      })
    },
    handleCheckPass(id) {
      this.localLoading = true
      postAction(this.url.checkApprove, {id, examineFlag: 40}).then((res) => {
        if (res.code === 200) {
          this.$message.success('批准成功')
          this.loadData()
          this.refreshFlag = true
          this.handleCancel()
        }
      }).finally(() => {
        this.localLoading = false
      })
    },
    handleWrite(id) {
      this.$refs.reportRejectInfoModal.show(id, 'approve')
    },
    loadData() {
      postAction(this.url.detail, {id: this.reportId,}).then((res) => {
        if (res.code === 200) {
          if (res.data.data && res.data.data.length) {
            this.detailData = res.data.data[0]
            this.localLoading = false
          } else {
            this.$message.warning('报告状态不正确，请刷新列表重试')
          }
        }
      })
    },
    handleOnlineEdit(record) {
      let fileUrl = record.filePath.split('?')[0]
      officeOnlineEdit(fileUrl, {IsSaveEnabled: false})
    },
    show(row, field = 'id') {
      this.localLoading = true
      this.refreshFlag = false
      this.reportId = row[field]
      this.loadData()
      this.$refs.reportBaseInfoModal.visible = true
    },
    handleCancel() {
      this.$refs.reportBaseInfoModal.visible = false
      if (this.refreshFlag) {
        this.$emit('change')
      }
    },
  },
}
</script>

<style lang="less" scoped>

</style>