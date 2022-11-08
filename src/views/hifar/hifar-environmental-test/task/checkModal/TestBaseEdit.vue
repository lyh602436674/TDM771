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
    inner
    width='95%'
    @cancel='handleCancel'
  >
    <div slot='footer' class='footer'>
      <a-button style='margin-right: 8px' type='ghost-danger' @click='handleCancel'> 关闭
      </a-button>
      <a-button :loading="submitLoading" type='primary' @click='handleSave'>保存</a-button>
    </div>
    <!-- 样品信息 -->
    <h-desc title='样品信息'>
      <h-card :bordered='false' style='width: 100%'>
        <template slot='table-operator'>
          <a-button icon='plus' size='small' style='margin-bottom: 10px' type='primary' @click='productAdd'>
            添加
          </a-button>
        </template>
        <div slot='content'>
          <a-table
            :columns='testProductColumns[+entrustType]'
            :dataSource='productTable'
            :pagination='false'
            bordered
            rowKey='id'
            size='small'
          >
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
        </div>
      </h-card>
    </h-desc>
    <!-- 实施过程 -->
    <h-desc style='margin-top: 20px' title='实施过程'>
      <h-card :bordered='false' style='width: 100%'>
        <h-form
          ref='carryOutProcessForm'
          v-model='carryOutProcessModel'
          :column='2'
          :formData='carryOutProcessFormData'
          style='width: 100%'
        />
      </h-card>
    </h-desc>
    <!-- 参试人员 -->
    <h-desc style='margin-top: 20px' title='参试人员'>
      <h-card :bordered='false' style='width: 100%'>
        <template slot='table-operator'>
          <a-button icon='plus' size='small' style='margin-bottom: 10px' type='primary' @click='personAdd'>
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
            <template #action='text, record'>
              <a-popconfirm title='确定删除吗?' @confirm='() => personHandleDelete(record.testUserId)'>
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
          <a-button icon='plus' size='small' style='margin-bottom: 10px' type='primary' @click='equipAdd'>
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
            <template #action='text, record'>
              <a-popconfirm title='确定删除吗?' @confirm='() => equipHandleDelete(record.id)'>
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
          <a-button icon='plus' size='small' style='margin-bottom: 10px' type='primary' @click='sensorAdd'>
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
          <a-button icon='plus' size='small' style='margin-bottom: 10px' type='primary' @click='toolsProductAdd'>
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
      <h-upload-file accept="image/png,image/gif,image/jpg,image/jpeg" style="width: 100%" v-model="pictureData"
                     isWriteRemarks :customParams="pictureCustomParams" @delete="handleDeleteImg"></h-upload-file>
    </h-desc>
    <handle-select-modal
      ref='productHandleSelectModal'
      :columns='addProductColumns'
      :data-url='productList'
      :title="'添加样品信息'"
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
      pictureData: [],
      visible: false,
      submitLoading: false,
      entrustType: 2,
      title: '',
      testId: '',
      carryOutProcessModel: {},
      url: {
        detail: '/HfEnvTaskTestBusiness/queryById',
        save: '/HfEnvTaskTestBusiness/modifyById',
        process: '/HfPrjUnitProcessDescBusiness/listByUnitId',
        workName: '/HfPrjWorkCenterBusiness/listAll',
        testPerson: '/HfResEnvTestPersonBusiness/listAll',
        updateFileStatus: '/HfEnvTestPressureRecordBusiness/updateFileStatus',
        attachList: '/MinioBusiness/listByRefId',
        deleteImg: '/MinioBusiness/logicRemoveById',
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
      carryOutProcessFormData: [
        {
          title: '开始时间',
          key: 'realStartTime',
          span: 1,
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
          span: 1,
          validate: {rules: [{required: false, validator: this.validateEndTime}]},
          component: (
            <h-time-select v-decorator={['realEndTime', {rules: [{required: false, message: '请选择结束时间'}]}]}/>
          )
        },
        {
          title: '试验结果',
          key: 'processDesc',
          validate: {
            rules: [{required: true, message: '请输入或者选择试验结果'}]
          },
          span: 2,
          component: (
            <a-select
              v-decorator={['processDesc', {initialValue: []}]}
              showSearch={true}
              onSearch={(value) => {
                this.$refs.carryOutProcessForm.form.setFieldsValue({processDesc: value})
              }}
              onBlur={(value) => {
                this.$refs.carryOutProcessForm.form.setFieldsValue({processDesc: value})
              }}
            >
              <a-select-option key={'满足试验条件'}>{'满足试验条件'}</a-select-option>
              <a-select-option key={'满足试验条件，附试验谱型'}>{'满足试验条件，附试验谱型'}</a-select-option>
            </a-select>
          )
        },
        {
          title: '备注',
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
          title: '样品单位',
          dataIndex: 'custName',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '样品编号',
          dataIndex: 'pieceCode',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '样品名称',
          dataIndex: 'productName',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '样品代号',
          dataIndex: 'productAlias',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '样品型号',
          dataIndex: 'productModel',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '样品规格',
          dataIndex: 'productSpec',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '样品数量',
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
      testProductColumns: {
        1: [
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
            title: '样品名称',
            dataIndex: 'productName',
            align: 'center',
          },
          {
            title: '型号/规格',
            dataIndex: 'productModel',
            align: 'center',
          },
          {
            title: '样品编号',
            dataIndex: 'pieceNo',
            align: 'center',
          },
          {
            title: '样品数量',
            dataIndex: 'pieceNum',
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
        2: [
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
            title: '样品名称',
            dataIndex: 'productName',
            align: 'center',
          },
          {
            title: '图号',
            dataIndex: 'productAlias',
            align: 'center',
          },
          {
            title: '样品编号',
            dataIndex: 'pieceNo',
            align: 'center',
          },
          {
            title: '样品数量',
            dataIndex: 'pieceNum',
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


      },
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
          dataIndex: 'action',
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
      let endTime = this.$refs.carryOutProcessForm.form.getFieldsValue(['endTime'])
      let valEnd = endTime.endTime
      let val = value ? moment(value).valueOf() : ''
      valEnd = valEnd ? moment(valEnd).valueOf() : ''
      if (!val) {
        // cb('请选择开始时间')
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
      let startTime = this.$refs.carryOutProcessForm.form.getFieldsValue(['startTime'])
      let valStart = startTime.startTime
      let val = value ? moment(value).valueOf() : ''
      valStart = valStart ? moment(valStart).valueOf() : ''
      if (!val) {
        // cb('请选择结束时间')
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
      let productArr = []
      let personArr = []
      postAction(this.url.detail, {id: id}).then((res) => {
        if (res.code == 200) {
          this.entrustType = res.data.entrustInfo[0].entrustType
          res.data.testPieceInfo.forEach((item) => {
            productArr.push({
              id: item.id,
              custName: item.custName,
              entrustId: item.entrustId,
              entrustCode: item.entrustCode,
              projectId: item.projectId,
              projectCode: item.projectCode,
              taskId: item.taskId,
              taskCode: item.taskCode,
              pieceId: item.pieceId,
              pieceNo: item.pieceNo,
              pieceCode: item.pieceCode,
              productId: item.productId,
              productCode: item.productCode,
              productName: item.productName,
              productModel: item.productModel,
              productAlias: item.productAlias,
              pieceNum: item.pieceNum,
              pieceCnum: item.pieceCnum,
              intactStatus: item.intactStatus,
              remarks: item.remarks
            })
          })
          res.data.testPersonInfo.forEach((item) => {
            personArr.push({
              id: item.id,
              testPostName: item.testPostName,
              testPostId: item.testPostId,
              testUserId: item.testUserId,
              testUserName: item.testUserName
            })
          })
          this.productTable = productArr
          this.personArr = personArr
          this.testTaskData = res.data.testTaskInfo
          this.projectData = res.data.testTaskInfo
          this.productList.queryParams.projectPieceInfo = []
          this.productTable.forEach((item) => {
            this.productList.queryParams.projectPieceInfo.push({projectId: item.projectId, pieceId: item.pieceId})
          })
          this.equipData = res.data.testEquipInfo.length ? res.data.testEquipInfo : this.selectedTreeRows
          this.sensorData = res.data.testSensorInfo
          this.toolsProductData = res.data.testToolsProductInfo
          this.carryOutProcessModel = JSON.parse(JSON.stringify(res.data))
          this.carryOutProcessModel.workId =
            this.carryOutProcessModel.workId && this.carryOutProcessModel.workId != 0
              ? this.carryOutProcessModel.workId
              : undefined
          this.carryOutProcessModel.realStartTime =
            this.carryOutProcessModel.realStartTime && this.carryOutProcessModel.realStartTime != 0
              ? moment(parseFloat(this.carryOutProcessModel.realStartTime))
              : ''
          this.carryOutProcessModel.realEndTime =
            this.carryOutProcessModel.realEndTime && this.carryOutProcessModel.realEndTime != 0
              ? moment(parseFloat(this.carryOutProcessModel.realEndTime))
              : ''
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
      value.forEach((item) => {
        this.productTable.push({
          id: item.id,
          custName: item.custName,
          entrustId: item.entrustId,
          entrustCode: item.entrustCode,
          projectId: item.projectId,
          projectCode: item.projectCode,
          taskId: item.taskId,
          taskCode: item.taskCode,
          pieceId: item.pieceId,
          pieceNo: item.pieceNo,
          pieceCode: item.pieceCode,
          productId: item.productId,
          productCode: item.productCode,
          productName: item.productName,
          productModel: item.productModel,
          productAlias: item.productAlias,
          pieceNum: item.pieceNum,
          pieceCnum: item.pieceCnum,
          intactStatus: item.intactStatus,
          remarks: item.remarks
        })
      })
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
    personHandleDelete(testUserId) {
      for (let i = 0; i < this.personArr.length; i++) {
        if (testUserId === this.personArr[i].testUserId) {
          this.personArr.splice(i, 1)
        }
      }
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
    equipHandleDelete(id) {
      for (let i = 0; i < this.equipData.length; i++) {
        if (id === this.equipData[i].id) {
          this.equipData.splice(i, 1)
        }
      }
    },
    equipCallback(value) {
      for (let i = 0; i < value.length; i++) {
        this.equipData.push(value[i])
      }
    },
    sensorCallback(value) {
      this.sensorData = Array.isArray(this.sensorData) ? this.sensorData.concat(value) : [].concat(value)
    },
    toolsProductCallback(value) {
      this.toolsProductData = Array.isArray(this.toolsProductData) ? this.toolsProductData.concat(value) : [].concat(value)
    },
    // 保存
    handleSave() {
      console.log(this.pictureData, 'this.pictureData')
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
          pieceArr: this.productTable, //被试件(样品)集合
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