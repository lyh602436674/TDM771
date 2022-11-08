<!--
 * @Author: 赵峰
 * @Date: 2021-08-27 09:46:00
 * @LastEditTime: 2021-09-18 11:32:25
 * @LastEditors: 赵峰
 * @Descripttion: 试品批量接收
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\sample\modules\SampleBatchAccessModal.vue
-->
<template>
  <h-modal
    title="试品批量接收"
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
        <vxe-table-column title="委托单号" field="entrustCode"></vxe-table-column>
        <vxe-table-column title="试品编号" field="pieceCode"></vxe-table-column>
        <vxe-table-column title="试品名称" field="productName"></vxe-table-column>
        <vxe-table-column
          title="数量"
          field="optNum"
          :edit-render="{ name: '$input', props: { type: 'number', min: 1, placeholder: '请输入数量' } }"
        ></vxe-table-column>
        <vxe-table-column
          title="送样人"
          field="optUserName"
          :edit-render="{ name: '$input', props: { placeholder: '请输入送样人' } }"
        ></vxe-table-column>
        <vxe-table-column
          title="状态描述"
          field="remarks"
          :edit-render="{ name: '$input', props: { placeholder: '请输入状态描述' } }"
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
        submit: '/HfEnvPieceBusiness/batchReceive',
      },
      validRules: {
        optNum: [{ required: true, message: '数量不能为空', trigger: 'blur' }],
        optUserName: [{ required: true, message: '送样人不能为空', trigger: 'blur' }],
        remarks: [{ required: true, message: '状态描述不能为空', trigger: 'blur' }],
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
          entrustCode: item.entrustCode,
          pieceCode: item.pieceCode,
          productName: item.productName,
          pieceCnum: item.pieceCnum,
          optNum: item.pieceNum,
          remarks: '完好',
          optUserName: '同上',
          optUserId: 0,
        })
      })
      patchDetailData[0].optUserName = ''
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
      let pieceInfo = []
      accessData.forEach((item) => {
        pieceInfo.push({
          id: item.id,
          entrustCode: item.entrustCode,
          pieceCode: item.pieceCode,
          productName: item.productName,
          pieceCnum: item.pieceCnum,
          optNum: item.optNum,
          remarks: item.remarks,
          optUserName: item.optUserName == '同上' ? '' : item.optUserName,
          optUserId: item.optUserId,
        })
      })
      if (!errMap) {
        postAction(this.url.submit, { pieceInfo: pieceInfo }).then((res) => {
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