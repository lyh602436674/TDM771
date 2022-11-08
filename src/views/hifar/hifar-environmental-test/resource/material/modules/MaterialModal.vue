<!--
 * @Author: 赵峰
 * @Date: 2021-08-31 15:48:04
 * @LastEditTime: 2021-09-22 14:14:43
 * @LastEditors: 赵峰
 * @Descripttion: 耗材管理--添加、编辑
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-physico-chemical\resource\material\modules\MaterialModal.vue
-->
<template>
  <h-modal
    :title="title"
    inner
    destroyOnClose
    :getContainer="getContainer"
    :width="800"
    :visible="visible"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <h-form ref="materialForm" v-model="model" :column="2" :formData="formData" @change="submitHandle"></h-form>
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
      title: '添加',
      moment,
      model: {},
      url: {
        add: '/HfResMaterialBusiness/add',
        edit: '/HfResMaterialBusiness/modifyById',
      },
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '材料名称',
          key: 'materialName',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入材料名称' }],
          },
        },
        {
          title: '材料编号',
          key: 'materialCode',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入材料编号' }],
          },
        },
        {
          title: '材料类型',
          key: 'materialType',
          formType: 'input',
          validate: {
            rules: [{ required: false, message: '请输入材料类型' }],
          },
        },
        {
          title: '材料规格',
          key: 'materialSpecs',
          formType: 'input',
        },
        {
          title: '材料品牌',
          key: 'materialBrand',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入材料品牌' }],
          },
        },
        {
          title: '材料单位',
          key: 'materialUnit',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入材料单位' }],
          },
        },
        {
          title: '材料来源',
          key: 'buySource',
          formType: 'input',
        },
        {
          title: '生产厂家',
          key: 'factoryName',
          formType: 'input',
        },
        {
          title: '库存数量',
          key: 'quantity',
          component: (
            <a-input-number
              style="width:100%;"
              min={0}
              v-decorator={['quantity', { initialValue: '' }]}
              placeholder="请输入库存数量"
            />
          ),
        },
        {
          title: '库存上限',
          key: 'quantityMin',
          component: (
            <a-input-number
              style="width:100%;"
              min={0}
              v-decorator={[
                'quantityMin',
                {
                  rules: [{ required: false, validator: this.validateQuantityMin }],
                  initialValue: '',
                },
              ]}
              placeholder="请输入库存上限"
            />
          ),
        },
        {
          title: '库存下限',
          key: 'quantityMax',
          component: (
            <a-input-number
              style="width:100%;"
              min={0}
              v-decorator={[
                'quantityMax',
                {
                  rules: [{ required: false, validator: this.validateQuantityMax }],
                  initialValue: '',
                },
              ]}
              placeholder="请输入库存下限"
            />
          ),
        },
        {
          title: '存储位置',
          key: 'location',
          formType: 'input',
        },
        {
          title: '保质期',
          key: 'period',
          formType: 'input',
          type: 'number',
          addonAfter: '个月',
          validate: {
            rules: [
              {
                required: true,
                validator: this.validatePeriod,
              },
            ],
          },
        },
        {
          title: '备注',
          key: 'remarks',
          validate: {
            rules: [{ required: false, message: '请输入' },{ max: 255, message: '备注长度不能大于255' }],
          },
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
      this.editor(record)
    },
    editor(record) {
      let obj = Object.assign({}, record)
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
      let url = null
      if (params.id) {
        url = this.url.edit
      } else {
        url = this.url.add
      }
      postAction(url, params).then((res) => {
        if (res.code == 200) {
          this.$message.success('操作成功')
          this.handleCancel()
          this.$emit('change', true)
        }
      })
    },
    validatePeriod(rule, value, callback) {
      if (!value) {
        callback('请输入保质期')
      } else {
        if (value <= 0) {
          callback('请输入正确格式的保质期')
        } else {
          callback()
        }
      }
    },
    validateQuantityMax(rule, value, callback) {
      let quantityMin = this.$refs.materialForm.form.getFieldsValue(['quantityMin']).quantityMin
      if (!value) {
        callback()
      } else {
        if (value > quantityMin) {
          callback('库存下限不能大于库存上限')
        } else {
          callback()
        }
      }
    },
    validateQuantityMin(rule, value, callback) {
      let quantityMax = this.$refs.materialForm.form.getFieldsValue(['quantityMax']).quantityMax
      console.log(value,quantityMax)
      if (!value) {
        callback()
      } else {
        if (value < quantityMax) {
          callback('库存上限不能小于库存下限')
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