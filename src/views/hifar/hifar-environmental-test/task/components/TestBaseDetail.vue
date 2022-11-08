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
    <!-- 基本信息 -->
    <a-tabs v-model="activeTab" size="small" type="card" @change="handleTabsChange">
      <a-tab-pane v-for="(item, index) in entrustInfo" :key="index"
                  :tab="item.flag ?item.title : item.entrustCode "></a-tab-pane>
    </a-tabs>
    <template v-if="entrustInfo[activeTab]['flag']">
      <abnormal-record-table v-if="entrustInfo[activeTab]['type'] === 'exception'"
                             ref="AbnormalRecordTable"
                             :records="detailData" :style="{ marginTop: top ? top : '50px',height:'100%' }" isReadOnly/>
      <termination-record-table v-if="entrustInfo[activeTab]['type'] === 'end'"
                                ref="TerminationRecordTable"
                                :records="detailData" :style="{ marginTop: top ? top : '50px',height:'100%' }"/>
      <test-report-info v-if="entrustInfo[activeTab]['type'] === 'report'"
                        ref='TestReportInfo' :style="{ marginTop: top ? top : '50px',height:'100%' }"
                        :testId="detailData.id" class='autoHeight'/>
    </template>
    <template v-else>
      <!-- 基本信息 -->
      <div :style="{ marginTop: top ? top : '50px' }">
        <detail-base-info :detailDataObj="entrustInfoItem"></detail-base-info>
      </div>
      <!--      样品信息-->
      <piece-detail-template
        :entrustType="detailData.entrustInfo && detailData.entrustInfo.length && detailData.entrustInfo[0].entrustType"
        :dataSource="detailData.testPieceInfo"/>
      <!-- 项目信息 -->
      <template v-for="(item,index) in projectInfo">
        <project-detail-template :key="index" :model="item"
                                 :title="'项目信息' + '(' + detailData.entrustInfo[index].entrustCode  + ')'"></project-detail-template>
      </template>
      <!-- 试验信息 -->
      <h-desc id="testInfo" ref="testInfo" lableWidth="110px" style="margin-top: 20px; margin-bottom: 20px"
              title="试验信息">
        <h-desc-item label="试验设备">{{ detailData.equipName + '-' + detailData.equipModel || '--' }}</h-desc-item>
        <h-desc-item label="设备速率">{{ detailData.testRate || '--' }}</h-desc-item>
        <h-desc-item label="负责人">{{ detailData.chargeUserName || '--' }}</h-desc-item>
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
        <h-desc-item label="试验部门">{{ projectInfo.workName || '--' }}</h-desc-item>
        <h-desc-item :span="3" label="参试人员">
          {{ testPersonInfo.length > 0 ? testPersonInfo.join(',') : '--' }}
        </h-desc-item>
        <h-desc-item :span="3" label="测试设备">
          {{ testEquipInfo.length > 0 ? testEquipInfo.join(',') : '--' }}
        </h-desc-item>
        <h-desc-item :span="3" label="试验结果">{{ detailData.processDesc || '--' }}</h-desc-item>
      </h-desc>
      <!-- 图片图谱 -->
      <h-desc id="testData" ref="testData" title="图片图谱">
        <h-upload-file style="width: 100%" v-model="pictureData" isWriteRemarks :isEdit="false"></h-upload-file>
      </h-desc>
      <!-- 试前检查 -->
      <h-desc id="testBeforCheck" ref="testBeforCheck" :bordered='false' lableWidth="110px"
              style="margin-top: 20px; margin-bottom: 20px" title="试前检查">
        <h-vex-table
          ref="beforeCheckInfo"
          :columns="columns"
          :data="beforeCheckInfo"
          :pagination="false"
          bordered
          style="width: 100%; height: 200px"
        >
        <span slot="itemRes" slot-scope="text, record">
            <h-icon v-if="record.itemRes === '2'" class='success-text' type='icon-wancheng1'/>
            <h-icon v-else-if="record.itemRes === '3'" class='danger-text' type='icon-chacha'/>
            <span v-else style="display:inline-block;width:100%;text-align: left;" v-text="record.itemRes"></span>
        </span>
        </h-vex-table>
      </h-desc>
      <!-- 试中检查 -->
      <h-desc id="testInCheck" ref="testInCheck" :bordered='false' lableWidth="110px"
              style="margin-top: 20px; margin-bottom: 20px" title="试中检查">
        <h-vex-table
          ref="inCheckInfo"
          :columns="columns"
          :data="inCheckInfo"
          :pagination="false"
          bordered
          style="width: 100%; height: 200px"
        >
          <span slot="itemRes" slot-scope="text, record">
            <h-icon v-if="record.itemRes === '2'" class='success-text' type='icon-wancheng1'/>
            <h-icon v-else-if="record.itemRes === '3'" class='danger-text' type='icon-chacha'/>
            <span v-else style="display:inline-block;width:100%;text-align: left;" v-text="record.itemRes"></span>
          </span>
        </h-vex-table>
      </h-desc>
      <!-- 试后检查 -->
      <h-desc id="testAfterCheck" ref="testAfterCheck" :bordered='false' lableWidth="110px"
              style="margin-top: 20px; margin-bottom: 20px" title="试后检查">
        <h-vex-table
          ref="afterCheckInfo"
          :columns="columns"
          :data="afterCheckInfo"
          :pagination="false"
          bordered
          style="width: 100%; height: 200px"
        >
        <span slot="itemRes" slot-scope="text, record">
          <h-icon v-if="record.itemRes === '2'" class='success-text' type='icon-wancheng1'/>
            <h-icon v-else-if="record.itemRes === '3'" class='danger-text' type='icon-chacha'/>
            <span v-else style="display:inline-block;width:100%;text-align: left;" v-text="record.itemRes"></span>
        </span>
        </h-vex-table>
      </h-desc>
      <!-- 试验数据 -->
      <h-desc id="testData" ref="testData" title="试验数据">
        <div style="height: 100%; width: 100%; overflow: auto; padding: 20px">
          <h-desc id="attachForm" :bordered="false">
            <h-form ref="attachForm" v-model="model_attach" :column="1" :formData="attachData"
                    style="width: 100%"/>
          </h-desc>
          <h-desc id="videoForm" :bordered="false">
            <h-form ref="videoForm" v-model="model_video" :column="1" :formData="videoData" style="width: 100%"/>
          </h-desc>
        </div>
      </h-desc>

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
import TestEntrustReviewPdf from "@views/hifar/hifar-environmental-test/task/modules/TestEntrustReviewPdf";
import DetailBaseInfo from "@views/hifar/hifar-environmental-test/entrustment/components/DetailBaseInfo";
import PieceDetailTemplate from "@views/hifar/hifar-environmental-test/entrustment/components/PieceDetailTemplate";
import ProjectDetailTemplate from "@views/hifar/hifar-environmental-test/entrustment/components/ProjectDetailTemplate";

