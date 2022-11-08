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
    :width="drawerWidth"
    :confirm-loading="confirmLoading"
    @submit="handleClickSubmit"
    @cancel="handleCancel"
  >
    <h-form
      ref="repairRecordForm"
      v-if="visible"
      v-model="model"
      :column="1"
      :formData="formData"
      @change="submitHandle"
    ></h-form>
    <h-card title="项目单价">
      <a-button
        size="small"
        @click="insertEventHandle"
        type="ghost-primary"
        icon="plus"
        style="margin-right: 5px; margin-bottom: 4px"
        >新增</a-button
      >
      <a-button
        v-if="hasSelected"
        type="danger"
        size="small"
        icon="minus"
        style="margin-bottom: 4px"
        @click="handleDelete"
      >
        删除
      </a-button>
      <div class="wordRecordData">
        <vxe-table
          v-if="visible"
          border
          show-all-overflow
          keep-source
          ref="priceDataTable"
          :data="priceData"
          :max-height="400"
          :edit-rules="validRules"
          @checkbox-all="selectAllEvent"
          @checkbox-change="onSelectChange"
          :edit-config="{ key: 'id', trigger: 'click', mode: 'row', showStatus: true }"
        >
          <vxe-table-column type="checkbox" width="60"></vxe-table-column>
          <vxe-table-column type="seq" width="60"></vxe-table-column>
          <vxe-table-column title="设备名称" field="unitName" :disabled="true"></vxe-table-column>
          <vxe-table-column title="设备型号" field="equipModel" :disabled="true"></vxe-table-column>
          <vxe-table-column
            title="速率"
            field="rate"
            :edit-render="{ name: '$input', props: { type: 'number', min: 0, placeholder: '请输入速率' } }"
          ></vxe-table-column>
          <vxe-table-column
            title="单价（元）"
            field="unitPrice"
            :edit-render="{ name: '$input', props: { type: 'number', min: 0, placeholder: '请输入单价（元）' } }"
          ></vxe-table-column>
          <vxe-table-column
            title="单价描述"
            field="remarks"
            :edit-render="{ name: '$input', props: { placeholder: '请输入单价描述' } }"
          ></vxe-table-column>
        </vxe-table>
      </div>
    </h-card>
    <sys-fee-list-select-modal ref="SysFeeListSelectModal" @change="feeSelectHandle"></sys-fee-list-select-modal>
  </h-modal>
</template>

<script>
import {postAction} from '@/api/manage'
import {isArray} from 'lodash'
import SysFeeListSelectModal from '@/views/components/SysFeeListSelectModal'

export default {
  components: {
    SysFeeListSelectModal,
  },
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  data() {
    return {
      dataSource: [],
      visible: false,
      confirmLoading: false,
      drawerWidth: 1000,
      model: {},
      title: '添加',
      selectedRowKeys: [],
      priceData: [],
      validRules: {
        rate: [{ required: true, message: '速率不能为空', trigger: 'blur' }],
        unitPrice: [{ required: true, message: '单价不能为空', trigger: 'blur' }],
      },
      url: {
        add: '/HfResCustCostBusiness/addCostAndPrice',
        edit: '/HfResCustCostBusiness/modifyCostAndPriceById',
        detailById: '/HfResCustCostBusiness/queryById',
        priceUnit: '/HfResCustPriceBusiness/listAllByCostId',
        deletePrice: '/HfResCustPriceBusiness/logicRemoveById',
      },
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '计费标准名称',
          key: 'costName',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入计费标准名称', trigger: 'blur' }],
          },
        },
        {
          title: '计费标准描述',
          key: 'remarks',
          formType: 'textarea',
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
    loadUnitById(costId) {
      let newTableData = []
      postAction(this.url.priceUnit, { costId: costId }).then((res) => {
        if (res.code == 200) {
          let record = res.data
          if (record.length > 0) {
            record.forEach((item) => {
              newTableData.push({
                costId: item.costId,
                id: item.id,
                unitId: item.unitId,
                unitName: item.unitName,
                rate: item.rate,
                equipModel: item.equipModel,
                unitPrice: item.unitPrice / 100,
                remarks: item.remarks,
              })
            })
          }
          this.priceData = newTableData
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
        let list = tableData.filter((items) => {
          if (!removeRecords.includes(items)) return items
        })
        this.priceData = list
      }
    },
    feeSelectHandle(selectedRowKeys, selectedRows) {
      let newTableData = []
      let priceDataList = this.priceData
      if (selectedRows.length > 0) {
        selectedRows.forEach((item) => {
          newTableData.push({
            costId: this.model.id,
            unitId: item.id,
            id: '',
            unitName: item.equipName,
            equipModel: item.equipModel,
            rate: '',
            unitPrice: '',
            remarks: '',
          })
        })
      }
      priceDataList.push(...newTableData)
      this.priceData = priceDataList
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
      let priceData = $table.getData()
      let childRecord = []
      let url = null
      let params = {
        ...values,
      }
      priceData.forEach((item) => {
        childRecord.push({
          costId: item.costId ? item.costId : '',
          unitId: item.unitId,
          id: item.id,
          unitName: item.unitName,
          equipModel: item.equipModel,
          rate: item.rate,
          unitPrice: item.unitPrice * 100,
          remarks: item.remarks,
        })
      })
      if (params.id) {
        url = this.url.edit
      } else {
        url = this.url.add
      }
      params.childRecord = childRecord ? childRecord : []
      if (!errMap) {
        postAction(url, params).then((res) => {
          if (res.code === 200) {
            this.$message.success(this.title + '成功')
            this.$emit('change', true)
            this.handleCancel()
          }
        })
      }
    },
    handleCancel(e) {
      this.visible = false
      this.model = {}
      this.priceData = []
    },
  },
}
</script>
<style lang='less' scoped>
</style>