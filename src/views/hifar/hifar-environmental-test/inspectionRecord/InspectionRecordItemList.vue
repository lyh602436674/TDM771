<!--
 * @Author: 雷宇航
 * @Date: 2023-04-04 18:15:11
 * @fileName: InspectionRecordList.vue
 * @FilePath: tdm771-client\src\views\hifar\hifar-environmental-test\inspectionRecord\InspectionRecordList.vue
 * @Description: 试验记录
-->
<template>
  <h-card fixed>
    <h-search slot="search-form" v-model="queryParams" :data="searchForm" @change="refresh"/>
    <h-vex-table
      ref="inspectionRecordItemTable"
      slot="content"
      :autoLoad="false"
      :columns="columns"
      :data="loadData"
      :height="500"
    >
      <template slot="status" slot-scope="text">
        <a-badge v-if="text == 1" color="geekblue" text="未开始"/>
        <a-badge v-else-if="text == 10" color="red" text="已撤销"/>
        <a-badge v-else-if="text == 20" color="green" text="进行中"/>
        <a-badge v-else-if="text == 30" color="volcano" text="暂停"/>
        <a-badge v-else-if="text == 40" color="red" text="终止"/>
        <a-badge v-else-if="text == 50" color="grey" text="已完成"/>
        <a-badge v-else-if="text == 60" color="grey" text="已出报告"/>
      </template>
    </h-vex-table>
  </h-card>
</template>

<script>
import moment from "moment";
import {postAction} from "@api/manage";

export default {
  name: "InspectionRecordItemList",
  props: {
    title: {
      type: String,
      default: ''
    },
    rowId: {
      type: String,
      default: ""
    },
    activeKey: {
      type: String,
      default: ""
    },
  },
  data() {
    return {
      moment,
      searchForm: [
        {
          title: '委托单号',
          key: 'entrustNo',
          formType: 'input',
        },
        {
          title: '运行单号',
          key: 'entrustCode',
          formType: 'input',
        },
        {
          title: '试验编号',
          key: 'c_testCode_7',
          formType: 'input',
        },
        {
          title: '试验状态',
          key: 'c_status_1',
          formType: 'select',
          options: [
            {
              title: '未开始',
              key: 1,
              value: 1,
            },
            {
              title: '已撤销',
              key: 10,
              value: 10,
            },
            {
              title: '进行中',
              key: 20,
              value: 20,
            },
            {
              title: '暂停',
              key: 30,
              value: 30,
            },
            {
              title: '终止',
              key: 40,
              value: 40,
            },
            {
              title: '已完成',
              key: 50,
              value: 50,
            },
            {
              title: '已出报告',
              key: 60,
              value: 60,
            },
          ],
        },
        {
          title: '送试单位',
          key: 'custName',
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
          title: '试验项目',
          key: 'unitName',
          formType: 'input',
        },
        {
          title: '实际开始时间',
          key: 'realStartTime',
          showTime: true,
          formType: 'dateRangePick',
        },
        {
          title: '报告编号',
          key: 'reportCodes',
          formType: 'input',
        },
        {
          title: '产品名称',
          key: 'productName',
          formType: 'input',
        },
        {
          title: '产品代号',
          key: 'productAlias',
          formType: 'input',
        },
        {
          title: '产品编号',
          key: 'pieceNo',
          formType: 'input',
        },
      ],
      queryParams: {},
      columns: [
        {
          title: '试验编号',
          dataIndex: 'testCode',
          minWidth: 120,
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
          customRender: (text, row) => {
            return `${row.innerName + row.equipName}`
          }
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
      ],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
          patrolRecordId: this.rowId
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code === 200) {
            return res.data[this.activeKey]
          }
        })
      },
      url: {
        list: 'HfEnvTestPatrolRecordBusiness/listPageForEquipAll',
      },
    }
  },
  methods: {
    refresh(bool = false) {
      this.$refs.inspectionRecordItemTable.refresh(bool)
    },
  }
}
</script>

<style scoped>

</style>