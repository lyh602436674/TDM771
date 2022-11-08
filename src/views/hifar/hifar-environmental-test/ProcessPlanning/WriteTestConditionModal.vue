<!--
 * @Author: 雷宇航
 * @Date: 2022-08-25 15:45:05
 * @fileName: WriteTestConditionModal.vue
 * @FilePath: tdm200-client\src\views\hifar\hifar-environmental-test\task\modules\WriteTestConditionModal.vue
 * @Description: 在试验任务中，可由试验员填写委托单试验条件且生成预览曲线
-->
<template>
  <h-modal
    :getContainer='getContainer'
    :visible='visible'
    destroyOnClose
    fullScreen inner
    title="填写试验条件"
    @cancel='handleCancel'>
    <div slot='footer' class='footer'>
      <a-button :loading="submitLoading" style='margin-right: 8px' type='ghost-danger' @click='handleCancel'> 关闭
      </a-button>
      <a-button type='primary' @click='handleSubmit'>保存</a-button>
    </div>
    <a-spin :spinning="submitLoading">
      <div style="padding: 20px">
        <a-button v-if="filterUnitCodeFlag" type="primary" style="margin-bottom: 10px"
                  @click.stop="previewEcharts"> 预览
        </a-button>
        <template v-if="filterUnitCodeFlag">
          <a-tabs id="drag-tab" v-model="tabsActiveKey" hideAdd type="editable-card" @edit="onEdit">
            <template v-for="(item,itemIndex) in model.abilityRequire">
              <a-tab-pane :key="itemIndex" :closable="item.closable"
                          :tab="item.type === 'stage' ? item.title + itemIndex : item.title" forceRender>
                <test-condition-tab-item :key="itemIndex + '-only'" ref="testConditionTabItem"
                                         :itemAbilityInfo="item.abilityInfo"
                                         :itemIndex="itemIndex"
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
                                   :itemAbilityInfo="model.abilityRequire && model.abilityRequire.length && model.abilityRequire[0].abilityInfo"
                                   @add="handleAdd" @delete="handleDelete"/>
        </template>
        <h-form
          ref="testConditionDataForm"
          v-model="model"
          :column="3"
          :formData="testConditionData"
          style="margin-top: 18px; margin-left: 15px"
        >
        </h-form>
      </div>
    </a-spin>
    <point-list ref="PointList" @change="pointSelectChange"></point-list>
    <new-test-experimental-curve-modal ref="ExperimentalCurveModal"
                                       @change="curveUrlChange"></new-test-experimental-curve-modal>
    <div id='echarts-result' style='display: none;width: 1000px;height: 500px;'></div>
  </h-modal>
</template>

<script>
import TestConditionTabItem from "@views/hifar/hifar-environmental-test/entrustment/modules/TestConditionTabItem";
import entrustmentMixins from "@views/hifar/hifar-environmental-test/entrustment/components/entrustmentMixins";
import sortable from "sortablejs";
import PointList from "@views/hifar/hifar-environmental-test/entrustment/components/PointList";
import {filterDictTextByCache} from "@comp/_util/JDictSelectUtil";
import {cloneDeep, isObject} from "lodash";
import {postAction} from "@api/manage";
import drawCurveMixin from "@views/hifar/hifar-environmental-test/entrustment/drawCurveMixin";
import NewTestExperimentalCurveModal
  from "@views/hifar/hifar-environmental-test/entrustment/components/NewTestExperimentalCurveModal";
import moment from "moment";
import {randomUUID} from "@/utils/util";

