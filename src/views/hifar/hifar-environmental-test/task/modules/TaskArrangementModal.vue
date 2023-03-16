<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-23 10:29:01
 * @LastEditTime: 2021-11-17 15:54:43
 * @LastEditors: 陈乾龙
 * @Description: 试验安排弹窗
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\TaskArrangementModal.vue
-->
<template>
  <div>
    <h-modal :getContainer="getContainer" :title="title" :visible="visible" fullScreen inner @cancel="handleCancel">
      <div class="task-arrangement-wrapper">
        <h-card class="task-arrangement-punchcard" fixed>
          <a-space slot="search-form" class="query-condition" size="small">
            <a-radio-group v-model="queryType" button-style="solid" size="small" @change="handleQueryTypeChange">
              <a-radio-button value="all">全部</a-radio-button>
              <a-radio-button value="yesterday">昨天</a-radio-button>
              <a-radio-button value="today">今天</a-radio-button>
              <a-radio-button value="tomorrow">明天</a-radio-button>
              <a-radio-button value="custom">自定义</a-radio-button>
            </a-radio-group>
            <a-range-picker
              v-if="queryType === 'custom'"
              v-model="queryTime"
              :allowClear="false"
              :ranges="{ '当天': [moment(), moment()], '当月': [moment().startOf('month'), moment().endOf('month')],'当年': [moment().startOf('year'), moment().endOf('year')] }"
              size="small"
              style="margin-right: 5px; width: 200px"
              @change="handleDatePickerChange"
            />
          </a-space>
          <div class="legend-wrapper">
            <template v-for="(item,index) in legendOption">
              <div :key="index" class="legend-item">
                <div :style="{backgroundColor: item.color}" class="legend-item-rect"></div>
                <div class="legend-item-text">{{ item.label }}</div>
              </div>
            </template>
          </div>
          <div class="equip-task-wrapper">
            <div id='gantt-wrapper'></div>
          </div>
        </h-card>
      </div>
      <div slot="footer" style="text-align: right">
        <a-button type="ghost-danger" @click="handleCancel">关闭</a-button>
      </div>
    </h-modal>
    <test-task-base-info-modal ref="taskDetail"/>
    <task-arrangement-form-modal ref="taskArrangementFormModal" @change="getSupportEquip"/>
  </div>
</template>

<script>
import {postAction} from '@/api/manage'
import moment from 'moment'
import {isEmpty} from 'lodash'
import TaskArrangementFormModal from './TaskArrangementFormModal.vue'
import TestTaskBaseInfoModal from "@views/hifar/hifar-environmental-test/task/TestTaskBaseInfoModal";
import {gantt} from "dhtmlx-gantt";

