<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-28 17:42:49
 * @LastEditTime: 2021-11-26 18:50:48
 * @LastEditors: 马潭龙
 * @Description:开始试验弹窗
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\TaskStartModal.vue
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
    <h-form ref="taskStartForm" v-model="model" :column="1" :formData="formData" @change="submitForm"/>
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
          title: '开始时间',
          key: 'optTime',
          validate: {rules: [{required: true, message: '请设置试验开始时间'}]},
          component: (
            <h-time-select v-decorator={['optTime', {rules: [{required: true, message: '请设置试验开始时间'}]}]}/>
          ),
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
        },
      ],
      url: {
        start: '/HfEnvTaskTestBusiness/start',
      },
    }
  },
  methods: {
    show(type, record) {
      this.model = Object.assign({}, record)
      this.type = type
      this.title = '启动：' + record.testNames
      this.model.optTime = moment()
      this.$nextTick(() => {
        this.visible = true
      })
    },
    handleCancel() {
      this.visible = false
    },
    handleSubmit() {
      this.$refs.taskStartForm.validateForm()
    },
    submitForm(values) {
      let params = {
        ...values,
      }
      params.optTime = params.optTime.valueOf()
      postAction(this.url.start, params).then((res) => {
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