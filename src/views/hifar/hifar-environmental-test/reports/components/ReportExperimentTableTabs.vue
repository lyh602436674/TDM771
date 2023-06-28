<template>
  <div ref="mainPage" style="height: 100%; position: relative">
    <h-tabs :activeKey="activeKey" :animated="true" fixed @change="handleTabsChange">
      <a-tab-pane key="1" tab="待出报告">
        <report-experiment-table :activeKey="activeKey" ref="reportExperimentMain" :reportFlag="50"
                                 @change="selectChange"></report-experiment-table>
      </a-tab-pane>
      <a-tab-pane key="2" tab="已出报告">
        <report-experiment-table :activeKey="activeKey" ref="reportExperimentMain" :reportFlag="60"
                                 @change="selectChange"></report-experiment-table>
      </a-tab-pane>
      <a-tab-pane key="3" tab="失效">
        <report-experiment-table :activeKey="activeKey" ref="reportExperimentMain" :reportFlag="98"></report-experiment-table>
      </a-tab-pane>
    </h-tabs>
  </div>
</template>

<script>

import ReportExperimentTable from "@views/hifar/hifar-environmental-test/reports/components/ReportExperimentTable.vue";

export default {
  name: "ReportExperimentTableTabs",
  components: {ReportExperimentTable},
  provide() {
    return {
      getContainer: () => this.$refs.mainPage,
    }
  },
  data() {
    return {
      activeKey: "1",
    }
  },
  methods: {
    handleTabsChange(val) {
      this.activeKey = val
    },
    selectChange(selectedRowKeys, selectedRow) {
      this.$emit('change', selectedRowKeys, selectedRow)
    },
  },
}
</script>

<style scoped>

</style>