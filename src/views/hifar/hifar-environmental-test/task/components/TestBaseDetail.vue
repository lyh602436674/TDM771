<!--
 * @Author: 赵峰
 * @Date: 2021-11-12 15:09:59
 * @LastEditTime: 2021-11-30 15:37:30
 * @LastEditors: 马潭龙
 * @Descripttion: 试验信息--基本信息详情组件
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\components\TestBaseDetail.vue
-->
<template>
  <div style="height: 100%">
    <a-tabs v-model="activeTab" size="small" type="card" @change="handleTabsChange">
      <a-tab-pane
        v-for="(item, index) in entrustInfo"
        :key="index"
        :tab="item.flag ?item.title : item.entrustCode "></a-tab-pane>
    </a-tabs>
    <template v-if="entrustInfo[activeTab]['flag']">
      <abnormal-record-table
        v-if="entrustInfo[activeTab]['type'] === 'exception'"
        ref="AbnormalRecordTable"
        :records="detailData"
        :style="{ marginTop: top ? top : '50px',height:'100%' }"
        isReadOnly/>
      <termination-record-table
        v-if="entrustInfo[activeTab]['type'] === 'end'"
        ref="TerminationRecordTable"
        :records="detailData"
        :style="{ marginTop: top ? top : '50px',height:'100%' }"/>
      <test-report-info
        v-if="entrustInfo[activeTab]['type'] === 'report'"
        ref="TestReportInfo"
        :style="{ marginTop: top ? top : '50px',height:'100%' }"
        :testId="detailData.id"
        class="autoHeight"/>
    </template>
    <template v-else>
      <hf-elevator-layer :layer-columns="layerColumns"/>
      <template v-if="['1','2','3'].includes(viewDetailType)">
        <!-- 基本信息 -->
        <div v-if="isBase" id="basicInfo" :style="{ marginTop: top ? top : '50px' }">
          <detail-base-info showPreviewBtn showFlowBtn :detailDataObj="entrustInfoItem"></detail-base-info>
        </div>
        <div id="piece">
          <!-- 试件信息 -->
          <test-piece-detail
            v-if="['2','3'].includes(viewDetailType)"
            :dataSource="getPieceDataByEntrustId"
            class="mg-t-20"
            title="试件信息"/>
          <piece-detail-template titlle="试件信息" v-else :dataSource="getPieceDataByEntrustId"/>
        </div>
        <!-- 项目信息 -->
        <div id="project" v-if="isBase">
          <div v-for="(item,index) in getProjectItemByEntrustNo">
            <project-detail-template
              :key="index"
              :model="item"
              :title="'项目信息' + '(' + item.entrustCode + ')'"
              class="mg-t-20"></project-detail-template>
          </div>
        </div>
      </template>
      <!-- 以委托单和运行单的维度查看时，之查看委托单信息，不包含试验相关信息 -->
      <template v-if="['3'].includes(viewDetailType)">
        <!-- 实施过程 -->
        <test-carry-process :detailData="detailData"></test-carry-process>
        <!-- 安装、控制方式 -->
        <h-desc v-if="!isShow" id="installControl" class="mg-t-20" title='安装、控制方式'>
          <test-install-control-mode :installControlTable="installControlTable"/>
        </h-desc>
        <!-- 测试设备 -->
        <h-desc id="testEquip" class="mg-t-20" title='测试设备'>
          <test-test-equip :testEquipInfo="testEquipInfo"></test-test-equip>
        </h-desc>
        <!-- 试验设备开关机记录 -->
        <h-desc id="switchRecording" class="mg-t-20" title='试验设备开关机记录'>
          <test-switch-recording :switchRecordingTable="switchRecordingTable"/>
        </h-desc>
        <!-- 试验记录 -->
        <h-desc id="testRecord" class="mg-t-20" title='试验记录'>
          <test-test-record :test-record-arr="testRecordArr"/>
        </h-desc>
        <!-- 巡检记录 -->
        <!--      <h-desc id="siteInspection" class="mg-t-20" title='巡检记录'>-->
        <!--        <h-card :bordered='false' style='width: 100%'>-->
        <!--          <a-table-->
        <!--            :columns='siteInspectionColumns'-->
        <!--            :dataSource='siteInspectionTable'-->
        <!--            :pagination='false'-->
        <!--            bordered-->
        <!--            rowKey='id'-->
        <!--            size='small'-->
        <!--            style="width: 100%;"-->
        <!--          ></a-table>-->
        <!--        </h-card>-->
        <!--      </h-desc>-->
        <h-desc v-if="!isShow" id="toolsProduct" class="mg-t-20" title='振动工装'>
          <test-tools-product :toolsProductData="toolsProductData"/>
        </h-desc>
        <!-- 曲线图片 -->
        <h-desc id="picture" class="mg-t-20" title="曲线图片">
          <h-upload-file v-model="pictureData" :isEdit="false" isWriteRemarks style="width: 100%"></h-upload-file>
        </h-desc>
        <!-- 试前检查 -->
        <h-desc
          id="testBeforeCheck"
          :bordered="false"
          class="mg-t-20"
          title="试前检查">
          <test-check data-field="beforeCheckInfo" :testId="testId"></test-check>
        </h-desc>
        <!-- 试中检查 -->
        <h-desc
          id="testInCheck"
          :bordered="false"
          class="mg-t-20"
          title="试中检查">
          <test-check data-field="inCheckInfo" :testId="testId"></test-check>
        </h-desc>
        <!-- 试后检查 -->
        <h-desc
          id="testAfterCheck"
          :bordered="false"
          class="mg-t-20"
          title="试后检查">
          <test-check data-field="afterCheckInfo" :testId="testId"></test-check>
        </h-desc>
        <!-- 试验数据 -->
        <h-desc id="testData" class="mg-t-20" title="试验数据">
          <div style="height: 100%; width: 100%; overflow: auto; padding: 20px">
            <h-desc id="attachForm" :bordered="false">
              <h-form
                ref="attachForm"
                v-model="model_attach"
                :column="1"
                :formData="attachData"
                style="width: 100%"/>
            </h-desc>
            <h-desc id="videoForm" :bordered="false">
              <h-form v-model="model_video" :column="1" :formData="videoData" style="width: 100%"/>
            </h-desc>
          </div>
        </h-desc>
      </template>
    </template>
    <test-entrust-review-pdf ref="testEntrustReviewPdf"/>
  </div>
