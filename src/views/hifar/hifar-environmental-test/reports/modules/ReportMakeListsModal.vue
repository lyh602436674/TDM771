<!--
 * @Author: 马潭龙
 * @Date: 2021-11-02 12:00:14
 * @LastEditors: 马潭龙
 * @Description: 按委托,按项目--弹窗
 * @LastEditTime: 2021-11-26 12:03:41
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\reports\modules\ReportMakeListsModal.vue
 -->
<template>
  <h-modal
    title="添加"
    inner
    fullScreen
    destroyOnClose
    :visible="visible"
    :getContainer="getContainer"
    @cancel="handleCancel">
    <template slot="footer">
      <a-button type="ghost-danger" @click="handleCancel"> 关闭</a-button>
      <a-button type="ghost-success" :loading="submitLoading" @click="saveTestHandle">
        确定
      </a-button>
    </template>
    <report-experiment-table ref="reportExperimentMain" @change="selectChange"></report-experiment-table>
    <report-template-select ref="reportTemplateSelect" @callback="selectedTemplate"></report-template-select>
  </h-modal>
</template>

<script>
import {postAction} from '@/api/manage'
import ReportExperimentTable from '../components/ReportExperimentTable'
import ReportTemplateSelect from '@views/hifar/hifar-environmental-test/reports/modules/ReportTemplateSelect';

export default {
  inject: {
    getContainer: {
      default: () => document.body
    }
  },
  data() {
    return {
      visible: false,
      submitLoading: false,
      selectedRowKeys: [],
      selectedRow: [],
      entrustCodeArr: [],
      url: {
        submit: '/HfEnvReportBusiness/add'
      }
    }
  },
  components: {
    ReportTemplateSelect,
    ReportExperimentTable
  },
  methods: {
    handleCancel() {
      this.visible = false
      this.selectedRow = []
      this.selectedRowKeys = []
    },
    show() {
      this.visible = true
    },
    // 项目页面保存
    selectChange(selectedRowKeys, selectedRow) {
      let entrustCodeArr = []
      if (selectedRow.length > 0) {
        selectedRow.forEach((item) => {
          entrustCodeArr.push(item.entrustCode)
        })
      }
      this.entrustCodeArr = entrustCodeArr
      this.selectedRow = selectedRow
      this.selectedRowKeys = selectedRowKeys
      this.$emit('change')
    },
    // 按试验生成报告按钮
    saveTestHandle() {
      if (!this.selectedRowKeys.length) return this.$message.warning('请选择试验')
      if (Array.from(new Set(this.selectedRow.map(item => item.entrustNo))).length > 1) return this.$message.warning('只能选择同一委托单')
      this.$refs.reportTemplateSelect.show()
    },
    selectedTemplate(selectedRowKeys, checkboxValue) {
      this.handleSubmit(selectedRowKeys, checkboxValue)
    },
    handleSubmit(templateId, checkboxValue) {
      let {entrustCodeArr, selectedRowKeys} = this
      if (!selectedRowKeys.length) {
        this.$message.warning('请选择试验')
      } else {
        let testId = []
        let selectedRow = this.selectedRow
        selectedRow.forEach((item) => {
          testId.push(item.id)
        })
        this.submitLoading = true
        let params = {
          tests: selectedRow,
          buttonFlag: 'save',
          templateId: templateId.toString(),
          options: checkboxValue.toString(),
        }
        postAction('/HfEnvReportBusiness/generateReport', params).then((res) => {
          if (res.code === 200) {
            this.$message.success(res.msg ? res.msg : '报告添加成功')
            this.$emit('change', true)
            this.handleCancel()
          } else {
            this.$message.warning(res.msg)
          }
        }).finally(() => {
          this.submitLoading = false
        })
      }
    }
  }
}
</script>

<style lang='less' scoped>
</style>
