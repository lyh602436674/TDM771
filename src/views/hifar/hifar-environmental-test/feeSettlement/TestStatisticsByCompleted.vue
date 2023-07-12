<!--
 * @Author: 雷宇航
 * @Date: 2023-04-03 18:35:19
 * @fileName: TestStatisticsByCompleted.vue
 * @FilePath: tdm771-client\src\views\hifar\hifar-environmental-test\feeSettlement\TestStatisticsByCompleted.vue
 * @Description: 费用结算：显示已完成的试验（未结算和已结算）
-->
<template>
  <h-card :bordered="true" fixed class="testStatistics" style="height: 100%">
    <h-search
      slot="search-form"
      ref="searchForm"
      v-model="queryParams"
      :data="searchData"
      :showToggleButton="true"
      size="small"
      @change="refresh"
    />
    <div slot="table-operator" style="border-top: 5px">
      <a-popconfirm title="确定进行结算吗?" @confirm="() => handleSettlement()">
        <a-button size="small" type="primary">结算</a-button>
      </a-popconfirm>
    </div>
    <h-vex-table
      ref="testSettlementTable"
      slot="content"
      :columns="columns"
      :data="loadData"
      :row-selection="{ selectedRowKeys, onChange: onSelect }"
      :rowKey="(record) => record.id"
    >
      <template slot="isSettled" slot-scope="text,record">
        <a-tag :color="text === '1' ? '#87d068' : '#f50' " style="margin-right: 0">
          {{ text === '1' ? '已结算' : '未结算' }}
        </a-tag>
      </template>
      <template #entrustNos="text, record">
        <a @click="$refs.testTaskBaseInfoModal.show(record,'1','20px')">{{ text }}</a>
      </template>
      <template #entrustCodes="text, record">
        <a @click="$refs.testTaskBaseInfoModal.show(record,'2','20px')">{{ text }}</a>
      </template>
      <template #testCode="text, record">
        <a @click="$refs.testTaskBaseInfoModal.show(record,'3','20px')">{{ text }}</a>
      </template>
      <template #exceptionNum="text, record">
        <a @click="$refs.abnormalDetailModal.show(record)">{{ text }}</a>
      </template>
      <span slot="actions" slot-scope="text, record">
        <a-popconfirm v-if="record.isSettled === '0'" title="确定进行结算吗?"
                      @confirm="() => handleSettlement(record.id,record.custTypes)">
          <a>结算</a>
        </a-popconfirm>
      </span>
    </h-vex-table>
    <test-task-base-info-modal ref="testTaskBaseInfoModal"/>
    <abnormal-detail-modal ref="abnormalDetailModal" isReadOnly/>
    <settlement-preview-modal :queryParams="queryParams" ref="settlementPreviewModal" isEdit @change="refresh"/>
  </h-card>
</template>

<script>
import moment from "moment";
import {postAction} from "@api/manage";
import TestTaskBaseInfoModal from "@views/hifar/hifar-environmental-test/task/TestTaskBaseInfoModal";
import AbnormalDetailModal from "@views/hifar/hifar-environmental-test/task/modules/AbnormalDetailModal";
import SettlementPreviewModal from "@views/hifar/hifar-environmental-test/feeSettlement/modules/SettlementPreviewModal";
import {dateTimeFormatByStamp} from '@/utils/util'
import {CUST_TYPE_OPTIONS} from "@views/hifar/constants";

