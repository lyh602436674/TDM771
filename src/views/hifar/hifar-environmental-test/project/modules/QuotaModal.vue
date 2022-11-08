<!--
 * @Author: 陈乾龙
 * @Date: 2021-07-30 16:10:36
 * @LastEditTime: 2021-08-26 16:39:51
 * @LastEditors: 陈乾龙
 * @Description: 指标新建编辑弹窗
 * @FilePath: \hifar-platform-client\src\views\hifar\project\modules\QuotaModal.vue
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
      ref="quotaForm"
      :width="600 - 24"
      :column="2"
      :formData="formData"
      @change="handleOk"
    ></h-form>
  </h-modal>
</template>

<script>
import { postAction } from '@/api/manage'
export default {
  inject: ['getContainer', 'groupCode'],
  data() {
    return {
      unitId: null,
      title: '操作',
      model: {},
      visible: false,
      customFormData: [
        [
          {
            key: 'id',
            formType: 'input',
            hidden: true,
            span: 2,
          },
          {
            title: '指标名称',
            key: 'pointName',
            formType: 'input',
            placeholder: '请输入指标名称',
            validate: { rules: [{ required: true, message: '请输入指标名称' }] },
          },
          {
            title: '指标符号',
            key: 'pointMark',
            formType: 'input',
            placeholder: '请输入指标符号',
            validate: { rules: [{ required: true, message: '请输入指标符号' }] },
          },
          {
            title: '数据类型',
            key: 'dataType',
            formType: 'select',
            placeholder: '请选择数据类型',
            options: [
              {
                title: '数值',
                key: 'number',
                value: 'number',
              },
              {
                title: '字符',
                key: 'string',
                value: 'string',
              },
            ],
            change: (v) => {
              this.handleDataTypeChange(v)
            },
            validate: { rules: [{ required: true, message: '请选择数据类型' }] },
          },
        ],
        [
          {
            title: '单位',
            key: 'dataUnitCode',
            formType: 'dict',
            dictCode: 'hf_public_unit',
            placeholder: '请输入数据单位',
            validate: { rules: [{ required: true, message: '请输入数据单位' }] },
            change: (v, item) => {
              this.$nextTick(() => {
                this.$refs.quotaForm.form.setFieldsValue({ dataUnit: item.title })
              })
            },
          },
          {
            key: 'dataUnit',
            formType: 'input',
            hidden: true,
          },
        ],
        [
          {
            title: '启用状态',
            key: 'status',
            component: (
              <h-switch
                checkedTxt="启用"
                uncheckedTxt="禁用"
                v-decorator={['status', { initialValue: '1' }]}
                options={['1', '88']}
              />
            ),
          },
        ],
      ],
      formData: [],
      url: {
        add: 'HfPrjUnitPointBusiness/add',
        edit: '/HfPrjUnitPointBusiness/modifyById',
      },
      loading: false,
    }
  },
  methods: {
    add(record) {
      this.model.id = null
      this.edit(record)
    },
    edit(record = {}) {
      this.model = Object.assign({}, record)
      this.$nextTick(() => {
        if (this.model.dataType == 'string') {
          this.formData = [].concat([], this.customFormData[0], this.customFormData[2])
        } else {
          this.formData = [].concat([], this.customFormData[0], this.customFormData[1], this.customFormData[2])
        }
        this.visible = true
      })
    },
    handleOk(value) {
      if (this.loading) return
      this.loading = true
      let params = {
        ...value,
        unitId: this.unitId,
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
            this.handleCancel
            this.$emit('change')
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleSubmit() {
      this.$refs.quotaForm.validateForm()
    },
    handleCancel() {
      this.visible = false
    },
    handleDataTypeChange(v) {
      let formValue = this.$refs.quotaForm.form.getFieldsValue()
      if (v == 'string') {
        this.formData = [].concat([], this.customFormData[0], this.customFormData[2])
      } else {
        this.formData = [].concat([], this.customFormData[0], this.customFormData[1], this.customFormData[2])
      }
      this.model = Object.assign({}, this.model, formValue, { dataType: v })
    },
  },
}
</script>

<style lang='less' scoped>
</style>