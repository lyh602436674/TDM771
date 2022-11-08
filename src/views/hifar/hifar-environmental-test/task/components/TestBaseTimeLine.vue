<!--
 * @Author: 赵峰
 * @Date: 2021-11-12 16:40:51
 * @LastEditTime: 2021-11-30 16:19:04
 * @LastEditors: 马潭龙
 * @Descripttion: 试验动态
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\components\TestBaseTimeLine.vue
-->
<template>
  <div>
    <a-timeline>
      <a-timeline-item v-for="(item, index) in timeLineData" :key="index" :color="item.optType | testColorFilter">
        <p>{{ item.optType | testStatusFilter }}</p>
        <p>
          {{ item.optTime && item.optTime != 0 ? moment(parseInt(item.optTime)).format('YYYY-MM-DD HH:mm:ss') : '--' }}
        </p>
        <p>{{ item.createUserName }}</p>
      </a-timeline-item>
    </a-timeline>
    <!-- 电梯层 -->
<!--    <a-anchor :target-offset="targetOffset" class="test-Base-anchor" :get-current-anchor="getCurrentAnchor">
      <a-anchor-link href="#basicInfo" title="基本信息" />
      <a-anchor-link href="#projectInfo" title="项目信息" />
      <a-anchor-link href="#testInfo" title="试验信息" />
      <a-anchor-link href="#testBeforCheck" title="试前检查" />
      <a-anchor-link href="#testInCheck" title="试中检查" />
      <a-anchor-link href="#testAfterCheck" title="试后检查" />
      <a-anchor-link href="#testData" title="试验数据">
        <a-anchor-link href="#imageForm" title="图片" />
        <a-anchor-link href="#curveForm" title="曲线" />
        <a-anchor-link href="#atlasForm" title="图谱" />
        <a-anchor-link href="#attachForm" title="附件" />
        <a-anchor-link href="#videoForm" title="视频" />
      </a-anchor-link>
    </a-anchor>-->
  </div>
</template>

<script>
import moment from 'moment'
import { postAction } from '@api/manage'
export default {
  components: {},
  props: {
    testId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      targetOffset: undefined,
      moment,
      url: '/HfEnvTaskTestRecordBusiness/listAll',
      timeLineData: [],
    }
  },
  // 电梯层,默认显示在屏幕中间
  mounted() {
    this.targetOffset = window.innerHeight / 2
  },
  watch: {
    testId: {
      immediate: true,
      handler(val) {
        if (val) {
          this.loadLineTimeData(val)
        }
      },
    },
  },
  filters: {
    testStatusFilter(txt) {
      switch (txt) {
        case 'create':
          return '创建'
        case 'recover':
          return '撤销'
        case 'start':
          return '开始'
        case 'suspend':
          return '暂停'
        case 'exception':
          return '异常'
        case 'clearException':
          return '异常解除'
        case 'forceEndApply':
          return '申请终止'
        case 'forceEndRefuse':
          return '终止申请驳回'
        case 'forceEnd':
          return '终止'
        case 'finish':
          return '完成'
        case 'remove':
          return '删除'
      }
    },
    testColorFilter(txt) {
      switch (txt) {
        case 'create':
          return '#108ee9'
        case 'recover':
          return 'volcano'
        case 'start':
          return 'green'
        case 'suspend':
          return 'red'
        case 'exception':
          return 'red'
        case 'clearException':
          return 'green'
        case 'forceEndApply':
          return 'green'
        case 'forceEndRefuse':
          return 'red'
        case 'forceEnd':
          return '#108ee9'
        case 'finish':
          return '#108ee9'
        case 'remove':
          return 'red'
      }
    },
  },
  methods: {
    getCurrentAnchor() {
      return '#testData';
    },
    loadLineTimeData(taskTestId) {
      postAction(this.url, { taskTestId: taskTestId }).then((res) => {
        if (res.code == 200) {
          const { data } = res
          this.timeLineData = data
        }
      })
    },
  },
}
</script>
<style lang='less' scoped>
.test-Base-anchor {
  position: fixed;
  bottom: 100px;
  right: 40px;
}
</style>