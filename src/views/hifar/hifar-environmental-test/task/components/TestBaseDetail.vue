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
      <!-- 基本信息 -->
      <div id="basicInfo" :style="{ marginTop: top ? top : '50px' }">
        <detail-base-info :detailDataObj="entrustInfoItem"></detail-base-info>
      </div>
      <!--      试件信息-->
      <test-piece-detail
        id="piece"
        class="mg-t-20"
        title="试件信息"
        :dataSource="testPieceInfo"/>
      <!-- 项目信息 -->
      <div v-for="(item,index) in projectInfo" id="project">
        <project-detail-template
          class="mg-t-20"
          :key="index"
          :model="item"
          :title="'项目信息' + '(' + item.entrustCode + ')'"></project-detail-template>
      </div>
      <!-- 实施过程 -->
      <h-desc
        id="processForm"
        :data="detailData"
        lableWidth="110px"
        class="mg-t-20"
        title="实施过程">
        <h-desc-item label="试验设备">{{ detailData.equipName + '-' + detailData.equipModel || '--' }}</h-desc-item>
        <h-desc-item label="设备速率">{{ detailData.testRate || '--' }}</h-desc-item>
        <h-desc-item label="负责人">{{ detailData.chargeUserName || '--' }}</h-desc-item>
        <h-desc-item label="入场时间">{{
            detailData.approachTime && detailData.approachTime != 0
              ? moment(parseInt(detailData.approachTime)).format('YYYY-MM-DD HH:mm:ss')
              : '--'
          }}
        </h-desc-item>
        <h-desc-item label="离场时间">{{
            detailData.departureTime && detailData.departureTime != 0
              ? moment(parseInt(detailData.departureTime)).format('YYYY-MM-DD HH:mm:ss')
              : '--'
          }}
        </h-desc-item>
        <h-desc-item label="开始时间">{{
            detailData.realStartTime && detailData.realStartTime != 0
              ? moment(parseInt(detailData.realStartTime)).format('YYYY-MM-DD HH:mm:ss')
              : '--'
          }}
        </h-desc-item>
        <h-desc-item label="结束时间">{{
            detailData.realEndTime && detailData.realEndTime != 0
              ? moment(parseInt(detailData.realEndTime)).format('YYYY-MM-DD HH:mm:ss')
              : '--'
          }}
        </h-desc-item>
        <h-desc-item label="温度(°C)">{{ detailData.temperature || '--' }}</h-desc-item>
        <h-desc-item label="湿度(RH)">{{ detailData.humidity || '--' }}</h-desc-item>
        <h-desc-item label="自检">{{ detailData.selfInspection || '--' }}</h-desc-item>
        <h-desc-item label="互检">{{ detailData.mutualInspection || '--' }}</h-desc-item>
        <h-desc-item :span="3" label="参试人员">
          {{ testPersonInfo.length ? testPersonInfo.join(',') : '--' }}
        </h-desc-item>
