<!--
 * @Author: 赵峰
 * @Date: 2021-09-03 16:31:45
 * @LastEditTime: 2021-09-09 15:26:10
 * @LastEditors: 赵峰
 * @Descripttion: 报告审核
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-physico-chemical\reports\ReportCheck.vue
-->
<template>
  <div ref="pageWrapper" class="h-custom-layout" style="height: 100%; position: relative">
    <h-card>
      <template slot="title"> 报告审核 </template>
      <h-tabs fixed :activeKey="activeKey" :animated="true" @change="handleTabsChange">
        <a-tab-pane key="1">
          <a-badge :count="0" slot="tab" :offset="offset">待审核</a-badge>
          <report-check-table ref="reportCheckTable" :queryType='queryType'></report-check-table>
        </a-tab-pane>
        <a-tab-pane key="2">
          <a-badge :count="0" slot="tab" :offset="offset">已审核</a-badge>
          <report-check-table ref="reportCheckedTable" :queryType='queryType'></report-check-table>
        </a-tab-pane>
      </h-tabs>
    </h-card>
  </div>
</template>

<script>
import ReportCheckTable from './components/ReportCheckTable.vue'
export default {
  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper,
    }
  },

  components: {
    ReportCheckTable,
  },

  data() {
    return {
      activeKey: '1',
      offset: [10, 1],
      queryType:1,
    }
  },

  methods: {
    handleTabsChange(v) {
      this.activeKey = v
      if(v ==1){
        this.queryType = 1
      }else{
        this.queryType = 2
      }
    },
  },
}
</script>
<style lang='less' scoped>
</style>