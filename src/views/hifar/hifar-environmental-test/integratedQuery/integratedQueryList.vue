<template>
  <div ref="integratedQuery" class="integratedQueryList">
    <h-card>
      <template slot="title"> 综合查询</template>
      <h-tabs fixed :activeKey="activeKey" :animated="true" @change="handleTabsChange">
        <a-tab-pane key="1" tab="空港">
          <integrated-query-table queryType="1"></integrated-query-table>
        </a-tab-pane>
        <a-tab-pane key="2" tab="质检">
          <integrated-query-table queryType="2"></integrated-query-table>
        </a-tab-pane>
      </h-tabs>
    </h-card>
  </div>
</template>

<script>

import IntegratedQueryTable from "@views/hifar/hifar-environmental-test/integratedQuery/integratedQueryTable.vue";

export default {
  name: "integratedQueryList",
  components: {IntegratedQueryTable},
  provide() {
    return {
      getContainer: () => this.$refs.integratedQuery,
    }
  },
  data() {
    return {
      activeKey: '1',
    }
  },

  methods: {
    handleTabsChange(v) {
      this.activeKey = v
    },
  },
}
</script>

<style scoped lang="less">
.integratedQueryList {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>