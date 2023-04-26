<template>
  <div class="testSecondaryCom">
    <applicable-billing-standard :model="model">
      <a-input v-model="localValue" class="input" :placeholder="placeholder" @blur="handleBlur" @change="handleChange"></a-input>
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
    }
  },
  props: {
    value: {
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
    }
  },
  methods: {
    handleBlur(e){
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