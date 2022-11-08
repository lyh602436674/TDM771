<!--
 * @Author: 赵峰
 * @Date: 2021-11-09 16:15:03
 * @LastEditTime: 2021-11-09 16:24:31
 * @LastEditors: 赵峰
 * @Descripttion: 指标项编辑--strValue
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\equipmentManage\modules\StringModal.vue
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
      ref="strValueForm"
      v-if="visible"
      v-model="model"
      :formData="formData"
      :column="1"
      @change="submitHandle"
    ></h-form>
  </h-modal>
</template>

<script>
export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  data() {
    return {
      title: '指标项修改',
      visible: false,
      drawerWidth: 600,
      model: {},
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          key: 'unitPointName',
          formType: 'input',
          hidden: true,
        },
        {
          key: 'unitDataType',
          formType: 'input',
          hidden: true,
        },
        {
          key: 'unitDataUnitCode',
          formType: 'input',
          hidden: true,
        },
        {
          key: 'unitDataUnit',
          formType: 'input',
          hidden: true,
        },
        {
          key: 'conditonType',
          formType: 'input',
          hidden: true,
        },
        {
          key: 'maxValue',
          formType: 'input',
          hidden: true,
        },
        {
          key: 'minValue',
          formType: 'input',
          hidden: true,
        },
        {
          key: 'standardValue',
          formType: 'input',
          hidden: true,
        },
        {
          key: 'strValue',
          formType: 'input',
          hidden: true,
        },
        {
          title: '限制条件',
          key: 'conditionTypeDesc',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入限制条件' }],
          },
        },
      ],
    }
  },
  methods: {
    show(record) {
      this.visible = true
      let obj = Object.assign({}, record)
      this.model = obj
    },
    handleCancel() {
      this.visible = false
    },
    handleClickSubmit() {
      this.$refs.strValueForm.validateForm()
    },
    submitHandle(values) {
      let params = {
        ...values,
      }
      params.strValue = params.conditionTypeDesc
      this.$emit('change', params)
      this.handleCancel()
    },
  },
}
</script>

<style>
</style>