<!--
 * @Author: 赵峰
 * @Date: 2021-09-17 18:16:59
 * @LastEditTime: 2021-11-19 11:25:52
 * @LastEditors: 赵峰
 * @Descripttion: 委托单详情
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\entrustment\modules\EntrustmentDetailModal.vue
-->
<template>
  <h-modal
    :visible='visible'
    title='委托单详情'
    inner
    width='90%'
    :bodyStyle='bodyStyle'
    destroyOnClose
    :fullScreen='fullScreen'
    :getContainer='getContainer'
    @cancel='handleCancel'
  >
    <div class='fullscreenIcon' @click='fullScreenHandle'>
      <a-icon :type="!fullScreen ? 'fullscreen' : 'fullscreen-exit'" class='primary-text' style='font-size: 16px;'/>
    </div>
    <div class='footer' slot='footer'>
      <a-button @click='handleCancel' type='ghost-danger' style='margin-right: 8px'> 关闭</a-button>
    </div>
    <a-spin :spinning='spinning'>
      <h-card :bordered='false'>
        <a-steps :current='current' size='small'>
          <a-step v-for='item in steps' :key='item.title' :title='item.title'/>
        </a-steps>
        <h-tabs :activeKey='activeKey' :animated='true' @change='handleTabsChange'>
          <a-tab-pane key='1' :tab='viewDetailType === "1" ? "委托信息" : "运行单信息"'>
            <entrust-detail ref='EntrustDetail' :detailData='detailData'></entrust-detail>
          </a-tab-pane>
          <a-tab-pane key='3' tab='试验信息'
                      v-if="[20,40,50,80].includes(detailData.status)">
            <test-task-info ref='TaskInfo' :entrustType="detailData.entrustType" :entrustId='entrustId'
                            class='autoHeight'></test-task-info>
          </a-tab-pane>
          <a-tab-pane key='4' tab='报告信息'
                      v-if="viewDetailType !== '1' && (detailData.status === 40 || isSubpackage)">
            <a-button
              v-if="viewDetailType !== '1' && isSubpackage"
              @click='addReport(detailData.id)'
              type='primary' style="margin: 0 5px 10px">添加
            </a-button>
            <report-info ref='ReportInfo' :entrustCode='detailData.entrustCode'
                         :isExternalManage="isSubpackage" class='autoHeight'></report-info>
          </a-tab-pane>
          <!--        委托单预览 功能只在非草稿状态和外部委托单下显示-->
          <a-tab-pane key='5' tab='委托单预览' v-if='detailData.status !== 1 && detailData.entrustType === "2"'>
            <div class='autoHeight'>
              <iframe
                v-if='detailData.reportPath'
                ref='iframe'
                scrolling='auto'
                width='100%'
                height='100%'
                frameborder='0'
                :src='detailData.reportPath'
              />
              <a-empty v-else style='margin-top: 160px'/>
            </div>
          </a-tab-pane>
        </h-tabs>
      </h-card>
    </a-spin>
  </h-modal>
</template>

<script>
import moment from 'moment'
import {postAction} from '@/api/manage'
import AccessInfo from '../components/AccessInfo.vue'
import TaskInfo from '../components/TaskInfo.vue'
import TestTaskInfo from '../components/TestTaskInfo.vue'
import EntrustDetail from '../components/EntrustDetail'
import ApplyInfo from '../components/ApplyInfo'
import ReportInfo from '../components/ReportInfo'

export default {
  inject: {
    getContainer: {
      default: () => document.body
    }
  },
  components: {
    AccessInfo,
    TaskInfo,
    EntrustDetail,
    ApplyInfo,
    ReportInfo,
    TestTaskInfo
  },
  data() {
    return {
      moment,
      viewDetailType: '',
      entrustCode: '',
      entrustId: '',
      flowId: '',
      activeKey: '1',
      activeKeyArr: '1',
      current: 0,
      visible: false,
      fullScreen: false,
      spinning: false,
      detailData: {},
      bodyStyle: {
        padding: '15px'
      },
      steps: [
        {
          id: 1,
          title: '委托创建'
        },
        {
          id: 2,
          title: '调度审核'
        },
        {
          id: 3,
          title: '试验'
        },
        {
          id: 4,
          title: '报告编制'
        },
        {
          id: 5,
          title: '委托结束'
        }
      ],
      url: {
        detailById: '/HfEnvEntrustBusiness/queryById',
        addReport: '/HfEnvEntrustBusiness/addReport'
      }
    }
  },
  computed: {
    isSubpackage() {
      // 项目信息中是否外包
      return Object.keys(this.detailData).length && this.detailData.projectInfo[0].isSubpackage === '1'
    }
  },
  methods: {
    addReport(id) {
      postAction(this.url.addReport, {id}).then(res => {
        if (res.code === 200) {
          this.$refs.ReportInfo.refresh();
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    show(id, type) {
      this.visible = true
      this.entrustId = id
      this.viewDetailType = type
      this.loadDetail(id, type)
    },
    handleCancel() {
      this.visible = false
      this.fullScreen = false
      this.current = 0
      this.activeKey = '1'
      this.detailData = {}
    },
    loadDetail(id, type) {
      this.spinning = true
      let url = this.url.detailById
      postAction(url, {id, type}).then((res) => {
        if (res.code == 200) {
          let record = res.data
          let status = record.status
          if (status == 10 || status == 30) {
            this.current = 1
          } else if (status == 20) {
            this.current = 2
          } else if (status == 40) {
            // 内部委托单不出报告，所以到了待出报告状态就代表已完成
            if (record.entrustType === '1') {
              this.current = 4
            } else {
              this.current = 3
            }
          } else if (status == 50) {
            this.current = 4
          }
          this.entrustCode = record.entrustCode
          let fileInfo = record.fileInfo
          let fileArr = []
          if (fileInfo && fileInfo.length > 0) {
            fileInfo.forEach((item) => {
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
                type: item.viewType == 2 ? 'image/jpeg' : 'text/plain'
              })
            })
          }
          record.fileInfo = fileArr ? fileArr : [];
          this.detailData = record
          this.flowId = record.flowId
        }
      }).finally(() => {
        this.spinning = false
      })
    },
    handleTabsChange(v) {
      this.activeKey = v
    },
    fullScreenHandle() {
      this.fullScreen = !this.fullScreen
    }
  }
}
</script>
<style lang='less' scoped>
.title {
  margin-bottom: 20px;
  color: rgba(0, 0, 0, 0.85);
  font-weight: 700;
  font-size: 16px;
  line-height: 1.5;
}

.autoHeight {
  min-height: 700px;
  height: 800px;
}

.h-modal-fullScreen .ant-modal-content .ant-modal-close-x {
  line-height: 56px !important;
}

iframe {
  position: absolute;
  top: 48px;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
  border: 0;
}
</style>