<template>
  <h-modal
    :confirm-loading="confirmLoading"
    :getContainer="getContainer"
    :title="title"
    :visible="visible"
    :width="800"
    destroyOnClose
    inner
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <a-spin :spinning="confirmLoading">
      <h-form
        ref="productModalForm"
        v-model="model"
        :column="1"
        :formData="formData"
        @change="submitHandle"
      ></h-form>
    </a-spin>
  </h-modal>
</template>

<script>
import {postAction} from '@/api/manage'

export default {
  name: "ProductCategoryModal",
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  data() {
    return {
      title: "",
      visible: false,
      confirmLoading: false,
      model: {},
      treeData: []
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
          title: '上级产品分类',
          key: 'categoryId',
          formType: 'treeSelect',
          treeData: this.treeData
        },
        {
          title: '分类名称',
          key: 'categoryName',
          formType: 'input',
          validate: {
            rules: [{required: true, message: '请输入分类名称'}],
          },
        },
        {
          title: '分类编码',
          key: 'categoryCode',
          formType: 'input',
          validate: {
            rules: [{required: true, message: '请输入分类编码'}],
          },
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
        },
      ]
    },
  },
  methods: {
    show(record, type) {
      this.title = type + '分类'
      this.visible = true
      this.model = record || {}
      this.getTreeData()
    },
    getTreeData() {
      this.confirmLoading = true
      setTimeout(() => {
        this.treeData = [
          {
            title: 'Node1',
            value: '0-0',
            key: '0-0',
            children: [
              {
                value: '0-0-1',
                key: '0-0-1',
                title: 'title',
              },
              {
                title: 'Child Node2',
                value: '0-0-2',
                key: '0-0-2',
              },
            ],
          },
          {
            title: 'Node2',
            value: '0-1',
            key: '0-1',
          },
        ]
        this.confirmLoading = false
      }, 500)
    },
    handleCancel() {
      this.visible = false
    },
    handleSubmit() {
      this.confirmLoading = true
      this.$refs.productModalForm.validateForm()
    },
    submitHandle(values) {
      if (!values) {
        this.confirmLoading = false
      }
      postAction(this.url.save, values).then((res) => {
        if (res.code === 200) {
          this.$message.success('添加成功')
          this.$emit('change')
        }
      }).finally(() => {
        this.confirmLoading = false
      })

    },
  }
}
</script>

<style scoped>

</style>