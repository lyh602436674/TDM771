<!--
 * @Author: 赵峰
 * @Date: 2021-09-10 14:38:55
 * @LastEditTime: 2021-10-14 09:57:11
 * @LastEditors: 赵峰
 * @Descripttion: 报告批量发放
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\reports\modules\ReportBatchAccessModal.vue
-->
<template>
  <h-modal
    title="报告批量发放"
    inner
    fullScreen
    destroyOnClose
    :getContainer="getContainer"
    :visible="visible"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <div style="padding: 10px 30px">
      <vxe-table
        border
        show-all-overflow
        ref="sampleBatchAccessTable"
        :data="patchDetailData"
        :edit-rules="validRules"
        :edit-config="{ key: 'id', trigger: 'click', mode: 'cell' }"
      >
        <vxe-table-column type="seq" width="60"></vxe-table-column>
        <vxe-table-column title="报告编号" width="200" field="reportCode"></vxe-table-column>
        <vxe-table-column
          title="接收人"
          field="receiveUserName"
          width="160"
          :edit-render="{ name: '$input', props: { placeholder: '请输入接收人' } }"
        ></vxe-table-column>
        <vxe-table-column
          title="备注"
          field="remarks"
          :edit-render="{ name: '$input', props: { placeholder: '请输入备注' } }"
        ></vxe-table-column>
      </vxe-table>
    </div>
  </h-modal>
</template>

<script>
import moment from 'moment'
import { postAction } from '@/api/manage'
export default {
  components: {},
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  data() {
    return {
      moment,
      visible: false,
      patchDetailData: [],
      url: {
        submit: '/HfEnvReportReceiveBusiness/receiveBatchById',
      },
      validRules: {
        receiveUserName: [{ required: true, message: '接收人不能为空', trigger: 'blur' }],
        remarks: [{ required: false, message: '备注不能为空', trigger: 'blur' }],
      },
    }
  },

  methods: {
    show(record) {
      let patchDetailData = []
      this.visible = true
      record.forEach((item) => {
        patchDetailData.push({
          id: item.id,
          reportCode: item.reportCode,
          remarks: '',
          receiveUserName: '同上',
        })
      })
      patchDetailData[0].receiveUserName = ''
      this.patchDetailData = patchDetailData
    },
    handleCancel() {
      this.queryParams = {}
      this.patchDetailData = []
      this.visible = false
    },
    async handleSubmit() {
      const $table = this.$refs.sampleBatchAccessTable
      const errMap = await $table.validate().catch((errMap) => errMap)
      let accessData = $table.getData()
      let receiveInfo = []
      accessData.forEach((item) => {
        receiveInfo.push({
          id: item.id,
          reportCode: item.reportCode,
          remarks: item.remarks,
          receiveUserName: item.receiveUserName,
        })
      })
      if (!errMap) {
        postAction(this.url.submit, { receiveInfo: receiveInfo }).then((res) => {
          if (res.code == 200) {
            this.$message.success('操作成功')
            this.handleCancel()
            this.$emit('change', true)
          } else {
            this.$message.error(res.msg)
          }
        })
      }
    },
  },
}
</script>
<style lang='less' scoped>
</style>