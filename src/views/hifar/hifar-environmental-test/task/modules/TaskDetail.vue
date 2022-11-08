<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-29 14:29:41
 * @LastEditTime: 2021-11-22 15:54:12
 * @LastEditors: 马潭龙
 * @Description: 任务详情
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\TaskDetail.vue
-->
<template>
  <div>
    <h-modal
      :fullScreen="fullScreen"
      :getContainer="getContainer"
      :visible="visible"
      title="委托任务详情"
      width="90%"
      @cancel="handleCancel"
    >
      <div class="fullscreenIcon" @click="fullScreenHandle">
        <a-icon :type="!fullScreen ? 'fullscreen' : 'fullscreen-exit'" class="primary-text" style="font-size: 16px"/>
      </div>
      <a-spin :spinning="spinning">
        <div class="task-detail-wrapper">
          <div class="task-info">
            <detail-base-info :detailDataObj="model.entrustData" :attachInfo="model.attachInfo"></detail-base-info>
          </div>
          <div class="piece-info">
            <piece-detail-template :dataSource="pieceInfo"
                                   :entrust-type="model.entrustData && model.entrustData.entrustType || 1 "/>
          </div>
          <div class="piece-info">
            <h-desc :bordered="false" size="small" title="项目信息">
              <h-card v-for="(item, index) in projectInfo" :key="index" style="margin-bottom: 10px">
                <div slot="title">{{ item.unitName }}</div>
                <template slot="content">
                  <project-detail-template :model="item" title=""></project-detail-template>
                </template>
              </h-card>
            </h-desc>
          </div>
          <div class="equip-info">
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
      </a-spin>
      <div slot="footer">
        <a-button type="ghost-danger" @click="handleCancel">关闭</a-button>
      </div>
    </h-modal>
    <pieces-record ref="piecesRecord"/>
    <test-entrust-review-pdf ref="testEntrustReviewPdf"/>
  </div>
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
    ProjectDetailTemplate,
    PieceDetailTemplate,
    PiecesRecord, TestEntrustReviewPdf, DetailBaseInfo
  },
  data() {
    return {
      moment,
      title: '--',
      visible: false,
      fullScreen: false,
      spinning: false,
      model: {},
      pieceInfo: [],
      equipTestInfo: [],
      projectInfo: [],
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
          customRender(text) {
            return text != 0 ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '实际结束时间',
          dataIndex: 'realEndTime',
          customRender(text) {
            return text != 0 ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
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
      this.model = Object.assign({}, record)
      this.title = record.taskCode + '详情'
      this.getTaskDetail(type)
      this.$nextTick(() => {
        this.visible = true
      })
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
      this.fullScreen = false
    },
    fullScreenHandle() {
      this.fullScreen = !this.fullScreen
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
  .equip-info {
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

.h-modal-fullScreen .ant-modal-content .ant-modal-close-x {
  line-height: 56px !important;
}
</style>