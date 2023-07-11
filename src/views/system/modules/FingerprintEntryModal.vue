<template>
  <h-modal
    destroyOnClose
    title="指纹录入"
    :width="450"
    :visible="visible"
    :getContainer="getContainer"
    :confirmLoading="confirmLoading"
    @submit="handleOk"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <div class="modal-content">
      <img v-if="srcBase64" :src="'data:image/png;base64,' + srcBase64" alt="指纹图片">
    </div>
  </h-modal>
</template>

<script>
import { postAction } from '@api/manage'
import { FingerpinttMixin } from '@/mixins/FingerprintMixin'

export default {
  name: 'FingerprintEntryModal',
  mixins: [FingerpinttMixin],
  inject: {
    getContainer: {
      default: () => {
        return document.body
      }
    }
  },
  data() {
    return {
      visible: false,
      confirmLoading: false,
      url: {
        save: 'BaseUserBusiness/collectionFingerprint'
      }
    }
  },
  mounted() {
  },
  methods: {
    show() {
      this.visible = true
      this.init()

      this.timer = setInterval(() => {
        this.getTemplate()
      }, 10)
    },
    handleOk() {
      console.log('data', this.data)
      if (this.data == null) {
        this.$message.info('请采集指纹!')
        return
      }
      this.$emit('change', this.data)
      this.handleCancel();
   /*   postAction(this.url.save, { userId: '', data: this.data }).then(res => {
        if (res.code === 200) {
          this.handleCancel();
        } else {
          this.$message.error('保存失败!')
        }
      }) */
    },
    handleCancel() {
      this.visible = false
      this.relink()
      this.timer = null
      this.data = null;
      this.srcBase64 = null;
    }
  }
}
</script>

<style scoped lang="less">
/deep/ .ant-modal-body {
  position: relative;
  height: 350px;
}

.modal-content {
  width: 260px;
  height: 260px;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  margin: auto;
  border: 1px solid #e8e3e3;
  border-radius: 30px;

  img {
    width: 100%;
    height: 100%;
  }
}
</style>
