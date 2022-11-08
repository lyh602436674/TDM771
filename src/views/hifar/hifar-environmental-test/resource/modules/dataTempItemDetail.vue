<!--
 * @Author: 赵峰
 * @Date: 2021-08-04 14:13:55
 * @LastEditTime: 2021-11-24 11:37:17
 * @LastEditors: 赵峰
 * @Descripttion: 模板详情
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\modules\dataTempDetail.vue
-->
<template>
  <h-modal
    title="详情"
    :visible="visible"
    inner
    :getContainer="getContainer"
    :confirm-loading="confirmLoading"
    :width="1000"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <div class="footer" slot="footer">
      <a-button @click="handleCancel" type="ghost-danger"> 关闭 </a-button>
    </div>
    <h-desc labelWidth='110px' size='small' :column='1'>
      <div slot='title' class='h-descriptions-title'>
        <span class='content'>基本信息</span>
      </div>
      <h-desc-item label='报告名称'>
        {{ detail.name ? detail.name : '--' }}
      </h-desc-item>
      <h-desc-item label='报告标签'>
        {{ detail.label ? detail.label : '--' }}
      </h-desc-item>
      <h-desc-item label='所属报告'>
        {{ detail.pName ? detail.pName : '--' }}
      </h-desc-item>
      <h-desc-item label='排序'>
        {{ detail.rowSort ? detail.rowSort : '--' }}
      </h-desc-item>
      <h-desc-item label='备注'>
        {{ detail.remarks ? detail.remarks : '--' }}
      </h-desc-item>
      <h-desc-item label="附件">
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
    config: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      visible: false,
      confirmLoading: false,
    }
  },
  methods: {
    showModal() {
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