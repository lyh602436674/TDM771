<!--
 * @Author: 赵峰
 * @Date: 2021-08-05 16:15:56
 * @LastEditTime: 2021-11-24 13:52:41
 * @LastEditors: 赵峰
 * @Descripttion: 试品管理新增、添加
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
      v-if="visible"
      ref="productModalForm"
      v-model="model"
      :column="1"
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
      drawerWidth: 800,
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
          title: '试品代号',
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
          title: '试品工号',
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
          title: '试品名称',
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
          title: '机号范围',
          key: 'baseNumberCode',
          formType: 'input',
          validate: {
            rules: [{required: true, message: '请输入机号范围',},],
          },
        },
        {
          title: '试品型号',
          key: 'productModel',
          formType: 'input',
        },
        // {
        //   title: '图号',
        //   key: 'drawNo',
        //   formType: 'input',
        // },
        // {
        //   title: '规格',
        //   key: 'productSpec',
        //   formType: 'input',
        // },
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
      // 默认试品类型为内部
      params.productType = "inside"

      postAction(url, params).then((res) => {
        if (res.code == 200) {
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
    // 试品代号
    validateProductAlias(rule, value, callback) {
      if (!value) {
        callback('请输入试品代号')
      } else {
        if (new RegExp(/^\S+$/).test(value)) {
          callback()
        } else {
          callback('请输入正确格式的试品代号')
        }
      }
    },
    // 试品编号
    validateProductCode(rule, value, callback) {
      if (!value) {
        callback('请输入试品编号')
      } else {
        if (new RegExp(/^\S+$/).test(value)) {
          callback()
        } else {
          callback('请输入正确格式的试品编号')
        }
      }
    },
    // 试品名称
    validateProductName(rule, value, callback) {
      if (!value) {
        callback('请输入试品名称')
      } else {
        if (new RegExp(/^\S+$/).test(value)) {
          callback()
        } else {
          callback('请输入正确格式的试品名称')
        }
      }
    },
  },
}
</script>
<style lang='less' scoped>
</style>