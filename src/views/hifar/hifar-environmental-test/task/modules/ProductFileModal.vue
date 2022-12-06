<template>
  <h-modal
    :getContainer='getContainer'
    :visible='visible'
    :width="1200"
    destroyOnClose
    inner
    title="试件图片"
    @cancel='handleCancel'
  >
    <a-button slot="footer" type="ghost-danger" @click="handleCancel"> 关闭</a-button>
    <div style="height: 100%; overflow: auto; padding: 0 20px">
      <h-desc :bordered="false" title="图片">
        <h-form ref="imageForm" v-model="model_image" :column="1" :formData="imageData" style="width: 100%"/>
      </h-desc>
      <h-desc :bordered="false" title="视频">
        <h-form ref="videoForm" v-model="model_video" :column="1" :formData="videoData" style="width: 100%"/>
      </h-desc>
    </div>
  </h-modal>
</template>

<script>
import {postAction} from "@api/manage";
import moment from 'moment'
import HUploadFileCollect from './components/HCustomUpload/HUploadFileCollect.js'
import HUploadImgCollect from './components/HCustomUpload/HUploadImgCollect.js'

export default {
  name: "ProductFileModal",
  components: {
    HUploadFileCollect, HUploadImgCollect
  },
  inject: {
    getContainer: {
      default: () => document.body
    }
  },
  data() {
    return {
      moment,
      visible: false,
      refId: "",
      model_image: {},
      model_video: {},
      imageData: [
        {
          title: '图片',
          key: 'attachIds',
          span: 1,
          component: (
            <h-upload-img-collect
              multiple={true}
              max={100}
              customParams={{refType: 'hf_env_test_piece_img', refId: this.refId}}
              accept="image/png,image/gif,image/jpg,image/jpeg"
              v-decorator={['attachIds', {initialValue: []}]}
              on-delete={this.handleDelete}
              onSuccess={this.loadImgData}
            />
          ),
        }
      ],
      videoData: [
        {
          title: '视频',
          key: 'attachIds',
          span: 1,
          component: (
            <h-upload-file-collect
              v-decorator={['attachIds', {initialValue: []}]}
              customParams={{refType: 'hf_env_test_piece', refId: this.refId}}
              on-delete={this.handleDelete}
            />
          ),
        },
      ],
      popoverVisible: false,
      url: {
        delete: '/MinioBusiness/logicRemoveById',
        attachList: '/MinioBusiness/listByRefId',
        collectVideo: "/HfEnvPieceBusiness/recordVideo",
        collectImage: "/HfEnvPieceBusiness/takePhoto",
      },
    }
  },
  methods: {
    show(record, equipId) {
      this.visible = true
      this.refId = record.id
      this.imageData[0].component.componentOptions.propsData.customParams.refId = record.id
      this.videoData[0].component.componentOptions.propsData.customParams.refId = record.id
      this.videoData[0].component.componentOptions.propsData.propsData = {
        equipId: equipId,
        pieceId: record.id,
        pieceNo: record.pieceNo,
        productName: record.productName,
      }
      this.imageData[0].component.componentOptions.propsData.propsData = {
        equipId: equipId,
        pieceId: record.id,
        pieceNo: record.pieceNo,
        productName: record.productName,
      }
      this.loadImgData()
      this.loadVideoData()
    },
    handleCancel() {
      this.visible = false
      this.$emit('close')
    },
    loadImgData() {
      postAction(this.url.attachList, {refType: 'hf_env_test_piece_img', refId: this.refId}).then((res) => {
        if (res.code === 200) {
          const {data} = res
          let fileArr = []
          let obj = {}
          if (data && data.length) {
            fileArr = this.dataFormat(data)
          }
          obj.attachIds = fileArr
          this.model_image = obj
        }
      })
    },
    loadVideoData() {
      postAction(this.url.attachList, {refType: 'hf_env_test_piece', refId: this.refId}).then((res) => {
        if (res.code === 200) {
          const {data} = res
          let fileArr = []
          let obj = {}
          if (data && data.length) {
            fileArr = this.dataFormat(data)
          }
          obj.attachIds = fileArr
          this.model_video = obj
        }
      })
    },
    handleDelete(file) {
      postAction(this.url.delete, {id: file.fileId}).then(() => {
        this.$message.success('删除成功')
      })
    },
    dataFormat(arr) {
      return arr.map(item => {
        return {
          ...item,
          fileId: item.id,
          size: item.fileSize,
          status: item.status === 9 ? 'success' : 'exception',
          url: item.filePath,
          name: item.fileName,
          uuid: item.id,
          percent: 100,
          uploadTime: item.createTime,
          secretLevel: item.secretLevel,
          type: item.viewType === 2 ? 'image/jpeg' : 'text/plain',
          replaceStatus: item.replaceStatus,
          rowSort: item.rowSort
        }
      })
    },
  }
}
</script>

<style scoped>

</style>