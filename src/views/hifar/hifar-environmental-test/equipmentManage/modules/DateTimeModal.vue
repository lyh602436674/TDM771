<!--
 * @Author: 彭佳飞
 * @Date: 2021-12-06 16:56:09
 * @LastEditTime: 2021-12-06 16:56:09
 * @LastEditors: 彭佳飞
 * @Descripttion: 指标项编辑--dateTimeValue
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\equipmentManage\modules\DateTimeModal.vue
-->
<template>
  <h-modal
    :title="title"
    :width="600"
    destroyOnClose
    centered
    inner
    :visible="visible"
    :getContainer="getContainer"
    @submit="handleClickSubmit"
    @cancel="handleCancel"
  >
    <h-form
      ref="dateTimeValue"
      v-if="visible"
      v-model="model"
      :formData="formData"
      :column="1"
      @change="submitHandle"
    ></h-form>
  </h-modal>
</template>

<script>

import moment from 'moment'

export default {
  inject: {
    getContainer: {
      default: () => document.body
    }
  },
  data() {
    return {
      moment,
      title: '指标项修改',
      visible: false,
      drawerWidth: 600,
      model: {},
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true
        },
        {
          key: 'unitPointName',
          formType: 'input',
          hidden: true
        },
        {
          key: 'unitDataType',
          formType: 'input',
          hidden: true
        },
        {
          key: 'unitDataUnitCode',
          formType: 'input',
          hidden: true
        },
        {
          key: 'unitDataUnit',
          formType: 'input',
          hidden: true
        },
        {
          key: 'conditonType',
          formType: 'input',
          hidden: true
        },
        {
          key: 'maxValue',
          formType: 'input',
          hidden: true
        },
        {
          key: 'minValue',
          formType: 'input',
          hidden: true
        },
        {
          key: 'standardValue',
          formType: 'input',
          hidden: true
        },
        {
          key: 'strValue',
          formType: 'input',
          hidden: true
        },
        {
          title: '时间选择',
          key: 'minValue',
          validate: {rules: [{required: true, message: '请选择时间'}]},
          conditonType: 'A00',
          component: (
            <h-time-select
              v-decorator={['minValue', {rules: [{required: true, message: '请选择时间'}]}]}
              onChange={(value) => {
                console.log(value)
              }}
            />
          )
        }
      ]
    }
  },
  methods: {
    show(record) {
      this.visible = true
      let obj = Object.assign({}, record)
      obj.minValue = obj.minValue && obj.minValue != 0 ? moment(parseFloat(obj.minValue)) : ''
      this.model = obj
    },
    handleCancel() {
      this.visible = false
    },
    handleClickSubmit() {
      this.$refs.dateTimeValue.validateForm()
    },
    submitHandle(values) {
      this.model.minValue = values.minValue && values.minValue != 0 ? values.minValue.valueOf() : ''
      this.model.conditionTypeDesc = moment(values.minValue).format('YYYY-MM-DD HH:mm:ss')
      this.$emit('change', this.model)
      this.handleCancel()
    }
  }
}
</script>

<style>
</style>