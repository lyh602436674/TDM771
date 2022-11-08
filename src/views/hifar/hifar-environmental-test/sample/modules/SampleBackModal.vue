<!--
 * @Author: 赵峰
 * @Date: 2021-08-17 17:00:20
 * @LastEditTime: 2021-09-18 11:35:15
 * @LastEditors: 赵峰
 * @Descripttion: 试品归还
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\sample\modules\SampleBackModal.vue
-->
<template>
  <h-modal
    title="归还"
    inner
    destroyOnClose
    :visible="visible"
    :getContainer='getContainer'
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <h-form
      ref="sampleBackForm"
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
      url: '/HfEnvPieceBusiness/back',
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
          title: '归还人',
          key: 'optUserName',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入归还人' }],
          },
        },
        {
          title: '',
          key: 'pieceCnum',
          formType: 'input',
          hidden: true,
        },
        {
          title: '归还数量',
          key: 'optNum',
          component:<a-input-number style='width:100%;' min={1} placeholder='归还数量'/>,
          validate: {
            rules: [{ required: true, message: '请输入归还数量' }],
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
          title: '备注',
          key: 'remarks',
          validate: {
            rules: [{ required: true, message: '请输入备注' }],
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
      this.model = obj
    },
    handleCancel() {
      this.queryParams = {}
      this.visible = false
    },
    handleSubmit() {
      this.$refs.sampleBackForm.validateForm()
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