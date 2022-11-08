<!--
 * @Author: 赵峰
 * @Date: 2021-09-01 09:22:07
 * @LastEditTime: 2021-11-29 15:51:31
 * @LastEditors: 马潭龙
 * @Descripttion:
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\equipment\modules\EquipmentBaseInfo.vue
-->
<template>
  <div style="padding: 5px 15px">
    <div class="info_containter">
      <a-descriptions bordered size="small" style="width: 100%">
        <div slot="title" class="h-descriptions-title">
          <span class="content">基本信息</span>
        </div>
        <a-descriptions-item label="设备名称">
          {{ detailData.equipName ? detailData.equipName : '--' }}
        </a-descriptions-item>
        <a-descriptions-item label="设备编号">
          {{ detailData.equipCode ? detailData.equipCode : '--' }}
        </a-descriptions-item>
        <a-descriptions-item label="设备用途">
          {{ detailData.equipUse_dictText || '--' }}
        </a-descriptions-item>
        <a-descriptions-item label="设备类型">
          {{ detailData.equipTypeCode_dictText ? detailData.equipTypeCode_dictText : '--' }}
        </a-descriptions-item>
        <a-descriptions-item label="内部名称">
          {{ detailData.innerName ? detailData.innerName : '--' }}
        </a-descriptions-item>
        <a-descriptions-item label="资产编号">
          {{ detailData.assetsCode ? detailData.assetsCode : '--' }}
        </a-descriptions-item>
        <a-descriptions-item label="出厂编号">
          {{ detailData.leaveCode ? detailData.leaveCode : '--' }}
        </a-descriptions-item>
        <a-descriptions-item label="生产厂家">
          {{ detailData.factoryName ? detailData.factoryName : '--' }}
        </a-descriptions-item>
        <a-descriptions-item label="购买日期">
          {{
            detailData.buyTime && detailData.buyTime != 0
              ? moment(parseInt(detailData.buyTime)).format('YYYY-MM-DD')
              : '--'
          }}
        </a-descriptions-item>
        <a-descriptions-item label="负责人">
          {{ detailData.managerName ? detailData.managerName : '--' }}
        </a-descriptions-item>
        <a-descriptions-item label="设备型号">
          {{ detailData.equipModel ? detailData.equipModel : '--' }}
        </a-descriptions-item>
        <a-descriptions-item label="设备状态">
          {{ detailData.status_dictText || '--' }}
        </a-descriptions-item>
        <a-descriptions-item label="使用部门">
          {{ detailData.userDeptName ? detailData.userDeptName : '--' }}
        </a-descriptions-item>
        <a-descriptions-item label="设备能力">
          {{ detailData.equipBaseProjectNames ? detailData.equipBaseProjectNames : '--' }}
        </a-descriptions-item>
        <a-descriptions-item label="检定编号">
          {{ detailData.checkCode ? detailData.checkCode : '--' }}
        </a-descriptions-item>
        <a-descriptions-item label="计量有效期">
          {{
            detailData.checkValid && detailData.checkValid != 0
              ? moment(parseInt(detailData.checkValid)).format('YYYY-MM-DD')
              : '--'
          }}
        </a-descriptions-item>
        <a-descriptions-item label="计量周期">
          {{ detailData.checkPeriod ? detailData.checkPeriod : '--' }}
          {{
            detailData.checkUnit == 1 ? '日' : detailData.checkUnit == 2 ? '月' : detailData.checkUnit == 3 ? '年' : ''
          }}
        </a-descriptions-item>
        <a-descriptions-item label="技术参数">
          <a-textarea v-model="detailData.technology" readOnly/>
        </a-descriptions-item>
        <a-descriptions-item label="排序">
          {{ detailData.rowSort || '--' }}
        </a-descriptions-item>
        <a-descriptions-item :span="3" label="备注">
          <a-textarea v-model="detailData.remarks" readOnly/>
        </a-descriptions-item>
      </a-descriptions>
      <viewer :url="detailData.imgUrl">
        <img :src="detailData.imgUrl" alt="" class="h-upload-img-wrapper" style="cursor: pointer"/>
      </viewer>
    </div>
    <div v-if="detailData.attachInfo.length>0" style="margin-top: 10px">
      <div class="h-descriptions-title">
        <span class="content">附件</span>
      </div>
      <div v-for="(item, index) in detailData.attachInfo" :key="index" class="url-list">
        <span>{{ index + 1 }}、{{ item.fileName }}</span>
        <a-button icon="download" size="small" type="primary" @click="handleDownload(item.filePath, item.fileName)"
        >下载
        </a-button
        >
      </div>
      <a-empty v-if="detailData.attachInfo.length == 0" style="margin-top: 100px"></a-empty>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import mixin from '@/views/hifar/mixin.js'
import {downloadFile, getFileAccessHttpUrl} from '@/api/manage'

export default {
  mixins: [mixin],
  components: {},
  props: {
    detailData: {
      type: Object,
      default: () => {
      },
    },
  },
  watch: {
    detailData: {
      immediate: true,
      handler(val) {
        this.detailData = val
      },
    },
  },
  data() {
    return {
      moment,
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
.info_containter {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  .h-upload-img-wrapper {
    margin: 0;
    margin-left: 10px;
    margin-top: 30px;
  }
}

.url-list {
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  span {
    margin-right: 10px;
  }
}

.h-descriptions-title {
  margin-bottom: 10px !important;
  display: block;
  width: 100%;
  padding: 0;
  color: rgba(0, 0, 0, 0.45);
  font-size: 16px;
  line-height: inherit;
  border: 0;
  border-bottom: 1px solid #d9d9d9;
  font-weight: 400;

  .content {
    float: left;
    vertical-align: middle;
    margin-bottom: 5px;
  }
}
</style>