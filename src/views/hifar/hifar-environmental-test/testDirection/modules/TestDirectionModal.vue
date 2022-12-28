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
import {getAction, postAction} from "@api/manage";

export default {
  name: "TestDirectionModal",
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
      treeData: [],
      url: {
        add: "/HfResTestDirection/add",
        edit: "/HfResTestDirection/modifyById",
        tree: "/HfResTestDirection/listTree"
      }
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
          title: '上级目录',
          key: 'pid',
          formType: 'treeSelect',
          showSearch: true,
          treeNodeFilterProp: "title",
          treeData: this.treeData
        },
        {
          title: '设备方向名称',
          key: 'directionName',
          formType: 'input',
          validate: {
            rules: [{required: true, message: '请输入设备方向名称'}],
          },
        },
        {
          title: '本级排序号',
          key: 'rowSort',
          formType: 'input',
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
      this.model = Object.assign({}, record, {pid: record.pid !== '0' ? record.pid : undefined})
      this.getTreeData()
    },
    recursive(arr) {
      return arr.map(item => {
        return {
          ...item,
          title: item.directionName,
          key: item.id,
          value: item.id,
          children: item.children && item.children.length ? this.recursive(item.children) : []
        }
      })
    },
    getTreeData() {
      this.confirmLoading = true
      getAction(this.url.tree).then((res) => {
        if (res.code === 200) {
          this.treeData = this.recursive(res.data)
        }
      }).finally(() => this.confirmLoading = false)
    },
    handleCancel() {
      this.visible = false
    },
    handleSubmit() {
      this.confirmLoading = true
      this.$refs.productModalForm.validateForm()
    },
    submitHandle(values) {
      if (!values) return this.confirmLoading = false
      const {add, edit} = this.url
      postAction(!values.id ? add : edit, values).then((res) => {
        if (res.code === 200) {
          this.$message.success(!values.id ? '添加成功' : "编辑成功")
          this.$emit('change',this.model)
          this.handleCancel()
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