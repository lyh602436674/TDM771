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
    :getContainer="getContainer"
    :title="title"
    :visible="visible"
    destroyOnClose
    fullScreen
    inner
    @cancel="handleCancel"
  >
    <div slot="footer" class="footer">
      <a-button type="ghost-danger" @click="handleCancel"> 关闭</a-button>
    </div>
    <termination-record-table
      style="padding-top: 8px;"
      ref="TerminationRecordTable"
      :isReadOnly="isReadOnly"
      :records="records"
    />
  </h-modal>
</template>

<script>
import TerminationRecordTable
  from "@views/hifar/hifar-environmental-test/task/modules/components/detail/TerminationRecordTable";

export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  components: {
    TerminationRecordTable,
  },
  data() {
    return {
      title: '',
      visible: false,
      records: {},
    }
  },
  props: {
    isReadOnly: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    show(record) {
      this.visible = true
      this.title = (record.testNames ? record.testNames : '') + (record.testCode ? '(' + record.testCode + ')' : '') + '-终止记录'
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