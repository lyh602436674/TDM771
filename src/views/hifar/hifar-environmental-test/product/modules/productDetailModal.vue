<!--
 * @Author: 赵峰
 * @Date: 2021-08-05 16:46:29
 * @LastEditTime: 2021-11-10 15:03:12
 * @LastEditors: 赵峰
 * @Descripttion: 试品详情页面
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\product\modules\productDetailModal.vue
-->
<template>
  <h-modal
    title="详情"
    inner
    destroyOnClose
    :visible="visible"
    :getContainer="getContainer"
    :confirm-loading="confirmLoading"
    :width="800"
    @cancel="handleCancel"
  >
    <div class="footer" slot="footer">
      <a-button @click="handleCancel" type="ghost-danger"> 关闭 </a-button>
    </div>
    <h-detail :showElevator="false">
      <h-desc size="small" labelWidth="120px" :column="2" title="基本信息">
        <h-desc-item v-for="(item, index) in config" :key="index" :label="item.title">
          {{
            item.key == 'materialType' && detail[item.key] == 1
              ? '金属'
              : item.key == 'materialType' && detail[item.key] == 2
              ? '非金属'
              : detail[item.key]
          }}
        </h-desc-item>
      </h-desc>
    </h-detail>
  </h-modal>
</template>
<script>
export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  props: {
    detail: {
      type: Object,
      default: () => {},
    },
    config: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      visible: false,
      confirmLoading: false,
    }
  },
  methods: {
    showModal() {
      this.visible = true
    },
    handleCancel(e) {
      this.visible = false
    },
  },
}
</script>