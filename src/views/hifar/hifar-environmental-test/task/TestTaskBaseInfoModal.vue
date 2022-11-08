<!--
 * @Author: 赵峰
 * @Date: 2021-11-12 14:27:35
 * @LastEditTime: 2021-11-26 14:21:39
 * @LastEditors: 马潭龙
 * @Descripttion: 试验任务--基本信息
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\TestTaskBaseInfoModal.vue
-->
<template>
  <h-modal
    :title="title + '基本信息(' + testCode + ')'"
    inner
    fullScreen
    destroyOnClose
    :visible="visible"
    :getContainer="getContainer"
    @cancel="handleCancel"
  >
    <div class="footer" slot="footer">
      <a-button @click="handleCancel" type="ghost-danger"> 关闭</a-button>
    </div>
    <a-row :gutter="24" style="margin: 0;height: 100%">
      <a-col :xl="20" :lg="24" :md="24" :sm="24" :xs="24" style="height: 100%">
        <test-base-detail ref="TestBaseDetail" :viewDetailType="viewDetailType" :testId="testId" :top='top' :showExceptionAndEnd="showExceptionAndEnd"></test-base-detail>
      </a-col>
      <a-col :xl="4" :lg="24" :md="24" :sm="24" :xs="24">
        <test-base-time-line ref="TestBaseTimeLine" style="margin-top: 46px" :testId="testId"></test-base-time-line>
      </a-col>
    </a-row>
  </h-modal>
</template>

<script>
import moment from 'moment'
import TestBaseDetail from './components/TestBaseDetail.vue'
import TestBaseTimeLine from './components/TestBaseTimeLine.vue'

export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  components: {
    TestBaseDetail,
    TestBaseTimeLine,
  },
  props: {
    showExceptionAndEnd: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      moment,
      title: '',
      visible: false,
      testId: '',
      viewDetailType: '',
      testCode: '',
      top: '',
      url: {
        detail: '/HfEnvTaskTestBusiness/queryById',
      },
    }
  },

  methods: {
    show(record, type, top) {
      this.visible = true
      this.viewDetailType = type
      this.testId = record.id
      this.top = top
      this.testCode = record.testCode
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>
<style lang='less' scoped>
</style>