<!--
 * @Author: 赵峰
 * @Date: 2021-08-26 16:25:24
 * @LastEditTime: 2021-11-24 12:05:55
 * @LastEditors: 赵峰
 * @Descripttion:
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\methods\modules\MethodsModal.vue
-->
<template>
  <h-modal
    :title="title"
    :visible="visible"
    :width="drawerWidth"
    inner
    :confirm-loading="confirmLoading"
    :getContainer='getContainer'
    @submit="handleClickSubmit"
    @cancel="handleCancel"
  >
    <h-form
      ref="methodsForm"
      v-if="visible"
      v-model="model"
      :width="drawerWidth - 48"
      :formData="formData"
      :column="1"
      @change="submitHandle"
    ></h-form>
  </h-modal>
</template>

<script>
import moment from 'moment'
import { downloadFile, postAction,getFileAccessHttpUrl } from '@/api/manage'
export default {
  components: {},
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
      drawerWidth: 1000,
      model: {},
      title: '新增',
      url: {
        add: '/HfResStandardBusiness/add',
        edit: '/HfResStandardBusiness/modifyById',
        detailById:'/HfResStandardBusiness/queryById'
      },
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '标准类别',
          key: 'standardTypeCode',
          formType: 'dict',
          dictCode: 'hf_res_standard_type',
          validate: {
            rules: [{ required: true, message: '请选择标准类别' }],
          },
          change: (val, option) => {
            this.$refs.methodsForm.form.setFieldsValue({ standardTypeName: option.title })
          },
        },
        {
          title: '',
          key: 'standardTypeName',
          formType: 'input',
          hidden: true,
        },
        {
          title: '标准名称',
          key: 'standardName',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入标准名称' }],
          },
        },
        {
          title: '标准编号',
          key: 'standardCode',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入标准编号' }],
          },
        },
        {
          title: '发布机构',
          key: 'publishOrg',
          formType: 'input',
          validate: {
            rules: [{ required: false, message: '请输入发布机构' }],
          },
        },
        {
          title: '发布日期',
          key: 'publishTime',
          formType: 'datePick',
          validate: {
            rules: [{ required: true, message: '请选择发布日期' }],
          },
        },
        {
          title: '使用日期',
          key: 'useTime',
          formType: 'datePick',
          validate: {
            rules: [{ required: true, message: '请选择使用日期' }],
          },
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
        },
        {
          title: '附件',
          key: 'attachIds',
          component: <h-upload-file v-decorator={['attachIds', { initialValue: [] }]} />,
        },
      ],
    }
  },
  methods: {
    show(record, title) {
      this.title = title
      this.visible = true
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
      let attachInfo = obj.attachInfo
      let fileArr = []
      if (attachInfo && attachInfo.length > 0) {
        attachInfo.forEach((item) => {
          fileArr.push({
            fileId: item.id,
            size: item.fileSize,
            status: item.status == 9 ? 'success' : 'exception',
            url: item.filePath,
            name: item.fileName,
            uuid: item.id,
            percent: 100,
            uploadTime:item.createTime,
            secretLevel: item.secretLevel,
            type: item.viewType == 2 ? 'image/jpeg' : 'text/plain',
          })
        })
      }
      obj.attachIds = fileArr ? fileArr : []
      obj.publishTime = obj.publishTime && obj.publishTime != 0 ? moment(parseFloat(obj.publishTime)) : ''
      obj.useTime = obj.useTime && obj.useTime != 0 ? moment(parseFloat(obj.useTime)) : ''
      obj.standardTypeCode = obj.standardTypeCode ? obj.standardTypeCode : undefined
      this.model = obj
    },
    handleClickSubmit() {
      this.$refs.methodsForm.validateForm()
    },
    // 提交
    submitHandle(values) {
      if (this.confirmLoading) return
      this.confirmLoading = false
      let params = {
        ...values,
      }
      let url = null
      let attachIds = []
      if (params.id) {
        url = this.url.edit
      } else {
        url = this.url.add
      }
      let attachIdsArr = params.attachIds
      if (attachIdsArr.length > 0) {
        attachIdsArr.forEach((item) => {
          attachIds.push(item.fileId)
        })
      }
      params.standardFlag = 1
      params.attachIds = attachIds.length > 0 ? attachIds.join(',') : ''
      params.useTime = params.useTime && params.useTime != 0 ? params.useTime.valueOf() : ''
      params.publishTime = params.publishTime && params.publishTime != 0 ? params.publishTime.valueOf() : ''
      postAction(url, params).then((res) => {
        if (res.code == 200) {
          this.$message.success(this.title + '成功')
          this.$emit('ok', true)
          this.handleCancel()
        }
      })
    },
    handleCancel(e) {
      this.visible = false
      this.templateInfo = {}
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