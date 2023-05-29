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
    title="添加报告"
    inner
    fullScreen
    destroyOnClose
    :visible="visible"
    :getContainer="getContainer"
    @cancel="handleCancel">
    <template slot="footer">
      <a-button type="ghost-danger" :loading="submitLoading" @click="handleCancel"> 关闭</a-button>
      <a-button type="ghost-success" :loading="submitLoading" @click="saveTestHandle">
        确定
      </a-button>
    </template>
    <a-spin class="spin-wrapper" :spinning="submitLoading" tip="生成报告中...">
      <report-experiment-table-tabs ref="reportExperimentMain" @change="selectChange"></report-experiment-table-tabs>
      <report-template-select ref="reportTemplateSelect" @callback="selectedTemplate"></report-template-select>
    </a-spin>
  </h-modal>
</template>

<script>
import {postAction} from '@/api/manage'
import ReportExperimentTableTabs
  from '@views/hifar/hifar-environmental-test/reports/components/ReportExperimentTableTabs.vue'
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
      url: {
        submit: '/HfEnvReportBusiness/add'
      }
    }
  },
  components: {
    ReportTemplateSelect,
    ReportExperimentTableTabs
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
    selectChange(selectedRowKeys, selectedRow) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRow = selectedRow
    },
    saveTestHandle() {
      if (!this.selectedRowKeys.length) return this.$message.warning('请选择试验')
      if (Array.from(new Set(this.selectedRow.map(item => item.typeCode))).length > 1) return this.$message.warning('只能选择同一种项目类型的试验')
      if (Array.from(new Set(this.selectedRow.map(item => item.entrustNo))).length > 1) return this.$message.warning('只能选择同一委托单')
      this.$refs.reportTemplateSelect.show()
    },
    selectedTemplate(selectedRowKeys,) {
      this.handleSubmit(selectedRowKeys)
    },
    handleSubmit(templateId) {
      let {selectedRowKeys} = this
      if (!selectedRowKeys.length) {
        this.$message.warning('请选择试验')
      } else {
        this.submitLoading = true
        let params = {
          tests: this.selectedRow.map(item => {
            return {...item, options: item.checkboxValue.toString()}
          }),
          buttonFlag: 'save',
          templateId: templateId.toString(),
          options: Array.from(new Set(this.selectedRow.map(v => v.checkboxValue).flat())).toString(),
          typeCode: this.selectedRow[0].typeCode
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
/deep/ .spin-wrapper {
  height: 100%;

  .ant-spin-container {
    height: 100%;
  }
}
</style>
