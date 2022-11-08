<!--
 * @Author: 陈乾龙
 * @Date: 2021-10-11 10:18:12
 * @LastEditTime: 2021-12-01 15:26:55
 * @LastEditors: Please set LastEditors
 * @Description: 设备任务
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\EquipTask.vue
-->
<template>
  <div class="equip-task">
    <a-spin v-if="loading" class="equip-task-loading" size="large" />
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
          v-if="queryType == 'custom'"
          v-model="queryTime"
          size="small"
          style="margin-right: 5px; width: 200px"
          :allowClear="false"
          :ranges="{ 当天: [moment(), moment()], 当月: [moment(), moment().endOf('month')] }"
          @change="handleDatePickerChange"
        />
        <a-radio-group v-model="queryType" size="small" button-style="solid" @change="handleQueryTypeChange">
          <a-radio-button value="all">全部</a-radio-button>
          <a-radio-button value="yestoday">昨天</a-radio-button>
          <a-radio-button value="today">今天</a-radio-button>
          <a-radio-button value="tommorow">明天</a-radio-button>
          <!-- <a-radio-button value="7days">未来7天</a-radio-button>
          <a-radio-button value="30days">未来30天</a-radio-button> -->
          <a-radio-button value="custom">自定义</a-radio-button>
        </a-radio-group>
      </div>
    </div>
    <div v-resize="drawResize" class="equip-task-wrapper">
      <div class="equip-axis" ref="equipExtend" style="height: 30px; width: 100%"></div>
      <div class="raphael-paper-wrapper">
        <div id="raphael-paper" class="raphael-paper" ref="equipTask"></div>
      </div>
    </div>
    <test-task-base-info-modal ref="taskDetail" />
  </div>
