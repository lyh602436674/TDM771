<!--
 * @Author: 赵峰
 * @Date: 2021-09-01 17:35:56
 * @LastEditTime: 2021-11-17 17:23:50
 * @LastEditors: 马潭龙
 * @Descripttion: 检定记录--添加、编辑
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\equipment\modules\VerificationRecordModal.vue
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
      ref="VerificationForm"
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
        add: '/HfResEquipVerifyBusiness/add',
        edit: '/HfResEquipVerifyBusiness/modifyById',
        detailById: '/HfResEquipVerifyBusiness/queryById',
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
          title: '检定日期',
          key: 'verifyTime',
          formType: 'datePick',
          validate: {
            rules: [{ required: true, message: '请选择检定日期' }],
          },
          span: 2,
        },
        {
          title: '检查结果',
          key: 'verifyRs',
          formType: 'textarea',
          validate: {
            rules: [{ required: false, message: '请输入检查结果' }],
          },
          span: 2,
        },
        {
          title: '结果确认',
          key: 'rsConfirm',
          formType: 'input',
          span: 2,
          validate: {
            rules: [{ required: false, message: '请输入结果确认' }],
          },
        },
        {
          title: '责任人',
          key: 'dutyUserId',
          formType: 'input',
          span: 2,
          component: (
            <sys-user-select
              v-decorator={['dutyUserId', { initialValue: [] }]}
              v-on:change={this.acceptUserChange}
            ></sys-user-select>
          ),
          validate: {
            rules: [{ required: false, message: '请选择责任人' }],
          },
        },
        {
          title: '',
          key: 'dutyUserName',
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
      obj.verifyTime = obj.verifyTime && obj.verifyTime != 0 ? moment(parseFloat(obj.verifyTime)) : ''
      this.model = obj
    },
    handleClickSubmit() {
      this.$refs.VerificationForm.validateForm()
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
      params.verifyTime = params.verifyTime && params.verifyTime != 0 ? params.verifyTime.valueOf() : ''
      postAction(url, params).then((res) => {
        if (res.code == 200) {
          this.$message.success(this.title + '成功')
          this.$emit('change', true)
          this.handleCancel()
        }
      })
    },
    acceptUserChange(val, option) {
      this.$refs.VerificationForm.form.setFieldsValue({ dutyUserName: option.idName })
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