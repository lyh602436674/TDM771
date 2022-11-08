<template>
  <h-modal
    :confirmLoading="loading"
    :getContainer="getContainer"
    :title="title"
    :visible="visible"
    destroyOnClose
    fullScreen
    inner
    @cancel="handleCancel"
  >
    <div slot="footer">
      <a-button type="ghost-danger" @click="handleCancel">关闭</a-button>
    </div>
    <h-card :bordered="false" class="ExperimentalCurve" fixed>
      <new-test-experimentalcurve ref="Experimentalcurve"
                                         @change="curveUrlChange"/>
    </h-card>
  </h-modal>
</template>

<script>
import NewTestExperimentalcurve from './NewTestExperimentalcurve'

export default {
  name: "ExperimentalCurveModal",
  components: {
    NewTestExperimentalcurve
  },
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  data() {
    return {
      visible: false,
      title: "预览",
      loading: false,
    }
  },
  methods: {
    curveUrlChange(curveUrl) {
      this.$emit('change', curveUrl)
    },
    open(record) {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.Experimentalcurve.refresh(record)
      })
    },
    handleCancel() {
      this.visible = false
    },
  }
}
</script>

<style lang="less" scoped>

</style>