const testIcon = require('../assets/image/test.png')
const checkValidIcon = require('../assets/image/checkValid.png')
const unCheckValidIcon = require('../assets/image/unCheckValid.png')
export default {
  inject: {
    getContainer: {
      default: () => {
        return () => document.body
      },
    },
  },
  components: {TaskArrangementFormModal, TestTaskBaseInfoModal},
  data() {
    return {
      moment,
      visible: false,
      loading: false,
      title: '安排计划',
      columns: [],
      queryParams: {},
      queryType: 'all',
      queryTime: [moment().startOf('day'), moment().endOf('day')],
      url: {
        equipList: '/HfEnvTaskBusiness/taskMatchEquipList',
      },
      model: {},
      equipList: [],
      taskList: [],
      selectedData: [],
      legendOption: [
        {key: "0", label: "超期", color: "#FF5319"},
        {key: "1", label: "未开始", color: "#006BFF"},
        {key: "20", label: "执行中", color: "#67C23A"},
        {key: "30", label: "暂停", color: "#a9a9a9"},
      ],
      minShowStartTime: 0,
      maxShowEndTime: 0,
    }
  },
  beforeRouteLeave(to, from, next) {
    this.destroyTooltip()
    next();
  },
  methods: {
    show(record = {}) {
      this.localTaskId = record.id || ''
      this.title = `${record.testName || record.unitName} (试品数量:${record.productNums})`
      this.model = Object.assign({}, record, {
        predictUseTime: record.predictDuration || 1,
        sampleNum: record.productNums || 1,
        // predictStartTime: moment().add(5, 'm'), //预计开始时间默认+5分钟
        predictStartTime: moment().format('YYYY-MM-DD'),
        expectTime: moment(parseFloat(record.expectStartTime)).format('YYYY-MM-DD HH:mm:ss'),
        checkValid:
          record.checkValid == '0' && record.checkValid != undefined ? '--' : moment(parseFloat(record.checkValid)),
        innerName: record.innerName || '--',
        equipCode: record.equipCode || '--',
      })
      this.visible = true
      this.$nextTick(() => {
        this.getSupportEquip()
        this.$nextTick(() => {
          this.showIntro()
        })
      })
    },
    getDate(type) {
      let start, end
      let dateObj = {
        today: () => {
          start = moment().format("YYYY-MM-DD") + " 00:00:00"
          end = moment().format("YYYY-MM-DD") + " 23:59:59"
        },
        yesterday: () => {
          start = moment(moment().add(-1, 'days').startOf('day').valueOf()).format('YYYY-MM-DD HH:mm:ss');
          end = moment(moment().add(-1, 'days').endOf('day').valueOf()).format('YYYY-MM-DD HH:mm:ss');
        },
        tomorrow: () => {
          start = moment(moment().add(1, 'days').startOf('day').valueOf()).format('YYYY-MM-DD HH:mm:ss');
          end = moment(moment().add(1, 'days').endOf('day').valueOf()).format('YYYY-MM-DD HH:mm:ss');
        }
      }
      dateObj[type]()
      return {start, end}
    },
    ganttLoad() {
      gantt.clearAll()
      gantt.i18n.setLocale('cn')
      //  设置日期格式
      gantt.config.date_format = '%Y-%m-%d %H:%i:%s'
      //  只读模式
      gantt.config.readonly = true
      let bool = ['all', 'custom'].includes(this.queryType)
      let global_start_date = null
      let global_end_date = null
      // 设置时间刻度相关属性
      gantt.config.scales = [];
      if (bool) {
        gantt.config.scales.push(
          {unit: "day", step: 1, format: "%m-%d"}
        )
        if (this.queryType === 'custom') {
          global_start_date = moment(this.queryTime[0]).format('YYYY-MM-DD HH:mm:ss')
          global_end_date = moment(this.queryTime[1]).format('YYYY-MM-DD HH:mm:ss')
        }
      } else {
        let result = this.getDate(this.queryType)
        global_start_date = result.start
        global_end_date = result.end
        let dateToStr = gantt.date.date_to_str("%H");
        gantt.config.scales.push({
          // format: "%H",
          unit: "hour", step: 1, format: date => {
            return +dateToStr(date) + 1
          }
        })
      }
      gantt.config.start_date = global_start_date
      gantt.config.end_date = global_end_date
      // 允许在出现意外行为时显示错误警报
      gantt.config.show_errors = false;
      //甘特图自动延长时间刻度以适应所有显示的任务
      gantt.config.fit_tasks = true
      //设置工具提示隐藏之前的时间长度，以毫秒为单位
      // gantt.config.tooltip_hide_timeout = 3000
      // 在重新绘制甘特图时保留垂直和水平滚动条的当前位置
      gantt.config.preserve_scroll = true
      // 设置表格行的默认高度
      gantt.config.row_height = 40


      gantt.config.columns = [
        {
          name: 'equipName',
          width: 300,
          align: 'left',
          label: '设备编号[设备型号]',
          resize: true,
          tree: true,
          onrender: (item, node) => {
            node.style.fontWeight = 'bold'
            node.style.fontSize = '14px'
            node.style.cursor = 'pointer'
            node.style.padding = '0 10px'
            node.style.display = 'flex'
            node.style.alignItems = 'center'
            let checkIcon = item.validFlag == 2 ? checkValidIcon : unCheckValidIcon
            let img = document.createElement('img')
            img.setAttribute('src', checkIcon)
            img.style.width = '18px'
            img.style.height = '18px'
            node.insertBefore(img, node.children[0])
          }
        },
      ]
      // 默认打开所有分支
      // gantt.config.open_tree_initially = true;
      gantt.templates.task_class = function (start, end, task) {
        switch (+task.statusFlag) {
          case 0:
            return 'overtime'
          case 1:
            return 'notStart'
          case 20:
            return 'running'
          case 30:
            return 'pause'
        }
        if (task.isSubTask) {
          return "gantt_hidden";
        }
      }
      gantt.config.drag_timeline = null
      //任务条显示内容
      // gantt.templates.task_text = function (start, end, task) {
      //   return "";
      // }
      // 刷新任务
      // gantt.refreshTask() refreshTask ( string| number id , [ boolean refresh_links ] );
      //开启悬浮框功能
      gantt.plugins({
        tooltip: true
      })
      //悬浮框
      gantt.templates.tooltip_text = function (start, end, task) {
        // 只在任务条上显示tooltip
        if (task.type === 'equip') return false;
        return `<div class="task-tooltip-title">
                      <img src="${testIcon}"/> ${task.testNames}
                  </div>
                 <ul>
                  <li>委托单位：${task.custNames || '--'}</li>
                  <li>样品：${task.products || '--'}</li>
                  <li>试验项目：${task.testNames}</li>
                  <li>预计开始时间：${task.predictStartTime}</li>
                  <li>预计结束时间：${task.predictEndTime}</li>
                  <li>实际开始时间：${task.realStartTime}</li>
                  <li>实际结束时间：${task.realEndTime}</li>
                   <li>预计时长：${task.predictUseTime || '--'}小时</li>
                </ul>`
      }
      //任务的点击方法
      gantt.attachEvent("onTaskClick", (id, e) => {
        let equip = this.equipList.find(item => item.id === id)
        let task = this.taskList.find(item => item.id === id)
        if (equip) {
          if (!e.target.className.includes('gantt_tree_icon')) {
            this.handleEquipClick(equip)
          } else {
            return true
          }
        }
        if (task) {
          if (!e.target.className.includes('gantt_tree_icon')) {
            this.$refs.taskDetail.show(task, '2', '10px')
          } else {
            return true
          }
        }
        this.destroyTooltip()
        return true;
      }, {id: "myTaskClick"});
      gantt.init(document.getElementById('gantt-wrapper'))
    },
    showIntro() {
      if (!this.$ls.get('task-arrangement-modal-intro')) {
        this.$intro()
          .setOptions({
            prevLabel: '上一步',
            nextLabel: '下一步',
            skipLabel: '跳过',
            doneLabel: '完成',
            steps: [
              {
                element: '.equip-task-wrapper',
                intro:
                  '根据任务要求匹配到的设备任务看板，这里展示了设备的已经在运行的任务，点击设备名称安排试验到对应设备',
              },
              {
                element: '.equip-axis',
                intro: '设备任务看板图例说明',
              },
              {
                element: '.query-condition',
                intro: '设备任务的筛选条件,，可以选择自定义的时间范围查询已安排到设备的任务',
              },
            ],
          })
          .oncomplete(() => {
            //点击结束按钮后执行的事件
            this.$ls.set('task-arrangement-modal-intro', true)
          })
          .onexit(() => {
            //点击跳过按钮后执行的事件
            this.$ls.set('task-arrangement-modal-intro', true)
          })
          .start()
      }
    },
    getSupportEquip() {
      if (this.loading) return
      this.loading = true
      let params = {
        id: this.localTaskId,
        ...this.queryParams,
      }
      if (this.queryType !== 'all') {
        let queryTime = this.filterQueryType(this.queryType)
        params.startTime = queryTime[0]
        params.endTime = queryTime[1]
      }
      postAction(this.url.equipList, params).then((res) => {
        if (res.code === 200) {
          let list = res.data.sort((a, b) => a.rowSort - b.rowSort)
          this.equipList = list
          this.ganttParse(list)
          let ext = res.ext
          if (this.queryType === 'all') {
            this.minShowStartTime = parseFloat(ext.minShowStartTime) || 0
            this.maxShowEndTime = parseFloat(ext.maxShowEndTime) || 0
          }
        }
      }).finally(() => {
        this.loading = false
      })
    },
    getEquipTestInfoItem(item) {
      return item.equipTestInfo.map(v => v.testNames).toString() || ''
    },
    ganttParse(list) {
      this.ganttLoad()
      let tasks = {
        data: []
      }
      list.forEach(item => {
        let equipName = item.equipCode + '[' + item.equipModel + ']'
        tasks.data.push(
          {
            id: item.id,
            equipName,
            resize: true,
            // render: 'split',
            text: this.getEquipTestInfoItem(item),
            isSubTask: item.equipTestInfo.length === 0,
            type: "equip",
            validFlag: item.validFlag,
          }
        )
        item.equipTestInfo.length > 0 && item.equipTestInfo.forEach(target => {
          this.taskList.push(target)
          tasks.data.push({
            type: "task",
            id: target.id,
            parent: target.equipId,
            text: target.testNames || '',
            equipName: target.testNames || '',
            start_date: this.dateTimeFormat(target.showStartTime),
            end_date: this.dateTimeFormat(target.showEndTime),
            custNames: target.custNames,
            products: target.products,
            testNames: target.testNames,
            predictStartTime: this.dateTimeFormat(target.predictStartTime),
            predictEndTime: this.dateTimeFormat(target.predictEndTime),
            realStartTime: this.dateTimeFormat(target.realStartTime),
            realEndTime: this.dateTimeFormat(target.realEndTime),
            predictUseTime: target.predictUseTime,
            statusFlag: target.statusFlag,
          })
        })
      })
      gantt.parse(tasks)
    },
    dateTimeFormat(time) {
      return +time && +time !== 0 ? moment(+time).format('YYYY-MM-DD HH:mm:ss') : '--'
    },
    destroyTooltip() {
      gantt.ext.tooltips.tooltip.hide()
    },
    handleCancel() {
      this.destroyTooltip()
      this.visible = false
      this.model = {}
      this.queryParams = {}
      this.queryType = 'all'
      this.queryTime = [moment().startOf('day'), moment().endOf('day')]
      this.equipList = []
      this.localTaskId = null
      this.$emit("change")
    },

    handleQueryTypeChange(e) {
      this.getSupportEquip()
    },
    handleDatePickerChange(v) {
      if (isEmpty(v)) {
        this.queryTime = [moment().startOf('day'), moment().endOf('day')]
      } else {
        this.queryTime = [v[0].startOf('day'), v[1].endOf('day')]
      }
      this.getSupportEquip()
    },
    handleEquipClick(equip) {
      // this.model 是传进来的任务信息，这里拼接进选中的设备信息
      this.model = Object.assign({}, this.model, {
        equipId: equip.id,
        checkValid: equip.checkValid != '0' ? moment(parseFloat(equip.checkValid)).format('YYYY-MM-DD HH:mm:ss') : '--',
        innerName: equip.innerName || '--',
        equipCode: equip.equipCode || '--',
        equipName: equip.equipName,
        taskId: this.model.id,
      })
      this.model.predictUseTime = this.model.predictUseTime == 0 ? 1 : this.model.predictUseTime
      this.$refs.taskArrangementFormModal.show(this.model)
    },
    filterQueryType(type) {
      switch (type) {
        case 'yesterday':
          return [moment().subtract(1, 'd').startOf('day').valueOf(), moment().subtract(1, 'd').endOf('day').valueOf()]
        case 'today':
          return [moment().startOf('day').valueOf(), moment().endOf('day').valueOf()]
        case 'tomorrow':
          return [moment().add(1, 'd').startOf('day').valueOf(), moment().add(1, 'd').endOf('day').valueOf()]
        case 'custom':
          return [this.queryTime[0].startOf('day').valueOf(), this.queryTime[1].endOf('day').valueOf()]
        case 'all':
          return [this.minShowStartTime, this.maxShowEndTime]
        default:
          return
      }
    },
  },
}
</script>

