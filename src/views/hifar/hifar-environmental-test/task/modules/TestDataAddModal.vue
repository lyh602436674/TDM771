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
    :footer="null"
    @cancel="handleCancel"
  >
    <a-button slot="footer" type="ghost-danger" @click="handleCancel"> 关闭 </a-button>
    <div style="height: 100%; overflow: auto; padding: 0 20px">
      <h-desc title="附件" :bordered="false">
        <h-form ref="attachForm" v-model="model_attach" :column="1" :formData="attachData" style="width: 100%"/>
      </h-desc>
      <h-desc title="视频" :bordered="false">
        <h-form ref="videoForm" v-model="model_video" :column="1" :formData="videoData" style="width: 100%"/>
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
      model_attach: {},
      model_video: {},
      testId: '',
      url: {
        attachList: '/MinioBusiness/listByRefId',
        testAttachList: '/HfEnvTaskTestBusiness/listByRefId',
        delete: '/MinioBusiness/logicRemoveById',
        updateFileStatus:'/HfEnvTestPressureRecordBusiness/updateFileStatus'
      },
      attachData: [
        {
          title: '附件',
          key: 'attachIds',
          span: 1,
          component: (
            <h-upload-file
                v-decorator={['attachIds', { initialValue: [] }]}
                customParams={{ refType: 'test_attach', refId: this.testId }}
                on-delete={this.handleDelete}
            />
          ),
        },
      ],
      videoData: [
        {
          title: '视频',
          key: 'attachIds',
          span: 1,
          component: (
            <h-upload-file
              v-decorator={['attachIds', { initialValue: [] }]}
              customParams={{ refType: 'test_video', refId: this.testId }}
              on-delete={this.handleDelete}
            />
          ),
        },
      ],
    }
  },
  methods: {
    show(record) {
      this.visible = true
      this.title = record.testNames + '(' + record.testCode + ') - 试验数据'
      this.testId = record.id
      this.attachData[0].component.componentOptions.propsData.customParams.refId = record.id
      this.videoData[0].component.componentOptions.propsData.customParams.refId = record.id
      this.loadData()
    },
    handleCancel() {
      this.visible = false
    },
    loadData() {
      this.loadAttachData()
      this.loadVideoData()
    },
    // 附件
    loadAttachData() {
      postAction(this.url.testAttachList, { refType: 'test_attach', refId: this.testId }).then((res) => {
        if (res.code === 200) {
          const { data } = res
          let fileArr = []
          let obj = {}
          if (data && data.length > 0) {
            data.forEach((item) => {
              fileArr.push({
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
                rowSort: item.rowSort
              })
            })
          }
          obj.attachIds = fileArr
          this.model_attach = obj
        }
      })
    },
    // 视频
    loadVideoData() {
      postAction(this.url.attachList, { refType: 'test_video', refId: this.testId }).then((res) => {
        if (res.code === 200) {
          const { data } = res
          let fileArr = []
          let obj = {}
          if (data && data.length > 0) {
            data.forEach((item) => {
              fileArr.push({
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
                replaceStatus:item.replaceStatus
              })
            })
          }
          obj.attachIds = fileArr
          this.model_video = obj
        }
      })
    },
    // 图片删除
    handleDelete(file, fileList) {
      postAction(this.url.delete, { id: file.fileId }).then(() => {
        this.$message.success('删除成功')
      })
    },
  },
}
</script>