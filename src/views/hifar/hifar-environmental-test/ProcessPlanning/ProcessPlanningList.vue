<!--
 * @Author: 雷宇航
 * @Date: 2022-08-26 10:17:11
 * @fileName: ProcessPlanningList.vue
 * @FilePath: tdm200-client\src\views\hifar\hifar-environmental-test\ProcessPlanning\ProcessPlanningList.vue
 * @Description: 工艺规划页面（由试验员在此填写试验条件）
-->
<template>
  <div ref='ProcessPlanningList' class='ProcessPlanningList'>
    <h-card fixed>
      <template slot='title'> 工艺规划</template>
      <h-search slot='search-form' v-model='queryParams' :data='searchForm' size='default' @change='refresh(true)'/>
      <template slot='table-operator'>
        <!--按钮插槽-->
      </template>
      <h-vex-table
        ref='ProcessPlanningTable'
        slot='content'
        :columns='columns'
        :data='loadData'
        :rowSelection='{ selectedRowKeys: selectedRowKeys, onSelect: onSelect }'
      >
        <span slot='entrustNo' slot-scope='text, record'>
          <h-icon v-if="record.entrustType == '1'" type='icon-nei'/>
          <h-icon v-else type='icon-wai'/>
          <span style="margin-left:5px">{{ record.entrustNo ? record.entrustNo : '--' }}</span>
        </span>
        <span slot='status' slot-scope='text, record'>
          <a-badge :color='record.status | wtStatusColorFilter' :text='record.status | wtStatusFilter'/>
        </span>
        <template slot='actions' slot-scope='text, record'>
          <a @click="handlePlannings(record)">工艺规划</a>
        </template>
      </h-vex-table>
      <write-test-condition-modal ref="WriteTestConditionModal"></write-test-condition-modal>
    </h-card>
  </div>
</template>

<script>
import mixin from "@views/hifar/hifar-environmental-test/mixin";
import moment from "moment";
import {postAction} from "@api/manage";
import WriteTestConditionModal from "@views/hifar/hifar-environmental-test/ProcessPlanning/WriteTestConditionModal";

export default {
  name: "ProcessPlanningList",
  components: {WriteTestConditionModal},
  provide() {
    return {
      getContainer: () => this.$refs.ProcessPlanningList
    }
  },
  mixins: [mixin],
  data() {
    return {
      url: {
        list: '/HfEnvEntrustBusiness/listPage',
      },
      queryParams: {},
      selectedRowKeys: [],
      selectedRows: [],
      searchForm: [
        {
          title: '委托单号',
          key: 'c_entrustNo_7',
          formType: 'input'
        },
        {
          title: '委托单位',
          key: 'c_custName_7',
          formType: 'input'
        },
        {
          title: '样品名称',
          key: 'productName',
          formType: 'input'
        },
        {
          title: "样品工号",
          key: "productCode",
          formType: 'input'
        },
        {
          title: '样品代号',
          key: 'productAlias',
          formType: 'input'
        },
        {
          title: '样品编号',
          key: 'pieceNo',
          formType: 'input'
        },
        {
          title: '试验项目',
          key: 'unitName',
          formType: 'input'
        },
        {
          title: '状态',
          key: 'c_status_1',
          formType: 'select',
          options: [
            {
              title: '草稿',
              key: 1,
              value: 1
            },
            {
              title: '已提交',
              key: 10,
              value: 10
            },
            {
              title: '已通过',
              key: 20,
              value: 20
            },
            {
              title: '已驳回',
              key: 30,
              value: 30
            },
            {
              title: '待出报告',
              key: 40,
              value: 40
            },
            {
              title: '已出报告',
              key: 50,
              value: 50
            }
          ]
        },
        {
          title: '外包单位',
          key: 'c_outsourcingUnit_7',
          formType: 'input'
        },

      ],
      columns: [
        {
          title: '委托单号',
          align: 'left',
          width: 140,
          dataIndex: 'entrustNo',
          scopedSlots: {customRender: 'entrustNo'},
          fixed: 'left'
        },
        {
          title: '状态',
          align: 'left',
          dataIndex: 'status',
          minWidth: 100,
          scopedSlots: {customRender: 'status'}
        },
        {
          title: '外包单位',
          align: 'left',
          dataIndex: 'outsourcingUnit',
          minWidth: 180,
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '委托单位',
          align: 'left',
          dataIndex: 'custName',
          minWidth: 100,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '样品名称',
          align: 'left',
          minWidth: 200,
          dataIndex: 'productNames',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: "样品代号",
          align: "left",
          dataIndex: "productAliass",
          minWidth: 100,
          customRender: (text, record) => {
            return text || "--";
          },
        },
        {
          title: "样品工号",
          minWidth: 150,
          dataIndex: "productCodes",
          align: "center",
          customRender: (t) => {
            return t || '--'
          }
        },
        {
          title: "样品编号",
          align: "left",
          dataIndex: "pieceNo",
          minWidth: 100,
          customRender: (text, record) => {
            return text || "--";
          },
        },
        {
          title: '样品数量',
          align: 'center',
          dataIndex: 'productNums',
          minWidth: 100,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: "联系人",
          align: "center",
          dataIndex: "linkName",
          width: 120,
          customRender: (text, record) => {
            return text || "--";
          },
        },
        {
          title: "联系方式",
          align: "center",
          width: 150,
          dataIndex: "linkMobile",
          customRender: (text, record) => {
            return text || "--";
          },
        },
        {
          title: '试验性质',
          align: 'left',
          minWidth: 80,
          dataIndex: 'testPropertyCodeText',
          customRender: (text, record) => {
            return text || "--";
          }
        },
        {
          title: '试验项目',
          align: 'left',
          dataIndex: 'unitNames',
          minWidth: 100,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '委托日期',
          align: 'left',
          dataIndex: 'entrustTime',
          minWidth: 100,
          customRender: (time) => {
            return time && time != 0 ? moment(parseInt(time)).format('YYYY-MM-DD') : '--'
          }
        },
        {
          title: '创建人 ',
          align: 'left',
          minWidth: 100,
          dataIndex: 'createUserName',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '创建时间 ',
          align: 'left',
          minWidth: 140,
          dataIndex: 'createTime',
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          }
        },
        {
          title: '操作',
          dataIndex: 'actions',
          fixed: 'right',
          width: 100,
          align: 'center',
          scopedSlots: {customRender: 'actions'}
        }
      ],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
          c_status_1: 10
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code === 200) {
            return res.data
          }
        })
      },
    }
  },
  methods: {
    refresh(bool = true) {
      this.$refs.ProcessPlanningTable.refresh(bool)
      this.selectedRowKeys = []
      this.selectedRows = []
    },
    onSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    handlePlannings(record) {
      this.$refs.WriteTestConditionModal.show(record)
    },
  }
}
</script>

<style lang='less' scoped>
.ProcessPlanningList {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>