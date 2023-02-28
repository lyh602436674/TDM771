<!--
 * @Author: 赵峰
 * @Date: 2021-09-03 16:33:36
 * @LastEditTime: 2021-09-09 15:50:54
 * @LastEditors: 赵峰
 * @Descripttion: 报告批准
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-physico-chemical\reports\ReportApproveList.vue
-->
<template>
  <div ref="pageWrapper" class="h-custom-layout" style="height: 100%; position: relative">
    <h-card>
      <template slot="title"> 修改审核</template>
      <h-tabs :activeKey="activeKey" :animated="true" fixed @change="handleTabsChange">
        <a-tab-pane key="1">
          <a-badge slot="tab" :count="0" :offset="offset">待审核</a-badge>
          <report-examine-table ref="ReportExamineTable" :queryType='activeKey'/>
        </a-tab-pane>
        <a-tab-pane key="2">
          <a-badge slot="tab" :count="0" :offset="offset">已审核</a-badge>
          <report-examine-table ref="ReportExamineTable" :queryType='activeKey'/>
        </a-tab-pane>
      </h-tabs>
    </h-card>
  </div>
</template>

<script>
import ReportExamineTable from "@views/hifar/hifar-environmental-test/reports/components/ReportExamineTable";

export default {
  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper,
    }
  },

  components: {
    ReportExamineTable,
  },

  data() {
    return {
      activeKey: '1',
      offset: [10, 1],
    }
  },

  methods: {
    handleTabsChange(v) {
      this.activeKey = v
    },
  },
}
</script>
<style lang='less' scoped>
</style>