<!--        <h-desc-item :span="3" label="测试设备">-->
<!--          {{ testEquipInfo.length ? testEquipInfo.join(',') : '&#45;&#45;' }}-->
<!--        </h-desc-item>-->
        <h-desc-item :span="3" label="实施过程">{{ detailData.remarks || '--' }}</h-desc-item>
      </h-desc>
      <!-- 安装、控制方式 -->
      <h-desc id="installControl" class="mg-t-20" title='安装、控制方式'>
        <h-card :bordered='false' style='width: 100%'>
          <a-table
            :columns='installControlColumns'
            :dataSource='installControlTable'
            :pagination='false'
            bordered
            rowKey='id'
            size='small'
            style="width: 100%;"
          >
            <div slot="expandedRowRender" slot-scope="record,index">
              <a-table
                :columns='sensorColumns'
                :dataSource='record.testSensorInfo'
                :pagination='false'
                bordered
                rowKey='id'
                size='small'
                style="width: 100%;"
              >
              </a-table>
            </div>
          </a-table>
        </h-card>
      </h-desc>
      <!-- 试验设备开关机记录 -->
      <h-desc id="switchRecording" class="mg-t-20" title='试验设备开关机记录'>
        <h-card :bordered='false' style='width: 100%'>
          <a-table
            :columns='switchRecordingColumns'
            :dataSource='switchRecordingTable'
            :pagination='false'
            bordered
            rowKey='id'
            size='small'
            style="width: 100%;"
          >
          </a-table>
        </h-card>
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
      <h-desc id="toolsProduct" class="mg-t-20" title='振动工装'>
        <h-card :bordered='false' style='width: 100%'>
          <div slot='content'>
            <a-table
              :columns='toolsProductColumns'
              :dataSource='toolsProductData'
              :pagination='false'
              bordered
              rowKey='id'
              size='small'
            ></a-table>
          </div>
        </h-card>
      </h-desc>
      <!-- 图片图谱 -->
      <h-desc id="picture" class="mg-t-20" title="图片图谱">
        <h-upload-file style="width: 100%" v-model="pictureData" isWriteRemarks :isEdit="false"></h-upload-file>
      </h-desc>
      <!-- 试前检查 -->
      <h-desc
        id="testBeforeCheck"
        :bordered="false"
        lableWidth="110px"
        class="mg-t-20"
        title="试前检查">
        <h-vex-table
          ref="beforeCheckInfo"
          :columns="columns"
          :data="beforeCheckInfo"
          :pagination="false"
          bordered
          style="width: 100%; height: 200px"
        >
          <span slot="itemRes" slot-scope="text, record">
            <h-icon v-if="record.itemRes === '2'" class="success-text" type="icon-wancheng1"/>
            <h-icon v-else-if="record.itemRes === '3'" class="danger-text" type="icon-chacha"/>
            <span v-else style="display:inline-block;width:100%;text-align: left;" v-text="record.itemRes"></span>
          </span>
        </h-vex-table>
      </h-desc>
      <!-- 试中检查 -->
      <h-desc
        id="testInCheck"
        :bordered="false"
        lableWidth="110px"
        class="mg-t-20"
        title="试中检查">
        <h-vex-table
          ref="inCheckInfo"
          :columns="columns"
          :data="inCheckInfo"
          :pagination="false"
          bordered
          style="width: 100%; height: 200px"
        >
          <span slot="itemRes" slot-scope="text, record">
            <h-icon v-if="record.itemRes === '2'" class="success-text" type="icon-wancheng1"/>
            <h-icon v-else-if="record.itemRes === '3'" class="danger-text" type="icon-chacha"/>
            <span v-else style="display:inline-block;width:100%;text-align: left;" v-text="record.itemRes"></span>
          </span>
        </h-vex-table>
      </h-desc>
      <!-- 试后检查 -->
      <h-desc
        id="testAfterCheck"
        :bordered="false"
        lableWidth="110px"
        class="mg-t-20"
        title="试后检查">
        <h-vex-table
          ref="afterCheckInfo"
          :columns="columns"
          :data="afterCheckInfo"
          :pagination="false"
          bordered
          style="width: 100%; height: 200px"
        >
          <span slot="itemRes" slot-scope="text, record">
            <h-icon v-if="record.itemRes === '2'" class="success-text" type="icon-wancheng1"/>
            <h-icon v-else-if="record.itemRes === '3'" class="danger-text" type="icon-chacha"/>
            <span v-else style="display:inline-block;width:100%;text-align: left;" v-text="record.itemRes"></span>
          </span>
        </h-vex-table>
      </h-desc>
      <!-- 试验数据 -->
      <h-desc class="mg-t-20" id="testData" title="试验数据">
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
    <test-entrust-review-pdf ref="testEntrustReviewPdf"/>
    <hf-elevator-layer :layer-columns="layerColumns"></hf-elevator-layer>
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

