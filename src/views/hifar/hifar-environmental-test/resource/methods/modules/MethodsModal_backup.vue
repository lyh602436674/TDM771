<!--
 * @Author: 陈乾龙
 * @Date: 2021-07-29 09:52:21
 * @LastEditTime: 2021-08-25 15:41:35
 * @LastEditors: 赵峰
 * @Description: 方法的新增修改弹窗
 * @FilePath: \hifar-platform-client\src\views\hifar\resource\methods\modules\MethodsModal.vue
-->
<template>
  <a-modal
    :title="title"
    :visible="visible"
    :width="drawerWidth"
    :confirm-loading="confirmLoading"
    @ok="handleClickSubmit"
    @cancel="handleCancel"
  >
    <h-form
      ref="methodsForm"
      v-if="visible"
      v-model="model"
      :width="drawerWidth - 48"
      :formData="formData"
      :column="2"
      @change="submitHandle"
    ></h-form>
  </a-modal>
</template>

<script>
import moment from 'moment'
import { getAction, postAction } from '@/api/manage'
export default {
  components: {},
  data() {
    return {
      moment,
      visible: false,
      confirmLoading: false,
      drawerWidth: 800,
      model: {},
      title: '新增',
      url: {
        add: '/HfResStandardBusiness/add',
        edit: '/HfResStandardBusiness/modifyById',
      },
      formData: [],
      customFormData: [
        // 标准方法
        [
          {
            key: 'id',
            formType: 'input',
            hidden: true,
          },
          {
            title: '方法分类',
            key: 'standardFlag',
            formType: 'radio',
            radioType:'radioButton',
            options: [
              { title: '标准方法', value: 1, key: 1 },
              { title: '非标准方法', value: 2, key: 2 },
            ],
            span: 2,
            change: (v) => {
              this.changeType(v)
            },
            validate: {
              rules: [{ required: true, message: '请选择方法分类'}],
            },
          },
          {
            title: '方法类型',
            key: 'standardTypeCode',
            formType: 'dict',
            dictCode:'hf_res_standard_type',
            validate: {
              rules: [{ required: true, message: '请选择方法类型'}],
            },
            change:(val,option) =>{
              this.$refs.methodsForm.form.setFieldsValue({standardTypeName:option.title})
            }
          },
          {
            title: '',
            key: 'standardTypeName',
            formType: 'input',
            hidden:true
          },
          {
            title: '方法编号',
            key: 'standardCode',
            formType: 'input',
            validate: {
              rules: [{ required: true, message: '请输入方法编号'}],
            },
          },
          {
            title: '方法名称',
            key: 'standardName',
            formType: 'input',
            validate: {
              rules: [{ required: true, message: '请输入方法名称'}],
            },
          },
          {
            title: '发布日期',
            key: 'publishTime',
            formType: 'datePick',
          },
          {
            title: '发布机构',
            key: 'publishOrg',
            formType: 'input',
          },
          {
            title: '使用日期',
            key: 'useTime',
            formType: 'datePick',
          },
          {
            title: '备注',
            key: 'remarks',
            formType: 'textarea',
            span: 2,
          },
        ],
        // 非标准方法
        [
          {
            key: 'id',
            formType: 'input',
            hidden: true,
          },
          {
            title: '方法分类',
            key: 'standardFlag',
            formType: 'radio',
            radioType:'radioButton',
            options: [
              { title: '标准方法', value: 1, key: 1 },
              { title: '非标准方法', value: 2, key: 2 },
            ],
            span: 2,
            change: (v) => {
              this.changeType(v)
            },
            validate: {
              rules: [{ required: true, message: '请选择方法分类'}],
            },
          },
          {
            title: '方法名称',
            key: 'standardName',
            formType: 'input',
            validate: {
              rules: [{ required: true, message: '请输入方法名称'}],
            },
          },
          {
            title: '方法编号',
            key: 'standardCode',
            formType: 'input'
          },
          {
            title: '发布日期',
            key: 'publishTime',
            formType: 'datePick',
          },
          {
            title: '方法来源',
            key: 'source',
            formType: 'input'
          },
          {
            title: '适用范围',
            key: 'scope',
            formType: 'input',
          },
          {
            title: '检测依据',
            key: 'basis',
            formType: 'input',
          },
          {
            title: '备注',
            key: 'remarks',
            formType: 'textarea',
            span: 2,
          },
        ]
      ],
    }
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    show(record, title) {
      this.title = title
      this.editor(record)
      this.visible = true
    },
    editor(record){
        let obj= Object.assign({}, record)
        obj.publishTime = obj.publishTime && obj.publishTime != 0 ? moment(parseFloat(obj.publishTime)) :''
        obj.useTime = obj.useTime && obj.useTime != 0 ? moment(parseFloat(obj.useTime)) :''
        obj.standardFlag = obj.standardFlag ? obj.standardFlag : undefined
        obj.standardTypeCode = obj.standardTypeCode ? obj.standardTypeCode : undefined
        this.model = obj
        if (!this.model.standardFlag || this.model.standardFlag == undefined) {
          this.model.standardFlag = 1
        }
        let formData = this.customFormData[Number(this.model.standardFlag) - 1]
        this.formData = formData
    },
    handleClickSubmit() {
      this.$refs.methodsForm.validateForm()
    },
    // 提交
    submitHandle(values) {
      if (this.confirmLoading) return
      this.confirmLoading = false
      let params = {
        ...values,
      }
      let url = null
      if (params.standardFlag == 1) {
        if (params.id) {
          url = this.url.edit
        } else {
          url = this.url.add
        }
        params.useTime = params.useTime && params.useTime != 0 ? params.useTime.valueOf(): ''
        params.publishTime = params.publishTime && params.publishTime != 0 ? params.publishTime.valueOf(): ''
        postAction(url, params).then((res) => {
          if (res.code == 200) {
            this.$message.success(this.title + '成功')
            this.$emit('ok', true)
            this.handleCancel()
          }
        })
      } else if (params.standardFlag == 2) {
        if (params.id) {
          url = this.url.edit
        } else {
          url = this.url.add
        }
        params.publishTime = params.publishTime && params.publishTime != 0 ? params.publishTime.valueOf(): ''
        postAction(url, params).then((res) => {
          if (res.code == 200) {
            this.$message.success(this.title + '成功')
            this.$emit('ok', true)
            this.handleCancel()
          }
        })
      }
    },
    handleCancel(e) {
      this.visible = false
      this.templateInfo = {}
    },
    // 标准分类切换
    changeType(v) {
      this.model = Object.assign({}, this.model, { standardFlag: v })
      let formData = this.customFormData[Number(this.model.standardFlag) - 1]
      this.formData = formData
    },
  },
}
</script>

<style lang='less' scoped>
</style>