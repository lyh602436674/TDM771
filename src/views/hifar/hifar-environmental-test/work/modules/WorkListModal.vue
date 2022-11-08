<!--
 * @Author: 赵峰
 * @Date: 2021-10-25 14:45:40
 * @LastEditTime: 2021-10-26 09:52:56
 * @LastEditors: 赵峰
 * @Descripttion: 岗位管理增改弹窗
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\work\modules\WorkListModal.vue
-->
<template>
  <h-modal
    :width="600"
    :getContainer="getContainer"
    :inner="true"
    :visible="visible"
    destroyOnClose
    :title="title"
    :confirmLoading="loading"
    @submit="handleSubmit"
    @cancel="handleCancel"
  >
    <h-form v-model="model" ref="workCenterForm" :width="600" :column="1" :formData="formData" @change="handleChange">
    </h-form>
  </h-modal>
</template>

<script>
import { postAction } from '@/api/manage'
export default {
  inject: ['getContainer'],
  data() {
    return {
      visible: false,
      title: '操作',
      loading: false,
      model: {},
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '岗位名称',
          key: 'postName',
          formType: 'input',
          placeholder: '请输入岗位名称',
          validate: { rules: [{ required: true, message: '请输入岗位名称' }] },
        },
        {
          title: '岗位编号',
          key: 'postCode',
          formType: 'input',
          placeholder: '请输入岗位名称',
          validate: { rules: [{ required: true, message: '请输入岗位编号' }] },
        },
        {
          title: '岗位类型',
          key: 'postType',
          formType: 'select',
          validate: { rules: [{ required: true, message: '请选择岗位类型' }] },
          options: [
            { title: '高管', value: 1, key: 1 },
            { title: '中层', value: 2, key: 2 },
            { title: '基层', value: 3, key: 3 },
            { title: '其他', value: 4, key: 4 },
          ],
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
          span: 2,
          placeholder: '请输入备注信息',
        },
        {
          title: '排序号',
          key: 'rowSort',
          span: 2,
          component: (
            <a-input-number
              placeholder="请输入排序号"
              v-decorator={['rowSort', { initialValue: 1000 }]}
              style="width:100%;"
            />
          ),
        },
      ],
      url: {
        add: '/OrgPostBusiness/add',
        edit: '/OrgPostBusiness/modifyById',
      },
    }
  },
  methods: {
    add(record = {}) {
      this.edit(record)
    },
    edit(record = {}) {
      this.model = Object.assign({}, record)
      this.visible = true
    },
    handleChange(values) {
      if (this.loading) return
      this.loading = true
      let url = null
      if (values.id) {
        url = this.url.edit
      } else {
        url = this.url.add
      }
      postAction(url, values)
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