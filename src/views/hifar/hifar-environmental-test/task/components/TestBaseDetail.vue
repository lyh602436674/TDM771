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
        <h-desc
          id="processForm"
          :data="detailData"
          class="mg-t-20"
          lableWidth="110px"
          title="实施过程">
          <h-desc-item label="试验设备">{{ detailData.equipName + '-' + detailData.equipModel || '--' }}</h-desc-item>
          <h-desc-item label="设备速率">{{ detailData.testRate || '--' }}</h-desc-item>
          <h-desc-item label="试验人员">{{ detailData.chargeUserName || '--' }}</h-desc-item>
          <h-desc-item label="入场时间">{{
              dateTimeFormatByStamp(detailData.approachTime)
            }}
          </h-desc-item>
          <h-desc-item label="离场时间">{{
              dateTimeFormatByStamp(detailData.departureTime)
            }}
          </h-desc-item>
          <h-desc-item label="开始时间">{{
              dateTimeFormatByStamp(detailData.realStartTime)
            }}
          </h-desc-item>
          <h-desc-item label="结束时间">{{
              dateTimeFormatByStamp(detailData.realEndTime)
            }}
          </h-desc-item>
          <h-desc-item label="温度(°C)">{{ detailData.temperature || '--' }}</h-desc-item>
          <h-desc-item label="湿度(RH)">{{ detailData.humidity || '--' }}</h-desc-item>
          <h-desc-item label="自检">{{ detailData.selfInspection || '--' }}</h-desc-item>
          <h-desc-item label="互检">{{ detailData.mutualInspection || '--' }}</h-desc-item>
          <h-desc-item :span="3" label="参试人员">
            {{ testPersonInfo.length ? testPersonInfo.join(',') : '--' }}
          </h-desc-item>
          <h-desc-item :span="3" label="实施过程">{{ detailData.remarks || '--' }}</h-desc-item>
        </h-desc>
        <!-- 安装、控制方式 -->
        <h-desc v-if="!isShow" id="installControl" class="mg-t-20" title='安装、控制方式'>
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
        <!-- 测试设备 -->
        <h-desc id="testEquip" class="mg-t-20" title='测试设备'>
          <h-card :bordered='false' style='width: 100%'>
            <a-table
              :columns='testEquipColumns'
              :dataSource='testEquipInfo'
              :pagination='false'
              bordered
              rowKey='id'
              size='small'
              style="width: 100%;"
            >
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
        <h-desc v-if="!isShow" id="toolsProduct" class="mg-t-20" title='振动工装'>
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
        <!-- 曲线图片 -->
        <h-desc id="picture" class="mg-t-20" title="曲线图片">
          <h-upload-file v-model="pictureData" :isEdit="false" isWriteRemarks style="width: 100%"></h-upload-file>
        </h-desc>
        <!-- 试前检查 -->
        <h-desc
          id="testBeforeCheck"
          :bordered="false"
          class="mg-t-20"
          lableWidth="110px"
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
            <h-icon v-if="record.itemRes === '1'" class='success-text' type='icon-wancheng1'/>
            <h-icon v-else-if="record.itemRes === '2'" class='danger-text' type='icon-chacha'/>
            <h-icon v-else-if="record.itemRes === '3'" class='danger-text' type='icon-xieti'/>
            <span v-else style="display:inline-block;width:100%;text-align: left;" v-text="record.itemRes"></span>
          </span>
          </h-vex-table>
        </h-desc>
        <!-- 试中检查 -->
        <h-desc
          id="testInCheck"
          :bordered="false"
          class="mg-t-20"
          lableWidth="110px"
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
            <h-icon v-if="record.itemRes === '1'" class='success-text' type='icon-wancheng1'/>
            <h-icon v-else-if="record.itemRes === '2'" class='danger-text' type='icon-chacha'/>
            <h-icon v-else-if="record.itemRes === '3'" class='danger-text' type='icon-xieti'/>
            <span v-else style="display:inline-block;width:100%;text-align: left;" v-text="record.itemRes"></span>
          </span>
          </h-vex-table>
        </h-desc>
        <!-- 试后检查 -->
        <h-desc
          id="testAfterCheck"
          :bordered="false"
          class="mg-t-20"
          lableWidth="110px"
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
            <h-icon v-if="record.itemRes === '1'" class='success-text' type='icon-wancheng1'/>
            <h-icon v-else-if="record.itemRes === '2'" class='danger-text' type='icon-chacha'/>
            <h-icon v-else-if="record.itemRes === '3'" class='danger-text' type='icon-xieti'/>
            <span v-else style="display:inline-block;width:100%;text-align: left;" v-text="record.itemRes"></span>
          </span>
          </h-vex-table>
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

