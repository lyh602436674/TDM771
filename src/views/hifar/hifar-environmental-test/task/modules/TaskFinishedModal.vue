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
    :confirmLoading="loading"
    destroyOnClose
    inner
    width="80%"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <a-spin :spinning="loading">
      <h-desc
        :data="model"
        lableWidth="110px"
        style="margin: 0 0 20px 0"
        title="适用计费准备详情">
        <h-desc-item label="试验项目">{{ model.unitName || '--' }}</h-desc-item>
        <h-desc-item label="试验设备(设备编号)">{{ `${model.equipName}(${model.equipCode})` || '--' }}</h-desc-item>
        <h-desc-item label="温度范围">{{ model.temperatureRange || '--' }}</h-desc-item>
        <h-desc-item label="湿度">{{ model.humidityRange || '--' }}</h-desc-item>
        <h-desc-item label="压力">{{ model.pressureRange || '--' }}</h-desc-item>
        <h-desc-item label="加速度">{{ model.accelerationRange || '--' }}</h-desc-item>
        <h-desc-item label="开机费">
          {{ model.startupCost || '--' }}
        </h-desc-item>
        <h-desc-item label="折扣">{{ model.discount || '--' }}</h-desc-item>
        <h-desc-item label="标准单价">
          {{ model.unitPrice || '--' }}
        </h-desc-item>
        <h-desc-item label="折扣单价">
          {{ model.discountUnitPrice || '--' }}
        </h-desc-item>
        <h-desc-item label="客户折扣">
          {{ model.customDiscount || '--' }}
        </h-desc-item>
      </h-desc>
      <h-card class="cost-type" title="计费方式">
        <a-radio-group v-model="radioValue" @change="handleRadioChange">
          <a-radio style="display:block" value="1">
            <h-form ref="taskForm1" v-model="model" :column="2" :formData="formData1"/>
          </a-radio>
          <a-radio style="display:block" value="2">
            <h-form ref="taskForm2" v-model="model" :column="1" :formData="formData2"/>
          </a-radio>
        </a-radio-group>
      </h-card>
      <h-form ref="taskForm3" v-model="model" :column="1" :formData="formData3"/>
    </a-spin>
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
      title: '试验完成确认',
      radioValue: '1',
      visible: false,
      loading: false,
      model: {},
      type: null,
      formData1: [
        {
          title: '入场时间',
          key: 'approachTime',
          component: (
            <h-time-select
              disabled={true}
              v-decorator={['approachTime']}
            />
          )
        },
        {
          title: '离场时间',
          key: 'departureTime',
          component: (
            <h-time-select disabled={true} v-decorator={['departureTime']}/>
          )
        },
        {
          title: '开始时间',
          key: 'realStartTime',
          component: (
            <h-time-select disabled={true} v-decorator={['realStartTime']}/>
          )
        },
        {
          title: '结束时间',
          key: 'realEndTime',
          validate: {rules: [{required: true, message: '请选择结束时间'}, {validator: this.validateEndTime}]},
          component: (
            <h-time-select
              v-decorator={
                [
                  'realEndTime',
                  {
                    rules: [{
                      required: true,
                      message: '请选择结束时间'
                    }]
                  }
                ]
              }
              onChange={(val) => {
                let form1 = this.$refs.taskForm1.form
                let form3 = this.$refs.taskForm3.form
                let {discountUnitPrice, unitPrice, startupCost, customDiscount} = this.model
                let startTime = form1.getFieldsValue().realStartTime
                let startTimeVal = startTime ? moment(startTime).valueOf() : 0
                let endTime = val ? val.valueOf() : 0
                let diff = this.getTimeDiff(startTimeVal, endTime)
                form1.setFieldsValue({realUseTime: diff || 0})
                if (this.radioValue === '1' && diff && this.isNumberEqual(unitPrice) && this.isNumberEqual(startupCost)) {
                  form3.setFieldsValue({
                    // 标准总价 = 时长 * 标准单价 + 开机费
                    standardTotalPrice: (diff * unitPrice + +startupCost) || undefined,
                  })
                  if (this.isNumberEqual(discountUnitPrice) && this.isNumberEqual(customDiscount)) {
                    form3.setFieldsValue({
                      // 折后总价 = (时长 * (折后单价 || 标准单价) * 客户折扣) + 开机费
                      totalExpenses: (((diff * (discountUnitPrice || unitPrice)) * customDiscount) + +startupCost) || undefined,
                    })
                  }
                } else {
                  form3.setFieldsValue({standardTotalPrice: undefined, totalExpenses: undefined})
                }
              }}
            />
          )
        },
        {
          title: '时长',
          key: 'realUseTime',
          formType: 'input',
          readOnly: true,
          placeholder: '自动计算'
        },
      ],
      formData2: [
        {
          title: '向次',
          key: 'testSecondary',
          formType: 'input-number',
          min: 0,
          style: {width: '100%',},
          change: (val) => {
            let {discountUnitPrice, unitPrice, startupCost, customDiscount} = this.model
            if (this.radioValue === '2' && this.isNumberEqual(val) && this.isNumberEqual(unitPrice) && this.isNumberEqual(startupCost)) {
              let form3 = this.$refs.taskForm3.form
              form3.setFieldsValue({
                // 标准总价 = 向次 * 标准单价 + 开机费
                standardTotalPrice: (val * unitPrice + +startupCost) || undefined,
              })
              if (this.isNumberEqual(discountUnitPrice) && this.isNumberEqual(customDiscount)) {
                form3.setFieldsValue({
                  // 折后总价 = (向次 * (折后单价 || 标准单价) * 客户折扣) + 开机费
                  totalExpenses: (((val * (discountUnitPrice || unitPrice)) * customDiscount) + +startupCost) || undefined,
                })
              }
            }
          }
        },
      ],
      formData3: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '标准总价',
          key: 'standardTotalPrice',
          validate: {
            rules: [
              {
                required: true,
                message: ''
              },
              {
                validator: (rule, value, cb) => {
                  if (!this.isNumberEqual(value)) {
                    cb('请输入正确格式的标准总价')
                  } else {
                    cb()
                  }
                }
              }
            ],
          },
          component: (
            <a-input-search
              v-decorator={['standardTotalPrice', {
                rules: [{
                  required: true,
                  message: ''
                }],
              }, {initialValue: undefined}]}
              placeholder={"根据计费方式自动计算"} onSearch={this.calcTotalCost}>
              <a-button type="primary" icon={'redo'} slot="enterButton">
                重置
              </a-button>
            </a-input-search>
          ),
        },
        {
          title: '折后总价',
          key: 'totalExpenses',
          validate: {
            rules: [
              {
                required: true,
                message: ''
              },
              {
                validator: (rule, value, cb) => {
                  if (!this.isNumberEqual(value)) {
                    cb('请输入正确格式的折后总价')
                  } else {
                    cb()
                  }
                }
              }
            ],
          },
          component: (
            <a-input-search
              v-decorator={['totalExpenses', {
                rules: [{
                  required: true,
                  message: ''
                }],
              }, {initialValue: undefined}]}
              placeholder={"根据计费方式自动计算"} onSearch={this.calcTotalCost}>
              <a-button type="primary" icon={'redo'} slot="enterButton">
                重置
              </a-button>
            </a-input-search>
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
        calcCost: "/HfEnvTaskTestBusiness/costCalculation",
      },
    }
  },
  methods: {
    show(type, record) {
      this.loading = true
      this.model = Object.assign({}, record, {
        approachTime: this.dateFormat(record.approachTime),
        departureTime: this.dateFormat(record.departureTime),
        realStartTime: this.dateFormat(record.realStartTime),
        realEndTime: this.dateFormat(record.realEndTime),
      })
      this.type = type
      this.getCalcCost(record)
    },
    dateFormat(time) {
      return time && +time !== 0 ? moment(+time).format('YYYY-MM-DD HH:mm:ss') : undefined
    },
    getCalcCost(record) {
      postAction(this.url.calcCost, {id: record.id}).then(res => {
        if (res.code === 200) {
          const {data} = res
          this.model = Object.assign({}, this.model, data)
          if (res.msg) {
            this.$message.warning(res.msg)
          }
          this.visible = true
          this.$nextTick(() => {
            this.calcTotalCost()
          })
        } else {
          this.$message.warning(res.msg)
        }
      }).finally(() => {
        this.loading = false
      })
    },
    handleRadioChange(e) {
      this.radioValue = e.target.value
      this.calcTotalCost()
    },
    isNumberEqual(value) {
      return !isNaN(Number(value)) && value !== '' && value >= 0
    },
    calcTotalCost() {
      let {discountUnitPrice, unitPrice, startupCost, customDiscount} = this.model
      let form1 = this.$refs.taskForm1.form
      let form2 = this.$refs.taskForm2.form
      let form3 = this.$refs.taskForm3.form
      if (this.radioValue === '1' && this.isNumberEqual(unitPrice) && this.isNumberEqual(startupCost)) {
        let realStartTime = form1.getFieldsValue().realStartTime
        let startTime = realStartTime ? moment(realStartTime).format('x') : 0
        let realEndTime = form1.getFieldsValue().realEndTime
        let endTime = realEndTime ? moment(realEndTime).format('x') : 0
        let diff = this.getTimeDiff(startTime, endTime)
        if (diff) {
          form3.setFieldsValue({
            // 标准总价 = 时长 * 标准单价 + 开机费
            standardTotalPrice: (diff * unitPrice + +startupCost) || undefined,
          })
          if (this.isNumberEqual(discountUnitPrice) && this.isNumberEqual(customDiscount)) {
            form3.setFieldsValue({
              // 折后总价 = (时长 * (折后单价 || 标准单价) * 客户折扣) + 开机费
              totalExpenses: (((diff * (discountUnitPrice || unitPrice)) * customDiscount) + +startupCost) || undefined,
            })
          }
        }
      } else if (this.radioValue === '2' && this.isNumberEqual(unitPrice) && this.isNumberEqual(startupCost)) {
        let testSecondary = form2.getFieldsValue().testSecondary
        if (this.isNumberEqual(testSecondary)) {
          form3.setFieldsValue({
            // 标准总价 = 向次 * 标准单价 + 开机费
            standardTotalPrice: (testSecondary * unitPrice + +startupCost) || undefined,
          })
          if (this.isNumberEqual(discountUnitPrice) && this.isNumberEqual(customDiscount)) {
            form3.setFieldsValue({
              // 折后总价 = (向次 * (折后单价 || 标准单价) * 客户折扣) + 开机费
              totalExpenses: (((testSecondary * (discountUnitPrice || unitPrice)) * customDiscount) + +startupCost) || undefined,
            })
          }
        }
      } else {
        form3.setFieldsValue({totalExpenses: undefined, standardTotalPrice: undefined})
        form2.setFieldsValue({testSecondary: undefined})
      }
    },
    getTimeDiff(startTime, endTime) {
      if (!startTime || !endTime || endTime <= startTime) {
        return 0
      }
      return ((endTime - startTime) / (3600 * 1000)).toFixed(1)
    },
    validateEndTime(rule, value, cb) {
      let startTime = this.$refs.taskForm1.form.getFieldsValue(['realStartTime'])
      let valStart = startTime.realStartTime
      let val = value ? moment(value).valueOf() : ''
      valStart = valStart ? moment(valStart).valueOf() : ''
      if (!val) {
        cb('请选择结束时间')
      } else {
        if (valStart && (val < valStart)) {
          cb('结束时间不能小于开始时间')
        } else {
          cb()
        }
      }
    },
    handleCancel() {
      this.visible = false
    },
    validateForm() {
      return new Promise((resolve, reject) => {
        let result = {}
        let formArr = [this.$refs.taskForm1, this.$refs.taskForm2, this.$refs.taskForm3]
        let errMap = null
        for (let i = 0; i < formArr.length; i++) {
          let item = formArr[i].form
          item.validateFieldsAndScroll((err, value) => {
            if (!err) {
              result = Object.assign({}, result, value)
            } else {
              errMap = err
            }
          })
          if (errMap) return
        }
        if (errMap) {
          reject(errMap)
        } else {
          resolve(result)
        }
      })
    },
    handleSubmit() {
      this.validateForm().then(res => {
        this.loading = true
        let params = {
          ...this.model,
          ...res,
        }
        params.approachTime = params.approachTime ? moment(params.approachTime).format('x') : ''
        params.departureTime = params.departureTime ? moment(params.departureTime).format('x') : ''
        params.realStartTime = params.realStartTime ? moment(params.realStartTime).format('x') : ''
        params.realEndTime = params.realEndTime ? moment(params.realEndTime).format('x') : ''
        postAction(this.url.finish, params).then((res) => {
          if (res.code === 200) {
            this.handleCancel()
            this.$emit('change', this.type, params)
          } else {
            this.$message.warning(res.msg)
          }
        }).finally(() => {
          this.loading = false
        })
      }).catch((err) => {
        console.log(err, 'ERR')
      })
    },
  },
}
</script>

<style lang="less" scoped>

.cost-type {
  margin-bottom: 20px;
  padding: 0 !important;

  /deep/ .ant-radio-wrapper {
    display: flex !important;
    align-items: center !important;

    span.ant-radio + * {
      width: 100%;
    }

    .ant-radio {
      margin-bottom: 24px;
    }
  }
}
</style>