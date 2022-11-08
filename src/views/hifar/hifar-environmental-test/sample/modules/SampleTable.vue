<!--
 * @Author: 赵峰
 * @Date: 2021-08-17 15:53:57
 * @LastEditTime: 2021-10-28 13:57:11
 * @LastEditors: 赵峰
 * @Descripttion: 试品管理待接收table
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\sample\modules\SampleTable.vue
-->
<template>
  <div class="h-report-wrapper">
    <r-l-layout class="h-custom-layouts" :leftMinWidth="240">
      <div slot="left" class="h-report-left">
        <h-card fixed>
          <a-tree :tree-data="treeData" :show-line="true" @select="onSelect"> </a-tree>
          <a-empty v-if="treeCustData.length == 0" style="margin-top: 260px" />
        </h-card>
      </div>
      <h-card slot="right" fixed>
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
          </span>
        </h-vex-table>
      </h-card>
    </r-l-layout>
    <sample-access-modal ref="SampleAccessModal" @change="refresh(true)"></sample-access-modal>
    <sample-batch-access-modal ref="SampleBatchAccessModal" @change="refresh(true)"></sample-batch-access-modal>
    <entrustment-detail-modal ref="EntrustmentDetailModal"></entrustment-detail-modal>
  </div>
</template>

<script>
import moment from 'moment'
import { postAction } from '@/api/manage'
import SampleAccessModal from './SampleAccessModal'
import SampleBatchAccessModal from './SampleBatchAccessModal'
import EntrustmentDetailModal from '@/views/hifar/hifar-environmental-test/entrustment/modules/EntrustmentDetailModal'
export default {
  components: {
    SampleAccessModal,
    SampleBatchAccessModal,
    EntrustmentDetailModal
  },
  props: {
    status: {
      type: [String, Number],
      default: '',
    },
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
      queryParams: {
        c_custId_1: '',
        c_entrustCode_1: '',
      },
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
          width: 60,
          align: 'center',
          scopedSlots: { customRender: 'action' },
        },
      ],
      pieceId: '',
      selectedRowKeys: [],
      selectedRow: [],
      url: {
        list:'/HfEnvPieceBusiness/listPage',
        treeData: '/HfEnvPieceBusiness/listCustHasWaitReceiveSample',
      },
      loadData: (params) => {
        let data = {
          ...this.queryParams,
          ...params,
          c_status_1: 1,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
    }
  },
  created() {
    this.loadTreeData()
  },
  methods: {
    refresh(bool = true) {
      this.selectedRowKeys = []
      this.selectedRow = []
      this.$refs.sampleListTable.refresh(bool)
    },
    // 左边树结构
    loadTreeData() {
      postAction(this.url.treeData, {}).then((res) => {
        if (res.code == 200) {
          let treeData = []
          this.treeCustData = res.data
          res.data.forEach((item) => {
            let treeDataItem = {
              title: item.custName,
              key: item.custId,
              children: [],
            }
            item.entrustList.forEach((element) => {
              treeDataItem.children.push({
                title: element.entrustCode,
                key: element.entrustCode,
              })
            })
            treeData.push(treeDataItem)
          })
          this.treeData = treeData
        }
      })
    },
    onSelect(selectedKeys, info) {
      let record = info.node.dataRef
      if (record.title == record.key) {
        this.queryParams.c_custId_1 = ''
        this.queryParams.c_entrustCode_1 = record.key
      } else {
        this.queryParams.c_custId_1 = selectedKeys[0]
        this.queryParams.c_entrustCode_1 = ''
      }
      this.refresh(true)
    },
    // 接收
    handleAccess(record) {
      this.$refs.SampleAccessModal.show(record)
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
.h-custom-layouts {
  .actions-icon {
    cursor: pointer;
  }
}

.h-report-wrapper {
  height: 95.8%;
  overflow: hidden;
  display: flex;
  .h-report-left {
    height: 100%;
  }
}
</style>