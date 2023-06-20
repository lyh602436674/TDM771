<template>
  <div>
    <report-base-info-modal :reportId="reportId" :localLoading="localLoading" ref="reportBaseInfoModal" :detailData="detailData"
                            @close="handleCancel">
      <a-space>
        <a-button icon="eye" @click="handleDetail(detailData)" type="primary">详情</a-button>
        <template v-if="detailData.status === 10">
          <a-button type="primary" icon="edit" @click="handleOnlineEdit(detailData)">编辑</a-button>
          <a-popconfirm title="确定审核通过吗?" @confirm="() => handleCheckPass(detailData.id)">
            <a-button v-has="'reportCheck:pass'" type="primary" icon="check">审核通过</a-button>
          </a-popconfirm>
          <report-reject-popover style="display: inline-block" @reject="handleCheck(detailData.id)"
                                 @write="handleWrite(detailData.id)">
            <a-button
              v-has="'reportCheck:reject'"
              icon="close"
              type="primary"
            >审核驳回
            </a-button>
          </report-reject-popover>
        </template>
      </a-space>
    </report-base-info-modal>
    <report-detail-modal :queryType="queryType" @change="detailChange" ref="ReportDetailModal"/>
  </div>
</template>

<script>
import {downloadFile, getAction, officeOnlineEdit, postAction} from "@api/manage";
import ReportBaseInfoModal from "@views/hifar/hifar-environmental-test/reports/modules/ReportBaseInfoModal.vue";
import ReportDetailModal from '@/views/hifar/hifar-environmental-test/reports/modules/ReportDetailModal'
import ReportRejectPopover from "@views/hifar/hifar-environmental-test/reports/components/ReportRejectPopover";

export default {
  name: "ReportCheckBaseModal",
  components: {ReportDetailModal, ReportRejectPopover, ReportBaseInfoModal},
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
        detail: "/HfEnvReportBusiness/listDetailByReportId"
      },
    }
  },
  methods: {
    detailChange(){
      this.refreshFlag = true
      this.handleCancel()
    },
    handleDetail(record) {
      this.$refs.ReportDetailModal.show(record.id, 'check', '2')
    },
    handleCheck(id) {
      this.localLoading = true
      postAction(this.url.check, {id, examineFlag: 30}).then((res) => {
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
      postAction(this.url.check, {id: id, examineFlag: 20}).then((res) => {
        if (res.code === 200) {
          this.$message.success('审核成功')
          this.loadData()
          this.refreshFlag = true
          this.handleCancel()
        }
      }).finally(() => {
        this.localLoading = false
      })
    },
    handleWrite(id) {
      this.$refs.ReportDetailModal.show(id, 'check', '2', true)
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
      officeOnlineEdit(fileUrl)
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