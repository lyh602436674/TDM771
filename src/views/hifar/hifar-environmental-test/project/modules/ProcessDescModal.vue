<!--
 * @Author: 赵峰
 * @Date: 2021-10-28 09:55:19
 * @LastEditTime: 2021-11-03 19:21:19
 * @LastEditors: 陈乾龙
 * @Descripttion: 实施过程添加-编辑modal
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\project\modules\ProcessDescModal.vue
-->
<template>
  <h-modal
    :width="600"
    :getContainer="getContainer"
    :inner="true"
    :visible="visible"
    destroyOnClose
    :title="title"
    :confirmLoading="loading"
    @submit="handleSubmit"
    @cancel="handleCancel"
  >
    <h-form
      v-model="model"
      v-if="visible"
      ref="processDescForm"
      :column="1"
      :formData="formData"
      @change="handleOk"
    ></h-form>
  </h-modal>
</template>

<script>
import { postAction } from '@/api/manage'
export default {
  inject: ['getContainer'],
  data() {
    return {
      unitId: null,
      title: '操作',
      model: {},
      visible: false,
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
          span: 2,
        },
        {
          key: 'unitId',
          formType: 'input',
          hidden: true,
          span: 2,
        },
        {
          title: '过程名称',
          key: 'processName',
          formType: 'input',
          placeholder: '请输入过程名称',
          validate: { rules: [{ required: true, message: '请输入过程名称' }] },
        },
        {
          title: '过程描述',
          key: 'processDesc',
          formType: 'textarea',
          placeholder: '请输入过程描述',
          validate: { rules: [
            { required: true, message: '请输入过程描述' },
            { max: 256, message: '过程描述不能超过256个字符' }
            ] },
        },
        {
          title: '备注',
          key: 'remarks',
          validate: {
            rules: [
              { required: false, message: '请输入备注' },
              { max: 256, message: '备注不能超过256个字符' }
              ],
          },
          formType: 'textarea',
          span: 2,
        },
      ],
      url: {
        add: '/HfPrjUnitProcessDescBusiness/add',
        edit: '/HfPrjUnitProcessDescBusiness/modifyById',
      },
      loading: false,
    }
  },
  methods: {
    show(record, title) {
      this.visible = true
      this.title = title
      this.edit(record)
    },
    edit(record = {}) {
      let obj = Object.assign({}, record)
      this.model = obj
    },
    handleOk(value) {
      if (this.loading) return
      this.loading = true
      let params = {
        ...value,
      }
      let url = null
      if (params.id) {
        url = this.url.edit
      } else {
        url = this.url.add
      }
      postAction(url, params)
        .then((res) => {
          if (res.code == 200) {
            this.$message.success(this.title + '成功')
            this.handleCancel()
            this.$emit('change')
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleSubmit() {
      this.$refs.processDescForm.validateForm()
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style lang='less' scoped>
</style>