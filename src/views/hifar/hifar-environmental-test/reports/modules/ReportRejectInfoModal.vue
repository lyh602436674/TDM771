<template>
  <h-modal
    title="填写驳回意见"
    inner
    fullScreen
    destroyOnClose
    :getContainer="getContainer"
    :visible="visible"
    @cancel="handleCancel"
  >
    <template slot="footer">
      <a-button @click="handleCancel" type="ghost-danger"> 关闭</a-button>
      <a-button
        :loading="submitLoading"
        type="ghost-success"
        @click="handleSubmit"
      >确定
      </a-button>
    </template>
    <report-reject-info-table ref="reportRejectInfoTable" :reportId="reportId"/>
  </h-modal>
</template>

<script>
import ReportRejectInfoTable from "@views/hifar/hifar-environmental-test/reports/components/ReportRejectInfoTable.vue";
import {postAction} from "@api/manage";

export default {
  name: "ReportRejectInfoModal",
  components: {ReportRejectInfoTable},
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  data() {
    return {
      visible: false,
      submitLoading: false,
      reportId: "",
      type: "",
      url: {
        check: '/HfEnvReportExamineBusiness/examineById',
      },
      valueRadio: "1"
    }
  },
  methods: {
    show(reportId, type) {
      this.reportId = reportId;
      this.type = type;
      this.visible = true;
    },
    handleCancel() {
      this.visible = false;
      this.valueRadio = '1'
    },
    renderRadioGroup(h) {
      return h('div', {
        style: {
          marginTop: "20px"
        }
      }, [
        h('a-radio-group', {
          props: {
            value: this.valueRadio,
          },
          on: {
            change: this.handleRadioChange,
          }
        }, [
          h('a-radio-button', {props: {key: "1", value: "1",}}, ['报告生成']),
          h('a-radio-button', {props: {key: "2", value: "2"}}, ['报告审核']),
        ])
      ])
    },
    handleRadioChange(e) {
      this.valueRadio = e.target.value
    },
    handleSubmit() {
      if (this.type === 'approve') {
        this.$confirm({
          title: '请选择驳回节点',
          content: h => {
            return this.renderRadioGroup(h)
          },
          onOk: () => {
            this.handleSubmitRequest()
          },
        })
      } else {
        this.valueRadio = undefined
        this.handleSubmitRequest()
      }
    },
    handleSubmitRequest() {
      let params = {
        id: this.reportId,
        examineFlag: this.type === 'check' ? 30 : this.type === 'approve' ? 50 : this.type === 'examine' ? 80 : null,
        // rejectType 驳回节点 1 报告生成 2 报告审核 3 报告批准 4 修改审批
        rejectType: this.type === 'check' ? '2' : this.type === 'approve' ? '3' : this.type === 'examine' ? '4' : null,
        reportRejectList: this.$refs.reportRejectInfoTable.getTableData(),
        rejectionLevel: this.valueRadio
      }
      postAction(this.url.check, params).then((res) => {
        if (res.code === 200) {
          this.$message.success('驳回成功')
          this.handleCancel()
          this.$emit('change')
        }
      })
    },
  },
}
</script>

<style scoped>

</style>