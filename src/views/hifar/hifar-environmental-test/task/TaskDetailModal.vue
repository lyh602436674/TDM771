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
      <a-button @click="handleCancel" type="ghost-danger"> 关闭 </a-button>
    </div>
    <div class="equip-task-detail-wrapper">
      <a-tabs v-model="activeTab" style="width: 100%" type="card" @change="handleTabsChange">
        <a-tab-pane :key="1" tab="基本信息"/>
        <a-tab-pane :key="2" tab="试验检查"/>
        <!--        <a-tab-pane :key="3" tab="试验记录" />-->
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
            :carryOutProcessData="carryOutProcessData"
            :personArr="personArr"
            :equipData="equipData"
            :sensorData="sensorData"
            :toolsProductData="toolsProductData"
          />
          <test-task-check v-if="activeTab === 2" ref="TestTaskCheck" :testId="testId"></test-task-check>
<!--          <vibration-table v-if="activeTab === 3" ref="VibrationTable" :record="records"></vibration-table>-->
          <test-task-data v-if="activeTab === 4" ref="TestData" :testId="testId"></test-task-data>
          <abnormal-record-table v-if="activeTab === 5" ref="AbnormalRecordTable" :records="records" />
          <termination-record-table v-if="activeTab === 6" ref="TerminationRecordTable" :records="records" />
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
  props:{
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
      },
      basicData: [
        { title: '试验设备', key: 'equipName', value: '' },
        {title: '实际开始时间', key: 'realStartTime', value: '', isTime: true},
        {title: '实际结束时间', key: 'realEndTime', value: '', isTime: true},
        {title: '试验结果', key: 'processDesc', value: '', span: 3},
        {title: '备注', key: 'remarks', value: '', span: 3},
      ],
      carryOutProcessData: [
        { title: '开始时间', key: 'realStartTime', value: '', isTime: true },
        { title: '结束时间', key: 'realEndTime', value: '', isTime: true },
        {title: '试验地点', key: 'workName', value: ''},
        {title: '温度', key: 'temperature', value: ''},
        {title: '湿度', key: 'humidity', value: ''},
        {title: '试验结果', key: 'processDesc', value: ''},
      ],
      records: {},
      testId: '',
      testTaskData: [],
      projectData: [],
      equipData: [],
      sensorData: [],
      toolsProductData: [],
      productTable: [],
      personArr: [],
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
    getTestDetail(id) {
      postAction(this.url.detail, { id: id }).then((res) => {
        if (res.code == 200) {
          const { data } = res
          let productArr = []
          let personArr = []
          for (let item in res.data) {
            for (let i = 0; i < this.basicData.length; i++) {
              if (item === this.basicData[i].key) {
                this.basicData[i].value = data[item]
              }
            }
            for (let i = 0; i < this.carryOutProcessData.length; i++) {
              if (item === this.carryOutProcessData[i].key) {
                this.carryOutProcessData[i].value = data[item]
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
          data.testPieceInfo.forEach((item) => {
            productArr.push({
              id: item.id,
              custName: item.custName,
              entrustId: item.entrustId,
              entrustCode: item.entrustCode,
              projectId: item.projectId,
              projectCode: item.projectCode,
              taskId: item.taskId,
              taskCode: item.taskCode,
              pieceId: item.pieceId,
              pieceNo: item.pieceNo,
              pieceCode: item.pieceCode,
              productId: item.productId,
              productCode: item.productCode,
              productName: item.productName,
              productModel: item.productModel,
              productAlias: item.productAlias,
              pieceNum: item.pieceNum,
              pieceCnum: item.pieceCnum,
              intactStatus: item.intactStatus,
              remarks: item.remarks,
            })
          })
          this.productTable = productArr
          this.personArr = personArr
          this.testTaskData = data.testTaskInfo
          this.projectData = data.projectInfo
          this.equipData = data.testEquipInfo
          this.sensorData = data.testSensorInfo
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