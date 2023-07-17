<template>
  <equipment-list :pageOptions="pageOptions"/>
</template>

<script>
import EquipmentList from "@views/hifar/hifar-environmental-test/resource/equipment/EquipmentList.vue";

export default {
  name: "Equipment_experiment",
  components: {EquipmentList},
  data() {
    return {
      pageOptions: {
        vHas: {
          matchAmend: "experiment:matchAmend",
          privice: "experiment:privice",
          import: "experiment:import",
          delete: "experiment:delete",
          add: "experiment:add",
        },
        equipUse: "1"
      }
    }
  },
}
</script>

<style scoped>

</style>