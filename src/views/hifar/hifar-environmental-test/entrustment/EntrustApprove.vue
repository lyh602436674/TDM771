<!--
 * @Author: 雷宇航
 * @Date: 2022-01-06 16:31:45
 * @LastEditTime: 2022-01-07 15:26:10
 * @LastEditors: 雷宇航
 * @Descripttion: 委托批准页面
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\entrustment\EntrustCheck.vue
-->
<template>
  <entrust-flow ref="entrustFlow" :pageOption="pageOption"></entrust-flow>
</template>

<script>
import EntrustFlow from "@views/hifar/hifar-environmental-test/entrustment/EntrustFlow";

export default {
  name: "EntrustApprove",
  components: {
    EntrustFlow,
  },

  data() {
    return {
      pageOption: {
        typeText: "批准",
        defaultStatus: '15',
        typeNo: "2",
        pass: "entrustApprove:pass",
        reject: "entrustApprove:reject",
      }
    };
  },

  methods: {},
};
</script>
<style lang="less" scoped></style>
