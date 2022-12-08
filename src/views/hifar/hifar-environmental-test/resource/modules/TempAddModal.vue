<template>
  <h-modal
    :title="title"
    :visible="visible"
    inner
    :getContainer="getContainer"
    :width="drawerWidth"
    :confirm-loading="confirmLoading"
    @submit="handleClickSubmit"
    @cancel="handleCancel"
  >
    <h-form
      ref="TempForm"
      v-if="visible"
      v-model="model"
      :column="1"
      :formData="formData"
      @change="submitHandle"
    ></h-form>
  </h-modal>
</template>

<script>
import moment from 'moment'
import {downloadFile, getFileAccessHttpUrl, postAction} from '@/api/manage'

export default {
  components: {},
  inject: {
    getContainer: {
      default: () => document.body
    }
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
        add: '/HfResTemplateBusiness/add',
        edit: '/HfResTemplateBusiness/modifyById',
        detailById: '/HfResTemplateBusiness/queryById'
      },
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true
        },
        {
          title: '模版分类',
          key: 'reportType',
          formType: 'dict',
          dictCode: "report_template_classify",
          change: (v) => {
          },
          validate: {
            rules: [{required: true, message: '请选择模版分类'}]
          }
        },
        {
          title: '模板名称',
          key: 'name',
          formType: 'input',
          validate: {
            rules: [{required: true, message: '请输入模板名称'}]
          }
        },
        {
          title: '模版分组',
          key: 'groupCode',
          formType: 'input',
          hidden: true
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea'
        },
        {
          title: '附件',
          key: 'attachIds',
          component: (
            <h-upload-file
              accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              multiple={true}
              v-decorator={['attachIds', {initialValue: []}]}
            />
          )
        }
      ],
    }
  },
  methods: {
    show(record, title) {
      this.visible = true
      this.title = title
      if (record.id) {
        this.loadDetail(record.id)
      }
    },
    loadDetail(id) {
      postAction(this.url.detailById, { id: id }).then((res) => {
        if (res.code === 200) {
          let obj = Object.assign({}, res.data)
          let attachInfo = obj.attachInfo
          let fileArr = []
          if (attachInfo && attachInfo.length > 0) {
            attachInfo.forEach((item) => {
              fileArr.push({
                fileId: item.id,
                size: item.fileSize,
                status: item.status === 9 ? 'success' : 'exception',
                url: item.filePath,
                name: item.fileName,
                uuid: item.id,
                percent: 100,
                uploadTime: item.createTime,
                secretLevel: item.secretLevel,
                type: item.viewType === 2 ? 'image/jpeg' : 'text/plain'
              })
            })
          }
          obj.attachIds = fileArr || []
          this.model = obj
        }
      })
    },
    handleClickSubmit() {
      this.$refs.TempForm.validateForm()
    },
    // 提交
    submitHandle(values) {
      if (this.confirmLoading) return
      this.confirmLoading = true
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
      params.attachIds = attachIds.length > 0 ? attachIds.join(',') : ''
      postAction(url, params).then((res) => {
        if (res.code === 200) {
          this.$message.success(this.title + '成功')
          this.$emit('change', true)
          this.handleCancel()
        }
      }).finally(() => {
        this.confirmLoading = false
      })
    },
    handleCancel() {
      this.visible = false
    },
    handleDownload(filePath, fileName) {
      let fileAccessUrl = getFileAccessHttpUrl(filePath)
      downloadFile(fileAccessUrl, fileName)
    },
  }
}
</script>

<style lang='less' scoped>
</style>
