<!--
 * @Author: 陈乾龙
 * @Date: 2021-11-12 17:17:54
 * @LastEditTime: 2021-11-25 11:56:51
 * @LastEditors: 赵峰
 * @Description: 设备安排任务表单弹窗
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\TaskArrangementFormModal.vue
-->
<template>
  <h-modal
    ref="TaskArrangementFormModal"
    title=" 试验安排"
    destroyOnClose
    :visible="visible"
    @cancel="handleCancel"
  >
    <template slot="footer">
      <a-button @click="handleCancel" type="ghost-error">关闭</a-button>
      <a-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</a-button>
    </template>
    <a-alert v-if="errorMessage" type="error" :message="errorMessage" banner/>
    <h-form v-model="model" ref="taskArrangementForm" :formData="formData" :column="1" @change="submit"/>
  </h-modal>
</template>

<script>
import moment from 'moment'
import {postAction} from '@/api/manage'
import PhemismUserSelect from '@/views/components/PhemismUserSelect'

export default {
  components: {
    PhemismUserSelect,
  },
  // provide() {
  //   return {
  //     centerId: () => this.centerId
  //   }
  // },
  data() {
    return {
      visible: false,
      submitLoading: false,
      model: {},
      name: '',
      centerId: 'hello',
      errorMessage: null,
      formData: [
        {
          key: 'taskId',
          hidden: true,
          formType: 'input',
        },
        {
          key: 'equipId',
          hidden: true,
          formType: 'input',
        },
        {
          title: '试验设备',
          key: 'equipName',
          formType: 'text',
        },
        {
          title: '预计开始时间',
          key: 'predictStartTime',
          component: (
            <h-time-select
              v-decorator={['predictStartTime', {rules: [{required: true, message: '请选择预计开始时间'}]}]}
              timeFormat={"HH:mm"}
              disabledDate={(current) => {
                return current && current < moment().subtract(1, 'day')
              }}
              disabledHours={() => {
                if (moment(this.selectedStartTime).get('date') === moment().get('date')) {
                  return this.timeRange(0, 24).splice(0, moment().get('hour'))
                }
              }}
              disabledMinutes={() => {
                if (moment(this.selectedStartTime).get('date') === moment().get('date') &&
                  moment(this.selectedStartTime).get('hour') === moment().get('hour')
                ) {
                  return this.timeRange(0, 60).splice(0, moment().get('minute'))
                }
              }}
              disabledSeconds={() => {
                if (moment(this.selectedStartTime).get('date') === moment().get('date')) {
                  return this.timeRange(0, 60).splice(0, moment().get('second'))
                }
              }}
              onchange={(predictStartTime) => {
                this.selectedStartTime = predictStartTime
                let {equipId, predictUseTime} = this.$refs.taskArrangementForm.form.getFieldsValue()
                if (!equipId) return
                let selectedEquip = find(this.equipList, (equip) => {
                  return equip.id === equipId
                })
                if (!selectedEquip) return
                let checkValid = selectedEquip.checkValid
                let startTime = moment(predictStartTime.valueOf()).add(parseFloat(predictUseTime), 'h').valueOf()
                if (startTime > parseFloat(checkValid)) {
                  this.errorMessage = '试验时长超过了设备计量有效期时间，试验数据可能无效'
                  return
                }
                this.errorMessage = null
              }}
            />
          ),
          validate: {
            rules: [
              {
                required: true,
                message: '请选择预计开始时间',
              },
            ],
          },
        },
        {
          title: '预计时长(h)',
          key: 'predictUseTime',
          formType: 'input',
          type: 'number',
          validate: {
            rules: [
              {
                required: true,
                message: '请输入预计时长',
              },
            ],
          },
          change: (predictUseTime) => {
            let {equipId, predictStartTime} = this.$refs.taskArrangementForm.form.getFieldsValue()
            if (!equipId) return
            let selectedEquip = find(this.equipList, (equip) => {
              return equip.id == equipId
            })
            if (!selectedEquip) return
            let checkValid = selectedEquip.checkValid
            let startTime = moment(predictStartTime.valueOf()).add(parseFloat(predictUseTime), 'h').valueOf()
            if (startTime > parseFloat(checkValid)) {
              this.errorMessage = '试验时长超过了设备检定有效期时间，试验数据可能无效'
              return
            }
            this.errorMessage = null
          },
        },
        {
          title: '试验员',
          key: 'chargeUserId',
          formType: 'input',
          component: (
            <phemism-user-select
              ref="PhemismUserSelect"
              type={'checkbox'}
              placeholder={'请选择试验员'}
              v-decorator={['chargeUserId']}
              selectedName={() => {
                return this.model.idName
              }}
              onchange={this.selectuserChange}
            />
          ),
        },
        {
          title: '设备速率',
          key: 'testRate',
          formType: 'input-number',
          style: {
            width: "100%"
          }
        },

        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
        },
      ],
      url: {
        distribute: '/HfEnvTaskTestBusiness/distributeTask',
      },
    }
  },
  methods: {
    moment,
    timeRange(start, end) {
      let result = []
      for (let i = start; i < end; i++) {
        result.push(i)
      }
      return result
    },
    show(record) {
      this.model = Object.assign({}, record)
      this.visible = true
      // this.centerId = record.workId
    },
    handleCancel() {
      this.visible = false
      setTimeout(() => {
        this.submitLoading = false
      }, 300)
    },
    selectuserChange(val, record) {
      // this.model.idName = record[0].idName
      // 由单选改为多选
      this.model.idName = record.map(item => item.idName).toString()
    },
    handleSubmit() {
      this.submitLoading = true
      this.$refs.taskArrangementForm.validateForm()
    },
    submit(values, res) {
      if (!this.submitLoading) return
      let params = {
        ...values,
      }
      params.chargeUserId = params.chargeUserId && params.chargeUserId.toString()
      params.predictStartTime = moment(params.predictStartTime).valueOf()
      postAction(this.url.distribute, params).then((res) => {
        if (res.code == 200) {
          if (res.msg && res.msg.includes('error')) {
            this.$confirm({
              title: "提示",
              content: '是否推迟其他任务？',
              onOk: () => {
                params.confirm = 1
                postAction(this.url.distribute, params).then((res) => {
                  if (res.code === 200) {
                    this.$message.success('分配成功')
                    this.$emit('change', res.data)
                    this.handleCancel()
                  }
                })
              },
              onCancel: () => {
                this.submitLoading = false
              }
            })
          } else {
            this.$message.success('分配成功')
            this.$emit('change', res.data)
            this.handleCancel()
          }
        } else {

        }
      }).finally(() => {

      })
    },
  },
}
</script>

<style>
</style>
