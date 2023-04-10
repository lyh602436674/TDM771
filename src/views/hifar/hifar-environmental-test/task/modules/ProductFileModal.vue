<template>
  <h-modal
    :getContainer='getContainer'
    :visible='visible'
    fullScreen
    destroyOnClose
    inner
    title="试件图片"
    @cancel='handleCancel'
  >
    <a-button slot="footer" type="ghost-danger" @click="handleCancel"> 关闭</a-button>
    <div class="collapse-wrapper">
      <a-collapse v-model="activeKey">
        <a-collapse-panel v-for="(item,index) in imageComponentList" :key="item.direction"
                          :header="item.title" class="collapseStyle">
          <h-desc :bordered="false">
            <h-upload-img-collect
              v-model="modelImage[item.direction]"
              :customParams="{refType: 'hf_env_test_piece_img', refId, isInReport: item.isInReport, testDirection:item.title}"
              :isEdit="isEdit"
              :max="100"
              :propsData="Object.assign({},propsData,{testDirection: item.direction})"
              accept="image/png,image/gif,image/jpg,image/jpeg"
              isCollect
              isInReport
              multiple
              style="width: 100%;"
              watermark
              @collect="handleCollect"
              @delete="handleDelete"
              @finishUpload="file => handleUploadSuccess(file,item.direction,item.isInReport)"
              @success="loadImgData"
            />
          </h-desc>
        </a-collapse-panel>
      </a-collapse>
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
        productAlias: this.record.productAlias,
      }
    },
  },
  data() {
    return {
      imageComponentList: [
        {title: "试前-X向", isInReport: 1, direction: "x_before"},
        {title: "试前-Y向", isInReport: 1, direction: "y_before"},
        {title: "试前-Z向", isInReport: 1, direction: "z_before"},
        {title: "试中-X向", isInReport: 2, direction: "x_middle"},
        {title: "试中-Y向", isInReport: 2, direction: "y_middle"},
        {title: "试中-Z向", isInReport: 2, direction: "z_middle"},
        {title: "试后-X向", isInReport: 2, direction: "x_after"},
        {title: "试后-Y向", isInReport: 2, direction: "y_after"},
        {title: "试后-Z向", isInReport: 2, direction: "z_after"},
      ],
      moment,
      visible: false,
      refId: "",
      equipId: "",
      modelVideo: [],
      modelImage: [],
      activeKey: [],
      record: {},
      popoverVisible: false,
      url: {
        delete: '/MinioBusiness/logicRemoveById',
        attachList: '/MinioBusiness/listByRefId',
        collectVideo: "/HfEnvPieceBusiness/recordVideo",
        collectImage: "/HfEnvPieceBusiness/takePhoto",
        updateIsInReport: "/HfEnvTaskTestBusiness/updateFileStatus",
        updateFileRefDirection: "/HfEnvTaskTestBusiness/updateFileRefDirection",
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
      this.modelImage = []
      this.$emit('close')
    },
    handleUploadSuccess(file, refDirection, isInReport) {
      /*
      * 试验前：
        x_before、y_before、z_before
        试验中：
        x_middle、y_middle、z_middle
        试验后：
        x_after、y_after、z_after
      * */
      // 上传完成后，更新图片的试验方向和是否进报告
      // 因为后台公共上传文件类没有接收这两个字段，只能上传完后再更新一下
      postAction(this.url.updateFileRefDirection, {fileId: file.fileId, refDirection})
      postAction(this.url.updateIsInReport, {refId: this.refId, fileId: file.fileId, isInReport,})
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
            this.modelImage = data.reduce((acc, obj) => {
              if (acc[obj.refDirection]) {
                acc[obj.refDirection].push(this.fileObjFormat(obj));
              } else {
                acc[obj.refDirection] = [this.fileObjFormat(obj)];
              }
              return acc;
            }, {});
            this.activeKey = Object.keys(this.modelImage)
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
    fileObjFormat(obj) {
      return Object.assign({}, obj, {
        fileId: obj.id,
        size: obj.fileSize,
        status: obj.status === 9 ? 'success' : 'exception',
        url: obj.filePath,
        name: obj.fileName,
        isInReport: obj.isInReport,
        uuid: obj.id,
        percent: 100,
        uploadTime: obj.createTime,
        type: obj.viewType === 2 ? 'image/jpeg' : 'text/plain',
        refDirection: obj.refDirection
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

<style lang="less" scoped>
/deep/ .collapse-wrapper {
  height: 100%;
  overflow: auto;
  padding: 10px 20px;

  .ant-collapse-item > .ant-collapse-header {
    padding: 5px 5px 5px 40px;
  }

  .ant-collapse-content > .ant-collapse-content-box {
    padding: 10px;
  }
}

</style>