<!--
 * @Author: 赵峰
 * @Date: 2021-08-24 11:05:12
 * @LastEditTime: 2021-11-10 14:16:28
 * @LastEditors: 赵峰
 * @Descripttion: 意见详情
 * @FilePath: \hifar-platform-client\src\views\hifar\comments\modules\CommentsDetail.vue
-->
<template>
  <h-modal
    title="意见详情"
    inner
    fullScreen
    destroyOnClose
    :getContainer="getContainer"
    :visible="visible"
    @cancel="handleCancel"
  >
    <div class="footer" slot="footer">
      <a-button @click="handleCancel" type="ghost-danger"> 关闭 </a-button>
    </div>
    <h-card :bordered="true" style="overflow-y: auto">
      <h-desc :data="detailData" size="small" labelWidth="110px" :column="1">
        <h-desc-item label="所属模块">
          {{ detailData.suggestModuleName ? detailData.suggestModuleName : '--' }}
        </h-desc-item>
        <h-desc-item label="问题类型">
          {{ detailData.suggestTypeName ? detailData.suggestTypeName : '--' }}
        </h-desc-item>
        <h-desc-item label="状态">
          <a-tag slot="content" class="status_tag" :color="detailData.status | dealStatusColorFilter">
            {{ detailData.status | dealStatusFilter }}
          </a-tag>
        </h-desc-item>
        <h-desc-item label="提出人">
          {{ detailData.suggestUserName ? detailData.suggestUserName : '--' }}
        </h-desc-item>
        <h-desc-item label="提出时间">
          {{
            detailData.suggestTime && detailData.suggestTime != 0
              ? moment(parseInt(detailData.suggestTime)).format('YYYY-MM-DD HH:mm:ss')
              : '--'
          }}
        </h-desc-item>
        <h-desc-item label="创建人">
          {{ detailData.createUserName ? detailData.createUserName : '--' }}
        </h-desc-item>
        <h-desc-item label="创建时间">
          {{
            detailData.createTime && detailData.createTime != 0
              ? moment(parseInt(detailData.createTime)).format('YYYY-MM-DD HH:mm:ss')
              : '--'
          }}
        </h-desc-item>
        <h-desc-item label="问题描述">
          <div slot="content" v-html="detailData.suggestContent"></div>
        </h-desc-item>
        <h-desc-item label="处理人">
          {{ detailData.dealUserName ? detailData.dealUserName : '--' }}
        </h-desc-item>
        <h-desc-item label="处理时间">
          {{
            detailData.dealTime && detailData.dealTime != 0
              ? moment(parseInt(detailData.dealTime)).format('YYYY-MM-DD HH:mm:ss')
              : '--'
          }}
        </h-desc-item>
        <h-desc-item label="附件">
          <div slot="content">
            <div class="url-list" v-for="(item, index) in detailData.attachInfo" :key="index">
              <span>{{ index + 1 }}、{{ item.fileName }}</span>
              <a-button
                type="primary"
                size="small"
                icon="download"
                @click="handleDownload(item.filePath, item.fileName)"
              >
                下载
              </a-button>
            </div>
          </div>
        </h-desc-item>
      </h-desc>
    </h-card>
  </h-modal>
</template>

<script>
import moment from 'moment'
import { postAction, getFileAccessHttpUrl, downloadFile } from '@/api/manage'
import mixin from '@/views/hifar/mixin.js'
export default {
  mixins: [mixin],
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },

  data() {
    return {
      moment,
      visible: false,
      detailData: {},
      url: {
        detailById: '/BaseUserSuggestBusiness/queryById',
      },
    }
  },

  methods: {
    show(record) {
      this.visible = true
      this.loadDetail(record.id)
    },
    handleCancel() {
      this.visible = false
    },
    loadDetail(id) {
      postAction(this.url.detailById, { id: id }).then((res) => {
        if (res.code == 200) {
          let record = res.data
          this.detailData = record
        }
      })
    },
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