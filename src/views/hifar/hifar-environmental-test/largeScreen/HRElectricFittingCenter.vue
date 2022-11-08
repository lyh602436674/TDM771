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
    <large-screen-page style="height:100%" :title="title" :bgImg="bgImg"></large-screen-page>
  </div>
</template>

<script>
import LargeScreenPage from './index'
export default {
  name: 'HRElectricFittingCenter',
  components: { LargeScreenPage },
  data() {
    return {
      title: '怀柔电装中心配楼',
      // bgImg: require('./image/hrdz.png'),
    }
  },
}
</script>
