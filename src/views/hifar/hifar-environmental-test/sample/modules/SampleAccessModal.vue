<!--
 * @Author: 赵峰
 * @Date: 2021-08-17 16:25:47
 * @LastEditTime: 2021-09-22 16:14:04
 * @LastEditors: 赵峰
 * @Descripttion: 试品接收
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\sample\modules\SampleAccessModal.vue
-->
<template>
  <h-modal
    title="确认接收"
    inner
    destroyOnClose
    :width="800"
    :getContainer="getContainer"
    :visible="visible"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <h-form ref="sampleAccessForm" v-model="model" :column="1" :formData="formData" @change="submitHandle"></h-form>
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
      visible: false,
      moment,
      model: {},
      url: '/HfEnvPieceBusiness/receive',
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
          title: '送样人',
          key: 'optUserName',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入送样人' }],
          },
        },
        {
          title: '',
          key: 'pieceCnum',
          formType: 'input',
          hidden: true,
        },
        {
          title: '确认数量',
          key: 'optNum',
          validate: {
            rules: [{ required: true, message: '请输入确认数量' }],
          },
          component: (
            <a-input-number
              style="width:100%;"
              min={1}
              v-decorator={['optNum', { initialValue: '' }]}
              placeholder="请输入库存上限"
            />
          ),
        },
        {
          title: '接收时间',
          key: 'optTime',
          formType: 'datePick',
          validate: {
            rules: [{ required: true, message: '请选择接收时间' }],
          },
        },
        {
          title: '来样状态',
          key: 'remarks',
          validate: {
            rules: [{ required: true, message: '请输入来样状态' }],
          },
          formType: 'textarea',
          span: 2,
        },
        {
          title: '试品图片',
          key: 'attachIds',
          span: 3,
          component: (
            <h-upload-img
              multiple={true}
              max={6}
              accept="image/png,image/gif,image/jpg,image/jpeg"
              v-decorator={['attachIds', { initialValue: [] }]}
            />
          ),
        },
      ],
    }
  },

  methods: {
    show(record) {
      this.visible = true
      let obj = Object.assign({}, record)
      obj.optNum = obj.pieceNum
      obj.pieceCnum = obj.pieceCnum
      obj.optTime = moment()
      obj.optUserId = 0
      obj.remarks = '完好'
      this.model = obj
    },
    handleCancel() {
      this.queryParams = {}
      this.visible = false
    },
    handleSubmit() {
      this.$refs.sampleAccessForm.validateForm()
    },
    submitHandle(values) {
      if (this.confirmLoading) return
      this.confirmLoading = false
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
      params.optTime = moment(params.optTime).valueOf()

      console.log(params)
      let url = this.url
      postAction(url, params).then((res) => {
        if (res.code == 200) {
          this.$message.success('操作成功')
          this.handleCancel()
          this.$emit('change', true)
        }
      })
    },
  },
}
</script>
<style lang='less' scoped>
</style>