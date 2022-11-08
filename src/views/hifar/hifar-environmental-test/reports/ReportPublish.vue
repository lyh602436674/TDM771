<!--
 * @Author: 赵峰
 * @Date: 2021-08-31 14:26:42
 * @LastEditTime: 2021-09-14 15:37:26
 * @LastEditors: 赵峰
 * @Descripttion: 报告发放
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-physico-chemical\reports\ReportPublish.vue
-->
<template>
  <div ref="pageWrapper" class="h-custom-layout" style="height: 100%; position: relative">
    <h-card>
      <report-publish-table ref="ReportPublishTable" :queryType="queryType"></report-publish-table>
    </h-card>
  </div>
</template>

<script>
import ReportPublishTable from './components/ReportPublishTable.vue'
export default {
  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper,
    }
  },

  components: {
    ReportPublishTable,
  },

  data() {
    return {
      activeKey: '1',
      offset: [10, 1],
      queryType: 1,
    }
  },

  methods: {
    handleTabsChange(v) {
      this.activeKey = v
      if (v == 1) {
        this.queryType = 1
      } else {
        this.queryType = 2
      }
    },
  },
}
</script>
<style lang='less' scoped>
</style>