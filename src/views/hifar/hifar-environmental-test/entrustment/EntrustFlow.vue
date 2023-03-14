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
      <template slot="title"> {{ "委托" + pageOption.typeText }}</template>
      <h-tabs :activeKey="activeKey" :animated="true" fixed @change="handleTabsChange">
        <a-tab-pane key="1">
          <a-badge slot="tab" :count="0" :offset="offset">{{ "待" + pageOption.typeText }}</a-badge>
          <entrust-check-table
            ref="reportCheckTable"
            :pageOption="pageOption"
            :status="status"
            :activeKey="activeKey"
          ></entrust-check-table>
        </a-tab-pane>
        <a-tab-pane key="2">
          <a-badge slot="tab" :count="0" :offset="offset">{{ "已" + pageOption.typeText }}</a-badge>
          <entrust-check-table
            ref="reportCheckedTable"
            :pageOption="pageOption"
            :status="status"
            :activeKey="activeKey"
          ></entrust-check-table>
        </a-tab-pane>
      </h-tabs>
    </h-card>
  </div>
</template>

<script>
import EntrustCheckTable from "./components/EntrustCheckTable.vue";

export default {
  name: "EntrustFlow",
  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper,
    };
  },

  components: {
    EntrustCheckTable,
  },

  props: {
    pageOption: {
      type: Object,
      default: () => ({}),
    }
  },


  data() {
    return {
      activeKey: "1",
      offset: [10, 1],
      status: {'c_status_96': this.pageOption.defaultStatus},
    };
  },

  methods: {
    handleTabsChange(v) {
      this.activeKey = v;
      if (v === '1') {
        this.status = {'c_status_96': this.pageOption.typeNo === '1' ? '10,30' : '15'};
      } else {
        this.status = {'c_status_3': this.pageOption.typeNo === '1' ? '10' : '15'};
      }
    },
  },
};
</script>
<style lang="less" scoped></style>
