<template>
  <a-modal
    cancelText="关闭"
    wrapClassName="ant-modal-cust-warp"
    style="top: 5%; height: 85%; overflow-y: hidden"
    :title="title"
    :width="600"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item label="角色名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['roleName', validatorRules.roleName]" placeholder="请输入角色名称" />
        </a-form-item>
        <a-form-item label="角色编码" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input
            v-decorator="['roleCode', validatorRules.roleCode]"
            placeholder="请输入角色编码"
            :disabled="roleDisabled"
          />
        </a-form-item>

        <a-form-item label="描述" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea v-decorator="['remarks', validatorRules.description]" placeholder="请输入角色描述" :rows="5" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'
import { addRole, editRole } from '@/api/api'

export default {
  name: 'RoleModal',
  data() {
    return {
      title: '操作',
      visible: false,
      roleDisabled: false,
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
      form: this.$form.createForm(this),
      validatorRules: {
        roleName: {
          rules: [
            { required: true, message: '请输入角色名称!' },
            { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' },
          ],
        },
        roleCode: {
          rules: [
            { required: true, message: '请输入角色名称!' },
            { min: 0, max: 64, message: '长度不超过 64 个字符', trigger: 'blur' },
            { validator: this.validateRoleCode },
          ],
        },
        description: {
          rules: [{ min: 0, max: 126, message: '长度不超过 126 个字符', trigger: 'blur' }],
        },
      },
      fieldKeys: ['roleName', 'roleCode', 'remarks'],
    }
  },
  created() {},
  methods: {
    add() {
      this.edit({})
    },
    edit(record) {
      this.form.resetFields()
      this.model = Object.assign({}, record)
      this.visible = true

      //编辑页面禁止修改角色编码
      if (this.model.id) {
        this.roleDisabled = true
      } else {
        this.roleDisabled = false
      }
      this.$nextTick(() => {
        this.form.setFieldsValue(pick(this.model, this.fieldKeys))
      })
    },
    close() {
      this.$emit('close')
      this.visible = false
    },
    handleOk() {
      const that = this
      // 触发表单验证
      this.form.validateFields(async (err, values) => {
        if (!err) {
          that.confirmLoading = true
          values.roleName = (values.roleName || '').trim()
          values.roleCode = (values.roleCode || '').trim()
          let formData = Object.assign(this.model, values)
          let response = null
          console.log(formData)
          if (!this.model.id) {
            response = await addRole(formData)
          } else {
            response = await editRole(formData)
          }
          if (response.code == 200) {
            this.$message.success(this.title + '成功')
            this.$emit('ok')
            this.close()
          } else {
            this.$message.warning(response.msg)
          }
          this.confirmLoading = false
        }
      })
    },
    handleCancel() {
      this.close()
    },
    validateRoleCode(rule, value, callback) {
      if (/[\u4E00-\u9FA5]/g.test(value)) {
        callback('角色编码不可输入汉字!')
      } else {
        var params = {
          tableName: 'sys_role',
          fieldName: 'role_code',
          fieldVal: value,
          dataId: this.model.id,
        }
        callback()
        // duplicateCheck(params).then((res) => {
        //   if (res.success) {
        //     callback()
        //   } else {
        //     callback(res.message)
        //   }
        // })
      }
    },
  },
}
</script>

<style scoped>
</style>