<!--
 * @Author: 赵峰
 * @Date: 2021-09-09 15:27:31
 * @LastEditTime: 2021-10-14 09:57:17
 * @LastEditors: 赵峰
 * @Descripttion: 报告审核、批准 ---- 通过、驳回（20 通过 30 驳回）批准（40 通过 50驳回）
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\reports\modules\ReportCheckModal.vue
-->
<template>
  <h-modal
    :title="title"
    inner
    destroyOnClose
    :getContainer="getContainer"
    :visible="visible"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <h-form ref="ReportCheckForm" v-model="model" :column="1" :formData="formData" @change="submitHandle"></h-form>
  </h-modal>
</template>

<script>
import { postAction } from '@/api/manage'
export default {
  components: {},
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  data() {
    return {
      visible: false,
      title: '',
      model: {},
      type: '',
      url: {
        check: '/HfEnvReportExamineBusiness/examineById',
        checkApprove: '/HfEnvReportApproveBusiness/approveById',
      },
      formData: [],
      formDataBackUp: [
        [
          {
            key: 'id',
            formType: 'input',
            hidden: true,
          },
          {
            title: '备注',
            key: 'remarks',
            formType: 'textarea',
            validate: {
              rules: [{ required: true, message: '请输入备注' }],
            },
            span: 2,
            style: {
              height: '200px',
            },
          },
        ],
        [
          {
            key: 'id',
            formType: 'input',
            hidden: true,
          },
          {
            title: '备注',
            key: 'remarks',
            formType: 'textarea',
            validate: {
              rules: [{ required: false, message: '请输入备注' }],
            },
            span: 2,
            style: {
              height: '200px',
            },
          },
        ],
      ],
    }
  },
  methods: {
    show(record, title, type) {
      this.visible = true
      this.title = title
      this.type = type
      if (title == '审核通过' || title == '批准通过') {
        this.formData = this.formDataBackUp[1]
      }else{
        this.formData = this.formDataBackUp[0]
      }
      let obj = Object.assign({}, record)
      obj.remarks = null
      this.model = obj
    },
    handleCancel() {
      this.visible = false
    },
    validateRemarks(rule, value, callback) {
      if (!value) {
        callback('请输入备注')
      } else {
        if (new RegExp(/^\S+$/).test(value)) {
          callback()
        } else {
          callback('请输入正确格式的备注')
        }
      }
    },
    handleSubmit() {
      this.$refs.ReportCheckForm.validateForm()
    },
    submitHandle(values) {
      if (this.confirmLoading) return
      this.confirmLoading = false
      let params = {
        ...values,
      }
      let url = null
      if (this.type == 'check' && this.title == '审核通过') {
        params.examineFlag = 20
        url = this.url.check
      } else if (this.type == 'check' && this.title == '审核驳回') {
        params.examineFlag = 30
        url = this.url.check
      } else if (this.type == 'approve' && this.title == '批准通过') {
        params.examineFlag = 40
        url = this.url.checkApprove
      } else if (this.type == 'approve' && this.title == '批准驳回') {
        params.examineFlag = 50
        url = this.url.checkApprove
      }
      postAction(url, params).then((res) => {
        if (res.code == 200) {
          this.$message.success('操作成功')
          this.handleCancel()
          this.$emit('change', true)
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>
/deep/ .h-form-label {
  width: auto !important;
}
</style>