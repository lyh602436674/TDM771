<!--
 * @Author: 赵峰
 * @Date: 2021-08-06 17:40:17
 * @LastEditTime: 2021-09-26 14:26:02
 * @LastEditors: 赵峰
 * @Descripttion: 培训记录--添加/编辑
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-physico-chemical\resource\user\modules\trainingRecordMoal.vue
-->
<template>
  <h-modal
    :title="title"
    inner
    :getContainer="getContainer"
    :visible="visible"
    :width="drawerWidth"
    :confirm-loading="confirmLoading"
    @submit="handleClickSubmit"
    @cancel="handleCancel"
  >
    <h-form
      ref="trainingProgramForm"
      v-if="visible"
      v-model="model"
      :formData="formData"
      :column="2"
      @change="submitHandle"
    ></h-form>
    <h-card title="考核结果">
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
        :auto-resize="true"
        keep-source
        ref="checkRecordTable"
        :data="checkRecordData"
        @checkbox-all="selectAllEvent"
        @checkbox-change="onSelectChange"
        :edit-rules="validRules"
        :edit-config="{ key: 'id', trigger: 'click', mode: 'row', showStatus: true }"
      >
        <vxe-table-column type="checkbox" width="60"></vxe-table-column>
        <vxe-table-column type="seq" width="60"></vxe-table-column>
        <vxe-table-column
          title="姓名"
          field="personName"
          :edit-render="{ name: '$input', props: { placeholder: '请输入姓名' } }"
        ></vxe-table-column>
        <!-- <vxe-table-column
          title="工号"
          field="jobNo"
          :edit-render="{ name: '$input', props: { placeholder: '请输入部门' } }"
        ></vxe-table-column> -->
        <vxe-table-column
          title="部门"
          field="deptName"
          :edit-render="{ name: '$input', props: { placeholder: '请输入部门' } }"
        ></vxe-table-column>
        <vxe-table-column
          title="职务"
          field="postName"
          :edit-render="{ name: '$input', props: { placeholder: '请输入职务' } }"
        ></vxe-table-column>
        <vxe-table-column
          title="出勤情况"
          field="workStatus"
          :edit-render="{ name: 'select', options: workStatusOptions, props: { placeholder: '请输入出勤情况' } }"
        ></vxe-table-column>
        <vxe-table-column
          title="考核结果"
          field="workRs"
          :edit-render="{ name: 'select', options: workRsOptions, props: { placeholder: '请输入考核结果' } }"
        ></vxe-table-column>
        <vxe-table-column
          title="具体成绩"
          field="workDesc"
          :width="200"
          :edit-render="{ name: '$input', props: { type: 'number', min: 0, placeholder: '请输入具体成绩' } }"
        ></vxe-table-column>
      </vxe-table>
    </h-card>
    <user-select-modal ref="UserSelectModal" @change="selectUserhandle"></user-select-modal>
  </h-modal>
</template>

