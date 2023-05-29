<template>
  <h-modal
    :getContainer="getContainer"
    title="力学试验条件结构化"
    :visible="visible"
    destroyOnClose
    :width="modalWidth"
    inner
    @cancel="handleCancel"
  >
    <div slot="footer">
      <a-button type="ghost-danger" @click="handleCancel">关闭</a-button>
    </div>
    <div>
      <vxe-table
        size="mini"
        border
        ref='TestConditionTable'
        :data='dataSource'
        keep-source
        max-height='300'
        show-overflow
      >
        <vxe-table-column type="seq" width="40" align="center"></vxe-table-column>
        <vxe-table-column v-for="(item,index) in columns" :key="index" :field="item.key"
                          :title="item.title"></vxe-table-column>
      </vxe-table>
    </div>
  </h-modal>
</template>

<script>

import entrustmentMixins from "@views/hifar/hifar-environmental-test/entrustment/components/entrustmentMixins";

export default {
  name: "PreviewMechanicalTestConditions",
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  mixins: [entrustmentMixins],
  data() {
    return {
      visible: false,
      dataSource: [],
      columns: [],
      modalWidth: 900,
    }
  },
  methods: {
    show(dataSource) {
      let {columns, res} = this.transposeData(dataSource)
      let width = (columns.length + 1) * 100 + 50
      this.modalWidth = width > 1900 ? width : '100%'
      this.visible = true
      this.columns = columns
      this.dataSource = res
    },
    handleCancel() {
      this.visible = false
    }
  }
}
</script>

<style scoped>

</style>