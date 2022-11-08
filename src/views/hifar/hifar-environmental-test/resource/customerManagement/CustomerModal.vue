<!--
 * @Author: 赵峰
 * @Date: 2021-09-08 14:33:50
 * @LastEditTime: 2021-10-21 15:33:59
 * @LastEditors: 陈乾龙
 * @Descripttion: 客户新增、编辑
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\customerManagement\CustomerModal.vue
-->
<template>
  <h-modal
    :title="title"
    :visible="visible"
    :width="drawerWidth"
    inner
    :getContainer="getContainer"
    :confirm-loading="confirmLoading"
    :destroyOnClose="true"
    @submit="handleClickSubmit"
    @cancel="handleCancel"
  >
    <h-form
      ref="userForm"
      v-model="model"
      :width="drawerWidth - 48"
      :formData="formData"
      :column="2"
      @change="submit"
    ></h-form>
  </h-modal>
</template>

<script>
import { postAction } from '@/api/manage'
import FeeListSelectModal from '../fee/modules/FeeListSelectModal.vue'
export default {
  components: {
    FeeListSelectModal,
  },
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },

  data() {
    return {
      title: '添加',
      drawerWidth: 800,
      confirmLoading: false,
      visible: false,
      model: {},
      url: {
        add: '/HfResCustBusiness/add',
        edit: '/HfResCustBusiness/modifyById',
      },
      formData: [
        {
          title: '',
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '客户名称',
          key: 'custName',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
          },
        },
        {
          title: '客户简称',
          key: 'custShort',
          formType: 'input',
        },
        {
          title: '客户类型',
          key: 'custType',
          formType: 'select',
          options: [
            { title: '内部', value: 'inside', key: 'inside' },
            { title: '外部', value: 'outside', key: 'outside' },
          ],
        },
        {
          title: '联系人',
          key: 'linkName',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
          },
        },
        {
          title: '联系电话',
          key: 'linkMobile',
          formType: 'input',
          validate: {
            rules: [
              {
                required: true,
                validator: this.validateMobile,
              },
            ],
          },
        },
        {
          title: '客户地址',
          key: 'custAddress',
          formType: 'input',
        },
        {
          title: '费用标准',
          key: 'costId',
          component: (
            <fee-list-select-modal
              placeholder={'请选择费用标准'}
              title={'选择费用标准'}
              v-decorator={['costId']}
              selectedName={() => {
                return this.model.costName
              }}
              onchange={(selectedRowKeys, selectedRows) => {
                this.model.costId = selectedRowKeys
                this.model.costName = selectedRows[0] ? selectedRows[0].costName : ''
                this.$refs.userForm.form.setFieldsValue({ costName: selectedRows[0].costName })
              }}
            />
          ),
        },
        {
          title: '',
          key: 'costName',
          formType: 'input',
          hidden: true,
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
          span: 2,
          validate: {
          rules: [
            {
              max:200,message:"长度不能大于200"
            },
          ],
        },
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
      this.visible = false
      this.model = {}
    },
    handleClickSubmit() {
      this.$refs.userForm.validateForm()
    },
    async submit(values) {
      if (this.confirmLoading) return
      this.confirmLoading = false
      let params = {
        ...values,
      }
      let url = null
      if (params.id) {
        url = this.url.edit
      } else {
        url = this.url.add
      }
      params.costId = params.costId ? params.costId[0] : ''
      postAction(url, params).then((res) => {
        if (res.code == 200) {
          this.$message.success(this.title + '成功')
          this.$emit('change', true)
          this.handleCancel()
        }
      })
    },
    validateMobile(rule, value, callback) {
      if (!value) {
        callback('请输入联系电话')
      } else {
        if (new RegExp(/^[0-9\-]+$/).test(value)) {
          callback()
        } else {
          callback('请输入正确格式的手机号码或座机号码!')
        }
      }
    },
  },
}
</script>
<style lang='less' scoped>
</style>