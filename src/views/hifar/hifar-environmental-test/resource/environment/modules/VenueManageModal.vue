<!--
 * @Author: 赵峰
 * @Date: 2021-09-02 09:34:31
 * @LastEditTime: 2021-09-02 09:35:56
 * @LastEditors: 赵峰
 * @Descripttion: 场地管理--新增、编辑
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-physico-chemical\resource\environment\modules\VenueManageModal.vue
-->
<template>
  <h-modal
    :title="title"
    inner
    :visible="visible"
    :getContainer="getContainer"
    :width="drawerWidth"
    :confirm-loading="confirmLoading"
    @submit="handleClickSubmit"
    @cancel="handleCancel"
  >
    <h-form
      ref="VenueManageForm"
      v-if="visible"
      v-model="model"
      :width="drawerWidth - 48"
      :formData="formData"
      @change="submitHandle"
    ></h-form>
  </h-modal>
</template>

<script>
import moment from 'moment'
import { downloadFile, postAction, getFileAccessHttpUrl } from '@/api/manage'
export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  data() {
    return {
      moment,
      visible: false,
      confirmLoading: false,
      drawerWidth: 800,
      model: {},
      title: '添加',
      url: {
        add: '/HfResPlaceBusiness/add',
        edit: '/HfResPlaceBusiness/modifyById',
        detailById: '/HfResPlaceBusiness/queryById',
      },
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '场地名称',
          key: 'placeName',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入场地名称' }],
          },
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
      this.visible = true
      this.title = title
      if (record.id) {
        this.loadDetail(record.id)
      } else {
        this.editor(record)
      }
    },
    loadDetail(id) {
      postAction(this.url.detailById, { id: id }).then((res) => {
        if (res.code == 200) {
          this.editor(res.data)
        }
      })
    },
    editor(record) {
      let obj = Object.assign({}, record)
      obj.repairTime = obj.repairTime && obj.repairTime != 0 ? moment(parseFloat(obj.repairTime)) : ''
      this.model = obj
    },
    handleClickSubmit() {
      this.$refs.VenueManageForm.validateForm()
    },
    // 提交
    submitHandle(values) {
      if (this.confirmLoading) return
      this.confirmLoading = false
      let params = {
        ...values
      }
      let url = null
      if (params.id) {
        url = this.url.edit
      } else {
        url = this.url.add
      }
      params.repairTime = params.repairTime && params.repairTime != 0 ? params.repairTime.valueOf() : ''
      postAction(url, params).then((res) => {
        if (res.code == 200) {
          this.$message.success(this.title + '成功')
          this.$emit('change', true)
          this.handleCancel()
        }
      })
    },
    acceptUserChange(val, option) {
      this.$refs.VenueManageForm.form.setFieldsValue({ checkUserName: option.idName })
    },
    handleCancel(e) {
      this.visible = false
      this.model = {}
    },
    handleDownload(filePath, fileName) {
      let fileAccessUrl = getFileAccessHttpUrl(filePath)
      downloadFile(fileAccessUrl, fileName)
    },
  },
}
</script>

<style lang='less' scoped>
</style>