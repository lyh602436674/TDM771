<!--
 * @Author: 雷宇航
 * @Date: 2022-09-29 15:51:32
 * @fileName: ProjectFormItem.vue
 * @FilePath: tdm724-client\src\views\hifar\hifar-environmental-test\entrustment\components\ProjectFormItem.vue
 * @Description: 项目信息表单
-->
<template>
  <div style="height: 100%; position: relative">
    <h-form
      :ref="'projectInfoForm' + index"
      v-model="model"
      :column="3"
      :formData="formData"
      style="margin-top: 18px; margin-left: 15px"
    >
    </h-form>
    <h-collapse :activeKey="1" :forceRender="false" class="collapseStyle" title="试验条件">
      <div slot="extraBox" v-if="filterUnitCode(model.unitCode)">
        <a-button size="small" type="primary" @click.stop="previewEcharts"> 预览</a-button>
      </div>
      <div slot="content">
        <template v-if="filterUnitCode(model.unitCode)">
          <a-tabs id="drag-tab" v-model="tabsActiveKey" hideAdd type="editable-card" @edit="onEdit">
            <template v-for="(item,itemIndex) in model.abilityRequire">
              <a-tab-pane :key="itemIndex" :closable="item.closable"
                          :tab="item.type === 'stage' ? item.title + itemIndex : item.title" forceRender>
                <test-condition-tab-item :key="itemIndex + '-only'" ref="testConditionTabItem"
                                         :itemAbilityInfo="item.abilityInfo"
                                         :itemIndex="itemIndex"
                                         :projectIndex="index"
                                         :currentProject="model"
                                         @add="handleAdd"
                                         @delete="handleDelete"/>
              </a-tab-pane>
            </template>
            <a-button slot="tabBarExtraContent" size="small" type="primary" @click="addLoopStage">新增循环阶段</a-button>
          </a-tabs>
        </template>
        <template v-else>
          <test-condition-tab-item ref="testConditionTabItem" :currentProject="model"
                                   :itemAbilityInfo="model.abilityRequire.length && model.abilityRequire[0].abilityInfo || []"
                                   :projectIndex="index" @add="handleAdd" @delete="handleDelete"/>
        </template>
      </div>
      <div slot="content">
        <h-form
          :ref="'testConditionDataForm' + index"
          v-model="model"
          :column="3"
          :formData="testConditionData"
          style="margin-top: 18px; margin-left: 15px"
        >
        </h-form>
      </div>
    </h-collapse>
    <point-list ref="PointList" @change="pointSelectChange"></point-list>
    <experimental-curve-modal ref="ExperimentalCurveModal" @change="curveUrlChange"></experimental-curve-modal>
  </div>
</template>

