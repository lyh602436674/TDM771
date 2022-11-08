<!--
 * @Author: 赵峰
 * @Date: 2021-09-01 15:29:31
 * @LastEditTime: 2021-09-01 17:42:08
 * @LastEditors: 赵峰
 * @Descripttion: 维修记录 ---- 新增、修改
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-physico-chemical\resource\equipment\modules\RepairRecordModal.vue
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
      :width="drawerWidth - 48"
      :formData="formData"
      @change="submitHandle"
    ></h-form>
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
  data() {
    return {
      moment,
      visible: false,
      confirmLoading: false,
      drawerWidth: 800,
      model: {},
      title: '添加',
      url: {
        add: '/HfResEquipRepairBusiness/add',
        edit: '/HfResEquipRepairBusiness/modifyById',
        detailById: '/HfResEquipRepairBusiness/queryById',
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
          title: '故障原因',
          key: 'fault',
          formType: 'textarea',
          validate: {
            rules: [{ required: true, message: '请输入故障原因' }],
          },
          span: 2,
        },
        {
          title: '维修结果',
          key: 'repairRs',
          formType: 'textarea',
          validate: {
            rules: [{ required: true, message: '请输入维修结果' }],
          },
          span: 2,
        },
        {
          title: '维修人员',
          key: 'repairPerson',
          formType: 'input',
          span: 2,
          validate: {
            rules: [{ required: true, message: '请输入维修人员' }],
          },
        },
        {
          title: '维修日期',
          key: 'repairTime',
          formType: 'datePick',
          validate: {
            rules: [{ required: true, message: '请选择维修日期' }],
          },
          span: 2,
        },
        {
          title: '验收人',
          key: 'checkUserId',
          formType: 'input',
          span: 2,
          component: (
            <sys-user-select
              v-decorator={['checkUserId', { initialValue: [] }]}
              v-on:change={this.acceptUserChange}
            ></sys-user-select>
          ),
          validate: {
            rules: [{ required: true, message: '请选择验收人' }],
          },
        },
        {
          title: '',
          key: 'checkUserName',
          formType: 'input',
          hidden: true,
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
          span: 2,
        },
      ],
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
      }
    },
    loadDetail(id) {
      postAction(this.url.detailById, { id: id }).then((res) => {
        if (res.code == 200) {
          this.editor(res.data)
        }
      })
    },
    editor(record) {
      let obj = Object.assign({}, record)
      obj.repairTime = obj.repairTime && obj.repairTime != 0 ? moment(parseFloat(obj.repairTime)) : ''
      this.model = obj
    },
    handleClickSubmit() {
      this.$refs.repairRecordForm.validateForm()
    },
    // 提交
    submitHandle(values) {
      if (this.confirmLoading) return
      this.confirmLoading = false
      let params = {
        ...values
      }
      let url = null
      if (params.id) {
        url = this.url.edit
      } else {
        url = this.url.add
      }
      params.repairTime = params.repairTime && params.repairTime != 0 ? params.repairTime.valueOf() : ''
      postAction(url, params).then((res) => {
        if (res.code == 200) {
          this.$message.success(this.title + '成功')
          this.$emit('change', true)
          this.handleCancel()
        }
      })
    },
    acceptUserChange(val, option) {
      this.$refs.repairRecordForm.form.setFieldsValue({ checkUserName: option.idName })
    },
    handleCancel(e) {
      this.visible = false
      this.model = {}
    },
    handleDownload(filePath, fileName) {
      let fileAccessUrl = getFileAccessHttpUrl(filePath)
      downloadFile(fileAccessUrl, fileName)
    },
  },
}
</script>

<style lang='less' scoped>
</style>