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
      ref="testApprovalTable"
      slot="content"
      :columns="columns"
      :data="loadData"
      :rowKey="(record) => record.id"
    >
      <template #entrustNos="text, record">
        <a @click="$refs.testTaskBaseInfoModal.show(record,'1','20px')">{{ text }}</a>
      </template>
      <template #entrustCodes="text, record">
        <a @click="$refs.testTaskBaseInfoModal.show(record,null,'20px')">{{ text }}</a>
      </template>
      <template #exceptionNum="text, record">
        <a @click="$refs.abnormalDetailModal.show(record)">{{ text }}</a>
      </template>
      <template slot="status" slot-scope="text,record">
        <span v-if="record.forceEndStatus === 10">
          <a-badge :color="testStatusMap[text].color" :text="testStatusMap[text].text + '-终止申请中'"/>
        </span>
        <span v-else>
          <a-badge :color="testStatusMap[text].color" :text="testStatusMap[text].text"/>
        </span>
        <a-tooltip title="查看终止记录">
          <a-icon class="primary-text" style="margin-left:5px" type="eye"
                  @click="$refs.TerminationDetailModal.show(record,`${record.testNames}(${record.testCode})`)"/>
        </a-tooltip>
      </template>
      <template #archiveRecord="text,record">
        <a-space style="cursor: pointer">
          <a-icon class="primary-text" title="查看" type="eye"
                  @click="handleReviewPdf('巡检记录',record.pdfPathXh)"/>
          <a title="下载word" @click="handleDownloadDocx(record.docxPathXh)">
            <a-icon class="primary-text" type="download"></a-icon>
          </a>
        </a-space>
      </template>
      <template #embodiment="text,record">
        <a-space style="cursor: pointer">
          <a-icon class="primary-text" title="查看" type="eye"
                  @click="handleReviewPdf('实施方案',record.pdfPathSs)"></a-icon>
          <a title="下载word" @click="handleDownloadDocx(record.docxPathSs)">
            <a-icon class="primary-text" type="download"></a-icon>
          </a>
        </a-space>
      </template>
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
    <test-task-base-info-modal ref="testTaskBaseInfoModal"/>
    <abnormal-detail-modal ref="abnormalDetailModal"/>
    <termination-detail-modal ref="TerminationDetailModal" listType="testForceEndList"></termination-detail-modal>
  </h-card>
</template>

<script>
import moment from "moment";
import {createLink, postAction} from "@api/manage";
import TestTaskBaseInfoModal from "@views/hifar/hifar-environmental-test/task/TestTaskBaseInfoModal";
import AbnormalDetailModal from "@views/hifar/hifar-environmental-test/task/modules/AbnormalDetailModal";
import TerminationDetailModal from "@views/hifar/hifar-environmental-test/task/modules/TerminationDetailModal";

export default {
  name: "TestApprovalList",
  components: {
    TestTaskBaseInfoModal,
    AbnormalDetailModal,
    TerminationDetailModal
  },
  data() {
    return {
      queryParams: {},
      testStatusMap: {
        1: {color: "geekblue", text: "未开始"},
        10: {color: "red", text: "已撤销"},
        20: {color: "green", text: "进行中"},
        30: {color: "volcano", text: "暂停"},
        40: {color: "red", text: "终止"},
        50: {color: "grey", text: "已完成"},
      },
      searchData: [
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
          ],
        },
        {
          title: '任务编号',
          key: 'taskCode',
          formType: 'input',
        },
        {
          title: '送试单位',
          key: 'custName',
          formType: 'input',
        },

        {
          title: '试验项目',
          key: 'unitName',
          formType: 'input',
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
        },
        {
          title: '状态',
          dataIndex: 'status',
          scopedSlots: {customRender: 'status'},
          width: 190,
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
          title: '设备速率',
          dataIndex: 'testRate',
          minWidth: 100,
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
          title: '巡检记录',
          align: 'center',
          width: 80,
          dataIndex: 'archiveRecord',
          scopedSlots: {customRender: 'archiveRecord'}
        },
        {
          title: '实施方案',
          align: 'center',
          width: 80,
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
          title: '预计结束时间',
          dataIndex: 'taskEndTime',
          minWidth: 150,
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          }
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
          c_status_1: 40,
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
        list: '/HfEnvTaskTestBusiness/listPageForStopEquip',
        approval: "/HfEnvTestForceEndBusiness/forceEndCallBack"
      },
    }
  },
  methods: {
    handleReviewPdf(title, path) {
      this.reviewPdfTitle = title
      this.$refs.reviewPdf.show(path)
    },
    handleDownloadDocx(filePath) {
      if (!filePath) return this.$message.warning('暂无数据')
      createLink(filePath)
    },
    handleApproval(id, callbackType) {
      postAction(this.url.approval, {testId: id, callbackType}).then(res => {
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
      this.$refs.testApprovalTable.refresh(bool)
    },
  }
}
</script>

<style scoped>

</style>