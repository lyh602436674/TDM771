<!--
 * @Author: 赵峰
 * @Date: 2021-08-31 11:50:30
 * @LastEditTime: 2021-11-24 12:03:17
 * @LastEditors: 赵峰
 * @Descripttion: 模板子项新增-编辑
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\modules\TempAddModal.vue
-->
<template>
  <h-modal
    :title='title'
    :visible='visible'
    inner
    :getContainer='getContainer'
    :width='drawerWidth'
    :confirm-loading='confirmLoading'
    @submit='handleClickSubmit'
    @cancel='handleCancel'
  >
    <h-form
      ref='TempForm'
      v-if='visible'
      v-model='model'
      :column='1'
      :formData='formData'
      @change='submitHandle'
    ></h-form>
  </h-modal>
</template>

<script>
import moment from 'moment'
import { downloadFile, postAction, getFileAccessHttpUrl } from '@/api/manage'
import AddTempModal from '@views/hifar/hifar-environmental-test/resource/modules/AddTempModal'

export default {
  components: { AddTempModal },
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
      title: '添加',
      url: {
        add: '/HfResTemplateItemBusiness/add',
        edit: '/HfResTemplateItemBusiness/modifyById',
        detailById: '/HfResTemplateItemBusiness/queryById'
      },
      formData: [

          {
            key: 'id',
            formType: 'input',
            hidden: true
          },
          {
            title: '所属报告',
            key: 'pid',
            validate: {
              rules: [{ required: true, message: '请选择报告' }]
            },
            component: (
              <add-temp-modal
                type="radio"
                v-decorator={['pid', {initialValue: ['请选择所属报告!']}]}
                selectedName={() => {
                  return this.model.pName
                }}
                on-change={(key, row) => {
                  this.model.pid = key
                  this.model.pName = row.name
                }}
              />
            )
          },
          {
            title: '报告名称',
            key: 'name',
            formType: 'input',
            validate: {
              rules: [
                { required: true, message: '请输入报告名称' },
              ]
            }
          },
          {
            title: '报告标签',
            key: 'label',
            formType: 'input',
            validate: {
              rules: [
                { required: true, message: '请输入报告标签' },
                { pattern: /^\w+$/, message: '字母、数字、下划线组合' }
              ]
            }
          },
          {
            title: '模版分组',
            key: 'groupCode',
            formType: 'input',
            hidden: true
          },
          {
            title: '排序',
            key: 'rowSort',
            formType: 'input-number',
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
                accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'
                multiple={false}
                v-decorator={['attachIds', { initialValue: [] }]}
              />
            )
          }
      ]
    }
  },
  methods: {
    show(record, title, groupCode) {
      this.visible = true
      this.title = title
      this.groupCode = groupCode
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
            uploadTime: item.createTime,
            secretLevel: item.secretLevel,
            type: item.viewType == 2 ? 'image/jpeg' : 'text/plain'
          })
        })
      }
      obj.attachIds = fileArr ? fileArr : []
      if (!obj.id) {
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
        groupCode: this.groupCode
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
    }
  }
}
</script>

<style lang='less' scoped>
</style>