export default {
  components: {
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
            return t || '--'
          }
        },
        {
          title: '序号',
          dataIndex: 'equipIndex',
          align: 'center',
          customRender: (t) => {
            return t || '--'
          }
        },
        {
          title: '内部名称',
          dataIndex: 'innerName',
          align: 'center',
          customRender: (t) => {
            return t || '--'
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
        {
          title: '是否记录振动曲线',
          dataIndex: 'vibrationCurveFlag',
          align: 'center',
          width: 150,
          customRender: (t, row, index) => {
            return t === 1 ? '是' : t === 0 ? '否' : ''
          }
        },
      ],
      testEquipInfo: [],
      testEquipColumns: [
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
        {title: '设备编号', dataIndex: 'equipCode'},
        {title: '设备名称', dataIndex: 'equipName'},
        {
          title: '计量有效期',
          dataIndex: 'checkValid',
          customRender: (t, record) => {
            return dateTimeFormatByStamp(record.checkValid, 'YYYY-MM-DD')
          }
        },
        {title: '设备型号', dataIndex: 'equipModel'},
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
            return t || '--'
          }
        },
        {
          title: '工装名称',
          dataIndex: 'toolsName',
          align: 'center',
          customRender: (t) => {
            return t || '--'
          }
        },
        {
          title: '工装规格',
          dataIndex: 'toolsSize',
          align: 'center',
          customRender: (t) => {
            return t || '--'
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
            return t || '--'
          }
        },
        {
          title: '责任部门',
          dataIndex: 'deptName',
          align: 'center',
          customRender: (t) => {
            return t || '--'
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
          scopedSlots: {customRender: 'itemRes'}
        },
        {
          title: '检查人',
          align: 'left',
          dataIndex: 'fillUserName',
          customRender: (text, record) => {
            return text ? text + ' ' + this.formatTime(record.fillTime) : ''
          }
        },
        {
          title: '复核人',
          align: 'left',
          dataIndex: 'checkUserName',
          customRender: (text, record) => {
            return text ? text + ' ' + this.formatTime(record.checkTime) : ''
          }
        }
      ],
      // 试前检查
      beforeCheckInfo: () => {
        return postAction(this.url.CheckInfo, {id: this.checkId}).then((res) => {
          if (res.code === 200) {
            return res.data.beforeCheckInfo
          }
        })
      },
      // 试中检查
      inCheckInfo: () => {
        return postAction(this.url.CheckInfo, {id: this.checkId}).then((res) => {
          if (res.code === 200) {
            return res.data.inCheckInfo
          }
        })
      },
      // 试后检查
      afterCheckInfo: () => {
        return postAction(this.url.CheckInfo, {id: this.checkId}).then((res) => {
          if (res.code === 200) {
            return res.data.afterCheckInfo
          }
        })
      },
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
          let testPersonInfoArr = data.testPersonInfo
          let entrustInfoArr = data.entrustInfo
          let testPersonInfo = []
          this.detailData = data
          // this.projectInfo = data.testTaskInfo
          this.projectInfo = data.projectInfo
          if (testPersonInfoArr.length) {
            testPersonInfoArr.forEach((item) => {
              let res = item.testUserName ? (item.testUserName + (item.testPostName ? '(' + item.testPostName + ')' : '')) : '--'
              testPersonInfo.push(res)
            })
          }
          // 项目类型 力学 气候用来判断安装控制方式和振动工装是否显示
          this.projectClassifyType = data.projectInfo[0].classifyType
          this.buildLayerColumns()
          // 试件信息
          this.testPieceInfo = data.testPieceInfo
          this.testPersonInfo = testPersonInfo
          this.entrustInfoItem = entrustInfoArr[0]
          // 巡检记录
          // this.siteInspectionInfo = data.siteInspectionInfo
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
    formatTime(time) {
      return (time && +time) ? moment(+time).format('YYYY-MM-DD HH:mm:ss') : ''
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
