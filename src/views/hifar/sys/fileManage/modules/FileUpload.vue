<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-03 17:09:53
 * @LastEditTime: 2021-10-08 15:17:50
 * @LastEditors: 赵峰
 * @Description: 文件上传弹窗
 * @FilePath: \hifar-platform-client\src\views\hifar\sys\fileManage\modules\FileUpload.vue
-->
<template>
  <h-modal
    title="上传文件"
    inner
    :width="800"
    :getContainer="getContainer"
    :visible="visible"
    :footer="false"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <h-upload-file
      ref="folderFiles"
      v-model="filesList"
      :customParams="{ pid: pid, publicFlag: publicFlag }"
      @change="handleFilesChange"
      @delete="deleteHandle"
    />
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
  data() {
    return {
      visible: false,
      filesList: [],
      url: {
        delete: '/BaseFolderFileBusiness/logicRemoveById',
      },
      pid: 0,
      publicFlag: '2',
    }
  },
  methods: {
    show() {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.folderFiles.url = {
          auth: '/BaseFolderFileBusiness/authUpload',
          finished: '/BaseFolderFileBusiness/finishUpload',
        }
      })
    },
    handleSubmit() {
      if (this.filesList.length <= 0) {
        this.$message.warning('请上传文件')
        return
      }
    },
    handleCancel() {
      this.filesList = []
      this.visible = false
    },
    handleFilesChange(files) {
      this.filesList = files
      this.$emit('change', true)
    },
    deleteHandle(file) {
      console.log('deleteHandle>>>>>>>>>>>', file)
      this.handleDelete(file.fileId)
    },
    // 删除文件
    handleDelete(ids) {
      postAction(this.url.delete, { id: ids }).then((res) => {
        if (res.code == 200) {
          console.log('delete finished')
          this.$emit('change', true)
        }
      })
    },
  },
}
</script>

<style>
</style>