<!--
 * @Author: 赵峰
 * @Date: 2021-11-12 11:19:01
 * @LastEditTime: 2021-11-25 11:53:27
 * @LastEditors: 马潭龙
 * @Descripttion: 试验数据---添加弹窗
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\TestDataAddModal.vue
-->
<template>
  <h-modal
    :title="title"
    destroyOnClose
    inner
    fullScreen
    :getContainer="getContainer"
    :visible="visible"
    @cancel="handleCancel"
  >
    <a-button slot="footer" type="ghost-danger" @click="handleCancel"> 关闭 </a-button>
    <div style="height: 100%; overflow: auto; padding: 0 20px">
      <h-desc title="振动图谱" :bordered="false">
        <h-upload-file
          v-model="attachIds"
          :customParams="{refType: 'test_attach', refId: this.testId}"
          accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          style="width: 100%"
          @change="handleFilesChange"
          @delete="handleDelete"
        />
      </h-desc>
      <h-desc title="视频" :bordered="false">
        <h-upload-file
          v-model="videoAttachIds"
          :customParams="{refType: 'test_video', refId: this.testId}"
          style="width: 100%"
          @delete="handleDeleteByVideo"
        />
      </h-desc>
    </div>
  </h-modal>
</template>
<script>
import {postAction} from '@/api/manage'

export default {
  name: 'testTaskData',
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  data() {
    return {
      title: '',
      visible: false,
      attachIds: [],
      videoAttachIds: [],
      testId: '',
      url: {
        attachList: '/MinioBusiness/listByRefId',
        testAttachList: '/HfEnvTaskTestBusiness/listByRefId',
        delete: '/MinioBusiness/logicRemoveById',
        updateFileStatus: '/HfEnvTestPressureRecordBusiness/updateFileStatus',
        saveSerial: '/HfEnvTaskTestBusiness/saveSerial',
      },
      serialBeforeRecord: "",
    }
  },
  methods: {
    show(record) {
      this.visible = true
      this.title = (record.testNames || record.unitNames) + '(' + record.testCode + ') - 试验数据'
      this.testId = record.id
      this.loadData()
    },
    handleCancel() {
      this.visible = false
    },
    loadData() {
      this.loadAttachData()
      this.loadVideoData()
    },
    // 振动图谱
    loadAttachData() {
      postAction(this.url.testAttachList, { refType: 'test_attach', refId: this.testId }).then((res) => {
        if (res.code === 200) {
          const {data} = res
          this.attachIds = data && data.length && data.map((item) => {
            return {
              fileId: item.id,
              size: item.fileSize,
              status: item.status == 9 ? 'success' : 'exception',
              url: item.filePath,
              name: item.fileName,
              uuid: item.id,
              percent: 100,
              uploadTime: item.createTime,
              secretLevel: item.secretLevel,
              type: item.viewType == 2 ? 'image/jpeg' : 'text/plain',
              replaceStatus: item.replaceStatus,
              rowSort: item.rowSort,
              // serial: item.serial,
            }
          }) || []
        }
      })
    },
    // 视频
    loadVideoData() {
      postAction(this.url.attachList, { refType: 'test_video', refId: this.testId }).then((res) => {
        if (res.code === 200) {
          const {data} = res
          this.videoAttachIds = data && data.length && data.map((item) => {
            return {
              fileId: item.id,
              size: item.fileSize,
              status: item.status == 9 ? 'success' : 'exception',
              url: item.filePath,
              name: item.fileName,
              uuid: item.id,
              percent: 100,
              uploadTime: item.createTime,
              secretLevel: item.secretLevel,
              type: item.viewType == 2 ? 'image/jpeg' : 'text/plain',
              replaceStatus: item.replaceStatus
            }
          }) || []
        }
      })
    },
    // 图片删除
    handleDelete(file, fileList) {
      postAction(this.url.delete, {id: file.fileId}).then(() => {
        this.$message.success('删除成功')
        this.attachIds = fileList
      })
    },
    handleDeleteByVideo(file, fileList) {
      postAction(this.url.delete, {id: file.fileId}).then(() => {
        this.$message.success('删除成功')
        this.videoAttachIds = fileList
      })
    },
    handleFilesChange(fileList) {
      this.attachIds = fileList
      // for (let i = 0; i < fileList.length; i++) {
      //   let serial = fileList[i].serial || i + 1
      //   this.$set(this.attachIds[i], 'serial', serial)
      // }
      // this.saveSerial(this.attachIds)
    },
    // handleSerialFocus(e, record) {
    //   this.serialBeforeRecord = e.target.value
    // },
    // handleSerialBlur(record) {
    //   if (!record.serial || this.serialBeforeRecord === record.serial) return
    //   this.saveSerial([{...record, refId: this.testId}], true)
    // },
    // saveSerial(data, msg) {
    //   postAction(this.url.saveSerial, {data}).then(res => {
    //     if (res.code === 200) {
    //       msg && this.$message.success('序列号保存成功')
    //     }
    //   })
    // },
  },
}
</script>