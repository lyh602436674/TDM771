<!--
 * @Author: 赵峰
 * @Date: 2021-09-22 17:02:17
 * @LastEditTime: 2021-10-14 09:57:21
 * @LastEditors: 赵峰
 * @Descripttion: 报告封面弹窗
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\reports\modules\ReportCoverModal.vue
-->
<template>
  <h-modal
    title="选择报告封面"
    inner
    destroyOnClose
    :getContainer="getContainer"
    :visible="visible"
    :keyboard="false"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <a-form
      :form="form"
      ref="ReportCheckForm"
      :label-col="{ span: 3 }"
      :wrapper-col="{ span: 21 }"
      @submit="handleSubmit"
    >
      <a-form-item label="封面">
        <h-select
          v-decorator="['coverTemplateId', { rules: [{ required: true, message: '请选择封面!' }] }]"
          placeholder="请选择"
        >
          <template slot="default">
            <a-select-option v-for="(item, index) in coverList" :key="index" :title="item.title" :value="item.value">
              {{ item.title }}
            </a-select-option>
          </template>
        </h-select>
      </a-form-item>
    </a-form>
  </h-modal>
</template>

<script>
import { postAction } from '@/api/manage'
export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },

  data() {
    return {
      form: this.$form.createForm(this, { name: 'ReportCheckForm' }),
      visible: false,
      model: {},
      coverList: [],
      url: {
        cover: '/HfEnvReportBusiness/reportCoverList',
      },
    }
  },
  created() {
    this.loadCoverData()
  },

  methods: {
    handleCancel() {
      this.visible = false
    },
    loadCoverData() {
      postAction(this.url.cover, {}).then((res) => {
        if (res.code == 200) {
          let coverList = []
          let { data } = res
          data.forEach((item) => {
            coverList.push({
              title: item.name,
              value: item.id,
              key: item.id,
            })
          })
          this.coverList = coverList
        }
      })
    },
    handleSubmit(values) {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.$emit('change', values)
          this.handleCancel()
        }
      })
    },
  },
}
</script>
<style lang='less' scoped>
</style>