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
        <h-upload-img-collect
          v-model="modelImage"
          :customParams="{refType: 'hf_env_test_piece_img', refId,isInReport:1}"
          :isEdit="isEdit"
          :max="100"
          style="width: 100%;"
          :multiple="true"
          :isCollect="true"
          :isInReport="true"
          :propsData="propsData"
          accept="image/png,image/gif,image/jpg,image/jpeg"
          @delete="handleDelete"
          @success="loadImgData"
          @collect="handleCollect"
        />
      </h-desc>
      <h-desc :bordered="false" title="视频">
        <h-upload-file-collect
          v-model="modelVideo"
          :customParams="{refType: 'hf_env_test_piece', refId}"
          :isEdit="isEdit"
          :propsData="propsData"
          style="width: 100%;"
          @delete="handleDelete"
        />
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
  props: {
    isEdit: {
      type: Boolean,
      default: true,
    }
  },
  computed: {
    propsData() {
      return {
        equipId: this.equipId,
        pieceId: this.record.id,
        pieceNo: this.record.pieceNo,
        productName: this.record.productName,
      }
    },
  },
  data() {
    return {
      moment,
      visible: false,
      refId: "",
      equipId: "",
      modelVideo: [],
      modelImage: [],
      record: {},
      popoverVisible: false,
      url: {
        delete: '/MinioBusiness/logicRemoveById',
        attachList: '/MinioBusiness/listByRefId',
        collectVideo: "/HfEnvPieceBusiness/recordVideo",
        collectImage: "/HfEnvPieceBusiness/takePhoto",
        updateIsInReport: "/HfEnvTaskTestBusiness/updateFileStatus"
      },
    }
  },
  methods: {
    show(record, equipId) {
      this.visible = true
      this.refId = record.id
      this.record = record
      this.equipId = equipId
      this.loadImgData()
      this.loadVideoData()
    },
    handleCancel() {
      this.visible = false
      this.$emit('close')
    },
    handleCollect(file) {
      let params = {
        refId: this.refId,
        fileId: file.fileId,
        isInReport: file.isInReport,
      }
      postAction(this.url.updateIsInReport, params).then(res => {
        if (res.code === 200) {
          this.$message.success('更新成功');
        } else {
          this.$message.warning('更新失败');
        }
      })
    },
    loadImgData() {
      postAction(this.url.attachList, {refType: 'hf_env_test_piece_img', refId: this.refId}).then((res) => {
        if (res.code === 200) {
          const {data} = res
          if (data && data.length) {
            this.modelImage = this.dataFormat(data)
          }
        }
      })
    },
    loadVideoData() {
      postAction(this.url.attachList, {refType: 'hf_env_test_piece', refId: this.refId}).then((res) => {
        if (res.code === 200) {
          const {data} = res
          if (data && data.length) {
            this.modelVideo = this.dataFormat(data)
          }
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
          isInReport: item.isInReport,
          uuid: item.id,
          percent: 100,
          uploadTime: item.createTime,
          type: item.viewType === 2 ? 'image/jpeg' : 'text/plain',
        }
      })
    },
  }
}
</script>

<style scoped>

</style>