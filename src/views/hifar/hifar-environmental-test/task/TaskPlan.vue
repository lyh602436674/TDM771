<!--
* @Author: 陈乾龙
* @Date: 2021-09-17 18:26:11
* @LastEditTime: 2021-11-30 10:25:27
* @LastEditors: 马潭龙
* @Description: 试验计划
* @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\TaskPlan.vue
-->
<template>
  <div ref="taskPlan" class="task-plan">
    <h-card fixed>
      <div slot="content" class="task-plan-wrapper">
        <div :class="['task-plan-collapse', !collapse && 'task-plan-collapse-active']">
          <a-button
            :icon="collapse ? 'vertical-align-top' : 'vertical-align-bottom'"
            :type="collapse ? 'primary' : 'danger'"
            size="small"
            @click="handleHeaderCollapse"
          >
            {{ collapse ? '收起' : '展开' }}
          </a-button>
        </div>
        <div :class="['task-plan-header', !collapse && 'task-plan-header-collapse']">
          <div class="task-plan-pie">
            <h-pie :options="options" :title="pieTitle" :toolbox="toolbox" type="pie"/>
          </div>
          <div class="task-plan-calendar">
            <a-calendar
              v-if="!loading"
              v-model="calendarDate"
              :fullscreen="true"
              :mode="queryParams.type"
              @panelChange="onPanelChange"
              @select="handleQueryTaskList"
            >
              <div v-if="getListData(value)" slot="dateCellRender" slot-scope="value" class="events">
                <span v-if="getListData(value).waitDistributeOverNum > 0" class="danger-text">
                  {{ getListData(value).waitDistributeOverNum }}
                </span>
                <span v-else class="success-text"> {{ getListData(value).waitDistributeNum }} </span>/
                <span>{{ getListData(value).totalNum }}</span>
              </div>
              <template v-if="getMonthData(value)" slot="monthCellRender" slot-scope="value">
                <span v-if="getMonthData(value).waitDistributeOverNum > 0" class="danger-text">
                  {{ getMonthData(value).waitDistributeOverNum }}
                </span>
                <span v-else class="success-text"> {{ getMonthData(value).waitDistributeNum }} </span>/
                <span>{{ getMonthData(value).totalNum }}</span>
              </template>
            </a-calendar>
            <a-popover class="instruction">
              <template slot="content">

                <div>
                  <a-badge color="#2f54eb" text="未分配"/>
                </div>
                <div>
                  <a-badge color="#f56c6c" text="超期"/>
                </div>
                <div>
                  <a-badge color="#333" text="所有任务"/>
                </div>
              </template>
              <div style="display: flex; justify-content: center; align-items: center; color: #9f9f9f">
                <a-icon class="primary-text" style="margin-right: 5px; font-size: 18px" type="question-circle"/>
                说明
              </div>
            </a-popover>
          </div>
        </div>
        <div :class="['task-plan-list', !collapse && 'task-plan-list-full']">
          <h-card :bordered="false" fixed>
            <h-search
              slot="search-form"
              v-model="queryParams"
              :data="searchForm"
              :separateReload="true"
              style="width: 100%"
              @change="refresh"
              @reload="handleReload"
            />
            <div slot="table-operator" v-has="'TaskPlan:allocation'">
              <a-button icon="control" size="small" type="primary" @click="handleShowTaskArrangement">
                分配任务
              </a-button>
            </div>
            <h-vex-table
              ref="taskPlanListTable"
              slot="content"
              :columns="columns"
              :data="loadData"
              :height="!collapse ? '100%' : '345'"
              :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelect }"
            >
              <template slot="status" slot-scope="text, record">
                <a-badge v-if="record.status == 1" color="geekblue" text="未分配"/>
                <a-badge v-else-if="record.status == 10" color="green" text="已分配"/>
                <a-badge v-else-if="record.status == 15" color="cyan" text="执行中"/>
                <a-badge v-else-if="record.status == 20" color="volcano" text="已终止"/>
                <a-badge v-else-if="record.status == 30" color="grey" text="已完成"/>
                <a-badge v-else-if="record.status == 99" color="red" text="删除"/>
              </template>
              <template slot="productNames" slot-scope="text, record">
                <span>{{ record.productNames }}-{{ record.productAliass }}</span>
              </template>
              <span slot="entrustNo" slot-scope="text, record">
                <a @click="$refs.taskDetail.show(record,'1')" v-if="text">
                  <h-icon :type="record.alert ? 'icon-jingbaobaojing2' : ''" style="font-size: 20px"/>
                  <span :style="{ marginLeft: record.alert ? 0 : '20px' }">{{ text }}</span>
                </a>
                <span v-else> -- </span>
              </span>
              <span slot="entrustCode" slot-scope="text, record">
                <a @click="$refs.taskDetail.show(record)" v-if="text">{{ text ? text : '--' }}</a>
                <span v-else> -- </span>
              </span>
              <span slot="testNum" slot-scope="text, record">
                <a v-if="text" @click="$refs.TestInfoListModal.show(record)">
                  {{ text }}
                </a>
                <span v-else> -- </span>
              </span>
              <template slot="actions" slot-scope="text, record">

                <a-tooltip title="详情">
                  <a-icon class="primary-text" type="eye" @click="$refs.taskDetail.show(record)"/>
                </a-tooltip>

                <a-divider type="vertical"/>

                <a-tooltip title="分配">
                  <a-icon v-has="'TaskPlan:allocation'" class="primary-text" type="control"
                          @click="() => showTaskArrangement(record)"/>
                </a-tooltip>

                <a-divider type="vertical"/>

                <a-tooltip title="终止">
                  <a-icon class="primary-text" type="pause" @click="$refs.taskForceEnd.show('forceEnd', record)"/>
                </a-tooltip>

              </template>
            </h-vex-table>
          </h-card>
        </div>
      </div>
    </h-card>
    <task-arrangement ref="taskArrangement" @change="handleRefresh"></task-arrangement>
    <task-detail ref="taskDetail"/>
    <work-center-detail-modal ref="WorkCenterDetailModal"/>
    <test-info-list-modal ref="TestInfoListModal" @change="refhandleBack"/>
    <task-force-end-modal ref="taskForceEnd" :forceEndUrl="url.forceEnd" :testDetailUrl="url.testDetail"
                          @change="handleRefresh"/>
  </div>
