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
        lableWidth="200px"
        style="margin: 0 0 20px 0"
        column="2"
      >
        <h-desc-item label="试验项目">{{ model.unitName || '--' }}</h-desc-item>
        <h-desc-item label="试验设备(设备编号)">{{ `${model.equipName}(${model.equipCode})` || '--' }}</h-desc-item>
      </h-desc>
      <h-card class="cost-type" title="计费方式">
        <a-radio-group v-model="radioValue" @change="handleRadioChange">
          <a-radio style="display:block" value="1">
            <h-form ref="taskForm1" v-model="model" :column="2" :formData="formData1"/>
          </a-radio>
          <a-radio style="display:block" value="2">
            <h-form ref="taskForm2" v-model="model" :column="4" :formData="formData2"/>
          </a-radio>
        </a-radio-group>
      </h-card>
      <h-form ref="taskForm3" v-model="model" :column="2" :formData="formData3"/>
    </a-spin>
  </h-modal>
</template>

<script>
import moment from 'moment'
import {postAction} from '@/api/manage'
import TestSecondaryCom from "@views/hifar/hifar-environmental-test/task/modules/components/TestSecondaryCom.vue";
import ApplicableBillingStandard
  from "@views/hifar/hifar-environmental-test/task/modules/components/ApplicableBillingStandard.vue";

