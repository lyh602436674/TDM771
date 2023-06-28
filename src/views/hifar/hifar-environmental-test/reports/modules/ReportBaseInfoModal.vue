<template>
  <h-modal
    title="报告信息"
    inner
    fullScreen
    destroyOnClose
    :visible="visible"
    :getContainer="getContainer"
    @cancel="handleCancel">
    <template slot="footer">
      <a-button type="ghost-danger" @click="handleCancel"> 关闭</a-button>
    </template>
    <div class="reportMakeBase">
      <a-spin :spinning="localLoading">
        <h-card title="基本信息">
          <h-desc :data="detailData" size="small" :column="3">
            <h-desc-item label="报告编号">
              {{ detailData.reportCode || '--' }}
            </h-desc-item>
            <h-desc-item label="产品编号">
              {{ detailData.pieceNo || '--' }}
            </h-desc-item>
            <h-desc-item label="试验编号">
              <template slot="content">
                <a @click="$refs.testBaseInfoForMultipleModal.show(detailData)">
                  {{ detailData.testCode || '--' }}</a>
              </template>
            </h-desc-item>
            <h-desc-item label="送试单位">
              {{ detailData.custName || '--' }}
            </h-desc-item>
            <h-desc-item label="联系人">
              {{ detailData.custLinkName || '--' }}
            </h-desc-item>
            <h-desc-item label="联系方式">
              {{ detailData.custLinkMobile || '--' }}
            </h-desc-item>
            <h-desc-item label="产品代号">
              {{ detailData.productAlias || '--' }}
            </h-desc-item>
            <h-desc-item label="产品名称">
              {{ detailData.productName || '--' }}
            </h-desc-item>
            <h-desc-item label="委托单号">
              {{ detailData.entrustNo || '--' }}
            </h-desc-item>
            <h-desc-item label="运行单号">
              <template slot="content">
                <a @click="$refs.testTaskBaseInfoModal.show(detailData,'2','20px','testId')">
                  {{ detailData.entrustCode || '--' }}</a>
              </template>
            </h-desc-item>
            <h-desc-item label="试验名称">
              {{ detailData.testName || '--' }}
            </h-desc-item>
            <h-desc-item label="试验性质">
              {{ detailData.testPropertyCode_dictText || '--' }}
            </h-desc-item>
            <h-desc-item label="是否显示最终用户">
              {{ detailData.isShowUserInReport === '1' ? '是' : "否" }}
            </h-desc-item>
            <h-desc-item label="最终用户">
              {{ detailData.lastUser_dictText || '--' }}
            </h-desc-item>
            <h-desc-item label="是否拍照">
              {{ detailData.isPhotograph === 1 ? '是' : '否' }}
            </h-desc-item>
            <h-desc-item label="备注信息">
              <!-- 委托单填写的备注-->
              {{ detailData.remarks || '--' }}
            </h-desc-item>
          </h-desc>
        </h-card>
        <h-card title="报告信息">
          <vxe-table
            border
            resizable
            round
            show-all-overflow
            :data="tableData"
          >
            <vxe-table-column type="seq" width="60" align="center"></vxe-table-column>
            <vxe-table-column title="报告名称" field="fileName"></vxe-table-column>
            <vxe-table-column title="操作" field="action">
              <template v-slot="{row}">
                <slot></slot>
              </template>
            </vxe-table-column>
          </vxe-table>
        </h-card>
        <h-card title="报告流转信息">
          <report-flow-info-table ref="ReportFlowInfoTable" tableHeight="500"
                                  :reportId="reportId"></report-flow-info-table>
        </h-card>
      </a-spin>
    </div>
    <report-detail-modal ref="ReportDetailModal"/>
    <test-base-info-for-multiple-modal ref="testBaseInfoForMultipleModal"/>
    <test-task-base-info-modal ref="testTaskBaseInfoModal"/>
  </h-modal>
</template>

<script>
import {postAction} from "@api/manage";
import ReportDetailModal from "@views/hifar/hifar-environmental-test/reports/modules/ReportDetailModal.vue";
import TestTaskBaseInfoModal from "@views/hifar/hifar-environmental-test/task/TestTaskBaseInfoModal.vue";
import ReportFlowInfoTable from "@views/hifar/hifar-environmental-test/reports/components/ReportFlowInfoTable.vue";
import TestBaseInfoForMultipleModal
  from "@views/hifar/hifar-environmental-test/reports/modules/TestBaseInfoForMultipleModal.vue";

export default {
  name: "ReportBaseInfoModal",
  components: {TestBaseInfoForMultipleModal, ReportDetailModal, ReportFlowInfoTable, TestTaskBaseInfoModal},
  inject: {
    getContainer: {
      default: () => document.body
    }
  },
  data() {
    return {
      visible: false,
      isIntranet: true,
      url: {
        queryDetail: "/HfEnvTaskTestBusiness/queryListByIds"
      }
    }
  },
  props: {
    detailData: {
      type: Object,
      default: () => ({})
    },
    localLoading: {
      type: Boolean,
      default: false
    },
    reportId: {
      type: String,
      default: ''
    }
  },
  computed: {
    tableData() {
      return [this.detailData]
    },
  },
  methods: {
    handleCancel() {
      this.visible = false
      this.$emit('close')
    },
  },
}
</script>

<style lang="less" scoped>
.reportMakeBase {
  /deep/ .h-card-wrapper {
    height: auto;
  }
}

</style>