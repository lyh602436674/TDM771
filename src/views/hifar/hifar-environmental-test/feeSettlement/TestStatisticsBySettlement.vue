<!--
 * @Author: 雷宇航
 * @Date: 2023-04-04 09:23:06
 * @fileName: TestStatisticsBySettlement.vue
 * @FilePath: tdm771-client\src\views\hifar\hifar-environmental-test\feeSettlement\TestStatisticsBySettlement.vue
 * @Description: 已结算的试验
-->
<template>
  <h-card :bordered="true" fixed>
    <h-search
      slot="search-form"
      v-model="queryParams"
      :data="searchData"
      :showToggleButton="true"
      size="small"
      @change="refresh"
    />
    <div slot="table-operator" style="border-top: 5px">
    </div>
    <h-vex-table
      ref="settlementTable"
      slot="content"
      :columns="columns"
      :data="loadData"
      :rowKey="(record) => record.id"
    >
      <span slot="actions" slot-scope="text, record">
        <a-icon class="primary-text" type="eye" @click="handleDetail(record)"></a-icon>
      </span>
    </h-vex-table>
    <settlement-preview-modal activeKey="2" ref="settlementPreviewModal"></settlement-preview-modal>
  </h-card>
</template>

<script>
import {postAction} from "@api/manage";
import moment from 'moment'
import SettlementPreviewModal from "@views/hifar/hifar-environmental-test/feeSettlement/modules/SettlementPreviewModal";

export default {
  name: "TestStatisticsBySettlement",
  components: {
    SettlementPreviewModal
  },
  data() {
    return {
      moment,
      queryParams: {},
      searchData: [
        {
          title: '结算编号',
          key: 'c_billNumber_7',
          formType: 'input'
        },
        {
          title: '结算人',
          key: 'c_createUserName_7',
          formType: 'input'
        },
        // {
        // 有问题
        //   title: '结算时间',
        //   key: 'c_createTime_7',
        //   formType: 'dateRangePick'
        // },
      ],
      selectedRowKeys: [],
      selectedRows: [],
      columns: [
        {
          title: '结算编号',
          dataIndex: 'billNumber',
          minWidth: 160,
        },
        {
          title: '结算人',
          dataIndex: 'createUserName',
          align: 'center'
        },
        {
          title: '委托方',
          dataIndex: 'custName',
          align: 'center'
        },
        {
          title: '标准总价',
          dataIndex: 'standardTotalPrice',
          align: 'center',
          width: 100,
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '折后总价',
          dataIndex: 'discountTotalPrice',
          align: 'center',
          width: 100,
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '结算时间',
          dataIndex: 'createTime',
          align: 'center',
          customRender: (text) => {
            return +text ? moment(+text).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '操作',
          dataIndex: 'actions',
          align: 'center',
          fixed: 'right',
          width: 100,
          scopedSlots: {
            customRender: 'actions',
          },
        },
      ],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code === 200) {
            return res.data
          }
        })
      },
      url: {
        list: 'HfSettlementBusiness/listPage',
      },
    }
  },
  methods: {
    handleDetail(row) {
      this.$refs.settlementPreviewModal.show(row.id)
    },
    refresh(bool = false) {
      this.$refs.settlementTable.refresh(bool)
    },
  }
}
</script>
