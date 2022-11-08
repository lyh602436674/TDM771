<!--
 * @Author: 陈乾龙
 * @Date: 2021-06-01 11:54:40
 * @LastEditTime: 2021-08-11 11:49:39
 * @LastEditors: 陈乾龙
 * @Description: 文件管理的新建、编辑弹窗，通过数据判断是否是新建和编辑
 * @FilePath: \hifar-platform-client\src\views\hifar\sys\tools\fileManage\modules\FilesModal.vue
-->
<template>
  <a-modal
    destroyOnClose
    :maskClosable="!uploadLoading"
    :width="800"
    :visible="visible"
    :title="expandedRowKeys.length ? '编辑文件' : '新增上传'"
    @cancel="handleCancel"
  >
    <a-form :form="form">
      <j-form-container>
        <div slot="detail">
          <legend>基本信息</legend>
          <a-form-item v-show="false">
            <a-input v-decorator="['toolId']"></a-input>
          </a-form-item>
          <a-form-item v-bind="formLabel" label="工具名称">
            <a-input
              placeholder="请输入工具名称"
              v-decorator="['toolName', { rules: [{ required: true, message: '请输入工具名称' }] }]"
            ></a-input>
          </a-form-item>
          <a-form-item v-bind="formLabel" label="备注">
            <a-textarea placeholder="请输入备注" v-decorator="['remarks']"></a-textarea>
          </a-form-item>
        </div>
        <div slot="edit">
          <legend>文件列表</legend>
          <div style="margin-bottom: 2px; text-align: right">
            <a-upload
              :action="uploadAction"
              :multiple="true"
              :file-list="uploadFilesList"
              :beforeUpload="handleBeforeUpload"
              :customRequest="customUploadRequest"
            >
              <a-button size="small" type="ghost-success">
                <h-icon type="icon-guidang"></h-icon>
                继续上传
              </a-button>
            </a-upload>
          </div>
          <a-card size="small" class="project-list" :bodyStyle="{ padding: 0 }" :bordered="false">
            <a-spin :spinning="detailLoading">
              <template v-if="Object.keys(filesDetailList).length">
                <a-card-grid
                  v-for="(item, key, index) in filesDetailList"
                  :key="index"
                  class="project-card-grid"
                  style="width: 25%; text-align: center; position: relative"
                >
                  <file-card :file="item" @change="handleClickDelete" @delete="handleDeleteFile"></file-card>
                </a-card-grid>
              </template>
              <a-empty v-else></a-empty>
            </a-spin>
          </a-card>
        </div>
      </j-form-container>
    </a-form>
    <div slot="footer">
      <a-button type="ghost-danger" style="margin-right: 5px" :loading="uploadLoading" @click="handleCancel">
        取消
      </a-button>
      <a-button type="primary" :loading="uploadLoading" @click="handleSubmit">确认</a-button>
    </div>
  </a-modal>
</template>

<script>
import { postAction } from '@/api/manage'
import mixin from '../mixins/mixin'
import FileCard from './FileCard'
export default {
  components: { FileCard },
  mixins: [mixin],
  data() {
    return {
      visible: false,
      expandedRowKeys: [],
      info: {},
      form: null,
      formLabel: {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 4 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 20 },
        },
      },
    }
  },
  methods: {
    open(record = {}) {
      this.expandedRowKeys = record.id ? [record.id] : []
      this.info = record || {}
      if (this.expandedRowKeys.length) {
        this.handleGetFilesDetail()
      }
      this.form = this.$form.createForm(this, {
        name: 'fileManageForm',
        mapPropsToFields: () => {
          return {
            toolId: this.$form.createFormField({
              value: record.id || null,
            }),
            toolName: this.$form.createFormField({
              value: record.toolName || null,
            }),
            remarks: this.$form.createFormField({
              value: record.remarks || null,
            }),
          }
        },
      })
      this.visible = true
    },
    handleSubmit() {
      this.form.validateFieldsAndScroll(async (err, values) => {
        if (err) return
        if (this.uploadLoading) return
        this.uploadLoading = true
        
        let params = {
          ...values,
          files:[]
        }
        Object.keys(this.filesDetailList).map(key=>{
          params.files.push(this.filesDetailList[key])
        })
        let response = await postAction(this.url.saveFiles, params)
        if (response.success) {
          this.$message.success('保存成功')
          this.uploadLoading = false
          this.$emit("change",true)
          this.handleCancel()
        }
        this.uploadLoading = false
      })
    },
    handleClickDelete(){
      this.handleGetFilesDetail()
    },
    handleDeleteFile(file){
      delete this.filesDetailList[file.uuid]
      this.filesDetailList = Object.assign({},this.filesDetailList)
      console.log(this.filesDetailList)
    },
    handleCancel() {
      if (this.uploadLoading) {
        this.$message.warning('请等上传操作完毕再做操作，或直接刷新浏览器。')
        return
      }
      this.filesDetailList = {}
      this.form = null
      this.expandedRowKeys = []
      this.info = {}
      this.loading = false
      this.detailLoading = false
      this.uploadLoading = false
      this.visible = false
    },
  },
}
</script>
<style lang='less' scoped>
@import "~@/views/assets/less/index.less";
</style>