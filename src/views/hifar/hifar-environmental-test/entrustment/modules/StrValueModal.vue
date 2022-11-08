<!--
 * @Author: 赵峰
 * @Date: 2021-09-16 11:55:46
 * @LastEditTime: 2021-09-16 11:55:47
 * @LastEditors: 赵峰
 * @Descripttion: 指标项编辑--strValue
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\entrustment\modules\StrValueModal.vue
-->
<template>
  <a-modal
    destroyOnClose
    centered
    :title="title"
    :width="600"
    :visible="visible"
    @ok="handleClickSubmit"
    @cancel="handleCancel"
  >
    <h-form
      ref="strValueForm"
      v-if="visible"
      v-model="model"
      :width="drawerWidth - 48"
      :formData="formData"
      :column="2"
      @change="submitHandle"
    ></h-form>
  </a-modal>
</template>

<script>
export default {
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