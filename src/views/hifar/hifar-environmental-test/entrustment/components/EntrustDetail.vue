<!--
 * @Author: 赵峰
 * @Date: 2021-09-18 09:53:53
 * @LastEditTime: 2021-11-18 18:06:34
 * @LastEditors: 赵峰
 * @Descripttion: 委托单详情页面组件
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\entrustment\components\EntrustDetail.vue
-->
<template>
  <div class="entrust-detail">
    <!-- 委托信息 -->
    <detail-base-info id="entrust" :viewDetailType="viewDetailType" :detailDataObj="detailData"></detail-base-info>
    <!--样品信息-->
    <piece-detail-template id="product" :dataSource="detailData.pieceInfo"/>
    <!-- 项目信息 -->
    <detail-project-info
      id="project"
      :projectInfoArr="detailData && detailData.projectInfo ? detailData.projectInfo : []"
      style="margin-top: 15px"
    ></detail-project-info>
    <hf-elevator-layer :layer-columns="layerColumns"></hf-elevator-layer>
  </div>
</template>

<script>
import DetailBaseInfo from './DetailBaseInfo.vue'
import DetailProjectInfo from './DetailProjectInfo.vue'
import PieceDetailTemplate from "@views/hifar/hifar-environmental-test/entrustment/components/PieceDetailTemplate";
import HfElevatorLayer from "@comp/HfElevatorLayer";

export default {
  components: {
    PieceDetailTemplate,
    DetailBaseInfo,
    DetailProjectInfo,
    HfElevatorLayer
  },
  props: {
    detailData: {
      type: Object,
      default: () => {
      },
    },
    viewDetailType: {
      type: String,
      default: '1'
    }
  },
  watch: {
    detailData: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val && Object.keys(val).length) {
          this.buildLayer(val.projectInfo)
        }
      }
    }
  },
  data() {
    return {
      layerColumns: [],
    }
  },

  methods: {
    buildLayer(column) {
      let defaultLayer = [
        {
          title: "委托信息",
          id: "entrust"
        },
        {
          title: "产品信息",
          id: "product"
        },
        {
          title: "项目信息",
          id: "project"
        },
      ]
      this.layerColumns = []
      column && column.length && column.forEach((item, index) => {
        defaultLayer.push({
          title: item.unitName || item.testName,
          id: 'projectItem' + index
        })
      })
      this.layerColumns = defaultLayer
    },
  },
}
</script>
<style lang='less' scoped>
</style>