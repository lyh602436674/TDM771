<template>
  <div class="dataStatistics">
    <iframe
      ref='iframe'
      :src='src'
      frameborder='0'
      height='100%'
      scrolling='auto'
      width='100%'
    />
  </div>
</template>

<script>
import {getAction} from "@api/manage";

export default {
  name: "DataCenter",
  data() {
    return {
      src: ""
    }
  },
  created() {
    getAction('/SysSwitchBusiness/queryByItemKeyPrefix', {itemKey: 'dataStatistics'}).then((result) => {
      if (result.code === 200) {
        result.data.map((item) => {
          if (item.itemKey === 'dataStatisticsDes') {
            this.src = 'http://' + item.itemValue + '/dataExchange/DataSet'
          }
        })
      }
    })
  },
}
</script>


<style lang="less" scoped>
.dataStatistics {
  width: 100%;
  height: 100%
}
</style>>