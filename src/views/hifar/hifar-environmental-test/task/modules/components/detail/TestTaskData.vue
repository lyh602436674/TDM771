<!--
 * @Author: 赵峰
 * @Date: 2021-11-05 10:40:54
 * @LastEditTime: 2021-11-05 13:49:35
 * @LastEditors: 赵峰
 * @Descripttion: 设备任务详情--试验数据组件
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\components\detail\TestTaskData.vue
-->
<template>
  <div style="height: 100%; overflow: auto">
    <h-card title="图片图谱" fixed style="height: auto">
      <h-upload-file style="width: 100%" v-model="pictureData" isWriteRemarks :isEdit="false"></h-upload-file>
    </h-card>
    <h-card title="附件" fixed style="height: auto">
      <h-form style="width: 100%" v-model="model_attach" ref="attachForm" :column="1" :formData="attachData"/>
    </h-card>
    <h-card title="视频" fixed style="height: auto">
      <h-form style="width: 100%" v-model="model_video" ref="videoForm" :column="1" :formData="videoData"/>
    </h-card>
  </div>
</template>

<script>
import {postAction} from '@/api/manage'

export default {
  name: 'testTaskData',
  props: ['testId'],
  data() {
    return {
      pictureData: [],
      model_attach: {},
      model_video: {},
      url: {
        attachList: '/MinioBusiness/listByRefId',
        delete: '/MinioBusiness/logicRemoveById',
      },
      attachData: [
        {
          title: '附件',
          key: 'attachIds',
          span: 1,
          component: (
            <h-upload-file
              v-decorator={['attachIds', { initialValue: [] }]}
              isEdit={false}
              customParams={{ refType: 'test_attach', refId: this.testId }}
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
              isEdit={false}
              customParams={{ refType: 'test_video', refId: this.testId }}
            />
          ),
        },
      ],
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.loadImgData()
      this.loadAttachData()
      this.loadVideoData()
    },
    // 图片
    loadImgData() {
      postAction(this.url.attachList, { refType: 'test_picture', refId: this.testId }).then((res) => {
        if (res.code == 200) {
          const { data } = res
          let fileArr = []
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
                remarks: item.remarks,
                type: item.viewType == 2 ? 'image/jpeg' : 'text/plain',
              })
            })
          }
          this.pictureData = fileArr
        }
      })
    },
    // 附件
    loadAttachData() {
      postAction(this.url.attachList, { refType: 'test_attach', refId: this.testId }).then((res) => {
        if (res.code == 200) {
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
        if (res.code == 200) {
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
              })
            })
          }
          obj.attachIds = fileArr
          this.model_video = obj
        }
      })
    },
  },
}
</script>