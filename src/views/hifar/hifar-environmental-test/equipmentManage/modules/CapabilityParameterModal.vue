<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-14 18:01:45
 * @LastEditTime: 2021-11-09 16:11:55
 * @LastEditors: 赵峰
 * @Description: 能力参数新建编辑
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\equipmentManage\modules\CapabilityParameterModal.vue
-->
<template>
  <h-modal
    :getContainer="getContainer"
    :title="title"
    :visible="visible"
    destroyOnClose
    inner
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <h-form ref="capabilityParameterForm" v-model="model" :column="1" :formData="formData" @change="submit"/>
  </h-modal>
</template>

<script>
import {postAction} from '@/api/manage'

export default {
  inject: {
    getContainer: {
      default: () => {
        return () => document.body
      },
    },
  },
  data() {
    return {
      visible: false,
      title: '操作',
      model: {},
      baseFormData: [
        [
          {
            key: 'id',
            formType: 'input',
            hidden: true,
          },
          {
            title: '参数编号',
            key: 'paramCode',
            formType: 'input',
            validate: {
              rules: [{required: true, message: '请输入参数编号'}],
            },
          },
          {
            title: '参数名称',
            key: 'paramName',
            formType: 'input',
            validate: {
              rules: [{required: true, message: '请输入参数名称'}],
            },
          },
          {
            title: '参数类型',
            key: 'paramType',
            formType: 'dict',
            dictCode: 'hf_dev_param_type',
            validate: {
              rules: [{required: true, message: '请选择参数类型'}],
            },
          },
          {
            title: "曲线类型",
            key: 'curveType',
            formType: 'select',
            options: [
              {
                title: '温度/℃',
                key: '1',
                value: '1',
              },
              {
                title: '湿度/RH',
                key: '2',
                value: '2',
              },
            ]
          },
          {
            title: '数据类型',
            key: 'dataType',
            formType: 'select',
            validate: {
              rules: [{required: true, message: '请选择数据类型'}],
            },
            options: [
              {
                title: '字符型',
                key: 'string',
                value: 'string',
              },
              {
                title: '数值型',
                key: 'number',
                value: 'number',
              },
              {
                title: '日期型',
                key: 'dateTime',
                value: 'dateTime',
              },
            ],
            change: (v, options) => {
              let values = this.$refs.capabilityParameterForm.form.getFieldsValue()
              this.model = Object.assign({}, this.model, values, {
                dataType: v,
              })
              if (v == 'number') {
                this.formData = [].concat([], this.baseFormData[0], this.baseFormData[1])
              } else {
                this.formData = [].concat([], this.baseFormData[0])
              }
            },
          },
        ],
        [
          {
            title: '单位',
            key: 'unitCode',
            formType: 'dict',
            dictCode: 'hf_public_unit',
            validate: {
              rules: [{required: true, message: '请选择单位'}],
            },
            change: (v, option) => {
              this.$refs.capabilityParameterForm.form.setFieldsValue({
                unitName: option.title,
              })
              // let values = this.$refs.capabilityParameterForm.form.getFieldsValue()
              // this.model = Object.assign({}, this.model, values, {
              //   unitCode: v,
              //   unitName: option.title,
              // })
            },
          },
          {
            key: 'unitName',
            formType: 'input',
            hidden: true,
          },
        ],
      ],
      formData: [],
      url: {
        add: '/HfEnvAbilityParamBusiness/add',
        edit: '/HfEnvAbilityParamBusiness/modifyById',
      },
    }
  },
  methods: {
    add() {
      this.edit({})
    },
    edit(record) {
      this.model = Object.assign({}, record)
      if (this.model.id) {
        this.title = '编辑能力参数'
      } else {
        this.title = '新建能力参数'
      }

      if (!this.model.dataType) {
        this.model.dataType = 'number'
      }
      if (this.model.dataType == 'number') {
        this.formData = [].concat([], this.baseFormData[0], this.baseFormData[1])
      } else {
        this.formData = [].concat([], this.baseFormData[0])
      }

      this.$nextTick(() => {
        this.visible = true
      })
    },
    submit(values) {
      let params = {
        ...values,
      }
      let url = null
      if (values.id) {
        url = this.url.edit
      } else {
        url = this.url.add
      }
      postAction(url, params).then((res) => {
        if (res.code == 200) {
          this.$message.success(this.title + '成功')
          this.$emit('change', true)
          this.handleCancel()
        }
      })
    },
    handleSubmit() {
      this.$refs.capabilityParameterForm.validateForm()
    },
    handleCancel() {
      this.formData = []
      this.visible = false
    },
  },
}
</script>

<style>
</style>