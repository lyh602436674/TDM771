<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-30 11:32:28
 * @LastEditTime: 2021-11-09 11:14:09
 * @LastEditors: 赵峰
 * @Description: 
 * @FilePath: \hifar-platform-client\src\views\hifar\myTask\modules\FinishedTaskDetail.vue
-->
<template>
  <h-modal
    class="my-task-modal"
    inner
    fullScreen
    destroyOnClose
    :getContainer="getContainer"
    :visible="visible"
    :title="model.proTitle || '--'"
    :footer="false"
    @cancel="handelCancel"
  >
    <a-spin :spinning="loading">
      <a-tabs tab-position="left" :activeKey="activeKey" @change="handleTablesChange">
        <a-tab-pane :key="0">
          <span slot="tab">
            <a-icon type="project" />
            附加单据
          </span>
          <div v-if="activeKey == 0" style="height: 100%; width: 100%; overflow: auto; padding: 10px 24px 10px 0">
            <dynamic-component :path="model.formPath" :id="model.busiId"></dynamic-component>
          </div>
        </a-tab-pane>
        <a-tab-pane :key="1">
          <span slot="tab">
            <a-icon type="tags" />
            任务处理
          </span>
          <div class="task-info">
            <!-- 流程图展示 -->
            <div class="task-process" style="background: #efefef">
              <flow-drawer ref="flowDrawer"></flow-drawer>
            </div>

            <div class="task-info-wrapper">
              <div class="task-history">
                <h-card fixed title="流程跟踪" :borderd="false">
                  <div style="padding: 10px 20px; height: 100%; width: 100%; overflow: auto">
                    <a-steps direction="vertical" size="small" :current="1">
                      <a-step
                        v-for="(item, index) in taskHisList"
                        :key="item.id"
                        :title="`${item.userName} ${moment(parseFloat(item.updateTime)).format(
                          'YYYY-MM-DD HH:mm:ss'
                        )} `"
                        :description="`${item.opinion}`"
                        :status="item.rsStatus == 1 ? (index == 0 ? 'process' : 'wait') : 'error'"
                      >
                        <a-icon slot="icon" :type="item.rsStatus == 1 ? 'check-circle' : 'close-circle'"></a-icon>
                      </a-step>
                    </a-steps>
                  </div>
                </h-card>
              </div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-spin>
  </h-modal>
</template>

<script>
import { postAction } from '@/api/manage'
import FlowDrawer from '../../flowProcess/components/FlowDrawer.vue'
import TaskSelectUser from '../components/TaskSelectUser.vue'
import moment from 'moment'
import DynamicComponent from '@/views/components/DynamicComponent'
export default {
  inject: {
    getContainer: {
      default: () => {
        return () => document.body
      },
    },
  },
  provide() {
    return {
      getContainer: () => this.$refs.hList,
    }
  },
  components: { FlowDrawer, TaskSelectUser, DynamicComponent },
  data() {
    return {
      moment,
      visible: false,
      loading: false,
      activeKey: 0,
      model: {},
      url: {
        detail: '/FlowBusiness/listNextData',
        proList: '/FlowBusiness/queryPriPrdTask',
        commit: '/FlowBusiness/commitTask',
        pull: '/FlowBusiness/receiveTask',
      },
      // 需要选择下一处理节点 1 需要 2 不需要
      needSelectNextNode: 2,
      nextNodeId: null,
      nextNodeList: [],
      // 需要下一处理人 1 是 2 否
      needSelectNextUser: 2,
      // 选择类型 1 选一个人 2 选择多个人
      selectNextUserType: 1,
      nextUserList: [],
      // 处理意见
      opinion: null,
      nextUsers: [],
      // 历史审核记录
      taskHisList: [],
    }
  },
  methods: {
    show(record = {}) {
      let obj = Object.assign({}, record)
      this.model = obj
      this.$nextTick(async () => {
        if (this.activeKey == 1) {
          this.getProcessInfo()
        }
        this.visible = true
      })
    },
    getProcessInfo() {
      let params = {
        priId: this.model.id,
      }
      postAction(this.url.proList, params).then((res) => {
        if (res.code == 200) {
          let { priMap, proData, taskHisList, taskList } = res.data
          this.taskHisList = taskHisList
          proData.nodeList = proData.nodeList.map((item) => {
            item.viewOnly = true
            taskHisList.map((task) => {
              console.log(task.nodeId == item.id, task)
              if (task.nodeId == item.id) {
                if (!item.updateTime) {
                  item.updateTime = 1
                }
                if (parseFloat(item.updateTime) < parseFloat(task.updateTime)) {
                  item.rsStatus = task.rsStatus
                  item.opinion = task.opinion
                  item.updateTime = task.updateTime
                  item.userName = task.userName
                }
              }
            })
            return item
          })
          this.$nextTick(() => {
            this.$refs.flowDrawer.activeElement = {
              type: 'node',
              nodeId: taskList[0] ? taskList[0].nodeId : null,
            }
            this.$refs.flowDrawer.dataReload(proData.nodeList, proData.lineList)
          })
        }
      })
    },
    handlePull() {
      let params = {
        taskId: this.model.taskId,
      }
      postAction(this.url.pull, params).then((res) => {
        if (res.code == 200) {
          this.$message.success('签收成功')
          this.getTaskInfo()
          this.getProcessInfo()
          this.model = Object.assign({}, this.model, { taskStatus: 2 })
          this.$emit('change', true)
        }
      })
    },
    handleCommit(rsStatus) {
      if (!this.opinion) {
        this.$message.error('请先填写处理意见')
        return
      }
      console.log(this.needSelectNextUser)
      if (rsStatus == 1 && this.needSelectNextNode == 1 && this.needSelectNextUser == 1 && !this.nextUsers.length) {
        this.$message.error('请设置下一步审核节点的处理人员')
        return
      }
      if (this.loading) return
      this.loading = true
      let params = {
        taskId: this.model.taskId,
        rsStatus,
        opinion: this.opinion,
        nextUsers: this.nextUsers.join(','),
        nextNodeId: this.nextNodeId,
      }
      console.log('审核提交数据', params)
      postAction(this.url.commit, params)
        .then((res) => {
          if (res.code == 200) {
            this.$message.success(rsStatus == 1 ? '审核通过' : '驳回成功')
            this.$emit('change', true)
            this.handelCancel()
          }
        })
        .finally((res) => {
          this.loading = false
        })
    },
    handleNextNodeChange(event) {
      console.log('nextNode change', event)
      let value = event.target.value
      this.nextNodeId = value
      this.getTaskInfo({ nextNodeId: this.nextNodeId })
    },
    handelCancel() {
      this.opinion = null
      this.visible = false
    },
    handleTablesChange(v) {
      this.activeKey = v
      this.$nextTick(() => {
        if (v == 1) {
          this.getProcessInfo()
        }
      })
    },
    handleAuditMindChange(v, items) {
      this.opinion = items.title
    },
  },
}
</script>
<style lang="less" scoped>
.my-task-modal {
  .task-info {
    height: 100%;
    box-sizing: border-box;
    .task-process {
      box-sizing: border-box;
      height: 40%;
      width: 100%;
      overflow: auto;
    }
    .task-info-wrapper {
      height: 60%;
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      .task-history {
        height: 100%;
        overflow: hidden;
      }
      .task-history {
        flex: 1;
        border: solid 1px @border-color-base;
        border-left: 0;
      }
    }
  }
  .custom-wrapper {
    width: 100%;
    height: 100%;
    overflow: hidden;
    padding-bottom: 46px;
    position: relative;
    .custom-footer {
      border-top: solid 1px @border-color-base;
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 46px;
      line-height: 46px;
      text-align: center;
    }
  }
  .h-list {
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 10px;
    position: relative;
    &-item {
      padding: 10px 0;
      border-bottom: solid 1px @border-color-base;
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      &:last-child {
        border-bottom: 0;
      }
      &-label {
        width: 100px;
        display: inline-block;
        padding: 0 10px;
        text-align: right;
      }
      &-content {
        flex: 1;
      }
    }
  }
}
</style>
<style lang="less">
.my-task-modal {
  .ant-spin-nested-loading,
  .ant-spin-container {
    height: 100%;
  }
  .ant-tabs-vertical {
    height: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
  }
  .ant-tabs-content {
    height: 100%;
    flex: 1;
    .ant-tabs-tabpane {
      height: 0;
      overflow: hidden;
    }
    .ant-tabs-tabpane-active {
      height: 100%;
    }
    .ant-card-body {
      padding: 0;
    }
  }
}
</style>