<style>
@import "~dhtmlx-gantt/codebase/dhtmlxgantt.css";
</style>
<style lang="less" scoped>
#gantt-wrapper {
  width: 100%;
  height: 99%;
  overflow: hidden;
}

.task-arrangement-wrapper {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;

  .legend-wrapper {
    padding: 10px 0;
    width: 100%;
    display: flex;
    justify-content: center;

    .legend-item {
      display: flex;
      align-items: center;
      padding: 0 15px 0 0;
      cursor: pointer;

      &-rect {
        width: 42px;
        height: 24px;
        border-radius: 5px;
        margin-right: 5px;
      }

      &-text {
        font-weight: bold;
      }
    }
  }

  .task-arrangement-loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10;
  }

  .task-arrangement-punchcard {
    flex: 1;
    height: 100%;

    .equip-task-wrapper {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
<style lang="less">

.gantt_tooltip {
  font-size: 14px;
  box-shadow: 10px 10px 10px rgba(0 0 0 0.5);
  z-index: 999999;

  .task-tooltip-title {
    padding: 10px;
    border-bottom: solid 1px @border-color-base;
    font-size: 16px;
    font-weight: 700;

    img {
      width: 26px;
      height: 26px;
      display: inline-block;
      margin-right: 10px;
    }
  }

  ul {
    list-style-type: none;
    margin: 0;
    padding: 10px;

    li {
      margin: 0;
      padding: 3px 0;
      border-bottom: dotted 1px @border-color-base;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      &:last-child {
        border: none;
      }
    }
  }
}
</style>
<style>
.gantt_task_line {
  border-color: rgba(0, 0, 0, 0.25);
}

.gantt_task_line .gantt_task_progress {
  background-color: #000;
}

/* overtime */

.gantt_task_line.overtime {
  background-color: #FF5319;
}

.gantt_task_line.overtime .gantt_task_content {
  color: #fff;
}

/* notStart */

.gantt_task_line.notStart {
  background-color: #006BFF;
}

.gantt_task_line.notStart .gantt_task_content {
  color: #fff;
}

/* running */

.gantt_task_line.running {
  background-color: #67C23A;
}

.gantt_task_line.running .gantt_task_content {
  color: #fff;
}


/* pause */

.gantt_task_line.pause {
  background-color: #a9a9a9;
}

.gantt_task_line.pause .gantt_task_content {
  color: #000;
}
</style>