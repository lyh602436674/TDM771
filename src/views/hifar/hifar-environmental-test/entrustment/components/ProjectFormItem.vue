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
      <div v-if="filterUnitCode(model.classifyType)" slot="extraBox">
        <a-button size="small" type="primary" @click.stop="previewEcharts"> 预览</a-button>
      </div>
      <div slot="content">
        <template v-if="filterUnitCode(model.classifyType)">
          <a-tabs id="drag-tab" v-model="tabsActiveKey" hideAdd type="editable-card" @edit="onEdit">
            <template v-for="(item,itemIndex) in model.abilityRequire">
              <a-tab-pane :key="itemIndex" :closable="item.closable"
                          :tab="item.type === 'stage' ? item.title + (itemIndex + 1) : item.title" forceRender>
                <test-condition-tab-item :key="itemIndex + '-only'" ref="testConditionTabItem"
                                         :itemAbilityInfo="item.abilityInfo"
                                         :highLowTemperature="item.highLowTemperature"
                                         :itemIndex="itemIndex"
                                         :projectIndex="index"
                                         :currentProject="model"
                                         @add="handleAdd"
                                         @temperatureChange="(val) => temperatureChange(val,item)"
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
    <point-list ref="PointList" @change="pointSelectChange"></point-list>
    <experimental-curve-modal ref="ExperimentalCurveModal" @change="curveUrlChange"></experimental-curve-modal>
    <handle-select-modal
      ref="equipHandleSelectModal"
      :columns="addEquipColumns"
      :data-url="equipParams"
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
import {filterDictTextByCache} from '@comp/_util/JDictSelectUtil'
import SysUserSelect from '@/views/components/SysUserSelect'
import HandleSelectModal from "@views/hifar/hifar-environmental-test/task/modules/components/HandleSelectModal";

const seriesLabel = {
  show: true,
  fontWeight: "bold",
  formatter: (params) => {
    console.log(params, 'params')
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
            testName: val.unitName,
            isShowUserInReport: val.isShowUserInReport || '1',
            isPowerUp: val.isPowerUp || '1',
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
            obj.abilityRequire.forEach((item, index) => {
              item.closable = index !== 0
              item.highLowTemperature = item.highLowTemperature || "1"
            })
          } else {
            if (filterProjectByType) {
              obj.abilityRequire = [
                // 先不删，后续可能会用上
                // {
                //   title: "前置处理", type: "before", closable: false, abilityInfo: [
                //     {
                //       paramId: randomUUID(),
                //       paramName: "初始类型",
                //       minValue: "1",
                //       conditionTypeDesc: "1",
                //       dataType: "select"
                //     }
                //   ]
                // },
                {
                  title: "循环阶段",
                  type: "stage",
                  highLowTemperature: "1",
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
          this.disabledIsShowUserInReport = obj.lastUser
          this.disabledPowerUpTime = obj.isPowerUp
          if (filterProjectByType) {
            this.$nextTick(() => {
              this.createSortable()
            })
          }
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
          title: '设备类型',
          dataIndex: 'equipTypeName',
          customRender: (t) => {
            return t || '--'
          }
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
        }
      ],
      equipSearchData: [
        {
          title: '设备编号',
          formType: 'input',
          key: 'c_equipCode_7'
        },
        {
          title: '设备名称 ',
          formType: 'input',
          key: 'c_equipName_7'
        },
        {
          title: '设备类型',
          formType: 'dict',
          key: 'c_equipTypeCode_1',
          dictCode: 'hf_res_equip_type'
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
        }
      ],
      equipParams: {
        list: '/HfResEquipBusiness/listPage',
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
              if (opt.title === '无') {
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
              accept={"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
              v-decorator={['attachIds', {initialValue: []}]}/>
          ),
        }
      ]
    },
  },
  methods: {
    createSortable() {
      try {
        let dragTab = document.getElementById('drag-tab').querySelector('.ant-tabs-nav').firstChild
        let dom = dragTab.querySelectorAll('.ant-tabs-tab');
        [].forEach.call(dom, (item, index) => {
          item.classList.remove('disabledDrag')
          //给第一个dom添加 不可以进行拖动的类名
          if (index === 0) {
            item.classList.add('disabledDrag')
          }
        })
        if (this.model.abilityRequire.length) {
          this.model.abilityRequire.map((item, index) => {
            item.closable = index !== 0
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
        item.closable = index !== 0
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
      this.splitByCurveType()
      let {temperatureResult, humidityResult} = this
      let obj = {temperatureResult, humidityResult}
      setTimeout(() => {
        this.$refs.ExperimentalCurveModal.open(obj)
      }, 0)
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
                return momentFormat(value);
              },
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
              data: this.temperatureResult || [],
              label: seriesLabel
            },
            {
              name: '湿度/RH',
              type: 'line',
              hoverAnimation: false,
              symbolSize: 4,
              data: this.humidityResult || [],
              label: seriesLabel
            },
          ]
        }
        chart.setOption(option)
        this.curveUrl = chart.getDataURL({pixelRatio: 3, backgroundColor: '#fff'})
      }
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
    },
    splitByCurveType() {
      let testConditionTab = this.$refs.testConditionTabItem || [];
      let pointTableItem = [];
      if (this.filterProjectByType) {
        [].forEach.call(testConditionTab, (item, i) => {
          pointTableItem.push(item.$refs['pointTable' + [this.index] + [i]].getData())
        })
      } else {
        pointTableItem.push(this.$refs.testConditionTabItem.$refs['pointTable' + [this.index] + 0].getData())
      }
      let drawTemperatureCurve = []
      let drawHumidityCurve = []
      for (let i = 0; i < pointTableItem.length; i++) {
        let item = pointTableItem[i]
        try {
          this.loopNum = item.filter(v => +v.curveType === 1 && v.paramCode === 'qh07')[0].conditionTypeDesc
        } catch {
          // return this.$message.warning(`循环阶段${i + 1}，请添加循环次数`)
          this.loopNum = 1
        }
        this.isHighTemperature = testConditionTab[i].highLowTemperature
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
    initialCurveData() {
      this.initialTemTime = moment(0).format('x')//温度湿度初始时间
      this.initialHumTime = moment(0).format('x')//温度湿度初始时间
      this.initialTemperature = 25 // 初始温度
      this.initialHumidity = 30 // 初始湿度
    },
  }
}
</script>
