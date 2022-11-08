<template>
  <h-modal
    inner
    destroyOnClose
    :title="title"
    :width="600"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :getContainer="getContainer"
    @submit="handleOk"
    @cancel="handleCancel"
  >
    <h-form ref="dictForm" :width="600" :column="1" v-model="model" :formData="formData" @change="submit" />
  </h-modal>
</template>
<script>
import { addDict, editDict, duplicateCheck } from '@/api/api'

export default {
  name: 'DictModal',
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  data() {
    return {
      value: 1,
      title: '操作',
      visible: false,
      model: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      confirmLoading: false,
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '字典名称',
          key: 'dictName',
          validate: { rules: [{ required: true, message: '请输入字典名称!' }] },
          formType: 'input',
        },
        {
          title: '字典编码',
          key: 'dictCode',
          validate: { rules: [{ required: true, message: '请输入字典编码!' }, { validator: this.validateDictCode }] },
          formType: 'input',
        },
        {
          title: '描述',
          key: 'dictDesc',
          formType: 'textarea',
        },
      ],
    }
  },
  methods: {
    validateDictCode(rule, value, callback) {
      // 重复校验
      var params = {
        tableName: 'BaseSysDictClassify',
        columnName: 'dictCode',
        columnValue: value,
      }
      duplicateCheck(params).then((res) => {
        if (res.code == 200) {
          callback()
        } else {
          callback(res.message)
        }
      })
    },
    handleChange(value) {
      this.model.status = value
    },
    add() {
      this.edit({})
    },
    edit(record) {
      this.model = Object.assign({}, record)
      this.visible = true
    },
    submit(values) {
      if (this.confirmLoading) return
      this.confirmLoading = true
      values.dictName = (values.dictName || '').trim()
      values.dictCode = (values.dictCode || '').trim()
      values.dictDesc = (values.dictDesc || '').trim()
      let formData = Object.assign(this.model, values)
      let obj
      if (!values.id) {
        obj = addDict(formData)
      } else {
        obj = editDict(formData)
      }
      obj
        .then((res) => {
          if (res.code == 200) {
            this.$message.success(this.title + '成功')
            this.$emit('ok')
          } else {
            this.$message.warning(this.title + '失败')
          }
        })
        .finally(() => {
          this.confirmLoading = false
          this.close()
        })
    },
    // 确定
    handleOk() {
      // 触发表单验证
      this.$refs.dictForm.validateForm()
    },
    // 关闭
    handleCancel() {
      this.close()
    },
    close() {
      this.$emit('close')
      this.visible = false
    },
  },
}
</script>