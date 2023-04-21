<!--
 * @Author: 雷宇航
 * @Date: 2023-04-03 17:13:50
 * @fileName: FeeSettlementList.vue
 * @FilePath: tdm771-client\src\views\hifar\hifar-environmental-test\feeSettlement\FeeSettlementList.vue
 * @Description: 费用结算页面
-->
<template>
  <div ref="approval" class="approvalPage">
    <h-card>
      <template slot="title"> 费用结算</template>
      <h-tabs :activeKey="activeKey" :animated="true" fixed @change="handleTabsChange">
        <a-tab-pane key="1">
          <a-badge slot="tab" :offset="offset">试验结算</a-badge>
          <test-statistics-by-completed
            ref="testStatisticsByCompleted"></test-statistics-by-completed>
        </a-tab-pane>
        <a-tab-pane key="2">
          <a-badge slot="tab" :offset="offset">结算记录</a-badge>
          <test-statistics-by-settlement ref="testStatisticsBySettlement"></test-statistics-by-settlement>
        </a-tab-pane>
      </h-tabs>
    </h-card>
  </div>
</template>

<script>
import TestStatisticsBySettlement from "@views/hifar/hifar-environmental-test/feeSettlement/TestStatisticsBySettlement";
import TestStatisticsByCompleted from "@views/hifar/hifar-environmental-test/feeSettlement/TestStatisticsByCompleted";

export default {
  name: "feeSettlementList",
  components: {TestStatisticsBySettlement, TestStatisticsByCompleted},
  provide() {
    return {
      getContainer: () => this.$refs.approval,
    }
  },
  data() {
    return {
      activeKey: "1",
      offset: [10, 1],
      url: {
        count: "HfEnvTestForceEndBusiness/queryTaskAndTestCount"
      }
    }
  },

  methods: {
    handleTabsChange(val) {
      this.activeKey = val
      this.$nextTick(() => {
        if (val === '1') {
          this.$refs.testStatisticsByCompleted.refresh(true)
        } else if (val === '2') {
          this.$refs.testStatisticsBySettlement.refresh(true)
        }
      })
    },
  },
}
</script>

<style scoped lang="less">
.approvalPage {
  width: 100%;
  height: 100%;
  position: relative;

  /deep/ .ant-tabs-content {
    height: calc(100% - 60px);
  }
}

</style>