</template>

<script>
import {postAction} from '@/api/manage'
import moment from 'moment'
import HPie from '@/components/HChart/HPie'
import TaskArrangement from './modules/TaskArrangementModal.vue'
import TaskDetail from './modules/TaskDetail'
import TestInfoListModal from './modules/TestInfoListModal'
import WorkCenterDetailModal from '../components/WorkCenterDetailModal.vue'
import TaskForceEndModal from './modules/TaskForceEndModal.vue'
import {find} from 'lodash'

export default {
  provide() {
    return {
      getContainer: () => this.$refs.taskPlan,
      centerId: () => {
        return this.centerId
      },
    }
  },
  components: {HPie, TaskArrangement, TaskDetail, WorkCenterDetailModal, TestInfoListModal, TaskForceEndModal,},
  data() {
    return {
      collapse: true,
      centerId: null,
      queryParams: {
        type: 'month',
      },
      searchForm: [
        {
          title: '运行单号',
          key: 'c_entrustCode_7',
          formType: 'input',
        },
        {
          title: '委托单号',
          key: 'c_entrustNo_7',
          formType: 'input',
        },
        {
          title: '委托单位',
          key: 'c_custName_7',
          formType: 'input',
        },
        {
          title: '任务编号',
          key: 'c_taskCode_7',
          formType: 'input',
        },
        {
          title: '任务状态',
          key: 'c_status_1',
          formType: 'select',
          options: [
            {
              title: '未分配',
              key: '1',
              value: '1',
            },
            {
              title: '已分配',
              key: '10',
              value: '10',
            },
            {
              title: '执行中',
              key: '15',
              value: '15',
            },
            {
              title: '已终止',
              key: '20',
              value: '20',
            },
            {
              title: '已完成',
              key: '30',
              value: '30',
            },
          ],
        },
        {
          title: '样品名称',
          key: 'productName',
          formType: 'input',
        },
        {
          title: '样品代号',
          key: 'productAlias',
          formType: 'input',
        },
        {
          title: '试验项目',
          key: 'c_unitName_7',
          formType: 'input',
        },
      ],
      columns: [
        {
          title: '运行单号',
          dataIndex: 'entrustCode',
          minWidth: 140,
          scopedSlots: {
            customRender: 'entrustCode',
          },
        },
        {
          title: '委托单号',
          dataIndex: 'entrustNo',
          minWidth: 160,
          scopedSlots: {
            customRender: 'entrustNo',
          },
        },
        {
          title: '委托单位',
          dataIndex: 'custName',
          minWidth: 120,
        },
        {
          title: '任务状态',
          dataIndex: 'status',
          scopedSlots: {
            customRender: 'status',
          },
          minWidth: 100,
        },
        {
          title: '试验项目',
          dataIndex: 'unitName',
          minWidth: 100,
        },
        {
          title: '试验',
          dataIndex: 'testNum',
          minWidth: 100,
          align: 'center',
          scopedSlots: {
            customRender: 'testNum',
          },
        },
        {
          title: "样品名称",
          align: "left",
          dataIndex: "productNames",
          minWidth: 100,
          customRender: (text, record) => {
            return text || "--";
          },
        },
        {
          title: "型号/规格",
          align: "left",
          dataIndex: "productModels",
          minWidth: 100,
          customRender: (text, record) => {
            return text || "--";
          },
        },
        {
          title: "图号",
          align: "left",
          dataIndex: "productAliass",
          minWidth: 100,
          customRender: (text, record) => {
            return text || "--";
          },
        },
        {
          title: "样品编号",
          align: "left",
          dataIndex: "pieceNo",
          minWidth: 100,
          customRender: (text, record) => {
            return text || "--";
          },
        },
        {
          title: '数量',
          dataIndex: 'productNums',
          minWidth: 100,
          align: 'center',
        },
        {
          title: '异常数量',
          minWidth: 100,
          dataIndex: 'exceptionNum',
          align: 'center',
        },
        {
          title: '检测依据',
          dataIndex: 'standardName',
          minWidth: 150,
        },
        {
          title: '委托日期',
          dataIndex: 'entrustTime',
          minWidth: 160,
          customRender: (text) => {
            return text && text != 0 ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '委托单创建日期',
          dataIndex: 'entrustCreateTime',
          minWidth: 160,
          customRender: (text) => {
            return text && text != 0 ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          width: 120,
          scopedSlots: {
            customRender: 'actions',
          },
        },
      ],
      url: {
        taskStatistics: '/HfEnvTaskBusiness/taskStatistics',
        list: '/HfEnvTaskBusiness/listPage',
        forceEnd: '/HfEnvTaskTestBusiness/forceEnd',
        testDetail: '/HfEnvTaskTestBusiness/queryById',
      },
      selectedRowKeys: [],
      selectedRows: [],
      pieTitle: '任务统计',
      localOption: {},
      options: {},
      toolbox: {
        show: true,
        feature: {
          myTool2: {
            title: '柱状图',
            icon: 'path://M320 352H64v480h256V352z m-64 416H128V416h128v352zM640 64H384v768h256V64z m-64 704H448V128h128v640zM64 896h896v64H64z m640-64h256V224H704v608z m64-544h128v480H768V288z',
            onclick: () => {
              this.chartType = 'bar'
              this.getTaskStatistics()
            },
          },
          myTool1: {
            title: '饼状图',
            icon: 'path://M512 0v512h512A512 512 0 0 0 512 0z m102.4 115.2A409.6 409.6 0 0 1 908.8 409.6H614.4z M460.8 102.4a460.8 460.8 0 1 0 460.8 460.8H460.8z',
            onclick: () => {
              this.chartType = 'pie'
              this.getTaskStatistics()
            },
          },
        },
      },
      taskTimeCount: [],
      calendarDate: moment(),
      calendarMode: 'month',
      loading: false,
      chartType: 'bar',
    }
  },
  created() {
    this.getTaskStatistics()
  },
  methods: {
    getTaskStatistics() {
      if (this.loading) return
      this.loading = true
      let params = {
        ...this.queryParams,
      }
      switch (this.queryParams.type) {
        case 'year':
          params.dateStr = this.calendarDate.format('YYYY')
          break
        case 'month':
          params.isDay ? params.dateStr = this.calendarDate.format('YYYY-MM-DD') : params.dateStr = this.calendarDate.format('YYYY-MM')
          break
      }
      postAction(this.url.taskStatistics, params).then((res) => {
          if (res.code === 200) {
            let {waitDistributeTaskPieCount, taskTimeCount} = res.data
            if (this.chartType === 'pie') {
              let pieData = waitDistributeTaskPieCount.map((item) => {
                return {
                  value: parseInt(item.taskNum),
                  name: item.unitName,
                  unitId: item.unitId,
                }
              })
              this.options = Object.assign({}, this.localOption, {
                toolbox: this.toolbox,
                series: [
                  {
                    type: 'pie',
                    radius: '50%',
                    data: pieData,
                    label: {
                      show: true,
                      position: 'outside',
                      formatter: '{b},数量{c}：{d}%',
                      textStyle: {
                        align: 'top',
                        baseline: 'middle',
                        fontFamily: '微软雅黑',
                        fontSize: 12,
                        fontWeight: 'bolder',
                      },
                    },
                  },
                ],
              })
            } else if (this.chartType === 'bar') {
              let barData = [],
                xAxisData = []
              waitDistributeTaskPieCount.map((item) => {
                barData.push(item.taskNum)
                xAxisData.push(item.unitName)
              })
              this.options = Object.assign({}, this.localOption, {
                toolbox: this.toolbox,
                xAxis: {
                  type: 'category',
                  axisLabel: {
                    interval: 0,
                    rotate: xAxisData.length > 5 ? 30 : 0,
                  },
                  data: xAxisData,
                },
                tooltip: {
                  trigger: 'axis',
                  axisPointer: {
                    type: 'shadow',
                  },
                },
                yAxis: {},
                series: [
                  {
                    type: 'bar',
                    data: barData,
                    label: {
                      show: true,
                      distance:10,
                      position: 'outside',
                      formatter: '数量{c}',
                      textStyle: {
                        align: 'center',
                        baseline: 'middle',
                        fontFamily: '微软雅黑',
                        fontSize: 12,
                        fontWeight: 'bolder',
                      },
                    },
                  },
                ],
              })
            }
            this.taskTimeCount = taskTimeCount
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    getListData(value) {
      let date = value.format('YYYY-MM-DD')
      let taskCount = find(this.taskTimeCount, (obj) => {
        return obj.countTime == date
      })
      if (taskCount) {
        if (!taskCount.totalNum) {
          return null
        }
        if (taskCount.waitOverNum) {
          return {
            color: '#f50',
            totalNum: taskCount.totalNum || 0,
            distributeNum: taskCount.distributeNum || 0,
            waitOverNum: taskCount.waitOverNum || 0,
            waitDistributeNum: taskCount.waitDistributeNum || 0,
            waitDistributeOverNum: taskCount.waitDistributeOverNum || 0,
          }
        } else {
          return {
            color: '#87d068',
            totalNum: taskCount.totalNum || 0,
            distributeNum: taskCount.distributeNum || 0,
            waitOverNum: taskCount.waitOverNum || 0,
            waitDistributeNum: taskCount.waitDistributeNum || 0,
            waitDistributeOverNum: taskCount.waitDistributeOverNum || 0,
          }
        }
      }
      return null
    },
    getMonthData(value) {
      let date = value.format('YYYY-MM')
      let taskCount = find(this.taskTimeCount, (obj) => {
        return obj.countTime == date
      })
      if (taskCount) {
        if (!taskCount.totalNum) {
          return null
        }
        if (taskCount.waitOverNum) {
          return {
            color: '#f50',
            totalNum: taskCount.totalNum || 0,
            distributeNum: taskCount.distributeNum || 0,
            waitOverNum: taskCount.waitOverNum || 0,
            waitDistributeNum: taskCount.waitDistributeNum || 0,
            waitDistributeOverNum: taskCount.waitDistributeOverNum,
          }
        } else {
          return {
            color: '#87d068',
            totalNum: taskCount.totalNum || 0,
            distributeNum: taskCount.distributeNum || 0,
            waitOverNum: taskCount.waitOverNum || 0,
            waitDistributeNum: taskCount.waitDistributeNum || 0,
            waitDistributeOverNum: taskCount.waitDistributeOverNum || 0,
          }
        }
      }
      return null
    },
    handleRefresh(bool) {
      this.getTaskStatistics()
      this.refresh(bool)
    },
    refhandleBack(bool) {
      this.loadData()
      this.refresh(bool)
    },
    refresh(bool = true) {
      this.$refs.taskPlanListTable.refresh(bool)
    },
    loadData(params) {
      this.selectedRowKeys = []
      this.selectedRows = []
      let data = {
        c_status_2: "30", // 过滤掉已完成的
        ...params,
        ...this.queryParams,
      }
      switch (data.type) {
        case 'year':
          data.dateStr = this.calendarDate.format('YYYY')
          break
        case 'month':
          data.isDay ? data.dateStr = this.calendarDate.format('YYYY-MM-DD') : data.dateStr = this.calendarDate.format('YYYY-MM')
          break
      }
      return postAction(this.url.list, data).then((res) => {
        if (res.code === 200) {
          return res.data
        }
      })
    },
    onSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    onPanelChange(value, mode) {
      this.calendarDate = value
      this.queryParams.type = mode
      this.queryParams.isDay = false
      this.refresh(true)
      this.getTaskStatistics()
    },

    showTaskArrangement(record) {
      this.centerId = record.workId
      this.$refs.taskArrangement.show(record)
    },
    handleShowTaskArrangement() {
      if (!this.selectedRowKeys.length) {
        this.$message.warning('请先选择需要分配的任务')
        return
      }
      for (let i = 0, len = this.selectedRows.length; i < len; i++) {
        let task = this.selectedRows[i]
        if (i + 1 < len && task.unitId !== this.selectedRows[i + 1].unitId) {
          this.$message.error('所选任务的试验项目必须为同一类试验项目')
          return
        }
        // if (+task.status !== 1) {
        //   return this.$message.error('委托单号' + task.entrustCode + '任务不可再分配')
        // }
      }
      let record = Object.assign({}, this.selectedRows[0])
      record.id = this.selectedRowKeys.join(',')
      this.$refs.taskArrangement.show(record)
    },
    handleQueryTaskList(value) {
      let date = null
      if (this.queryParams.type === 'year') {
        date = value.format('YYYY-MM')
      } else if (this.queryParams.type === 'month') {
        date = value.format('YYYY-MM-DD')
      }
      this.queryParams.dateStr = date
      this.queryParams.isDay = true
      this.refresh(true)
      this.getTaskStatistics()
    },
    handleHeaderCollapse() {
      this.collapse = !this.collapse
    },
    handleReload() {
      this.queryParams = {
        type: this.queryParams.type,
      }
      this.refresh(true)
    },
  },
}
</script>
<style lang="less">
.task-plan {
  width: 100%;
  height: 100%;
  position: relative;

  .h-card {
    .ant-card-body {
      padding: 0;
    }
  }
}

.task-plan-wrapper {
  width: 100%;
  height: 100%;
  overflow: auto;

  .task-plan-header {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    width: 100%;
    transition: all 0.6s linear;
    margin-bottom: 10px;

    .task-plan-pie {
      flex: 1;
      align-self: stretch;
    }

    .task-plan-calendar {
      width: 520px;
      height: 380px;
      align-self: stretch;
      overflow: hidden;
      position: relative;

      .instruction {
        position: absolute;
        top: 12px;
        left: 30px;
        z-index: 9;
      }
    }

    &-collapse {
      height: 0;
      margin: 0;
      overflow: hidden;
    }
  }

  .task-plan-list {
    width: 100%;
    flex: 1;

    &-full {
      height: calc(100% - 35px);
    }
  }

  .ant-fullcalendar-fullscreen {
    position: relative;
    height: 100%;
    width: 100%;
    padding-top: 40px;

    .ant-fullcalendar-header {
      position: absolute;
      top: 0;
      left: 0;
      padding: 3px;
      width: 100%;
      z-index: 1;
      background: #fff;
    }

    .ant-fullcalendar {
      height: 100%;
      overflow: auto;
      padding: 0;
    }

    .ant-fullcalendar-month,
    .ant-fullcalendar-date {
      height: auto;
      padding: 0;
    }

    .ant-fullcalendar-content {
      height: 22px;
    }
  }

  .task-plan-collapse {
    margin: 0 5px 5px 0;
    text-align: right;
    overflow: hidden;

    &-active {
      background: rgba(@primary-color, 0.6);
      border-radius: @border-radius-base;
    }
  }
}
</style>
<style scoped>

>>> .h-vex-table-wrapper_wrapper ::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
</style>
