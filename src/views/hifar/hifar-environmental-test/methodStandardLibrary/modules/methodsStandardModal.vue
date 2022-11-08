<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-04 13:55:18
 * @LastEditTime: 2021-12-10 19:25:15
 * @LastEditors: 赵文凯
 * @Description: 工作中心增改弹窗
 * @FilePath: \新建文件夹 (2)\tdm200-client\src\views\hifar\hifar-environmental-test\methodStandardLibrary\modules\methodsStandardModal.vue
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
    <h-form v-model="model" ref="workCenterForm" :width="600" :column="1" :formData="formData" @change="handleChange">
    </h-form>
  </h-modal>
</template>

<script>
import {postAction} from '@/api/manage'

export default {
  inject: ['getContainer'],
  data() {
    return {
      visible: false,
      title: '操作',
      loading: false,
      model: {},
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '方法名称',
          key: 'methodName',
          formType: 'input',
          placeholder: '请输入方法名称',
          validate: {rules: [{required: true, message: '请输入方法名称'}]},
        },
        {
          title: '方法编码',
          key: 'methodCode',
          formType: 'input',
          placeholder: '请输入方法编码',
          validate: {rules: [{required: true, message: '请输入方法编码'}]},
        },
        // {
        //   title: '状态',
        //   key: 'status',
        //   component: (
        //     <h-switch
        //       v-decorator={['status', {initialValue: '1'}]}
        //       checkedTxt="启用"
        //       uncheckedTxt="禁用"
        //       size="small"
        //       options={['1', '88']}
        //     />
        //   ),
        // },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
          autoSize: {minRows: 2},
          placeholder: '请输入备注信息',
        },
        {
          title: '排序号',
          key: 'rowSort',
          component: <a-input-number placeholder="请输入排序号" v-decorator={['rowSort', {initialValue: 1}]}/>,
        },
      ],
      url: {
        add: '/HfMethodStaLibBusiness/add',
        edit: '/HfMethodStaLibBusiness/modifyById',
      },
    }
  },
  methods: {
    show(record = {}, title) {
      this.visible = true
      this.title = title
      this.edit(record)
    },
    edit(record = {}) {
      this.model = Object.assign({}, record)
    },
    handleChange(values) {
      if (this.loading) return
      this.loading = true
      let url = null
      if (values.id) {
        url = this.url.edit
      } else {
        url = this.url.add
      }
      postAction(url, values)
        .then((res) => {
          if (res.code == 200) {
            this.$message.success(this.title + '成功')
            this.$emit('change')
            this.handleCancel()
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleSubmit() {
      this.$refs.workCenterForm.validateForm()
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style lang='less' scoped>
</style>