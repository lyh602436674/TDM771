<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-03 14:02:35
 * @LastEditTime: 2021-09-13 11:08:53
 * @LastEditors: 陈乾龙
 * @Description: 文件夹信息编辑修改弹窗
 * @FilePath: \hifar-platform-client\src\views\hifar\sys\fileManage\modules\FolderEditModal.vue
-->
<template>
  <h-modal
    inner
    :title="title"
    :visible="visible"
    destroyOnClose
    :getContainer="getContainer"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <h-form v-if="visible" v-model="model" ref="folderForm" :column="1" :formData="formData" @change="submit" />
  </h-modal>
</template>

<script>
import { postAction } from '@/api/manage'
export default {
  inject: {
    getContainer: {
      default: () => {
        return () => document.body
      },
    },
  },
  props: {
    publicFlag: {
      typeof: [Number, String],
    },
  },
  data() {
    return {
      visible: false,
      title: '操作',
      model: {},
      folderList: [],
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '上级目录',
          key: 'pid',
          component: null,
        },
        {
          title: '目录名称',
          key: 'fileName',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入目录名称' }],
          },
        },
        {
          title: '排序号',
          key: 'rowSort',
          component: <a-input-number />,
          validate: {
            rules: [{ required: true, message: '请输入排序号' }],
            initialValue: 1,
          },
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
        },
      ],
      url: {
        add: '/BaseFolderFileBusiness/addFolder',
        edit: '/BaseFolderFileBusiness/modifyFolderById',
      },
    }
  },
  methods: {
    show(record = {}) {
      this.model = Object.assign({}, record)
      if (this.model.id) {
        this.title = '编辑目录'
      } else {
        this.title = '新建目录'
      }
      this.formData[1].component = this.$createElement('a-tree-select', {
        props: {
          allowClear: true,
          showSearch: true,
          placeholder: '请选择上级目录',
          treeData: this.folderList,
        },
        scopedSlots: {
          customTitle: (text, record) => {
            console.log('>>>>>>>>>>>', text, '<<<>>', record)
            return (
              <span>
                <a-icon class="warning-text" type="folder" />
                {}
              </span>
            )
          },
        },
        directives: [
          {
            name: 'decorator',
            value: ['pid'],
          },
        ],
      })
      this.$nextTick(() => {
        this.visible = true
      })
    },
    submit(values) {
      let url = null
      let params = {
        ...values,
        publicFlag: this.publicFlag,
      }
      if (values.id) {
        url = this.url.edit
      } else {
        url = this.url.add
      }
      if (!values.pid) {
        values.pid = 0
      }
      postAction(url, params).then((res) => {
        if (res.code == 200) {
          this.$message.success(this.title + '成功')
          this.$emit('change', true)
          this.handleCancel()
        }
      })
    },
    handleSubmit() {
      this.$refs.folderForm.validateForm()
    },
    handleCancel() {
      this.model = {}
      this.visible = false
    },
  },
}
</script>

<style>
</style>
