<template>
  <a-popover :title="showWrite ? '是否填写驳回意见？' : '确定驳回吗？'" :visible='popoverVisible'
             placement='topLeft' trigger='click'>
    <div slot="content">
      <div style='width:100%; margin-top: 10px; display: flex; justify-content: right}'>
        <a-button @click="handleCancel">取消</a-button>
        <a-button style="margin-left:5px" type="danger" @click="handleReject">驳回</a-button>
        <a-button v-if="showWrite" style="margin-left:5px" type="primary" @click="handleGo">填写</a-button>
      </div>
    </div>
    <div @click="show">
      <slot></slot>
    </div>
  </a-popover>
</template>

<script>
export default {
  name: "ReportRejectPopover",
  data() {
    return {
      popoverVisible: false,
    }
  },
  props: {
    showWrite: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    show() {
      this.popoverVisible = true
    },
    handleCancel() {
      this.popoverVisible = false
    },
    handleReject() {
      this.$emit('reject')
      this.handleCancel()
    },
    handleGo() {
      this.$emit('write')
      this.handleCancel()
    },
  }

}
</script>

<style lang="less" scoped>
/deep/ .ant-popover-title {
  font-size: 16px;
}

</style>