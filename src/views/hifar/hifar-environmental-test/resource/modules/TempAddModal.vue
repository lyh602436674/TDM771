<!--
 * @Author: 赵峰
 * @Date: 2021-08-31 11:50:30
 * @LastEditTime: 2021-11-24 12:03:17
 * @LastEditors: 赵峰
 * @Descripttion: 模板新增-编辑
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\modules\TempAddModal.vue
-->
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
import { downloadFile, postAction, getFileAccessHttpUrl } from '@/api/manage'
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
      title: '添加',
      url: {
        add: '/HfResTemplateBusiness/add',
        edit: '/HfResTemplateBusiness/modifyById',
        detailById: '/HfResTemplateBusiness/queryById',
      },
      formData: [],
      formBackUpData: [
        // 报告模板--模板分类 --封面
        [
          {
            key: 'id',
            formType: 'input',
            hidden: true,
          },
          {
            title: '模版分类',
            key: 'reportType',
            formType: 'select',
            options: [
              {
                title: '封面',
                key: 'cover',
                value: 'cover',
              },
              {
                title: '报告',
                key: 'report',
                value: 'report',
              },
            ],
            change: (v) => {
              this.changeType(v)
            },
            validate: {
              rules: [{ required: true, message: '请选择模版分类' }],
            },
          },
          {
            title: '模板名称',
            key: 'name',
            formType: 'input',
            validate: {
              rules: [{ required: true, message: '请输入模板名称' }],
            },
          },
          {
            title: '模版分组',
            key: 'groupCode',
            formType: 'input',
            hidden: true,
          },
          {
            title: '备注',
            key: 'remarks',
            formType: 'textarea',
          },
          {
            title: '附件',
            key: 'attachIds',
            component: (
              <h-upload-file
                accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                multiple={true}
                v-decorator={['attachIds', { initialValue: [] }]}
              />
            ),
          },
        ],
        // 报告模板--模板分类 --报告
        [
          {
            key: 'id',
            formType: 'input',
            hidden: true,
          },
          {
            title: '模版分类',
            key: 'reportType',
            formType: 'select',
            options: [
              {
                title: '封面',
                key: 'cover',
                value: 'cover',
              },
              {
                title: '报告',
                key: 'report',
                value: 'report',
              },
            ],
            change: (v) => {
              this.changeType(v)
            },
            validate: {
              rules: [{ required: true, message: '请选择模版分类' }],
            },
          },
          {
            title: '模板名称',
            key: 'name',
            formType: 'input',
            validate: {
              rules: [{ required: true, message: '请输入模板名称' }],
            },
          },
          {
            title: '模版分组',
            key: 'groupCode',
            formType: 'input',
            hidden: true,
          },
          {
            title: '备注',
            key: 'remarks',
            formType: 'textarea',
          },
          {
            title: '附件',
            key: 'attachIds',
            component: (
              <h-upload-file
                accept="application/xml,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                multiple={true}
                v-decorator={['attachIds', { initialValue: [] }]}
              />
            ),
          },
        ],
        [
          {
            key: 'id',
            formType: 'input',
            hidden: true,
          },
          {
            title: '模板名称',
            key: 'name',
            formType: 'input',
            validate: {
              rules: [{ required: true, message: '请输入模板名称' }],
            },
          },
          {
            title: '模版分组',
            key: 'groupCode',
            formType: 'input',
            hidden: true,
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
      ],
    }
  },
  methods: {
    show(record, title, groupCode) {
      this.visible = true
      this.title = title
      this.groupCode = groupCode
      if (groupCode == 'report') {
        this.formData = this.formBackUpData[0]
      } else {
        this.formData = this.formBackUpData[2]
      }
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
      if(!obj.id){
        obj.reportType = 'cover'
      }
      this.model = obj
    },
    handleClickSubmit() {
      this.$refs.TempForm.validateForm()
    },
    // 提交
    submitHandle(values) {
      if (this.confirmLoading) return
      this.confirmLoading = false
      let params = {
        ...values,
        groupCode: this.groupCode,
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
        if (res.code == 200) {
          this.$message.success(this.title + '成功')
          this.$emit('change', true)
          this.handleCancel()
        }
      })
    },
    handleCancel(e) {
      this.visible = false
      this.model = {}
    },
    handleDownload(filePath, fileName) {
      let fileAccessUrl = getFileAccessHttpUrl(filePath)
      downloadFile(fileAccessUrl, fileName)
    },
    changeType(v) {
      console.log(v)
      this.model = Object.assign({}, this.model, { reportType: v })
      if (v == 'cover') {
        this.formData = this.formBackUpData[0]
      } else {
        this.formData = this.formBackUpData[1]
      }
    },
  },
}
</script>

<style lang='less' scoped>
</style>