</template>

<script>
import moment from 'moment'
import {downloadFile, getFileAccessHttpUrl, postAction} from '@api/manage'
import mixin from '@/views/hifar/mixin.js'
import AbnormalRecordTable
  from '@/views/hifar/hifar-environmental-test/task/modules/components/detail/AbnormalRecordTable'
import TerminationRecordTable
  from '@/views/hifar/hifar-environmental-test/task/modules/components/detail/TerminationRecordTable'
import TestReportInfo from '@views/hifar/hifar-environmental-test/task/components/TestReportInfo'
import TestEntrustReviewPdf from '@views/hifar/hifar-environmental-test/task/modules/TestEntrustReviewPdf';
import DetailBaseInfo from '@views/hifar/hifar-environmental-test/entrustment/components/DetailBaseInfo';
import ProjectDetailTemplate from '@views/hifar/hifar-environmental-test/entrustment/components/ProjectDetailTemplate';
import HfElevatorLayer from "@comp/HfElevatorLayer";
import TestPieceDetail from "@views/hifar/hifar-environmental-test/task/components/TestPieceDetail";
import {dateTimeFormatByStamp} from '@/utils/util'
import PieceDetailTemplate from "@views/hifar/hifar-environmental-test/entrustment/components/PieceDetailTemplate";
import entrustmentMixins from "@views/hifar/hifar-environmental-test/entrustment/components/entrustmentMixins";
import TestCarryProcess from "@views/hifar/hifar-environmental-test/task/components/TestCarryProcess.vue";
import TestInstallControlMode from "@views/hifar/hifar-environmental-test/task/components/TestInstallControlMode.vue";
import TestTestEquip from "@views/hifar/hifar-environmental-test/task/components/TestTestEquip.vue";
import TestSwitchRecording from "@views/hifar/hifar-environmental-test/task/components/TestSwitchRecording.vue";
import TestToolsProduct from "@views/hifar/hifar-environmental-test/task/components/TestToolsProduct.vue";
import TestCheck from "@views/hifar/hifar-environmental-test/task/components/TestCheck.vue";
import TestTestRecord from "@views/hifar/hifar-environmental-test/task/components/TestTestRecord.vue";

