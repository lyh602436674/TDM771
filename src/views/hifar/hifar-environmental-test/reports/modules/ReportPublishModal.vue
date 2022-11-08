<!--
 * @Author: 赵峰
 * @Date: 2021-09-10 11:03:43
 * @LastEditTime: 2021-10-14 09:57:41
 * @LastEditors: 赵峰
 * @Descripttion: 报告发放
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\reports\modules\ReportPublishModal.vue
-->
<template>
  <h-modal
    :title="title"
    inner
    destroyOnClose
    :width="600"
    :visible="visible"
    :getContainer="getContainer"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <h-form ref="ReportPublishForm" v-model="model" :column="1" :formData="formData" @change="submitHandle"></h-form>
  </h-modal>
</template>

<script>
import {postAction} from '@/api/manage'

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
      title: '报告发放',
      model: {},
      type: '',
      url: {
        publish: '/HfEnvReportReceiveBusiness/receiveById',
      },
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '接收人',
          key: 'receiveUserName',
          formType: 'input',
          validate: {
            rules: [{required: true, message: '请输入接收人'}],
          },
        },
        {
          title: '发放数量',
          key: 'receiveNum',
          formType: 'input-number',
          min: 1,
          style: {width: "100%"},
          validate: {
            rules: [{required: true, message: '请输入发放数量'}],
          },
          // change: (value) => {
          //   if (String(value).includes('.')) {
          //     this.$refs.ReportPublishForm.form.setFieldsValue({
          //       receiveNum: String(value).replace(/\./g, ''),
          //     })
          //   }
          // }
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
          validate: {
            rules: [{required: false, message: '请输入备注'}],
          },
          style: {
            height: '100px',
          },
        },
      ],
    }
  },
  methods: {
    show(record) {
      this.visible = true
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
      this.$refs.ReportPublishForm.validateForm()
    },
    submitHandle(values) {
      if (this.confirmLoading) return
      this.confirmLoading = false
      let params = {
        ...values,
      }
      postAction(this.url.publish, params).then((res) => {
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
  width: 80px !important;
}
</style>