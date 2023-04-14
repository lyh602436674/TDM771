<!--
 * @Author: 雷宇航
 * @Date: 2023-04-04 18:14:05
 * @fileName: TerminationDetailModal.vue
 * @FilePath: tdm771-client\src\views\hifar\hifar-environmental-test\task\modules\TerminationDetailModal.vue
 * @Description: 终止记录弹框
-->
<template>
  <h-modal
    :getContainer="getContainer"
    :title="title"
    :visible="visible"
    :width="1200"
    destroyOnClose
    inner
    @cancel="handleCancel"
  >
    <div slot="footer" class="footer">
      <a-button type="ghost-danger" @click="handleCancel"> 关闭</a-button>
    </div>
    <termination-record-table ref="TerminationRecordTable" :listType="listType" :records="records"
                              style="height:100%;padding-top: 8px"/>
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
  props: {
    listType: {
      type: String,
      default: '',
    }
  },
  data() {
    return {
      title: '',
      visible: false,
      records: [],
    }
  },
  methods: {
    show(record, title) {
      this.visible = true
      this.title = title + '- 终止记录'
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