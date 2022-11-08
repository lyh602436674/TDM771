<!--
 * @Author: 赵峰
 * @Date: 2021-08-17 17:04:10
 * @LastEditTime: 2021-09-18 11:35:37
 * @LastEditors: 赵峰
 * @Descripttion: 试品处置
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\sample\modules\SampleDealModal.vue
-->
<template>
  <h-modal
    title="处置"
    inner
    destroyOnClose
    :getContainer='getContainer'
    :visible="visible"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <h-form
      ref="sampleDealForm"
      v-model="model"
      :column="1"
      :formData="formData"
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
      model: {},
      url: '/HfEnvPieceBusiness/deal',
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          key: 'optUserId',
          formType: 'input',
          hidden: true,
        },
        {
          title: '处置人',
          key: 'optUserName',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入处置人' }],
          },
        },
        {
          title: '',
          key: 'pieceCnum',
          formType: 'input',
          hidden: true,
        },
        {
          title: '处置数量',
          key: 'optNum',
          component:<a-input-number style='width:100%;' min={1} placeholder='处置数量'/>,
          validate: {
            rules: [{ required: true, message: '请输入处置数量' }],
          },
        },
        {
          title: '操作时间',
          key: 'optTime',
          formType: 'datePick',
          validate: {
            rules: [{ required: true, message: '请选择操作时间' }],
          },
        },
        {
          title: '处置方式',
          key: 'remarks',
          validate: {
            rules: [{ required: true, message: '请输入处置方式' }],
          },
          formType: 'textarea',
          span: 2,
        },
      ],
    }
  },

  methods: {
    show(record) {
      this.visible = true
      let obj = Object.assign({}, record)
      obj.remarks =  null
      obj.optTime =  moment()
      obj.optUserId =  0
      this.model = obj
    },
    handleCancel() {
      this.queryParams = {}
      this.visible = false
    },
    handleSubmit() {
      this.$refs.sampleDealForm.validateForm()
    },
    submitHandle(values) {
      if (this.confirmLoading) return
      this.confirmLoading = false
      let params = {
        ...values,
      }
      params.optTime = moment(params.optTime).valueOf()
      let url = this.url
      postAction(url, params).then((res) => {
        if (res.code == 200) {
          this.$message.success('操作成功')
          this.handleCancel()
          this.$emit('change',true)
        }
      })
    },
  },
}
</script>
<style lang='less' scoped>
</style>