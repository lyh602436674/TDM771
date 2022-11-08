<!--
 * @Author: 赵峰
 * @Date: 2021-08-09 10:21:42
 * @LastEditTime: 2021-09-26 14:41:58
 * @LastEditors: 赵峰
 * @Descripttion: 点检模板新增、编辑
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-physico-chemical\resource\EquipmentCheck\equipmentCheckModal.vue
-->
<template>
  <h-modal
    :title="title"
    inner
    :visible="visible"
    :width="drawerWidth"
    :getContainer="getContainer"
    :confirm-loading="confirmLoading"
    @submit="handleClickSubmit"
    @cancel="handleCancel"
  >
    <h-form
      ref="equipmentCheckFrom"
      v-if="visible"
      v-model="model"
      :width="drawerWidth - 48"
      :formData="formData"
      :column="2"
      @change="submitHandle"
    ></h-form>
    <h-card title="点检项">
      <a-button
        size="small"
        @click="insertEvent(-1)"
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
      <vxe-table
        border
        show-all-overflow
        keep-source
        ref="equipmentCheckTable"
        :data="acceptListData"
        @checkbox-all="selectAllEvent"
        @checkbox-change="onSelectChange"
        :edit-rules="validRules"
        :edit-config="{ key: 'id', trigger: 'click', mode: 'row', showStatus: true }"
      >
        <vxe-table-column type="checkbox" width="60"></vxe-table-column>
        <vxe-table-column type="seq" width="60"></vxe-table-column>
        <vxe-table-column
          title="单元"
          field="partName"
          :edit-render="{ name: 'select', options: dictOptions }"
        ></vxe-table-column>
        <vxe-table-column
          title="点检项目"
          field="itemName"
          :edit-render="{ name: '$input', props: { placeholder: '请输入点检项目' } }"
        ></vxe-table-column>
        <vxe-table-column
          title="点检周期"
          field="period"
          :edit-render="{ name: '$input', props: { type: 'number', min: 0, placeholder: '请输入点检周期' } }"
        ></vxe-table-column>
        <vxe-table-column
          title="点检周期单位"
          field="periodUnit"
          :edit-render="{ name: 'select', options: periodUnitList }"
        ></vxe-table-column>
      </vxe-table>
    </h-card>
  </h-modal>
</template>

