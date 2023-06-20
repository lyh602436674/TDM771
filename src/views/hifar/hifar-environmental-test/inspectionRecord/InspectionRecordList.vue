<!--
 * @Author: 雷宇航
 * @Date: 2023-04-04 18:15:11
 * @fileName: InspectionRecordList.vue
 * @FilePath: tdm771-client\src\views\hifar\hifar-environmental-test\inspectionRecord\InspectionRecordList.vue
 * @Description: 巡检记录
-->
<template>
  <div ref="pollingRecord" style="position: relative;height: 100%">
    <h-card fixed title="巡检记录">
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
        ref="pollingRecordTable"
        slot="content"
        :columns="columns"
        :data="loadData"
        :rowKey="(record) => record.id"
      >
        <template #taskBeginQuantity="text,record">
          <a @click="handleDetail(record,'beforeSnapshot')">{{ text }}</a>
        </template>
        <template #taskFinishQuantity="text,record">
          <a @click="handleDetail(record,'afterSnapshot')">{{ text }}</a>
        </template>
      </h-vex-table>
      <inspection-record-modal ref="inspectionRecordModal"></inspection-record-modal>
    </h-card>
  </div>
</template>

<script>
import moment from "moment";
import {postAction} from "@api/manage";
import InspectionRecordModal
  from "@views/hifar/hifar-environmental-test/inspectionRecord/modules/InspectionRecordModal";

export default {
  name: "InspectionRecordList",
  components: {InspectionRecordModal},
  provide() {
    return {
      getContainer: () => this.$refs.pollingRecord,
    }
  },
  data() {
    return {
      moment,
      searchData: [
        {
          title: '巡检编号',
          key: 'number',
          formType: 'input',
        },
        {
          title: '巡检时间',
          key: 'createTime',
          formType: 'dateRangePick',
        },
      ],
      queryParams: {},
      columns: [
        {
          title: '巡检编号',
          dataIndex: 'number',
          align: 'center',
        },
        {
          title: '巡检时间',
          dataIndex: 'createTime',
          align: 'center',
          customRender: (time) => {
            return +time && +time !== 0 ? moment(+time).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '实际开始任务数量',
          dataIndex: 'taskBeginQuantity',
          align: 'center',
          scopedSlots: {
            customRender: 'taskBeginQuantity',
          },
        },
        {
          title: '计划结束任务数量',
          dataIndex: 'taskFinishQuantity',
          align: 'center',
          scopedSlots: {
            customRender: 'taskFinishQuantity',
          },
        },
      ],
      subColumns: [
        {
          title: '试验编号',
          dataIndex: 'testCode',
          minWidth: 120,
          scopedSlots: {customRender: 'testCode'},
        },
        {
          title: '运行单号',
          dataIndex: 'entrustCodes',
          minWidth: 140,
        },
        {
          title: '委托单号',
          dataIndex: 'entrustNos',
          minWidth: 120,
        },
        {
          title: '报告编号',
          dataIndex: 'reportCodes',
          minWidth: 140,
        },
        {
          title: '状态',
          dataIndex: 'status',
          scopedSlots: {customRender: 'status'},
          minWidth: 100,
        },
        {
          title: "产品名称",
          align: "left",
          dataIndex: "productName",
          minWidth: 100,
          customRender: (text, record) => {
            return text || "--";
          },
        },
        {
          title: "产品代号",
          align: "left",
          dataIndex: "productAlias",
          minWidth: 100,
          customRender: (text, record) => {
            return text || "--";
          },
        },
        {
          title: "产品编号",
          align: "left",
          dataIndex: "pieceNo",
          minWidth: 100,
          customRender: (text, record) => {
            return text || "--";
          },
        },
        {
          title: '送试单位',
          dataIndex: 'custNames',
          minWidth: 100,
        },
        {
          title: '试验项目',
          dataIndex: 'unitNames',
          minWidth: 120,
        },
        {
          title: '试验设备',
          dataIndex: 'equipName',
          minWidth: 150,
        },
        {
          title: '巡检记录',
          align: 'center',
          width: 110,
          dataIndex: 'archiveRecord',
          scopedSlots: {customRender: 'archiveRecord'}
        },
        {
          title: '实施方案',
          align: 'center',
          width: 110,
          dataIndex: 'embodiment',
          scopedSlots: {customRender: 'embodiment'}
        },
        {
          title: '期望开始时间',
          dataIndex: 'predictStartTime',
          customRender: (time) => {
            return time && time != 0 ? moment(parseFloat(time)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
          minWidth: 150,
        },
        {
          title: '预计用时(h)',
          dataIndex: 'predictUseTime',
          minWidth: 100,
        },
        {
          title: '实际开始时间',
          dataIndex: 'realStartTime',
          customRender: (time) => {
            return time && time != 0 ? moment(parseFloat(time)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
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
            return Number(text)
          }
        },
        {
          title: '折后总价',
          dataIndex: 'totalExpenses',
          minWidth: 100,
          customRender: text => {
            return Number(text)
          }
        },
        {
          title: '操作',
          dataIndex: 'actions',
          align: 'center',
          fixed: 'right',
          width: 80,
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
        list: '/HfEnvTestPatrolRecordBusiness/listPage',
      },
    }
  },
  methods: {
    handleDetail(record, activeKey) {
      this.$refs.inspectionRecordModal.show(record.id, activeKey)
    },
    refresh(bool = false) {
      this.$refs.pollingRecordTable.refresh(bool)
    },
  }
}
</script>

<style scoped>

</style>