<template>
  <h-card fixed :bordered="false">
    <h-search
      v-model="queryParams"
      slot="search-form"
      size="small"
      :showToggleButton="true"
      :data="searchData"
      @change="refresh"
    />
    <h-vex-table
      slot="content"
      ref="table"
      :columns="columns"
      :data="loadData"
      :rowKey="(record) => record.id"
    >
      <span slot="entrustCode" slot-scope="text, row">
        <a @click="handleEntrustDetail(row,'2')"></a>
      </span>
      <span slot="entrustNo" slot-scope="text, row">
        <a @click="handleEntrustDetail(row,'1')"></a>
      </span>
      <div slot="action" slot-scope="text, record">
        <a-icon
          type="eye"
          title="详情"
          class="primary-text"
          style="cursor: pointer"
          @click="() => handleDetail(record)"
        />
      </div>
    </h-vex-table>
  </h-card>
</template>

<script>

import {postAction} from "@api/manage";
import moment from "moment/moment";

export default {
  name: "integratedQueryTable",
  props: {
    queryType: {
      type: String,
      default: '1'
    }
  },
  data() {
    return {
      queryParams: {},
      searchData: [
        {
          title: '报告编号',
          key: 'c_reportCode_7',
          formType: 'input'
        },
        {
          title: '试验编号',
          key: 'c_testCode_7',
          formType: 'input'
        },
        {
          title: '委托单号',
          key: 'c_entrustNo_7',
          formType: 'input'
        },
        {
          title: '运行单号',
          key: 'c_entrustCode_7',
          formType: 'input'
        },
        {
          title: '状态',
          key: 'c_status_1',
          formType: 'select',
          options: [
            {title: '待生成', value: 1, key: 1},
            {title: '生成中', value: 2, key: 2},
            {title: '已生成', value: 3, key: 3},
            {title: '已提交', value: 10, key: 10},
            {title: '审核通过', value: 20, key: 20},
            {title: '审核驳回', value: 30, key: 30},
            {title: '批准通过', value: 40, key: 40},
            {title: '批准驳回', value: 50, key: 50},
            {title: '修改审批', value: 60, key: 60},
            {title: '修改审批通过', value: 70, key: 70},
            {title: '修改审批驳回', value: 80, key: 80},
          ]
        },
        {
          title: '送试单位',
          key: 'c_custName_7',
          formType: 'input'
        },
        {
          title: '联系人',
          key: 'c_custLinkName_7',
          formType: 'input'
        },
        {
          title: '联系方式',
          key: 'c_custLinkMobile_7',
          formType: 'input'
        },

        {
          title: '试验项目',
          key: 'c_testName_7',
          formType: 'input'
        }
      ],
      columns: [
        {
          title: '报告编号',
          align: 'left',
          dataIndex: 'reportCode',
          width: 140,
          customRender: (t) => {
            return t || '--'
          }
        },
        {
          title: '试验编号',
          align: 'left',
          width: 120,
          dataIndex: 'testCode'
        },
        {
          title: '运行单号',
          align: 'left',
          width: 140,
          dataIndex: 'entrustCode',
          scopedSlots: {customRender: 'entrustCode'},
        },
        {
          title: '委托单号',
          align: 'left',
          width: 120,
          dataIndex: 'entrustNo',
          scopedSlots: {customRender: 'entrustNo'},
        },
        {
          title: '状态',
          align: 'left',
          width: 120,
          dataIndex: 'status',
          scopedSlots: {customRender: 'status'}
        },
        {
          title: '送试单位',
          align: 'left',
          width: 190,
          dataIndex: 'custName',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '联系人',
          align: 'left',
          width: 80,
          dataIndex: 'custLinkName',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '联系方式',
          align: 'left',
          width: 120,
          dataIndex: 'custLinkMobile',
          customRender: (text, record) => {
            return text || '--'
          }
        },

        {
          title: '移交状态',
          align: 'center',
          width: 100,
          dataIndex: 'transferStatus',
          scopedSlots: {customRender: 'transferStatus'}
        },
        {
          title: '试验项目',
          align: 'left',
          width: 150,
          dataIndex: 'testName',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '创建人 ',
          align: 'left',
          width: 80,
          dataIndex: 'createUserName',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '创建时间 ',
          align: 'left',
          width: 140,
          dataIndex: 'createTime',
          customRender: text => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD HH:mm') : '--'
          }
        },
        {
          title: '查看下载记录 ',
          align: 'center',
          width: 120,
          dataIndex: 'downloadNum',
          scopedSlots: {customRender: 'downloadNum'}
        },
        {
          title: 'mes推送状态',
          align: 'center',
          width: 120,
          dataIndex: 'mesPushStatus',
          scopedSlots: {customRender: 'mesPushStatus'}
        },
        {
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          width: 240,
          align: 'center',
          scopedSlots: {customRender: 'action'}
        }
      ],
      url: {
        list: "/HfEnvEntrustBusiness/listPage"
      },
      loadData: params => {
        return postAction(this.url.list, {
          ...params,
          ...this.queryParams,
        }).then(res => {
          if (res.code === 200) {
            return res.data
          }
        })
      }
    }
  },
  methods: {
    handleEntrustDetail(row, type) {

    },
    refresh(bool = true) {
      this.$refs.table.refresh(bool)
    },
  },
}
</script>

<style scoped lang="less">

</style>