export default {
  name: "WriteTestConditionModal",
  inject: {
    getContainer: {
      default: () => document.body
    }
  },
  mixins: [entrustmentMixins, drawCurveMixin],
  components: {
    TestConditionTabItem, PointList, NewTestExperimentalCurveModal
  },
  data() {
    return {
      moment,
      visible: false,
      submitLoading: false,
      model: {},
      tabsActiveKey: 0,
      testConditionData: [
        {
          title: '其他条件',
          key: 'testCondition',
          formType: 'textarea',
          span: 3,
          placeholder: '请输入其他条件',
          autoSize: {minRows: 4},
          rows: 4,
          readOnly: true,
          validate: {
            rules: [{required: true, message: '请输入其他条件'}],
          },
        },
        {
          title: '附件',
          key: 'attachIds',
          span: 3,
          component: (
            <h-upload-img
              multiple={false} isEdit={false}
              accept={"image/png,image/gif,image/jpg,image/jpeg"}
              v-decorator={['attachIds', {initialValue: []}]}
            />
          ),
        }
      ],
      url: {
        queryById: "/HfEnvEntrustBusiness/queryById",
        save: "/HfEnvEntrustBusiness/saveProjectAbility"
      },
      temperatureResult: [],
      humidityResult: [],
      curveUrl: '',
      index: 0,
      isPreviewFlag: false,
      filterUnitCodeFlag: false,
      modelExtend: {},
    }
  },
  watch: {
    modelExtend: {
      immediate: true,
      deep: true,
      handler(val) {
        if (isObject(val) && Object.keys(val).length) {
          let obj = Object.assign({}, val)
          this.filterUnitCodeFlag = this.filterUnitCode(obj.unitCode)
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
            if (this.filterUnitCodeFlag) {
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
                  title: "循环阶段", type: "stage", closable: false, abilityInfo: obj.abilityInfo.map(a => {
                    return {
                      paramId: a.abilityParamId,
                      ...a
                    }
                  })
                }
              ]
            } else {
              obj.abilityRequire = [
                {
                  title: "试验条件", type: "default", abilityInfo: obj.abilityInfo.map(a => {
                    return {
                      paramId: a.abilityParamId,
                      ...a
                    }
                  })
                }
              ]
            }
          }
          this.model = obj
          if (this.filterUnitCodeFlag) {
            this.$nextTick(() => {
              this.createSortable()
            })
          }
        }
      }
    }
  },
  methods: {
    show(record) {
      this.visible = true
      this.entrustId = record.id
      this.getDetailById(record.id)
    },
    async getDetailById(id) {
      let res = await postAction(this.url.queryById, {id})
      if (res.code === 200) {
        this.modelExtend = res.data.projectInfo[0]
      }
    },
    curveUrlChange(url) {
      this.curveUrl = url;
    },
    previewEcharts() {
      this.isPreviewFlag = true
      this.splitByCurveType()
      let {temperatureResult, humidityResult, temperatureCurveFlag, humidityCurveFlag} = this
      let obj = {temperatureResult, humidityResult}
      setTimeout(() => {
        this.$refs.ExperimentalCurveModal.open(obj)
      }, 0)
    },
    splitByCurveType() {
      let testConditionTab = this.$refs.testConditionTabItem;
      let pointTableItem = [];
      if (this.filterUnitCodeFlag) {
        [].forEach.call(testConditionTab, (item, i) => {
          pointTableItem.push(item.$refs['pointTable' + [this.index] + [i]].getData())
        })
      } else {
        pointTableItem.push(this.$refs.testConditionTabItem.$refs['pointTable' + [this.index] + 0].getData())
      }
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
    },
    //新增循环阶段
    addLoopStage() {
      this.model.abilityRequire.push(Object.assign({}, cloneDeep(this.model.abilityRequire[this.model.abilityRequire.length - 1]), {closable: true}))
      this.$nextTick(() => {
        this.createSortable()
        this.tabsActiveKey = this.model.abilityRequire.length - 1
      })
    },
    // 新增指标项
    handleAdd(projectIndex, itemIndex) {
      this.selectBeforeProjectIndex = projectIndex
      this.selectBeforeItemIndex = itemIndex
      let testConditionTab = this.$refs.testConditionTabItem
      let $projectTable
      if (this.filterUnitCodeFlag) {
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
    },
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
          conditonType: item.conditonType ? item.conditonType : 'A01',
          maxValue: item.maxValue,
          minValue: item.minValue,
          standardValue: item.standardValue,
          strValue: item.strValue,
          curveType: item.curveType
        })
      })
    },
    handleDelete(row, rowIndex, projectIndex, itemIndex) {
      this.model.abilityRequire[itemIndex].abilityInfo.splice(rowIndex, 1)
    },
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
        if (this.model.abilityRequire.length > 0) {
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
    },
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
    },
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
    },
    onEdit(index, type) {
      if (type === 'remove') {
        this.model.abilityRequire.splice(index, 1)
        setTimeout(() => {
          this.tabsActiveKey = index - 1
        }, 0)
      }
    },
    momentFormat(value, arr = []) {
      let result = ''
      for (let i = 0; i < arr.length; i++) {
        if (['hours', 'minutes', 'seconds'].includes(arr[i])) {
          let resItem = moment.duration(value).get(arr[i])
          let formatResItem = resItem < 10 ? ('0' + resItem) : resItem
          result += i < arr.length - 1 ? formatResItem + ':' : formatResItem
        }
      }
      return result
    },
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
                return this.momentFormat(value, ['hours', 'minutes',]);
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
    },
    initialCurveData() {
      this.initialTemTime = moment(0).format('x')//温度湿度初始时间
      this.initialHumTime = moment(0).format('x')//温度湿度初始时间
      this.initialTemperature = 25 // 初始温度
      this.initialHumidity = 30 // 初始湿度
    },
    handleSubmit() {
      let result = Object.assign({}, this.model)
      if (this.filterUnitCodeFlag && !this.isPreviewFlag) {
        this.resultEcharts()
        result.curveUrl = this.curveUrl
      }
      let tabItemTableAllData = []
      if (!this.filterUnitCodeFlag) {
        tabItemTableAllData.push({
          title: '试验条件',
          type: 'default',
          abilityInfo: this.$refs.testConditionTabItem.$refs['pointTable' + '00'].getData()
        })
      } else {
        let testConditionTabItem = this.$refs.testConditionTabItem;
        [].forEach.call(testConditionTabItem, (item, index) => {
          let tabPanelItem = this.model.abilityRequire[index]
          let _item_ = item.$refs['pointTable' + [this.index] + [index]]
          tabItemTableAllData.push({
            title: tabPanelItem.title,
            type: tabPanelItem.type,
            abilityInfo: _item_.getData()
          })
        })
      }
      result.attachIds = result.attachIds.map(item => item.fileId).toString()
      result.abilityRequire = tabItemTableAllData
      result.curveUrl = this.curveUrl
      console.log(result)
      postAction(this.url.save, result).then(res => {
        if (res.code === 200) {
          this.$message.success('保存成功')
          this.handleCancel()
        }
      })
    },
    handleCancel() {
      this.visible = false
      this.isPreviewFlag = false
      this.filterUnitCodeFlag = false
    },
  },
}
</script>

<style scoped>

</style>