<!--
 * @Author: 赵峰
 * @Date: 2021-09-01 16:08:06
 * @LastEditTime: 2021-11-05 09:19:16
 * @LastEditors: 赵峰
 * @Descripttion: 期间核查记录 ---- 添加、编辑
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\equipment\modules\PeriodCheckRecordModal.vue
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
      ref="periodCheckForm"
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
import SysUserSelect from '@/views/components/SysUserSelect'
export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  components: {
    SysUserSelect,
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
        add: '/HfResEquipPeriodBusiness/add',
        edit: '/HfResEquipPeriodBusiness/modifyById',
        detailById: '/HfResEquipPeriodBusiness/queryById',
      },
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          key: 'equipId',
          formType: 'input',
          hidden: true,
        },
        {
          key: 'checkTypeName',
          formType: 'input',
          hidden: true,
        },
        {
          title: '检测类型',
          key: 'checkTypeCode',
          formType: 'dict',
          dictCode:'hf_res_device_check_type',
          validate: {
            rules: [{ required: false, message: '请选择检测类型' }],
          },
          change: (val, option) => {
            this.$refs.periodCheckForm.form.setFieldsValue({ checkTypeName: option.title })
          },
          span: 2,
        },
        {
          title: '检查人',
          key: 'checkUserId',
          formType: 'input',
          span: 2,
          component: (
            <sys-user-select
              v-decorator={['checkUserId', { initialValue: [] }]}
              v-on:change={this.acceptUserChange}
            ></sys-user-select>
          ),
          validate: {
            rules: [{ required: true, message: '请选择检查人' }],
          },
        },
        {
          title: '',
          key: 'checkUserName',
          formType: 'input',
          hidden: true,
        },
        {
          title: '核查日期',
          key: 'checkTime',
          formType: 'datePick',
          validate: {
            rules: [{ required: false, message: '请选择核查日期' }],
          },
          span: 2,
        },
        {
          title: '环境温度',
          key: 'envH',
          formType: 'input',
          type:'number',
          addonAfter: '℃',
          span: 2,
        },
        {
          title: '相对湿度',
          key: 'envT',
          formType: 'input',
          type:'number',
          addonAfter: '%',
          span: 2,
        },
        {
          title: '检查结果',
          key: 'checkRs',
          formType: 'textarea',
          validate: {
            rules: [{ required: true, message: '请输入检查结果' }],
          },
          span: 2,
        },
        {
          title: '检查结论',
          key: 'conclusion',
          formType: 'textarea',
          span: 2,
          validate: {
            rules: [{ required: true, message: '请输入检查结论' }],
          },
        },
        {
          title: '审核意见',
          key: 'audit',
          formType: 'textarea',
          span: 2,
          validate: {
            rules: [{ required: true, message: '请输入审核意见' }],
          },
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
      obj.checkTime = obj.checkTime && obj.checkTime != 0 ? moment(parseFloat(obj.checkTime)) : ''
      this.model = obj
    },
    handleClickSubmit() {
      this.$refs.periodCheckForm.validateForm()
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
      params.checkTime = params.checkTime && params.checkTime != 0 ? params.checkTime.valueOf() : ''
      postAction(url, params).then((res) => {
        if (res.code == 200) {
          this.$message.success(this.title + '成功')
          this.$emit('change', true)
          this.handleCancel()
        }
      })
    },
    acceptUserChange(val, option) {
      this.$refs.periodCheckForm.form.setFieldsValue({ checkUserName: option.idName })
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