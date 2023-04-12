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
        <a-button
          icon="plus"
          size="small"
          style="margin-right: 5px; margin-bottom: 4px"
          type="ghost-primary"
          @click="insertEventHandle"
        >新增
        </a-button
        >
        <a-button
          v-if="hasSelected"
          icon="minus"
          size="small"
          style="margin-bottom: 4px"
          type="danger"
          @click="handleDelete"
        >
          删除
        </a-button>
        <div class="wordRecordData">
          <vxe-table
            ref="priceDataTable"
            :data="priceData"
            :edit-config="{ key: 'id', trigger: 'click', mode: 'row', showStatus: true }"
            :edit-rules="validRules"
            :max-height="520"
            border
            keep-source
            show-all-overflow
            @checkbox-all="selectAllEvent"
            @checkbox-change="onSelectChange"
          >
            <vxe-table-column align="center" type="checkbox" width="40"></vxe-table-column>
            <vxe-table-column align="center" type="seq" width="40"></vxe-table-column>
            <vxe-table-column field="unitName" title="设备名称" width="160"></vxe-table-column>
            <vxe-table-column field="innerName" title="内部名称" width="160"></vxe-table-column>
            <vxe-table-column field="equipModel" title="设备型号"></vxe-table-column>
            <vxe-table-column field="assetsCode" title="资产编号"></vxe-table-column>
            <vxe-table-column
              :edit-render="{ name: '$input', props:{readonly: true},  placeholder: '请选择试验项目',events:{click:handleProjectNameClick} }"
              field="projectName" title="试验项目"></vxe-table-column>
            <vxe-table-column :visible="false" field="projectId"></vxe-table-column>
            <vxe-table-column
              :edit-render="{ name: 'input', placeholder: '请输入速率范围' }"
              field="rate"
              title="速率"
            ></vxe-table-column>
            <vxe-table-column
              :edit-render="{ name: 'input', placeholder: '请输入温度范围' }"
              field="temperatureRange"
              title="温度范围(℃)"
            ></vxe-table-column>
            <vxe-table-column
              :edit-render="{ name: 'input', placeholder: '请输入湿度范围' }"
              field="humidityRange"
              title="湿度范围(RH)"
            ></vxe-table-column>
            <vxe-table-column
              :edit-render="{ name: 'input', placeholder: '请输入压力范围' }"
              field="pressureRange"
              title="压力范围(Pa)"
            ></vxe-table-column>
            <vxe-table-column
              :edit-render="{ name: 'input', placeholder: '请输入加速度范围' }"
              field="accelerationRange"
              title="加速度范围"
            ></vxe-table-column>
            <vxe-table-column
              :edit-render="{ name: '$input', placeholder: '请输入折扣',events:{change:calcDiscountUnitPrice} }"
              field="discount"
              title="折扣"
            ></vxe-table-column>
            <vxe-table-column
              :edit-render="{
                name: '$input',
                props: { type: 'number', min: 0, placeholder: '请输入标准单价（元）' },
                events:{change:calcDiscountUnitPrice}
              }"
              field="unitPrice"
              title="标准单价（元）"
            ></vxe-table-column>
            <vxe-table-column
              field="discountPrice"
              title="折后单价（元）"
            ></vxe-table-column>
            <vxe-table-column
              field="startupCost"
              title="开机费（元）"
            ></vxe-table-column>
            <vxe-table-column
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
import {isArray, isNumber} from 'lodash'
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
      visible: false,
      confirmLoading: false,
      model: {},
      title: '添加',
      selectedRowKeys: [],
      priceData: [],
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
        deletePrice: '/HfResCustPriceBusiness/logicRemoveById',
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
    }
  },

  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    },
  },
  methods: {
    show(record, title) {
      this.visible = true
      if (record.id) {
        this.loadUnitById(record.id)
      }
      this.title = title
      this.editor(record)
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
      let res = row.discount && row.unitPrice && !isNaN(Number(row.unitPrice)) && !isNaN(Number(row.discount)) ? (row.discount * 0.1 * row.unitPrice).toFixed(2) : null
      this.$set(row, 'discountPrice', res)
    },
    loadUnitById(costId) {
      postAction(this.url.priceUnit, {costId: costId}).then((res) => {
        if (res.code === 200) {
          let record = res.data
          this.priceData = record && record.length && record.map((item) => {
            return {
              ...item,
              ...item.equipData[0], // 设备信息全部从equipData中拿
              unitName: item.equipData[0].equipName,
              remarks: item.remarks,
              projectId: item.projectId || '',
              projectName: item.projectName || '',
            }
          }) || []
        }
      })
    },
    editor(record) {
      this.model = Object.assign({}, record)
    },
    //  多选
    onSelectChange(records) {
      this.selectedRowKeys = records.records
    },
    // 全选
    selectAllEvent(records) {
      this.selectedRowKeys = records.records
    },
    handleDelete() {
      const $table = this.$refs.priceDataTable
      const { removeRecords } = $table.getRecordset()
      let tableData = this.priceData
      $table.removeCheckboxRow()
      this.selectedRowKeys = []
      if (tableData.length > 0) {
        this.priceData = tableData.filter((items) => {
          if (!removeRecords.includes(items)) return items
        })
      }
    },
    feeSelectHandle(selectedRowKeys, selectedRows) {
      this.priceData = this.priceData.concat(selectedRows && selectedRows.length && selectedRows.map((item) => {
        return {
          ...item,
          unitName: item.equipName,
          costId: this.model.id,
          unitId: item.id,
          id: '',
          projectId: '',
          projectName: '',
        }
      }) || [])
    },
    insertEventHandle() {
      let selectedRowKeys = []
      if (isArray(this.priceData)) {
        selectedRowKeys = this.priceData.map((item) => {
          return (item.id = item.unitId)
        })
      }
      this.$refs.SysFeeListSelectModal.show(this.priceData, selectedRowKeys)
    },
    handleClickSubmit() {
      this.$refs.repairRecordForm.validateForm()
    },
    // 删除项目单价
    handleByIdDelete(id) {
      postAction(this.url.deletePrice, { id: id }).then((res) => {})
    },
    // 提交
    async submitHandle(values) {
      if (this.confirmLoading) return
      this.confirmLoading = false
      const $table = this.$refs.priceDataTable
      const errMap = await $table.validate().catch((errMap) => errMap)
      let priceData = $table.getData() || []
      let url = null
      priceData = priceData.map((item) => {
        return {
          costId: item.costId ? item.costId : '',
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
        })
      }
    },
    handleCancel() {
      this.visible = false
      this.model = {}
      this.priceData = []
    },
  },
}
</script>
<style lang='less' scoped>
</style>