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
    :width="800"
  >
    <template slot="footer">
      <a-button type="danger" @click="handleCancel">关闭</a-button>
      <a-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</a-button>
    </template>
    <a-alert v-if="errorMessage" type="error" :message="errorMessage" banner/>
    <h-form v-model="model" ref="taskArrangementForm" :formData="formData" :column="2" @change="submit"/>
  </h-modal>
</template>

<script>
import moment from 'moment'
import {postAction} from '@/api/manage'
import PhemismUserSelect from '@/views/components/PhemismUserSelect'

const validatorFields = (cellValue, message, reg, callback) => {
  if (cellValue && !reg.test(cellValue)) {
    callback(message)
  } else {
    callback()
  }
}
// 整数-整数
// const regRange = /^-?\d+(-\d*[1-9]\d*)$/
// 浮点数或整数-浮点数或整数
const regRange = /^-?\d+(?:\.\d+)?-\d+(?:\.\d+)?$/
export default {
  components: {
    PhemismUserSelect,
  },
  computed: {
    formData() {
      return (() => {
        const speedFields = [];
        for (let i = 1; i <= 12; i++) {
          const field = {
            title: `加速度${i}`,
            key: `speed${i}`,
            formType: 'input',
            hidden: !this.model[`speed${i}`]
          };
          speedFields.push(field);
        }
        return [
          {
            key: 'taskId',
            hidden: true,
            formType: 'input',
          },
          {
            key: 'equipId',
            hidden: true,
            formType: 'input',
            span: 2,
          },
          {
            title: '试验设备',
            key: 'equipName',
            formType: 'text',
            span: 2,
          },
          {
            title: '预计开始时间',
            key: 'predictStartTime',
            span: 2,
            component: (
              <h-time-select
                v-decorator={['predictStartTime', {rules: [{required: true, message: '请选择预计开始时间'}]}]}
                timeFormat={"HH:mm"}
                // disabledDate={(current) => {
                //   return current && current < moment().subtract(1, 'day')
                // }}
                // disabledHours={() => {
                //   if (moment(this.selectedStartTime).get('date') === moment().get('date')) {
                //     return this.timeRange(0, 24).splice(0, moment().get('hour'))
                //   }
                // }}
                // disabledMinutes={() => {
                //   if (moment(this.selectedStartTime).get('date') === moment().get('date') &&
                //     moment(this.selectedStartTime).get('hour') === moment().get('hour')
                //   ) {
                //     return this.timeRange(0, 60).splice(0, moment().get('minute'))
                //   }
                // }}
                // disabledSeconds={() => {
                //   if (moment(this.selectedStartTime).get('date') === moment().get('date')) {
                //     return this.timeRange(0, 60).splice(0, moment().get('second'))
                //   }
                // }}
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
            formType: 'input-number',
            span: 2,
            min: 0,
            style: {width: '100%'},
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
                return equip.id === equipId
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
            span: 2,
            component: (
              <phemism-user-select
                ref="PhemismUserSelect"
                type={'checkbox'}
                title={'请选择试验员'}
                customUrl={'/HfPrjWorkCenterUserBusiness/listPageUserByRoleCode'}
                customQueryParams={{roleCode: 'technician'}}
                v-decorator={['chargeUserId']}
                selectedName={this.model.idName}
                onchange={this.selectuserChange}
              />
            ),
          },
          {
            title: '设备速率',
            key: 'testRate',
            formType: 'input',
            hidden: !this.model.testRate,
            validate: {
              rules: [
                {
                  validator: (rule, value, callback) => {
                    return validatorFields(value, '请输入正确格式的设备速率，例：1-100', regRange, callback)
                  },
                },
              ],
            },
          },
          {
            title: '温度范围',
            key: 'temperatureRange',
            formType: 'input',
            hidden: !this.model.temperatureRange,
            validate: {
              rules: [
                {
                  validator: (rule, value, callback) => {
                    return validatorFields(value, '请输入正确格式的温度范围，例：1-100', regRange, callback)
                  },
                },
              ],
            },
          },
          {
            title: '湿度范围',
            key: 'humidityRange',
            formType: 'input',
            hidden: !this.model.humidityRange,
            validate: {
              rules: [
                {
                  validator: (rule, value, callback) => {
                    return validatorFields(value, '请输入正确格式的湿度范围，例：1-100', regRange, callback)
                  },
                },
              ],
            },
          },
          {
            title: '压力范围',
            key: 'pressureRange',
            formType: 'input',
            hidden: !this.model.pressureRange,
            validate: {
              rules: [
                {
                  validator: (rule, value, callback) => {
                    return validatorFields(value, '请输入正确格式的压力范围，例：1-100', regRange, callback)
                  },
                },
              ],
            },
          },
          ...speedFields,
          {
            title: '备注',
            key: 'remarks',
            formType: 'textarea',
            span: 2
          },
        ]
      })()
    }
  },
  data() {
    return {
      visible: false,
      submitLoading: false,
      model: {},
      name: '',
      errorMessage: null,
      taskPlanSelectedRows: [],
      url: {
        distribute: '/HfEnvTaskTestBusiness/distributeTask',
        beforeDistributeTask: '/HfEnvTaskTestBusiness/beforeDistributeTask',
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
      this.$refs.taskArrangementForm.validateForm()
    },
    async beforeDistributeTask(params) {
      const res = await postAction(this.url.beforeDistributeTask, params)
      if (res.code === 200) {
        if (res.msg) {
          return res.msg
        }
        return true
      }
    },
    distributeTask(params) {
      postAction(this.url.distribute, params).then((res) => {
        if (res.code === 200) {
          this.$message.success('分配成功')
          this.$emit('change', res.data)
          this.handleCancel()
        } else {
          this.$message.warning(res.msg)
        }
      }).finally(() => {
        this.submitLoading = false
      })
    },
    submit(values) {
      if (this.submitLoading) return
      this.submitLoading = true
      let params = {
        ...values,
      }
      params.chargeUserId = params.chargeUserId && params.chargeUserId.toString()
      params.predictStartTime = moment(params.predictStartTime).valueOf()
      this.beforeDistributeTask(params).then(res => {
        if (res !== true) {
          this.$confirm({
            title: "提示",
            content: res,
            onOk: () => {
              this.distributeTask(params)
            },
            onCancel: () => {
              this.submitLoading = false
            }
          })
        } else {
          this.distributeTask(params)
        }
      })
      //   .catch(err => {
      //   this.submitLoading = false
      // }).finally(() => {
      //   this.submitLoading = false
      // })
    },
  },
}
</script>

<style>
</style>
