<!--
 * @Author: 赵峰
 * @Date: 2021-09-18 09:54:28
 * @LastEditTime: 2021-09-18 09:54:28
 * @LastEditors: 赵峰
 * @Descripttion: 审核信息
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\entrustment\components\ApplyInfo.vue
-->
<template>
  <h-card :bordered="true" class="my-task-modal">
    <div class="task-info" v-if="flowId">
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
                  :title="`${item.userName} ${moment(parseFloat(item.updateTime)).format('YYYY-MM-DD HH:mm:ss')} `"
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
    <a-empty v-else style="margin-top:200px;"></a-empty>
  </h-card>
</template>

<script>
import moment from 'moment'
import { postAction } from '@/api/manage'
import FlowDrawer from '@/views/hifar/flowProcess/components/FlowDrawer.vue'
export default {
  components: { FlowDrawer },
  props: {
    flowId: {
      type: String,
      default: '',
    },
  },
  watch: {
    flowId: {
      immediate: true,
      handler(val) {
        if (val) {
          this.getProcessInfo(val)
        }
      },
    },
  },
  data() {
    return {
      moment,
      url: {
        proList: '/FlowBusiness/queryPriPrdTask',
      },
      // 处理意见
      opinion: null,
      // 历史审核记录
      taskHisList: [],
    }
  },
  methods: {
    getProcessInfo(flowId) {
      let params = {
        priId: flowId,
      }
      postAction(this.url.proList, params).then((res) => {
        if (res.code == 200) {
          let { proData, taskHisList, taskList } = res.data
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