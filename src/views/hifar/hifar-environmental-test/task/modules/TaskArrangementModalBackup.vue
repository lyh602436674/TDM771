<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-23 10:29:01
 * @LastEditTime: 2021-11-09 15:48:03
 * @LastEditors: 赵峰
 * @Description: 试验安排弹窗
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\TaskArrangementModalBackup.vue
-->
<template>
  <h-modal
    inner
    fullScreen
    :getContainer="getContainer"
    :visible="visible"
    :title="title"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <div class="task-arrangement-wrapper">
      <h-card fixed class="task-arrangement-punchcard">
        <a-space class="query-condition" size="small" slot="search-form">
          <a-radio-group v-model="queryType" size="small" button-style="solid" @change="handleQueryTypeChange">
            <a-radio-button value="all">全部</a-radio-button>
            <a-radio-button value="yestoday">昨天</a-radio-button>
            <a-radio-button value="today">今天</a-radio-button>
            <a-radio-button value="tommorow">明天</a-radio-button>
            <a-radio-button value="7days">未来7天</a-radio-button>
            <a-radio-button value="30days">未来30天</a-radio-button>
            <a-radio-button value="custom">自定义</a-radio-button>
          </a-radio-group>
          <a-range-picker
            v-if="queryType == 'custom'"
            v-model="queryTime"
            size="small"
            style="margin-right: 5px; width: 200px"
            :allowClear="false"
            :ranges="{ 当天: [moment(), moment()], 当月: [moment(), moment().endOf('month')] }"
            @change="handleDatePickerChange"
          />
        </a-space>
        <div v-resize="drawResize" class="equip-task-punch-card">
          <div ref="equipExtend" class="equip-axis"></div>
          <div class="equip-task-wrapper">
            <div ref="equipTask" class="equip-task"></div>
          </div>
        </div>
      </h-card>
      <h-card fixed class="new-task-form-wrapper" title="试验安排" style="width: 350px">
        <div slot="content">
          <a-alert v-if="errorMessage" type="error" :message="errorMessage" banner />
          <h-form
            v-if="equipList.length > 0"
            v-model="model"
            ref="taskArrangementForm"
            style="padding: 5px 10px 5px 0"
            :column="1"
            :formData="formData"
            @change="submitData"
          />
          <a-empty v-else />
        </div>
      </h-card>
    </div>
  </h-modal>
</template>