<script>
import moment from 'moment'
import { postAction } from '@/api/manage'
import { getDictItemsFromCache, listByDictCode } from '@/api/api'
import { UI_CACHE_DB_DICT_DATA } from '@/store/mutation-types'
export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  components: {},

  data() {
    return {
      moment,
      title: '新增',
      visible: false,
      confirmLoading: false,
      drawerWidth: 1000,
      modal: {},
      validRules: {
        partName: [{ required: true, message: '请选择点检单元', trigger: 'blur' }],
        itemName: [{ required: true, message: '点检项目不能为空', trigger: 'blur' }],
        period: [{ required: true, message: '点检周期不能为空', trigger: 'blur' }],
      },
      url: {
        add: '/HfResEquipCheckTbaseBusiness/addTemplateAndCheck',
        edit: '/HfResEquipCheckTbaseBusiness/modifyTemplateAndItemById',
        detailByTemplateId: '/HfResEquipCheckTitemBusiness/listAllByTemplateId',
        detail: '/HfResEquipCheckTbaseBusiness/queryById',
        deleteUnit: '/HfResEquipCheckItemBusiness/logicRemoveById',
      },
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '模板名称',
          key: 'templateName',
          formType: 'input',
          span: 2,
          validate: {
            rules: [{ required: true, message: '请输入模板名称' }],
          },
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
          style: {
            height: '100px',
          },
          span: 2,
        },
      ],
      dictCode: 'hf_res_equip_check_tbase',
      periodUnitList: [
        { label: '请选择', value: '' },
        { label: '日', value: '3' },
        { label: '月', value: '2' },
      ],
      ids: '',
      dictOptions: [],
      selectedRowKeys: [],
      acceptListData: [],
    }
  },
  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    },
  },

  //
  methods: {
    show(record, title) {
      this.title = title
      this.visible = true
      this.editor(record)
      this.initDictData()
      if (record.id) {
        this.loadAcceptInfoDetail(record.id)
      }
    },
    initDictData() {
      let dictList = [{ label: '请选择', value: '' }]
      //优先从缓存中读取字典配置
      if (getDictItemsFromCache(this.dictCode)) {
        let dictOptions = getDictItemsFromCache(this.dictCode)
        dictOptions.forEach((item) => {
          dictList.push({
            label: item.itemValue,
            value: item.itemValue,
          })
        })
        this.dictOptions = dictList
        return
      }
      listByDictCode(this.dictCode, null).then((res) => {
        if (res.code == 200) {
          let dictVal = this.$ls.get(UI_CACHE_DB_DICT_DATA)
          let dictCode = this.dictCode
          let dictOptions = res.data
          dictOptions.forEach((item) => {
            dictList.push({
              label: item.itemValue,
              value: item.itemValue,
            })
          })
          this.dictOptions = dictList
          this.$ls.remove(UI_CACHE_DB_DICT_DATA)
          this.$ls.set(UI_CACHE_DB_DICT_DATA, { ...dictVal, [dictCode]: res.data }, 7 * 24 * 60 * 60 * 1000)
        }
      })
    },
    editor(record) {
      let obj = Object.assign({}, record)
      obj.publishTime = obj.publishTime && obj.publishTime != 0 ? moment(parseFloat(obj.publishTime)) : ''
      obj.useTime = obj.useTime && obj.useTime != 0 ? moment(parseFloat(obj.useTime)) : ''
      obj.standardFlag = obj.standardFlag ? String(obj.standardFlag) : undefined
      this.model = obj
    },
    loadAcceptInfoDetail(id) {
      postAction(this.url.detailByTemplateId, { templateId: id }).then((res) => {
        if (res.code == 200) {
          let record = res.data
          let acceptList = []
          if (record.length > 0) {
            record.forEach((item) => {
              acceptList.push({
                id: item.id,
                templateId: item.templateId,
                partName: item.partName,
                itemName: item.itemName,
                period: item.period,
                periodUnit: item.periodUnit,
              })
            })
          }
          this.acceptListData = acceptList
        }
      })
    },
    handleClickSubmit() {
      this.$refs.equipmentCheckFrom.validateForm()
    },
    // 删除点检项
    handleByIdDelete(id) {
      postAction(this.url.deleteUnit, { id: id }).then((res) => {})
    },
    // 提交
    async submitHandle(values) {
      const $table = this.$refs.equipmentCheckTable
      const errMap = await $table.validate().catch((errMap) => errMap)
      if (!errMap) {
        if (this.confirmLoading) return
        this.confirmLoading = false
        let checkItem = []
        let acceptInfoData = []
        let url = null
        let ids = this.ids
        const { insertRecords } = $table.getRecordset()
        let params = {
          ...values,
          groupCode: 'equip',
        }
        if (params.id) {
          url = this.url.edit
        } else {
          url = this.url.add
        }
        if (insertRecords.length == 0) {
          acceptInfoData = this.acceptListData
        } else {
          acceptInfoData = this.acceptListData.concat(insertRecords)
        }
        if (acceptInfoData.length > 0) {
          acceptInfoData.forEach((item) => {
            checkItem.push({
              id: item.id ? item.id : '',
              templateId: item.templateId ? item.templateId : '',
              partName: item.partName ? item.partName : '',
              itemName: item.itemName ? item.itemName : '',
              period: item.period ? item.period : '',
              periodUnit: item.periodUnit ? item.periodUnit : '',
            })
          })
        } else {
          checkItem = []
        }
        params.checkItem = checkItem

        postAction(url, params).then((res) => {
          // if (ids) {
          //   this.handleByIdDelete(ids)
          // }
          if (res.code == 200) {
            this.$message.success(this.title + '成功')
            this.$emit('change', true)
            this.handleCancel()
          }
        })
      }
    },
    handleCancel(e) {
      this.visible = false
      this.modal = {}
      this.acceptListData = []
    },

    //  多选
    onSelectChange(records) {
      this.selectedRowKeys = records.records
    },
    // 全选
    selectAllEvent(records) {
      this.selectedRowKeys = records.records
    },
    // 删除验收
    handleDelete() {
      const $table = this.$refs.equipmentCheckTable
      const { removeRecords } = $table.getRecordset()
      let tableData = this.acceptListData
      let ids = null
      let acceptIds = []
      $table.removeCheckboxRow()
      this.selectedRowKeys = []
      if (removeRecords.length > 0) {
        removeRecords.forEach((item) => {
          acceptIds.push(item.id)
        })
      }
      if (acceptIds.length > 0) {
        ids = acceptIds.join(',')
        this.ids = ids
      }
      if (tableData.length > 0) {
        let list = tableData.filter((items) => {
          if (!removeRecords.includes(items)) return items
        })
        this.acceptListData = list
      }
    },
    // 新增验收列表
    async insertEvent(row) {
      this.rowIndex++
      const $table = this.$refs.equipmentCheckTable
      const tableItem = {
        templateId: this.model.id,
        partName: undefined,
        itemName: '',
        period: '',
        periodUnit: 3,
      }
      const record = [tableItem]
      await $table.insertAt(record, row)
      const { insertRecords } = $table.getRecordset()
      this.insertRecords = insertRecords
      this.acceptListData = this.acceptListData.concat(insertRecords)
    },
  },
}
</script>
<style lang='less' scoped>
</style>