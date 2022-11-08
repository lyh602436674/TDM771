<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-28 17:42:49
 * @LastEditTime: 2021-11-08 16:27:26
 * @LastEditors: 赵峰
 * @Description: 完成试验弹窗
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\TaskFinishedModal.vue
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
    <h-form ref="taskSuspendForm" v-model="model" :column="1" :formData="formData" @change="submitForm"/>
  </h-modal>
</template>

<script>
import moment from 'moment'
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
      title: '',
      visible: false,
      model: {},
      type: null,
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '完成时间',
          key: 'optTime',
          validate: {rules: [{required: true, message: '请设置试验完成时间'}]},
          component: (
            <h-time-select v-decorator={['optTime', {rules: [{required: true, message: '请设置试验完成时间'}]}]}/>
          ),
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
        },
      ],
      url: {
        finish: '/HfEnvTaskTestBusiness/finish',
      },
    }
  },
  methods: {
    show(type, record) {
      this.model = Object.assign({}, record)
      this.type = type
      this.title = '完成：' + record.testNames
      this.model.optTime = moment()
      this.$nextTick(() => {
        this.visible = true
      })
    },
    handleCancel() {
      this.visible = false
    },
    handleSubmit() {
      this.$refs.taskSuspendForm.validateForm()
    },
    submitForm(values) {
      let params = {
        ...values,
      }
      params.optTime = params.optTime.valueOf()
      postAction(this.url.finish, params).then((res) => {
        if (res.code === 200) {
          this.handleCancel()
          this.$emit('change', this.type, params)
        } else {
          this.$message.warning(res.msg)
        }
      })
    },
  },
}
</script>

<style>
</style>