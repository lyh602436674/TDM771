<!--
 * @Author: 赵峰
 * @Date: 2021-11-12 09:24:36
 * @LastEditTime: 2021-11-15 16:58:27
 * @LastEditors: 赵峰
 * @Descripttion: 试验异常列表弹窗
 * @FilePath: \task\modules\AbnormalDetailModal.vue
-->
<template>
  <h-modal
    :title="title"
    destroyOnClose
    inner
    fullScreen
    :getContainer="getContainer"
    :visible="visible"
    @cancel="handleCancel"
  >
    <div class="footer" slot="footer">
      <a-button @click="handleCancel" type="ghost-danger"> 关闭 </a-button>
    </div>
    <abnormal-record-table
      ref="AbnormalRecordTable"
      :records="records"
      style="padding-top: 8px;"
    ></abnormal-record-table>
  </h-modal>
</template>

<script>
import AbnormalRecordTable from './components/detail/AbnormalRecordTable'
export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  components: {
    AbnormalRecordTable,
  },
  data() {
    return {
      title: '',
      visible: false,
      records: [],
    }
  },
  methods: {
    show(record) {
      this.visible = true
      this.title = record.testNames + '(' + record.testCode + ') - 异常记录'
      this.records = record
    },
    handleCancel() {
      this.visible = false
      this.$emit("change")
    },
  },
}
</script>
<style lang='less' scoped>
</style>