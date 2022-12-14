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
  </div>
</template>

<script>
import moment from 'moment'
import {postAction} from '@api/manage'

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
          return '#f5222d'
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
        if (res.code === 200) {
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