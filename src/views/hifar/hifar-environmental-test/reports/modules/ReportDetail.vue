<!--
 * @Author: 赵峰
 * @Date: 2021-09-09 11:24:17
 * @LastEditTime: 2021-11-10 14:56:02
 * @LastEditors: 赵峰
 * @Descripttion: 报告基本信息
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\reports\modules\ReportDetail.vue
-->
<template>
  <div class='detail-containter'>
    <!-- 委托信息 -->
    <h-collapse :extraShow='false' title='委托信息' :activeKey='activeKeyArr'>
      <!--      <div v-for='item in localDetailData.reportBaseInfo' >-->
      <report-base-info slot='content' :detailDataObj='localDetailData.reportBaseInfo'/>
      <!--      </div>-->
    </h-collapse>
    <!-- 报告信息 -->
    <h-collapse :extraShow='false' title='报告信息' :activeKey='activeKeyArr' style='margin-top: 10px'>
      <div slot='content'>
        <h-desc slot='content' size='small' labelWidth='120px'>
          <h-desc-item label='报告编号'>
            {{ localDetailData.reportCode ? localDetailData.reportCode : '--' }}
          </h-desc-item>
          <h-desc-item label='试品编号'>
            {{ localDetailData.productCode ? localDetailData.productCode : '--' }}
          </h-desc-item>
          <h-desc-item label='试验编号'>
            {{ localDetailData.testCode ? localDetailData.testCode : '--' }}
          </h-desc-item>
          <h-desc-item label='试验项目' :span='4'>
            <div slot='content' v-if='localDetailData.projectInfo'>
              <a-tag v-for='(item,index) in localDetailData.projectInfo' :key='item.id + index '>{{
                  item.unitName
                }}
              </a-tag>
            </div>
          </h-desc-item>
          <h-desc-item label='备注' :span='4'>
            <span slot='content'
                  v-html="localDetailData.remarks && localDetailData.remarks.replace(/\n/g,'<br/>')"></span>
          </h-desc-item>
        </h-desc>
      </div>
    </h-collapse>
  </div>
</template>

<script>
import mixin from '@/views/hifar/mixin.js'
import ReportBaseInfo from './ReportBaseInfo.vue'

export default {
  mixins: [mixin],
  components: {
    ReportBaseInfo
  },
  props: {
    id: {
      type: String,
      default: ''
    },
    detailData: {
      type: Object,
      default: () => {
      }
    }
  },
  watch: {
    detailData: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val.projectInfo && val.projectInfo.length) {
          this.localDetailData = Object.assign({}, {...val}, {reportBaseInfo: val.projectInfo[0]})
        }
      }
    }
  },
  data() {
    return {
      activeKeyArr: '1',
      localDetailData: {}
    }
  },
  methods: {}
}
</script>
<style lang='less' scoped>
.detail-containter {
  padding: 0 10px;
}
</style>