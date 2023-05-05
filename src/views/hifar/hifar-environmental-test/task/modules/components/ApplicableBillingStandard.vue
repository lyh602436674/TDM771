<template>
  <a-popover title="适用计费标准详情">
    <template #content>
      <h-desc
        v-if="checkObjectValuesEmpty"
        :data="model"
        lableWidth="110px"
        style="margin: 0 0 20px 0;width: 800px"
      >
        <h-desc-item label="温度范围">{{ model.temperatureRange || '--' }}</h-desc-item>
        <h-desc-item label="湿度范围">{{ model.humidityRange || '--' }}</h-desc-item>
        <h-desc-item label="压力范围">{{ model.pressureRange || '--' }}</h-desc-item>
        <h-desc-item label="加速度范围">{{ model.accelerationRange || '--' }}</h-desc-item>
        <h-desc-item label="开机费">
          {{ model.startupCost || '--' }}
        </h-desc-item>
        <h-desc-item label="折扣">{{ model.discount || '--' }}</h-desc-item>
        <h-desc-item label="标准单价">
          {{ Number(model.unitPrice) || '--' }}
        </h-desc-item>
        <h-desc-item label="折扣单价">
          {{ Number(model.discountPrice) || '--' }}
        </h-desc-item>
        <h-desc-item label="客户折扣">
          {{ model.customDiscount || '--' }}
        </h-desc-item>
      </h-desc>
      <span v-else style="color: red"> 未匹配到计费标准 </span>
    </template>
    <slot></slot>
  </a-popover>
</template>

<script>
export default {
  name: "ApplicableBillingStandard",
  props: {
    model: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    checkObjectValuesEmpty() {
      for (let key in this.model) {
        if (this.model[key] !== "") {
          return true;
        }
      }
      return false;
    },
  },
}
</script>

<style scoped>

</style>