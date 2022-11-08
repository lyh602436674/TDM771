<!--
 * @Author: 赵峰
 * @Date: 2021-08-02 14:23:46
 * @LastEditTime: 2021-11-10 15:48:00
 * @LastEditors: 马潭龙
 * @Descripttion: 方法详情
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\methods\modules\methodsDetail.vue
-->
<template>
  <h-modal
    title="详情"
    :visible="visible"
    :confirm-loading="confirmLoading"
    :width="1000"
    inner
    :getContainer="getContainer"
    @cancel="handleCancel"
  >
    <div class="footer" slot="footer">
      <a-button @click="handleCancel" type="ghost-danger"> 关闭 </a-button>
    </div>
    <h-desc size="small" :column="2" labelWidth="110px" title="基本信息">
      <h-desc-item label="标准编号">
        {{ detail.standardCode ? detail.standardCode : '--' }}
      </h-desc-item>
      <h-desc-item label="方法名称">
        {{ detail.standardName ? detail.standardName : '--' }}
      </h-desc-item>
      <h-desc-item label="方法类别">
        {{ detail.standardTypeName ? detail.standardTypeName : '--' }}
      </h-desc-item>
      <h-desc-item label="发布机构">
        {{ detail.publishOrg ? detail.publishOrg : '--' }}
      </h-desc-item>
      <h-desc-item label="发布时间">
        {{
          detail.publishTime && detail.publishTime != 0
            ? moment(parseInt(detail.publishTime)).format('YYYY-MM-DD')
            : '--'
        }}
      </h-desc-item>
      <h-desc-item label="使用时间">
        {{ detail.useTime && detail.useTime != 0 ? moment(parseInt(detail.useTime)).format('YYYY-MM-DD') : '--' }}
      </h-desc-item>
      <h-desc-item label="备注" :span="4">
        {{ detail.remarks ? detail.remarks : '--' }}
      </h-desc-item>
      <h-desc-item label="附件" :span="4">
        <div slot="content" class="url-list" v-for="(item, index) in detail.attachInfo" :key="index">
          <span>{{ index + 1 }}、{{ item.fileName }}</span>
          <a-button type="primary" size="small" icon="download" @click="handleDownload(item.filePath, item.fileName)"
            >下载</a-button
          >
        </div>
      </h-desc-item>
    </h-desc>
  </h-modal>
</template>
<script>
import { downloadFile, getFileAccessHttpUrl } from '@/api/manage'
import moment from 'moment'
export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  props: {
    detail: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      moment,
      visible: false,
      confirmLoading: false,
    }
  },
  methods: {
    show(record) {
      this.visible = true
    },
    handleCancel(e) {
      this.visible = false
    },
    handleDownload(filePath, fileName) {
      let fileAccessUrl = getFileAccessHttpUrl(filePath)
      downloadFile(fileAccessUrl, fileName)
    },
  },
}
</script>
<style lang="less" scoped>
/deep/ .ant-descriptions-title {
  margin-bottom: 0;
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