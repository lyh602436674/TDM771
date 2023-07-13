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
    <h-collapse :activeKey="1" class="collapseStyle" title="试验条件结构化">
      <div slot="extraBox">
        <a-button size="small" type="primary" @click.stop="previewEcharts"> 预览</a-button>
      </div>
      <div slot="content">
        <template v-if="filterUnitCode(model.classifyType)">
          <a-tabs id="drag-tab" v-model="tabsActiveKey" @change="handleTabChange" type="card">
            <template v-for="(item,itemIndex) in model.abilityRequire">
              <a-tab-pane :key="itemIndex"
                          :tab="item.title" forceRender>
                <test-condition-tab-item :key="itemIndex + '-only'" ref="testConditionTabItem"
                                         :itemAbilityInfo="item.abilityInfo"
                                         :highLowTemperature="item.highLowTemperature"
                                         :itemIndex="itemIndex"
                                         :projectIndex="index"
                                         :currentProject="model"
                                         :stage="item.type"
                                         @temperatureChange="(val) => temperatureChange(val,item)"
                                         @add="handleAdd"
                                         @delete="handleDelete"/>
              </a-tab-pane>
            </template>
            <!--            <a-button slot="tabBarExtraContent" size="small" type="primary" @click="addLoopStage">新增循环阶段-->
            <!--            </a-button>-->
          </a-tabs>
        </template>
        <template v-else>
          <test-condition-tab-item ref="testConditionTabItem" :currentProject="model"
                                   :itemAbilityInfo="model.abilityRequire.length && model.abilityRequire[0].abilityInfo || []"
                                   :projectIndex="index" @add="handleAdd" @delete="handleDelete"/>
        </template>
      </div>
    </h-collapse>
    <h-collapse :activeKey="1" class="collapseStyle" style="margin-top:10px" title="测试设备">
      <div slot="extraBox">
        <a-button size="small" type="primary" @click.stop="equipAdd"> 添加</a-button>
      </div>
      <div slot="content">
        <a-table
          :columns="equipColumns"
          :dataSource="equipData"
          :pagination="false"
          bordered
          rowKey="id"
          size="small"
        >
          <template #action="text, record,index">
            <a-popconfirm title="确定删除吗?" @confirm="() => equipHandleDelete(index)">
              <a-icon
                class="primary-text"
                style="cursor: pointer"
                theme="twoTone"
                title="删除"
                two-tone-color="#ff4d4f"
                type="delete"
              />
            </a-popconfirm>
          </template>
        </a-table>
      </div>
    </h-collapse>
    <point-list ref="PointList" historySelect @change="pointSelectChange"></point-list>
    <experimental-curve-modal ref="ExperimentalCurveModal" @change="curveUrlChange"></experimental-curve-modal>
    <preview-mechanical-test-conditions ref="PreviewMechanicalTestConditions"></preview-mechanical-test-conditions>
    <handle-select-modal
      ref="equipHandleSelectModal"
      :columns="addEquipColumns"
      :data-url="equipParams"
      historySelect
      :searchData="equipSearchData"
      :title="'添加测试设备'"
      type="equip"
      :checkMethod="({row})=> +row.checkValid > moment().valueOf()"
      @callback="equipCallback"
    />
    <div id='echarts-result' style='display: none;width: 1000px;height: 500px;'></div>
  </div>
</template>

<script>
import moment from 'moment'
import {cloneDeep, isArray, isObject} from 'lodash'
import PointList from './PointList'
import NewSampleListModal from '@/views/hifar/hifar-environmental-test/entrustment/components/NewSampleListModal'
import MethodSelectModal from '@/views/hifar/hifar-environmental-test/components/MethodSelectModal'
import TestConditionTabItem from "@views/hifar/hifar-environmental-test/entrustment/modules/TestConditionTabItem";
import drawCurveMixin from '@/views/hifar/hifar-environmental-test/entrustment/drawCurveMixin'
import entrustmentMixins from '@/views/hifar/hifar-environmental-test/entrustment/components/entrustmentMixins'
import ExperimentalCurveModal from './ExperimentalCurveModal'
import sortable from 'sortablejs'
import SysUserSelect from '@/views/components/SysUserSelect'
import HandleSelectModal from "@views/hifar/hifar-environmental-test/task/modules/components/HandleSelectModal";
import PreviewMechanicalTestConditions
  from "@views/hifar/hifar-environmental-test/entrustment/components/PreviewMechanicalTestConditions.vue";
