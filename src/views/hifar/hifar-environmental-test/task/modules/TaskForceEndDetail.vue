<!--
 * @Author: 赵峰
 * @Date: 2021-11-03 09:39:28
 * @LastEditTime: 2021-11-09 15:14:25
 * @LastEditors: 赵峰
 * @Descripttion: 试验终止详情弹窗
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\TaskForceEndDetail.vue
-->
<template>
  <h-modal
    inner
    fullScreen
    :title="title + '(' + testDetailData.testCode + ')'"
    :getContainer="getModalContainer"
    :visible="visible"
    destroyOnClose
    @cancel="handleCancel"
  >
    <div class="footer" slot="footer">
      <a-button @click="handleCancel" type="ghost-danger"> 关闭 </a-button>
    </div>
    <h-card title="试验信息" fixed :showCollapse="true">
      <h-descriptions bordered style="width: 100%" size="small">
        <a-descriptions-item
          v-for="(item, index) in testData"
          :span="item.span ? item.span : 1"
          :key="index"
          :label="item.title"
        >
          {{
            item.isTime
              ? parseFloat(item.value) == 0
                ? '--'
                : moment(parseFloat(item.value)).format('YYYY-MM-DD HH:mm:ss')
              : item.value
              ? item.value
              : '--'
          }}
        </a-descriptions-item>
      </h-descriptions>
    </h-card>
    <h-card title="设备信息" fixed :showCollapse="true">
      <h-descriptions bordered style="width: 100%" size="small">
        <a-descriptions-item label="设备编号"> {{ testDetailData.equipCode || '--' }}</a-descriptions-item>
        <a-descriptions-item label="设备名称"> {{ testDetailData.equipName || '--' }}</a-descriptions-item>
        <a-descriptions-item label="设备类型"> {{ testDetailData.equipTypeCode_dictText || '--' }}</a-descriptions-item>
        <a-descriptions-item label="内部名称"> {{ testDetailData.innerName || '--' }}</a-descriptions-item>
        <a-descriptions-item label="负责人"> {{ testDetailData.managerName || '--' }}</a-descriptions-item>
        <a-descriptions-item label="设备型号"> {{ testDetailData.equipModel || '--' }}</a-descriptions-item>
      </h-descriptions>
    </h-card>
    <h-card title="终止信息" fixed :showCollapse="true">
      <h-descriptions bordered style="width: 100%" size="small">
        <a-descriptions-item label="记录人"> {{ detailData.recordUserName || '--' }}</a-descriptions-item>
        <a-descriptions-item label="记录时间" :span="4">
          {{
            detailData.recordTime && detailData.recordTime != 0
              ? moment(parseInt(detailData.recordTime)).format('YYYY-MM-DD HH:mm')
              : '--'
          }}</a-descriptions-item
        >
        <a-descriptions-item label="终止说明"> {{ detailData.forceEndDesc || '--' }}</a-descriptions-item>
      </h-descriptions>
    </h-card>
    <h-card title="附件信息" fixed :showCollapse="true">
      <template v-if="attachInfo.length">
        <div class="url-list" v-for="(item, index) in detailData.attachInfo" :key="index">
          <span>{{ index + 1 }}、{{ item.fileName }}</span>
          <a-button type="primary" size="small" icon="download" @click="handleDownload(item.filePath, item.fileName)"
            >下载</a-button
          >
        </div>
      </template>
      <div v-else style="width: 100%; display: flex; align-item: center; justify-content: center">
        <a-empty description="暂无附件信息" />
      </div>
    </h-card>
  </h-modal>
</template>

<script>
import moment from 'moment'
import { postAction, getFileAccessHttpUrl, downloadFile } from '@/api/manage'

export default {
  name: 'TaskForceEndDetail',
  data() {
    return {
      moment,
      title: '',
      visible: false,
      model: {},
      testData: [
        { title: '试验设备', key: 'equipName', value: '' },
        { title: '设备速率', key: 'testRate', value: '' },
        { title: '预计开始时间', key: 'predictStartTime', value: '', isTime: true },
        { title: '预计结束时间', key: 'predictEndTime', value: '', isTime: true },
        { title: '实际开始时间', key: 'realStartTime', value: '', isTime: true },
        { title: '实际结束时间', key: 'realEndTime', value: '', isTime: true },
        { title: '预计时长(h)', key: 'predictUseTime', value: '' },
        { title: '实际时长(h)', key: 'realUseTime', value: '' },
        { title: '试验员', key: 'chargeUserName', value: '' },
      ],
      url: {
        detail: '/HfEnvTestForceEndBusiness/queryById',
        testDetail: '/HfEnvTaskTestBusiness/queryById',
      },
      detailData: {},
      testDetailData: {},
      attachInfo: [],
    }
  },
  methods: {
    getModalContainer() {
      return document.getElementById('page-content')
    },
    handleDownload(filePath, fileName) {
      let fileAccessUrl = getFileAccessHttpUrl(filePath)
      downloadFile(fileAccessUrl, fileName)
    },
    show(record, testId) {
      this.visible = true
      this.loadDetail(record.id)
      this.getTestDetail(testId)
    },
    handleCancel() {
      this.visible = false
    },
    loadDetail(id) {
      postAction(this.url.detail, { id: id }).then((res) => {
        if (res.code == 200) {
          const { data } = res
          this.title = (data.testNames ? data.testNames : '') + '-终止记录详情'
          this.detailData = data
          this.attachInfo = data.attachInfo
        }
      })
    },
    getTestDetail(testId) {
      postAction(this.url.testDetail, { id: testId }).then((res) => {
        if (res.code == 200) {
          for (let item in res.data) {
            for (let i = 0; i < this.testData.length; i++) {
              if (item === this.testData[i].key) {
                this.testData[i].value = res.data[item]
              }
            }
          }
          this.testDetailData = res.data
        }
      })
    },
  },
}
</script>
<style lang="less" scoped>
/deep/ .h-card-wrapper {
  height: auto;
}
.url-list {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  span {
    margin-right: 10px;
  }
}
</style>
