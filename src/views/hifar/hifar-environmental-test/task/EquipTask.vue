<!--
 * @Author: 陈乾龙
 * @Date: 2021-10-11 10:18:12
 * @LastEditTime: 2021-12-01 15:26:55
 * @LastEditors: Please set LastEditors
 * @Description: 设备任务
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\EquipTask.vue
-->
<template>
  <div ref="equipTask" class="equip-task">
    <a-spin v-if="loading" class="equip-task-loading" size="large"/>
    <div class="search-bar">
      <h-search
        v-model="queryParams"
        style="flex: 1"
        :showToggleButton="false"
        :data="formData"
        @change="handleSearchChange"
      />
      <div>
        <a-range-picker
          v-if="queryType === 'custom'"
          v-model="queryTime"
          size="small"
          style="margin-right: 5px; width: 200px"
          :allowClear="false"
          :ranges="{ 当天: [moment(), moment()], 当月: [moment(), moment().endOf('month')] }"
          @change="handleDatePickerChange"
        />
        <a-radio-group v-model="queryType" size="small" button-style="solid" @change="handleQueryTypeChange">
          <a-radio-button value="all">全部</a-radio-button>
          <a-radio-button value="yesterday">昨天</a-radio-button>
          <a-radio-button value="today">今天</a-radio-button>
          <a-radio-button value="tomorrow">明天</a-radio-button>
          <a-radio-button value="custom">自定义</a-radio-button>
        </a-radio-group>
      </div>
    </div>
    <div class="legend-wrapper">
      <template v-for="(item,index) in legendOption">
        <div :key="index" class="legend-item">
          <div :style="{backgroundColor: item.color}" class="legend-item-rect"></div>
          <div class="legend-item-text">{{ item.label }}</div>
        </div>
      </template>
    </div>
    <div class="equip-task-wrapper">
      <div id='equip-gantt-wrapper'></div>
    </div>
    <test-task-base-info-modal ref="taskDetail"/>
  </div>
</template>
<script>
import {getAction} from '@/api/manage'
import moment from 'moment'
import {isEmpty} from 'lodash'
import TestTaskBaseInfoModal from '@/views/hifar/hifar-environmental-test/task/TestTaskBaseInfoModal'
import {gantt} from 'dhtmlx-gantt'

