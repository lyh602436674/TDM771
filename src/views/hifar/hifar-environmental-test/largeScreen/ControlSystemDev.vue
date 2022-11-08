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
    <large-screen-page style="height: 100%" :title="title" :bgImg="bgImg"></large-screen-page>
  </div>
</template>

<script>
import LargeScreenPage from './index'
export default {
  name: 'ControlSystemDev',
  components: { LargeScreenPage },
  data() {
    return {
      title: '设备状态',
      // bgImg: require('./image/kzxt.png'),
    }
  },
}
</script>
