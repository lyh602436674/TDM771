<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-06 11:48:34
 * @LastEditTime: 2021-10-08 15:31:01
 * @LastEditors: 赵峰
 * @Description: 分享弹窗
 * @FilePath: \hifar-platform-client\src\views\hifar\sys\fileManage\modules\FileShareModal.vue
-->
<template>
  <h-modal
    title="分享文件"
    inner
    :getContainer="getContainer"
    :visible="visible"
    :maskClosable="false"
    destroyOnClose
    :confirmLoading="loading"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <h-form v-if="visible" v-model="model" ref="fileShareForm" :column="1" :formData="formData" @change="submit" />
  </h-modal>
</template>

<script>
import { postAction } from '@/api/manage'
import { createTree } from '@/utils/hasPermission'
import { filter } from 'lodash'
export default {
  inject: {
    getContainer: {
      default: () => {
        return document.body
      },
    },
  },
  data() {
    return {
      visible: false,
      loading: false,
      model: {},
      formData: [
        {
          title: '分享给',
          key: 'userIds',
          component: null,
          validate: {
            rules: [{ required: true, message: '请选择用户' }],
          },
        },
        {
          title: '备注信息',
          key: 'remarks',
          formType: 'input',
        },
      ],
      localTree: [],
      fileIds: null,
      treeData: [],
      replaceFields: {
        children: 'children',
        title: 'name',
        value: 'id',
        key: 'id',
      },
      url: {
        list: '/OrgDeptUserBusiness/listForDeptUser',
        share: '/BaseFolderFileBusiness/shareFile',
      },
    }
  },
  methods: {
    async show(fileIds = []) {
      this.fileIds = fileIds.join(',')
      this.treeData = await this.getUserList()
      this.formData[0].component = this.$createElement('a-tree-select', {
        props: {
          placeholder: '点击选择用户',
          replaceFields: this.replaceFields,
          filterTreeNode:this.filterTreeNodeHandle,
          allowClear: true,
          dropdownStyle: { maxHeight: '400px', overflow: 'auto' },
          treeData: this.treeData,
          multiple: true,
          treeCheckable: true
        },
        directives: [
          {
            name: 'decorator',
            value: ['userIds'],
          },
        ],
        on: {
          change: (value, label, extra) => {
            console.log(value, label, extra)
          },
        },
      })
      this.$nextTick(() => {
        this.visible = true
      })
    },
    getUserList() {
      return postAction(this.url.list).then((res) => {
        if (res.code == 200) {
          let treeData = []
          this.localTree = res.data
          createTree(this.localTree, treeData, null, '0')
          return treeData
        } else {
          return []
        }
      })
    },
    handleSubmit() {
      this.$refs.fileShareForm.validateForm()
    },
    // 提交数据
    submit(values) {
      let users = filter(this.localTree, (obj) => {
        return values.userIds.includes(obj.id) && obj.type != 'dept'
      })
      console.log('选中的用户', users)
      let userIds = users.map((item) => {
        return item.id
      })
      if (!userIds || userIds.length <= 0) {
        this.$message.warning('该部门下没有用户可分享')
        return
      }
      if (this.loading) return
      this.loading = true
      let params = {
        fileIds: this.fileIds,
        userIds: userIds ? userIds.join(',') : [],
        remarks: values.remarks,
      }
      postAction(this.url.share, params)
        .then((res) => {
          if (res.code == 200) {
            this.$message.success('分享成功')
            this.$emit('change', true)
            this.handleCancel()
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleCancel() {
      this.visible = false
    },
    filterTreeNodeHandle (input, treeNode) {
      return treeNode.data.props.title.includes(input)
    }
  },
}
</script>

<style lang="less" scoped>
</style>