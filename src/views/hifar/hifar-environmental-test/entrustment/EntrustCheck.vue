<!--
 * @Author: 雷宇航
 * @Date: 2022-01-06 16:31:45
 * @LastEditTime: 2022-01-07 15:26:10
 * @LastEditors: 雷宇航
 * @Descripttion: 委托审核
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\entrustment\EntrustCheck.vue
-->
<template>
  <div ref="pageWrapper" class="h-custom-layout" style="height: 100%; position: relative">
    <h-card>
      <template slot="title"> 委托审核</template>
      <h-tabs fixed :activeKey="activeKey" :animated="true" @change="handleTabsChange">
        <a-tab-pane key="1">
          <a-badge :count="0" slot="tab" :offset="offset">待审核</a-badge>
          <entrust-check-table
            ref="reportCheckTable"
            :status="status"
          ></entrust-check-table>
        </a-tab-pane>
        <a-tab-pane key="2">
          <a-badge :count="0" slot="tab" :offset="offset">已审核</a-badge>
          <entrust-check-table
            ref="reportCheckedTable"
            :status="status"
          ></entrust-check-table>
        </a-tab-pane>
      </h-tabs>
    </h-card>
  </div>
</template>

<script>
import EntrustCheckTable from "./components/EntrustCheckTable.vue";

export default {
  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper,
    };
  },

  components: {
    EntrustCheckTable,
  },

  data() {
    return {
      activeKey: "1",
      offset: [10, 1],
      status: {'c_status_1': 10},
    };
  },

  methods: {
    handleTabsChange(v) {
      this.activeKey = v;
      if (v == 1) {
        this.status = {'c_status_1': 10};
      } else {
        this.status = {'c_status_3': 10}
      }
    },
  },
};
</script>
<style lang="less" scoped></style>
