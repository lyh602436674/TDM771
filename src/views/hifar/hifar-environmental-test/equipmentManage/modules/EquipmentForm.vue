<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-16 14:24:21
 * @LastEditTime: 2021-10-26 18:05:51
 * @LastEditors: 赵峰
 * @Description: 设备的基本信息
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\equipmentManage\modules\EquipmentForm.vue
-->
<template>
  <h-form v-model="model" ref="equipmentForm" :formData="formData" @change="handleChange" />
</template>

<script>
import SysUserSelect from '@/views/components/SysUserSelect'
export default {
  components: { SysUserSelect },
  data() {
    return {
      model: {},
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '设备编号',
          key: 'equipCode',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入设备编号' }],
          },
        },
        {
          title: '设备名称',
          key: 'equipName',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入设备名称' }],
          },
        },
        {
          title: '设备类型',
          key: 'equipTypeCode',
          formType: 'dict',
          dictCode: 'hf_res_equip_type',
          change: (v, option) => {
            this.$refs.equipmentForm.form.setFieldsValue({
              equipTypeName: option.title,
            })
          },
          validate: {
            rules: [{ required: true, message: '请选择设备类型' }],
          },
        },
        {
          title: '类型名称',
          key: 'equipTypeName',
          formType: 'input',
          hidden: true,
        },
        {
          title: '内部名称',
          key: 'innerName',
          formType: 'input',
        },
        {
          title: '资产编号',
          key: 'assetsCode',
          formType: 'input',
        },
        {
          title: '出厂编号',
          key: 'leaveCode',
          formType: 'input',
        },
        {
          title: '生产厂家',
          key: 'factoryName',
          formType: 'input',
        },
        {
          title: '购买日期',
          key: 'buyTime',
          formType: 'datePick',
        },
        {
          title: '负责人',
          key: 'managerId',
          component: (
            <sys-user-select
              v-decorator={['managerId', { initialValue: undefined }]}
              placeholder="请选择"
              onchange={(v, option) => {
                this.$refs.equipmentForm.form.setFieldsValue({
                  managerName: option.idName,
                })
              }}
            />
          ),
        },
        {
          key: 'managerName',
          formType: 'input',
          hidden: true,
        },
        {
          title: '设备型号',
          key: 'equipModel',
          formType: 'input',
        },
        {
          title: '设备状态',
          key: 'status',
          formType: 'dict',
          dictCode: 'hf_res_equip_status',
        },
        {
          title: '检定编号',
          key: 'checkCode',
          formType: 'input',
        },
        {
          title: '检定日期',
          key: 'checkTime',
          formType: 'datePick',
        },
        {
          title: '检定周期',
          key: 'checkPeriod',
          placeholder: '请输入',
          component: (
            <a-input placeholder="请输入" v-decorator={['checkPeriod']}>
              <span slot="addonAfter">天</span>
            </a-input>
          ),
        },
        {
          title: '技术参数',
          span: 2,
          key: 'technology',
          formType: 'textarea',
        },
        {
          title: '设备图片',
          span: 2,
          key: 'imgUrl',
          component: <h-upload-img v-decorator={['imgUrl', { initialValue: [] }]} />,
        },
        {
          title: '设备附件',
          span: 2,
          key: 'attachInfo',
          component: <h-upload-file v-decorator={['attachInfo', { initialValue: [] }]} />,
        },
      ],
    }
  },
  methods: {
    validateForm() {
      this.$refs.equipmentForm.validateForm()
    },
    handleChange(values) {
      this.$emit('change', values)
    },
  },
}
</script>

<style>
</style>