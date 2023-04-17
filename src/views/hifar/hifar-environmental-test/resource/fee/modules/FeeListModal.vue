<!--
 * @Author: 赵峰
 * @Date: 2021-09-13 14:00:33
 * @LastEditTime: 2021-09-18 17:25:28
 * @LastEditors: 赵峰
 * @Descripttion: 计费标准--新增、编辑
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-physico-chemical\resource\fee\modules\FeeListModal.vue
-->
<template>
  <h-modal
    :title="title"
    inner
    :visible="visible"
    :getContainer="getContainer"
    fullScreen
    destroyOnClose
    :confirm-loading="confirmLoading"
    @submit="handleClickSubmit"
    @cancel="handleCancel"
  >
    <div style="padding:20px">
      <h-form
        v-if="visible"
        ref="repairRecordForm"
        v-model="model"
        :column="2"
        :formData="formData"
        style="margin-top: 20px"
        @change="submitHandle"
      ></h-form>
      <h-card title="设备单价">
        <h-search
          v-model="queryParams"
          :data="searchBar"
          size="small"
          @change="loadUnitById(rowId)"
        />
        <div style="margin-top: 10px">
          <a-button icon="plus" size="small" style="margin-right: 5px; margin-bottom: 4px" type="ghost-primary"
                    @click="insertEventHandle">新增
          </a-button>
          <a-popconfirm v-if="hasSelected" title="确定删除吗？" @confirm="handleDelete">
            <a-button
              icon="delete"
              size="small"
              style="margin-bottom: 4px"
              type="danger"
            >删除
            </a-button>
          </a-popconfirm>
        </div>
        <div>
          <vxe-table
            ref="priceDataTable"
            :data="priceData"
            :edit-config="{ key: 'id', trigger: 'click', mode: 'row', showStatus: true }"
            :edit-rules="validRules"
            :max-height="520"
            :loading="tableLoading"
            border
            keep-source
            resizable
            rowId="id"
            show-all-overflow
            @checkbox-all="selectAllEvent"
            @checkbox-change="onSelectChange"
            @edit-closed="handleEditClosed"
          >
            <vxe-table-column align="center" type="checkbox" width="40"></vxe-table-column>
            <vxe-table-column align="center" type="seq" width="60"></vxe-table-column>
            <vxe-table-column field="unitName" title="设备名称" width="160"></vxe-table-column>
            <vxe-table-column field="innerName" title="内部名称" width="160"></vxe-table-column>
            <vxe-table-column field="equipModel" title="设备型号" width="160"></vxe-table-column>
            <vxe-table-column field="assetsCode" title="资产编号" width="160"></vxe-table-column>
            <vxe-table-column
              width="160"
              :edit-render="{ name: '$input', props:{readonly: true},  placeholder: '请选择试验项目',events:{click:handleProjectNameClick} }"
              field="projectName" title="试验项目"></vxe-table-column>
            <vxe-table-column :visible="false" field="projectId"></vxe-table-column>
            <vxe-table-column
              minWidth="80"
              :edit-render="{ name: 'input', placeholder: '请输入速率范围' }"
              field="rate"
              title="速率"
            ></vxe-table-column>
            <vxe-table-column
              minWidth="120"
              :edit-render="{ name: 'input', placeholder: '请输入温度范围' }"
              field="temperatureRange"
              title="温度范围(℃)"
            ></vxe-table-column>
            <vxe-table-column
              minWidth="130"
              :edit-render="{ name: 'input', placeholder: '请输入湿度范围' }"
              field="humidityRange"
              title="湿度范围(RH)"
            ></vxe-table-column>
            <vxe-table-column
              minWidth="120"
              :edit-render="{ name: 'input', placeholder: '请输入压力范围' }"
              field="pressureRange"
              title="压力范围(Pa)"
            ></vxe-table-column>
            <vxe-table-column
              minWidth="120"
              :edit-render="{ name: 'input', placeholder: '请输入加速度范围' }"
              field="accelerationRange"
              title="加速度范围"
            ></vxe-table-column>
            <vxe-table-column
              minWidth="80"
              :edit-render="{ name: '$input', placeholder: '请输入折扣',events:{change:calcDiscountUnitPrice} }"
              field="discount"
              title="折扣"
            ></vxe-table-column>
            <vxe-table-column
              minWidth="140"
              :edit-render="{
                name: '$input',
                props: { type: 'number', min: 0, placeholder: '请输入标准单价（元）' },
                events:{change:calcDiscountUnitPrice}
              }"
              field="unitPrice"
              title="标准单价（元）"
            ></vxe-table-column>
            <vxe-table-column
              minWidth="120"
              field="discountPrice"
              title="折后单价（元）"
            ></vxe-table-column>
            <vxe-table-column
              minWidth="120"
              field="startupCost"
              title="开机费（元）"
            ></vxe-table-column>
            <vxe-table-column
              minWidth="150"
              :edit-render="{ name: '$input', props: { placeholder: '请输入单价描述' } }"
              field="remarks"
              title="单价描述"
            ></vxe-table-column>
          </vxe-table>
        </div>
      </h-card>
    </div>
    <sys-fee-list-select-modal ref="SysFeeListSelectModal" @change="feeSelectHandle"></sys-fee-list-select-modal>
    <project-add-modal ref='projectAddModal' @change='projectModalCallback'/>
  </h-modal>
