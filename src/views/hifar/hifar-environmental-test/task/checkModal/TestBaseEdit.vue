<!--
 * @Author: 赵峰
 * @Date: 2021-11-15 10:24:06
 * @LastEditTime: 2021-11-17 09:47:10
 * @LastEditors: 赵峰
 * @Descripttion: 试验编辑
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\checkModal\TestBaseEdit.vue
-->
<template>
  <h-modal
    :getContainer='getContainer'
    :title="'试验编辑(' + records.testCode + ')'"
    :visible='visible'
    destroyOnClose
    fullScreen
    inner
    @cancel='handleCancel'
  >
    <div slot='footer' class='footer'>
      <a-button style='margin-right: 8px' type='ghost-danger' @click='handleCancel'> 关闭
      </a-button>
      <a-button :loading="submitLoading" type='primary' @click='handleSave'>保存</a-button>
    </div>
    <div ref="modalBody">
      <h-desc title='试件信息'>
        <h-card :bordered='false' style='width: 100%'>
          <template slot='table-operator'>
            <a-button icon='plus' size='small' type='primary' @click='productAdd'>
              添加
            </a-button>
          </template>
          <a-table
            :columns='testProductColumns'
            style="width: 100%;"
            :dataSource='productTable'
            :pagination='false'
            bordered
            rowKey='id'
            size='small'
          >
            <template slot="productFile" slot-scope="text, record">
              <a @click="previewProductFile(record)">{{ text || 0 }}</a>
            </template>
            <template slot="productBeforeStatus" slot-scope="text, record">
              <h-select v-model="record.productBeforeStatus"
                        :options="productStatusOptions"
                        @change="(e)=>productStatusChange(record,e,'productBeforeStatus')"/>
            </template>
            <template slot="productAfterStatus" slot-scope="text, record">
              <h-select v-model="record.productAfterStatus"
                        :options="productStatusOptions"
                        @change="(e)=>productStatusChange(record,e,'productAfterStatus')"/>
            </template>
            <template #action='text, record'>
              <a-popconfirm title='确定删除吗?' @confirm='() => productHandleDelete(record.id)'>
                <a-icon
                  class='primary-text'
                  style='cursor: pointer'
                  theme='twoTone'
                  title='删除'
                  two-tone-color='#ff4d4f'
                  type='delete'
                />
              </a-popconfirm>
            </template>
          </a-table>
        </h-card>
      </h-desc>
      <!-- 实施过程 -->
      <h-desc style='margin-top: 20px' title='实施过程'>
        <h-card :bordered='false' style='width: 100%'>
          <h-form
            ref='carryOutProcessForm'
            v-model='model'
            :column='2'
            :formData='formData'
            style='width: 100%'
          />
        </h-card>
      </h-desc>
      <!--巡检记录-->
      <h-desc title='巡检记录'>
        <h-card :bordered='false' style='width: 100%'>
          <template slot='table-operator'>
            <a-button icon='plus' size='small' type='primary' @click='siteInspectionAdd'>
              添加
            </a-button>
          </template>
          <a-table
            :columns='siteInspectionColumns'
            :dataSource='siteInspectionTable'
            :pagination='false'
            bordered
            rowKey='id'
            size='small'
            style="width: 100%;"
          >
            <template slot="productFile" slot-scope="text, record">
              <a @click="previewProductFile(record)">{{ text || 0 }}</a>
            </template>
            <template slot="productBeforeStatus" slot-scope="text, record">
              <h-select v-model="record.productBeforeStatus"
                        :options="productStatusOptions"
                        @change="(e)=>productStatusChange(record,e,'productBeforeStatus')"/>
            </template>
            <template slot="productAfterStatus" slot-scope="text, record">
              <h-select v-model="record.productAfterStatus"
                        :options="productStatusOptions"
                        @change="(e)=>productStatusChange(record,e,'productAfterStatus')"/>
            </template>
            <template #action='text, record'>
              <a-popconfirm title='确定删除吗?' @confirm='() => productHandleDelete(record.id)'>
                <a-icon
                  class='primary-text'
                  style='cursor: pointer'
                  theme='twoTone'
                  title='删除'
                  two-tone-color='#ff4d4f'
                  type='delete'
                />
              </a-popconfirm>
            </template>
          </a-table>
        </h-card>
      </h-desc>
      <!-- 参试人员 -->
      <h-desc style='margin-top: 20px' title='参试人员'>
        <h-card :bordered='false' style='width: 100%'>
          <template slot='table-operator'>
            <a-button icon='plus' size='small' type='primary' @click='personAdd'>
              添加
            </a-button>
          </template>
          <div slot='content'>
            <a-table
              ref='personTable'
              :columns='personColumns'
              :dataSource='personArr'
              :pagination='false'
              :rowKey='(record) => record.testUserId'
              bordered
              size='small'
            >
              <template #action='text, record,index'>
                <a-popconfirm title='确定删除吗?' @confirm='() => personHandleDelete(index)'>
                  <a-icon
                    class='primary-text'
                    style='cursor: pointer'
                    theme='twoTone'
                    title='删除'
                    two-tone-color='#ff4d4f'
                    type='delete'
                  />
                </a-popconfirm>
              </template>
            </a-table>
          </div>
        </h-card>
      </h-desc>
      <!-- 测试设备 -->
      <h-desc style='margin-top: 20px' title='测试设备'>
        <h-card :bordered='false' style='width: 100%'>
          <template slot='table-operator'>
            <a-button icon='plus' size='small' type='primary' @click='equipAdd'>
              添加
            </a-button>
          </template>
          <div slot='content'>
            <a-table
              :columns='testEquipColumns'
              :dataSource='equipData'
              :pagination='false'
              bordered
              rowKey='id'
              size='small'
            >
              <template #action='text, record,index'>
                <a-popconfirm title='确定删除吗?' @confirm='() => equipHandleDelete(index)'>
                  <a-icon
                    class='primary-text'
                    style='cursor: pointer'
                    theme='twoTone'
                    title='删除'
                    two-tone-color='#ff4d4f'
                    type='delete'
                  />
                </a-popconfirm>
              </template>
            </a-table>
          </div>
        </h-card>
      </h-desc>
      <h-desc style='margin-top: 20px' title='传感器'>
        <h-card :bordered='false' style='width: 100%'>
          <template slot='table-operator'>
            <a-button icon='plus' size='small' type='primary' @click='sensorAdd'>
              添加
            </a-button>
          </template>
          <div slot='content'>
            <a-table
              :columns='sensorColumns'
              :dataSource='sensorData'
              :pagination='false'
              bordered
              rowKey='id'
              size='small'
            >
              <template #action='text, record,index'>
                <a-popconfirm title='确定删除吗?' @confirm='() => sensorHandleDelete(index)'>
                  <a-icon
                    class='primary-text'
                    style='cursor: pointer'
                    theme='twoTone'
                    title='删除'
                    two-tone-color='#ff4d4f'
                    type='delete'
                  />
                </a-popconfirm>
              </template>
            </a-table>
          </div>
        </h-card>
      </h-desc>
      <h-desc style='margin-top: 20px' title='振动工装'>
        <h-card :bordered='false' style='width: 100%'>
          <template slot='table-operator'>
            <a-button icon='plus' size='small' type='primary' @click='toolsProductAdd'>
              添加
            </a-button>
          </template>
          <div slot='content'>
            <a-table
              :columns='toolsProductColumns'
              :dataSource='toolsProductData'
              :pagination='false'
              bordered
              rowKey='id'
              size='small'
            >
              <template #action='text, record,index'>
                <a-popconfirm title='确定删除吗?' @confirm='() => toolsProductHandleDelete(index)'>
                  <a-icon
                    class='primary-text'
                    style='cursor: pointer'
                    theme='twoTone'
                    title='删除'
                    two-tone-color='#ff4d4f'
                    type='delete'
                  />
                </a-popconfirm>
              </template>
            </a-table>
          </div>
        </h-card>
      </h-desc>
      <h-desc style='margin-top: 20px' title='图片图谱'>
        <h-upload-file v-model="pictureData" :customParams="pictureCustomParams"
                       accept="image/png,image/gif,image/jpg,image/jpeg"
                       isWriteRemarks style="width: 100%" @delete="handleDeleteImg"></h-upload-file>
      </h-desc>
    </div>
    <!-- 试件信息 -->
    <handle-select-modal
      ref='productHandleSelectModal'
      :columns='addProductColumns'
      :data-url='productList'
      :title="'添加试件信息'"
      type='product'
      @callback='productCallback'
    />
    <handle-select-modal
      ref='equipHandleSelectModal'
      :columns='addEquipColumns'
      :data-url='equipList'
      :title="'添加测试设备'"
      type='equip'
      :searchData="equipSearchData"
      @callback='equipCallback'
    />
    <handle-select-modal
      ref='sensorHandleSelectModal'
      :columns='addSensorColumns'
      :data-url='sensorList'
      :title="'添加传感器'"
      type='sensor'
      :searchData="equipSearchData"
      @callback='sensorCallback'
    />
    <handle-select-modal
      ref='toolsProductHandleSelectModal'
      :columns='addToolsProductColumns'
      :data-url='toolsProductList'
      :title="'添加振动工装'"
      type='toolsProduct'
      :searchData="toolSearchBar"
      @callback='toolsProductCallback'
    />
    <postion-modal ref='PostionModal' :title="'添加参试人员'" @change='selectPersonHandle'/>
  </h-modal>
