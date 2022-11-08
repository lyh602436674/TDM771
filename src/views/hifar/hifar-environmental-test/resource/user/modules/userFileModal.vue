<!--
 * @Author: 赵峰
 * @Date: 2021-08-05 11:31:03
 * @LastEditTime: 2021-11-17 15:48:49
 * @LastEditors: 马潭龙
 * @Descripttion: 人员档案--添加/编辑
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\user\modules\userFileModal.vue
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
      ref="userFileForm"
      v-if="visible"
      v-model="model"
      :formData="formData"
      :column="2"
      @change="submitHandle"
    ></h-form>
    <h-card title="工作履历">
      <a-button
        size="small"
        @click="insertEvent(-1)"
        type="ghost-primary"
        icon="plus"
        style="margin-right: 5px; margin-bottom: 4px"
      >新增
      </a-button
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
          border
          :autoResize="true"
          show-all-overflow
          keep-source
          ref="wordRecordData"
          :data="workRecordData"
          @checkbox-all="selectAllEvent"
          @checkbox-change="onSelectChange"
          :edit-rules="validRules"
          :edit-config="{ key: 'id', trigger: 'click', mode: 'row', showStatus: true }"
        >
          <vxe-table-column type="checkbox" width="60"></vxe-table-column>
          <vxe-table-column type="seq" width="60"></vxe-table-column>
          <vxe-table-column
            title="起始时间"
            field="startTime"
            :edit-render="{ name: '$input', props: { type: 'date', placeholder: '请选择日期' } }"
          ></vxe-table-column>
          <vxe-table-column
            title="结束时间"
            field="endTime"
            :edit-render="{ name: '$input', props: { type: 'date', placeholder: '请选择日期' } }"
          ></vxe-table-column>
          <vxe-table-column
            title="工作单位"
            field="compayName"
            :edit-render="{ name: '$input', props: { placeholder: '请输入工作单位' } }"
          ></vxe-table-column>
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
            title="备注"
            field="remarks"
            :edit-render="{ name: '$input', props: { placeholder: '请输入备注' } }"
          ></vxe-table-column>
        </vxe-table>
      </div>
    </h-card>
  </h-modal>
</template>

