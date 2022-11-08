<!--
 * @Author: 陈乾龙
 * @Date: 2021-05-26 13:36:01
 * @LastEditTime: 2021-09-01 17:48:41
 * @LastEditors: 陈乾龙
 * @Description: 部门基本信息表单弹窗
 * @FilePath: \hifar-platform-client\src\views\components\modules\DepartInfoModal.vue
-->
<template>
  <a-modal :visible="visible" @cancel="emptyCurrForm">
    <a-form :form="form">
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="机构名称">
        <a-input placeholder="请输入机构/部门名称" v-decorator="['departName', validatorRules.departName]" />
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="上级部门">
        <a-tree-select
          v-decorator="['parentId']"
          placeholder="无"
          style="width: 100%"
          :dropdownStyle="{ maxHeight: '200px', overflow: 'auto' }"
          :treeData="treeData"
          :disabled="disable"
        >
        </a-tree-select>
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="机构编码">
        <a-input disabled placeholder="请输入机构编码" v-decorator="['orgCode', validatorRules.orgCode]" />
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="机构类型">
        <template v-if="orgCategoryDisabled">
          <a-radio-group v-decorator="['orgCategory', validatorRules.orgCategory]" placeholder="请选择机构类型">
            <a-radio value="1"> 公司 </a-radio>
          </a-radio-group>
        </template>
        <template v-else>
          <a-radio-group v-decorator="['orgCategory', validatorRules.orgCategory]" placeholder="请选择机构类型">
            <a-radio value="2"> 部门 </a-radio>
            <a-radio value="3"> 岗位 </a-radio>
          </a-radio-group>
        </template>
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="排序">
        <a-input-number v-decorator="['departOrder', { initialValue: 0 }]" />
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="手机号">
        <a-input placeholder="请输入手机号" v-decorator="['mobile', { initialValue: '' }]" />
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="地址">
        <a-input placeholder="请输入地址" v-decorator="['address', { initialValue: '' }]" />
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="备注">
        <a-textarea placeholder="请输入备注" v-decorator="['memo', { initialValue: '' }]" />
      </a-form-item>
    </a-form>
    <div class="anty-form-btn" slot="footer">
      <a-button @click="emptyCurrForm" type="default" htmlType="button" icon="sync">重置</a-button>
      <a-button @click="submitCurrForm" type="primary" htmlType="button" icon="form">保存</a-button>
    </div>
  </a-modal>
</template>

<script>
import { httpAction } from '@/api/manage'
export default {
  props: {
    treeData: {
      type: Array,
      default: () => [],
    },
  },
  // 定义属性
  data() {
    return {
      visible: false,

      model: {},
      disable: false,
      orgCategoryDisabled: false,
      validatorRules: {
        departName: { rules: [{ required: true, message: '请输入机构/部门名称!' }] },
        orgCode: { rules: [{ required: true, message: '请输入机构编码!' }] },
        orgCategory: { rules: [{ required: true, message: '请输入机构类型!' }] },
        mobile: { rules: [{ validator: this.validateMobile }] },
      },
      form: null,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      url: {
        edit: '/sys/sysDepart/edit',
      },
    }
  },
  // 方法集合
  methods: {
    edit(record = {}) {
      this.model = record
      console.log(this.model)
      this.form = this.$form.createForm(this, {
        name: 'departInfoForm',
        mapPropsToFields: () => {
          return {
            departName: this.$form.createFormField({
              value: record.departName,
            }),
            parentId: this.$form.createFormField({
              value: record.parentId,
            }),
            orgCategory: this.$form.createFormField({
              value: record.orgCategory,
            }),
            orgCode: this.$form.createFormField({
              value: record.orgCode,
            }),
            departOrder: this.$form.createFormField({
              value: record.departOrder,
            }),
            mobile: this.$form.createFormField({
              value: record.mobile,
            }),
            fax: this.$form.createFormField({
              value: record.fax,
            }),
            address: this.$form.createFormField({
              value: record.address,
            }),
            memo: this.$form.createFormField({
              value: record.memo,
            }),
          }
        },
      })
      this.visible = true
    },
    emptyCurrForm() {
      this.form.resetFields()
      this.visible = false
    },
    submitCurrForm() {
      this.form.validateFields((err, values) => {
        if (!err) {
          if (!this.model.id) {
            this.$message.warning('请点击选择要修改部门!')
            return
          }

          let formData = Object.assign(this.model, values)
          console.log('Received values of form: ', formData)
          httpAction(this.url.edit, formData, 'put').then((res) => {
            if (res.success) {
              this.$message.success('保存成功!')
              this.$emit('change', true)
              this.emptyCurrForm()
            } else {
              this.$message.error(res.message)
            }
          })
        }
      })
    },
  },
}
</script>

<style lang='less' scoped>
</style>