<!--
 * @Author: 赵峰
 * @Date: 2021-11-03 15:56:18
 * @LastEditTime: 2021-11-04 11:17:28
 * @LastEditors: 赵峰
 * @Descripttion: 异常终止记录新增、编辑
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\testRecord\modules\TestTerminateRecordModal.vue
-->
<template>
  <h-modal
    :width="900"
    :getContainer="getContainer"
    :inner="true"
    :visible="visible"
    destroyOnClose
    :title="title"
    :confirmLoading="loading"
    @submit="handleSubmit"
    @cancel="handleCancel"
  >
    <h-form v-model="model" ref="workCenterForm" :column="1" :formData="formData" @change="handleChange"> </h-form>
  </h-modal>
</template>

<script>
import { isArray } from 'lodash'
import { postAction } from '@/api/manage'
import TestListSelect from '../components/TestListSelect'
export default {
  inject: ['getContainer'],
  components: {
    TestListSelect,
  },
  data() {
    return {
      visible: false,
      title: '',
      loading: false,
      model: {},
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '试验',
          key: 'testId',
          validate: { rules: [{ required: true, message: '请选择试验' }] },
          component: (
            <test-list-select
              ref="testListSelect"
              v-decorator={['testId', { initialValue: [] }]}
              selectedName={() => {
                return this.model.testName
              }}
              onchange={(val, record) => {
                this.model.testName = record[0].testNames
              }}
            />
          ),
        },
        {
          title: '记录人',
          key: 'recordUserName',
          formType: 'input',
          placeholder: '请输入记录人',
          validate: { rules: [{ required: true, message: '请输入记录人' }] },
        },
        {
          title: '记录时间',
          key: 'recordTime',
          validate: { rules: [{ required: false, message: '请选择记录时间' }] },
          component: (
            <h-time-select v-decorator={['recordTime', { rules: [{ required: false, message: '请选择记录时间' }] }]} />
          ),
        },
        {
          title: '终止描述',
          key: 'forceEndDesc',
          formType: 'textarea',
          span: 2,
          placeholder: '请输入终止描述',
        },
        {
          title: '附件',
          key: 'attachIds',
          span: 3,
          component: <h-upload-file showSecret={false} v-decorator={['attachIds', { initialValue: [] }]} />,
        },
      ],
      url: {
        add: '/HfEnvTestForceEndBusiness/forceEnd',
        edit: '/HfEnvTestForceEndBusiness/modifyById',
      },
    }
  },
  methods: {
    show(record = {}, title) {
      this.title = title
      this.edit(record)
    },
    edit(record = {}) {
      this.model = Object.assign({}, record)
      this.visible = true
    },
    handleChange(values) {
      let attachIds = []
      if (this.loading) return
      this.loading = true
      let url = null
      let params = {
        ...values,
      }
      let attachIdsArr = params.attachIds
      if (attachIdsArr.length > 0) {
        attachIdsArr.forEach((item) => {
          attachIds.push(item.fileId)
        })
      }
      params.attachIds = attachIds && attachIds.length > 0 ? attachIds.join(',') : ''
      params.testId = isArray(params.testId) ? params.testId[0] : params.testId
      params.recordTime = params.recordTime ? params.recordTime.valueOf() : ''
      if (params.id) {
        url = this.url.edit
      } else {
        url = this.url.add
      }
      postAction(url, params)
        .then((res) => {
          if (res.code == 200) {
            this.$message.success(this.title + '成功')
            this.$emit('change')
            this.handleCancel()
          }
        })
        .finally((res) => {
          this.loading = false
        })
    },
    handleSubmit() {
      this.$refs.workCenterForm.validateForm()
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style lang='less' scoped>
</style>