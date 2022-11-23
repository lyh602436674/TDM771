<!--
 * @Author: 赵峰
 * @Date: 2021-09-18 09:53:53
 * @LastEditTime: 2021-11-18 18:06:34
 * @LastEditors: 赵峰
 * @Descripttion: 委托单详情页面组件
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\entrustment\components\EntrustDetail.vue
-->
<template>
  <div class="detail-containter">
    <!-- 委托信息 -->
    <detail-base-info :detailDataObj="detailData"></detail-base-info>
    <!--样品信息-->
    <piece-detail-template :dataSource="detailData.pieceInfo"/>
    <!-- 项目信息 -->
    <detail-project-info
      :projectInfoArr="detailData && detailData.projectInfo ? detailData.projectInfo : []"
      style="margin-top: 15px"
    ></detail-project-info>
  </div>
</template>

<script>
import DetailBaseInfo from './DetailBaseInfo.vue'
import DetailProjectInfo from './DetailProjectInfo.vue'
import PieceDetailTemplate from "@views/hifar/hifar-environmental-test/entrustment/components/PieceDetailTemplate";

export default {
  components: {
    PieceDetailTemplate,
    DetailBaseInfo,
    DetailProjectInfo,
  },
  props: {
    detailData: {
      type: Object,
      default: () => {
      },
    },
  },
  data() {
    return {}
  },

  methods: {},
}
</script>
<style lang='less' scoped>
</style>