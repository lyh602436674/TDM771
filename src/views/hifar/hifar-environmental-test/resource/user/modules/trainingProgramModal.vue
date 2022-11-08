<!--
 * @Author: 赵峰
 * @Date: 2021-08-05 11:31:03
 * @LastEditTime: 2021-11-17 16:47:20
 * @LastEditors: 马潭龙
 * @Descripttion: 培训计划--添加/编辑
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\user\modules\trainingProgramModal.vue
-->
<template>
  <h-modal
    :title="title"
    :visible="visible"
    :width="drawerWidth"
    inner
    :getContainer="getContainer"
    :confirm-loading="confirmLoading"
    @submit="handleClickSubmit"
    @cancel="handleCancel"
  >
    <h-form
      ref="trainingProgramForm"
      v-if="visible"
      v-model="model"
      :width="drawerWidth - 48"
      :formData="formData"
      :column="2"
      @change="submitHandle"
    ></h-form>
  </h-modal>
</template>

<script>
import moment from 'moment'
import { getAction, postAction } from '@/api/manage'
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
      drawerWidth: 800,
      isopen: false,
      title: '添加',
      url: {
        add: '/HfResPersonTrainPlanBusiness/add',
        edit: '/HfResPersonTrainPlanBusiness/modifyById',
      },
      model: {},
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '计划名称',
          key: 'trainTheme',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入计划名称' }],
          },
        },
        {
          title: '年度',
          key: 'trainYear',
          formType: 'yearPick',
          validate: {
            rules: [{ required: true, message: '请选择年度' }],
          },
        },
        {
          title: '培训内容',
          key: 'trainContent',
          formType: 'textarea',
          span: 2,
          validate: {
            rules: [
              { required: true, message: '请输入培训内容' },
              { max: 256, message: '培训内容不能超过256个字符' },
            ],
          },
        },
        {
          title: '培训人员',
          key: 'trainTeacher',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入培训人员' }],
          },
        },
        {
          title: '培训方式',
          key: 'trainMode',
          formType: 'select',
          options: [
            { title: '线下', value: 1, key: 1 },
            { title: '线上', value: 2, key: 2 },
          ],
          validate: {
            rules: [{ required: true, message: '请选择培训方式' }],
          },
        },
        {
          title: '开始时间',
          key: 'startTime',
          formType: 'datePick',
          validate: {
            rules: [{ required: true, validator: this.validateStartTime }],
          },
        },
        {
          title: '结束时间',
          key: 'endTime',
          formType: 'datePick',
          validate: {
            rules: [
              {
                required: true,
                validator: this.validateEndTime,
              },
            ],
          },
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
          span: 2,
          validate: {
            rules: [
              { max: 256, message: '备注不能超过255个字符' },
            ],
          },
        },
      ],
    }
  },
  methods: {
    show(record, title) {
      this.title = title
      this.visible = true
      this.editor(record)
    },
    editor(record) {
      let obj = Object.assign({}, record)
      obj.startTime = obj.startTime && obj.startTime != 0 ? moment(parseFloat(obj.startTime)) : ''
      obj.endTime = obj.endTime && obj.endTime != 0 ? moment(parseFloat(obj.endTime)) : ''
      obj.trainYear = obj.trainYear && obj.trainYear != 0 ? moment(parseFloat(obj.trainYear)) : moment()
      this.model = obj
    },
    handleClickSubmit() {
      this.$refs.trainingProgramForm.validateForm()
    },
    // 提交
    submitHandle(values) {
      if (this.confirmLoading) return
      this.confirmLoading = false
      let params = {
        ...values,
      }
      let url = null
      if (params.id) {
        url = this.url.edit
      } else {
        url = this.url.add
      }
      params.startTime = params.startTime && params.startTime != 0 ? params.startTime.valueOf() : ''
      params.endTime = params.endTime && params.endTime != 0 ? params.endTime.valueOf() : ''
      params.trainYear = moment(params.trainYear).format('YYYYY')
      params.trainYear = moment(params.trainYear).format('X') * 1000

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
      this.modal = {}
    },
    validateStartTime(rule, value, cb) {
      let endTime = this.$refs.trainingProgramForm.form.getFieldsValue(['endTime'])
      let valEnd = endTime.endTime
      let val = value ? moment(value).valueOf() : ''
      valEnd = valEnd ? moment(valEnd).valueOf() : ''
      if (!val) {
        cb('请选择开始时间')
      } else {
        if (valEnd && (val > valEnd)) {
          cb('开始时间不能大于结束时间')
        } else {
          cb()
        }
      }
    },
    validateEndTime(rule, value, cb) {
      let startTime = this.$refs.trainingProgramForm.form.getFieldsValue(['startTime'])
      let valStart = startTime.startTime
      let val = value ? moment(value).valueOf() : ''
      valStart = valStart ? moment(valStart).valueOf() : ''
      if (!val) {
        cb('请选择结束时间')
      } else {
        if (valStart && (val < valStart)) {
          cb('结束时间不能小于开始时间')
        } else {
          cb()
        }
      }
    },
  },
}
</script>
<style lang='less' scoped>
</style>