import {randomUUID} from "@/utils/util";

const defaultParams = Object.freeze({
  paramId: randomUUID(),
  delFlag: 0,
  curveType: 1,
  conditionTypeDesc: undefined,
  minValue: undefined,
  strValue: '',
})
const defaultBeforeConditions = [
  {
    ...defaultParams,
    paramName: "初始温度",
    dataType: "number",
    paramCode: "beforeInitTem",
    unitName: "℃",
    conditionTypeDesc: 25
  },
  {
    ...defaultParams,
    paramName: "目标温度",
    dataType: "number",
    paramCode: "beforeTargetTem",
    unitName: "℃",
  },
  {
    ...defaultParams,
    paramName: "温变时间",
    dataType: "number",
    paramCode: "beforeVariationTimeTem",
    unitName: "min"
  },
  {
    ...defaultParams,
    paramName: "保持时间",
    dataType: "number",
    paramCode: "beforeKeepTime",
    unitName: "min"
  },
]

const defaultAfterConditions = [
  {
    ...defaultParams,
    paramName: "回归温度",
    dataType: "number",
    paramCode: "afterLastTem",
    unitName: "℃",
  },
  {
    ...defaultParams,
    paramName: "温变时间",
    dataType: "number",
    paramCode: "afterVariationRateTem",
    unitName: "min",
  },
  {
    ...defaultParams,
    paramName: "保持时间",
    dataType: "number",
    paramCode: "afterKeepTime",
    unitName: "min"
  },
]
const seriesLabel = {
  show: true,
  fontWeight: "bold",
  formatter: (params) => {
    let a = params.seriesName === '温度'
    return (a ? params.value[1] + '℃' : params.value[1] + 'RH%') + '\n' + momentFormat(params.value[0])
  }
}
const momentFormat = function (value) {
  let hours = Math.floor(value / 1000 / 60 / 60)
  hours = hours < 10 ? '0' + hours : hours
  let minutes = Math.floor(value / 1000 / 60) % 60
  minutes = minutes < 10 ? '0' + minutes : minutes
  let seconds = Math.floor((value / 1000) % 60)
  seconds = seconds < 10 ? '0' + seconds : seconds
  return `${hours}:${minutes}:${seconds}`
}

