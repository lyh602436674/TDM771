<!--
 * @Author: 雷宇航
 * @Date: 2022-10-09 15:58:57
 * @fileName: DetailBaseInfo.vue
 * @FilePath: tdm724-client\src\views\hifar\hifar-environmental-test\entrustment\components\DetailBaseInfo.vue
 * @Description: 委托单基本信息
-->
<template>
  <div>
    <h-desc :data="detailData" labelWidth='160px' size='small' title='基本信息'>
      <h-desc-item label='委托单号' style="display: block">
        <template slot="content">
          <div>{{ detailData.entrustNo || '--' }}</div>
          <a-button v-if="showPreviewBtn && detailData.entrustNo" icon="eye" size="small" style="margin: 10px 0 0 10px"
                    type="primary"
                    @click="entrustReview">委托单预览
          </a-button>
          <a-button v-if="showFlowBtn && detailData.entrustNo" icon="eye" size="small" style="margin: 10px 0 0 10px"
                    type="primary"
                    @click="handleEntrustFlow">流转信息
          </a-button>
        </template>
      </h-desc-item>
      <h-desc-item v-if="viewDetailType === '2'" label='运行单号'>
        {{ detailData.entrustCode || '--' }}
      </h-desc-item>
      <h-desc-item label='委托状态'>
        <a-tag slot='content' :color='detailData.status | wtStatusColorFilter' class='status_tag'>
          {{ detailData.status | wtStatusFilter }}
        </a-tag>
      </h-desc-item>
      <h-desc-item label='委托日期'>
        {{
          detailData.entrustTime && detailData.entrustTime != 0
            ? moment(+detailData.entrustTime).format('YYYY-MM-DD')
            : '--'
        }}
      </h-desc-item>
      <h-desc-item label='密级'>
        {{ detailData.secretLevelCode_dictText || '--' }}
      </h-desc-item>
      <h-desc-item label='委托单类型'>
        {{ detailData.entrustType | entrustTypeFilter }}
      </h-desc-item>
      <h-desc-item label='要求试验时间'>
        {{
          detailData.requireTestTime && detailData.requireTestTime != 0
            ? moment(+detailData.requireTestTime).format('YYYY-MM-DD HH:mm:ss')
            : '--'
        }}
      </h-desc-item>
      <h-desc-item label='送试单位'>
        {{ detailData.custName || '--' }}
      </h-desc-item>
      <h-desc-item label="联系人">
        {{ detailData.linkName || '--' }}
      </h-desc-item>
      <h-desc-item label='联系方式'>
        {{ detailData.linkMobile || '--' }}
      </h-desc-item>
      <h-desc-item label='试验性质'>
        {{ detailData.testPropertyCode_dictText || '--' }}
      </h-desc-item>
      <h-desc-item label='优先级'>
        {{ detailData.priority_dictText || '--' }}
      </h-desc-item>
      <h-desc-item label='预计时长(h)'>
        {{ detailData.expectedTime || '--' }}
      </h-desc-item>
      <h-desc-item label='任务编码'>
        {{ detailData.outSourceCode || '--' }}
      </h-desc-item>
      <h-desc-item label='是否生成报告'>
        {{ detailData.isBuildingReport === 1 ? '是' : '否' }}
      </h-desc-item>
      <h-desc-item label='是否拍照'>
        {{ detailData.isPhotograph === 1 ? '是' : '否' }}
      </h-desc-item>
      <h-desc-item label='发起人'>
        {{ detailData.initiatorName || '--' }}
      </h-desc-item>
      <h-desc-item label='电话'>
        {{ detailData.phone || '--' }}
      </h-desc-item>
      <h-desc-item label='创建人'>
        {{ detailData.createUserName || '--' }}
      </h-desc-item>
      <h-desc-item label='创建时间'>
        {{
          detailData.createTime && detailData.createTime != 0
            ? moment(parseInt(detailData.createTime)).format('YYYY-MM-DD HH:mm:ss')
            : '--'
        }}
      </h-desc-item>
      <h-desc-item :span='3' label='测试软件/测试方法'>
        <span slot='content' v-html="spaceToBr(detailData.testMethod)"></span>
      </h-desc-item>
      <!--      <h-desc-item :span='3' label='委托单附件'>-->
      <!--        <div slot='content'>-->
      <!--          <template v-if='attachInfo && attachInfo.length'>-->
      <!--            <div v-for='(item, index) in attachInfo' :key='index' class='url-list'>-->
      <!--              <span>{{ index + 1 }}、{{ item.fileName }}</span>-->
      <!--              <a-button icon='download' size='small' type='primary'-->
      <!--                        @click='handleDownload(item.filePath, item.fileName)'>-->
      <!--                下载-->
      <!--              </a-button>-->
      <!--            </div>-->
      <!--          </template>-->
      <!--          <span v-else>暂无附件</span>-->
      <!--        </div>-->
      <!--      </h-desc-item>-->
      <h-desc-item :span='3' label='备注'>
        <span slot='content' v-html="spaceToBr(detailData.remarks)"></span>
      </h-desc-item>
    </h-desc>
    <test-entrust-review-pdf ref="testEntrustReviewPdf"/>
    <entrust-flow-info-modal ref="entrustFlowInfoModal" :entrust-id="detailData.id"></entrust-flow-info-modal>
  </div>

</template>

<script>
import moment from 'moment'
import mixin from '@/views/hifar/mixin.js'
import {downloadFile, getFileAccessHttpUrl} from '@/api/manage'
import TestEntrustReviewPdf from "@views/hifar/hifar-environmental-test/task/modules/TestEntrustReviewPdf";
import {spaceToBr} from "@/utils/util";
import EntrustFlowInfoModal from "@views/hifar/hifar-environmental-test/entrustment/modules/EntrustFlowInfoModal.vue";

export default {
  mixins: [mixin],
  props: {
    detailDataObj: {
      type: Object,
      default: () => {
      }
    },
    attachInfo: {
      type: Array,
      default: () => []
    },
    showPreviewBtn: {
      type: Boolean,
      default: false
    },
    showFlowBtn: {
      type: Boolean,
      default: false
    },
    viewDetailType: {
      type: String,
      default: "1"
    }
  },
  components: {EntrustFlowInfoModal, TestEntrustReviewPdf},
  watch: {
    detailDataObj: {
      immediate: true,
      handler(val) {
        if (val) {
          this.detailData = val
        }
      }
    }
  },
  data() {
    return {
      moment,
      spaceToBr,
      detailData: {}
    }
  },
  methods: {
    handleDownload(filePath, fileName) {
      let fileAccessUrl = getFileAccessHttpUrl(filePath)
      downloadFile(fileAccessUrl, fileName)
    },
    entrustReview() {
      this.$refs.testEntrustReviewPdf.show(this.detailData.reportPath)
    },
    handleEntrustFlow() {
      this.$refs.entrustFlowInfoModal.show()
    },
  }
}
</script>
<style lang='less' scoped>
.url-list {
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  span {
    margin-right: 10px;
  }
}
</style>