<script>
  import moment from 'moment'
  import { postAction } from '@/api/manage'
  import mixin from '../mixin'

  export default {
    components: {},
    mixins: [mixin],
    inject: {
      getContainer: {
        default: () => document.body
      }
    },
    data() {
      const startTimeValid = ({ cellValue, rule, rules, row, rowIndex }) => {
        let endTime = row.endTime ? moment(row.endTime).valueOf() : ''
        let val = cellValue ? moment(cellValue).valueOf() : ''
        console.log("workRecordData",this.workRecordData)
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (!cellValue) {
              reject(new Error('开始时间不能为空'))
            } else {
              if (endTime !='' && val > endTime) {
                reject(new Error('开始时间不能大于结束时间'))
              } else {
                if (rowIndex > 0) {
                  let upEndTime=this.workRecordData[rowIndex-1].endTime;
                  if(val< moment(upEndTime).valueOf()){
                    reject(new Error('开始时间不能小于上一条的结束时间'))
                  }
                }
                resolve()
              }
            }
          }, 100)
        })
      }
      const endTimeValid = ({ cellValue, rule, rules, row }) => {
        let startTime = row.startTime ? moment(row.startTime).valueOf() : ''
        let val = cellValue ? moment(cellValue).valueOf() : ''
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (!cellValue) {
              reject(new Error('结束时间不能为空'))
            } else {
              if (val < startTime) {
                reject(new Error('结束时间不能小于开始时间'))
              } else {
                resolve()
              }
            }
          }, 100)
        })
      }
      return {
        moment,
        visible: false,
        confirmLoading: false,
        drawerWidth: 1100,
        title: '添加',
        validRules: {
          startTime: [{ required: true, message: '开始时间不能为空' }, { validator: startTimeValid }],
          endTime: [{ required: true, message: '结束时间不能为空' }, { validator: endTimeValid }],
          compayName: [{ required: true, message: '工作单位不能为空' }],
          remarks: [{ max: 255, message: '备注长度不能超过255' }],
        },
        url: {
          add: '/HfResPersonBusiness/addPersonAndWork',
          edit: '/HfResPersonBusiness/modifyPersonAndWorkById',
          detailWorkById: '/HfResPersonWorkRecordBusiness/listAllByPersonId'
        },
        model: {},
        formData: [
          {
            key: 'id',
            formType: 'input',
            hidden: true
          },
          {
            title: '姓名',
            key: 'idName',
            formType: 'input',
            validate: {
              rules: [
                {
                  required: true,
                  validator: this.validateidName
                }
              ]
            }
          },
          {
            title: '工号',
            key: 'jobNo',
            formType: 'input',
            validate: {
              rules: [
                {
                  required: true,
                  validator: this.validatejobNo
                }
              ]
            }
          },
          {
            title: '性别',
            key: 'sex',
            formType: 'radio',
            options: [
              { title: '男', value: 1, key: 1 },
              { title: '女', value: 2, key: 2 },
              { title: '保密', value: 0, key: 0 }
            ]
          },
          {
            title: '状态',
            key: 'status',
            formType: 'dict',
            dictCode: 'hf_res_person_status',
            validate: {
              rules: [{ required: true, message: '请选择状态' }]
            }
          },
          {
            title: '部门',
            key: 'deptName',
            formType: 'input',
            validate: {
              rules: [{ required: true, message: '请输入部门名称' }]
            }
          },
          {
            title: '加入时间',
            key: 'entryTime',
            formType: 'datePick'
          },
          {
            title: '职务',
            key: 'postName',
            formType: 'input',
            validate: {
              rules: [{ required: false, message: '请输入职务' }]
            }
          },
          {
            title: '电话',
            key: 'mobile',
            formType: 'input',
            validate: {
              rules: [{ required: true, validator: this.validateMobile }]
            }
          },
          {
            title: '邮箱',
            key: 'email',
            formType: 'input',
            validate: {
              rules: [
                {
                  validator: this.validateEmail
                }
              ]
            }
          },
          {
            title: '出生日期',
            key: 'birthday',
            formType: 'datePick'
          },
          {
            title: '民族',
            key: 'nationCode',
            formType: 'dict',
            dictCode: 'hf_res_person_nation',
            change: (val, option) => {
              this.$refs.userFileForm.form.setFieldsValue({ nationName: option.title })
            }
          },
          {
            title: '',
            key: 'nationName',
            formType: 'input',
            hidden: true
          },
          {
            title: '政治面貌',
            key: 'politicCode',
            formType: 'dict',
            dictCode: 'hf_res_peson_face',
            change: (val, option) => {
              this.$refs.userFileForm.form.setFieldsValue({ politicName: option.title })
            }
          },
          {
            title: '',
            key: 'politicName',
            formType: 'input',
            hidden: true
          },
          {
            title: '最高学历',
            key: 'eduCode',
            formType: 'dict',
            dictCode: 'hf_res_person_education',
            change: (val, option) => {
              this.$refs.userFileForm.form.setFieldsValue({ eduName: option.title })
            }
          },
          {
            title: '',
            key: 'eduName',
            formType: 'input',
            hidden: true
          },
          {
            title: '毕业院校',
            key: 'school',
            formType: 'input'
          },
          {
            title: '专业',
            key: 'major',
            formType: 'input'
          },
          {
            title: '毕业时间',
            key: 'graduationTime',
            formType: 'datePick'
          },
          {
            title: '备注',
            key: 'remarks',
            formType: 'textarea',
            span: 2
          }
        ],
        workRecordData: [],
        selectedRowKeys: []
      }
    },
    computed: {
      hasSelected() {
        return this.selectedRowKeys.length > 0
      }
    },
    methods: {
      show(record, title) {
        this.title = title
        this.visible = true
        this.editor(record)
        if (record.id) {
          this.loadWorkDetail(record.id)
        }
      },
      editor(record) {
        let obj = Object.assign({}, record)
        obj.entryTime = obj.entryTime && obj.entryTime != 0 ? moment(parseFloat(obj.entryTime)) : ''
        obj.birthday = obj.birthday && obj.birthday != 0 ? moment(parseFloat(obj.birthday)) : ''
        obj.graduationTime = obj.graduationTime && obj.graduationTime != 0 ? moment(parseFloat(obj.graduationTime)) : ''
        this.model = obj
      },
      handleClickSubmit() {
        this.$refs.userFileForm.validateForm()
      },
      loadWorkDetail(id) {
        postAction(this.url.detailWorkById, { personId: id }).then((res) => {
          if (res.code == 200) {
            let record = res.data
            let workRecordList = []
            if (record.length > 0) {
              record.forEach((item) => {
                workRecordList.push({
                  id: item.id ? item.id : '',
                  personId: item.personId ? item.personId : '',
                  compayName: item.compayName ? item.compayName : '',
                  deptName: item.deptName ? item.deptName : '',
                  startTime:
                    item.startTime && item.startTime != 0 ? moment(parseInt(item.startTime)).format('YYYY-MM-DD') : '',
                  endTime: item.endTime && item.endTime != 0 ? moment(parseInt(item.endTime)).format('YYYY-MM-DD') : '',
                  postName: item.postName ? item.postName : '',
                  remarks: item.remarks ? item.remarks : ''
                })
              })
            }
            this.workRecordData = workRecordList
          }
        })
      },
      // 提交
      async submitHandle(values) {
        const $table = this.$refs.wordRecordData
        const errMap = await $table.validate().catch((errMap) => errMap)
        if (!errMap) {
          if (this.confirmLoading) return
          this.confirmLoading = false
          let workRecord = []
          let acceptInfoData = []
          const { insertRecords } = $table.getRecordset()
          let params = {
            ...values
          }
          let url = null
          if (params.id) {
            url = this.url.edit
          } else {
            url = this.url.add
          }

          if (insertRecords.length == 0) {
            acceptInfoData = this.workRecordData
          } else {
            acceptInfoData = this.workRecordData.concat(insertRecords)
          }
          if (acceptInfoData.length > 0) {
            acceptInfoData.forEach((item) => {
              workRecord.push({
                id: item.id ? item.id : '',
                personId: item.personId ? item.personId : '',
                compayName: item.compayName ? item.compayName : '',
                deptName: item.deptName ? item.deptName : '',
                startTime: item.startTime ? moment(item.startTime).unix('x') * 1000 : '',
                endTime: item.endTime ? moment(item.endTime).unix('x') * 1000 : '',
                postName: item.postName ? item.postName : '',
                remarks: item.remarks ? item.remarks : ''
              })
            })
          } else {
            workRecord = []
          }
          params.entryTime = params.entryTime && params.entryTime != 0 ? params.entryTime.valueOf() : ''
          params.birthday = params.birthday && params.birthday != 0 ? params.birthday.valueOf() : ''
          params.graduationTime =
            params.graduationTime && params.graduationTime != 0 ? params.graduationTime.valueOf() : ''
          params.workRecord = workRecord
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
        this.workRecordData = []
      },
      //  多选
      onSelectChange(records) {
        this.selectedRowKeys = records.records
      },
      // 全选
      selectAllEvent(records) {
        this.selectedRowKeys = records.records
      },
      // 删除工作履历
      handleDelete() {
        const $table = this.$refs.wordRecordData
        const { removeRecords } = $table.getRecordset()
        let tableData = this.workRecordData
        $table.removeCheckboxRow()
        this.selectedRowKeys = []
        if (tableData.length > 0) {
          let list = tableData.filter((items) => {
            if (!removeRecords.includes(items)) return items
          })
          this.workRecordData = list
        }
      },
      // 新增工作履历
      async insertEvent(row) {
        this.rowIndex++
        const $table = this.$refs.wordRecordData
        const tableItem = {
          personId: this.model.id,
          startTime: '',
          endTime: '',
          compayName: '',
          deptName: '',
          postName: '',
          remarks: ''
        }
        const record = [tableItem]
        await $table.insertAt(record, row)
        const { insertRecords } = $table.getRecordset()
        this.workRecordData = this.workRecordData.concat(insertRecords)
      }
    }
  }
</script>
<style lang='less'>
  .vxe-dropdown--panel {
    z-index: 2010 !important;
  }

  //日期框
  .vxe-input--panel.type--date,
  .vxe-input--panel.type--month,
  .vxe-input--panel.type-- week,
  .vxe-input--panel.type--year {
    z-index: 9998 !important;
  }

  //选择框
  .vxe-select--panel {
    z-index: 9997 !important;
  }
</style>