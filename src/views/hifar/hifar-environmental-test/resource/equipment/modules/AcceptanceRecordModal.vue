<!--
 * @Author: 赵峰
 * @Date: 2021-09-01 14:12:40
 * @LastEditTime: 2021-09-26 14:44:06
 * @LastEditors: 赵峰
 * @Descripttion: 验收记录----新增、编辑
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-physico-chemical\resource\equipment\modules\AcceptanceRecordModal.vue
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
      ref="AcceptanceRecordForm"
      v-if="visible"
      v-model="model"
      :width="drawerWidth - 48"
      :formData="formData"
      @change="submitHandle"
    ></h-form>
    <h-card title="验收列表">
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
        :checkbox-config="{ highlight: true }"
        ref="AcceptanceRecordTable"
        :data="acceptListData"
        :edit-config="{ key: 'id', trigger: 'click', mode: 'row' }"
        @checkbox-all="selectAllEvent"
        @checkbox-change="onSelectChange"
      >
        <vxe-table-column type="checkbox" width="60"></vxe-table-column>
        <vxe-table-column type="seq" width="60"></vxe-table-column>
        <vxe-table-column
          title="项目"
          field="acceptName"
          :edit-render="{ name: '$input', props: { placeholder: '请输入项目' } }"
        ></vxe-table-column>
        <vxe-table-column
          title="情况"
          field="acceptDesc"
          :edit-render="{ name: '$input', props: { placeholder: '请输入情况' } }"
        ></vxe-table-column>
        <vxe-table-column
          title="备注"
          field="remarks"
          :edit-render="{ name: '$input', props: { placeholder: '请输入备注' } }"
        ></vxe-table-column>
      </vxe-table>
    </h-card>
  </h-modal>
</template>

<script>
import moment from 'moment'
import { downloadFile, postAction, getFileAccessHttpUrl } from '@/api/manage'
import SysUserSelect from '@/views/components/SysUserSelect'
export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  components: {
    SysUserSelect,
  },
  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    },
  },
  data() {
    return {
      moment,
      visible: false,
      confirmLoading: false,
      drawerWidth: 900,
      model: {},
      title: '添加',
      url: {
        add: '/HfResEquipAcceptBusiness/addAcceptAndList',
        edit: '/HfResEquipAcceptBusiness/modifyAcceptAndListById',
        detailById: '/HfResEquipAcceptBusiness/queryById',
        accessDetailById: '/HfResEquipAcceptListBusiness/listAllByAcceptId',
        delete: '/HfResEquipAcceptListBusiness/logicRemoveById',
      },
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          key: 'equipId',
          formType: 'input',
          hidden: true,
        },
        {
          title: '验收方式',
          key: 'acceptMethod',
          span: 2,
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入验收方式' }],
          },
        },
        {
          title: '验收人',
          key: 'acceptUserId',
          formType: 'input',
          span: 2,
          component: (
            <sys-user-select
              v-decorator={['acceptUserId', { initialValue: undefined }]}
              v-on:change={this.acceptUserChange}
            ></sys-user-select>
          ),
          validate: {
            rules: [{ required: true, message: '请选择验收人' }],
          },
        },
        {
          title: '',
          key: 'acceptUserName',
          formType: 'input',
          hidden: true,
        },
        {
          title: '验收日期',
          key: 'acceptTime',
          span: 2,
          formType: 'datePick',
          validate: {
            rules: [{ required: true, message: '请选择验收日期' }],
          },
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
          span: 2,
        },
      ],
      acceptListData: [],
      selectedRowKeys: [],
      ids: '',
    }
  },
  methods: {
    show(record, title) {
      this.visible = true
      this.title = title
      if (record.id) {
        this.loadDetail(record.id)
      } else {
        this.editor(record)
        this.acceptListData.push({
          id: '',
          equipId: record.equipId,
          acceptId: record.id,
          acceptName: '',
          acceptDesc: '',
          remarks: '',
        })
      }
    },
    loadDetail(id) {
      postAction(this.url.detailById, { id: id }).then((res) => {
        if (res.code == 200) {
          this.editor(res.data)
          this.loadAcceptInfoDetail(id)
        }
      })
    },
    loadAcceptInfoDetail(id) {
      postAction(this.url.accessDetailById, { acceptId: id }).then((res) => {
        if (res.code == 200) {
          let record = res.data
          let acceptList = []
          if (record.length > 0) {
            record.forEach((item) => {
              acceptList.push({
                id: item.id,
                equipId: item.equipId,
                acceptId: item.acceptId,
                acceptName: item.acceptName,
                acceptDesc: item.acceptDesc,
                remarks: item.remarks,
              })
            })
          }
          this.acceptListData = acceptList
        }
      })
    },
    editor(record) {
      let obj = Object.assign({}, record)
      obj.acceptTime = obj.acceptTime && obj.acceptTime != 0 ? moment(parseFloat(obj.acceptTime)) : ''
      this.model = obj
    },
    handleClickSubmit() {
      this.$refs.AcceptanceRecordForm.validateForm()
    },
    // 提交
    submitHandle(values) {
      if (this.confirmLoading) return
      this.confirmLoading = false
      let ids = this.ids
      let acceptInfo = []
      let acceptInfoData = []
      let url = null
      const $table = this.$refs.AcceptanceRecordTable
      const { insertRecords } = $table.getRecordset()
      let params = {
        ...values,
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
          acceptInfo.push({
            id: item.id ? item.id : '',
            equipId: item.equipId,
            acceptId: item.acceptId ? item.acceptId : '',
            acceptName: item.acceptName ? item.acceptName : '',
            acceptDesc: item.acceptDesc ? item.acceptDesc : '',
            remarks: item.remarks ? item.remarks : '',
          })
        })
      } else {
        acceptInfo = []
      }
      params.childRecord = acceptInfo
      params.acceptTime = params.acceptTime && params.acceptTime != 0 ? params.acceptTime.valueOf() : ''
      postAction(url, params).then((res) => {
        if (ids) {
          this.handleByIdDelete(ids)
        }
        if (res.code == 200) {
          this.$message.success(this.title + '成功')
          this.$emit('change', true)
          this.handleCancel()
        }
      })
    },
    acceptUserChange(val, option) {
      this.$refs.AcceptanceRecordForm.form.setFieldsValue({ acceptUserName: option.idName })
    },
    handleCancel(e) {
      this.visible = false
      this.model = {}
      this.acceptListData = []
    },
    handleDownload(filePath, fileName) {
      let fileAccessUrl = getFileAccessHttpUrl(filePath)
      downloadFile(fileAccessUrl, fileName)
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
      const $table = this.$refs.AcceptanceRecordTable
      const { insertRecords, removeRecords, updateRecords } = $table.getRecordset()
      let tableData = this.acceptListData
      let acceptIds = []
      let ids = null
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
    },
    handleByIdDelete(id) {
      postAction(this.url.delete, { id: id }).then((res) => {})
    },
    // 新增验收列表
    async insertEvent(row) {
      this.rowIndex++
      const $table = this.$refs.AcceptanceRecordTable
      const tableItem = {
        id: '',
        equipId: this.model.equipId,
        acceptId: this.model.id,
        acceptName: '',
        acceptDesc: '',
        remarks: '',
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