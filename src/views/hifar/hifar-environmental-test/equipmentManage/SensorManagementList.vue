<!--
 * @Author: 赵峰
 * @Date: 2021-10-29 16:19:33
 * @LastEditTime: 2021-10-29 16:41:41
 * @LastEditors: 赵峰
 * @Descripttion: 传感器管理
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\equipmentManage\SensorManagementList.vue
-->
<template>
  <div ref="pageWrapper" class="h-custom-layout" style="height: 100%; position: relative">
    <h-card>
      <template slot="title"> 传感器管理 </template>
      <h-tabs fixed :activeKey="activeKey" :animated="true" @change="handleTabsChange">
        <a-tab-pane key="1">
          <a-badge :count="0" slot="tab" :offset="offset">全部</a-badge>
          <equipment-table ref="EquipmentTable" expiryTime="all" @change="loadNumChange"></equipment-table>
        </a-tab-pane>
        <a-tab-pane key="2">
          <a-badge :count="statisticData.timeout" slot="tab" :offset="offset">已过期</a-badge>
          <equipment-table ref="EquipmentTable_" expiryTime="timeout" @change="loadNumChange"></equipment-table>
        </a-tab-pane>
        <a-tab-pane key="3">
          <a-badge :count="statisticData.week" slot="tab" :offset="offset">7天内到期</a-badge>
          <equipment-table ref="EquipmentTable7" expiryTime="week" @change="loadNumChange"></equipment-table>
        </a-tab-pane>
        <a-tab-pane key="4">
          <a-badge :count="statisticData.month" slot="tab" :offset="offset">30天内到期</a-badge>
          <equipment-table ref="EquipmentTable30" expiryTime="month" @change="loadNumChange"></equipment-table>
        </a-tab-pane>
      </h-tabs>
    </h-card>
  </div>
</template>

<script>
import EquipmentTable from './SensorManagement'
export default {
  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper,
    }
  },

  components: {
    EquipmentTable,
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
</style>