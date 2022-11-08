<!--
 * @Author: 赵峰
 * @Date: 2021-11-03 17:49:13
 * @LastEditTime: 2021-11-05 10:19:16
 * @LastEditors: 赵峰
 * @Descripttion: 试验异常记录弹窗（新增、编辑）
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\testRecord\modules\TestAbnormalRecordModal.vue
-->
<template>
  <h-modal
    :width="900"
    :getContainer="getContainer"
    :inner="true"
    fullScreen
    :visible="visible"
    destroyOnClose
    :title="title"
    :confirmLoading="loading"
    @submit="handleSubmit"
    @cancel="handleCancel"
  >
    <div style="padding: 15px 20px">
      <h-form v-model="model" ref="testAbnormalRecordForm" :column="2" :formData="formData" @change="handleChange">
      </h-form>
    </div>
  </h-modal>
</template>

<script>
import { isArray } from 'lodash'
import moment from 'moment'
import { postAction } from '@/api/manage'
import TestListSelect from '../components/TestListSelect'
import PieceListSelect from '../components/PieceListSelect'
export default {
  inject: ['getContainer'],
  components: {
    TestListSelect,
    PieceListSelect,
  },
  provide() {
    return {
      testId: () => {
        return this.model.testId
      },
      projectPieceInfo: () => {
        return this.projectPieceInfo
      },
    }
  },
  data() {
    return {
      moment,
      visible: false,
      title: '',
      loading: false,
      model: {},
      projectPieceInfo: {},
      formData: [],
      formDataBackUp: [
        [
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
                  this.model.testId = val[0]
                  this.model.testName = record[0].testNames
                }}
              />
            ),
          },
          {
            title: '异常类型',
            key: 'exceptionType',
            formType: 'select',
            validate: { rules: [{ required: true, message: '请选择异常类型' }] },
            options: [
              { title: '设备异常', key: 1, value: 1 },
              { title: '样品异常', key: 2, value: 2 },
              { title: '动力异常', key: 3, value: 3 },
            ],
            change: (v, options) => {
              this.model = Object.assign({}, this.model, {
                exceptionType: v,
              })
              if (v == 2) {
                this.formData = [].concat([], this.formDataBackUp[1])
              } else {
                this.formData = [].concat([], this.formDataBackUp[0])
              }
            },
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
              <h-time-select
                v-decorator={['recordTime', { rules: [{ required: false, message: '请选择记录时间' }] }]}
              />
            ),
          },
          {
            title: '异常说明',
            key: 'exceptionDesc',
            formType: 'textarea',
            span: 2,
            placeholder: '请输入异常说明',
          },
          {
            title: '处理状态',
            key: 'dealStatus',
            formType: 'select',
            span: 1,
            options: [
              {
                title: '未处理',
                key: 1,
                value: 1,
              },
              // {
              //   title: '处理中',
              //   key: 2,
              //   value: 2,
              // },
              {
                title: '已处理',
                key: 3,
                value: 3,
              },
            ],
          },
          {
            title: '处理人',
            key: 'dealUserName',
            formType: 'input',
            span: 1,
          },
          {
            title: '处理时间',
            key: 'dealTime',
            span: 1,
            validate: { rules: [{ required: false, message: '请选择处理时间' }] },
            component: (
              <h-time-select v-decorator={['dealTime', { rules: [{ required: false, message: '请选择处理时间' }] }]} />
            ),
          },
          {
            title: '处理结果',
            key: 'dealDesc',
            formType: 'textarea',
            span: 3,
            rows: 4,
          },
          {
            title: '附件',
            key: 'attachIds',
            span: 3,
            component: <h-upload-file showSecret={false} v-decorator={['attachIds', { initialValue: [] }]} />,
          },
        ],
        [
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
                  this.model.testId = val[0]
                  this.model.testName = record[0].testNames
                }}
              />
            ),
          },
          {
            title: '异常类型',
            key: 'exceptionType',
            formType: 'select',
            validate: { rules: [{ required: true, message: '请选择异常类型' }] },
            options: [
              { title: '设备异常', key: 1, value: 1 },
              { title: '样品异常', key: 2, value: 2 },
              { title: '动力异常', key: 3, value: 3 },
            ],
            change: (v, options) => {
              this.model = Object.assign({}, this.model, {
                exceptionType: v,
              })
              if (v == 2) {
                this.formData = [].concat([], this.formDataBackUp[1])
              } else {
                this.formData = [].concat([], this.formDataBackUp[0])
              }
            },
          },
          {
            title: '试验样品',
            key: 'testPieceId',
            validate: { rules: [{ required: true, message: '请选择试验样品' }] },
            component: (
              <piece-list-select
                ref="pieceListSelect"
                v-decorator={['testPieceId', { initialValue: [] }]}
                placeholder="请选择试验样品"
                type="checkbox"
                selectedName={() => {
                  return this.model.pieceNo
                }}
                onchange={(selectedRowKeys, record) => {
                  let pieceNoArr = []
                  if (record.length) {
                    record.forEach((item) => {
                      pieceNoArr.push(item.pieceNo)
                    })
                  }
                  this.model.testPieceId = selectedRowKeys
                  this.model.pieceNo = pieceNoArr.length ? pieceNoArr.join(',') : ''
                  this.$refs.testAbnormalRecordForm.form.setFieldsValue({
                    pieceNo: pieceNoArr.length ? pieceNoArr.join(',') : '',
                  })
                }}
              />
            ),
          },
          {
            title: '',
            key: 'pieceNo',
            formType: 'input',
            hidden: true,
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
              <h-time-select
                v-decorator={['recordTime', { rules: [{ required: false, message: '请选择记录时间' }] }]}
              />
            ),
          },
          {
            title: '异常说明',
            key: 'exceptionDesc',
            formType: 'textarea',
            span: 2,
            placeholder: '请输入异常说明',
          },
          {
            title: '处理状态',
            key: 'dealStatus',
            formType: 'select',
            span: 1,
            options: [
              {
                title: '未处理',
                key: 1,
                value: 1,
              },
              // {
              //   title: '处理中',
              //   key: 2,
              //   value: 2,
              // },
              {
                title: '已处理',
                key: 3,
                value: 3,
              },
            ],
          },
          {
            title: '处理人',
            key: 'dealUserName',
            formType: 'input',
            span: 1,
          },
          {
            title: '处理时间',
            key: 'dealTime',
            span: 1,
            validate: { rules: [{ required: false, message: '请选择处理时间' }] },
            component: (
              <h-time-select v-decorator={['dealTime', { rules: [{ required: false, message: '请选择处理时间' }] }]} />
            ),
          },
          {
            title: '处理结果',
            key: 'dealDesc',
            formType: 'textarea',
            span: 3,
            rows: 4,
          },
          {
            title: '附件',
            key: 'attachIds',
            span: 3,
            component: <h-upload-file showSecret={false} v-decorator={['attachIds', { initialValue: [] }]} />,
          },
        ],
      ],
      url: {
        add: '/HfEnvTestExceptionBusiness/add',
        edit: '/HfEnvTestExceptionBusiness/modifyById',
        detail: '/HfEnvTestExceptionBusiness/queryById',
      },
    }
  },
  methods: {
    show(record = {}, title) {
      this.visible = true
      this.title = title
      if (record.exceptionType == 2) {
        this.formData = [].concat([], this.formDataBackUp[1])
      } else {
        this.formData = [].concat([], this.formDataBackUp[0])
      }
      if (record.id) {
        this.loadDetail(record.id)
      } else {
        record.exceptionType = 1
        this.edit(record)
      }
    },
    edit(record = {}) {
      this.model = Object.assign({}, record)
    },
    loadDetail(id) {
      postAction(this.url.detail, { id: id }).then((res) => {
        if (res.code == 200) {
          const { data } = res
          let obj = Object.assign({}, data)
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
                type: item.viewType == 2 ? 'image/jpeg' : 'text/plain',
              })
            })
          }
          obj.attachIds = fileArr ? fileArr : []
          obj.recordTime = obj.recordTime && obj.recordTime != 0 ? moment(parseFloat(obj.recordTime)) : ''
          obj.dealTime = obj.dealTime && obj.dealTime != 0 ? moment(parseFloat(obj.dealTime)) : ''
          obj.testPieceId = obj.testPieceId ? obj.testPieceId.split(',') : []
          this.$nextTick(() => {
            this.$refs.testListSelect.selectedName = obj.testNames
            this.$refs.pieceListSelect.selectedName = obj.pieceNo
          })
          this.model = obj
        }
      })
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
      if (attachIdsArr && attachIdsArr.length > 0) {
        attachIdsArr.forEach((item) => {
          attachIds.push(item.fileId)
        })
      }
      params.attachIds = attachIds && attachIds.length > 0 ? attachIds.join(',') : ''
      params.testId = isArray(params.testId) ? params.testId[0] : params.testId
      params.recordTime = params.recordTime ? params.recordTime.valueOf() : ''
      params.dealTime = params.dealTime ? params.dealTime.valueOf() : ''
      params.testPieceId = params.testPieceId && params.testPieceId.length ? params.testPieceId.join(',') : ''
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
      this.$refs.testAbnormalRecordForm.validateForm()
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style lang='less' scoped>
</style>