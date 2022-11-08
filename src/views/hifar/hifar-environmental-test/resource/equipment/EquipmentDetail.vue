<!--
 * @Author: 赵峰
 * @Date: 2021-08-02 14:23:46
 * @LastEditTime: 2021-09-03 14:12:35
 * @LastEditors: 赵峰
 * @Descripttion: 设备台账详情
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-physico-chemical\resource\equipment\EquipmentDetail.vue
-->
<template>
  <h-modal
    inner
    fullScreen
    destroyOnClose
    :getContainer="getContainer"
    :visible="visible"
    :width="1000"
    @cancel="handleCancel"
  >
    <div class="footer" slot="footer">
      <a-button @click="handleCancel" type="ghost-danger"> 关闭 </a-button>
    </div>
    <h-card>
      <h-tabs fixed :activeKey="activeKey" :animated="true" @change="handleTabsChange">
        <a-tab-pane key="1" tab="设备详情">
          <equipment-base-info ref="EquipmentBaseInfo" :detailData="detailData"></equipment-base-info>
        </a-tab-pane>
        <a-tab-pane key="2" tab="验收记录">
          <acceptance-record-table ref="AcceptanceRecordTable" :equipId="equipId"></acceptance-record-table>
        </a-tab-pane>
        <a-tab-pane key="3" tab="维修记录">
          <repair-records-table ref="RepairRecordsTable" :equipId="equipId"></repair-records-table>
        </a-tab-pane>
        <a-tab-pane key="4" tab="期间核查记录">
          <period-check-record-table ref="PeriodCheckRecordTable" :equipId="equipId"></period-check-record-table>
        </a-tab-pane>
        <a-tab-pane key="5" tab="检定记录"> 
          <verification-record-table ref="VerificationRecordTable" :equipId="equipId"></verification-record-table>
        </a-tab-pane>
      </h-tabs>
    </h-card>
  </h-modal>
</template>
<script>
import moment from 'moment'
import EquipmentBaseInfo from './modules/EquipmentBaseInfo'
import AcceptanceRecordTable from './components/AcceptanceRecordTable'
import RepairRecordsTable from './components/RepairRecordsTable'
import PeriodCheckRecordTable from './components/PeriodCheckRecordTable'
import VerificationRecordTable from './components/VerificationRecordTable'
export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  components: {
    EquipmentBaseInfo,
    AcceptanceRecordTable,
    RepairRecordsTable,
    PeriodCheckRecordTable,
    VerificationRecordTable
  },
  data() {
    return {
      moment,
      visible: false,
      detailData: {},
      activeKey: '1',
      equipId: '',
    }
  },
  methods: {
    show(record) {
      this.visible = true
      this.equipId = record.id
      this.detailData = record
    },
    handleCancel(e) {
      this.visible = false
      this.activeKey = '1'
    },
    handleTabsChange(v) {
      this.activeKey = v
      console.log('this.equipId', this.equipId)
    },
  },
}
</script>
<style lang="less" scoped>
/deep/ .h-card.ant-card .ant-card-body {
  padding: 0 5px;
}
</style>