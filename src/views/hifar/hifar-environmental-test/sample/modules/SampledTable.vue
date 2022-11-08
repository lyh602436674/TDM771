<!--
 * @Author: 赵峰
 * @Date: 2021-09-14 10:29:46
 * @LastEditTime: 2021-10-28 14:38:00
 * @LastEditors: 赵峰
 * @Descripttion: 已接收
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\sample\modules\SampledTable.vue
-->
<template>
  <h-card fixed :bordered="true" style="height: 95.8%;">
    <h-search
      v-model="queryParams"
      slot="search-form"
      size="small"
      :showToggleButton="true"
      :data="searchBar"
      @change="refresh(true)"
    />
    <div slot="table-operator" style="border-top: 5px">
      <a-button v-if="hasSelected" type="ghost-primary" size="small" icon="plus" @click="batchAccess"
        >批量接收</a-button
      >
    </div>
    <h-vex-table
      ref="sampleListTable"
      slot="content"
      :scroll="{ x: true }"
      :columns="columns"
      :data="loadData"
      :rowKey="(record) => record.id"
      :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
    >
      <span slot="entrustCode" slot-scope="text, record">
        <a @click="handleDetail(record)">{{ record.entrustCode }}</a>
      </span>
      <span slot="action" slot-scope="text, record">
        <a @click="handleAccess(record)"> 接收 </a>
        <template v-if="record.status == 10">
          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">更多<a-icon type="down" /> </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a @click="handleCirculation(record)"> 流转信息 </a>
              </a-menu-item>
              <a-menu-item>
                <a @click="handleReceive(record)"> 领用 </a>
              </a-menu-item>
              <a-menu-item>
                <a @click="handleBack(record)"> 归还 </a>
              </a-menu-item>
              <a-menu-item>
                <a @click="handleDeal(record)">处置</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </template>
      </span>
    </h-vex-table>
    <sample-access-modal ref="SampleAccessModal" @change="refresh(true)"></sample-access-modal>
    <sample-receive-modal ref="SampleReceiveModal" @change="refresh(true)"></sample-receive-modal>
    <sample-back-modal ref="SampleBackModal" @change="refresh(true)"></sample-back-modal>
    <sample-deal-modal ref="SampleDealModal" @change="refresh(true)"></sample-deal-modal>
    <sample-batch-access-modal ref="SampleBatchAccessModal" @change="refresh(true)"></sample-batch-access-modal>
    <sample-circulation-table ref="SampleCirculationTable" :pieceId="pieceId"></sample-circulation-table>
    <entrustment-detail-modal ref="EntrustmentDetailModal"></entrustment-detail-modal>
  </h-card>
</template>

<script>
import moment from 'moment'
import { postAction } from '@/api/manage'
import SampleAccessModal from './SampleAccessModal'
import SampleReceiveModal from './SampleReceiveModal'
import SampleBackModal from './SampleBackModal'
import SampleDealModal from './SampleDealModal'
import SampleCirculationTable from './SampleCirculationTable'
import SampleBatchAccessModal from './SampleBatchAccessModal'
import EntrustmentDetailModal from '@/views/hifar/hifar-environmental-test/entrustment/modules/EntrustmentDetailModal'
export default {
  components: {
    SampleAccessModal,
    SampleReceiveModal,
    SampleBackModal,
    SampleDealModal,
    SampleCirculationTable,
    SampleBatchAccessModal,
    EntrustmentDetailModal,
  },
  props: ['status'],
  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    },
  },
  data() {
    return {
      moment,
      treeCustData: [],
      treeData: [],
      queryParams: {},
      searchBar: [
        {
          title: '委托单号',
          key: 'c_entrustCode_7',
          formType: 'input',
        },
        {
          title: '试品单位',
          key: 'c_custName_7',
          formType: 'input',
        },
        {
          title: '试品编号',
          key: 'c_pieceCode_7',
          formType: 'input',
        },
        {
          title: '试品名称',
          key: 'c_productName_7',
          formType: 'input',
        },
        {
          title: '试品代号',
          key: 'c_productAlias_7',
          formType: 'input',
        },
        {
          title: '试品型号',
          key: 'c_productModel_7',
          formType: 'input',
        },
      ],
      columns: [
        {
          title: '委托单号',
          align: 'left',
          width: 120,
          dataIndex: 'entrustCode',
          scopedSlots: { customRender: 'entrustCode' },
        },
        {
          title: '试品单位',
          align: 'left',
          minWidth: 100,
          dataIndex: 'custName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '试品编号',
          align: 'left',
          minWidth: 100,
          dataIndex: 'pieceCode',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '试品名称',
          align: 'left',
          minWidth: 100,
          dataIndex: 'productName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '试品代号',
          align: 'left',
          minWidth: 100,
          dataIndex: 'productAlias',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '试品型号',
          align: 'left',
          dataIndex: 'productModel',
          minWidth: 100,
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '试品规格',
          align: 'left',
          minWidth: 100,
          dataIndex: 'productSpec',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '试品数量',
          align: 'center',
          dataIndex: 'pieceNum',
          minWidth: 100,
          customRender: (text, record) => {
            return text || 0
          },
        },
        {
          title: '库存数量',
          align: 'center',
          minWidth: 100,
          dataIndex: 'pieceCnum',
          customRender: (text, record) => {
            return text || 0
          },
        },
        {
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          width: 120,
          align: 'center',
          scopedSlots: { customRender: 'action' },
        },
      ],
      pieceId: '',
      selectedRowKeys: [],
      selectedRow: [],
      url: {
        list: '/HfEnvPieceBusiness/listPage',
      },
      loadData: (params) => {
        let data = {
          ...this.queryParams,
          ...params,
          c_status_1: 10,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
    }
  },
  watch: {
    status: {
      immediate: true,
      handler(val) {
        if (val) {
          setTimeout(() => {
            this.refresh(true)
          }, 1)
        }
      },
    },
  },
  methods: {
    refresh(bool = true) {
      this.selectedRowKeys = []
      this.selectedRow = []
      this.$refs.sampleListTable.refresh(bool)
    },
    // 接收
    handleAccess(record) {
      this.$refs.SampleAccessModal.show(record)
    },
    // 流转记录
    handleCirculation(record) {
      this.pieceId = record.id
      this.$refs.SampleCirculationTable.visible = true
    },
    // 领取
    handleReceive(record) {
      this.$refs.SampleReceiveModal.show(record)
    },
    // 归还
    handleBack(record) {
      this.$refs.SampleBackModal.show(record)
    },
    // 处置
    handleDeal(record) {
      this.$refs.SampleDealModal.show(record)
    },
    // 批量接收
    onSelectChange(selectedRowKeys, selectedRow) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRow = selectedRow
    },
    batchAccess() {
      let { selectedRow } = this
      if (selectedRow.length > 0) {
        this.$refs.SampleBatchAccessModal.show(selectedRow)
      } else {
        this.$message.warning('请先选择一个试品')
      }
    },
    // 委托详情
    handleDetail(record) {
      this.$refs.EntrustmentDetailModal.show(record.entrustId)
    },
  },
}
</script>
<style lang='less' scoped>
</style>