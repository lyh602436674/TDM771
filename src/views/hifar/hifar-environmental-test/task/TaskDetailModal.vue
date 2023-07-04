<!--
 * @Author: 赵峰
 * @Date: 2021-11-04 16:32:54
 * @LastEditTime: 2021-11-12 14:28:22
 * @LastEditors: 赵峰
 * @Descripttion: 设备试验任务详情
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\TaskDetailModal.vue
-->
<template>
  <h-modal
    :title="title + '详情'"
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
    <div class="equip-task-detail-wrapper">
      <a-tabs v-model="activeTab" style="width: 100%" type="card" @change="handleTabsChange">
        <!--        <a-tab-pane :key="1" tab="基本信息"/>-->
        <a-tab-pane :key="1" tab="试验记录"/>
        <a-tab-pane :key="2" tab="试验检查"/>
        <!--        <a-tab-pane :key="3" tab="试验记录"/>-->
        <a-tab-pane :key="4" tab="试验数据"/>
        <a-tab-pane :key="5" tab="异常记录"/>
        <a-tab-pane :key="6" tab="终止记录"/>
      </a-tabs>
      <div class="detail-modal-box">
        <div class="detail-modal-content">
          <test-base-info
            v-if="activeTab === 1"
            ref="TestBaseInfo"
            :basicData="basicData"
            :entrustType="entrustType"
            :testTaskData="testTaskData"
            :projectData="projectData"
            :productTable="productTable"
            :installControlTable="installControlTable"
            :switchRecordingTable="switchRecordingTable"
            :testRecordArr="testRecordArr"
            :personArr="personArr"
            :equipData="equipData"
            :toolsProductData="toolsProductData"
            :pictureData="pictureData"
          />
          <test-task-check v-if="activeTab === 2" ref="TestTaskCheck" :testId="testId"></test-task-check>
          <!--          <vibration-table v-if="activeTab === 3" ref="VibrationTable" :record="records"></vibration-table>-->
          <test-task-data v-if="activeTab === 4" ref="TestData" :testId="testId"></test-task-data>
          <abnormal-record-table v-if="activeTab === 5" ref="AbnormalRecordTable" :records="records"/>
          <termination-record-table v-if="activeTab === 6" ref="TerminationRecordTable" :records="records"/>
        </div>
      </div>
    </div>
  </h-modal>
</template>
<script>
import {downloadFile, getFileAccessHttpUrl, postAction} from '@api/manage'
import moment from 'moment'
import TestBaseInfo from './modules/components/detail/TestBaseInfo'
import AbnormalRecordTable from './modules/components/detail/AbnormalRecordTable'
import TerminationRecordTable from './modules/components/detail/TerminationRecordTable'
import TestTaskData from './modules/components/detail/TestTaskData'
import TestTaskCheck from './modules/components/detail/TestTaskCheck'
import VibrationTable from './modules/components/detail/VibrationTable'

export default {
  props: {
    entrustType: {
      type: String,
      default: '1',
    },
  },
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  components: {
    TestBaseInfo,
    AbnormalRecordTable,
    TerminationRecordTable,
    TestTaskData,
    TestTaskCheck,
    VibrationTable
  },
  data() {
    return {
      moment,
      title: '',
      visible: false,
      activeTab: 1,
      url: {
        detail: '/HfEnvTaskTestBusiness/queryById',
        attachList: '/MinioBusiness/listByRefId',
      },
      basicData: [
        {title: '试验设备', key: 'equipName', value: ''},
        {title: '试验人员', key: 'chargeUserName', value: ''},
        {title: '入场时间', key: 'approachTime', value: '', isTime: true},
        {title: '离场时间', key: 'departureTime', value: '', isTime: true},
        {title: '开始时间', key: 'realStartTime', value: '', isTime: true},
        {title: '结束时间', key: 'realEndTime', value: '', isTime: true},
        {title: '自检', key: 'selfInspection', value: ''},
        {title: '互检', key: 'mutualInspection', value: ''},
        {title: '实施过程', key: 'remarks', value: '', span: 3},
      ],
      records: {},
      testId: '',
      testTaskData: [],
      projectData: [],
      equipData: [],
      toolsProductData: [],
      productTable: [],
      installControlTable: [],
      switchRecordingTable: [],
      personArr: [],
      pictureData: [],
      testRecordArr: [],
    }
  },
  methods: {
    show(record) {
      this.visible = true
      this.title = record.testNames
      this.records = record
      this.testId = record.id
      if (record.id) {
        this.getTestDetail(record.id)
        this.loadImgData(record.id)
      }
    },
    handleDownload(filePath, fileName) {
      let fileAccessUrl = getFileAccessHttpUrl(filePath)
      downloadFile(fileAccessUrl, fileName)
    },
    handleCancel(e) {
      this.visible = false
    },
    handleTabsChange(v) {
      this.activeTab = v
    },
    loadImgData(refId) {
      postAction(this.url.attachList, {refType: 'test_picture', refId}).then((res) => {
        if (res.code === 200) {
          const {data} = res
          let fileArr = []
          if (data && data.length > 0) {
            data.forEach((item) => {
              fileArr.push({
                fileId: item.id,
                size: item.fileSize,
                status: item.status == 9 ? 'success' : 'exception',
                url: item.filePath,
                name: item.fileName,
                uuid: item.id,
                percent: 100,
                uploadTime: item.createTime,
                secretLevel: item.secretLevel,
                remarks: item.remarks,
                type: item.viewType == 2 ? 'image/jpeg' : 'text/plain',
              })
            })
          }
          this.pictureData = fileArr
        }
      })
    },
    getTestDetail(id) {
      postAction(this.url.detail, {id: id}).then((res) => {
        if (res.code === 200) {
          const {data} = res
          let personArr = []
          for (let item in res.data) {
            for (let i = 0; i < this.basicData.length; i++) {
              if (item === this.basicData[i].key) {
                this.basicData[i].value = data[item]
              }
            }
          }
          data.testPersonInfo.forEach((item) => {
            personArr.push({
              id: item.id,
              testPostName: item.testPostName,
              testPostId: item.testPostId,
              testUserId: item.testUserId,
              testUserName: item.testUserName,
            })
          })
          this.productTable = data.testPieceInfo
          this.testRecordArr = data.testResultRecords
          this.personArr = personArr
          this.testTaskData = data.testTaskInfo
          this.projectData = data.projectInfo
          // 安装、控制方式 + 传感器
          this.installControlTable = data.insertMethodInfo
          // 设备开关机记录
          this.switchRecordingTable = data.switchOnOffInfo
          this.equipData = data.testEquipInfo
          this.toolsProductData = data.testToolsProductInfo
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>
.equip-task-detail-wrapper {
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;

  .detail-modal-box {
    position: absolute;
    top: 15px;
    left: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
    margin-top: 10px;
    padding: 10px;

    .detail-modal-content {
      height: 100%;
      width: 100%;
      overflow: auto;
    }
  }
}

/deep/ .ant-modal-content {
  border-radius: 0;
}

/deep/ .ant-modal-body {
  //.ant-tabs-bar {
  //  margin: 0 10px !important;
  //}

  .ant-tabs.ant-tabs-card .ant-tabs-card-bar .ant-tabs-nav-container {
    height: 30px;

    .ant-tabs-tab {
      height: 30px;
      line-height: 28px;
    }

    .ant-tabs-tab-active {
      height: 30px;
    }
  }
}
</style>