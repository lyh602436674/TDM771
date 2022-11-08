<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-25 14:39:53
 * @LastEditTime: 2021-09-17 13:12:40
 * @LastEditors: 陈乾龙
 * @Description: 用户首页
 * @FilePath: \hifar-platform-client\src\views\Home.vue
-->
<template>

</template>

<script>
export default {
  mounted() {
  
  },
}
</script>

<style lang="less" scoped>
.hifar-home {
  height: 100%;
  width: 100%;
  padding: 10px;
  overflow: auto;
  box-sizing: border-box;
  .icon-wrapper {
    border-radius: @border-radius-base;
    width: 50px;
    height: 50px;
    // background:lightcyan;
    font-size: 24px;
    border: solid 1px @border-color-base;
    text-align: center;
    line-height: 48px;
  }
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
}
</style>