export default {
  components: {
    PreviewMechanicalTestConditions,
    NewSampleListModal,
    MethodSelectModal,
    TestConditionTabItem,
    ExperimentalCurveModal,
    PointList,
    SysUserSelect,
    HandleSelectModal
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
    entrustType: {
      type: String,
      default: '1'
    },
  },
  watch: {
    project: {
      immediate: true,
      deep: true,
      handler(val) {
        if (isObject(val) && Object.keys(val).length) {
          let obj = Object.assign({}, val, {
            unitId: val.unitId ? val.unitId : val.id,
            testName: val.testName || val.unitName,
            isShowUserInReport: val.isShowUserInReport || '1',
            isPowerUp: val.isPowerUp || '1',
            curveReportFlag: (val.curveReportFlag || +val.curveReportFlag === 0) ? val.curveReportFlag : 1,
            attachIds: val.fileInfo && val.fileInfo.length && val.fileInfo.map(item => {
              return {
                fileId: item.id,
                size: item.fileSize,
                status: item.status === 9 ? 'success' : 'exception',
                url: item.filePath,
                name: item.fileName,
                uuid: item.id,
                percent: 100,
                uploadTime: item.createTime,
                secretLevel: item.secretLevel,
                type: item.viewType === 2 ? 'image/jpeg' : 'text/plain',
                replaceStatus: item.replaceStatus
              }
            }) || [],
          })
          let filterProjectByType = this.filterUnitCode(obj.classifyType)
          this.filterProjectByType = filterProjectByType
          this.equipData = obj.testEquipInfo && isArray(obj.testEquipInfo) ? obj.testEquipInfo : []
          if (obj.abilityRequire && obj.abilityRequire.length) {
            obj.abilityRequire = obj.abilityRequire.map((item, index) => {
              return {
                ...item,
                highLowTemperature: item.highLowTemperature || "1",
                abilityInfo: item.abilityInfo && item.abilityInfo.map(a => {
                  return {
                    paramType_dictText: a.paramType_dictText,
                    ...a,
                    conditionTypeDesc: a.dataType === 'string' ? a.strValue : a.conditionTypeDesc,
                  }
                }) || [],
              }
            })
          } else {
            if (filterProjectByType) {
              obj.abilityRequire = [
                {
                  title: "前置处理", type: "before", abilityInfo: defaultBeforeConditions
                },
                {
                  title: "循环阶段",
                  type: "stage",
                  highLowTemperature: "1",
                  abilityInfo: obj.abilityInfo && obj.abilityInfo.map(a => {
                    return {
                      paramId: a.abilityParamId,
                      ...a,
                      paramType_dictText: a.paramType_dictText,
                      conditionTypeDesc: a.dataType === 'string' ? a.strValue : a.conditionTypeDesc,
                      delFlag: 0,  // 默认带入不可以删除
                    }
                  }) || []
                },
                {
                  title: "后置处理", type: "after", abilityInfo: defaultAfterConditions
                },
              ]
            } else {
              obj.abilityRequire = [
                {
                  title: "试验条件", type: "default", abilityInfo: obj.abilityInfo && obj.abilityInfo.map(a => {
                    return {
                      paramId: a.abilityParamId,
                      ...a,
                      paramType_dictText: a.paramType_dictText,
                      delFlag: 0, // 默认带入不可以删除
                    }
                  }) || []
                }
              ]
            }
          }
          this.disabledIsShowUserInReport = obj.lastUser
          this.disabledPowerUpTime = obj.isPowerUp
          this.model = obj
        }
      }
    },
    model: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val) {
          this.$nextTick(() => {
            this.$refs.newSampleListModal.localSelectedName = val.pieceNos
          })
        }
      },
    },
  },
  data() {
    return {
      moment,
      model: {},
      equipColumns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return index + 1
          }
        },
        {title: '设备编号', dataIndex: 'equipCode'},
        {title: '设备名称', dataIndex: 'equipName'},
        {
          title: '计量有效期',
          dataIndex: 'checkValid',
          customRender: (t, record) => {
            return +record.checkValid && moment(+record.checkValid).format('YYYY-MM-DD') || '--'
          }
        },
        {title: '设备型号', dataIndex: 'equipModel'},
        {title: '使用部门', dataIndex: 'userDeptName'},
        {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: {customRender: 'action'},
          width: 60,
          align: 'center'
        }
      ],
      addEquipColumns: [
        {
          title: '设备编号',
          dataIndex: 'equipCode',
          customRender: (t) => {
            return t || '--'
          }
        },
        {
          title: '设备名称',
          dataIndex: 'equipName',
          customRender: (t) => {
            return t || '--'
          }
        },
        {
          title: '设备用途',
          align: 'left',
          ellipsis: true,
          minWidth: 80,
          dataIndex: 'equipUse_dictText',
        },
        {
          title: '计量有效期',
          dataIndex: 'checkValid',
          scopedSlots: {
            customRender: '_checkValid_',
            template: (row) => `<span style="color: ${+row.checkValid > moment().valueOf() ? '' : 'red'}">
              ${+row.checkValid && moment(+row.checkValid).format('YYYY-MM-DD') || '--'}
            </span>`
          },
        },
        {
          title: '设备型号',
          dataIndex: 'equipModel',
          customRender: (t) => {
            return t || '--'
          }
        },
        {
          title: '资产编号',
          dataIndex: 'assetsCode',
          customRender: (t) => {
            return t || '--'
          }
        },
        {
          title: '使用部门',
          dataIndex: 'userDeptName',
          customRender: (t) => {
            return t || '--'
          }
        }
      ],
      equipSearchData: [
        {
          title: '设备名称 ',
          formType: 'input',
          key: 'c_equipName_7'
        },
        {
          title: '设备编号',
          formType: 'input',
          key: 'c_equipCode_7'
        },
        {
          title: '设备型号',
          formType: 'input',
          key: 'c_equipModel_7'
        },
        {
          title: '资产编号',
          formType: 'input',
          key: 'c_assetsCode_7'
        },
        {
          title: '使用部门',
          formType: 'input',
          key: 'c_userDeptName_7'
        },
      ],
      equipParams: {
        list: '/HfResEquipBusiness/listPageForEntrust',
        queryParams: {c_equipUse_1: '2'},
      },
      equipData: [],
      tabsActiveKey: 0,
      eChartResult: {},
      curveUrl: '',
      selectBeforeProjectIndex: 0,
      selectBeforeItemIndex: 0,
      dragFlag: true,
      filterProjectByType: false,
      disabledIsShowUserInReport: null,
      disabledPowerUpTime: null,
      temperatureResult: []
    }
  },
  computed: {
    formData() {
      return [
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
                return this.model.pieceNos
              }}
              entrustType={this.entrustType}
              onchange={(selectedRowKeys, selectedRows) => {
                let formName = 'projectInfoForm' + this.index
                let pieceIds = selectedRows.map(v => v.id).toString()
                let pieceNos = selectedRows.map(v => v.pieceNo).toString()
                this.model.pieceIds = pieceIds
                this.model.pieceNos = pieceNos
                this.$refs[formName].form.setFieldsValue({pieceIds, pieceNos})
              }}
            />
          )
        },
        {
          title: '试验标准',
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
              type={'checkbox'}
              itemUnitId={() => {
                return this.model.unitId
              }}
              onchange={(selectedRowKeys, selectedRows) => {
                let formName = 'projectInfoForm' + this.index
                let standardName = selectedRows.map(v => v.standardCode + '-' + v.standardName).toString()
                let standardId = selectedRowKeys.toString()
                this.model.standardId = standardId
                this.model.standardName = standardName
                this.$refs[formName].form.setFieldsValue({standardName: standardName})
                this.$refs[formName].form.setFieldsValue({standardId: standardId})
              }}
            />
          )
        },
        {
          key: 'standardName',
          hidden: true,
          formType: 'input',
        },
        {
          title: '最终用户',
          key: 'lastUser',
          formType: 'dict',
          dictCode: 'hf_entrust_lastUser',
          placeholder: '请选择最终用户',
          validate: {
            rules: [{required: true, message: '请选择最终用户'}],
          },
          change: (val, opt) => {
            let formName = 'projectInfoForm' + this.index, isShowUserInReport
            if (formName) {
              isShowUserInReport = this.$refs[formName].$options.propsData.formData.filter(item => item.key === 'isShowUserInReport')[0]
              if (opt.title === '无' || val === '10') {
                this.$refs[formName].form.setFieldsValue({isShowUserInReport: '2'})
                isShowUserInReport.disabled = true
              } else {
                this.$refs[formName].form.setFieldsValue({isShowUserInReport: '1'})
                isShowUserInReport.disabled = false
              }
            }
          }
        },
        {
          title: "报告中是否显示最终用户",
          key: 'isShowUserInReport',
          formType: 'radio',
          radioType: 'radioButton',
          disabled: this.disabledIsShowUserInReport === '7',
          options: [
            {title: '是', value: '1', key: '1'},
            {title: '否', value: '2', key: '2'}
          ],
          defaultValue: '1',
          validate: {
            rules: [{required: true, message: '请选择报告中是否显示最终用户'}]
          }
        },
        {
          title: "是否加电",
          key: 'isPowerUp',
          formType: 'radio',
          radioType: 'radioButton',
          options: [
            {title: '是', value: '1', key: '1'},
            {title: '否', value: '2', key: '2'}
          ],
          defaultValue: '1',
          validate: {
            rules: [{required: true, message: '请选择是否加电'}]
          },
          change: (val) => {
            let formName = 'projectInfoForm' + this.index, powerUpTime
            if (formName) {
              powerUpTime = this.$refs[formName].$options.propsData.formData.filter(item => item.key === 'powerUpTime')[0]
              if (val === '2') {
                powerUpTime.disabled = true
                this.$refs[formName].form.setFieldsValue({powerUpTime: '4'})
              } else {
                powerUpTime.disabled = false
              }
            }
          },
        },
        {
          title: '加电时间',
          key: 'powerUpTime',
          formType: 'dict',
          dictCode: 'hf_powerup_time',
          placeholder: '请选择加电时间',
          disabled: this.disabledPowerUpTime === '2',
          validate: {
            rules: [{required: true, message: '请选择加电时间'}]
          },
        },
        {
          title: '曲线是否进报告',
          key: 'curveReportFlag',
          formType: 'radio',
          radioType: 'radioButton',
          defaultValue: 1,
          options: [
            {title: '是', value: 1, key: 1},
            {title: '否', value: 0, key: 0}
          ],
        },
        {
          title: '试验判据',
          key: 'testCriteria',
          formType: 'textarea',
          span: 3,
          placeholder: '请输入试验判据',
          autoSize: {minRows: 2},
          validate: {
            rules: [{required: true, message: '请输入试验判据'}]
          }
        },
        {
          title: '合格判据',
          key: 'conformityCriteria',
          formType: 'textarea',
          span: 3,
          placeholder: '请输入合格判据',
          autoSize: {minRows: 2},
          validate: {
            rules: [{required: true, message: '请输入合格判据'}]
          }
        },
        {
          title: '试验依据',
          key: 'testEvidence',
          formType: 'textarea',
          span: 3,
          placeholder: '请输入试验依据',
          autoSize: {minRows: 2},
          validate: {
            rules: [{required: true, message: '请输入试验依据'}]
          }
        },
        {
          title: '试验条件',
          key: 'testCondition',
          formType: 'textarea',
          span: 3,
          placeholder: '请输入试验条件',
          autoSize: {minRows: 2},
          validate: {
            rules: [{required: true, message: '请输入试验条件'}],
          },
        },
        {
          title: '附件',
          key: 'attachIds',
          span: 3,
          component: (
            <h-upload-file
              accept={".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
              v-decorator={['attachIds', {initialValue: []}]}/>
          ),
        }
      ]
    },
  },
  methods: {
    handleTabChange(v) {
      this.tabsActiveKey = v
    },
    createSortable() {
      try {
        let dragTab = document.getElementById('drag-tab').querySelector('.ant-tabs-nav').firstChild
        let dom = dragTab.querySelectorAll('.ant-tabs-tab');
        [].forEach.call(dom, (item, index) => {
          item.classList.remove('disabledDrag')
          //给第一个dom添加 不可以进行拖动的类名
          if (index === 0 || index === dom.length - 1) {
            item.classList.add('disabledDrag')
          }
        })
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
    curveUrlChange(url) {
      this.curveUrl = url;
      this.$refs['projectInfoForm' + this.index].form.setFieldsValue({
        curveUrl: url
      })
    },
    // 删除指标
    removeEvent(row, index) {
      const $table = this.$refs['pointTable' + [index]]
      $table.remove(row)
    },
    //预览
    previewEcharts() {
      if (+this.model.classifyType === 1) {
        this.splitByCurveType()
        let {temperatureResult, humidityResult} = this
        setTimeout(() => {
          this.$refs.ExperimentalCurveModal.open(temperatureResult)
        }, 0)
      } else {
        let pointTableItem = this.$refs.testConditionTabItem.$refs['pointTable' + [this.index] + 0].getData()
        this.$refs.PreviewMechanicalTestConditions.show(pointTableItem)
      }
    },
    equipAdd() {
      this.$refs.equipHandleSelectModal.show(this.equipData, 'equipId')
    },
    equipCallback(value) {
      this.equipData = this.equipData.concat(value.map(item => {
        return {equipId: item.id, ...item}
      }))
    },
    equipHandleDelete(index) {
      this.equipData.splice(index, 1)
    },
    resultEcharts() {
      this.splitByCurveType()
      let {temperatureResult_before, temperatureResult_stage, temperatureResult_after} = cloneDeep(record)
      let before = temperatureResult_before
      let stage = [temperatureResult_before[temperatureResult_before.length - 1]].concat(temperatureResult_stage)
      let after = [temperatureResult_stage[temperatureResult_stage.length - 1]].concat(temperatureResult_after)
      let chart = this.$echarts.init(document.getElementById('echarts-result'));
      let option = {
        title: [],//
        legend: {},
        animation: false,
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            params = params[0]
            return params.seriesName + '：' + params.value[1] + '  时长：' + momentFormat(params.value[0])
          },
          axisPointer: {
            animation: false
          }
        },
        xAxis: {
          name: "时长",
          type: 'time',
          splitLine: {
            show: false
          },
          splitNumber: 20,
          axisLine: {
            lineStyle: {
              color: '#1B2232'
            }
          },
          axisLabel: {
            formatter: function (value, index) {
              return momentFormat(value)
            },
            color: '#1B2232',
            rotate: 45,
          }
        },
        yAxis: {
          name: '温度',
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
        toolbox: {
          feature: {
            saveAsImage: {
              name: '规划曲线图'
            },
          }
        },
        series: [
          {
            name: '前置处理',
            type: 'line',
            hoverAnimation: false,
            symbolSize: 4,
            data: before || [],
            label: seriesLabel,
          },
          {
            name: '循环阶段',
            type: 'line',
            hoverAnimation: false,
            symbolSize: 4,
            data: stage || [],
            label: seriesLabel,
            lineStyle: {
              color: "red"
            }
          },
          {
            name: '后置处理',
            type: 'line',
            hoverAnimation: false,
            symbolSize: 4,
            data: after || [],
            label: seriesLabel,
          },
        ]
      };
      chart.setOption(option)
      this.curveUrl = chart.getDataURL({pixelRatio: 3, backgroundColor: '#fff'})
  },
  //新增循环阶段
  addLoopStage() {
    let abilityRequire = this.model.abilityRequire
    let cloneObj = Object.assign({}, cloneDeep(abilityRequire[abilityRequire.length - 2]), {closable: true})
    this.model.abilityRequire.splice(abilityRequire.length - 1, 0, cloneObj)
    this.$nextTick(() => {
      this.createSortable()
      this.tabsActiveKey = abilityRequire.length - 2
    })
  },
  // 新增指标项
  handleAdd(projectIndex, itemIndex) {
    this.selectBeforeProjectIndex = projectIndex
    this.selectBeforeItemIndex = itemIndex
    let testConditionTab = this.$refs.testConditionTabItem
    let filterProjectByType = this.filterUnitCode(this.project.classifyType)
    let $projectTable
    if (filterProjectByType) {
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
  temperatureChange(val, item) {
    this.$set(item, 'highLowTemperature', val)
  },
  handleDelete(row, rowIndex, projectIndex, itemIndex) {
    this.model.abilityRequire[itemIndex].abilityInfo.splice(rowIndex, 1)
  },
  pointSelectChange(selectedRowKeys, selectedRows) {
    selectedRows.forEach((item) => {
      this.model.abilityRequire[this.selectBeforeItemIndex].abilityInfo.push({
        ...item,
        paramId: item.id,
        delFlag: 1, // 手动新增可以删除
      })
    })
  },
  splitByCurveType() {
    let testConditionTab = this.$refs.testConditionTabItem || [];
    let pointTableGather = [];
    [].forEach.call(testConditionTab, (item, i) => {
      let getData = item.$refs['pointTable' + [this.index] + [i]].getData()
      pointTableGather.push(getData)
    })
    this.initialCurveData()
    // 这里目前只有一个循环阶段，可以将其他循环结合在一起使用，所以这里先用循环
    for (let i = 0; i < pointTableGather.length; i++) {
      console.log(`第${i + 1} 阶段绘制开始`)
      let item = pointTableGather[i]
      if (i === 0) {
        // 前置处理
        this.drawCurveByBefore(item)
      } else if (i === pointTableGather.length - 1) {
        // 后置处理
        this.drawCurveByAfter(item)
      } else {
        // 循环阶段
        this.drawCurveByStage(item, testConditionTab[i].highLowTemperatureExtend)
      }
    }
    // // 预计时长
    // if (this.temperatureResult.length || this.humidityResult.length) {
    //   this.predictDuration = (Math.max(this.temperatureResult.length ? this.temperatureResult[this.temperatureResult.length - 1].name : 0, this.humidityResult.length ? this.humidityResult[this.humidityResult.length - 1].name : 0) / 1000 / 3600).toFixed(1)
    //   this.predictDuration = +this.predictDuration < 1 ? 1 : this.predictDuration
    // } else {
    //   this.predictDuration = 0
    // }
  },
  // 初始化数据
  initialCurveData() {
    this.temperatureResult = {}
    this.humidityResult = []
    this.loopNum = 1
    this.initialTemTime = Number(moment(0).format('x'))//温度湿度初始时间
    this.initialHumTime = moment(0).format('x')//温度湿度初始时间
    this.initialHumidity = 30 // 初始湿度
  },
}
}
</script>
