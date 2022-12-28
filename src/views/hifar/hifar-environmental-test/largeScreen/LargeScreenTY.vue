<!--
 * @Author: 雷宇航
 * @Date: 2022-04-12 15:54:06
 * @LastEditTime: 2022-04-12 16:03:59
 * @LastEditors: 雷宇航
 * @Description:
 * @FilePath: \tdm200-client\tdm200-client\src\views\hifar\hifar-environmental-test\largeScreen\HRElectricFittingCenter.vue
-->
<template>
  <div  style="height:100%">
    <large-screen-page ref="LargeScreenPage" :bgImg="bgImg" :title="title" style="height:100%"></large-screen-page>
  </div>
</template>

<script>
import LargeScreenPage from './index'

export default {
  name: 'HRElectricFittingCenter',
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
        {img: require('./image/11-1.png'), key: '1'},
        {img: require('./image/11-2.png'), key: '2'},
        {img: require('./image/11-3.png'), key: '3'}
      ],
    }
  },
}
</script>
