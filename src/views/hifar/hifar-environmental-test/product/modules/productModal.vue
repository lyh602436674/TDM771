<!--
 * @Author: 赵峰
 * @Date: 2021-08-05 16:15:56
 * @LastEditTime: 2021-11-24 13:52:41
 * @LastEditors: 赵峰
 * @Descripttion: 产品管理新增、添加
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\product\modules\productModal.vue
-->
<template>
  <h-modal
    :confirm-loading="confirmLoading"
    :getContainer="getContainer"
    :title="title"
    :visible="visible"
    :width="drawerWidth"
    destroyOnClose
    inner
    @cancel="handleCancel"
    @submit="handleClickSubmit"
  >
    <h-form
      ref="productModalForm"
      v-model="model"
      :column="2"
      :formData="formData"
      @change="submitHandle"
    ></h-form>
  </h-modal>
</template>

<script>
import moment from 'moment'
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
      moment,
      visible: false,
      confirmLoading: false,
      drawerWidth: 1000,
      title: '添加',
      url: {
        add: '/HfProductBaseBusiness/add',
        edit: '/HfProductBaseBusiness/modifyById',
      },
      model: {},
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '产品代号',
          key: 'productAlias',
          formType: 'input',
          validate: {
            rules: [
              {
                required: true,
                validator: this.validateProductAlias,
              },
            ],
          },
        },
        {
          title: '分类选择',
          key: 'productType',
          formType: 'treeSelect',
          treeData: [
            {
              title: 'Node1',
              value: '0-0',
              key: '0-0',
              children: [
                {
                  value: '0-0-1',
                  key: '0-0-1',
                  title: 'title',
                },
                {
                  title: 'Child Node2',
                  value: '0-0-2',
                  key: '0-0-2',
                },
              ],
            },
            {
              title: 'Node2',
              value: '0-1',
              key: '0-1',
            },
          ]
        },
        {
          title: '产品名称',
          key: 'productName',
          formType: 'input',
          validate: {
            rules: [
              {
                required: true,
                validator: this.validateProductName,
              },
            ],
          },
        },
        {
          title: "内部产品编码",
          key: 'productCodeInner',
          formType: 'input',
          disabled: true,
        },
        {
          title: '统一产品编码',
          key: 'productCode',
          formType: 'input',
          validate: {
            rules: [
              {
                required: true,
                validator: this.validateProductCode,
              },
            ],
          },
        },
        {
          title: '规格大小',
          key: 'productSpec',
          formType: 'input',
        },
        {
          title: '产品图号',
          key: 'productChartNo',
          formType: 'input',
        },
        {
          title: '产品型号',
          key: 'productModel',
          formType: 'input',
        },
        {
          title: '阶段',
          key: 'productStage',
          formType: 'dict',
          dictCode: 'hf_product_stage',
          validate: {
            rules: [{required: true, message: '请选择阶段', trigger: 'blur'}]
          },
        },
        {
          title: '有效性',
          key: 'productEffect',
          formType: 'radio',
          radioType: 'radioButton',
          defaultValue: 1,
          options: [
            {title: '正常', value: 1, key: 1},
            {title: '停用', value: 2, key: 2}
          ],
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
      this.editor(record)
    },
    editor(record) {
      let obj = Object.assign({}, record)
      this.model = obj
    },
    handleClickSubmit() {
      this.$refs.productModalForm.validateForm()
    },
    // 提交
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
      params.classifyId = 0
      // 默认产品类型为内部
      params.productType = "inside"

      postAction(url, params).then((res) => {
        if (res.code === 200) {
          this.$message.success(this.title + '成功')
          this.$emit('change', true)
          this.handleCancel()
        }
      })
    },
    handleCancel(e) {
      this.visible = false
      this.modal = {}
    },
    // 产品代号
    validateProductAlias(rule, value, callback) {
      if (!value) {
        callback('请输入产品代号')
      } else {
        if (new RegExp(/^\S+$/).test(value)) {
          callback()
        } else {
          callback('请输入正确格式的产品代号')
        }
      }
    },
    // 产品编号
    validateProductCode(rule, value, callback) {
      if (!value) {
        callback('请输入产品编号')
      } else {
        if (new RegExp(/^\S+$/).test(value)) {
          callback()
        } else {
          callback('请输入正确格式的产品编号')
        }
      }
    },
    // 产品名称
    validateProductName(rule, value, callback) {
      if (!value) {
        callback('请输入产品名称')
      } else {
        if (new RegExp(/^\S+$/).test(value)) {
          callback()
        } else {
          callback('请输入正确格式的产品名称')
        }
      }
    },
  },
}
</script>
<style lang='less' scoped>
</style>