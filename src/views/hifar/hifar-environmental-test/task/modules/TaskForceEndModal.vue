<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-28 17:42:49
 * @LastEditTime: 2021-11-15 14:35:26
 * @LastEditors: 赵峰
 * @Description: 终止试验记录-----弹窗
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\TaskForceEndModal.vue
-->
<template>
  <h-modal
    :getContainer="getModalContainer"
    :title="title"
    :visible="visible"
    destroyOnClose
    inner
    width="90%"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <h-desc :bordered="false">
      <h-card :bordered="false" style="width: 100%">
        <h-form ref="taskForceEndForm" v-model="model" :column="2" :formData="formData" style="width: 100%"/>
      </h-card>
    </h-desc>
  </h-modal>
</template>

<script>
import moment from 'moment'
import {postAction} from '@/api/manage'

export default {
  name: 'TaskForceEndModal',
  props: {
    forceEndUrl: {
      type: String,
      required: false,
      default: '',
    },
    testDetailUrl: {
      type: String,
      required: false,
      default: '',
    },
  },
  data() {
    return {
      moment,
      title: '',
      visible: false,
      model: {},
      type: null,
      testDetailData: {},
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '记录人',
          key: 'recordUserName',
          formType: 'input',
          validate: {
            rules: [
              {
                required: true,
                message: '请输入记录人',
              },
            ],
          },
        },
        {
          title: '记录时间',
          key: 'recordTime',
          span: 1,
          validate: {rules: [{required: false, message: '请选择记录时间'}]},
          component: (
            <h-time-select v-decorator={['recordTime', {rules: [{required: false, message: '请选择记录时间'}]}]}/>
          ),
        },
        {
          title: '终止说明',
          key: 'forceEndDesc',
          formType: 'textarea',
          span: 2,
          rows: 4,
        },
        {
          title: '附件',
          key: 'attachIds',
          component: <h-upload-file v-decorator={['attachIds', {initialValue: []}]}/>,
          span: 2,
        },
      ],
      // url: {
      //   forceEnd: '/HfEnvTestForceEndBusiness/forceEnd',
      //   testDetail: '/HfEnvTaskTestBusiness/queryById',
      // },
    }
  },
  methods: {
    show(type, record) {
      this.model = Object.assign({}, record)
      this.type = type
      this.title = '终止：' + (record.testNames || record.unitNames || record.testName || record.unitName) + ( record.testCode ? '-' + record.testCode : '')
      this.model.optTime = moment()
      this.$nextTick(() => {
        this.visible = true
      })
      this.getTestDetail()
    },
    getTestDetail() {
      postAction(this.testDetailUrl, {id: this.model.id}).then((res) => {
        if (res.code == 200) {
          this.testDetailData = res.data
        }
      })
    },
    handleCancel() {
      this.visible = false
    },
    handleSubmit() {
      const {
        $refs: {taskForceEndForm},
      } = this
      const taskForce_end_form = new Promise((resolve, reject) => {
        taskForceEndForm.form.validateFields((err, values) => {
          if (err) {
            reject(err)
            return
          }
          resolve(values)
        })
      })
      Promise.all([taskForce_end_form]).then((values) => {
        let attachIds = []
        let params = {
          ...values[0],
          testId: this.model.id,
        }
        let attachIdsArr = params.attachIds
        if (attachIdsArr.length > 0) {
          attachIdsArr.forEach((item) => {
            attachIds.push(item.fileId)
          })
        }
        params.attachIds = attachIds.length > 0 ? attachIds.join(',') : ''
        params.recordTime = params.recordTime ? params.recordTime.valueOf() : ''
        postAction(this.forceEndUrl, params).then((res) => {
          if (res.code === 200) {
            this.handleCancel()
            this.$emit('change', this.type, params)
          } else {
            this.$message.warning(res.msg)
          }
        })
      })
    },
    getModalContainer() {
      return document.getElementById('page-content')
    },
  },
}
</script>
<style lang="less" scoped>
/deep/ .h-card-wrapper {
  height: auto;
}
</style>
