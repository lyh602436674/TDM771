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
export default {
  name: "FingerprintEntryModal",
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
      confirmLoading: false,
      srcBase64: ""
    }
  },
  methods: {
    show() {
      this.visible = true;
    },
    handleOk() {
    },
    handleCancel() {
      this.visible = false
    },
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