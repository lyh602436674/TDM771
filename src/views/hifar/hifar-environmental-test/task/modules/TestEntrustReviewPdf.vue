<!--
 * @Author: 雷宇航
 * @Date: 2022-06-30 10:28:54
 * @fileName: TestEntrustReviewPdf.vue
 * @FilePath: tdm200-client\src\views\hifar\hifar-environmental-test\task\modules\TestEntrustReviewPdf.vue
 * @Description: 委托单PDF预览
-->
<template>
  <h-modal
    :getContainer="getContainer"
    :visible="visible"
    destroyOnClose
    fullScreen
    inner
    title="委托单预览"
    @cancel="handleCancel"
  >
    <template slot="footer">
      <a-button type="ghost-danger" @click="handleCancel">关闭</a-button>
    </template>
    <div class="iframeBox">
      <iframe
        v-if="reportPath"
        ref='iframe'
        :src='reportPath'
        frameborder='0'
        height='100%'
        scrolling='auto'
        width='100%'
      />
      <a-empty v-else/>
    </div>
  </h-modal>
</template>

<script>
export default {
  name: "TestEntrustReviewPdf",
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  data() {
    return {
      visible: false,
      reportPath: "",
    }
  },
  methods: {
    show(reportPath) {
      this.visible = true
      this.reportPath = reportPath
    },
    handleCancel() {
      this.visible = false
    },
  }
}
</script>

<style lang="less" scoped>
.iframeBox {
  width: 100%;
  height: 800px;
}

</style>