<script>
import { postAction } from '@/api/manage'
import moment from 'moment'
import Raphael from 'raphael'
import { isEmpty, find } from 'lodash'
const equipIcon = require('../assets/image/equip.png')
const checkValidIcon = require('../assets/image/checkValid.png')
export default {
  inject: {
    getContainer: {
      default: () => {
        return () => document.body
      },
    },
  },
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
        distribute: '/HfEnvTaskTestBusiness/distributeTask',
      },
      model: {},
      errorMessage: null,
      formData: [
        {
          title: '试验设备',
          key: 'equipId',
          formType: 'select',
          options: [],
          validate: {
            rules: [{ required: true, message: '请选择设备' }],
          },
          change: (v, option) => {
            let { checkValid, innerName, equipCode } = option.data.props
            setTimeout(() => {
              // 计算设备是否超过检定有效期
              let timeToday = moment.now().valueOf()
              if (timeToday > parseFloat(checkValid)) {
                this.errorMessage = '设备计量有效期已经过期，试验数据可能无效'
                return
              }
              let { predictStartTime, predictUseTime } = this.$refs.taskArrangementForm.form.getFieldsValue()
              let startTime = moment(predictStartTime.valueOf()).add(parseFloat(predictUseTime), 'h').valueOf()
              if (startTime > parseFloat(checkValid)) {
                this.errorMessage = '试验时长超过了设备计量有效期时间，试验数据可能无效'
                return
              }
              this.errorMessage = null
            }, 0)
            this.model = Object.assign({}, this.model, {
              equipId: v,
              checkValid: checkValid != '0' ? moment(parseFloat(checkValid)).format('YYYY-MM-DD HH:mm:ss') : '--',
              innerName: innerName || '--',
              equipCode: equipCode || '--',
            })
            this.equipList.map((item, index) => {
              if (item.id == v) {
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
          },
        },

        {
          title: '预计开始时间',
          key: 'predictStartTime',
          component: (
            <h-time-select
              v-decorator={['predictStartTime', { rules: [{ required: true, message: '请选择预计开始时间' }] }]}
              onchange={(predictStartTime) => {
                let { equipId, predictUseTime } = this.$refs.taskArrangementForm.form.getFieldsValue()
                if (!equipId) return
                let selectedEquip = find(this.equipList, (equip) => {
                  return equip.id == equipId
                })
                if (!selectedEquip) return
                let checkValid = selectedEquip.checkValid
                let startTime = moment(predictStartTime.valueOf()).add(parseFloat(predictUseTime), 'h').valueOf()
                if (startTime > parseFloat(checkValid)) {
                  this.errorMessage = '试验时长超过了设备计量有效期时间，试验数据可能无效'
                  return
                }
                this.errorMessage = null
              }}
            />
          ),
          validate: {
            rules: [
              {
                required: true,
              },
            ],
          },
        },
        {
          title: '预计时长(h)',
          key: 'predictUseTime',
          formType: 'input',
          type: 'number',
          validate: {
            rules: [
              {
                required: true,
                message: '请输入预计时长',
              },
            ],
          },
          change: (predictUseTime) => {
            let { equipId, predictStartTime } = this.$refs.taskArrangementForm.form.getFieldsValue()
            if (!equipId) return
            let selectedEquip = find(this.equipList, (equip) => {
              return equip.id == equipId
            })
            if (!selectedEquip) return
            let checkValid = selectedEquip.checkValid
            let startTime = moment(predictStartTime.valueOf()).add(parseFloat(predictUseTime), 'h').valueOf()
            if (startTime > parseFloat(checkValid)) {
              this.errorMessage = '试验时长超过了设备检定有效期时间，试验数据可能无效'
              return
            }
            this.errorMessage = null
          },
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
        },
        {
          title: '期望开始时间',
          key: 'expectTime',
          formType: 'text',
        },
        {
          title: '设备内部名称',
          key: 'innerName',
          formType: 'text',
        },
        {
          title: '设备编码',
          key: 'equipCode',
          formType: 'text',
        },
        {
          title: '检定有效期',
          key: 'checkValid',
          formType: 'text',
        },
      ],
      equipList: [],
      selectedData: [],
      bgColor: '#fff',
      lineColor: '#282c34',
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
      this.title = `${record.testName} (试品数量:${record.productNums})`
      this.model = Object.assign({}, record, {
        predictUseTime: record.predictDuration || 1,
        sampleNum: record.productNums || 1,
        predictStartTime: record.predictStartTime == '0' ? moment() : moment(parseFloat(record.predictStartTime)),
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
                intro: '根据任务要求匹配到的设备任务看板，这里展示了设备的已经在运行的任务，点击设备名称可以选中设备',
              },
              {
                element: '.equip-axis',
                intro: '设备任务看板图例说明',
              },
              {
                element: '.query-condition',
                intro: '设备任务的筛选条件，自定义可以自己选择时间哦',
              },
              {
                element: '.new-task-form-wrapper',
                intro: '根据试验任务分配试验的表单，这里可以新建一个试验',
              },
              {
                element: '.drawer-bootom-button',
                intro: '填写完新试验后，必须点击这里的确定保存才可以哦',
                position: 'right',
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
            let selectOptions = []
            let ext = res.ext

            if (this.queryType == 'all') {
              this.minShowStartTime = parseFloat(ext.minShowStartTime) || 0
              this.maxShowEndTime = parseFloat(ext.maxShowEndTime) || 0
            }
            list.map((item, index) => {
              selectOptions.push({
                title: item.equipName,
                value: item.id,
                key: item.id,
                checkValid: item.checkValid,
                index: index,
                equipCode: item.equipCode,
                innerName: item.innerName,
              })
            })
            this.formData[0].options = selectOptions

            /**
             * 计算画布高度，宽度为百分之百
             */
            if (list.length) {
              this.drawEquipTaskInfoList(list)
            } else {
              this.$refs.equipTask.style.height = 10 * this.raphael.stepHeight + 'px'
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
    },
    handleSubmit() {
      this.$refs.taskArrangementForm.validateForm()
    },
    submitData(values) {
      let params = {
        ...values,
        taskId: this.localTaskId,
      }
      params.predictStartTime = moment(params.predictStartTime).valueOf()
      postAction(this.url.distribute, params).then((res) => {
        if (res.code == 200) {
          this.$message.success('分配成功')
          this.$emit('change', true)
          this.handleCancel()
        }
      })
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
      this.raphael.equipText[index] = paper.text(
        top + 28,
        25 + bottom + this.raphael.offsetX,
        equip.equipName.length < 8 ? equip.equipName : equip.equipName.substring(0, 6) + '...' || '--'
      )
      this.raphael.equipText[index]
        .attr({
          'font-size': 14,
          'text-anchor': 'start',
          'font-weight': '100',
          'stroke-width': 0.5,
          stroke: this.lineColor,
          title: equip.equipName,
          cursor: 'pointer',
          fill: this.lineColor,
        })
        .click((e) => {
          this.handleEquipClick(equip, index)
        })
      // 绘制设备ICON
      paper.image(equipIcon, top - 2, 13 + bottom + this.raphael.offsetX, 20, 20)
      if (equip.validFlag == 2) {
        // 绘制设备是否超过计量有效期
        paper
          .image(checkValidIcon, 138, 18 + bottom + this.raphael.offsetX, 15, 15)
          .data('tooltip', equip.id)
          .hover(function (e) {
            /**
             * 下面是生成tooltip，该操作使用了原生JS操作DOM，会有渲染性能问题，页面在比较老旧的机器上会卡顿，后续尝试直接使用raphael绘制
             * 也可以使用Vue动态挂载组件上去
             */

            let { pageX, pageY } = e
            let container = document.getElementsByClassName('equip-task')[0]
            let oDiv = document.createElement('div')
            oDiv.id = equip.id
            oDiv.className = 'task-tooltip'
            oDiv.innerHTML = `
            <ul style="padding-left:20px;">
              <li>设备检定有效期：${moment(parseFloat(equip.checkValid)).format('YYYY-MM-DD HH:mm')}</li>
              <li>设备检定周期：${equip.checkPeriod}${
              equip.checkUnit == 1 ? '日' : equip.checkUnit == 2 ? '月' : '年'
            }</li>
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
      }
      // 绘制设备任务
      this.raphael.equipTask[index] = []
      equip.equipTestInfo.map((task, taskIndex) => {
        let xAxisOffset = 156,
          yAxis = 5.5 + index * this.raphael.stepHeight,
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
          10
        )
        this.raphael.equipTask[index][taskIndex]
          .attr({
            stroke: this.filterStatusFlag(task.statusFlag),
            'fill-opacity': 0.38,
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
            // 马老师说的时间，startTime,endTime 2021/11/4 16:48
            oDiv.innerHTML = `
            <ul style="padding-left:20px;font-size:14px;">
              <li>试验名称：${task.testNames}</li>
              <li>项目名称：${task.unitNames}</li>
              <li>启动时间：${moment(parseFloat(task.startTime)).format('YYYY-MM-DD HH:mm')}</li>
              <li>计划完成：${moment(parseFloat(task.endTime)).format('YYYY-MM-DD HH:mm')}</li>
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
            that.$refs.taskDetail.show(task)
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
        this.raphael.height
      )
      this.raphael.background.react.attr({
        fill: this.bgColor,
        stroke: this.lineColor,
        'stroke-width': 1,
      })
      // 绘制坐标与设备信息的分割线
      this.raphael.dividerLine = this.raphael.paper.path(
        `M156,${this.raphael.offsetX + 3}L156,${this.raphael.height - 3}`
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
      let axisStepWidth = (this.raphael.width - 156) / 24

      if (this.queryType == 'all') {
        axisStepWidth = (this.raphael.width - 156) / duration
      }
      for (let i = 0; i < Math.ceil(duration); i++) {
        let axisStep = i * axisStepWidth
        // 绘制x坐标值
        let text = this.raphael.paper.text(
          156 + axisStep,
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
          `M${156 + axisStep},${this.raphael.offsetX}L${156 + axisStep},${this.raphael.height - 3}`
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
        .path(`M${156 + startStep},${this.raphael.offsetX}L${156 + startStep},${this.raphael.height - 3}`)
        .attr({
          stroke: '#ff0000',
          fill: '#ff0000',
          'stroke-width': 1.8,
          'stroke-dasharray': ['-.'],
        })
    },
    drawDayAxis(step, startTime = moment().startOf('day').valueOf()) {
      let axisStepWidth = (this.raphael.width - 156) / Math.ceil(step)
      for (let i = 0; i < Math.ceil(step); i++) {
        let axisStep = i * axisStepWidth
        let text = this.raphael.paper.text(
          156 + axisStep,
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
          `M${156 + axisStep},${this.raphael.offsetX + 3}L${156 + axisStep},${this.raphael.height - 3}`
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
        .path(`M${156 + startStep},${this.raphael.offsetX}L${156 + startStep},${this.raphael.height - 3}`)
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
      if (this.equipList.length <= 1) {
        // 绘制返回按钮
        this.raphael.backButton = this.raphael.equipExtendPaper.rect(5, 0, 80, 30, 4)
        this.raphael.backButton
          .attr({
            stroke: '#b91212',
            fill: '#b91212',
            cursor: 'pointer',
          })
          .click(() => {
            delete this.queryParams.c_id_1
            this.raphael.backButton.hide()
            this.raphael.backButtonText.hide()
            this.getList()
          })
          .hide()
        this.raphael.backButtonText = this.raphael.equipExtendPaper.text(45, 15, '返回')
        this.raphael.backButtonText
          .attr({
            'font-size': 12,
            stroke: this.bgColor,
            cursor: 'pointer',
            fill: this.bgColor,
          })
          .click(() => {
            delete this.queryParams.c_id_1
            this.raphael.backButton.hide()
            this.raphael.backButtonText.hide()
            this.getList()
          })
          .hide()
      }
      // legend*1是已经超时的图例
      let legend1 = this.raphael.equipExtendPaper.rect(legendXAxisBase - 150, 6, 40, 20, 3)
      let legendText1 = this.raphael.equipExtendPaper.text(legendXAxisBase - 75, 30 / 2 + 2, '超时未开始')
      legend1.attr({
        stroke: this.dangerColor,
        fill: this.dangerColor,
        'fill-opacity': 0.38,
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
      let legendText2 = this.raphael.equipExtendPaper.text(legendXAxisBase + 45, 30 / 2 + 2, '正常未开始')
      legend2.attr({
        stroke: this.primaryColor,
        fill: this.primaryColor,
        'fill-opacity': 0.38,
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
      let legendText3 = this.raphael.equipExtendPaper.text(legendXAxisBase + 158, 30 / 2 + 2, '正常运行')
      legend3.attr({
        stroke: this.successColor,
        fill: this.successColor,
        'fill-opacity': 0.38,
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
        'fill-opacity': 0.38,
        cursor: 'pointer',
      })
      legendText4.attr({
        stroke: this.lineColor,
        fill: this.lineColor,
        'stroke-width': 0.3,
        'font-size': 12,
        cursor: 'pointer',
      })
      // legend5 期望开始时间
      let legend5 = this.raphael.equipExtendPaper.path(
        `M${legendXAxisBase + 280},${30 / 2 + 2} L${legendXAxisBase + 300},${30 / 2 + 2}`
      )
      let legendText5 = this.raphael.equipExtendPaper.text(legendXAxisBase + 343, 30 / 2 + 2, '期望开始时间')
      legend5.attr({
        stroke: '#ff0000',
        fill: '#ff0000',
        'stroke-width': 1.8,
        'stroke-dasharray': ['-.'],
      })
      legendText5.attr({
        stroke: this.lineColor,
        fill: this.lineColor,
        'stroke-width': 0.3,
        'font-size': 12,
        cursor: 'pointer',
      })
      // legend6 设备检定超期
      let legend6 = this.raphael.equipExtendPaper.image(checkValidIcon, legendXAxisBase - 260, 6, 20, 20)
      let legendText6 = this.raphael.equipExtendPaper.text(legendXAxisBase - 200, 30 / 2 + 2, '设备检定超期')
      legendText6.attr({
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
      this.model = Object.assign({}, this.model, {
        equipId: equip.id,
        checkValid: equip.checkValid != '0' ? moment(parseFloat(equip.checkValid)).format('YYYY-MM-DD HH:mm:ss') : '--',
        innerName: equip.innerName || '--',
        equipCode: equip.equipName || '--',
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
      this.$nextTick(() => {
        // 计算设备是否超过检定有效期
        let timeToday = moment.now().valueOf()
        if (timeToday > parseFloat(equip.checkValid)) {
          this.errorMessage = '设备计量有效期已经过期，试验数据可能无效'
          return
        }
        let { predictStartTime, predictUseTime } = this.$refs.taskArrangementForm.form.getFieldsValue()
        let startTime = moment(predictStartTime.valueOf()).add(parseFloat(predictUseTime), 'h').valueOf()
        if (startTime > parseFloat(equip.checkValid)) {
          this.errorMessage = '试验时长超过了设备计量有效期时间，试验数据可能无效'
          return
        }
        this.errorMessage = null
      })
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
    background: rgba(@primary-color, 0.8);
    color: #fff;
    border: solid 1px #fff;
    border-radius: 4px;
    position: fixed;
    padding: 10px 10px;
  }
}
</style>