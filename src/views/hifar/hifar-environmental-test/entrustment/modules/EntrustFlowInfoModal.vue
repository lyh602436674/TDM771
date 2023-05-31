<template>
  <h-modal
    :getContainer='getContainer'
    :visible='visible'
    destroyOnClose
    title='流转信息'
    inner
    :width="1000"
    class="entrustModal"
    @cancel='handleCancel'>
    <div slot='footer' class='footer'>
      <a-button style='margin-right: 8px' type='ghost-danger' @click='handleCancel'> 关闭
      </a-button>
    </div>
    <entrust-flow-info-table :entrustId="entrustId"></entrust-flow-info-table>
  </h-modal>
</template>

<script>
import EntrustFlowInfoTable
  from "@views/hifar/hifar-environmental-test/entrustment/components/EntrustFlowInfoTable.vue";

export default {
  name: "EntrustFlowInfoModal",
  components: {EntrustFlowInfoTable},
  inject: {
    getContainer: {
      default: () => document.body
    }
  },
  data() {
    return {
      visible: false,
    }
  },
  props: {
    entrustId: {
      type: String,
      default: '',
      required: true
    }
  },
  methods: {
    show() {
      this.visible = true
    },
    handleCancel() {
      this.visible = false
    },
  }
}
</script>

<style scoped>

</style>