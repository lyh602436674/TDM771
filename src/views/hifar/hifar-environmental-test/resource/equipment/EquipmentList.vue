<!--
 * @Author: 赵峰
 * @Date: 2021-10-29 15:48:51
 * @LastEditTime: 2021-10-29 16:11:06
 * @LastEditors: 赵峰
 * @Descripttion: 设备台账--新
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\equipment\EquipmentList.vue
-->
<template>
  <div ref="pageWrapper" class="h-custom-layout" style="height: 100%; position: relative">
    <h-card>
      <template slot="title"> 设备信息</template>
      <h-tabs fixed :activeKey="activeKey" :animated="true" @change="handleTabsChange">
        <a-tab-pane key="1">
          <a-badge :count="0" slot="tab" :offset="offset">全部</a-badge>
          <equipment-table :pageOptions="pageOptions" ref="EquipmentTable" expiryTime="all"
                           @change="loadNumChange"></equipment-table>
        </a-tab-pane>
        <a-tab-pane key="2">
          <a-badge :count="statisticData.timeout" slot="tab" :offset="offset">已过期</a-badge>
          <equipment-table ref="EquipmentTable_" :pageOptions="pageOptions" expiryTime="timeout"
                           @change="loadNumChange"></equipment-table>
        </a-tab-pane>
        <a-tab-pane key="3">
          <a-badge :count="statisticData.week" slot="tab" :offset="offset">7天内到期</a-badge>
          <equipment-table ref="EquipmentTable7" :pageOptions="pageOptions" expiryTime="week"
                           @change="loadNumChange"></equipment-table>
        </a-tab-pane>
        <a-tab-pane key="4">
          <a-badge :count="statisticData.month" slot="tab" :offset="offset">30天内到期</a-badge>
          <equipment-table ref="EquipmentTable30" :pageOptions="pageOptions" expiryTime="month"
                           @change="loadNumChange"></equipment-table>
        </a-tab-pane>
      </h-tabs>
    </h-card>
  </div>
</template>

<script>
import EquipmentTable from './Equipment'

export default {
  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper,
    }
  },

  components: {
    EquipmentTable,
  },
  props: {
    pageOptions: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      activeKey: '1',
      offset: [10, 1],
      statisticData: {},
    }
  },

  methods: {
    loadNumChange(val) {
      this.statisticData = val
    },
    handleTabsChange(v) {
      this.activeKey = v
      if (v == 1) {
        setTimeout(() => {
          this.$refs.EquipmentTable.refresh(true)
        }, 200)
      } else if (v == 2) {
        setTimeout(() => {
          this.$refs.EquipmentTable_.refresh(true)
        }, 200)
      } else if (v == 3) {
        setTimeout(() => {
          this.$refs.EquipmentTable7.refresh(true)
        }, 200)
      } else {
        setTimeout(() => {
          this.$refs.EquipmentTable30.refresh(true)
        }, 200)
      }
    },
  },
}
</script>
<style lang='less' scoped>
.h-custom-layout {
  /deep/ .ant-tabs-content {
    height: calc(100% - 59px) !important;
  }
}
</style>