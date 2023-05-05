<template>
  <div class="testSecondaryCom">
    <applicable-billing-standard :model="model">
      <a-input-group compact style="width: 100%">
        <a-input :style="{width: speedItem ? '45%' : '100%'}" v-model="localValue" class="input"
                 :placeholder="placeholder" @blur="handleBlur"
                 @change="handleChange"></a-input>
        <a-input v-if="speedItem" style="width: 55%" readOnly v-model="localSpeedItem"></a-input>
      </a-input-group>
    </applicable-billing-standard>

  </div>
</template>

<script>
import ApplicableBillingStandard
  from "@views/hifar/hifar-environmental-test/task/modules/components/ApplicableBillingStandard.vue";

export default {
  name: "TestSecondaryCom",
  components: {ApplicableBillingStandard},
  data() {
    return {
      localValue: undefined,
      localSpeedItem: undefined,
    }
  },
  props: {
    value: {
      default: undefined
    },
    speedItem: {
      default: undefined
    },
    placeholder: {
      type: String,
      default: ''
    },
    model: {
      type: Object,
      default: () => ({})
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.localValue = val
      },
    },
    speedItem: {
      immediate: true,
      handler(val) {
        this.localSpeedItem = '加速度：' + val
      }
    }
  },
  methods: {
    handleBlur(e) {
      this.localValue = e.target.value
      this.$emit('blur', this.localValue)
    },
    handleChange(e) {
      this.localValue = e.target.value
      this.$emit('change', this.localValue)
    },
  },
}
</script>

<style scoped lang="less">
.testSecondaryCom {
  width: 100%;

  .input {
    width: 100%;
  }
}
</style>