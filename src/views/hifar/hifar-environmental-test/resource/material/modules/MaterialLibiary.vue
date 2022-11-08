<!--
 * @Author: 赵峰
 * @Date: 2021-08-31 16:39:11
 * @LastEditTime: 2021-09-08 17:07:35
 * @LastEditors: 赵峰
 * @Descripttion: 出入库--录入
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-physico-chemical\resource\material\modules\MaterialLibiary.vue
-->
<template>
  <h-modal
    :title="title"
    inner
    :getContainer="getContainer"
    destroyOnClose
    :width="800"
    :visible="visible"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <h-form ref="materialForm" v-model="model" :column="1" :formData="formData" @change="submitHandle"></h-form>
  </h-modal>
</template>

<script>
import moment from 'moment'
import { getAction, postAction } from '@/api/manage'
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
      title: '出库',
      moment,
      model: {},
      url: {
        intoAdd: '/HfResMaterialRecordBusiness/add',
      },
      formData: [],
      formDataBackup: [
        // 采购入库
        [
          {
            key: 'materialId',
            formType: 'input',
            hidden: true,
          },
          {
            key: 'optType',
            formType: 'input',
            hidden: true,
          },
          {
            title: '入库类型',
            key: 'optCode',
            formType: 'dict',
            dictCode: 'hf_res_material_input',
            change: (val, option) => {
              this.selectHandle(option)
            },
            validate: {
              rules: [{ required: true, message: '请选择入库类型' }],
            },
          },
          {
            key: 'optName',
            formType: 'input',
            hidden: true,
          },
          {
            title: '交货人',
            key: 'remarks',
            formType: 'input',
            validate: {
              rules: [{ required: true, message: '请输入交货人' }],
            },
          },
          {
            title: '数量',
            key: 'quantity',
            formType: 'input',
            type: 'number',
            validate: {
              rules: [
                {
                  required: true,
                  validator: this.validateQuantity,
                },
              ],
            },
          },
        ],
        // 归还入库
        [
          {
            key: 'materialId',
            formType: 'input',
            hidden: true,
          },
          {
            key: 'optType',
            formType: 'input',
            hidden: true,
          },
          {
            title: '入库类型',
            key: 'optCode',
            formType: 'dict',
            dictCode: 'hf_res_material_input',
            change: (val, option) => {
              this.selectHandle(option)
            },
            validate: {
              rules: [{ required: true, message: '请选择入库类型' }],
            },
          },
          {
            key: 'optName',
            formType: 'input',
            hidden: true,
          },
          {
            title: '归还人',
            key: 'remarks',
            formType: 'input',
            validate: {
              rules: [{ required: true, message: '请输入归还人' }],
            },
          },
          {
            title: '数量',
            key: 'quantity',
            formType: 'input',
            type: 'number',
            validate: {
              rules: [
                {
                  required: true,
                  validator: this.validateQuantity,
                },
              ],
            },
          },
        ],
        // 报以入库
        [
          {
            key: 'materialId',
            formType: 'input',
            hidden: true,
          },
          {
            key: 'optType',
            formType: 'input',
            hidden: true,
          },
          {
            title: '入库类型',
            key: 'optCode',
            formType: 'dict',
            dictCode: 'hf_res_material_input',
            change: (val, option) => {
              this.selectHandle(option)
            },
            validate: {
              rules: [{ required: true, message: '请选择入库类型' }],
            },
          },
          {
            key: 'optName',
            formType: 'input',
            hidden: true,
          },
          {
            title: '报溢原因',
            key: 'remarks',
            formType: 'input',
            validate: {
              rules: [{ required: true, message: '请输入报溢原因' }],
            },
          },
          {
            title: '数量',
            key: 'quantity',
            formType: 'input',
            type: 'number',
            validate: {
              rules: [
                {
                  required: true,
                  validator: this.validateQuantity,
                },
              ],
            },
          },
        ],
        // 领用出库
        [
          {
            key: 'materialId',
            formType: 'input',
            hidden: true,
          },
          {
            key: 'optType',
            formType: 'input',
            hidden: true,
          },
          {
            title: '出库类型',
            key: 'optCode',
            formType: 'dict',
            dictCode: 'hf_res_material_output',
            change: (val, option) => {
              this.selectOutHandle(option)
            },
            validate: {
              rules: [{ required: true, message: '请选择出库类型' }],
            },
          },
          {
            key: 'optName',
            formType: 'input',
            hidden: true,
          },
          {
            title: '领用人',
            key: 'remarks',
            formType: 'input',
            validate: {
              rules: [{ required: true, message: '请输入领用人' }],
            },
          },
          {
            title: '数量',
            key: 'quantity',
            formType: 'input',
            type: 'number',
            validate: {
              rules: [
                {
                  required: true,
                  validator: this.validateQuantity,
                },
              ],
            },
          },
        ],
        // 处理出库
        [
          {
            key: 'materialId',
            formType: 'input',
            hidden: true,
          },
          {
            key: 'optType',
            formType: 'input',
            hidden: true,
          },
          {
            title: '出库类型',
            key: 'optCode',
            formType: 'dict',
            dictCode: 'hf_res_material_output',
            change: (val, option) => {
              this.selectOutHandle(option)
            },
            validate: {
              rules: [{ required: true, message: '请选择出库类型' }],
            },
          },
          {
            key: 'optName',
            formType: 'input',
            hidden: true,
          },
          {
            title: '处理方式',
            key: 'remarks',
            formType: 'input',
            validate: {
              rules: [{ required: true, message: '请输入处理方式' }],
            },
          },
          {
            title: '数量',
            key: 'quantity',
            formType: 'input',
            type: 'number',
            validate: {
              rules: [
                {
                  required: true,
                  validator: this.validateQuantity,
                },
              ],
            },
          },
        ],
        // 报损出库
        [
          {
            key: 'materialId',
            formType: 'input',
            hidden: true,
          },
          {
            key: 'optType',
            formType: 'input',
            hidden: true,
          },
          {
            title: '出库类型',
            key: 'optCode',
            formType: 'dict',
            dictCode: 'hf_res_material_output',
            change: (val, option) => {
              this.selectOutHandle(option)
            },
            validate: {
              rules: [{ required: true, message: '请选择出库类型' }],
            },
          },
          {
            key: 'optName',
            formType: 'input',
            hidden: true,
          },
          {
            title: '报损原因',
            key: 'remarks',
            formType: 'input',
            validate: {
              rules: [{ required: true, message: '请输入报损原因' }],
            },
          },
          {
            title: '数量',
            key: 'quantity',
            formType: 'input',
            type: 'number',
            validate: {
              rules: [
                {
                  required: true,
                  validator: this.validateQuantity,
                },
              ],
            },
          },
        ],
      ],
    }
  },

  methods: {
    selectHandle(option) {
      this.model = Object.assign({}, this.model, { optCode: option.value,optName: option.title })
      if (option.value == 1) {
        this.formData = this.formDataBackup[0]
      } else if (option.value == 2) {
        this.formData = this.formDataBackup[1]
      } else if (option.value == 3) {
        this.formData = this.formDataBackup[2]
      }
    },
    selectOutHandle(option) {
      this.model = Object.assign({}, this.model, { optCode: option.value,optName: option.title })
      if (option.value == 1) {
        this.formData = this.formDataBackup[3]
      } else if (option.value == 2) {
        this.formData = this.formDataBackup[4]
      } else if (option.value == 3) {
        this.formData = this.formDataBackup[5]
      }
    },
    show(record, title) {
      this.visible = true
      this.title = title
      this.editor(record, title)
    },
    editor(record, title) {
      let obj = Object.assign({}, record)
      obj.materialId = obj.id
      obj.remarks = null
      obj.quantity = null
      if (title == '入库') {
        obj.optType = 1
        this.formData = this.formDataBackup[0]
      } else {
        obj.optType = 2
        this.formData = this.formDataBackup[3]
      }
      this.model = obj
    },
    handleCancel() {
      this.queryParams = {}
      this.visible = false
    },
    handleSubmit() {
      this.$refs.materialForm.validateForm()
    },
    submitHandle(values) {
      if (this.confirmLoading) return
      this.confirmLoading = false
      let params = {
        ...values,
      }
      console.log(params)
      let url = this.url.intoAdd
      postAction(url, params).then((res) => {
        if (res.code == 200) {
          this.$message.success('操作成功')
          this.handleCancel()
          this.$emit('change', true)
        }
      })
    },
    validateQuantity(rule, value, callback) {
      if (!value) {
        callback('请输入数量')
      } else {
        if (value < 0) {
          callback('请输入正确格式的数量')
        } else {
          callback()
        }
      }
    },
  },
}
</script>
<style lang='less' scoped>
</style>