export default {
  components: {
    TestTestRecord,
    TestCheck,
    TestToolsProduct,
    TestSwitchRecording,
    TestTestEquip,
    TestInstallControlMode,
    TestCarryProcess,
    PieceDetailTemplate,
    ProjectDetailTemplate,
    TestPieceDetail,
    TestEntrustReviewPdf,
    AbnormalRecordTable,
    TerminationRecordTable,
    TestReportInfo,
    DetailBaseInfo,
    HfElevatorLayer
  },
  mixins: [mixin, entrustmentMixins],
  props: {
    testId: {
      type: String,
      default: ''
    },
    viewDetailType: {
      type: String,
      default: null
    },
    top: {
      type: String,
      default: ''
    },
    showExceptionAndEnd: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dateTimeFormatByStamp,
      moment,
      layerColumns: [],
      activeTab: 0,
      checkId: '',
      url: {
        detail: '/HfEnvTaskTestBusiness/queryById',
        CheckInfo: '/HfEnvTaskTestBusiness/queryTestCheckItem',
        // 试验数据
        attachList: '/MinioBusiness/listByRefId',
        delete: '/MinioBusiness/logicRemoveById'
      },
      detailData: {},
      testPieceInfo: [],
      projectInfo: [],
      entrustInfo: [{flag: false}],
      entrustInfoItem: {},
      title: '',
      model_attach: {},
      model_video: {},
      visible: false,
      testEquipInfo: [],
      installControlTable: [],
      switchRecordingTable: [],
      testRecordArr: [],
      siteInspectionColumns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return index + 1
          }
        },
        {
          title: '试验方向',
          dataIndex: 'testDirection',
          align: 'center',
          width: 150,
          customRender: (t, row, index) => {
            return t || '--'
          }
        },
        {
          title: '向次',
          dataIndex: 'directionNum',
          align: 'center',
          width: 100,
          customRender: (t, row, index) => {
            return t || '--'
          }
        },
        {
          title: '日期时间',
          dataIndex: 'inspectionTime',
          align: 'center',
          width: 210,
          customRender: (t, row) => {
            return this.momentFormatFun(t, 'YYYY-MM-DD HH:mm:ss') || '--'
          }
        },
        {
          title: '温度设定值(℃)',
          dataIndex: 'setUpValue',
          align: 'center',
          width: 150,
          customRender: (t, row, index) => {
            return t || '--'
          }
        },
        {
          title: '温度实测值(℃)',
          dataIndex: 'measuredValue',
          align: 'center',
          width: 150,
          customRender: (t, row, index) => {
            return t || '--'
          }
        },
        {
          title: '运行状态',
          dataIndex: 'runStatus_dictText',
          align: 'center',
          width: 120,
          customRender: (t, row, index) => {
            return t || '--'
          }
        },
        {
          title: '操作人',
          dataIndex: 'operationPerson',
          align: 'center',
          width: 220,
          customRender: (t, row) => {
            let {operationPerson, operationTime} = row
            return operationPerson && operationTime ? operationPerson + ' ' + this.momentFormatFun(operationTime, 'YYYY-MM-DD HH:mm:ss') : ''

          }
        },
        {
          title: '备注',
          dataIndex: 'remarks',
          align: 'center',
          ellipsis: true,
          customRender: (t, row) => {
            return t || '--'
          }
        },
      ],
      siteInspectionTable: [],
      toolsProductData: [],
      // 图片
      pictureData: [],
      // 振动图谱
      attachData: [
        {
          title: '振动图谱',
          key: 'attachIds',
          span: 1,
          component: (
            <h-upload-file
              isEdit={false}
              v-decorator={['attachIds', {initialValue: []}]}
              customParams={{refType: 'test_attach', refId: this.checkId}}
            />
          )
        }
      ],
      // 视频
      videoData: [
        {
          title: '视频',
          key: 'attachIds',
          span: 1,
          component: (
            <h-upload-file
              isEdit={false}
              v-decorator={['attachIds', {initialValue: []}]}
              customParams={{refType: 'test_video', refId: this.checkId}}
            />
          )
        }
      ],
      projectClassifyType: "1"
    }
  },
  watch: {
    testId: {
      immediate: true,
      handler(val) {
        if (val) {
          this.loadDetailData(val)
          this.loadImgData()
          this.loadAttachData()
          this.loadVideoData()
        }
      }
    }
  },
  computed: {
    isShow() {
      return this.filterUnitCode(this.projectClassifyType)
    },
    isBase() {
      return ['1', '2'].includes(this.viewDetailType)
    },
    getProjectItemByEntrustNo() {
      // 这里不能拿id匹配，因为多个项目的委托单拆分后就会拆分成两个委托单，id就不一样了，所以只能拿委托单号匹配
      return this.projectInfo.filter(item => item.entrustNo === this.entrustInfo[this.activeTab].entrustNo)
    },
    getPieceDataByEntrustId() {
      // 这里拿到当前激活的页签下的委托单id从样品里面匹配对应委托单id的样品
      return this.testPieceInfo.filter(item => item.entrustId === this.entrustInfo[this.activeTab].id)
    },
  },
  methods: {
    buildLayerColumns() {
      let layerColumnsBase = [
        {
          title: "基本信息",
          id: "basicInfo"
        },
        {
          title: "试件信息",
          id: "piece"
        },
        {
          title: "项目信息",
          id: "project"
        }]
      let layerColumnsTest = [
        {
          title: "实施过程",
          id: "processForm"
        },
        {
          title: "安装控制方式",
          id: "installControl",
          hidden: !this.isShow
        },
        {
          title: "测试设备",
          id: "testEquip"
        },
        {
          title: "开关机记录",
          id: "switchRecording"
        },
        // {
        //   title: "巡检记录",
        //   id: "siteInspection"
        // },
        {
          title: "试验记录",
          id: "testRecord"
        },
        {
          title: "振动工装",
          id: "toolsProduct",
          hidden: !this.isShow
        },
        {
          title: "曲线图片",
          id: "picture"
        },
        {
          title: "试前检查",
          id: "testBeforeCheck"
        },
        {
          title: "试中检查",
          id: "testInCheck"
        },
        {
          title: "试后检查",
          id: "testAfterCheck"
        },
        {
          title: "试验数据",
          id: "testData"
        },
      ]
      if (['1', '2', '3'].includes(this.viewDetailType)) {
        if (this.isBase) {
          this.layerColumns = layerColumnsBase
        } else if (['2', '3'].includes(this.viewDetailType)) {
          this.layerColumns = layerColumnsTest
          this.layerColumns.unshift(layerColumnsBase[1])
        }
      }
      if (['3'].includes(this.viewDetailType)) {
        this.layerColumns = layerColumnsTest
      }
    },
    momentFormatFun(value, format) {
      return value && value !== '0' && moment(+value).format(format) || null
    },
    handleDownload(filePath, fileName) {
      let fileAccessUrl = getFileAccessHttpUrl(filePath)
      downloadFile(fileAccessUrl, fileName)
    },
    handleTabsChange(v) {
      this.activeTab = v
      this.entrustInfoItem = {}
      this.entrustInfoItem = this.entrustInfo[v]
    },
    loadDetailData(id) {
      this.checkId = id
      postAction(this.url.detail, {id: id, type: this.viewDetailType}).then((res) => {
        if (res.code === 200) {
          const {data} = res
          let entrustInfoArr = data.entrustInfo
          // this.projectInfo = data.testTaskInfo
          this.projectInfo = data.projectInfo
          this.detailData = data
          // 项目类型 力学 气候用来判断安装控制方式和振动工装是否显示
          this.projectClassifyType = data.projectInfo[0].classifyType
          this.buildLayerColumns()
          // 试件信息
          this.testPieceInfo = data.testPieceInfo
          this.entrustInfoItem = entrustInfoArr[0]
          // 巡检记录
          // this.siteInspectionInfo = data.siteInspectionInfo
          // 试验记录
          this.testRecordArr = data.testResultRecords
          // 设备开关机记录
          this.switchRecordingTable = data.switchOnOffInfo
          // 安装、控制方式 + 传感器
          this.installControlTable = data.insertMethodInfo
          // 测试设备
          this.testEquipInfo = data.testEquipInfo
          // 振动工装
          this.toolsProductData = data.testToolsProductInfo
          let entrustInfo = entrustInfoArr
          if (this.showExceptionAndEnd) {
            entrustInfo.push(
              {title: '报告信息', flag: true, type: 'report'},
              {title: '异常记录', flag: true, type: 'exception'},
              {title: '终止记录', flag: true, type: 'end'}
            )
          }
          this.entrustInfo = entrustInfo
        }
      })
    },
    dataFormat(arr) {
      return arr.map(item => {
        return {
          ...item,
          fileId: item.id,
          size: item.fileSize,
          status: item.status === 9 ? 'success' : 'exception',
          url: item.filePath,
          name: item.fileName,
          uuid: item.id,
          percent: 100,
          uploadTime: item.createTime,
          secretLevel: item.secretLevel,
          type: item.viewType === 2 ? 'image/jpeg' : 'text/plain',
        }
      })
    },
    // 图片
    loadImgData() {
      postAction(this.url.attachList, {refType: 'test_picture', refId: this.checkId}).then((res) => {
        if (res.code === 200) {
          const {data} = res
          if (data && data.length > 0) {
            this.pictureData = this.dataFormat(data)
          }
        }
      })
    },
    // 振动图谱
    loadAttachData() {
      postAction(this.url.attachList, {refType: 'test_attach', refId: this.checkId}).then((res) => {
        if (res.code === 200) {
          const {data} = res
          let fileArr = []
          let obj = {}
          if (data && data.length > 0) {
            fileArr = this.dataFormat(data)
          }
          obj.attachIds = fileArr
          this.model_attach = obj
        }
      })
    },
    // 视频
    loadVideoData() {
      postAction(this.url.attachList, {refType: 'test_video', refId: this.checkId}).then((res) => {
        if (res.code === 200) {
          const {data} = res
          let fileArr = []
          let obj = {}
          if (data && data.length > 0) {
            fileArr = this.dataFormat(data)
          }
          obj.attachIds = fileArr
          this.model_video = obj
        }
      })
    },

  }
}
</script>
<style lang='less' scoped>
/deep/ .ant-tabs {
  position: initial !important;
}

.mg-t-20 {
  margin-top: 20px !important;
}

///deep/ .ant-tabs-bar {
//  margin: 0;
//}

.url-list {
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  span {
    margin-right: 10px;
  }
}
</style>