export default {
  components: {
    ProjectDetailTemplate,
    PieceDetailTemplate,
    TestEntrustReviewPdf, AbnormalRecordTable, TerminationRecordTable, TestReportInfo, DetailBaseInfo
  },
  mixins: [mixin],
  props: {
    testId: {
      type: String,
      default: '',
    },
    viewDetailType: {
      type: String,
      default: '',
    },
    top: {
      type: String,
      default: '',
    },
    showExceptionAndEnd: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      moment,
      activeTab: 0,
      checkId: '',
      url: {
        detail: '/HfEnvTaskTestBusiness/queryById',
        CheckInfo: '/HfEnvTaskTestBusiness/queryTestCheckItem',
        // 试验数据
        attachList: '/MinioBusiness/listByRefId',
        delete: '/MinioBusiness/logicRemoveById',
      },
      detailData: {},
      projectInfo: [],
      testEquipInfo: [],
      testPersonInfo: [],
      entrustInfo: [{flag: false}],
      entrustInfoItem: {},
      title: '',
      model_attach: {},
      model_video: {},
      visible: false,
      columns: [
        {
          title: '检查项名称',
          align: 'left',
          dataIndex: 'itemName',
          minWidth: 10,
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '检查项内容',
          align: 'left',
          dataIndex: 'itemContent',
          minWidth: 10,
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '检查项要求',
          align: 'left',
          dataIndex: 'itemRequire',
          minWidth: 25,
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '检查结果',
          align: 'left',
          dataIndex: 'itemRes',
          minWidth: 10,
          scopedSlots: {customRender: 'itemRes'},
        },
        {
          title: '检查人',
          align: 'left',
          dataIndex: 'fillUserName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '复核人',
          align: 'left',
          dataIndex: 'checkUserName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
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
      // 附件
      attachData: [
        {
          title: '附件',
          key: 'attachIds',
          span: 1,
          component: (
            <h-upload-file
              isEdit={false}
              v-decorator={['attachIds', {initialValue: []}]}
              customParams={{refType: 'test_attach', refId: this.checkId}}
              on-delete={this.handleDelete}
            />
          ),
        },
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
              on-delete={this.handleDelete}
            />
          ),
        },
      ],
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
      },
    },
  },
  methods: {
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
              let res = item.testUserName ? (item.testUserName + (item.testPostName ? +'(' + item.testPostName + ')' : '')) : '--'
              testPersonInfo.push(res)
            })
          }
          this.testEquipInfo = testEquipInfo
          this.testPersonInfo = testPersonInfo
          this.entrustInfoItem = entrustInfoArr[0]
          let entrustInfo = entrustInfoArr
          if (this.showExceptionAndEnd) {
            entrustInfo.push(
              {title: "报告信息", flag: true, type: "report"},
              {title: "异常记录", flag: true, type: "exception"},
              {title: "终止记录", flag: true, type: "end"},
            )
          }
          this.entrustInfo = entrustInfo
        }
      })
    },
    // 图片
    loadImgData() {
      postAction(this.url.attachList, {refType: 'test_picture', refId: this.checkId}).then((res) => {
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
    // 附件
    loadAttachData() {
      postAction(this.url.attachList, {refType: 'test_attach', refId: this.checkId}).then((res) => {
        if (res.code === 200) {
          const {data} = res
          let fileArr = []
          let obj = {}
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
                type: item.viewType == 2 ? 'image/jpeg' : 'text/plain',
              })
            })
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
                type: item.viewType == 2 ? 'image/jpeg' : 'text/plain',
              })
            })
          }
          obj.attachIds = fileArr
          this.model_video = obj
        }
      })
    },
    // 图片删除
    handleDelete(file, fileList) {
      postAction(this.url.delete, {id: file.fileId}).then(res => {
        if (res.code === 200) {
          this.$message.success('删除成功')
        }
      })
    },
  },
}
</script>
<style lang='less' scoped>
/deep/ .ant-tabs {
  position: initial !important;
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