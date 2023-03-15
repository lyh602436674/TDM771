<!--
 * @Author: 雷宇航
 * @Date: 2022-01-06 16:31:45
 * @LastEditTime: 2022-01-07 15:26:10
 * @LastEditors: 雷宇航
 * @Descripttion: 委托审核
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\entrustment\EntrustCheck.vue
-->
<template>
  <entrust-flow ref="entrustFlow" :pageOption="pageOption"></entrust-flow>
</template>

<script>
import EntrustFlow from "@views/hifar/hifar-environmental-test/entrustment/EntrustFlow";

export default {
  name: "EntrustCheck",
  components: {
    EntrustFlow,
  },

  data() {
    return {
      pageOption: {
        typeText: "审批",
        typeNo: "1", // 判断是审批还是批准 1：审批 不传的话就是 批准
        defaultStatus: '10,31',
        pass: "entrustCheck:pass",
        reject: "entrustCheck:reject",
      }
    };
  },

  methods: {},
};
</script>
<style lang="less" scoped></style>