export default {
  name: "TestStatisticsByCompleted",
  components: {
    SettlementPreviewModal,
    TestTaskBaseInfoModal,
    AbnormalDetailModal
  },
  data() {
    return {
      queryParams: {},
      searchData: [
        {
          title: "送试单位",
          key: "custName",
          formType: 'select',
          options: [],
          showSearch: true
        },
        {
          title: '试验编号',
          key: 'c_testCode_7',
          formType: 'input',
        },
        {
          title: '试验项目',
          key: 'unitName',
          formType: 'input',
        },
        {
          title: '试验设备',
          key: 'equipName',
          formType: 'input',
        },
        {
          title: '内部名称',
          key: 'innerName',
          formType: 'input',
        },
        {
          title: '实际结束时间',
          key: 'realEndTime',
          showTime: true,
          formType: 'dateRangePick',
        },
        {
          title: '委托日期',
          key: 'entrustTime',
          showTime: true,
          formType: 'dateRangePick',
        },
        {
          title: '是否结算',
          key: 'isSettled',
          formType: 'select',
          options: [
            {title: "已结算", value: "1", key: "1"},
            {title: "未结算", value: "0", key: "0"},
          ]
        },
        {
          title: '客户类型',
          key: 'custType',
          formType: 'select',
          options: CUST_TYPE_OPTIONS
        },
      ],
      selectedRowKeys: [],
      selectedRows: [],
      columns: [
        {
          title: '运行单号',
          dataIndex: 'entrustCodes',
          minWidth: 160,
          scopedSlots: {customRender: 'entrustCodes'},
        },
        {
          title: '委托单号',
          dataIndex: 'entrustNos',
          minWidth: 140,
          scopedSlots: {customRender: 'entrustNos'},
        },
        {
          title: '试验编号',
          dataIndex: 'testCode',
          minWidth: 140,
          scopedSlots: {customRender: 'testCode'},
        },
        {
          title: '是否结算',
          dataIndex: 'isSettled',
          minWidth: 100,
          align: 'center',
          scopedSlots: {customRender: 'isSettled'},
        },
        {
          title: '送试单位',
          dataIndex: 'custNames',
          minWidth: 150,
        },
        {
          title: '产品名称',
          align: 'left',
          minWidth: 120,
          dataIndex: 'productNames',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '产品代号',
          align: 'left',
          minWidth: 100,
          dataIndex: 'productAliass',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: "产品编号",
          align: "left",
          dataIndex: "pieceNos",
          minWidth: 100,
          customRender: (text, record) => {
            return text || "--";
          },
        },
        {
          title: '试验项目',
          dataIndex: 'unitNames',
          minWidth: 100,
        },
        {
          title: '试验设备',
          dataIndex: 'equipName',
          minWidth: 150,
          customRender: (text, row) => {
            return `${row.innerName + row.equipName}`
          }
        },
        {
          title: '试验人员',
          dataIndex: 'chargeUserName',
          minWidth: 100,
        },
        {
          title: '备注',
          dataIndex: 'remarks',
          minWidth: 150,
        },
        {
          title: '异常数量',
          dataIndex: 'exceptionNum',
          width: 80,
          align: 'center',
          scopedSlots: {customRender: 'exceptionNum'},
        },
        {
          title: '期望开始时间',
          dataIndex: 'predictStartTime',
          customRender: time => dateTimeFormatByStamp(time),
          minWidth: 150,
        },
        {
          title: '预计结束时间',
          dataIndex: 'taskEndTime',
          minWidth: 150,
          customRender: time => dateTimeFormatByStamp(time),
        },
        {
          title: '预计用时(h)',
          dataIndex: 'predictUseTime',
          minWidth: 100,
        },
        {
          title: '实际开始时间',
          dataIndex: 'realStartTime',
          customRender: time => dateTimeFormatByStamp(time),
          minWidth: 150,
        },
        {
          title: '实际结束时间',
          dataIndex: 'realEndTime',
          customRender: time => dateTimeFormatByStamp(time),
          minWidth: 150,
        },
        {
          title: '委托日期',
          dataIndex: 'entrustTimes',
          customRender: time => dateTimeFormatByStamp(time, 'YYYY-MM-DD'),
          minWidth: 150,
        },
        {
          title: '实际用时(h)',
          dataIndex: 'realUseTime',
          minWidth: 100,
          customRender: text => {
            return Number(text).toFixed(2) || '--'
          }
        },
        {
          title: '标准总价',
          dataIndex: 'standardTotalPrice',
          minWidth: 100,
          customRender: text => {
            return (Number(text) / 1000) || '--'
          }
        },
        {
          title: '折后总价',
          dataIndex: 'totalExpenses',
          minWidth: 100,
          customRender: text => {
            return (Number(text) / 1000) || '--'
          }
        },
        // {
        //   title: '操作',
        //   dataIndex: 'actions',
        //   align: 'center',
        //   fixed: 'right',
        //   width: 80,
        //   scopedSlots: {
        //     customRender: 'actions',
        //   },
        // },
      ],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
          c_status_1: 50,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code === 200) {
            return res.data
          }
        })
      },
      url: {
        list: '/HfEnvTaskTestBusiness/listPageForEquip',
        custList: "/HfResCustBusiness/listCustNameDistinct"
      },
    }
  },
  created() {
    postAction(this.url.custList).then(res => {
      if (res.code === 200) {
        let custName = this.searchData.filter(v => v.key === 'custName')[0]
        custName.options = res.data.map(v => {
          return {
            title: v.custName,
            key: v.custName,
            value: v.custName,
          }
        })
      }
    })
  },
  methods: {
    handleSettlement(id, custType) {
      if (this.selectedRows.map(item => item.isSettled).includes('1')) return this.$message.warning('已选数据中包含已结算')
      this.$refs.settlementPreviewModal.show(id || this.selectedRowKeys.toString(), custType || this.selectedRows[0].custTypes)
    },
    onSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    refresh(bool = false) {
      this.$refs.testSettlementTable.refresh(bool)
      this.selectedRowKeys = []
      this.selectedRows = []
    },
  }
}
</script>

<style scoped>

</style>