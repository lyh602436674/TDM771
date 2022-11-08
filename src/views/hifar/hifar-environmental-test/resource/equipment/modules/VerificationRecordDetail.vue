<!--
 * @Author: 赵峰
 * @Date: 2021-09-01 17:53:11
 * @LastEditTime: 2021-09-01 17:55:59
 * @LastEditors: 赵峰
 * @Descripttion: 检定记录详情
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-physico-chemical\resource\equipment\modules\VerificationRecordDetail.vue
-->
<template>
  <h-modal
    title="详情"
    inner
    destroyOnClose
    :getContainer="getContainer"
    :width="1000"
    :visible="visible"
    @cancel="handleCancel"
  >
    <div class="footer" slot="footer">
      <a-button @click="handleCancel" type="ghost-danger"> 关闭 </a-button>
    </div>
    <h-detail :showElevator="false">
      <h-descriptions size="small" bordered anchor :column="1" title="基本信息">
        <a-descriptions-item v-for="(item, index) in formData" :key="index" :label="item.title">
          {{ detail ? detail[item.key] : '' }}
        </a-descriptions-item>
      </h-descriptions>
    </h-detail>
  </h-modal>
</template>

<script>
import moment from 'moment'
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
      detail: {},
      formData: [
        {
          title: '检定日期',
          key: 'verifyTime',
          formType: 'datePick',
        },
        {
          title: '检查结果',
          key: 'verifyRs',
          formType: 'textarea',
        },
        {
          title: '结果确认',
          key: 'rsConfirm',
          formType: 'input',
        },
        {
          title: '责任人',
          key: 'dutyUserName',
          formType: 'input',
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
        },
      ],
    }
  },

  methods: {
    show(record) {
      this.visible = true
      let obj = Object.assign({}, record)
      obj.verifyTime =
        obj.verifyTime && obj.verifyTime != 0 ? moment(parseInt(obj.verifyTime)).format('YYYY-MM-DD HH:mm:ss') : '--'
      this.detail = obj
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>
<style lang='less' scoped>
</style>