<script>
import moment from 'moment'
import {cloneDeep, isObject} from 'lodash'
import PointList from './PointList'
import NewSampleListModal from '@/views/hifar/hifar-environmental-test/entrustment/components/NewSampleListModal'
import MethodSelectModal from '@/views/hifar/hifar-environmental-test/components/MethodSelectModal'
import TestConditionTabItem from "@views/hifar/hifar-environmental-test/entrustment/modules/TestConditionTabItem";
import drawCurveMixin from '@/views/hifar/hifar-environmental-test/entrustment/drawCurveMixin'
import entrustmentMixins from '@/views/hifar/hifar-environmental-test/entrustment/components/entrustmentMixins'
import ExperimentalCurveModal from './ExperimentalCurveModal'
import sortable from 'sortablejs'
import {randomUUID} from "@/utils/util";
import {filterDictTextByCache} from '@comp/_util/JDictSelectUtil'
export default {
  components: {
    NewSampleListModal, MethodSelectModal, TestConditionTabItem, ExperimentalCurveModal, PointList
  },
  mixins: [drawCurveMixin, entrustmentMixins],
  props: {
    project: {
      type: Object,
      default: () => {
      }
    },
    index: {
      type: [String, Number],
      default: null
    },
    pieceTableData: {
      type: Array,
      default: () => []
    },
    entrustType: {
      type: String,
      default: '1'
    },
  },
  watch: {
    project: {
      immediate: true,
      handler(val) {
        if (isObject(val) && Object.keys(val).length) {
          let obj = Object.assign({}, val)
          let filterUnitCodeFlag = this.filterUnitCode(obj.unitCode)
          obj.taskExpectStartTime = obj.taskExpectStartTime && obj.taskExpectStartTime != 0 ? moment(+obj.taskExpectStartTime).format('YYYY-MM-DD HH:mm:ss') : ''
          obj.unitId = obj.unitId ? obj.unitId : obj.id
          obj.testName = obj.unitName
          let fileList = []
          obj.fileInfo && obj.fileInfo.length && obj.fileInfo.forEach(item => {
            fileList.push({
              fileId: item.id,
              size: item.fileSize,
              status: item.status == 9 ? 'success' : 'exception',
              url: item.filePath,
              name: item.fileName,
              uuid: item.id,
              percent: 100,
              uploadTime: item.createTime,
              secretLevel: item.secretLevel,
              type: item.viewType == 2 ? 'image/jpeg' : 'text/plain',
              replaceStatus: item.replaceStatus
            })
          })
          obj.attachIds = fileList || []
          if (obj.abilityRequire && obj.abilityRequire.length) {
            obj.abilityRequire.forEach((item, index) => {
              item.closable = index !== 0 && index !== 1
            })
          } else {
            if (filterUnitCodeFlag) {
              obj.abilityRequire = [
                {
                  title: "前置处理", type: "before", closable: false, abilityInfo: [
                    {
                      paramId: randomUUID(),
                      paramName: "初始类型",
                      minValue: "1",
                      conditionTypeDesc: "1",
                      dataType: "select"
                    }
                  ]
                },
                {
                  title: "循环阶段",
                  type: "stage",
                  closable: false,
                  abilityInfo: obj.abilityInfo && obj.abilityInfo.map(a => {
                    return {
                      paramId: a.abilityParamId,
                      ...a
                    }
                  }) || []
                }
              ]
            } else {
              obj.abilityRequire = [
                {
                  title: "试验条件", type: "default", abilityInfo: obj.abilityInfo && obj.abilityInfo.map(a => {
                    return {
                      paramId: a.abilityParamId,
                      ...a
                    }
                  }) || []
                }
              ]
            }
          }
          this.model = obj
          if (filterUnitCodeFlag) {
            this.$nextTick(() => {
              this.createSortable()
            })
          }
        }
      }
    },
    'model.pieceNos': {
      immediate: true,
      handler(val) {
        if (val) {
          this.$nextTick(() => {
            this.$refs.newSampleListModal.localSelectedName = val
          })
        }
      },
    }
  },
  data() {
    const validatorTestCondition = (rule, value, callback) => {
      if (value.length >= 240) {
        callback('最多输入240个字符，其他试验条件请以附件的形式提供！')
      }
      callback()
    }
    return {
      moment,
      model: {},
      tabsActiveKey: 0,
      testConditionData: [
        {
          title: '试验条件',
          key: 'testCondition',
          formType: 'textarea',
          span: 3,
          placeholder: '请输入试验条件',
          autoSize: {minRows: 4},
          maxLength: 240,
          rows: 4,
          validate: {
            rules: [{required: true, message: '请输入试验条件'}, {validator: validatorTestCondition}],
          },
        },
        {
          title: '附件',
          key: 'attachIds',
          span: 3,
          component: (
            <h-upload-img
              multiple={false}
              accept={"image/png,image/gif,image/jpg,image/jpeg"}
              v-decorator={['attachIds', {initialValue: []}]}
            />
          ),
        }
      ],
      formData: [
        {
          title: '',
          key: 'unitId',
          formType: 'input',
          hidden: true
        },
        {
          title: '项目名称',
          key: 'unitName',
          formType: 'text'
        },
        {
          title: '试验名称',
          key: 'testName',
          formType: 'input',
          validate: {
            rules: [{required: true, message: '请输入试验名称'}]
          }
        },
        {
          title: '技术文件',
          key: 'technicalFile',
          formType: 'input',
          validate: {
            rules: [{required: true, message: '请输入技术文件'}]
          }
        },
        {
          title: '检测依据',
          key: 'standardId',
          validate: {
            rules: [{required: true, message: '请选择试验标准'}]
          },
          component: (
            <method-select-modal
              v-decorator={['standardId', {initialValue: []}]}
              selectedName={() => {
                return this.model.standardName
              }}
              itemUnitId={() => {
                return this.model.unitId
              }}
              onchange={(selectedRowKeys, selectedRows) => {
                let formName = 'projectInfoForm' + this.index
                let standardName = selectedRows[0] ? selectedRows[0].standardCode + '-' + selectedRows[0].standardName : ''
                this.model.standardId = selectedRowKeys
                this.model.standardName = standardName
                this.$refs[formName].form.setFieldsValue({standardName: standardName})
              }}
            />
          )
        },
        {
          title: "是否分包",
          key: 'isSubpackage',
          formType: 'radio',
          radioType: 'radioButton',
          options: [
            {title: '是', value: '1', key: '1'},
            {title: '否', value: '2', key: '2'}
          ],
          defaultValue: '2',
          validate: {
            rules: [{required: true, message: '请选择是否分包'}]
          }
        },
        {
          title: '',
          key: 'pieceNos',
          formType: 'input',
          hidden: true
        },
        {
          title: '已选样品',
          key: 'pieceIds',
          validate: {
            rules: [{required: true, message: '请选择样品'}]
          },
          component: (
            <new-sample-list-modal
              type="checkbox"
              ref="newSampleListModal"
              v-decorator={['pieceIds', {initialValue: []}]}
              selectedName={() => {
                return this.model.pieceNosName ? this.model.pieceNosName : this.model.pieceNos
              }}
              entrustType={this.entrustType}
              pieceTableData={this.pieceTableData}
              onchange={(selectedRowKeys, selectedRows, pieceNos) => {
                let formName = 'projectInfoForm' + this.index
                this.model.pieceIds = selectedRowKeys
                this.model.pieceNosName = pieceNos && pieceNos.length > 0 ? pieceNos.join(',') : ''
                this.$refs[formName].form.setFieldsValue({pieceNos: pieceNos.join(',')})
              }}
            />
          )
        },
        {
          title: '期望开始时间',
          key: 'taskExpectStartTime',
          formType: 'datePick',
          showTime: true,
          format: "YYYY-MM-DD HH:mm:ss"
        },
        {
          title: '试验条件',
          key: 'testCondition',
          formType: 'textarea',
          span: 3,
          placeholder: '请输入试验条件',
          autoSize: {minRows: 4},
          maxLength: 240,
          rows: 4,
          validate: {
            rules: [{required: true, message: '请输入试验条件'}],
          },
        },
        {
          title: '附件',
          key: 'attachIds',
          span: 3,
          component: (
            <h-upload-img
              accept={"image/png,image/gif,image/jpg,image/jpeg"}
              v-decorator={['attachIds', {initialValue: []}]}
            />
          ),
        }
      ],
      eChartResult: {},
      curveUrl: '',
      selectBeforeProjectIndex: 0,
      selectBeforeItemIndex: 0,
      dragFlag: true
    }
  }
  ,
  methods: {
    createSortable() {
      try {
        let dragTab = document.getElementById('drag-tab').querySelector('.ant-tabs-nav').firstChild
        let dom = dragTab.querySelectorAll('.ant-tabs-tab');
        [].forEach.call(dom, ((item, index) => {
          item.classList.remove('disabledDrag')
          //给第一个dom添加 不可以进行拖动的类名
          if (index === 0) {
            item.classList.add('disabledDrag')
          }
        }))
        if (this.model.abilityRequire.length) {
          this.model.abilityRequire.map((item, index) => {
            item.closable = index !== 0 && index !== 1;
          })
        }
        // this.$forceUpdate()
        this.$nextTick(() => {
          sortable.create(dragTab, {
            filter: ".disabledDrag",//不需要进行拖动的元素
            onEnd: this.dragTabEndFun,
            onMove: this.dragTabMoveFun,
          })
        })
      } catch {
      }
    }
    ,
    dragTabMoveFun(customEvent, originalEvent) {
      if (customEvent.related.className.includes('disabledDrag') && customEvent.related.innerText === '前置处理') {
        if (this.dragFlag) {
          this.$message.warning('循环阶段不能在前置处理前')
          this.dragFlag = false
        }
        return false
      }
      if (customEvent.related.className.includes('disabledDrag') && customEvent.related.innerText === '后置处理') {
        if (this.dragFlag) {
          this.$message.warning('循环阶段不能在后置处理后')
          this.dragFlag = false
        }
        return false
      }
    }
    ,
    dragTabEndFun(customEvent) {
      let {oldIndex, newIndex, to, from, item} = customEvent
      to.removeChild(item)
      from.insertBefore(item, to.children[oldIndex])
      let {abilityRequire} = this.model
      const currentTabItem = abilityRequire.splice(oldIndex, 1)[0]
      abilityRequire.splice(newIndex, 0, currentTabItem)
      abilityRequire.map((item, index) => {
        item.closable = index !== 0 && index !== 1;
      })
      setTimeout(() => {
        this.tabsActiveKey = newIndex
      }, 0)
    }
    ,
    onEdit(index, type) {
      if (type === 'remove') {
        this.model.abilityRequire.splice(index, 1)
        setTimeout(() => {
          this.tabsActiveKey = index - 1
        }, 0)
      }
    }
    ,
    curveUrlChange(url) {
      this.curveUrl = url;
      this.$refs['projectInfoForm' + this.index].form.setFieldsValue({
        curveUrl: url
      })
    }
    ,
    // 删除指标
    removeEvent(row, index) {
      const $table = this.$refs['pointTable' + [index]]
      $table.remove(row)
    }
    ,
    //预览
    previewEcharts() {
      this.splitByCurveType()
      let {temperatureResult, humidityResult} = this
      let obj = {temperatureResult, humidityResult}
      setTimeout(() => {
        this.$refs.ExperimentalCurveModal.open(obj)
      }, 0)
    }
    ,
    momentFormat(value) {
      let hours = Math.floor(value / 1000 / 60 / 60)
      hours = hours < 10 ? '0' + hours : hours
      let minutes = Math.floor(value / 1000 / 60) % 60
      minutes = minutes < 10 ? '0' + minutes : minutes
      let seconds = Math.floor(value % 60)
      seconds = seconds < 10 ? '0' + seconds : seconds
      return `${hours}:${minutes}:${seconds}`
    }
    ,
    resultEcharts() {
      this.splitByCurveType()
      let {temperatureCurveFlag, humidityCurveFlag} = this
      if (temperatureCurveFlag || humidityCurveFlag) {
        let chart = this.$echarts.init(document.getElementById('echarts-result'));
        let option = {
          title: [],//
          legend: {},
          animation: false,  // 去除动画
          xAxis: {
            name: "时长/ min",
            type: 'time',
            splitLine: {
              show: false
            },
            legend: {
              data: ['规划曲线']
            },
            splitNumber: 20,
            axisLine: {
              lineStyle: {
                color: '#1B2232'
              }
            },
            axisLabel: {
              formatter: function (value, index) {
                return this.momentFormat(value);
              }.bind(this),
              color: '#1B2232',
              rotate: 45,
            }
          },
          yAxis: {
            name: '数值',
            type: 'value',
            splitLine: {
              show: true
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: '#1B2232'
              }
            },
            axisLabel: {
              color: '#1B2232'
            }
          },
          series: [
            {
              name: '温度/℃',
              type: 'line',
              hoverAnimation: false,
              symbolSize: 4,
              data: this.temperatureResult || []
            },
            {
              name: '湿度/RH',
              type: 'line',
              hoverAnimation: false,
              symbolSize: 4,
              data: this.humidityResult || []
            },
          ]
        }
        chart.setOption(option)
        this.curveUrl = chart.getDataURL()
      }
    }
    ,
    //新增循环阶段
    addLoopStage() {
      this.model.abilityRequire.push(Object.assign({}, cloneDeep(this.model.abilityRequire[this.model.abilityRequire.length - 1]), {closable: true}))
      this.$nextTick(() => {
        this.createSortable()
        this.tabsActiveKey = this.model.abilityRequire.length - 1
      })
    }
    ,
    // 新增指标项
    handleAdd(projectIndex, itemIndex) {
      this.selectBeforeProjectIndex = projectIndex
      this.selectBeforeItemIndex = itemIndex
      let testConditionTab = this.$refs.testConditionTabItem
      let filterUnitCodeFlag = this.filterUnitCode(this.project.unitCode)
      let $projectTable
      if (filterUnitCodeFlag) {
        $projectTable = testConditionTab[itemIndex].$refs['pointTable' + [projectIndex] + [itemIndex]]
      } else {
        $projectTable = testConditionTab.$refs['pointTable' + [projectIndex] + [itemIndex]]
      }
      let pointInfoAllData = $projectTable.getData()
      let pointInfoDeleteData = $projectTable.getRecordset().removeRecords
      let pointInfoInsertData = $projectTable.getRecordset().insertRecords
      pointInfoAllData = pointInfoAllData.concat([], pointInfoInsertData)
      // 去掉已删除的数据
      for (let k of pointInfoDeleteData) {
        pointInfoAllData = pointInfoAllData.filter((item) => item !== k)
      }
      this.model.abilityRequire[itemIndex].abilityInfo = pointInfoAllData
      this.$refs.PointList.showSelectModal(this.model.abilityRequire[itemIndex])
    }
    ,
    handleDelete(row, rowIndex, projectIndex, itemIndex) {
      this.model.abilityRequire[itemIndex].abilityInfo.splice(rowIndex, 1)
    }
    ,
    // 指标项--新增change
    async pointSelectChange(selectedRowKeys, selectedRows) {
      selectedRows.forEach((item) => {
        this.model.abilityRequire[this.selectBeforeItemIndex].abilityInfo.push({
          paramId: item.id,
          paramName: item.paramName,
          paramType: item.paramType,
          paramTypeText: filterDictTextByCache('hf_dev_param_type', item.paramType) || '-',
          paramCode: item.paramCode,
          dataType: item.dataType,
          unitCode: item.unitCode,
          unitName: item.unitName,
          conditionTypeDesc: item.conditionTypeDesc,
          maxValue: item.maxValue,
          minValue: item.minValue,
          standardValue: item.standardValue,
          strValue: item.strValue,
          curveType: item.curveType
        })
      })
    }
    ,
    splitByCurveType() {
      let testConditionTab = this.$refs.testConditionTabItem || [];
      let pointTableItem = [];
      [].forEach.call(testConditionTab, (item, i) => {
        pointTableItem.push(item.$refs['pointTable' + [this.index] + [i]].getData())
      })
      try {
        this.isHighTemperature = pointTableItem[0].filter(item => item.paramName === '初始类型')[0].conditionTypeDesc === '1'
      } catch {
        this.isHighTemperature = true
      }
      let drawTemperatureCurve = []
      let drawHumidityCurve = []
      let pointTableItemExtend = cloneDeep(pointTableItem).splice(1)
      for (let i = 0; i < pointTableItemExtend.length; i++) {
        let item = pointTableItemExtend[i]
        try {
          this.loopNum = item.filter(v => +v.curveType === 1 && v.paramCode === 'qh07')[0].conditionTypeDesc
        } catch {
          // return this.$message.warning(`循环阶段${i + 1}，请添加循环次数`)
          this.loopNum = 1
        }
        drawTemperatureCurve = drawTemperatureCurve.concat(this.drawTemperatureCurve(item.filter(v => +v.curveType === 1)))
        drawHumidityCurve = drawHumidityCurve.concat(this.drawHumidityCurve(item.filter(v => +v.curveType === 2)))
      }

      // 温度
      this.temperatureResult = drawTemperatureCurve.map(item => item.result).flat()
      this.temperatureCurveFlag = !drawTemperatureCurve.map(item => item.flag).some(item => item === false)
      // 湿度
      this.humidityResult = drawHumidityCurve.map(item => item.result).flat()
      this.humidityCurveFlag = !drawHumidityCurve.map(item => item.flag).some(item => item === false)
      // 预计时长
      if (this.temperatureResult.length || this.humidityResult.length) {
        this.predictDuration = (Math.max(this.temperatureResult.length ? this.temperatureResult[this.temperatureResult.length - 1].name : 0, this.humidityResult.length ? this.humidityResult[this.humidityResult.length - 1].name : 0) / 1000 / 3600).toFixed(1)
        this.predictDuration = +this.predictDuration < 1 ? 1 : this.predictDuration
      } else {
        this.predictDuration = 0
      }
      this.initialCurveData()
    }
    ,
    initialCurveData() {
      this.initialTemTime = moment(0).format('x')//温度湿度初始时间
      this.initialHumTime = moment(0).format('x')//温度湿度初始时间
      this.initialTemperature = 25 // 初始温度
      this.initialHumidity = 30 // 初始湿度
    }
    ,
  }
}
</script>
<style lang="less" scoped>

</style>