</template>
<script>
import Vue from 'vue'
import Raphael from 'raphael'
import { getAction } from '@/api/manage'
import moment from 'moment'
import { isEmpty } from 'lodash'
import TestTaskBaseInfoModal from '@/views/hifar/hifar-environmental-test/task/TestTaskBaseInfoModal'
const equipIcon = require('./assets/image/equip.png')
const testIcon = require('./assets/image/test.png')
export default {
  provide() {
    return {
      getContainer: () => this.$refs.equipTask,
    }
  },
  components: { TestTaskBaseInfoModal },
  data() {
    return {
      moment,
      queryParams: {
        statusFlags: '0,1,20,30',
      },
      formData: [
        {
          title: '设备名称',
          key: 'c_equipName_7',
          formType: 'input',
        },
      ],
      queryType: 'all',
      queryTime: [moment().startOf('day'), moment().endOf('day')],
      raphael: {
        // 背景
        background: {
          // 背景分割线
          line: {},
        },
        paper: null,
        // 应项目需求，每个设备所占宽度为确定值，修改stepHeight可调整设备宽度
        stepHeight: 46,
        offsetX: 30,
      },
      bgColor: '#fff',
      lineColor: '#282c34',
      dangerColor: '#FF5319',
      warningColor: '#FF9B00',
      primaryColor: '#006BFF',
      successColor: '#67C23A',
      defaultColor: '#a9a9a9',
      loading: false,
      equipList: [],
      minShowStartTime: 0,
      maxShowEndTime: 0,
      url: {
        list: '/HfEnvTaskTestBusiness/equipTestBoard',
      },
    }
  },
  mounted() {
    // 绘制legend
    this.drawLegend()
    this.getList()
  },
  methods: {
    handleSearchChange(value) {
      this.getList()
    },
    /**
     * @Date: 2021-10-12 09:27:31
     * @Author: 陈乾龙
     * @description: 调整逻辑，先去获取设备列表数据，根据获得到的设备列表数据计算绘图区域
     */
    getList() {
      if (this.loading) return
      this.loading = true
      let params = {
        ...this.queryParams,
      }
      if (this.queryType != 'all') {
        let queryTime = this.filterQueryType(this.queryType)
        params.startTime = queryTime[0]
        params.endTime = queryTime[1]
      }
      getAction(this.url.list, params)
        .then((res) => {
          this.loading = false
          if (res.code == 200) {
            let list = res.data.sort((a,b)=> a.rowSort - b.rowSort)
            let ext = res.ext
            if (this.queryType == 'all') {
              this.minShowStartTime = parseFloat(ext.minShowStartTime) || 0
              this.maxShowEndTime = parseFloat(ext.maxShowEndTime) || 0
            }
            /**
             * 计算画布高度，宽度为百分之百
             */
            if (list.length) {
              this.drawEquipTaskInfoList(list)
            } else {
              this.$refs.equipTask.style.height = 10 * this.raphael.stepHeight + this.raphael.offsetX + 'px'
              this.$nextTick(() => {
                this.initRaphael()
              })
            }
            this.equipList = res.data.sort((a,b)=> a.rowSort - b.rowSort)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    /**
     * @Date: 2021-10-13 16:50:23
     * @Author: 陈乾龙
     * @description:绘制单个设备的甘特图
     * @param {*}
     * @return {*}
     */
    drawEquipTaskInfoOne(equip, index) {
      let that = this
      let content = this.$refs.equipTask
      content.style.height =
        (equip.equipTestInfo.length * this.raphael.stepHeight || this.raphael.stepHeight) + this.raphael.offsetX + 'px'
      let width = content.offsetWidth
      let height = content.offsetHeight
      if (!this.raphael.paper) {
        // 定义绘图实例
        this.raphael = Object.assign({}, this.raphael, {
          width: width,
          height: height,
          paper: Raphael(content, width, height),
        })
      } else {
        this.raphael.width = width
        this.raphael.height = height
        this.raphael.paper.setSize(width, height)
      }
      this.raphael.paper.clear()
      this.raphael.paper.setSize(this.raphael.width, this.raphael.height)
      // 绘制返回按钮
      this.raphael.backButton.show()
      this.raphael.backButtonText.show()

      // 绘制外框
      this.raphael.paper
        .rect(0, this.raphael.offsetX, this.raphael.width, this.raphael.height - this.raphael.offsetX)
        .attr({
          fill: this.bgColor,
          stroke: this.lineColor,
          'stroke-width': 1,
        })

      // 绘制表头
      this.raphael.paper
        .path(`M280,${this.raphael.offsetX}L280,${this.raphael.height - 1}`)
        .attr({ stroke: this.lineColor })
      // 绘制设备名称
      this.raphael.paper
        .text(
          150 / 2,
          30 / 2,
          equip.equipName.length < 8 ? equip.equipName : equip.equipName.substring(0, 6) + '...' || '--'
        )
        .attr({
          'font-size': 14,
          'font-weight': '100',
          'stroke-width': 0.3,
          fill: this.lineColor,
          stroke: this.lineColor,
          title: equip.equipName,
          cursor: 'pointer',
        })
      // 绘制栅格线
      let queryTime = this.filterQueryType(this.queryType)
      let startTime = queryTime[0],
        endTime = queryTime[1]
      let duration = (endTime - startTime) / 1000 / 3600
      if (duration <= 24) {
        this.drawHourAxis(startTime, duration)
      } else {
        duration = duration / 24
        this.drawDayAxis(startTime, duration)
      }
      // 绘制任务
      equip.equipTestInfo.map((task, taskIndex) => {
        let xAxisOffset = 280,
          yAxis = 5.5 + taskIndex * this.raphael.stepHeight,
          xAxisWidth = this.raphael.width - xAxisOffset - 3
        let { showStartTime, showEndTime } = task
        showStartTime = parseFloat(showStartTime)
        showEndTime = parseFloat(showEndTime)
        let axisStepWidth = null,
          timeWidth = null,
          xAxis = null
        let queryTime = this.filterQueryType(this.queryType)
        let startTime = queryTime[0],
          endTime = queryTime[1]
        let duration = (endTime - startTime) / 1000 / 3600
        /**
         * @Date: 2021-10-19 14:23:27
         * @Author: 陈乾龙
         * @description: 绘制任务名称和Icon
         */
        // 排除掉第一条分割线
        this.raphael.paper.text(280 / 2, yAxis + this.raphael.offsetX + 15, task.testName || '--').attr({
          stroke: this.lineColor,
          'stroke-width': 0.2,
          'font-size': 14,
        })
        /**
         * @Date: 2021-10-19 14:56:31
         * @Author: 陈乾龙
         * @description: 绘制任务分割线
         */
        this.raphael.paper.path(
          `M0,${taskIndex * this.raphael.stepHeight + this.raphael.offsetX}L${this.raphael.width},${
            taskIndex * this.raphael.stepHeight + this.raphael.offsetX
          }`
        )
        /**
         * @Date: 2021-10-19 14:23:13
         * @Author: 陈乾龙
         * @description: 绘制任务直方图
         */
        // 单位格的宽度
        axisStepWidth = xAxisWidth / Math.ceil(duration)
        // 计算图形的偏移量
        let axisStepWidthOffset = ((showStartTime - startTime) / 3600000) * axisStepWidth
        // 计算图形宽度
        timeWidth = ((showEndTime - showStartTime) / 3600000) * axisStepWidth
        // 计算图形起始x坐标
        xAxis = axisStepWidthOffset + xAxisOffset
        this.raphael.paper
          .rect(xAxis, yAxis + this.raphael.offsetX, 0, this.raphael.stepHeight - 10.5, 10)
          .attr({
            stroke: this.filterStatusFlag(task.statusFlag),
            // 'fill-opacity': 0.6,
          })
          .animate({ width: timeWidth, fill: this.filterStatusFlag(task.statusFlag) }, 300, 'easing')
          .data('tooltip', task.id)
          .hover(function (e) {
            /**
             * 下面是生成tooltip，该操作使用了原生JS操作DOM，会有渲染性能问题，页面在比较老旧的机器上会卡顿，后续尝试直接使用raphael绘制
             * 也可以使用Vue动态挂载组件上去
             */

            let { pageX, pageY } = e
            let container = document.getElementsByClassName('equip-task')[0]
            let oDiv = document.createElement('div')
            oDiv.id = task.id
            oDiv.className = 'task-tooltip'
            oDiv.innerHTML = `
            <ul style="padding-left:20px;">
              <li>委托单编码：${task.entrustCode}</li>
              <li>任务名称：${task.taskCode}</li>
              <li>项目名称：${task.unitName}</li>
              <li>试验名称：${task.testName}</li>
              <li>开始时间：${moment(parseFloat(task.startTime)).format('YYYY-MM-DD HH:mm')}</li>
              <li>结束时间：${moment(parseFloat(task.endTime)).format('YYYY-MM-DD HH:mm')}</li>
            </ul>
            `
            container.appendChild(oDiv)
            // 做了边界检测，防止tooltip溢出可视窗
            // let { top } = oDiv.getBoundingClientRect()
            if (pageX + oDiv.offsetWidth > that.raphael.width) {
              pageX = pageX - oDiv.offsetWidth
            }
            oDiv.style.cssText = `top:${pageY}px;left:${pageX}px;`
          })
          .mouseout(function () {
            let container = document.getElementsByClassName('equip-task')[0]
            let tooltip = document.getElementById(this.data('tooltip'))
            container.removeChild(tooltip)
          })
          .click(function () {
            let top = '10px'
            that.$refs.taskDetail.show(task, top)
          })
      })
    },
    /**
     * @Date: 2021-10-13 13:54:03
     * @Author: 陈乾龙
     * @description: 绘制列表设备任务
     * @param {*} equip 设备信息
     * @param {*} index 设备下标
     * @return {*}
     */
    drawEquipTaskInfoList(list = []) {
      this.$refs.equipTask.style.height =
        (list.length * this.raphael.stepHeight || this.raphael.stepHeight) + this.raphael.offsetX + 2 + 'px'
      this.initRaphael()
      this.raphael.background.line = {}
      this.raphael.equipTask = []
      list.map((item, index) => {
        this.drawEquipTaskInfo(item, index)
      })
      // 绘制tooltip，这里先绘制一个假tooltip后续用来计算tooltip的宽度，以及计算tooltip是否溢出
      let popContext = document.getElementsByClassName('equip-task-wrapper')[0]
      let oDiv = (oDiv = document.createElement('div'))
      oDiv.id = 'task-tooltip'
      oDiv.className = 'task-tooltip'
      // 马老师说的时间，startTime,endTime 2021/11/4 16:48
      oDiv.innerHTML = `
              <div class="task-tooltip-title">
                <img src=""/> --
              </div>
              <ul>
                <li>委托单位：--</li>
                <li>样品名称：--</li>
                <li>试验项目：--</li>
                <li>预计开始时间：--</li>
                <li>实际开始时间：--</li>
                <li>预计时长：--</li>
              </ul>
              `
      popContext.appendChild(oDiv)
    },
    drawEquipTaskInfo(equip, index) {
      if (!this.raphael.equip) {
        this.raphael.equip = []
      }
      let xAxis = 0,
        yAxis = index * this.raphael.stepHeight
      // 绘制设备任务条
      this.raphael.equip[index] = this.raphael.paper.rect(
        xAxis,
        yAxis + this.raphael.offsetX,
        this.raphael.width,
        this.raphael.stepHeight
      )
      this.raphael.equip[index].attr({
        stroke: this.lineColor,
        fill: this.bgColor,
        'fill-opacity': 0.02,
      })
      this.raphael.equip[index].click(() => {
        this.handleEquipClick(equip, index)
      })
      // 绘制设备信息和设备任务信息
      this.drawEquipInfo(equip, index)
    },
    /**
     * @Date: 2021-10-12 10:17:56
     * @Author: 陈乾龙
     * @description:
     * @param {*} equip 设备信息
     * @param {*} index 设备下标
     * @return {*}
     */
    drawEquipInfo(equip, index) {
      let that = this
      let top = 10,
        bottom = index * this.raphael.stepHeight - 3
      let paper = this.raphael.equip[index].paper
      // 绘制设备名称
      let text = paper.text(
        top + 28,
        25 + bottom + this.raphael.offsetX,
        (equip.equipName + "[" + equip.equipModel + "]").length <= 18 ? equip.equipName + "[" + equip.equipModel + "]" : (equip.equipName + "[" + equip.equipModel + "]").substring(0, 18) + '...' || '--'
      )
      text
        .attr({
          'font-size': 14,
          'text-anchor': 'start',
          'font-weight': '100',
          'stroke-width': 0.5,
          stroke: this.lineColor,
          title: equip.equipName + "[" + equip.equipModel + "]",
          cursor: 'pointer',
          fill: this.lineColor,
        })
        .click((e) => {
          this.handleEquipClick(equip, index)
        })
      // 绘制设备ICON
      paper.image(equipIcon, top - 2, 13 + bottom + this.raphael.offsetX, 20, 20).attr({
        stroke: this.lineColor,
      })
      // 绘制设备任务
      this.raphael.equipTask[index] = []
      let xAxisOffset = 280,
        yAxis = 5.5 + index * this.raphael.stepHeight,
        xAxisWidth = this.raphael.width - xAxisOffset - 3
      equip.equipTestInfo.map((task, taskIndex) => {
        let { showStartTime, showEndTime } = task
        showStartTime = parseFloat(showStartTime)
        showEndTime = parseFloat(showEndTime)
        let axisStepWidth = null,
          timeWidth = null,
          xAxis = null
        let queryTime = this.filterQueryType(this.queryType)
        let startTime = queryTime[0],
          endTime = queryTime[1]
        let duration = (endTime - startTime) / 1000 / 3600
        // 单位格的宽度
        axisStepWidth = xAxisWidth / Math.ceil(duration)
        // 计算图形的偏移量
        let axisStepWidthOffset = ((showStartTime - startTime) / 3600000) * axisStepWidth
        // 计算图形宽度
        timeWidth = ((showEndTime - showStartTime) / 3600000) * axisStepWidth
        // 计算图形起始x坐标
        xAxis = axisStepWidthOffset + xAxisOffset
        this.raphael.equipTask[index][taskIndex] = this.raphael.paper.rect(
          xAxis,
          yAxis + this.raphael.offsetX,
          0,
          this.raphael.stepHeight - 10.5,
          4
        )
        this.raphael.equipTask[index][taskIndex]
          .attr({
            stroke: this.filterStatusFlag(task.statusFlag),
            // 'fill-opacity': 0.38,
          })
          .animate({ width: timeWidth, fill: this.filterStatusFlag(task.statusFlag) }, 300, 'easing')
          .data('tooltip', task.id)
          .hover(
            function (e, eX, eY) {
              let { srcElement } = e
              // 获取到当前hover元素的长宽高和x,y坐标，即任务条状图的坐标和大小信息
              let { height, y } = srcElement.getBoundingClientRect()
              // 获取到tooltip
              let oDiv = document.getElementById('task-tooltip')
              // // 马老师说的时间，startTime,endTime 2021/11/4 16:48
              oDiv.innerHTML = `
              <div class="task-tooltip-title">
                <img src="${testIcon}"/> ${task.testNames}
              </div>
              <ul>
                <li>委托单位：${task.custNames || '--'}</li>
                <li>样品：${task.products || '--'}</li>
                <li>试验项目：${task.testNames}</li>
                <li>预计开始时间：${
                  task.predictStartTime == 0
                    ? '--'
                    : moment(parseFloat(task.predictStartTime)).format('YYYY-MM-DD HH:mm')
                }</li>
                <li>实际开始时间：${
                  task.realStartTime == 0 ? '--' : moment(parseFloat(task.realStartTime)).format('YYYY-MM-DD HH:mm')
                }</li>
                 <li>预计时长：${task.predictUseTime || '--'}小时</li>
              </ul>
              `
              let oDivWidth = oDiv.getBoundingClientRect().width,
                oDivHeight = oDiv.getBoundingClientRect().height
              // 获取当前画布的坐标和大小信息
              let { offsetHeight, offsetWidth } = this // 获取当前画布的大小
              let popContextTop = this.getBoundingClientRect().top,
                popContextLeft = this.getBoundingClientRect().left
              // 做了边界检测，防止tooltip溢出可视窗
              let XLeftOffset = offsetWidth + popContextLeft - eX
              let XBottomOffset = offsetHeight + popContextTop - eY
              // 计算当前弹窗的位置
              let showX = eX,
                showY = y + height + 5
              if (XLeftOffset <= oDivWidth) {
                showX = offsetWidth + popContextLeft - oDivWidth
              }
              if (XBottomOffset <= oDivHeight) {
                showY = y - oDivHeight
              }
              oDiv.style.cssText = `top:${y + height + 5}px;left:${eX}px;`
              // oDiv.style.top = `${showY}px`
              oDiv.style.left = `${showX}px`
              oDiv.style.visibility = 'visible'
              oDiv.style.opacity = 1
            },
            function (e, x, y) {
              // console.log(this)
              let oDiv = document.getElementById('task-tooltip')
              oDiv.style.visibility = 'hidden'
            },
            document.getElementById('raphael-paper')
          )
          .click(function () {
            let top = '10px'
            that.$refs.taskDetail.show(task, top)
          })
      })
    },
    /**
     * @Date: 2021-10-12 10:03:05
     * @Author: 陈乾龙
     * @description: raphael 初始化
     */
    initRaphael() {
      let content = this.$refs.equipTask
      let width = content.offsetWidth
      let height = content.offsetHeight
      if (!this.raphael.paper) {
        // 定义绘图实例
        this.raphael = Object.assign({}, this.raphael, {
          width: width,
          height: height,
          paper: Raphael(content, width, height),
        })
      } else {
        this.raphael.width = width
        this.raphael.height = height
        this.raphael.paper.setSize(width, height)
      }
      // 预先先清除画布
      this.raphael.paper.clear()
      // 绘制画布边框
      this.raphael.background = {}
      this.raphael.background.react = this.raphael.paper.rect(
        0,
        this.raphael.offsetX,
        this.raphael.width,
        this.raphael.height
      )
      this.raphael.background.react.attr({
        fill: this.bgColor,
        stroke: this.lineColor,
        'stroke-width': 1,
      })
      // 绘制坐标与设备信息的分割线
      this.raphael.dividerLine = this.raphael.paper.path(
        `M280,${this.raphael.offsetX + 3}L280,${this.raphael.height - 3}`
      )
      this.raphael.dividerLine.attr({
        stroke: this.lineColor,
      })
      this.raphael.axis = []
      let queryTime = this.filterQueryType(this.queryType)
      let startTime = queryTime[0],
        endTime = queryTime[1]
      let duration = (endTime - startTime) / 1000 / 3600
      if (duration <= 24) {
        this.drawHourAxis(startTime, duration)
      } else {
        duration = duration / 24
        this.drawDayAxis(startTime, duration)
      }
    },
    drawHourAxis(startTime, duration = 24) {
      let axisStepWidth = (this.raphael.width - 280) / duration
      for (let i = 0; i < Math.ceil(duration); i++) {
        let axisStep = i * axisStepWidth
        // 绘制x坐标值
        let text = this.raphael.paper.text(
          280 + axisStep,
          15,
          moment(startTime).add(i, 'h').startOf('hour').format('HH:mm')
        )
        text.attr({
          stroke: this.lineColor,
          'font-size': 14,
          'stroke-width': 0.1,
          fill: this.lineColor,
          transform: this.raphael.width <= 1048 ? 't10,10r35t-10,0' : 't0,0r0t0,0',
        })
        // 绘制坐标线
        if (!i) continue
        this.raphael.axis[i] = this.raphael.paper.path(
          `M${280 + axisStep},${this.raphael.offsetX}L${280 + axisStep},${this.raphael.height - 3}`
        )
        this.raphael.axis[i].attr({
          stroke: this.lineColor,
          'stroke-dasharray': ['--..'],
          'stroke-width': 0.5,
          fill: this.lineColor,
        })
      }
    },
    drawDayAxis(startTime = moment().startOf('day').valueOf(), step) {
      let axisStepWidth = (this.raphael.width - 280) / Math.ceil(step)
      for (let i = 0; i < Math.ceil(step); i++) {
        let axisStep = i * axisStepWidth
        let text = this.raphael.paper.text(
          280 + axisStep,
          15,
          moment(startTime).startOf('day').add(i, 'd').format('MM-DD')
        )
        text.attr({
          stroke: this.lineColor,
          'stroke-width': 0.1,
          'font-size': 12,
          transform: 't10,10r40t-10,0',
          fill: this.lineColor,
        })
        if (!i) continue
        this.raphael.axis[i] = this.raphael.paper.path(
          `M${280 + axisStep},${this.raphael.offsetX + 3}L${280 + axisStep},${this.raphael.height - 3}`
        )
        this.raphael.axis[i].attr({
          stroke: this.lineColor,
          'stroke-dasharray': ['--..'],
          'stroke-width': 0.5,
          fill: this.lineColor,
        })
      }
    },
    /**
     * @Date: 2021-10-18 17:55:44
     * @Author: 陈乾龙
     * @description: 绘制图例
     * @param {*}
     * @return {*}
     */
    drawLegend() {
      let legendXAxisBase = this.$refs.equipExtend.offsetWidth / 2
      if (!this.raphael.equipExtendPaper) {
        this.raphael.equipExtendPaper = Raphael(
          this.$refs.equipExtend,
          this.$refs.equipExtend.offsetWidth,
          this.$refs.equipExtend.offsetHeight
        )
      } else {
        this.raphael.equipExtendPaper.setSize(this.$refs.equipExtend.offsetWidth, this.$refs.equipExtend.offsetHeight)
        this.raphael.equipExtendPaper.clear()
      }
      let unActive = {
        stroke: this.defaultColor,
        fill: this.defaultColor,
      }
      // legend*1是已经超时的图例
      let legend1 = this.raphael.equipExtendPaper.rect(legendXAxisBase - 150, 6, 40, 20, 3)
      let legendText1 = this.raphael.equipExtendPaper.text(legendXAxisBase - 75, 30 / 2 + 2, '超时未开始')
      legend1
        .attr({
          stroke: this.dangerColor,
          fill: this.dangerColor,
          // 'fill-opacity': 0.38,
          cursor: 'pointer',
        })
        .click(() => {
          let statusFlags = this.queryParams.statusFlags.split(',')
          if (statusFlags.includes('0')) {
            statusFlags = statusFlags.filter((obj) => {
              return obj != '0'
            })
            legend1.animate(unActive)
            legendText1.animate(unActive)
          } else {
            statusFlags.push('0')
            legend1.animate({
              stroke: this.dangerColor,
              fill: this.dangerColor,
            })
            legendText1.animate({
              stroke: this.lineColor,
              fill: this.lineColor,
            })
          }
          this.queryParams.statusFlags = statusFlags.join(',')
          this.getList()
        })

      legendText1
        .attr({
          stroke: this.lineColor,
          fill: this.lineColor,
          'stroke-width': 0.3,
          'font-size': 12,
          cursor: 'pointer',
        })
        .click(() => {
          let statusFlags = this.queryParams.statusFlags.split(',')
          if (statusFlags.includes('0')) {
            statusFlags = statusFlags.filter((obj) => {
              return obj != '0'
            })
            legend1.animate(unActive)
            legendText1.animate(unActive)
          } else {
            statusFlags.push('0')
            legend1.animate({
              stroke: this.dangerColor,
              fill: this.dangerColor,
            })
            legendText1.animate({
              stroke: this.lineColor,
              fill: this.lineColor,
            })
          }
          this.queryParams.statusFlags = statusFlags.join(',')
          this.getList()
        })
      // legend*2是正常未开始的图例
      let legend2 = this.raphael.equipExtendPaper.rect(legendXAxisBase - 30, 6, 40, 20, 3)
      let legendText2 = this.raphael.equipExtendPaper.text(legendXAxisBase + 45, 30 / 2 + 2, '正常未开始')
      legend2
        .attr({
          stroke: this.primaryColor,
          fill: this.primaryColor,
          // 'fill-opacity': 0.38,
          cursor: 'pointer',
        })
        .click(() => {
          let statusFlags = this.queryParams.statusFlags.split(',')
          if (statusFlags.includes('1')) {
            statusFlags = statusFlags.filter((obj) => {
              return obj != '1'
            })
            legend2.animate(unActive)
            legendText2.animate(unActive)
          } else {
            statusFlags.push('1')
            legend2.animate({
              stroke: this.primaryColor,
              fill: this.primaryColor,
            })
            legendText2.animate({
              stroke: this.lineColor,
              fill: this.lineColor,
            })
          }
          this.queryParams.statusFlags = statusFlags.join(',')
          this.getList()
        })
      legendText2
        .attr({
          stroke: this.lineColor,
          fill: this.lineColor,
          'stroke-width': 0.3,
          'font-size': 12,
          cursor: 'pointer',
        })
        .click(() => {
          let statusFlags = this.queryParams.statusFlags.split(',')
          if (statusFlags.includes('1')) {
            statusFlags = statusFlags.filter((obj) => {
              return obj != '1'
            })
            legend2.animate(unActive)
            legendText2.animate(unActive)
          } else {
            statusFlags.push('1')
            legend2.animate({
              stroke: this.primaryColor,
              fill: this.primaryColor,
            })
            legendText2.animate({
              stroke: this.lineColor,
              fill: this.lineColor,
            })
          }
          this.queryParams.statusFlags = statusFlags.join(',')
          this.getList()
        })
      // legend*3 是正常已经开始的图例
      let legend3 = this.raphael.equipExtendPaper.rect(legendXAxisBase + 90, 6, 40, 20, 3)
      let legendText3 = this.raphael.equipExtendPaper.text(legendXAxisBase + 158, 30 / 2 + 2, '正常运行')
      legend3
        .attr({
          stroke: this.successColor,
          fill: this.successColor,
          // 'fill-opacity': 0.38,
          cursor: 'pointer',
        })
        .click(() => {
          let statusFlags = this.queryParams.statusFlags.split(',')
          if (statusFlags.includes('20')) {
            statusFlags = statusFlags.filter((obj) => {
              return obj != '20'
            })
            legend3.animate(unActive)
            legendText3.animate(unActive)
          } else {
            statusFlags.push('20')
            legend3.animate({
              stroke: this.successColor,
              fill: this.successColor,
            })
            legendText3.animate({
              stroke: this.lineColor,
              fill: this.lineColor,
            })
          }
          this.queryParams.statusFlags = statusFlags.join(',')
          this.getList()
        })
      legendText3
        .attr({
          stroke: this.lineColor,
          fill: this.lineColor,
          'stroke-width': 0.3,
          'font-size': 12,
          cursor: 'pointer',
        })
        .click(() => {
          let statusFlags = this.queryParams.statusFlags.split(',')
          if (statusFlags.includes('20')) {
            statusFlags = statusFlags.filter((obj) => {
              return obj != '20'
            })
            legend3.animate(unActive)
            legendText3.animate(unActive)
          } else {
            statusFlags.push('20')
            legend3.animate({
              stroke: this.successColor,
              fill: this.successColor,
            })
            legendText3.animate({
              stroke: this.lineColor,
              fill: this.lineColor,
            })
          }
          this.queryParams.statusFlags = statusFlags.join(',')
          this.getList()
        })
      // legend4 是异常暂停的图例
      let legend4 = this.raphael.equipExtendPaper.rect(legendXAxisBase + 196, 6, 40, 20, 3)
      let legendText4 = this.raphael.equipExtendPaper.text(legendXAxisBase + 256, 30 / 2 + 2, '暂停')
      legend4
        .attr({
          stroke: this.defaultColor,
          fill: this.defaultColor,
          // 'fill-opacity': 0.38,
          cursor: 'pointer',
        })
        .click(() => {
          let statusFlags = this.queryParams.statusFlags.split(',')
          if (statusFlags.includes('30')) {
            statusFlags = statusFlags.filter((obj) => {
              return obj != '30'
            })
            legend4.animate(unActive)
            legendText4.animate(unActive)
          } else {
            statusFlags.push('30')
            legend4.animate({
              stroke: this.defaultColor,
              fill: this.defaultColor,
            })
            legendText4.animate({
              stroke: this.lineColor,
              fill: this.lineColor,
            })
          }
          this.queryParams.statusFlags = statusFlags.join(',')
          this.getList()
        })
      legendText4
        .attr({
          stroke: this.lineColor,
          fill: this.lineColor,
          'stroke-width': 0.3,
          'font-size': 12,
          cursor: 'pointer',
        })
        .click(() => {
          let statusFlags = this.queryParams.statusFlags.split(',')
          if (statusFlags.includes('30')) {
            statusFlags = statusFlags.filter((obj) => {
              return obj != '30'
            })
            legend4.animate(unActive)
            legendText4.animate(unActive)
          } else {
            statusFlags.push('30')
            legend4.animate({
              stroke: this.defaultColor,
              fill: this.defaultColor,
            })
            legendText4.animate({
              stroke: this.lineColor,
              fill: this.lineColor,
            })
          }
          this.queryParams.statusFlags = statusFlags.join(',')
          this.getList()
        })
    },
    drawResize(width, height) {
      if (this.equipList.length) {
        this.drawEquipTaskInfoList(this.equipList)
      } else {
        this.$refs.equipTask.style.height = 10 * this.raphael.stepHeight + 'px'
        this.$nextTick(() => {
          this.initRaphael()
        })
      }
      this.drawLegend()
    },
    /**
     * @Date: 2021-10-13 13:51:03
     * @Author: 陈乾龙
     * @description: 点击设备名称事件
     * @param {*} equip 设备值
     * @param {*} index 设备下标
     * @return {*}
     */
    handleEquipClick(equip, index) {
      // this.queryParams.c_id_1 = equip.id
      // this.getList()
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
    filterQueryType(type) {
      switch (type) {
        case 'yestoday':
          return [moment().subtract(1, 'd').startOf('day').valueOf(), moment().subtract(1, 'd').endOf('day').valueOf()]
        case 'today':
          return [moment().startOf('day').valueOf(), moment().endOf('day').valueOf()]
        case 'tommorow':
          return [moment().add(1, 'd').startOf('day').valueOf(), moment().add(1, 'd').endOf('day').valueOf()]
        case '7days':
          return [moment().startOf('day').valueOf(), moment().add(7, 'd').endOf('day').valueOf()]
        case '30days':
          return [moment().startOf('day').valueOf(), moment().add(30, 'd').endOf('day').valueOf()]
        case 'custom':
          return [this.queryTime[0].startOf('day').valueOf(), this.queryTime[1].endOf('day').valueOf()]
        case 'all':
          return [this.minShowStartTime, this.maxShowEndTime]
        default:
          return
      }
    },
    filterStatusFlag(flag) {
      flag = parseInt(flag)
      switch (flag) {
        case 0:
          return this.dangerColor
        case 1:
          return this.primaryColor
        case 20:
          return this.successColor
        default:
          return this.defaultColor
      }
    },
  },
}
</script>
<style lang="less">
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
    .equip-axis,
    .raphael-paper-wrapper {
      width: 100%;
    }
    .raphael-paper-wrapper {
      flex: 1;
      overflow: auto;
    }
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
}
</style>