<script>
import moment from 'moment'
import { getAction, postAction } from '@/api/manage'
import UserSelectModal from '../components/UserSelectModal'
export default {
  components: {
    UserSelectModal,
  },

  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  data() {
    return {
      moment,
      visible: false,
      confirmLoading: false,
      drawerWidth: 1200,
      isopen: false,
      title: '添加',
      url: {
        add: '/HfResPersonTrainRecordBusiness/addTrainRecordAndCheck',
        edit: '/HfResPersonTrainRecordBusiness/modifyTrainRecordAndCheckById',
        detailCheckById: '/HfResPersonTrainCheckBusiness/listAllByTrainRecordId',
      },
      validRules: {
        workStatus: [{ required: true, message: '请选择出勤情况' }],
        workRs: [{ required: true, message: '请选择考核结果' }],
      },
      model: {},
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '培训主题',
          key: 'trainTheme',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入培训主题' }],
          },
        },
        {
          title: '培训时间',
          key: 'trainTime',
          formType: 'datePick',
          validate: {
            rules: [{ required: true, message: '请选择培训时间' }],
          },
        },
        {
          title: '培训老师',
          key: 'trainTeacher',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入培训老师' }],
          },
        },
        {
          title: '培训方式',
          key: 'trainMode',
          formType: 'select',
          options: [
            { title: '线下', value: 1, key: 1 },
            { title: '线上', value: 2, key: 2 },
          ],
          validate: {
            rules: [{ required: true, message: '请选择培训方式' }],
          },
        },
        {
          title: '培训内容',
          key: 'trainContent',
          formType: 'textarea',
          span: 2,
          validate: {
            rules: [{ required: true, message: '请输入培训内容' }],
          },
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
          span: 2,
        },
      ],
      tableRow: {},
      workStatusOptions: [
        { label: '请选择', value: '' },
        { label: '是', value: '1' },
        { label: '否', value: '2' },
      ],
      workRsOptions: [
        { label: '请选择', value: '' },
        { label: '合规', value: '1' },
        { label: '不合规', value: '2' },
        { label: '未考核', value: '3' },
      ],
      checkRecordData: [],
      selectedRowKeys: [],
      rowKeys: [],
      userSelectedRows: [],
    }
  },
  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    },
  },
  methods: {
    show(record, title) {
      this.title = title
      this.visible = true
      this.editor(record)
      // checkRecordTable
      if (record.id) {
        this.loadCheckDetail(record.id)
      }
    },
    editor(record) {
      let obj = Object.assign({}, record)
      obj.trainTime = obj.trainTime && obj.trainTime != 0 ? moment(parseFloat(obj.trainTime)) : ''
      this.model = obj
    },
    loadCheckDetail(id) {
      postAction(this.url.detailCheckById, { trainRecordId: id }).then((res) => {
        if (res.code == 200) {
          let record = res.data
          let checkRecordData = []
          if (record.length > 0) {
            record.forEach((item) => {
              checkRecordData.push({
                id: item.id,
                trainRecordId: item.trainRecordId,
                personId: item.personId ? item.personId : '',
                personName: item.personName ? item.personName : '',
                jobNo: item.jobNo ? item.jobNo : '',
                deptId: item.deptId ? item.deptId : '',
                deptName: item.deptName ? item.deptName : '',
                postName: item.postName ? item.postName : '',
                workStatus: item.workStatus ? item.workStatus : '',
                workRs: item.workRs ? item.workRs : '',
                workDesc: item.workDesc || item.workDesc == 0 ? item.workDesc / 100 : 0,
              })
            })
          }
          this.checkRecordData = checkRecordData
        }
      })
    },
    handleClickSubmit() {
      this.$refs.trainingProgramForm.validateForm()
    },
    // 提交
    async submitHandle(values) {
      const $table = this.$refs.checkRecordTable
      const errMap = await $table.validate().catch((errMap) => errMap)
      if (!errMap) {
        if (this.confirmLoading) return
        this.confirmLoading = false
        let checkRecord = []
        let acceptInfoData = []
        const { insertRecords } = $table.getRecordset()
        let params = {
          ...values,
        }
        let url = null
        if (params.id) {
          url = this.url.edit
        } else {
          url = this.url.add
        }

        if (insertRecords.length == 0) {
          acceptInfoData = this.checkRecordData
        } else {
          acceptInfoData = this.checkRecordData.concat(insertRecords)
        }
        if (acceptInfoData.length > 0) {
          acceptInfoData.forEach((item) => {
            checkRecord.push({
              id: item.id,
              trainRecordId: item.trainRecordId,
              personId: item.personId ? item.personId : '',
              personName: item.personName ? item.personName : '',
              // jobNo: item.jobNo ? item.jobNo : '',
              deptId: item.deptId ? item.deptId : '',
              deptName: item.deptName ? item.deptName : '',
              postName: item.postName ? item.postName : '',
              workStatus: item.workStatus ? item.workStatus : '',
              workRs: item.workRs ? item.workRs : '',
              workDesc: item.workDesc || item.workDesc == 0 ? item.workDesc * 100 : 0,
            })
          })
        } else {
          checkRecord = []
        }

        params.trainTime = params.trainTime && params.trainTime != 0 ? params.trainTime.valueOf() : ''
        params.checkRecord = checkRecord
        postAction(url, params).then((res) => {
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
      this.checkRecordData = []
    },
    //  多选
    onSelectChange(records) {
      this.selectedRowKeys = records.records
    },
    // 全选
    selectAllEvent(records) {
      this.selectedRowKeys = records.records
    },
    // 删除考核结果
    handleDelete() {
      const $table = this.$refs.checkRecordTable
      const { removeRecords } = $table.getRecordset()
      let tableData = this.checkRecordData
      $table.removeCheckboxRow()
      this.selectedRowKeys = []
      if (tableData.length > 0) {
        let list = tableData.filter((items) => {
          if (!removeRecords.includes(items)) return items
        })
        this.checkRecordData = list
      }
    },
    // 新增考核结果
    insertEvent(row) {
      let rowKeys = this.rowKeys
      let selectedRows = this.userSelectedRows
      this.tableRow = row
      this.$refs.UserSelectModal.show(selectedRows, rowKeys)
    },
    async selectUserhandle(selectedRowKeys, selectedRows) {
      this.rowKeys = selectedRowKeys
      this.userSelectedRows = selectedRows
      let row = this.tableRow
      let tableItemArr = []
      if (selectedRows.length > 0) {
        selectedRows.forEach((item) => {
          tableItemArr.push({
            id: '',
            trainRecordId: this.model.id,
            personId: item.id ? item.id : '',
            personName: item.idName ? item.idName : '',
            // jobNo: item.jobNo ? item.jobNo : '',
            deptId: item.deptId ? item.deptId : '',
            deptName: item.deptName ? item.deptName : '',
            postName: item.postName ? item.postName : '',
            workStatus: '',
            workRs: '',
            workDesc: '',
          })
        })
      }
      this.rowIndex++
      const $table = this.$refs.checkRecordTable
      const record = tableItemArr
      await $table.insertAt(record, row)
      const { insertRecords } = $table.getRecordset()
      this.checkRecordData = this.checkRecordData.concat(insertRecords)
    },
  },
}
</script>
<style lang='less' scoped>
</style>