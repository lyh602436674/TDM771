<!--
 * @Author: 赵峰
 * @Date: 2021-08-24 11:11:13
 * @LastEditTime: 2021-09-22 16:45:43
 * @LastEditors: 赵峰
 * @Descripttion: 用户意见处理
 * @FilePath: \hifar-platform-client\src\views\hifar\comments\modules\CommentsDealModal.vue
-->
<template>
  <h-modal
    :title="type == 'close' ? '关闭反馈' : '处理反馈'"
    :getContainer="getContainer"
    inner
    destroyOnClose
    :visible="visible"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <h-form ref="dealForm" v-model="model" :column="1" :formData="formData" @change="submitHandle"></h-form>
  </h-modal>
</template>

<script>
import { postAction } from '@/api/manage'
export default {
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
      type: 'deal',
      url: {
        check: '/BaseUserSuggestBusiness/dealSuggest',
        checking: '/BaseUserSuggestBusiness/doingSuggest',
        close: '/BaseUserSuggestBusiness/closeSuggest',
      },
      formData: [
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
    }
  },
  methods: {
    show(record, type) {
      this.visible = true
      this.type = type
      let obj = Object.assign({}, record)
      obj.remarks = null
      this.model = obj
    },
    handleCancel() {
      this.queryParams = {}
      this.visible = false
    },
    handleSubmit() {
      this.$refs.dealForm.validateForm()
    },
    submitHandle(values) {
      if (this.confirmLoading) return
      this.confirmLoading = false
      let params = {
        ...values,
      }
      let url = this.url.check
      if (this.type == 'deal') {
        url = this.url.check
      } else if (this.type == 'close') {
        url = this.url.close
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