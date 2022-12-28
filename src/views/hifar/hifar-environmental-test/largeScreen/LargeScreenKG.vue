<!--
 * @Author: 雷宇航
 * @Date: 2022-04-12 15:43:41
 * @LastEditTime: 2022-04-12 16:05:10
 * @LastEditors: 雷宇航
 * @Description:
 * @FilePath: \tdm200-client\tdm200-client\src\views\hifar\hifar-environmental-test\largeScreen\ControlSystemDev.vue
-->
<template>
  <div style="height: 100%">
    <large-screen-page ref="LargeScreenPage" :bgImg="bgImg" :title="title" style="height: 100%"></large-screen-page>
  </div>
</template>

<script>
import LargeScreenPage from './index'

export default {
  name: 'ControlSystemDev',
  components: {LargeScreenPage},
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.$refs.LargeScreenPage.pageInstalled()
    })
  },
  beforeRouteLeave(to, from, next) {
    //页面离开后关闭定时器
    this.$refs.LargeScreenPage.pageDestroyed()
    next()
  },
  data() {
    return {
      title: '设备状态',
      bgImg: [
        {img: require('./image/101-A-B1.png'), key: "4"},
        {img: require('./image/108-lx.png'), key: "5"},
        {img: require('./image/108-qh.png'), key: "6"}
      ],
    }
  },
}
</script>
