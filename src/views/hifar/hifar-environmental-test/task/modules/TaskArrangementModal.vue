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
              <a-radio-button value="yestoday">昨天</a-radio-button>
              <a-radio-button value="today">今天</a-radio-button>
              <a-radio-button value="tommorow">明天</a-radio-button>
              <!-- <a-radio-button value="7days">未来7天</a-radio-button>
              <a-radio-button value="30days">未来30天</a-radio-button> -->
              <a-radio-button value="custom">自定义</a-radio-button>
            </a-radio-group>
            <a-range-picker
              v-if="queryType == 'custom'"
              v-model="queryTime"
              :allowClear="false"
              :ranges="{ 当天: [moment(), moment()], 当月: [moment(), moment().endOf('month')] }"
              size="small"
              style="margin-right: 5px; width: 200px"
              @change="handleDatePickerChange"
            />
          </a-space>
          <div v-resize="drawResize" class="equip-task-punch-card">
            <div ref="equipExtend" class="equip-axis"></div>
            <div id="equip-task-wrapper" class="equip-task-wrapper">
              <div id="equip-task" ref="equipTask" class="equip-task"></div>
            </div>
          </div>
        </h-card>
      </div>
      <div slot="footer" style="text-align: right">
        <a-button type="ghost-danger" @click="handleCancel">关闭</a-button>
      </div>
    </h-modal>
    <task-arrangement-form-modal ref="taskArrangementFormModal" @change="getSupportEquip"/>
  </div>
</template>

