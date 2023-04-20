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
      ref="taskApprovalTable"
      slot="content"
      :columns="columns"
      :data="loadData"
      :rowKey="(record) => record.id"
    >
      <template slot="status" slot-scope="text, record">
        <a-badge :color="taskStatusMap[+text].color"
                 :text="taskStatusMap[+text].text + (record.forceEndStatus === 10 ? '-终止申请中' : '')"/>
        <a-tooltip v-if="text === 20" title="查看终止记录">
          <a-icon class="primary-text" style="margin-left:5px" type="eye"
                  @click="$refs.TerminationDetailModal.show(record,record.unitName)"/>
        </a-tooltip>
      </template>
      <span slot="entrustNo" slot-scope="text, record">
                <a v-if="text" @click="$refs.taskDetail.show(record,'1')">
                  <h-icon :type="record.alert ? 'icon-jingbaobaojing2' : ''" style="font-size: 20px"/>
                  <span :style="{ marginLeft: record.alert ? 0 : '20px' }">{{ text }}</span>
                </a>
                <span v-else> -- </span>
              </span>
      <span slot="entrustCode" slot-scope="text, record">
                <a v-if="text" @click="$refs.taskDetail.show(record)">{{ text ? text : '--' }}</a>
                <span v-else> -- </span>
              </span>
      <span slot="testNum" slot-scope="text, record">
                <a v-if="text" @click="$refs.TestInfoListModal.show(record)">
                  {{ text }}
                </a>
                <span v-else> -- </span>
              </span>
      <span slot="actions" slot-scope="text, record">
        <template v-if="record.forceEndStatus === 10">
          <a-popconfirm title="确定通过吗?" @confirm="() => handleApproval(record.id,'ProcessEnd')">
            <h-icon class="success-text" style="cursor: pointer" title="审批通过" type="icon-wancheng1"/>
          </a-popconfirm>
          <a-popconfirm title="确定驳回终止吗?" @confirm="() => handleApproval(record.id,'ProcessRefuse')">
            <h-icon
              class="danger-text"
              style="cursor: pointer;margin-left: 20px"
              title="审批驳回"
              type="icon-chacha"
            />
           </a-popconfirm>
          </template>
      </span>
    </h-vex-table>
    <task-detail ref="taskDetail"/>
    <test-info-list-modal ref="TestInfoListModal" isReadOnly/>
    <termination-detail-modal ref="TerminationDetailModal" listType="taskForceEndList"></termination-detail-modal>
  </h-card>
</template>

<script>
import moment from "moment";
import {postAction} from "@api/manage";
import TerminationDetailModal from "@views/hifar/hifar-environmental-test/task/modules/TerminationDetailModal";
import TaskDetail from "@views/hifar/hifar-environmental-test/task/modules/TaskDetail";
import TestInfoListModal from "@views/hifar/hifar-environmental-test/task/modules/TestInfoListModal";

export default {
  name: "TaskApprovalList",
  components: {
    TerminationDetailModal,
    TaskDetail,
    TestInfoListModal,
  },
  data() {
    return {
      queryParams: {},
      searchData: [
        {
          title: '运行单号',
          key: 'c_entrustCode_7',
          formType: 'input'
        },
        {
          title: '委托单号',
          key: 'c_entrustNo_7',
          formType: 'input'
        },
        {
          title: '送试单位',
          key: 'c_custName_7',
          formType: 'input'
        },
        {
          title: '任务编号',
          key: 'c_taskCode_7',
          formType: 'input'
        },
        {
          title: '试验项目',
          key: 'c_unitName_7',
          formType: 'input'
        }
      ],
      selectedRowKeys: [],
      selectedRows: [],
      columns: [
        {
          title: '运行单号',
          dataIndex: 'entrustCode',
          minWidth: 160,
          scopedSlots: {
            customRender: 'entrustCode'
          }
        },
        {
          title: '委托单号',
          dataIndex: 'entrustNo',
          minWidth: 160,
          scopedSlots: {
            customRender: 'entrustNo'
          }
        },
        {
          title: '送试单位',
          dataIndex: 'custName',
          minWidth: 120
        },
        {
          title: '任务状态',
          dataIndex: 'status',
          scopedSlots: {
            customRender: 'status'
          },
          minWidth: 190
        },
        {
          title: '试验项目',
          dataIndex: 'unitName',
          minWidth: 100
        },
        {
          title: '试验',
          dataIndex: 'testNum',
          minWidth: 100,
          align: 'center',
          scopedSlots: {
            customRender: 'testNum'
          }
        },
        {
          title: '产品名称',
          align: 'left',
          dataIndex: 'productNames',
          minWidth: 100,
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '产品代号',
          align: 'left',
          dataIndex: 'productAliass',
          minWidth: 100,
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '产品编号',
          align: 'left',
          dataIndex: 'pieceNo',
          minWidth: 100,
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '数量',
          dataIndex: 'productNums',
          minWidth: 100,
          align: 'center'
        },
        {
          title: '异常数量',
          minWidth: 100,
          dataIndex: 'exceptionNum',
          align: 'center'
        },
        {
          title: '试验标准',
          dataIndex: 'standardName',
          minWidth: 150
        },
        {
          title: '委托日期',
          dataIndex: 'entrustTime',
          minWidth: 160,
          customRender: (text) => {
            return text && text != 0 ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          }
        },
        {
          title: '委托单创建日期',
          dataIndex: 'entrustCreateTime',
          minWidth: 160,
          customRender: (text) => {
            return text && text != 0 ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          }
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          width: 100,
          scopedSlots: {
            customRender: 'actions'
          }
        }
      ],
      taskStatusMap: {
        1: {color: "geekblue", text: "未分配"},
        10: {color: "green", text: "已分配"},
        15: {color: "cyan", text: "执行中"},
        20: {color: "volcano", text: "已终止"},
        30: {color: "grey", text: "已完成"},
      },
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
          c_status_1: 20,
          forceEndStatus: 10,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code === 200) {
            this.$emit('reload')
            return res.data
          }
        })
      },
      url: {
        list: '/HfEnvTaskTestBusiness/listPage',
        approval: "/HfEnvTaskTestBusiness/forceEndCallBack"
      },
    }
  },
  methods: {
    handleApproval(id, callbackType) {
      postAction(this.url.approval, {taskId: id, callbackType}).then(res => {
        if (res.code === 200) {
          const obj = {
            ProcessRefuse: "驳回成功",
            ProcessEnd: "审批通过",
          }
          this.$message.success(obj[callbackType])
          this.refresh()
        }
      })
    },
    refresh(bool = true) {
      this.$refs.taskApprovalTable.refresh(bool)
    },
  }
}
</script>

<style scoped>

</style>