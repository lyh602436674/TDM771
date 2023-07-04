<template>
  <h-modal
    :getContainer="getContainer"
    :title="title"
    :visible="visible"
    destroyOnClose
    inner
    width="90%"
    @cancel="handleCancel"
  >
    <div slot='footer' class='footer'>
      <a-button type='ghost-danger' @click='handleCancel'> 关闭</a-button>
    </div>
    <div style="padding:10px">
      <h-tabs :activeKey="activeKey" :animated="true" fixed @change="handleTabsChange">
        <a-tab-pane key="beforeSnapshot">
          <a-badge slot="tab" :offset="offset">实际开始任务</a-badge>
          <inspection-record-item-list ref="beforeSnapshotTable" :activeKey="activeKey"
                                       :rowId="rowId"></inspection-record-item-list>
        </a-tab-pane>
        <a-tab-pane key="afterSnapshot">
          <a-badge slot="tab" :offset="offset">计划结束任务</a-badge>
          <inspection-record-item-list ref="afterSnapshotTable" :activeKey="activeKey"
                                       :rowId="rowId"></inspection-record-item-list>
        </a-tab-pane>
      </h-tabs>
    </div>
  </h-modal>
</template>

<script>
import moment from "moment";
import {postAction} from "@api/manage";
import InspectionRecordItemList from "@views/hifar/hifar-environmental-test/inspectionRecord/InspectionRecordItemList";

export default {
  name: "InspectionRecordModal",
  components: {InspectionRecordItemList},
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  data() {
    return {
      moment,
      offset: [10, 1],
      title: '试验记录快照',
      visible: false,
      queryParams: {},
      rowId: "",
      activeKey: "beforeSnapshot",
    }
  },
  methods: {
    show(rowId, activeKey) {
      this.visible = true
      this.activeKey = activeKey
      this.rowId = rowId
      this.handleTabsChange(activeKey)
    },
    handleTabsChange(val) {
      this.activeKey = val
      this.$nextTick(() => {
        if (val === 'beforeSnapshot') {
          this.$refs.beforeSnapshotTable.refresh(true)
        } else if (val === 'afterSnapshot') {
          this.$refs.afterSnapshotTable.refresh(true)
        }
      })
    },
    handleCancel() {
      this.visible = false
    },
  }
}
</script>

<style scoped>

</style>