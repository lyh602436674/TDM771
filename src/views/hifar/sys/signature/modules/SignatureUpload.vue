<!--
 * @Author: 陈乾龙
 * @Date: 2021-05-26 16:59:45
 * @LastEditTime: 2021-10-28 15:28:05
 * @LastEditors: 赵峰
 * @Description: 上传/编辑签名签章
 * @FilePath: \hifar-platform-client\src\views\hifar\sys\signature\modules\SignatureUpload.vue
-->
<template>
  <h-modal
    title="签名签章"
    inner
    :width="548"
    :visible="visible"
    destroyOnClose
    :closable="false"
    :bodyStyle="{ padding: '3px' }"
    :getContainer="getContainer"
    @cancel="handleModalClose"
  >
    <div class="signature-wrapper">
      <a-descriptions :column="2" layout="vertical" size="small" bordered style="text-align: left; width: 100%">
        <a-descriptions-item label="签名" style="width: 50%">
          <h-upload-img v-model="autographUrl" :max="1" @change="handleAutographChange"></h-upload-img>
        </a-descriptions-item>
        <a-descriptions-item label="签章" style="width: 50%">
          <h-upload-img v-model="signatureUrl" :max="1" @change="handleSignatureChange"></h-upload-img>
        </a-descriptions-item>
      </a-descriptions>
    </div>
    <div slot="footer">
      <a-button type="danger" ghost @click="handleModalClose">取消</a-button>
      <a-button type="primary" @click="handleSubmit" :loading="loading">确认</a-button>
    </div>
  </h-modal>
</template>

<script>
import { postAction, deleteAction } from '@/api/manage'
import { isArray,isObject } from 'lodash'
import moment from 'moment'

export default {
  inject: {
    getContainer: {
      default: () => {
        return document.body
      },
    },
  },
  // 定义属性
  data() {
    return {
      moment,
      visible: false,
      loading: false,
      userInfo: {},
      autographUrl: '',
      signatureUrl: '',
      fileTwo: {},
      url: {
        uploadUrl: '/SysSignatureBusiness/modifySignatureByIds',
      },
    }
  },
  filters: {
    genderFilter(gender) {
      switch (parseInt(gender)) {
        case 1:
          return '男'
        case 2:
          return '女'
        default:
          return '保密'
      }
    },
    genderAvatarFilter(avatar, gender) {
      if (avatar) {
        return avatar
      }
      switch (gender) {
        case 2:
          return require('../../../../../assets/female.png')
        default:
          return require('../../../../../assets/male.png')
      }
    },
  },
  // 方法集合
  methods: {
    show(record = {}) {
      console.log(record)
      this.userInfo = Object.assign({}, record)
      this.autographUrl = this.userInfo.autographUrl || ''
      this.signatureUrl = this.userInfo.signatureUrl || ''
      this.visible = true
    },
    handleSubmit() {
      if (this.loading) return
      this.loading = true
      let signatureUrl = ''
      let autographUrl = ''
      if (this.signatureUrl && isArray(this.signatureUrl)) {
        signatureUrl = this.signatureUrl[0]
      } else {
        signatureUrl = this.signatureUrl
      }
      if (this.autographUrl && isArray(this.autographUrl)) {
        autographUrl = this.autographUrl[0]
      } else {
        autographUrl = this.autographUrl
      }
      let params = {
        id: this.userInfo.id,
        bucketPre: 'private',
        signatureUrl: isObject(signatureUrl) ? signatureUrl.url : signatureUrl,
        autographUrl: isObject(autographUrl) ? autographUrl.url : autographUrl,
      }
      postAction(this.url.uploadUrl, params).then((res) => {
        console.log(res)
        if (res.code === 200) {
          this.$message.success('上传成功')
          this.$emit('change', true)
          this.handleModalClose()
        }
        this.loading = false
      })
    },
    /**
     * @Date: 2021-08-31 14:06:24
     * @Author: 陈乾龙
     * @description: 删除操作
     * @param {*} type
     * @param {*} file
     */
    handleDeleteImage(type, file) {
      if (!file) return
      this.$confirm({
        title: '确认删除',
        content: '删除后无法恢复，确认删除？',
        onOk: async () => {
          let fileUrl = urlParse.parse(file)
          let fileInfo = fileUrl.path.split('/')
          let params = {}
          params.bucketName = fileInfo[1]
          params.fileName = fileInfo[fileInfo.length - 1]
          if (type == 1) {
            params.fileId = this.userInfo.fileIdOne
          } else {
            params.fileId = this.userInfo.fileIdTwo
          }
          let result = await deleteAction('/hifarsys/Signature/deleteSignature', params)
          if (result.success == true) {
            if (type == 1) {
              this.fileUrlOne = ''
              this.userInfo.fileUrlOne = ''
              this.userInfo.fileNameOne = ''
              this.userInfo.fileSizeOne = 0
              this.userInfo.fileTypeOne = ''
            } else {
              this.fileUrlTwo = ''
              this.fileUrlTwo = ''
              this.userInfo.fileUrlTwo = ''
              this.userInfo.fileNameTwo = ''
              this.userInfo.fileSizeTwo = 0
              this.userInfo.fileTypeTwo = ''
            }
          }
        },
      })
    },
    randomColor() {
      return '#' + ('00000' + ((Math.random() * 0x1000000) << 0).toString(16)).substr(-6)
    },
    handleAutographChange(val) {
      this.autographUrl = val[0] && val[0].url
      console.log('This autographUrl', this.autographUrl)
    },
    handleSignatureChange(val) {
      this.signatureUrl = val[0] && val[0].url
      console.log('this signature', this.signatureUrl)
    },
    handleModalClose() {
      this.userInfo = {}
      this.loading = false
      this.visible = false
    },
  },
}
</script>

<style lang='less'>
.signature-wrapper {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  .h-upload-img-list {
    width: 100%;
  }
}

.close-btn {
  border: 1px solid @danger-color;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  position: relative;
  p {
    width: 100%;
    border-top: 1px solid @danger-color;
    position: absolute;
    top: 50%;
    left: 50%;
  }
  &:nth-child(1) {
    transform: translate(-50%, -50%) rotateZ(45deg);
  }
  &:nth-child(2) {
    transform: translate(-50%, -50%) rotateZ(-45deg);
  }
}
</style>