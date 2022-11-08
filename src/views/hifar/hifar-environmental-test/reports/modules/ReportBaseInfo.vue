<!--
 * @Author: 赵峰
 * @Date: 2021-09-09 11:21:48
 * @LastEditTime: 2021-11-10 14:55:18
 * @LastEditors: 赵峰
 * @Descripttion:
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\reports\modules\ReportBaseInfo.vue
-->
<template>
  <h-desc slot="content" size="small" labelWidth="120px">
    <h-desc-item label="委托单号">
      {{ detailData.entrustNo ? detailData.entrustNo : '--' }}
    </h-desc-item>
    <h-desc-item label="委托单位">
      {{ detailData.custName ? detailData.custName : '--' }}
    </h-desc-item>
    <h-desc-item label="委托日期">
      {{
        detailData.entrustTime && detailData.entrustTime != 0
          ? moment(parseInt(detailData.entrustTime)).format('YYYY-MM-DD')
          : '--'
      }}
    </h-desc-item>
    <h-desc-item label="联系人">
      {{ detailData.custLinkName ? detailData.custLinkName : '--' }}
    </h-desc-item>
    <h-desc-item label="联系电话" >
      {{ detailData.custLinkMobile ? detailData.custLinkMobile : '--' }}
    </h-desc-item>
    <!-- <h-desc-item label="要求附件" :span="4">
      <div class="url-list" v-for="(item, index) in detailData.attachInfo" :key="index">
        <span>{{ index + 1 }}、{{ item.fileName }}</span>
        <a-button type="primary" size="small" icon="download" @click="handleDownload(item.filePath, item.fileName)"
          >下载</a-button
        >
      </div>
    </h-desc-item> -->
  </h-desc>
</template>

<script>
import moment from 'moment'
import mixin from '@/views/hifar/mixin.js'
import { getFileAccessHttpUrl, downloadFile } from '@/api/manage'
export default {
  mixins: [mixin],
  props: {
    detailDataObj: {
      type: Object,
      default: () => {},
    },
  },
  watch: {
    detailDataObj: {
      immediate: true,
      handler(val) {
        if (val) {
          this.detailData = val
        }
      },
    },
  },

  data() {
    return {
      moment,
      detailData: {},
    }
  },

  methods: {
    handleDownload(filePath, fileName) {
      let fileAccessUrl = getFileAccessHttpUrl(filePath)
      downloadFile(fileAccessUrl, fileName)
    },
  },
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