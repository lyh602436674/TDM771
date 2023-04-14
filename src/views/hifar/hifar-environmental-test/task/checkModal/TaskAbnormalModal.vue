<!--
 * @Author: 赵峰
 * @Date: 2021-11-15 14:47:13
 * @LastEditTime: 2021-11-15 16:45:15
 * @LastEditors: 赵峰
 * @Descripttion: 试验异常记录---添加
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\checkModal\TaskAbnormalModal.vue
-->
<template>
  <h-modal
    :title="title"
    :getContainer="getContainer"
    inner
    width="95%"
    :visible="visible"
    destroyOnClose
    :confirmLoading="loading"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <h-desc :bordered="false">
      <h-card :bordered="false" style="width: 100%">
        <h-form
          style="width: 100%"
          v-model="model"
          ref="terRecordForm"
          :column="2"
          :formData="formData"
          @change="handleChange"
        />
      </h-card>
    </h-desc>
  </h-modal>
</template>

<script>
import moment from 'moment'
import {postAction} from '@/api/manage'
import PieceListSelect from '../../testRecord/components/PieceListSelect'

export default {
  name: 'TaskAbnormalModal',
  components: { PieceListSelect },
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  provide() {
    return {
      testId: () => {
        return this.testId
      },
    }
  },
  computed: {
    formData() {
      return [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '异常类型',
          key: 'exceptionType',
          formType: 'select',
          validate: {rules: [{required: true, message: '请选择异常类型'}]},
          options: [
            {title: '设备异常', key: 1, value: 1},
            {title: '样品异常', key: 2, value: 2},
            {title: '动力异常', key: 3, value: 3},
          ],
          change: (v, options) => {
            let values = this.$refs.terRecordForm.form.getFieldsValue()
            this.model = Object.assign({}, this.model, values, {
              exceptionType: v,
              dealStatus: 1,
            })
          },
        },
        {
          title: '处理状态',
          key: 'dealStatus',
          formType: 'select',
          span: 1,
          validate: {rules: [{required: true, message: '请选择处理状态'}]},
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
          change: (v, options) => {
            let values = this.$refs.terRecordForm.form.getFieldsValue()
            this.model = Object.assign({}, this.model, values, {
              dealStatus: v,
            })
          },
        },
        {
          title: '试验样品',
          key: 'testPieceId',
          hidden: this.model.exceptionType !== 2,
          validate: {rules: [{required: this.model.exceptionType === 2, message: '请选择试验样品'}]},
          component: (
            <piece-list-select
              ref="pieceListSelect"
              v-decorator={['testPieceId', {initialValue: []}]}
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
                this.model.pieceNo = pieceNoArr.length ? pieceNoArr.join(',') : ''
                this.$refs.terRecordForm.form.setFieldsValue({
                  pieceNo: pieceNoArr.length ? pieceNoArr.join(',') : '',
                  testPieceId: selectedRowKeys ? selectedRowKeys : [],
                })
              }}
            />
          ),
        },
        {
          title: '记录人',
          key: 'recordUserName',
          formType: 'input',
          validate: {rules: [{required: true, message: '请输入记录人'}]},
        },
        {
          title: '记录时间',
          key: 'recordTime',
          validate: {rules: [{required: true, message: '请选择记录时间'}]},
          component: (
            <h-time-select v-decorator={['recordTime', {rules: [{required: true, message: '请选择记录时间'}]}]}/>
          ),
        },
        {
          title: '异常说明',
          key: 'exceptionDesc',
          formType: 'textarea',
          span: 2,
          rows: 4,
        },
        {
          title: '附件',
          key: 'attachIds',
          component: <h-upload-file v-decorator={['attachIds', {initialValue: []}]}/>,
          span: 3,
        },
        {
          title: '处理人',
          key: 'dealUserName',
          formType: 'input',
          hidden: this.model.dealStatus === 1,
          span: 1,
          validate: {rules: [{required: this.model.dealStatus !== 1, message: '请输入处理人'}]},
        },
        {
          title: '处理时间',
          key: 'dealTime',
          span: 1,
          hidden: this.model.dealStatus === 1,
          validate: {rules: [{required: this.model.dealStatus !== 1, message: '请选择处理时间'}]},
          component: (
            <h-time-select v-decorator={['dealTime', {rules: [{required: false, message: '请选择处理时间'}]}]}/>
          ),
        },
        {
          title: '处理结果',
          key: 'dealDesc',
          formType: 'textarea',
          span: 3,
          hidden: this.model.dealStatus === 1,
          rows: 4,
        },
      ]
    },
  },
  data() {
    return {
      moment,
      title: '',
      visible: false,
      loading: false,
      model: {},
      type: null,
      testDetailData: {},
      testPieceIdArr: [],
      url: {
        errAdd: '/HfEnvTestExceptionBusiness/add',
        edit: '/HfEnvTestExceptionBusiness/modifyById',
        testDetail: '/HfEnvTaskTestBusiness/queryById',
        detail: '/HfEnvTestExceptionBusiness/queryById',
      },
      testId: '',
      equipId: '',
    }
  },
  methods: {
    show(type, record) {
      this.visible = true
      this.testId = record.id
      this.equipId = record.equipId
      this.type = type
      this.title = '异常：' + (record.testNames || record.unitNames) + '-' + record.testCode
      if (type === 'edit') {
        this.testDetailData = record
        this.loadDetail(record.id)
      } else {
        this.$set(this.model, 'dealStatus', 1)
      }
    },
    handleCancel() {
      this.visible = false
      this.model = {}
    },
    // 试验详情
    getTestDetail() {
      postAction(this.url.testDetail, { id: this.testId }).then((res) => {
        if (res.code === 200) {
          let testPieceInfo = res.data.testPieceInfo
          let pieceInfoArr = []
          if (testPieceInfo.length) {
            testPieceInfo.forEach((item) => {
              pieceInfoArr.push({
                title: item.pieceNo,
                key: item.id,
                value: item.id,
              })
            })
          }
          this.testDetailData = res.data
        }
      })
    },
    // 异常详情
    loadDetail(id) {
      postAction(this.url.detail, { id: id }).then((res) => {
        if (res.code === 200) {
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
          if (obj.exceptionType == 2) {
            this.$nextTick(() => {
              this.$refs.pieceListSelect.selectedName = obj.pieceNo
            })
          }
          this.model = obj
        }
      })
    },

    handleSubmit() {
      this.$refs.terRecordForm.validateForm()
    },
    handleChange(values) {
      if (this.loading) return
      this.loading = true
      let attachIds = []
      let params = {
        ...values,
        testId: this.testId,
      }
      let attachIdsArr = params.attachIds
      if (attachIdsArr && attachIdsArr.length > 0) {
        attachIdsArr.forEach((item) => {
          attachIds.push(item.fileId)
        })
      }
      params.testPieceId = params.testPieceId && params.testPieceId.length ? params.testPieceId.join(',') : ''
      params.attachIds = attachIds && attachIds.length > 0 ? attachIds.join(',') : ''
      params.recordTime = params.recordTime ? params.recordTime.valueOf() : ''
      params.dealTime = params.dealTime ? params.dealTime.valueOf() : ''
      let url = ''
      if (params.id) {
        url = this.url.edit
      } else {
        url = this.url.errAdd
      }
      postAction(url, params)
        .then((res) => {
          if (res.code === 200) {
            this.handleCancel()
            this.$emit('change', true)
          }
        })
        .finally((res) => {
          this.loading = false
        })
    },
  },
}
</script>

<style lang="less" scoped>
/deep/ .h-card-wrapper {
  height: auto;
}
</style>