export default {
  components: {
    ProjectDetailTemplate,
    TestPieceDetail,
    TestEntrustReviewPdf,
    AbnormalRecordTable,
    TerminationRecordTable,
    TestReportInfo,
    DetailBaseInfo,
    HfElevatorLayer
  },
  mixins: [mixin],
  props: {
    testId: {
      type: String,
      default: ''
    },
    viewDetailType: {
      type: String,
      default: ''
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
      moment,
      layerColumns: [
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
        },
        {
          title: "实施过程",
          id: "processForm"
        },
        {
          title: "安装控制方式",
          id: "installControl"
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
          title: "振动工装",
          id: "toolsProduct"
        },
        {
          title: "图片图谱",
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
      ],
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
      testEquipInfo: [],
      testPersonInfo: [],
      entrustInfo: [{flag: false}],
      entrustInfoItem: {},
      title: '',
      model_attach: {},
      model_video: {},
      visible: false,
      installControlTable: [],
      sensorColumns: [
        {
          title: '设备名称',
          dataIndex: 'equipName',
          align: 'center',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '序号',
          dataIndex: 'equipIndex',
          align: 'center',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '内部名称',
          dataIndex: 'innerName',
          align: 'center',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '计量有效期',
          dataIndex: 'checkValid',
          align: 'center',
          customRender: (t, record) => {
            return +record.checkValid && moment(+record.checkValid).format('YYYY-MM-DD') || '--'
          }
        },
        {
          title: '备注',
          maxWidth: 150,
          ellipsis: true,
          align: 'center',
          dataIndex: 'remarks',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '位置',
          dataIndex: 'locationName',
          align: 'center',
          width: 150,
        },
        {
          title: '用途',
          dataIndex: 'usePurposeName',
          align: 'center',
          width: 150,
        },
      ],
      installControlColumns: [
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
          title: '安装方式',
          dataIndex: 'installMethodName',
          align: 'center',
          width: 150,
        },
        {
          title: '试验方向',
          dataIndex: 'directionName',
          align: 'center',
          width: 250,
        },
        {
          title: '几台/次',
          dataIndex: 'installNum',
          align: 'center',
          width: 150,
          scopedSlots: {customRender: 'installNum'},
        },
        {
          title: '控制方式',
          dataIndex: 'controlMethod',
          align: 'center',
          width: 100,
        },
        {
          title: '备注',
          dataIndex: 'remarks',
          align: 'center',
        },
      ],
      switchRecordingTable: [],
      switchRecordingColumns: [
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
          title: '试验开始时间',
          dataIndex: 'testStartTime',
          align: 'center',
          width: 200,
          customRender: (t, row, index) => {
            return this.momentFormatFun(t, 'YYYY-MM-DD HH:mm:ss') || '--'
          }
        },
        {
          title: '试验结束时间',
          dataIndex: 'testEndTime',
          align: 'center',
          width: 200,
          customRender: (t, row, index) => {
            return this.momentFormatFun(t, 'YYYY-MM-DD HH:mm:ss') || '--'
          }
        },
        {
          title: '耗时',
          dataIndex: 'useTime',
          align: 'center',
          width: 100,
        },
        {
          title: '备注',
          dataIndex: 'remarks',
          align: 'center',
          customRender: (t, row) => {
            return t || '--'
          }
        },
        {
          title: '值班人员',
          dataIndex: 'personName',
          align: 'center',
          width: 220,
          customRender: (t, row) => {
            let {personName, personSignTime} = row
            return personName && personSignTime ? personName + ' ' + this.momentFormatFun(personSignTime, 'YYYY-MM-DD HH:mm:ss') : ''
          }
        },
      ],
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
      toolsProductColumns: [
        {
          title: '工装编号',
          dataIndex: 'toolsCode',
          align: 'center',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '工装名称',
          dataIndex: 'toolsName',
          align: 'center',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '工装规格',
          dataIndex: 'toolsSize',
          align: 'center',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '在库状态',
          dataIndex: 'larbaryStatus_dictText',
          align: 'center',
          customRender: (text) => {
            return text || '--'
          }
        },
        {
          title: '存放地点',
          dataIndex: 'location',
          align: 'center',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '责任部门',
          dataIndex: 'deptName',
          align: 'center',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '设备状态',
          dataIndex: 'toolsStatus_dictText',
          align: 'center',
          width: 120,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '工装分类',
          align: 'center',
          dataIndex: 'classify_dictText',
          customRender: (text) => {
            return text || '--'
          }
        },
      ],
      toolsProductData: [],
      columns: [
        {
          title: '检查项名称',
          align: 'left',
          dataIndex: 'itemName',
          minWidth: 10,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '检查项内容',
          align: 'left',
          dataIndex: 'itemContent',
          minWidth: 10,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '检查项要求',
          align: 'left',
          dataIndex: 'itemRequire',
          minWidth: 25,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '检查结果',
          align: 'left',
          dataIndex: 'itemRes',
          minWidth: 10,
          scopedSlots: { customRender: 'itemRes' }
        },
        {
          title: '检查人',
          align: 'left',
          dataIndex: 'fillUserName',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '复核人',
          align: 'left',
          dataIndex: 'checkUserName',
          customRender: (text, record) => {
            return text || '--'
          }
        }
      ],
      // 试前检查
      beforeCheckInfo: () => {
        return postAction(this.url.CheckInfo, { id: this.checkId }).then((res) => {
          if (res.code === 200) {
            return res.data.beforeCheckInfo
          }
        })
      },
      // 试中检查
      inCheckInfo: () => {
        return postAction(this.url.CheckInfo, { id: this.checkId }).then((res) => {
          if (res.code === 200) {
            return res.data.inCheckInfo
          }
        })
      },
      // 试后检查
      afterCheckInfo: () => {
        return postAction(this.url.CheckInfo, { id: this.checkId }).then((res) => {
          if (res.code === 200) {
            return res.data.afterCheckInfo
          }
        })
      },
      // 图片
      pictureData: [],
      // 附件
      attachData: [
        {
          title: '附件',
          key: 'attachIds',
          span: 1,
          component: (
            <h-upload-file
              isEdit={false}
              v-decorator={['attachIds', { initialValue: [] }]}
              customParams={{ refType: 'test_attach', refId: this.checkId }}
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
              v-decorator={['attachIds', { initialValue: [] }]}
              customParams={{ refType: 'test_video', refId: this.checkId }}
            />
          )
        }
      ]
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
  methods: {
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
      postAction(this.url.detail, { id: id, type: this.viewDetailType }).then((res) => {
        if (res.code === 200) {
          const { data } = res
          let testEquipInfoArr = data.testEquipInfo
          let testPersonInfoArr = data.testPersonInfo
          let entrustInfoArr = data.entrustInfo
          let testEquipInfo = []
          let testPersonInfo = []
          this.detailData = data
          // this.projectInfo = data.testTaskInfo
          this.projectInfo = data.projectInfo
          if (testEquipInfoArr.length) {
            testEquipInfoArr.forEach((item) => {
              testEquipInfo.push(item.equipName + (item.innerName ? '(' + item.innerName + ')' : ''))
            })
          }
          if (testPersonInfoArr.length) {
            testPersonInfoArr.forEach((item) => {
              let res = item.testUserName ? (item.testUserName + (item.testPostName ? '(' + item.testPostName + ')' : '')) : '--'
              testPersonInfo.push(res)
            })
          }
          // 试件信息
          this.testPieceInfo = data.testPieceInfo
          this.testEquipInfo = testEquipInfo
          this.testPersonInfo = testPersonInfo
          this.entrustInfoItem = entrustInfoArr[0]
          // 巡检记录
          // this.siteInspectionInfo = data.siteInspectionInfo
          // 设备开关机记录
          this.switchRecordingTable = data.switchOnOffInfo
          // 安装、控制方式 + 传感器
          this.installControlTable = data.insertMethodInfo
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
    // 附件
    loadAttachData() {
      postAction(this.url.attachList, { refType: 'test_attach', refId: this.checkId }).then((res) => {
        if (res.code === 200) {
          const { data } = res
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
      postAction(this.url.attachList, { refType: 'test_video', refId: this.checkId }).then((res) => {
        if (res.code === 200) {
          const { data } = res
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
