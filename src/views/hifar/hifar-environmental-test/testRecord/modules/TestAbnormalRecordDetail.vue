<!--
 * @Author: 赵峰
 * @Date: 2021-11-03 15:45:27
 * @LastEditTime: 2021-11-10 14:50:48
 * @LastEditors: 赵峰
 * @Descripttion: 试验异常记录详情
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\testRecord\modules\TestAbnormalRecordDetail.vue
-->
<template>
  <h-modal
    inner
    fullScreen
    :title="title"
    :getContainer="getModalContainer"
    :visible="visible"
    destroyOnClose
    @cancel="handleCancel"
  >
    <div class="footer" slot="footer">
      <a-button @click="handleCancel" type="ghost-danger"> 关闭 </a-button>
    </div>
    <h-card title="试验信息" fixed :showCollapse="true">
      <h-desc slot="content" size="small" labelWidth="120px">
        <h-desc-item
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
        </h-desc-item>
      </h-desc>
    </h-card>
    <h-card title="设备信息" fixed :showCollapse="true">
      <h-desc slot="content" size="small" labelWidth="120px">
        <h-desc-item label="设备编号"> {{ testDetailData.equipCode || '--' }}</h-desc-item>
        <h-desc-item label="设备名称"> {{ testDetailData.equipName || '--' }}</h-desc-item>
        <h-desc-item label="设备类型"> {{ testDetailData.equipTypeCode_dictText || '--' }}</h-desc-item>
        <h-desc-item label="内部名称"> {{ testDetailData.innerName || '--' }}</h-desc-item>
        <h-desc-item label="负责人"> {{ testDetailData.managerName || '--' }}</h-desc-item>
        <h-desc-item label="设备型号"> {{ testDetailData.equipModel || '--' }}</h-desc-item>
      </h-desc>
    </h-card>

    <h-card title="异常记录" fixed :showCollapse="true">
      <h-desc slot="content" size="small" labelWidth="120px" :column='1'>
        <h-desc-item label="异常类型">
          <div slot="content">
            <span v-if="detailData.exceptionType == 1">设备异常</span>
            <span v-if="detailData.exceptionType == 2">样品异常</span>
            <span v-if="detailData.exceptionType == 3">动力异常</span>
          </div>
        </h-desc-item>
        <h-desc-item label="试验样品" v-if="detailData.exceptionType == 2">
          {{ detailData.pieceNo || '--' }}
        </h-desc-item>
        <h-desc-item label="记录人"> {{ detailData.recordUserName || '--' }}</h-desc-item>
        <h-desc-item label="记录时间">
          {{
            detailData.recordTime && detailData.recordTime != 0
              ? moment(parseInt(detailData.recordTime)).format('YYYY-MM-DD HH:mm')
              : '--'
          }}
        </h-desc-item>
        <h-desc-item label="异常说明"> {{ detailData.exceptionDesc || '--' }}</h-desc-item>
      </h-desc>
    </h-card>
    <h-card title="处理记录" fixed :showCollapse="true">
      <h-desc slot="content" size="small" labelWidth="120px">
        <h-desc-item label="处理状态">
          <template slot="content">
            <a-badge v-if="detailData.dealStatus == 1" color="red" text="未处理" />
            <a-badge v-if="detailData.dealStatus == 3" color="green" text="已处理" />
          </template>
        </h-desc-item>
        <h-desc-item label="处理人"> {{ detailData.dealUserName || '--' }}</h-desc-item>
        <h-desc-item label="处理时间" :span="4">
          {{
            detailData.dealTime && detailData.dealTime != 0
              ? moment(parseInt(detailData.dealTime)).format('YYYY-MM-DD HH:mm')
              : '--'
          }}
        </h-desc-item>
        <h-desc-item label="处理结果"> {{ detailData.dealDesc || '--' }}</h-desc-item>
      </h-desc>
    </h-card>
    <h-card title="附件信息" fixed :showCollapse="true">
      <template v-if="attachInfo.length > 0">
        <div class="url-list" v-for="(item, index) in detailData.attachInfo" :key="index">
          <span>{{ index + 1 }}、{{ item.fileName }}</span>
          <a-button type="primary" size="small" icon="download" @click="handleDownload(item.filePath, item.fileName)">
            下载
          </a-button>
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
        { title: '费用（元）', key: 'testCost', value: '' },
        { title: '预计开始时间', key: 'predictStartTime', value: '', isTime: true },
        { title: '预计结束时间', key: 'predictEndTime', value: '', isTime: true },
        { title: '实际开始时间', key: 'realStartTime', value: '', isTime: true },
        { title: '实际结束时间', key: 'realEndTime', value: '', isTime: true },
        { title: '预计时长(h)', key: 'predictUseTime', value: '' },
        { title: '实际时长(h)', key: 'realUseTime', value: '' },
        { title: '试验员', key: 'chargeUserName', value: '' },
      ],
      url: {
        detail: '/HfEnvTestExceptionBusiness/queryById',
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
    show(record) {
      this.visible = true
      this.loadDetail(record.id)
      this.getTestDetail(record.testId)
    },
    handleCancel() {
      this.visible = false
    },
    loadDetail(id) {
      postAction(this.url.detail, { id: id }).then((res) => {
        if (res.code == 200) {
          const { data } = res
          this.title = (data.testNames ? data.testNames : '') + '-异常记录详情'
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
