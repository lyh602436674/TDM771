<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-02 10:45:28
 * @LastEditTime: 2021-09-06 17:32:56
 * @LastEditors: 陈乾龙
 * @Description: 数据自动备份弹窗组件
 * @FilePath: \hifar-platform-client\src\views\hifar\sys\scheduled\modules\ScheduledModal.vue
-->
<template>
  <div>
    <h-modal
      title="自动备份"
      inner
      :visible="visible"
      :getContainer="getContainer"
      :maskClosable="false"
      :confirmLoading="loading"
      destroyOnClose
      @cancel="handleCancel"
      @submit="handleSubmit"
    >
      <h-form v-model="model" ref="autoBackupForm" :column="1" :formData="formData" @change="submit" />
    </h-modal>
    <h-cron ref="HCron" @change="handleCronChange"></h-cron>
  </div>
</template>

<script>
import HCron from '@/components/HCron/HCron.vue'
import moment from 'moment'
import { postAction } from '@/api/manage'
export default {
  inject: {
    getContainer: {
      default: () => {
        return () => document.body
      },
    },
  },
  components: { HCron },
  data() {
    return {
      visible: false,
      loading: false,
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '任务名称',
          key: 'jobName',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入任务名称' }],
          },
        },
        {
          title: '任务类名',
          key: 'callService',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入任务类名' }],
          },
        },
        {
          title: 'Cron表达式',
          key: 'jobRule',
          component: (
            <a-input
              placeholder="Basic usage"
              onclick={() => {
                this.handleShowCron()
              }}
            >
              <h-icon slot="prefix" type="icon-shichang" />
            </a-input>
          ),
          validate: {
            rules: [{ required: true, message: '请输入Cron表达式' }],
            initialValue: '* * * * * ? *',
          },
        },
        {
          title: '启动时间',
          key: 'startTime',
          formType: 'datePick',
          showTime: true,
          format: 'YYYY-MM-DD HH:mm:ss',
        },
        {
          title: '描述',
          key: 'remarks',
          formType: 'textarea',
        },
      ],
      model: {},
      url: {
        edit: '/JobTimerTaskBusiness/modifyById',
        add: '/JobTimerTaskBusiness/add',
      },
    }
  },
  methods: {
    add() {
      this.edit()
    },
    edit(record = {}) {
      this.model = Object.assign({}, record)
      if (parseFloat(this.model.startTime)) {
        this.model.startTime = moment(parseFloat(this.model.startTime))
      } else {
        this.model.startTime = undefined
      }
      if (this.model.status) {
        this.model.status = parseInt(this.model.status)
      }
      this.$nextTick(() => {
        this.visible = true
      })
    },
    submit(values) {
      if (this.loading) return
      this.loading = true
      let params = {
        ...values,
      }
      let url = null
      if (values.startTime) {
        values.startTime = values.startTime.valueOf()
      }
      if (values.id) {
        url = this.url.edit
      } else {
        url = this.url.add
      }
      postAction(url, params)
        .then((res) => {
          if (res.code == 200) {
            this.$message.success(this.title + '成功')
            this.$emit('change', true)
            this.handleCancel()
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleSubmit() {
      this.$refs.autoBackupForm.validateForm()
    },
    handleShowCron() {
      this.$refs.HCron.show()
    },
    handleCancel() {
      this.model = {}
      this.visible = false
    },
    handleCronChange(v) {
      this.$refs.autoBackupForm.form.setFieldsValue({
        jobRule: v,
      })
    },
  },
}
</script>

<style>
</style>