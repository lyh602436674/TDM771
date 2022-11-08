<!--
 * @Author: 赵峰
 * @Date: 2021-08-31 15:00:48
 * @LastEditTime: 2021-08-31 15:00:49
 * @LastEditors: 赵峰
 * @Descripttion: 
 * @FilePath: \hifar-platform-client\src\views\hifar\sys\message\MessageList.vue
-->
<template>
  <div class="empty-containter">
    <img class="empty-img" src="../../../../assets/developing.png" alt="" />
    <div class="empty-txt">正在开发中...</div>
  </div>
</template>

<script>
export default {
  components: {},

  data() {
    return {}
  },

  methods: {},
}
</script>
<style lang='less' scoped>
.empty-containter {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .empty-img {
    width: 309px;
  }
  .empty-txt {
    font-size: 18px;
    font-weight: bold;
    padding: 30px 0;
  }
}
</style>