const equipIcon = require('./assets/image/equip.png')
const testIcon = require('./assets/image/test.png')
export default {
  provide() {
    return {
      getContainer: () => this.$refs.equipTask,
    }
  },
  components: {TestTaskBaseInfoModal},
  data() {
    return {
      moment,
      queryParams: {
        statusFlags: '0,1,20,30',
      },
      formData: [
        {
          title: '内部名称',
          key: 'c_innerName_7',
          formType: 'input',
        },
        {
          title: '设备名称',
          key: 'c_equipName_7',
          formType: 'input',
        },
      ],
      legendOption: [
        {key: "0", label: "超期", color: "#FF5319"},
        {key: "1", label: "未开始", color: "#006BFF"},
        {key: "20", label: "执行中", color: "#67C23A"},
        {key: "30", label: "暂停", color: "#a9a9a9"},
      ],
      taskList: [],
      queryType: 'all',
      queryTime: [moment().startOf('day'), moment().endOf('day')],
      loading: false,
      minShowStartTime: 0,
      maxShowEndTime: 0,
      url: {
        list: '/HfEnvTaskTestBusiness/equipTestBoard',
      },
    }
  },
  mounted() {
    this.getList()
  },
  beforeRouteLeave(to, from, next) {
    this.destroyTooltip()
    next();
  },
  methods: {
    handleSearchChange(value) {
      this.getList()
    },
    ganttLoad() {
      gantt.clearAll()
      gantt.i18n.setLocale('cn')
      gantt.config.date_format = '%Y-%m-%d %H:%i:%s' //  设置日期格式
      gantt.config.readonly = true
      let bool = ['all', 'custom'].includes(this.queryType)
      let global_start_date = null
      let global_end_date = null
      // 设置时间刻度相关属性
      let ganttScales = []
      gantt.config.scales = [];
      if (bool) {
        ganttScales.push(
          {unit: "day", step: 1, format: "%m-%d"}
        )
        if (this.queryType === 'custom') {
          global_start_date = moment(this.queryTime[0]).format('YYYY-MM-DD HH:mm:ss')
          global_end_date = moment(this.queryTime[1]).format('YYYY-MM-DD HH:mm:ss')
        }
      } else {
        let {start, end} = this.getDate(this.queryType)
        global_start_date = start
        global_end_date = end
        let dateToStr = gantt.date.date_to_str("%H");
        ganttScales.push({
          // format: "%H",
          unit: "hour", step: 1, format: date => {
            return +dateToStr(date) + 1
          }
        })
      }
      gantt.config.scales = ganttScales
      gantt.config.start_date = global_start_date
      gantt.config.end_date = global_end_date
      // 允许在出现意外行为时显示错误警报
      gantt.config.show_errors = false;
      // 通过单击 +/- 按钮可以展开/折叠拆分任务
      gantt.config.open_split_tasks = true;
      // 甘特图自动延长时间刻度以适应所有显示的任务
      gantt.config.fit_tasks = true
      // 设置工具提示隐藏之前的时间长度，以毫秒为单位
      // gantt.config.tooltip_hide_timeout = 3000
      // 在重新绘制甘特图时保留垂直和水平滚动条的当前位置
      gantt.config.preserve_scroll = true
      // 设置表格行的默认高度
      gantt.config.row_height = 40

      gantt.config.columns = [
        {
          name: 'equipName',
          width: 270,
          align: 'left',
          label: '内部名称[设备名称]',
          resize: true,
          tree: true,
          onrender: (item, node) => {
            node.style.fontWeight = 'bold'
            node.style.fontSize = '14px'
            node.style.cursor = 'pointer'
            node.style.marginLeft = '10px'
          }
        },
      ]
      // 默认打开所有分支
      gantt.config.open_tree_initially = true;
      // 定义当网格为空时是否显示网格内部的占位符元素
      // gantt.config.show_empty_state = true;
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
      gantt.plugins({
        tooltip: true,//开启悬浮框功能
      })
      //悬浮框
      gantt.templates.tooltip_text = function (start, end, task) {
        // 只在任务条上显示tooltip
        if (task.type === 'equip') return false;
        return ` <div class="task-tooltip-title">
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
        let task = this.taskList.find(item => item.id === id)
        if (e.target.className.includes('gantt_tree_icon')) {
          return true
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
      gantt.init(document.getElementById('equip-gantt-wrapper'))
    },
    getList() {
      if (this.loading) return
      this.loading = true
      let params = {
        ...this.queryParams,
      }
      if (this.queryType !== 'all') {
        let queryTime = this.filterQueryType(this.queryType)
        params.startTime = queryTime[0]
        params.endTime = queryTime[1]
      }
      getAction(this.url.list, params).then((res) => {
        this.loading = false
        if (res.code === 200) {
          let list = res.data.sort((a, b) => a.rowSort - b.rowSort)
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
    getMinMaxTime(arr) {
      return arr.reduce((acc, cur) => {
        if (cur.startTime < acc.minStartTime) {
          acc.minStartTime = cur.showStartTime;
        }
        if (cur.endTime > acc.maxEndTime) {
          acc.maxEndTime = cur.showEndTime;
        }
        return acc;
      }, {minStartTime: Infinity, maxEndTime: -Infinity});
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
        // 内部名称[设备名称]
        let equipName = item.innerName + '[' + item.equipName + ']'
        tasks.data.push(
          {
            id: item.id,
            equipName,
            // start_date: this.dateTimeFormat(this.getMinMaxTime(item.equipTestInfo).minStartTime),
            // end_date: this.dateTimeFormat(this.getMinMaxTime(item.equipTestInfo).maxEndTime),
            render: 'split',
            text: this.getEquipTestInfoItem(item),
            isSubTask: item.equipTestInfo.length === 0,
            type: "equip",
            open: false,
          }
        )
        item.equipTestInfo.length > 0 && item.equipTestInfo.forEach(target => {
          this.taskList.push(target)
          tasks.data.push({
            type: "task",
            open: true,
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
    destroyTooltip() {
      gantt.ext.tooltips.tooltip.hide()
    },
    handleQueryTypeChange(e) {
      this.getList()
    },
    handleDatePickerChange(v) {
      if (isEmpty(v)) {
        this.queryTime = []
      } else {
        this.queryTime = [v[0].startOf('day'), v[1].endOf('day')]
      }
      this.getList()
    },
    dateTimeFormat(time) {
      return +time && +time !== 0 ? moment(+time).format('YYYY-MM-DD HH:mm:ss') : '--'
    },
    getDate(type) {
      let start, end, dateObj = {
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
<style lang="less">
#equip-gantt-wrapper {
  width: 100%;
  height: 99%;
  overflow: hidden;
}

.equip-task {
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
  background: #fff;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;

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

  .search-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 3px 3px 5px;
    background: #fff;
    width: 100%;
    border-bottom: #d9d9d9 solid 1px;
  }

  .equip-task-wrapper {
    width: 100%;
    flex: 1;
    overflow: hidden;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: column;
  }
  .raphael-paper {
    width: 100%;
  }
  &-loading {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(#fff, 0.3);
    z-index: 1;
    width: 100%;
    height: 100%;
  }
  .task-tooltip {
    position: fixed;
    background: #fff;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
    border-radius: 5px;
    max-width: 300px;
    transition: all 0.15s ease-in;
    transform: translate(-50%, 0);
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
  }
}
</style>
<style lang="less">
.gantt_tooltip {
  font-size: 14px;
  box-shadow: 10px 10px 10px rgba(0 0 0 0.5);

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