</template>

<script>
import moment from 'moment'
import {cloneDeep} from 'lodash'
import {postAction} from '@/api/manage'
import HandleSelectModal from '../modules/components/HandleSelectModal.vue'
import PostionModal from '../modules/PostionModal'
import {randomUUID, recursive} from "@/utils/util";
import {USER_INFO} from "@/store/mutation-types";

export default {
  inject: {
    getContainer: {
      default: () => document.body
    }
  },
  props: {
    records: {
      type: Object,
      default: () => {
      }
    },
    selectedTreeRows: {
      type: [Object, Array],
      default: () => {
      }
    }
  },
  components: {
    HandleSelectModal,
    PostionModal,
  },
  data() {
    return {
      moment,
      productStatusOptions: [{key: '1', value: '1', label: '完好'}, {key: '2', value: '2', label: '损坏'}],
      siteRunningStatus: [
        {key: '1', value: '1', label: '正常'},
        {key: '2', value: '2', label: '异常'},
        {key: '3', value: '3', label: '未知'}
      ],
      siteInspectionColumns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return parseInt(index) + 1
          }
        },
        {
          title: '试验方向',
          dataIndex: 'testDirection',
          align: 'center',
          width: 150,
          customRender: (t, row, index) => {
            return this.$createElement('a-tree-select', {
              props: {
                showSearch: true,
                placeholder: '请选择试验方向',
                treeData: this.testDirectionTreeData,
                allowClear: true,
                treeNodeFilterProp: 'title',
                dropdownStyle: {
                  maxHeight: '300px'
                },
              },
              value: row.testDirectionId,
              style: {width: "100%"},
              on: {
                change: (v, option) => {
                  row.testDirectionId = v
                }
              },
            })
          }
        },
        {
          title: '向次',
          dataIndex: 'directionNum',
          align: 'center',
          width: 100,
          scopedSlots: {customRender: 'directionNum'},
          customRender: (t, row, index) => {
            return this.$createElement('a-input', {
              props: {
                placeholder: '请输入向次',
                allowClear: true,
              },
              value: row.directionNum,
              style: {width: "100%"},
              on: {
                change: (e) => {
                  row.directionNum = e.target.value
                }
              },
            })
          }
        },
        {
          title: '日期时间',
          dataIndex: 'inspectionTime',
          align: 'center',
          width: 170,
          customRender: (t, row) => {
            return this.$createElement('a-date-picker', {
              props: {
                placeholder: '请选择时间',
                format: 'YYYY-MM-DD HH:mm:ss',
                showTime: true,
              },
              style: {width: '100%'},
              value: row.inspectionTime,
              on: {
                change: (val) => {
                  row.inspectionTime = moment(val).valueOf()
                }
              }
            })
          }
        },
        {
          title: '温度设定值(℃)',
          dataIndex: 'setUpValue',
          align: 'center',
          width: 150,
          customRender: (t, row, index) => {
            return this.$createElement('a-input-number', {
              props: {
                placeholder: '请输入温度设定值(℃)',
                allowClear: true,
              },
              value: row.setUpValue,
              style: {width: "100%"},
              on: {
                change: (value) => {
                  row.setUpValue = value
                }
              },
            })
          }
        },
        {
          title: '温度实测值(℃)',
          dataIndex: 'measuredValue',
          align: 'center',
          width: 150,
          customRender: (t, row, index) => {
            return this.$createElement('a-input-number', {
              props: {
                placeholder: '请输入温度实测值(℃)',
                allowClear: true,
              },
              value: row.measuredValue,
              style: {width: "100%"},
              on: {
                change: (value) => {
                  row.measuredValue = value
                }
              },
            })
          }
        },
        {
          title: '运行状态',
          dataIndex: 'runStatus',
          align: 'center',
          width: 120,
          customRender: (t, row, index) => {
            return this.$createElement('h-select', {
              props: {
                placeholder: '请选择运行状态',
                allowClear: true,
                options: this.siteRunningStatus
              },
              value: row.runStatus,
              style: {width: "100%"},
              on: {
                change: (value) => {
                  row.runStatus = value
                }
              },
            })
          }
        },
        {
          title: '操作人',
          dataIndex: 'operationPerson',
          align: 'center',
          scopedSlots: {customRender: 'operationPerson'},
        },
        {
          title: '备注',
          dataIndex: 'remarks',
          align: 'center',
          width: 270,
          customRender: (t, row) => {
            return this.$createElement('a-textarea', {
              props: {
                placeholder: '请输入备注',
                autoSize: {minRows: 1}
              },
              style: {width: '100%'},
              value: row.remarks,
              on: {
                change: (val) => {
                  row.remarks = val
                }
              }
            })
          }
        },
      ],
      siteInspectionTable: [],
      // 试验方向下拉树数据
      testDirectionTreeData: [],
      pictureData: [],
      visible: false,
      submitLoading: false,
      title: '',
      testId: '',
      model: {},
      url: {
        detail: '/HfEnvTaskTestBusiness/queryById',
        save: '/HfEnvTaskTestBusiness/modifyById',
        process: '/HfPrjUnitProcessDescBusiness/listByUnitId',
        workName: '/HfPrjWorkCenterBusiness/listAll',
        testPerson: '/HfResEnvTestPersonBusiness/listAll',
        updateFileStatus: '/HfEnvTestPressureRecordBusiness/updateFileStatus',
        attachList: '/MinioBusiness/listByRefId',
        deleteImg: '/MinioBusiness/logicRemoveById',
        listTree: '/HfResTestDirection/listTree',
      },
      equipSearchData: [
        {
          title: '设备编号',
          formType: 'input',
          key: 'c_equipCode_7',
        },
        {
          title: '设备名称 ',
          formType: 'input',
          key: 'c_equipName_7',
        },
        {
          title: '设备类型',
          formType: 'dict',
          key: 'c_equipTypeCode_1',
          dictCode: 'hf_res_equip_type',
        },
        {
          title: '设备型号',
          formType: 'input',
          key: 'c_equipModel_7',
        },
        {
          title: '资产编号',
          formType: 'input',
          key: 'c_assetsCode_7',
        },],
      toolSearchBar: [
        {
          title: '工装编号',
          formType: 'input',
          key: 'c_toolsCode_7'
        },
        {
          title: '工装名称',
          formType: 'input',
          key: 'c_toolsName_7'
        },
        {
          title: '责任部门',
          formType: 'input',
          key: 'c_deptName_7'
        },
        {
          title: '责任人',
          formType: 'input',
          key: 'c_personName_7'
        },
        {
          title: '存放地点',
          formType: 'input',
          key: 'c_location_7'
        },
        {
          title: '在库状态',
          formType: 'dict',
          key: 'c_larbaryStatus_1',
          dictCode: 'larbary_status'
        },
        {
          title: '设备状态',
          formType: 'dict',
          key: 'c_toolsStatus_1',
          dictCode: 'tools_status'
        }
      ],
      equipList: {
        list: '/HfResEquipBusiness/listPage',
        queryParams: {}
      },
      productList: {
        list: '/HfEnvTaskTestBusiness/testTaskPieceList',
        queryParams: {}
      },
      sensorList: {
        list: '/HfResSensorBusiness/listPageBySearchType',
        queryParams: {}
      },
      toolsProductList: {
        list: '/HfToolsProducts/listAll',
        queryParams: {}
      },
      formData: [
        {
          title: '入场时间',
          key: 'approachTime',
          validate: {rules: [{required: false, validator: this.validateStartTime}]},
          component: (
            <h-time-select
              v-decorator={['approachTime', {rules: [{required: false, message: '请选择入场时间'}]}]}
            />
          )
        },
        {
          title: '离场时间',
          key: 'departureTime',
          validate: {rules: [{required: false, validator: this.validateEndTime}]},
          component: (
            <h-time-select v-decorator={['departureTime', {rules: [{required: false, message: '请选择离场时间'}]}]}/>
          )
        },
        {
          title: '开始时间',
          key: 'realStartTime',
          validate: {rules: [{required: false, validator: this.validateStartTime}]},
          component: (
            <h-time-select
              v-decorator={['realStartTime', {rules: [{required: false, message: '请选择开始时间'}]}]}
            />
          )
        },
        {
          title: '结束时间',
          key: 'realEndTime',
          validate: {rules: [{required: false, validator: this.validateEndTime}]},
          component: (
            <h-time-select v-decorator={['realEndTime', {rules: [{required: false, message: '请选择结束时间'}]}]}/>
          )
        },
        {
          title: '温度(°C)',
          key: 'temperature',
          formType: 'input-number',
          style: {
            width: '100%',
          }
        },
        {
          title: '湿度(RH)',
          key: 'humidity',
          formType: 'input-number',
          style: {
            width: '100%',
          }
        },
        {
          title: '自检',
          key: 'selfInspection',
          formType: 'input',
        },
        {
          title: '互检',
          key: 'mutualInspection',
          formType: 'input',
        },
        {
          title: '实施过程',
          key: 'remarks',
          formType: 'textarea',
          span: 2
        }
      ],
      addProductColumns: [
        {
          title: '委托单号',
          dataIndex: 'entrustCode',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '试件单位',
          dataIndex: 'custName',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '试件编号',
          dataIndex: 'pieceCode',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '试件名称',
          dataIndex: 'productName',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '试件代号',
          dataIndex: 'productAlias',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '试件型号',
          dataIndex: 'productModel',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '试件规格',
          dataIndex: 'productSpec',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '试件数量',
          dataIndex: 'pieceNum',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '库存数量',
          dataIndex: 'pieceCnum',
          customRender: (t) => {
            return t ? t : '--'
          }
        }
      ],
      addEquipColumns: [
        {
          title: '设备编号',
          dataIndex: 'equipCode',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '设备名称',
          dataIndex: 'equipName',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '设备类型',
          dataIndex: 'equipTypeName',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '计量有效期',
          dataIndex: 'checkValid',
          customRender: (t, record) => {
            return +record.checkValid && moment(+record.checkValid).format('YYYY-MM-DD') || '--'
          }
        },
        {
          title: '设备型号',
          dataIndex: 'equipModel',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '资产编号',
          dataIndex: 'assetsCode',
          customRender: (t) => {
            return t ? t : '--'
          }
        }
      ],
      productTable: [],
      testProductColumns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return parseInt(index) + 1
          }
        },
        {
          title: '试件编号',
          dataIndex: 'pieceNo',
          align: 'center',
        },
        {
          title: '试件附件',
          dataIndex: 'productFile',
          align: 'center',
          scopedSlots: {customRender: 'productFile'},
        },
        {
          title: '试前状态',
          dataIndex: 'productBeforeStatus',
          align: 'center',
          width: 120,
          scopedSlots: {customRender: 'productBeforeStatus'},
        },
        {
          title: '试后状态',
          dataIndex: 'productAfterStatus',
          align: 'center',
          width: 120,
          scopedSlots: {customRender: 'productAfterStatus'},
        },
        {
          title: '产品代号',
          dataIndex: 'productAlias',
          align: 'center',
        },
        {
          title: '规格大小',
          dataIndex: 'productSpec',
          align: 'center',
        },
        {
          title: '送试单位',
          dataIndex: 'custName',
          align: 'center',
        },
        {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: {customRender: 'action'},
          width: 60,
          fixed: 'right',
          align: 'center'
        }
      ],
      personArr: [],
      personColumns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return parseInt(index) + 1
          }
        },
        {title: '参试人员岗位', dataIndex: 'testPostName'},
        {title: '参试人员姓名', dataIndex: 'testUserName'},
        {
          title: '操作',
          key: 'action',
          scopedSlots: {customRender: 'action'},
          width: 60,
          fixed: 'right',
          align: 'center'
        }
      ],
      equipData: [],
      testEquipColumns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return parseInt(index) + 1
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
          fixed: 'right',
          align: 'center'
        }
      ],
      addSensorColumns: [
        {
          title: '设备编号',
          dataIndex: 'equipCode',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '设备名称',
          dataIndex: 'equipName',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '计量有效期',
          dataIndex: 'checkValid',
          customRender: (t, record) => {
            return +record.checkValid && moment(+record.checkValid).format('YYYY-MM-DD') || '--'
          }
        },
        {
          title: '设备型号',
          dataIndex: 'equipModel',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '资产编号',
          dataIndex: 'assetsCode',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '技术参数',
          dataIndex: 'technologyParam',
          customRender: (text) => {
            return text || '--'
          },
        },
      ],
      sensorColumns: [
        {
          title: '设备编号',
          dataIndex: 'equipCode',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '设备名称',
          dataIndex: 'equipName',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '计量有效期',
          dataIndex: 'checkValid',
          customRender: (t, record) => {
            return +record.checkValid && moment(+record.checkValid).format('YYYY-MM-DD') || '--'
          }
        },
        {
          title: '设备型号',
          dataIndex: 'equipModel',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: {customRender: 'action'},
          width: 60,
          fixed: 'right',
          align: 'center'
        }
      ],
      sensorData: [],
      toolsProductData: [],
      addToolsProductColumns: [
        {
          title: '工装编号',
          dataIndex: 'toolsCode',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '工装名称',
          dataIndex: 'toolsName',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '工装规格',
          dataIndex: 'toolsSize',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '在库状态',
          dataIndex: 'larbaryStatus_dictText',
          customRender: (text) => {
            return text || '--'
          }
        },
        {
          title: '存放地点',
          dataIndex: 'location',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '责任部门',
          dataIndex: 'deptName',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '设备状态',
          dataIndex: 'toolsStatus_dictText',
          align: 'left',
          width: 120,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '工装分类',
          dataIndex: 'classify_dictText',
          customRender: (text) => {
            return text || '--'
          }
        },
      ],
      toolsProductColumns: [
        {
          title: '工装编号',
          dataIndex: 'toolsCode',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '工装名称',
          dataIndex: 'toolsName',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '工装规格',
          dataIndex: 'toolsSize',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '在库状态',
          dataIndex: 'larbaryStatus_dictText',
          customRender: (text) => {
            return text || '--'
          }
        },
        {
          title: '存放地点',
          dataIndex: 'location',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '责任部门',
          dataIndex: 'deptName',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '设备状态',
          dataIndex: 'toolsStatus_dictText',
          align: 'left',
          width: 120,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '工装分类',
          dataIndex: 'classify_dictText',
          customRender: (text) => {
            return text || '--'
          }
        },
        {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: {customRender: 'action'},
          width: 60,
          fixed: 'right',
          align: 'center'
        }
      ],
    }
  },
  computed: {
    pictureCustomParams() {
      return {
        refId: this.testId,
        refType: 'test_picture'
      }
    }
  },
  methods: {
    show(record) {
      this.testId = record.id
      this.visible = true
      this.getTestDetail(record.id)
      this.$nextTick(() => {
        this.productList.queryParams = {id: record.id, projectPieceInfo: []}
      })
      this.loadImgData()
      this.getTestDirectionTreeData()
    },
    // 获取试验方向数据
    getTestDirectionTreeData() {
      postAction(this.url.listTree).then((res) => {
        if (res.code === 200) {
          this.testDirectionTreeData = recursive(res.data, 'directionName', 'id')
        }
      })
    },
    // 巡检记录新增行
    siteInspectionAdd() {
      let user = this.$ls.get(USER_INFO)
      this.siteInspectionTable.push({
        id: randomUUID(),
        operationPerson: user.idName,
        operationPersonId: user.id,
      })
    },
    // 查看试件附件
    previewProductFile(row) {

    },
    // 试前试后产品状态change事件
    productStatusChange(row, e, type) {
      console.log(row, e, type, 'row, e, type')
    },
    loadImgData() {
      postAction(this.url.attachList, {refType: 'test_picture', refId: this.testId}).then((res) => {
        if (res.code === 200) {
          const {data} = res
          let fileArr = []
          let obj = {}
          if (data && data.length > 0) {
            data.forEach((item) => {
              fileArr.push({
                fileId: item.id,
                size: item.fileSize,
                status: item.status == 9 ? 'success' : 'exception',
                isInReport: item.isInReport,
                url: item.filePath,
                name: item.fileName,
                uuid: item.id,
                percent: 100,
                uploadTime: item.createTime,
                secretLevel: item.secretLevel,
                remarks: item.remarks,
                type: item.viewType == 2 ? 'image/jpeg' : 'text/plain',
                replaceStatus: item.replaceStatus
              })
            })
          }
          this.pictureData = fileArr
        }
      })
    },
    handleCancel() {
      this.visible = false
    },
    handlecCollect(file) {
      postAction(this.url.updateFileStatus, {fileId: file.fileId, isInReport: file.isInReport})
    },
    // 图片删除
    handleDeleteImg(file) {
      postAction(this.url.deleteImg, {id: file.fileId}).then(() => {
        this.$message.success('删除成功')
      })
    },
    validateStartTime(rule, value, cb) {
      let endTime = this.$refs.carryOutProcessForm.form.getFieldsValue(['realEndTime'])
      let valEnd = endTime.endTime
      let val = value ? moment(value).valueOf() : ''
      valEnd = valEnd ? moment(valEnd).valueOf() : ''
      if (!val) {
        cb()
      } else {
        if (valEnd && val > valEnd) {
          cb('开始时间不能大于结束时间')
        } else {
          cb()
        }
      }
    },
    validateEndTime(rule, value, cb) {
      let startTime = this.$refs.carryOutProcessForm.form.getFieldsValue(['realStartTime'])
      let valStart = startTime.startTime
      let val = value ? moment(value).valueOf() : ''
      valStart = valStart ? moment(valStart).valueOf() : ''
      if (!val) {
        cb()
      } else {
        if (valStart && val < valStart) {
          cb('结束时间不能小于开始时间')
        } else {
          cb()
        }
      }
    },
    getTestDetail(id) {
      postAction(this.url.detail, {id: id}).then((res) => {
        if (res.code === 200) {
          let model = Object.assign({}, res.data)
          this.productTable = model.testPieceInfo.map(item => {
            return {
              ...item,
              productBeforeStatus: item.productBeforeStatus || '1',
              productAfterStatus: item.productAfterStatus || '1'
            }
          })
          this.personArr = model.testPersonInfo
          this.testTaskData = model.testTaskInfo
          this.projectData = model.testTaskInfo
          this.productList.queryParams.projectPieceInfo = []
          this.productTable.forEach((item) => {
            this.productList.queryParams.projectPieceInfo.push({projectId: item.projectId, pieceId: item.pieceId})
          })
          this.equipData = model.testEquipInfo.length ? model.testEquipInfo : this.selectedTreeRows
          this.sensorData = model.testSensorInfo
          this.toolsProductData = model.testToolsProductInfo
          model.realStartTime = model.realStartTime && this.model.realStartTime !== '0' ? moment(+(model.realStartTime)) : null
          model.realEndTime = model.realEndTime && model.realEndTime !== '0' ? moment(+(model.realEndTime)) : null
          model.approachTime = model.approachTime && this.model.approachTime !== '0' ? moment(+(model.approachTime)) : null
          model.departureTime = model.departureTime && model.departureTime !== '0' ? moment(+(model.departureTime)) : null
          this.model = model
        }
      })
    },
    productAdd() {
      this.$refs.productHandleSelectModal.show()
      this.productList.queryParams.projectPieceInfo = []
      this.productTable.forEach((item) => {
        this.productList.queryParams.projectPieceInfo.push({projectId: item.projectId, pieceId: item.pieceId})
      })
    },
    productHandleDelete(id) {
      for (let i = 0; i < this.productTable.length; i++) {
        if (id === this.productTable[i].id) {
          this.productTable.splice(i, 1)
        }
      }
    },
    productCallback(value) {
      this.productTable = this.productTable.concat(value)
    },
    personAdd() {
      this.$refs.PostionModal.show(this.personArr, '选择参试人员')
    },
    sensorAdd() {
      this.$refs.sensorHandleSelectModal.show(this.sensorData, '选择传感器')
    },
    toolsProductAdd() {
      this.$refs.toolsProductHandleSelectModal.show(this.toolsProductData, '选择振动工装')
    },
    sensorHandleDelete(index) {
      this.sensorData.splice(index, 1)
    },
    toolsProductHandleDelete(index) {
      this.toolsProductData.splice(index, 1)
    },
    personHandleDelete(index) {
      this.personArr.splice(index, 1)
    },
    selectPersonHandle(val) {
      let newPerson = []
      if (val.length) {
        val.forEach((item, index) => {
          newPerson.push({
            id: '',
            rowId: index + 1,
            testUserId: item.id,
            testUserName: item.idName,
            testPostId: item.postId,
            testPostName: item.postName
          })
        })
      }
      this.personArr = cloneDeep([].concat([], this.personArr, newPerson))
    },
    equipAdd() {
      this.$refs.equipHandleSelectModal.show(this.equipData)
    },
    equipHandleDelete(index) {
      this.equipData.splice(index, 1)
    },
    equipCallback(value) {
      this.equipData = this.equipData.concat(value)
    },
    sensorCallback(value) {
      this.sensorData = Array.isArray(this.sensorData) ? this.sensorData.concat(value) : [].concat(value)
    },
    toolsProductCallback(value) {
      this.toolsProductData = Array.isArray(this.toolsProductData) ? this.toolsProductData.concat(value) : [].concat(value)
    },
    // 保存
    handleSave() {
      this.submitLoading = true
      const {
        $refs: {carryOutProcessForm}
      } = this
      const carryOutProcess_form = new Promise((resolve, reject) => {
        carryOutProcessForm.form.validateFieldsAndScroll((err, values) => {
          if (err) {
            reject(err)
            return
          }
          resolve(values)
        })
      })
      Promise.all([carryOutProcess_form]).then((values) => {
        let params = {
          id: this.records.id,
          realStartTime: values[0].realStartTime ? values[0].realStartTime.valueOf() : '',
          realEndTime: values[0].realEndTime ? values[0].realEndTime.valueOf() : '',
          workId: values[0].workId,
          processDesc: values[0].processDesc, //试验结果
          remarks: values[0].remarks, //备注
          personArr: this.personArr, //参试人员集合
          testEquipArr: this.equipData, //测试设备集合
          pieceArr: this.productTable, //被试件(试件)集合
          testSensorArr: this.sensorData,
          testToolsProductArr: this.toolsProductData,
          pictureData: this.pictureData, // 图片图谱
        }
        postAction(this.url.save, params).then((res) => {
          if (res.code === 200) {
            this.$message.success('保存成功')
            this.handleCancel()
          } else {
            this.$message.warning(res.msg)
          }
        }).finally(() => {
          this.submitLoading = false
        })
      }).catch(() => {
        this.submitLoading = false
      })
    }
  }
}
</script>
<style lang='less' scoped>
.fastBtn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: -20px;
  margin-left: 84px;
}
</style>