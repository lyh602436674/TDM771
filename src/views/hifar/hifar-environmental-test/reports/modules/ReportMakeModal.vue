<!--
 * @Author: 赵峰
 * @Date: 2021-09-03 17:16:44
 * @LastEditTime: 2021-11-05 14:24:19
 * @LastEditors: Please set LastEditors
 * @Descripttion: 报告编制--添加
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\reports\modules\ReportMakeModal.vue
-->
<template>
  <h-modal inner fullScreen destroyOnClose :getContainer="getContainer" :visible="visible" @cancel="handleCancel">
    <a-alert v-if="messageErrorShow" :message="messageError" type="error" show-icon />
    <div class="footer" slot="footer">
      <a-button @click="handleCancel" type="ghost-danger"> 关闭 </a-button>
      <a-button
        v-if="activeKey == 1"
        :loading="submitLoading"
        type="ghost-success"
        @click="subProjectHandle({ buttonFlag: 'save' })"
      >
        保存
      </a-button>
      <a-button v-if="activeKey == 2" :loading="submitLoading" type="ghost-success" @click="saveHandle">
        保存
      </a-button>
      <!-- <a-button
        v-if="activeKey == 1"
        :loading="submitLoading"
        type="primary"
        @click="subProjectHandle({ buttonFlag: 'submit' })"
      >
        提交
      </a-button> -->
    </div>
    <h-card :bordered="false" fixed>
      <a-tabs v-model="activeKey" style="width: 100%" @change="handleTabsChange">
        <a-tab-pane :key="1" tab="待出报告" />
        <a-tab-pane :key="2" tab="已出报告" />
      </a-tabs>
      <template v-if="activeKey == 1">
        <report-stand-out ref="ReportStandOut"></report-stand-out>
      </template>
      <template v-if="activeKey == 2">
        <report-maked-table ref="ReportMakedTable" @change="selectChange"></report-maked-table>
      </template>
    </h-card>
    <report-cover-modal ref="ReportCoverModal" @change="selectCoverHandle"></report-cover-modal>
  </h-modal>
</template>

<script>
import { postAction } from '@/api/manage'
import ReportStandOut from '../components/ReportStandOut'
import ReportMakedTable from '../components/ReportMakedTable'
import ReportCoverModal from '../modules/ReportCoverModal'
export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  components: {
    ReportStandOut,
    ReportMakedTable,
    ReportCoverModal,
  },

  data() {
    return {
      messageError: '',
      messageErrorShow: false,
      visible: false,
      submitLoading: false,
      activeKey: 1,
      selectedRowKeys: [],
      selectedRow: [],
      entrustCodeArr: [],
      url: {
        submit: '/HfEnvReportBusiness/add',
      },
    }
  },
  methods: {
    openNotificationWithIcon(type, desc) {
      this.$notification[type]({
        duration: 2,
        message: '请选择',
        description: desc,
      })
    },
    isRepeat(arr) {
      var isTrue = true
      var length = arr.length
      if (length > 0) {
        var temp = arr[0]
        for (var i = 0; i < length; i++) {
          if (arr.indexOf(arr[i]) != 0) {
            isTrue = false
            break
          }
        }
      }
      if (isTrue) {
        return true
      } else {
        return false
      }
    },
    show(record) {
      this.visible = true
      this.activeKey = 1
    },
    handleCancel() {
      this.visible = false
      this.selectedRow = []
      this.selectedRowKeys = []
    },
    handleTabsChange(v) {
      this.activeKey = v
    },
    subProjectHandle(record) {
      let buttonFlag = record.buttonFlag
      this.submitHandle(buttonFlag)
    },
    submitHandle(buttonFlag) {
      let data = this.$refs.ReportStandOut.onSubmitHandle()
      if (data) {
        this.submitLoading = true
        let params = {
          ...data,
          buttonFlag: buttonFlag,
        }
        postAction(this.url.submit, params).then((res) => {
          this.submitLoading = false
          if (res.code == 200) {
            this.$message.success('操作成功')
            this.$emit('change', true)
            this.handleCancel()
          }
        })
      }
    },
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
    },
    saveHandle() {
      let { entrustCodeArr, selectedRowKeys } = this
      if (selectedRowKeys.length == 0) {
        this.openNotificationWithIcon('error', '请选择项目')
      } else if (!this.isRepeat(entrustCodeArr)) {
        this.openNotificationWithIcon('error', '请选择同一委托单')
      } else {
        this.$refs.ReportCoverModal.visible = true
      }
    },
    selectCoverHandle(v) {
      let projectIds = []
      let selectedRow = this.selectedRow
      let coverTemplateId = v.coverTemplateId
      selectedRow.forEach((item) => {
        projectIds.push(item.unitId)
      })

      if (coverTemplateId) {
        this.submitLoading = true
        let data = {
          entrustId: selectedRow[0].entrustId,
          entrustCode: selectedRow[0].entrustCode,
          custId: selectedRow[0].custId,
          custName: selectedRow[0].custName,
          custLinkName: selectedRow[0].custLinkName,
          custLinkMobile: selectedRow[0].custLinkMobile,
          productId: selectedRow[0].productId,
          productName: selectedRow[0].productName,
          coverTemplateId: coverTemplateId,
          projectIds: projectIds.length > 0 ? projectIds.join(',') : '',
        }
        let params = {
          ...data,
          buttonFlag: 'save',
        }
        postAction(this.url.submit, params).then((res) => {
          this.submitLoading = false
          if (res.code == 200) {
            this.$message.success('操作成功')
            this.$emit('change', true)
            this.handleCancel()
          }
        })
      }
    },
  },
}
</script>
<style lang='less' scoped>
.h-report-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  .h-report-left {
    height: 100%;
  }
}
</style>