</template>

<script>
import {postAction} from '@/api/manage'
import {cloneDeep, isNumber} from 'lodash'
import SysFeeListSelectModal from '@/views/components/SysFeeListSelectModal'
import ProjectAddModal from "@views/hifar/hifar-environmental-test/entrustment/modules/ProjectAddModal";

export default {
  components: {
    SysFeeListSelectModal,
    ProjectAddModal
  },
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  data() {
    const validatorFields = (cellValue, message, reg) => {
      return new Promise((resolve, reject) => {
        if (cellValue && !reg.test(cellValue)) {
          reject(new Error(message))
        } else {
          resolve()
        }
      })
    }
    const regRange = /^-?\d+(-\d*[1-9]\d*)$/

    return {
      dataSource: [],
      searchBar: [
        {
          title: '资产编号',
          key: 'assetsCode',
          formType: 'input',
        },
        {
          title: '设备型号',
          key: 'equipModel',
          formType: 'input',
        },
        {
          title: '设备名称',
          key: 'unitName',
          formType: 'input',
        },
        {
          title: '内部名称',
          key: 'innerName',
          formType: 'input',
        },
        {
          title: '试验项目',
          key: 'projectName',
          formType: 'input',
        },
      ],
      queryParams: {},
      visible: false,
      confirmLoading: false,
      tableLoading: false,
      model: {},
      title: '添加',
      selectedRows: [],
      priceData: [],
      priceDataExtend: [],
      projectData: [],
      validRules: {
        rate: [
          {required: false, trigger: 'blur'},
          {
            validator: ({cellValue}) => {
              return validatorFields(cellValue, '请输入正确格式的速率，例：-100-100', regRange)
            }
          }
        ],
        temperatureRange: [
          {required: false, trigger: 'blur'},
          {
            validator: ({cellValue}) => {
              return validatorFields(cellValue, '请输入正确格式的温度范围，例：-100-100', regRange)
            }
          }
        ],
        humidityRange: [
          {required: false, trigger: 'blur'},
          {
            validator: ({cellValue}) => {
              return validatorFields(cellValue, '请输入正确格式的湿度范围，例：-100-100', regRange)
            }
          }
        ],
        pressureRange: [
          {required: false, trigger: 'blur'},
          {
            validator: ({cellValue}) => {
              return validatorFields(cellValue, '请输入正确格式的压力范围，例：-100-100', regRange)
            }
          }
        ],
        accelerationRange: [
          {required: false, trigger: 'blur'},
          {
            validator: ({cellValue}) => {
              return validatorFields(cellValue, '请输入正确格式的加速度范围，例：-100-100', regRange)
            }
          }
        ],
        discount: [
          {required: false, trigger: 'blur'},
          {
            validator: ({cellValue}) => {
              const regMinMax = /^((\d|10)(\.\d{1,2})?)$/
              return new Promise((resolve, reject) => {
                if (cellValue && (!regMinMax.test(cellValue) || !isNumber(+cellValue) || cellValue < 0 || cellValue > 10)) {
                  reject(new Error('折扣值只能在0到10范围内,并且保留两位小数'))
                } else {
                  resolve()
                }
              })
            }
          }
        ],
        unitPrice: [{required: false, message: '单价不能为空', trigger: 'blur'}],
      },
      url: {
        add: '/HfResCustCostBusiness/addCostAndPrice',
        edit: '/HfResCustCostBusiness/modifyCostAndPriceById',
        detailById: '/HfResCustCostBusiness/queryById',
        priceUnit: '/HfResCustPriceBusiness/listAllByCostId',
        delete: '/HfResCustPriceBusiness/deleteCustPriceById',
      },
      selectProjectBefore: {},
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '计费标准名称',
          key: 'costName',
          span: 1,
          formType: 'input',
          validate: {
            rules: [{required: true, message: '请输入计费标准名称', trigger: 'blur'}],
          },
        },
        {
          span: 1,
          title: '计费标准描述',
          key: 'remarks',
          formType: 'textarea',
          autoSize: {minRows: 1}
        },
      ],
      rowId: "",
      onceFlag: true,
    }
  },

  computed: {
    hasSelected() {
      return this.selectedRows.length > 0
    },
  },
  methods: {
    show(record, title) {
      this.visible = true
      if (record.id) {
        this.rowId = record.id
        this.loadUnitById(record.id)
      }
      this.title = title
      this.editor(record)
    },
    handleEditClosed({row, rowIndex}) {
      // 单元格编辑状态下被关闭时会触发该事件
      for (let i = 0; i < this.priceDataExtend.length; i++) {
        let item = this.priceDataExtend[i]
        if (item.id === row.id) {
          this.priceDataExtend[i] = row
          return
        }
      }
    },
    handleProjectNameClick({row, rowIndex}) {
      this.selectProjectBefore = {row, rowIndex}
      this.$refs.projectAddModal.show(row.projectId ? row.projectId.split(',') : [])
    },
    projectModalCallback(recordId, record) {
      let {row: {projectId}, rowIndex} = this.selectProjectBefore
      this.$set(this.priceData[rowIndex], 'projectId', record.map(item => item.id).toString())
      this.$set(this.priceData[rowIndex], 'projectName', record.map(item => item.unitName).toString())
    },
    calcDiscountUnitPrice({row}) {
      let res = (row.discount && row.unitPrice && !isNaN(Number(row.unitPrice)) && !isNaN(Number(row.discount))) ? (row.discount * 0.1 * row.unitPrice).toFixed(2) : null
      this.$set(row, 'discountPrice', res)
    },
    loadUnitById(costId) {
      if (!costId) return
      this.tableLoading = true
      postAction(this.url.priceUnit, {costId: costId, ...this.queryParams}).then((res) => {
        if (res.code === 200) {
          let record = res.data
          this.priceData = record && record.length && record.map((item) => {
            return {
              ...item.equipData[0], // 设备信息全部从equipData中拿
              ...item,
              unitName: item.equipData[0].equipName,
              remarks: item.remarks,
              projectId: item.projectId || '',
              projectName: item.projectName || '',
            }
          }) || []
          if (this.onceFlag) {
            // 此变量用来判断页面进入第一次加载得到的数据
            // 这里的逻辑比较乱，因为搜索查询后表格的数据会变，保存时，不能只拿查询出来的表格数据，要拿第一次加载的原始数据（时间紧急，先这样处理）
            // 本来此表格数据不用查询，但是数据多的情况下还是得需要查询
            // 当然了，编辑和删除时，也会更新原始数据
            this.priceDataExtend = cloneDeep(this.priceData)
            this.onceFlag = false
          }

        }
      }).finally(() => {
        this.tableLoading = false
        this.selectedRows = []
      })
    },
    editor(record) {
      this.model = Object.assign({}, record)
    },
    //  多选
    onSelectChange(records) {
      this.selectedRows = records.records
    },
    // 全选
    selectAllEvent(records) {
      this.selectedRows = records.records
    },
    async handleDelete() {
      this.tableLoading = true
      for (let i = 0; i < this.selectedRows.length; i++) {
        for (let j = 0; j < this.priceDataExtend.length; j++) {
          if (this.selectedRows[i].id === this.priceDataExtend[j].id) {
            if (this.selectedRows[i].id && this.priceDataExtend[j].id) {
              await postAction(this.url.delete, {ids: this.selectedRows.map(item => item.id).toString()})
            }
            this.priceDataExtend.splice(j, 1)
            j--
            break
          }
        }
      }
      this.loadUnitById(this.rowId)
    },
    feeSelectHandle(selectedRowKeys, selectedRows) {
      let result = selectedRows && selectedRows.length && selectedRows.map((item) => {
        return {
          ...item,
          unitName: item.equipName,
          costId: this.model.id,
          unitId: item.id,
          id: '',
          projectId: '',
          projectName: '',
        }
      }) || []
      this.priceData = this.priceData.concat(result)
      this.priceDataExtend = this.priceDataExtend.concat(result)
    },
    insertEventHandle() {
      // let selectedRows = []
      // if (isArray(this.priceData)) {
      //   selectedRows = this.priceData.map((item) => {
      //     return (item.id = item.unitId)
      //   })
      // }
      // this.$refs.SysFeeListSelectModal.show(this.priceData, selectedRows)
      this.$refs.SysFeeListSelectModal.show()
    },
    handleClickSubmit() {
      this.$refs.repairRecordForm.validateForm()
    },
    formatPriceData(priceData) {
      return priceData.map((item) => {
        return {
          costId: item.costId || '',
          unitId: item.unitId,
          id: item.id,
          unitName: item.unitName,
          equipModel: item.equipModel,
          projectName: item.projectName,
          projectId: item.projectId,
          rate: item.rate,
          temperatureRange: item.temperatureRange,
          humidityRange: item.humidityRange,
          pressureRange: item.pressureRange,
          accelerationRange: item.accelerationRange,
          discount: item.discount,
          unitPrice: item.unitPrice,
          discountPrice: item.discountPrice,
          remarks: item.remarks,
        }
      })
    },
    // 提交
    async submitHandle(values) {
      if (this.confirmLoading) return
      this.confirmLoading = true
      const $table = this.$refs.priceDataTable
      const errMap = await $table.validate().catch((errMap) => errMap)
      let priceData = this.priceDataExtend
      console.log(priceData, 'priceData')
      let url = null
      priceData = this.formatPriceData(priceData)
      if (values.id) {
        url = this.url.edit
      } else {
        url = this.url.add
      }
      values.childRecord = priceData
      if (!errMap) {
        postAction(url, values).then((res) => {
          if (res.code === 200) {
            this.$message.success(this.title + '成功')
            this.$emit('change', true)
            this.handleCancel()
          }
        }).finally(() => {
          this.confirmLoading = false
        })
      }
    },
    handleCancel() {
      this.visible = false
      this.onceFlag = true
      this.model = {}
      this.rowId = ''
      this.queryParams = {}
      this.priceData = []
      this.priceDataExtend = []
    },
  },
}
</script>
<style lang='less' scoped>
</style>