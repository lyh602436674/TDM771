<!--
 * @Author: 赵峰
 * @Date: 2021-10-14 11:08:04
 * @LastEditTime: 2021-10-14 17:49:17
 * @LastEditors: 赵峰
 * @Descripttion:设备计量检定--到期提醒
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\expiryReminder\ExpiryReminderList.vue
-->
<template>
  <div ref="pageWrapper" class="h-custom-layout" style="height: 100%; position: relative">
    <h-card>
      <template slot="title"> 设备计量检定到期提醒 </template>
      <h-tabs fixed :activeKey="activeKey" :animated="true" @change="handleTabsChange">
        <a-tab-pane key="1">
          <a-badge :count="statisticData.timeout" slot="tab" :offset="offset">已过期</a-badge>
          <equip-overdue-table ref="EquipOverdueTable_" expiryTime="timeout" @change='loadNumChange'></equip-overdue-table>
        </a-tab-pane>
        <a-tab-pane key="2">
          <a-badge :count="statisticData.week" slot="tab" :offset="offset">7天内到期</a-badge>
          <equip-overdue-table ref="EquipOverdueTable7" expiryTime="week" @change='loadNumChange'></equip-overdue-table>
        </a-tab-pane>
        <a-tab-pane key="3">
          <a-badge :count="statisticData.month" slot="tab" :offset="offset">30天内到期</a-badge>
          <equip-overdue-table ref="EquipOverdueTable30" expiryTime="month" @change='loadNumChange'></equip-overdue-table>
        </a-tab-pane>
      </h-tabs>
    </h-card>
  </div>
</template>

<script>
import EquipOverdueTable from './components/EquipOverdueTable.vue'
export default {
  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper,
    }
  },

  components: {
    EquipOverdueTable,
  },

  data() {
    return {
      activeKey: '1',
      offset: [10, 1],
      statisticData:{},
    }
  },

  methods: {
    loadNumChange(val){
      console.log('statisticsNum===============',val)
      this.statisticData = val
    },
    handleTabsChange(v) {
      this.activeKey = v
      if (v == 1) {
        setTimeout(() => {
          this.$refs.EquipOverdueTable_.refresh(true)
        }, 200)
      } else if (v == 2) {
        setTimeout(() => {
          this.$refs.EquipOverdueTable7.refresh(true)
        }, 200)
      } else {
        setTimeout(() => {
          this.$refs.EquipOverdueTable30.refresh(true)
        }, 200)
      }
    },
  },
}
</script>
<style lang='less' scoped>
</style>