<!--
 * @Author: 赵峰
 * @Date: 2021-08-05 18:33:39
 * @LastEditTime: 2021-08-05 18:45:43
 * @LastEditors: 赵峰
 * @Descripttion: 设备管理---新增、编辑
 * @FilePath: \hifar-platform-client\src\views\hifar\product\modules\proDeviceModal.vue
-->
<template>
  <a-modal
    :title="title"
    :visible="visible"
    :width="drawerWidth"
    :confirm-loading="confirmLoading"
    @ok="handleClickSubmit"
    @cancel="handleCancel"
  >
    <h-form
      ref="proMaterialForm"
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
import moment from 'moment'
import { getAction, postAction } from '@/api/manage'
export default {
  components: {},

  data() {
    return {
      moment,
      visible: false,
      confirmLoading: false,
      drawerWidth: 800,
      title: '添加',
      url: {
        add: '/HfProductBaseBusiness/addEquip',
        edit: '/HfProductBaseBusiness/modifyEquipById',
      },
      model: {},
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '名称',
          key: 'productName',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入名称' }],
          },
        },
        {
          title: '编号',
          key: 'productCode',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入编号' }],
          },
        },
        {
          title: '规格',
          key: 'productSpec',
          formType: 'input',
        },
        {
          title: '生产厂家',
          key: 'factoryName',
          formType: 'input',
        },
        {
          title: '技术要求',
          key: 'technology',
          formType: 'textarea',
          span: 2,
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
          span: 2,
        },
      ],
    }
  },
  methods: {
    show(record, title) {
      this.title = title
      this.visible = true
      this.editor(record)
    },
    editor(record) {
      let obj = Object.assign({}, record)
      this.model = obj
    },
    handleClickSubmit() {
      this.$refs.proMaterialForm.validateForm()
    },
    // 提交
    submitHandle(values) {
      if (this.confirmLoading) return
      this.confirmLoading = false
      let params = {
        ...values,
        groupCode: 'equip',
      }
      let url = null
      if (params.id) {
        url = this.url.edit
      } else {
        url = this.url.add
      }
      postAction(url, params).then((res) => {
        if (res.code == 200) {
          this.$message.success(this.title + '成功')
          this.$emit('change', true)
          this.handleCancel()
        }
      })
    },
    handleCancel(e) {
      this.visible = false
      this.modal = {}
    },
  },
}
</script>
<style lang='less' scoped>
</style>