<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-29 14:29:41
 * @LastEditTime: 2021-11-22 15:54:12
 * @LastEditors: 马潭龙
 * @Description: 任务详情
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\TaskDetail.vue
-->
<template>
  <h-modal
    fullScreen
    :getContainer="getContainer"
    destroyOnClose
    :visible="visible"
    inner
    title="委托任务详情"
    @cancel="handleCancel"
  >
    <h-tabs :activeKey='activeKey' :animated='true' @change='handleTabsChange'>
      <a-tab-pane key='1' tab='委托信息'>
        <a-spin :spinning="spinning">
          <div class="task-detail-wrapper">
            <div id="entrust" class="task-info">
              <detail-base-info showPreviewBtn :detailDataObj="model.entrustData"
                                :attachInfo="model.attachInfo"></detail-base-info>
            </div>
            <div id="product" class="piece-info">
              <piece-detail-template :dataSource="pieceInfo"
                                     :entrust-type="model.entrustData && model.entrustData.entrustType || 1 "/>
            </div>
            <div id="project" class="piece-info">
              <h-desc :bordered="false" size="small" title="项目信息">
                <h-card v-for="(item, index) in projectInfo" :id="'projectItem' + index" :key="index"
                        style="margin-bottom: 10px">
                  <div slot="title">{{ item.unitName }}</div>
                  <template slot="content">
                    <project-detail-template :model="item" title=""></project-detail-template>
                  </template>
                </h-card>
              </h-desc>
            </div>
            <div id="testInfo" class="test-info">
              <h-desc title="试验信息">
                <a-table
                  :columns="equipColumns"
                  :dataSource="equipTestInfo"
                  :pagination="false"
                  bordered
                  rowKey="id"
                  size="small"
                  style="width: 100%; height: 100%"
                >
                  <a-icon
                    slot="record"
                    slot-scope="text, record"
                    class="primary-text"
                    type="carry-out"
                    @click="showRecord(record)"
                  />
                </a-table>
              </h-desc>
            </div>
          </div>
          <hf-elevator-layer :layer-columns="layerColumns"></hf-elevator-layer>
        </a-spin>
      </a-tab-pane>
      <a-tab-pane key='2' tab='流转信息'>
        <entrust-flow-info-table :entrustId='model.entrustId'></entrust-flow-info-table>
      </a-tab-pane>
    </h-tabs>
    <div slot="footer">
      <a-button type="ghost-danger" @click="handleCancel">关闭</a-button>
    </div>
    <pieces-record ref="piecesRecord"/>
    <test-entrust-review-pdf ref="testEntrustReviewPdf"/>
  </h-modal>
</template>

<script>
import {postAction} from '@/api/manage'
import moment from 'moment'
import PiecesRecord from './PiecesRecord'
import mixin from '@/views/hifar/mixin.js'
import TestEntrustReviewPdf from "@views/hifar/hifar-environmental-test/task/modules/TestEntrustReviewPdf";
import DetailBaseInfo from "@views/hifar/hifar-environmental-test/entrustment/components/DetailBaseInfo";
import PieceDetailTemplate from "@views/hifar/hifar-environmental-test/entrustment/components/PieceDetailTemplate";
import ProjectDetailTemplate from "@views/hifar/hifar-environmental-test/entrustment/components/ProjectDetailTemplate";
import HfElevatorLayer from "@comp/HfElevatorLayer";
import {dateTimeFormatByStamp} from "@/utils/util";
import EntrustDetail from "@views/hifar/hifar-environmental-test/entrustment/components/EntrustDetail.vue";
import ReportInfo from "@views/hifar/hifar-environmental-test/entrustment/components/ReportInfo.vue";
import EntrustFlowInfoTable
  from "@views/hifar/hifar-environmental-test/entrustment/components/EntrustFlowInfoTable.vue";
import TestTaskInfo from "@views/hifar/hifar-environmental-test/entrustment/components/TestTaskInfo.vue";

export default {
  mixins: [mixin],
  provide() {
    return {
      getContainer: () => document.body,
    }
  },
  inject: {
    getContainer: {
      default: () => {
        return () => document.body
      },
    },
  },
  components: {
    TestTaskInfo, EntrustFlowInfoTable, ReportInfo, EntrustDetail,
    ProjectDetailTemplate,
    PieceDetailTemplate,
    PiecesRecord, TestEntrustReviewPdf, DetailBaseInfo,
    HfElevatorLayer
  },
  data() {
    return {
      moment,
      activeKey: "1",
      visible: false,
      spinning: false,
      model: {},
      pieceInfo: [],
      equipTestInfo: [],
      projectInfo: [],
      layerColumns: [],
      url: {
        detail: '/HfEnvTaskBusiness/queryById',
      },
      equipColumns: [
        {
          title: '设备名称',
          dataIndex: 'equipName',
        },
        {
          title: '设备编号',
          dataIndex: 'equipCode',
        },
        {
          title: '设备类型',
          dataIndex: 'equipTypeName',
        },
        {
          title: '内部名称',
          dataIndex: 'innerName',
        },
        {
          title: '实际开始时间',
          dataIndex: 'realStartTime',
          customRender: text => dateTimeFormatByStamp(text)
        },
        {
          title: '实际结束时间',
          dataIndex: 'realEndTime',
          customRender: text => dateTimeFormatByStamp(text)
        },
        {
          title: '流转记录',
          dataIndex: 'record',
          fixed: 'right',
          align: 'center',
          width: 80,
          scopedSlots: {
            customRender: 'record',
          },
        },
      ],
    }
  },
  methods: {
    show(record = {}, type) {
      this.visible = true
      this.model = Object.assign({}, record)
      this.title = record.taskCode + '详情'
      this.getTaskDetail(type)
    },
    handleTabsChange(v) {
      this.activeKey = v
    },
    getTaskDetail(type) {
      this.spinning = true
      let params = {
        id: this.model.id,
        type,
      }
      postAction(this.url.detail, params).then((res) => {
        if (res.code === 200) {
          this.model = Object.assign({}, this.model, res.data)
          this.pieceInfo = res.data.pieceInfo || []
          this.equipTestInfo = res.data.equipTestInfo || []
          this.projectInfo = res.data.projectInfo || []
          this.buildLayer(this.projectInfo)
        }
      }).finally(() => {
        this.spinning = false
      })
    },
    showRecord(record) {
      this.$refs.piecesRecord.show(record)
    },
    handleCancel() {
      this.visible = false
      this.pieceInfo = []
      this.equipTestInfo = []
      this.projectInfo = []

    },
    buildLayer(column) {
      let defaultLayer = [
        {
          title: "基本信息",
          id: "entrust"
        },
        {
          title: "产品信息",
          id: "product"
        },
        {
          title: "项目信息",
          id: "project"
        },
      ]
      let otherLayer = [
        {
          title: "试验信息",
          id: "testInfo"
        },
      ]
      this.layerColumns = []
      column && column.length && column.forEach((item, index) => {
        defaultLayer.push({
          title: item.unitName || item.testName,
          id: 'projectItem' + index
        })
      })
      this.layerColumns = defaultLayer.concat(otherLayer)
    },
  },
}
</script>

<style lang="less">
.task-detail-wrapper {
  height: 100%;
  padding: 10px;
  overflow: auto;

  .task-info,
  .piece-info,
  .test-info {
    margin-bottom: 10px;

    .ant-card-body {
      padding: 10px 0;
    }
  }
}
</style>
<style lang="less" scoped>
/deep/ .ant-table-small > .ant-table-content > .ant-table-body {
  margin: 0;
}

</style>