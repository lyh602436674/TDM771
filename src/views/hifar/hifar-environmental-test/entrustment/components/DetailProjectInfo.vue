<!--
 * @Author: 赵峰
 * @Date: 2021-09-18 09:56:30
 * @Descripttion: 委托管理--详情-项目信息
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\entrustment\components\DetailProjectInfo.vue
-->
<template>
  <h-desc :bordered="false" size="small" title="项目信息">
    <h-card v-for="(item, index) in projectInfo" :key="index" style="margin-bottom: 10px">
      <div slot="title">{{ item.unitName }}</div>
      <template slot="content">
        <project-detail-template :model="item" title=""></project-detail-template>
      </template>
    </h-card>
  </h-desc>
</template>

<script>
import moment from 'moment'
import ProjectDetailTemplate from "@views/hifar/hifar-environmental-test/entrustment/components/ProjectDetailTemplate";

export default {
  components: {ProjectDetailTemplate},
  data() {
    return {
      moment,
      projectInfo: [],
    }
  },
  props: {
    projectInfoArr: [Array],
  },
  watch: {
    projectInfoArr: {
      deep: true,
      immediate: true,
      handler(val) {
        if (val) {
          this.projectInfo = val
        }
      },
    },
  },

  created() {
  },
  methods: {},
}
</script>

<style lang="less" scoped>
.url-list {
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  span {
    margin-right: 10px;
  }

}
</style>