export default {
  components: {ApplicableBillingStandard, TestSecondaryCom},
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
              {required: true, message: ''},
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
          span: 2
        },
      ],
      url: {
        finish: '/HfEnvTaskTestBusiness/finish',
        calcCost: "/HfEnvTaskTestBusiness/costCalculation",
      },
    }
  },
  computed: {
    costStandardListModel() {
      return this.model.costStandardList
    },
    formData1() {
      return [
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
            <h-time-select disabled v-decorator={['departureTime']}/>
          )
        },
        {
          title: '开始时间',
          key: 'realStartTime',
          component: (
            <h-time-select disabled v-decorator={['realStartTime']}/>
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
                this.calcCostByTime(val)
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
        {
          title: '计费标准',
          key: "a",
          component: (
            <applicable-billing-standard props={{
              model: (() => {
                try {
                  return this.costStandardListModel['value']
                } catch {
                  return {}
                }
              })()
            }}>
              <a style={{lineHeight: '34px'}}>{'查看适用计费标准'}</a>
            </applicable-billing-standard>
          )
        },
      ]
    },
    formData2() {
      return (() => {
        const secondaryFields = [];
        let costStandardList
        try {
          costStandardList = Object.keys(this.costStandardListModel)
        } catch {
          return []
        }
        if (costStandardList.includes('value') || !costStandardList.length) {
          return [
            {
              title: `向次`,
              key: `testSecondary`,
              formType: 'input',
              component: this.getTestSecondaryCom(null, this.costStandardListModel, 'value')
            }
          ]
        }
        for (let i = 1; i <= costStandardList.length; i++) {
          let acceleration = `acceleration${i}`
          const field = {
            title: `向次${i}`,
            key: `secondary${i}`,
            formType: 'input',
            hidden: !this.model[acceleration], // 有几个加速度就有几个向次
            component: this.getTestSecondaryCom(i, this.costStandardListModel, acceleration),
          };
          secondaryFields.push(field);
        }
        return secondaryFields
      })()
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
    getTestSecondaryCom(i, costStandardList, field) {
      return (
        <test-secondary-com
          v-decorator={[i ? `secondary${i}` : 'testSecondary', {
            rules: [
              {required: false, message: ''},
              {
                validator: (rule, value, cb) => {
                  if (!this.isNumberEqual(value) && value !== '') {
                    cb('请输入正确格式的向次')
                  } else {
                    cb()
                  }
                }
              }
            ],
          }, {initialValue: undefined}]}
          placeholder={"请输入向次" + i}
          onblur={(value) => {
            if (this.radioValue === '2') {
              this.calcCostBySecondary(field)
            }
          }}
          props={{
            model: (() => {
              try {
                return costStandardList[field]
              } catch {
                return {}
              }
            })(),
            speedItem: this.model[field]
          }}
        >
        </test-secondary-com>
      )
    },
    dateFormat(time) {
      return time && +time !== 0 ? moment(+time).format('YYYY-MM-DD HH:mm:ss') : undefined
    },
    getCalcCost(record) {
      postAction(this.url.calcCost, {id: record.id}).then(res => {
        if (res.code === 200) {
          const {data} = res
          if (data.costStandardList) {
            if (Object.keys(data.costStandardList).length) {
              for (const key in data.costStandardList) {
                data.costStandardList[key].customDiscount = data.customDiscount
              }
            }
          }
          let costStandardList = data.costStandardList
          this.model = Object.assign({}, this.model, data, {costStandardList : costStandardList})
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
      return !isNaN(Number(value)) && value !== '' && +value >= 0 && +value
    },
    calcTotalCost() {
      let costStandardList
      try {
        costStandardList = Object.keys(this.costStandardListModel)
      } catch {
        return
      }
      let form2 = this.$refs.taskForm2.form
      let form3 = this.$refs.taskForm3.form
      if (this.radioValue === '1') {
        this.calcCostByTime()
      } else if (this.radioValue === '2') {
        if (costStandardList.includes('value') || !costStandardList.length) {
          this.calcCostBySecondary('value')
          return
        }
        for (let i = 1; i <= costStandardList.length; i++) {
          this.calcCostBySecondary(`acceleration${i}`)
        }
      } else {
        form3.setFieldsValue({totalExpenses: undefined, standardTotalPrice: undefined})
        form2.setFieldsValue({secondary: undefined})
      }
    },
    calcCostByTime(endTimeVal) {
      // 根据时长计费
      let form1 = this.$refs.taskForm1.form
      let form3 = this.$refs.taskForm3.form
      let realStartTime = form1.getFieldsValue().realStartTime
      let startTime = realStartTime ? moment(realStartTime).format('x') : 0
      let realEndTime = form1.getFieldsValue().realEndTime || endTimeVal
      let endTime = endTimeVal ? (endTimeVal ? moment(endTimeVal).format('x') : 0) : (realEndTime ? moment(realEndTime).format('x') : 0)
      if (!realEndTime || !endTime) {
        form3.setFieldsValue({standardTotalPrice: undefined, totalExpenses: undefined})
        return
      }
      let diff = this.getTimeDiff(startTime, endTime)
      form1.setFieldsValue({realUseTime: diff || undefined})
      let costStandardListField = this.costStandardListModel['value']
      if (!costStandardListField) {
        form3.setFieldsValue({standardTotalPrice: undefined, totalExpenses: undefined})
        return
      }
      // 开机费,折扣单价,标准单价,客户折扣
      let {startupCost, discountPrice, unitPrice, customDiscount} = costStandardListField
      if (diff) {
        /*
         * 根据时间算费用：
         *   标准总价=时长*标准单价+开机费。
         *   折后总价=时长*折扣单价*客户折扣+开机费。
         * */
        form3.setFieldsValue({
          // 标准总价 = 时长 * 标准单价 + 开机费
          standardTotalPrice: ((diff * unitPrice + (+startupCost || 0))).toFixed(2) || undefined,
        })
        if (this.isNumberEqual(discountPrice)) {
          form3.setFieldsValue({
            // 折后总价 = (时长 * (折后单价 || 标准单价) * 客户折扣) + 开机费
            totalExpenses: ((((diff * (discountPrice)) * ((customDiscount * 0.1) || 1)) + (+startupCost || 0))).toFixed(2) || undefined,
          })
        } else {
          form3.setFieldsValue({
            // 折后总价 = (时长 * (折后单价 || 标准单价) * 客户折扣) + 开机费
            totalExpenses: ((((diff * (unitPrice)) * ((customDiscount * 0.1) || 1)) + (+startupCost || 0))).toFixed(2) || undefined,
          })
        }
      } else {
        form3.setFieldsValue({standardTotalPrice: undefined, totalExpenses: undefined})
      }

    },
    calcCostBySecondary(field) {
      // 根据向次计费
      let form2 = this.$refs.taskForm2.form
      let form3 = this.$refs.taskForm3.form
      let form2AllValue = form2.getFieldsValue()
      let costStandardListField = this.costStandardListModel[field]
      if (!costStandardListField) {
        form3.setFieldsValue({standardTotalPrice: undefined, totalExpenses: undefined})
        return
      }
      // 开机费,折扣单价,标准单价,客户折扣
      let {startupCost, discountPrice, unitPrice, customDiscount} = costStandardListField
      let standardTotalPrice = 0, totalExpenses = 0 // 标准总价,折后总价
      for (const key in form2AllValue) {
        let val = form2AllValue[key]
        if (val && this.isNumberEqual(val) && this.isNumberEqual(unitPrice) && this.isNumberEqual(discountPrice)) {
          if (this.isNumberEqual(unitPrice)) {
            standardTotalPrice = (+standardTotalPrice + (+form2AllValue[key] * +unitPrice)).toFixed(2)
          }
          if (this.isNumberEqual(discountPrice)) {
            totalExpenses = (+totalExpenses + (+form2AllValue[key] * +discountPrice)).toFixed(2)
          } else {
            totalExpenses = (+totalExpenses + (+form2AllValue[key])).toFixed(2)
          }
        } else {
          form3.setFieldsValue({standardTotalPrice: undefined, totalExpenses: undefined})
        }
      }
      /* * (customDiscount || 1)
      * 根据向次算费用：
      *  标准总价=向次1*标准单价+向次2*标准单价+开机费。
      *  折后总价=（向次1*折扣单价+向次2*折扣单价）*客户折扣+开机费。
      * */
      form3.setFieldsValue({
        standardTotalPrice: Number((+standardTotalPrice + (+startupCost || 0)).toFixed(2)) || undefined,
        totalExpenses: Number((+totalExpenses * ((customDiscount * 0.1) || 1) + (+startupCost || 0)).toFixed(2)) || undefined,
      })
    },
    getTimeDiff(startTime, endTime) {
      if (!startTime || !endTime || +endTime <= +startTime) {
        return 0
      }
      return ((+endTime - +startTime) / (3600 * 1000)).toFixed(1)
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
      this.radioValue = '1'
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