<script>
import {postAction} from '@/api/manage'
import moment from 'moment'
import Raphael from 'raphael'
import {isEmpty} from 'lodash'
import TaskArrangementFormModal from './TaskArrangementFormModal.vue'

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
  components: {TaskArrangementFormModal},
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
      selectedData: [],
      bgColor: '#fff',
      lineColor: '#333333',
      textColor: '#333333',
      dangerColor: '#FF5319',
      warningColor: '#FF9B00',
      primaryColor: '#006BFF',
      successColor: '#67C23A',
      defaultColor: '#a9a9a9',
      raphael: {
        background: {},
        stepHeight: 46,
        offsetX: 33,
      },
      minShowStartTime: 0,
      maxShowEndTime: 0,
    }
  },
  methods: {
    show(record = {}) {
      this.localTaskId = record.id || ''
      this.title = `${record.testName || record.unitName} (试品数量:${record.productNums})`
      this.model = Object.assign({}, record, {
        predictUseTime: record.predictDuration || 1,
        sampleNum: record.productNums || 1,
        predictStartTime: moment().add(5, 'm'), //预计开始时间默认+5分钟
        expectTime: moment(parseFloat(record.expectStartTime)).format('YYYY-MM-DD HH:mm:ss'),
        checkValid:
          record.checkValid == '0' && record.checkValid != undefined ? '--' : moment(parseFloat(record.checkValid)),
        innerName: record.innerName || '--',
        equipCode: record.equipCode || '--',
      })
      this.visible = true
      this.$nextTick(() => {
        this.drawLegend()
        this.getSupportEquip()
        this.$nextTick(() => {
          this.showIntro()
        })
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
      if (this.queryType != 'all') {
        let queryTime = this.filterQueryType(this.queryType)
        params.startTime = queryTime[0]
        params.endTime = queryTime[1]
      }
      postAction(this.url.equipList, params)
        .then((res) => {
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
            this.equipList = list
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleCancel() {
      this.visible = false
      if (this.raphael.paper) {
        this.raphael.paper.clear()
        this.raphael.equipExtendPaper.clear()
      }
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
      let popContext = document.getElementById('equip-task')
      let oDiv = document.createElement('div')
      oDiv.id = 'task-tooltip'
      oDiv.className = 'task-tooltip'
      oDiv.innerHTML = `
              <div class="task-tooltip-title">
                <img src=""/> ------
              </div>
              <ul>
                <li>----</li>
                <li>----</li>
                <li>--</li>
                <li>--</li>
                <li>--</li>
                <li>--</li>
              </ul>
              `
      popContext.appendChild(oDiv)
    },
    drawEquipTaskInfo(equip, index) {
      if (!this.raphael.equip) {
        this.raphael.equip = []
        this.raphael.equipText = []
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
      let equipInnerName = equip.innerName + '[' + equip.equipModel + ']'
      this.raphael.equipText[index] = paper.text(
        top + 20,
        25 + bottom + this.raphael.offsetX,
        // equip.equipName.length < 8 ? equip.equipName : equip.equipName.substring(0, 6) + '...' || '--'
        /**
         * 2022-2-9 雷宇航 设备名称改为设备的内部名称
         * */
        equip.innerName.length < 8 ? equipInnerName : equipInnerName.substring(0, 18) + '...' || '--'
      )
      this.raphael.equipText[index]
        .attr({
          'font-size': 14,
          'text-anchor': 'start',
          'font-weight': '100',
          'stroke-width': 0.5,
          stroke: this.model.equipId == equip.id ? this.primaryColor : this.textColor,
          title: equipInnerName,
          cursor: 'pointer',
          fill: this.model.equipId == equip.id ? this.primaryColor : this.textColor,
        })
        .click((e) => {
          this.handleEquipClick(equip, index)
        })
      // 绘制设备是否检定超期的图标
      let checkIcon = equip.validFlag == 2 ? checkValidIcon : unCheckValidIcon
      paper.image(checkIcon, top - 2, 17 + bottom + this.raphael.offsetX, 15, 15).data('tooltip', equip.id)
      // 下面注释部分有些bug
      // .hover(
      //   function (e, ex, ey) {
      //     if (equip.validFlag !== 2) return
      //     let { srcElement } = e
      //     let { x, y } = srcElement
      //     /**
      //      * 下面是生成tooltip，该操作使用了原生JS操作DOM，会有渲染性能问题，页面在比较老旧的机器上会卡顿，后续尝试直接使用raphael绘制
      //      * 也可以使用Vue动态挂载组件上去
      //      */
      //     let oDiv = document.getElementById('valid-flag')
      //     if (!oDiv) {
      //       oDiv = document.createElement('div')
      //       oDiv.id = 'valid-flag'
      //       oDiv.className = 'task-tooltip'
      //       oDiv.style = Object.assign(oDiv.style, {
      //         position: 'fixed',
      //         top: 0,
      //         left: 0,
      //         transform: 'none',
      //       })
      //       this.appendChild(oDiv)
      //     }
      //     oDiv.innerHTML = `
      //       <ul>
      //         <li>设备检定有效期：${moment(parseFloat(equip.checkValid)).format('YYYY-MM-DD HH:mm')}</li>
      //         <li>
      //           设备检定周期：${equip.checkPeriod}${equip.checkUnit == 1 ? '日' : equip.checkUnit == 2 ? '月' : '年'}
      //         </li>
      //       </ul>
      //       `
      //     oDiv.style.top = ey
      //     oDiv.style.left = ex
      //     oDiv.style.visibility = 'visible'
      //     oDiv.style.opacity = 1
      //   },
      //   function (e) {
      //     let oDiv = document.getElementById('valid-flag')
      //     oDiv.style.visibility = 'hidden'
      //     oDiv.style.opacity = 0
      //   },
      //   document.getElementById('equip-task-wrapper')
      // )
      // 绘制设备任务的甘特图进度条
      this.raphael.equipTask[index] = []
      equip.equipTestInfo.map((task, taskIndex) => {
        let xAxisOffset = 280,
          yAxis = 5.5 + index * this.raphael.stepHeight,
          xAxisWidth = this.raphael.width - xAxisOffset - 3
        let {showStartTime, showEndTime} = task
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
        // 绘制任务显示任务条
        this.raphael.equipTask[index][taskIndex] = this.raphael.paper.rect(
          xAxis,
          yAxis + this.raphael.offsetX,
          0,
          this.raphael.stepHeight - 10.5,
          3
        )
        this.raphael.equipTask[index][taskIndex]
          .attr({
            stroke: this.filterStatusFlag(task.statusFlag),
          })
          .animate({width: timeWidth, fill: this.filterStatusFlag(task.statusFlag)}, 300, 'easing')
          .data('tooltip', task.id)
          .hover(
            function (e, eX, eY) {
              let {srcElement} = e
              // 获取到当前hover元素的长宽高和x,y坐标，即任务条状图的坐标和大小信息
              let {height, y} = srcElement.getBoundingClientRect()
              // 获取到tooltip
              let oDiv = document.getElementById('task-tooltip')
              // // 马老师说的时间，startTime,endTime 2021/11/4 16:48
              oDiv.innerHTML = `
              <div class="task-tooltip-title">
                <img src="${testIcon}"/> ${task.testNames}
              </div>
              <ul>
                <li>委托单位：${task.custNames || '--'}</li>
                <li>样品名称：${task.products || '--'}</li>
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
              let {offsetHeight, offsetWidth} = this // 获取当前画布的大小
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
              oDiv.style.top = `${showY}px`
              oDiv.style.left = `${showX}px`
              oDiv.style.visibility = 'visible'
              oDiv.style.opacity = 1
            },
            function (e, x, y) {
              // console.log(this)
              let oDiv = document.getElementById('task-tooltip')
              oDiv.style.visibility = 'hidden'
            },
            document.getElementById('equip-task-wrapper')
          )
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
        // 预先先清除画布
        this.raphael.paper.clear()
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
        this.raphael.height,
        3
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
        this.drawDayAxis(duration, startTime)
      }
    },
    drawHourAxis(startTime, duration = 24) {
      let axisStepWidth = (this.raphael.width - 280) / 24

      if (this.queryType == 'all') {
        axisStepWidth = (this.raphael.width - 280) / duration
      }
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
      // 绘制任务期望开始时间
      let expectStartTime = parseFloat(this.model.expectStartTime)
      let start = (expectStartTime - parseFloat(startTime)) / 3600000
      if (start < 0 || start > 24) return
      let startStep = start * axisStepWidth
      this.raphael.paper
        .path(`M${280 + startStep},${this.raphael.offsetX}L${280 + startStep},${this.raphael.height - 3}`)
        .attr({
          stroke: '#ff0000',
          fill: '#ff0000',
          'stroke-width': 1.8,
          'stroke-dasharray': ['-.'],
        })
    },
    drawDayAxis(step, startTime = moment().startOf('day').valueOf()) {
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
      // 绘制任务期望开始时间
      let expectStartTime = parseFloat(this.model.expectStartTime)
      let start = (expectStartTime - parseFloat(startTime)) / 3600000 / 24
      if (start < 0 || start > step) return
      let startStep = start * axisStepWidth
      this.raphael.paper
        .path(`M${280 + startStep},${this.raphael.offsetX}L${280 + startStep},${this.raphael.height - 3}`)
        .attr({
          stroke: '#ff0000',
          fill: '#ff0000',
          'stroke-width': 1.8,
          'stroke-dasharray': ['-.'],
        })
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
      // if (this.equipList.length <= 1) {
      //   // 绘制返回按钮
      //   this.raphael.backButton = this.raphael.equipExtendPaper.rect(5, 0, 80, 30, 4)
      //   this.raphael.backButton
      //     .attr({
      //       stroke: '#b91212',
      //       fill: '#b91212',
      //       cursor: 'pointer',
      //     })
      //     .click(() => {
      //       delete this.queryParams.c_id_1
      //       this.raphael.backButton.hide()
      //       this.raphael.backButtonText.hide()
      //       this.getList()
      //     })
      //     .hide()
      //   this.raphael.backButtonText = this.raphael.equipExtendPaper.text(45, 15, '返回')
      //   this.raphael.backButtonText
      //     .attr({
      //       'font-size': 12,
      //       stroke: this.bgColor,
      //       cursor: 'pointer',
      //       fill: this.bgColor,
      //     })
      //     .click(() => {
      //       delete this.queryParams.c_id_1
      //       this.raphael.backButton.hide()
      //       this.raphael.backButtonText.hide()
      //       this.getList()
      //     })
      //     .hide()
      // }
      // legend*1是已经超时的图例
      let legend1 = this.raphael.equipExtendPaper.rect(legendXAxisBase - 150, 6, 40, 20, 3)
      let legendText1 = this.raphael.equipExtendPaper.text(legendXAxisBase - 75, 30 / 2 + 2, '超期')
      legend1.attr({
        stroke: this.dangerColor,
        fill: this.dangerColor,
        cursor: 'pointer',
      })
      legendText1.attr({
        stroke: this.lineColor,
        fill: this.lineColor,
        'stroke-width': 0.3,
        'font-size': 12,
        cursor: 'pointer',
      })
      // legend*2是正常未开始的图例
      let legend2 = this.raphael.equipExtendPaper.rect(legendXAxisBase - 30, 6, 40, 20, 3)
      let legendText2 = this.raphael.equipExtendPaper.text(legendXAxisBase + 45, 30 / 2 + 2, '未开始')
      legend2.attr({
        stroke: this.primaryColor,
        fill: this.primaryColor,
        cursor: 'pointer',
      })
      legendText2.attr({
        stroke: this.lineColor,
        fill: this.lineColor,
        'stroke-width': 0.3,
        'font-size': 12,
        cursor: 'pointer',
      })
      // legend*3 是正常已经开始的图例
      let legend3 = this.raphael.equipExtendPaper.rect(legendXAxisBase + 90, 6, 40, 20, 3)
      let legendText3 = this.raphael.equipExtendPaper.text(legendXAxisBase + 158, 30 / 2 + 2, '执行中')
      legend3.attr({
        stroke: this.successColor,
        fill: this.successColor,
        cursor: 'pointer',
      })
      legendText3.attr({
        stroke: this.lineColor,
        fill: this.lineColor,
        'stroke-width': 0.3,
        'font-size': 12,
        cursor: 'pointer',
      })
      // legend4 是异常暂停的图例
      let legend4 = this.raphael.equipExtendPaper.rect(legendXAxisBase + 196, 6, 40, 20, 3)
      let legendText4 = this.raphael.equipExtendPaper.text(legendXAxisBase + 256, 30 / 2 + 2, '暂停')
      legend4.attr({
        stroke: this.defaultColor,
        fill: this.defaultColor,
        cursor: 'pointer',
      })
      legendText4.attr({
        stroke: this.lineColor,
        fill: this.lineColor,
        'stroke-width': 0.3,
        'font-size': 12,
        cursor: 'pointer',
      })
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
      this.equipList.map((item, index) => {
        if (item.id == equip.id) {
          this.raphael.equipText[index].animate({
            stroke: this.primaryColor,
            fill: this.primaryColor,
          })
        } else {
          this.raphael.equipText[index].animate({
            fill: this.lineColor,
            stroke: this.lineColor,
          })
        }
      })
      this.model.predictUseTime = this.model.predictUseTime == 0 ? 1 : this.model.predictUseTime
      this.$refs.taskArrangementFormModal.show(this.model)
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
.task-arrangement-wrapper {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;

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
  }

  .equip-task-punch-card {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;

    .equip-axis,
    .equip-task-wrapper {
      background: #fff;
    }

    .equip-axis {
      height: 30px;
      width: 100%;
    }

    .equip-task-wrapper {
      flex: 1;
      width: 100%;
      overflow: auto;

      .equip-task {
        width: 100%;
      }
    }
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