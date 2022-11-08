<!--
 * @Author: 赵峰
 * @Date: 2021-11-19 11:06:54
 * @LastEditTime: 2021-11-19 17:52:29
 * @LastEditors: 赵峰
 * @Descripttion: 动态组件----全屏组件
 * @FilePath: \hifar-platform-client\src\components\HPageViewModal\index.vue
-->
<template>
  <h-modal
    :visible="visible"
    fullScreen
    :destroyOnClose="true"
    :footer="false"
    :closable="false"
    @cancel="handleCancel"
  >
    <div class="h-modal-content">
      <div class="h-modal-hearder" @click="handleCancel">
        <a-alert
          show-icon
          message="您已处于全屏模式，退出全屏可按'ESC'或者点击右边'退出按钮'"
          type="info"
          close-text="退出全屏"
          @close="handleCancel"
        />
      </div>
      <div class="form-content">
        <dynamic-component :path="formPath" :id="query.id"></dynamic-component>
      </div>
    </div>
  </h-modal>
</template>

<script>
import DynamicComponent from '@/views/components/DynamicComponent'
export default {
  components: { DynamicComponent },
  data() {
    return {
      visible: false,
      formPath: '',
      query: {},
      id: '',
    }
  },
  methods: {
    show(formPath, query) {
      this.visible = true
      this.query = query
      this.id = query.id
      this.formPath = formPath
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>
<style lang='less' scoped>
@import './index.less';
</style>