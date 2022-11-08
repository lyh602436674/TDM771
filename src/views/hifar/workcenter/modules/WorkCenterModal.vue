<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-04 13:55:18
 * @LastEditTime: 2021-08-11 13:41:51
 * @LastEditors: 陈乾龙
 * @Description: 工作中心增改弹窗
 * @FilePath: \hifar-platform-client\src\views\hifar\workcenter\modules\WorkCenterModal.vue
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
    <h-form v-model="model" ref="workCenterForm" :width="600" :column="2" :formData="formData" @change="handleChange">
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
          title: '工作中心',
          key: 'workName',
          formType: 'input',
          placeholder: '请输入工作中心名称',
          validate: {rules: [{required: true, message: '请输入工作中心名称'}]},
        },
        {
          title: '状态',
          key: 'status',
          component: (
            <h-switch
              v-decorator={['status', {initialValue: '1'}]}
              checkedTxt="启用"
              uncheckedTxt="禁用"
              // size="small"
              style={{marginTop: "4px"}}
              options={['1', '88']}
            />
          ),
        },

        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
          span: 2,
          placeholder: '请输入备注信息',
        },
        {
          title: '排序号',
          key: 'rowSort',
          span: 2,
          component: <a-input-number placeholder="请输入排序号" v-decorator={['rowSort', {initialValue: 1000}]}/>,
        },
      ],
      url: {
        add: '/HfPrjWorkCenterBusiness/add',
        edit: '/HfPrjWorkCenterBusiness/modifyById',
      },
    }
  },
  methods: {
    add(record = {}) {
      this.edit(record)
    },
    edit(record = {}) {
      this.model = Object.assign({}, record)
      this.visible = true
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
        .finally((res) => {
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