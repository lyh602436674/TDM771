<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-12 10:35:35
 * @LastEditTime: 2021-08-24 09:42:24
 * @LastEditors: 陈乾龙
 * @Description: 流程设计弹窗
 * @FilePath: \hifar-platform-client\src\views\hifar\flowProcess\modules\FlowProcessModal.vue
-->
<template>
  <h-modal
    inner
    fullScreen
    destroyOnClose
    :getContainer="getContainer"
    :visible="visible"
    :footer="false"
    @cancel="handleCancel"
  >
    <flow-panel v-model="model" @change="handleSubmit"></flow-panel>
  </h-modal>
</template>

<script>
import flowPanel from '../components/Panel'
export default {
  inject: {
    getContainer: {
      default: () => {
        return () => document.body
      },
    },
  },
  components: { flowPanel },
  data() {
    return {
      visible: false,
      // 传入的流程数据
      model: {},
    }
  },
  methods: {
    add(record = {}) {
      this.edit(record)
    },
    edit(record = {}) {
      this.model = Object.assign({}, record)
      this.visible = true
    },
    handleSubmit(type) {
      this.$emit('change', type)
      // this.handleCancel()
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>