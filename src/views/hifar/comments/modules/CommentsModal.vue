<!--
 * @Author: 赵峰
 * @Date: 2021-08-24 10:06:23
 * @LastEditTime: 2021-10-27 17:31:36
 * @LastEditors: 赵峰
 * @Descripttion: 用户意见编辑、新增
 * @FilePath: \hifar-platform-client\src\views\hifar\comments\modules\CommentsModal.vue
-->
<template>
  <h-modal
    :title="title"
    inner
    destroyOnClose
    :visible="visible"
    :width="drawerWidth"
    :getContainer="getContainer"
    :confirm-loading="confirmLoading"
    @submit="handleClickSubmit"
    @cancel="handleCancel"
  >
    <h-form
      ref="commentsForm"
      v-if="visible"
      v-model="model"
      :formData="formData"
      :column="1"
      @change="submitHandle"
    ></h-form>
  </h-modal>
</template>

<script>
import moment from 'moment'
import { postAction } from '@/api/manage'
import SysUserSelect from '@/views/components/SysUserSelect'
import SuggestModuleSelect from './SuggestModuleSelect'
export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  components: {
    SysUserSelect,
    SuggestModuleSelect,
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
        add: '/BaseUserSuggestBusiness/add',
        edit: '/BaseUserSuggestBusiness/modifyById',
        detailById: '/BaseUserSuggestBusiness/queryById',
      },
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '所属模块',
          key: 'suggestModuleCode',
          component: (
            <suggest-module-select
              v-decorator={[
                'suggestModuleCode',
                { rules: [{ required: true, message: '请选择所属模块' }], initialValue: undefined },
              ]}
              onchange={(val, option = {}) => {
                this.$refs.commentsForm.form.setFieldsValue({ suggestModuleName: option[0] })
              }}
            />
          ),
        },
        {
          key: 'suggestModuleName',
          formType: 'input',
          hidden: true,
        },
        {
          title: '意见类型',
          key: 'suggestTypeCode',
          formType: 'dict',
          dictCode: 'hr_suggest_type',
          validate: {
            rules: [{ required: true, message: '请选择意见类型' }],
          },
          change: (val, option) => {
            this.$refs.commentsForm.form.setFieldsValue({ suggestTypeName: option.title })
          },
        },
        {
          title: '',
          key: 'suggestTypeName',
          formType: 'input',
          hidden: true,
        },
        {
          title: '提出人',
          key: 'suggestUserId',
          component: (
            <sys-user-select
              v-decorator={['suggestUserId', { initialValue: undefined }]}
              v-on:change={this.managerChange}
            ></sys-user-select>
          ),
        },
        {
          title: '提出时间',
          key: 'suggestTime',
          formType: 'datePick',
        },
        {
          title: '问题描述',
          key: 'suggestContent',
          formType: 'textarea',
          validate: {
            rules: [{ required: true, message: '请输入问题描述' }],
          },
          style: {
            height: '160px',
          },
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
      this.model = Object.assign({}, record)
      let userInfo = this.$ls.get('Login_Userinfo')
      if (userInfo) {
        this.model.suggestUserId = userInfo.id
      }
      if (record.id) {
        this.loadDetail(record.id)
      } else {
        this.editor(record)
      }

      this.$nextTick(() => {
        this.visible = true
      })
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
      obj.suggestTime = obj.suggestTime && obj.suggestTime != 0 ? moment(parseFloat(obj.suggestTime)) : moment()
      obj.attachIds = fileArr ? fileArr : []
      this.model = Object.assign({}, this.model, obj)
    },
    handleClickSubmit() {
      this.$refs.commentsForm.validateForm()
    },
    // 提交
    submitHandle(values) {
      if (this.confirmLoading) return
      this.confirmLoading = false
      let url = null
      let attachIds = []
      let params = {
        ...values,
      }
      let attachIdsArr = params.attachIds
      if (attachIdsArr.length > 0) {
        attachIdsArr.forEach((item) => {
          attachIds.push(item.fileId)
        })
      }
      params.attachIds = attachIds.length > 0 ? attachIds.join(',') : ''
      params.suggestTime = params.suggestTime && params.suggestTime != 0 ? params.suggestTime.valueOf() : ''

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
    },
    managerChange(val, option) {
      this.$refs.commentsForm.form.setFieldsValue({ suggestUserName: option.idName })
    },
  },
}
</script>

<style lang='less' scoped>
</style>