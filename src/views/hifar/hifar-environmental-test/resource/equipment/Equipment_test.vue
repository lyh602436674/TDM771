<template>
  <equipment-list :pageOptions="pageOptions"/>
</template>

<script>
import EquipmentList from "@views/hifar/hifar-environmental-test/resource/equipment/EquipmentList.vue";

export default {
  name: "Equipment_test",
  components: {EquipmentList},
  data() {
    return {
      pageOptions: {
        vHas: {
          matchAmend: "testEquip:matchAmend",
          privice: "testEquip:privice",
          import: "testEquip:import",
          delete: "testEquip:delete",
          add: "testEquip:add",
        },
        equipUse: "2"
      }
    }
  },
}
</script>

<style scoped>

</style>