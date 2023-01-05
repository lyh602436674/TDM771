<template>
  <div ref="testArchive" class="testArchive">
    <h-card fixed>
      <template slot="title">试验归档</template>
      <h-search slot="search-form" v-model="queryParams" :data="searchForm" size="default" @change="refresh(true)"/>
      <template slot="table-operator">
        <a-button
          size="small"
          type="ghost-primary"
          @click="handleTestBefore">
          <h-icon type="icon-jianchaqianzhunbei"/>
          试前准备
        </a-button>
        <a-button
          size="small"
          type="ghost-primary"
          @click="handleTestMiddle">
          <h-icon type="icon-jianchazhong"/>
          试中操作
        </a-button>
        <a-button
          size="small"
          type="ghost-primary"
          @click="handleTestAfter">
          <h-icon type="icon-shiyanhouguanli"/>
          试后处理
        </a-button>
      </template>
      <h-vex-table
        ref="testArchiveTable"
        slot="content"
        :columns="columns"
        :data="loadData"
        :rowSelection="{ selectedRowKeys, onSelect: onSelect }"
      >
        <template #taskno="text, record">
          <a @click="handleDetail(record)">{{ text }}</a>
        </template>
        <template #exceptioncnt="text, record">
          <a v-if="text" @click="handleAbnormalDetail(record)">{{ text }}</a>
          <span v-else>0</span>
        </template>
        <template #taskstate="text, record">
          <a-tag :color="taskStatusColor[text - 1]">{{ taskStatus[text] }}</a-tag>
        </template>
        <template #archiveRecord="text,record">
          <a-space style="cursor: pointer">
            <a-icon class="primary-text" title="查看" type="eye"
                    @click="handleReviewPdf('巡检记录',record.pdfPathXh)"/>
            <a-icon class="primary-text" title="在线编辑" type="edit"
                    @click="webOfficeEdit(record.docxPathXh)"/>
          </a-space>
        </template>
        <template #embodiment="text,record">
          <a-space style="cursor: pointer">
            <a-icon class="primary-text" title="查看" type="eye"
                    @click="handleReviewPdf('实施方案',record.pdfPathSs)"/>
            <a-icon class="primary-text" title="在线编辑" type="edit"
                    @click="webOfficeEdit(record.docxPathSs)"/>
          </a-space>
        </template>
      </h-vex-table>
    </h-card>
    <test-archive-detail ref="testArchiveDetail"></test-archive-detail>
    <abnormal-detail-modal ref="abnormalDetailModal" isReadOnly/>
    <test-entrust-review-pdf ref="reviewPdf" :title="reviewPdfTitle"/>
    <test-task-base-info-modal ref="testTaskBaseInfoModal" :showExceptionAndEnd="true"/>
  </div>
</template>

<script>
import moment from 'moment'
import {postAction} from '@api/manage'
import mixin from '@views/hifar/hifar-environmental-test/mixin.js'
import AbnormalDetailModal from "@views/hifar/hifar-environmental-test/task/modules/AbnormalDetailModal";
import {ACCESS_TOKEN} from "@/store/mutation-types";
import * as WebCtrl from "@/plugins/webOffice";
import TestEntrustReviewPdf from "@views/hifar/hifar-environmental-test/task/modules/TestEntrustReviewPdf";
import TestArchiveDetail from "@views/hifar/hifar-environmental-test/testArchive/TestArchiveDetail";
import TestTaskBaseInfoModal from "@views/hifar/hifar-environmental-test/task/TestTaskBaseInfoModal";

let baseUrl = process.env.VUE_APP_API_BASE_URL
export default {
  name: "TestArchiveList",
  provide() {
    return {
      getContainer: () => this.$refs.testArchive
    }
  },
  components: {
    TestArchiveDetail,
    AbnormalDetailModal,
    TestEntrustReviewPdf,
    TestTaskBaseInfoModal
  },
  mixins: [mixin],
  data() {
    return {
      moment,
      url: {
        list: '/HfEnvHistoryTestBusiness/listPage',
      },
      taskStatus: {1: '未发布', 2: '执行中', 3: '已完成', 4: '强制终止'},
      taskStatusColor: ['lightgrey', 'green', 'blue', 'red'],
      queryParams: {},
      selectedRowKeys: [],
      selectedRows: [],
      searchForm: [
        {
          title: '报告编号',
          key: 'c_reportNo_7',
          formType: 'input'
        },
        {
          title: '报告实际编号',
          key: 'c_reportendcode_7',
          formType: 'input'
        },
        {
          title: '送试单位',
          key: 'c_customername_7',
          formType: 'input'
        },
        {
          title: '产品编号',
          key: 'c_productnos_7',
          formType: 'input'
        },
        {
          title: '任务编号',
          key: 'c_taskno_7',
          formType: 'input'
        },
        {
          title: '产品代号',
          key: 'c_producttypes_7',
          formType: 'input'
        },
        {
          title: '试验名称',
          key: 'c_testname_7',
          formType: 'input'
        },
        {
          title: '备注信息',
          key: 'c_remarks_7',
          formType: 'input'
        },
        {
          title: '状态',
          key: 'c_status_1',
          formType: 'select',
          options: [
            {
              title: '草稿',
              key: 9,
              value: 9
            },
            {
              title: '审核中',
              key: 4,
              value: 4
            },
            {
              title: '已完成',
              key: 0,
              value: 0
            },
            {
              title: '已退回',
              key: 5,
              value: 5
            }
          ]
        },
        {
          title: '试验类型',
          key: 'c_testType_1',
          formType: 'select',
          options: [
            {
              title: '气候',
              key: 1,
              value: 1
            },
            {
              title: '力学',
              key: 2,
              value: 2
            },
            {
              title: '其他',
              key: 3,
              value: 3
            }
          ]
        },
        {
          title: '委托编号',
          key: 'c_applyno_7',
          formType: 'input'
        }
      ],
      columns: [
        {
          title: '任务编号',
          align: 'left',
          width: 140,
          dataIndex: 'taskno',
          scopedSlots: {customRender: 'taskno'}
        },
        {
          title: '任务状态',
          align: 'center',
          dataIndex: 'taskstate',
          minWidth: 100,
          scopedSlots: {customRender: 'taskstate'}
        },
        {
          title: '异常数量',
          align: 'center',
          minWidth: 80,
          dataIndex: 'exceptioncnt',
          scopedSlots: {customRender: 'exceptioncnt'}
        },
        {
          title: '终止记录',
          align: 'center',
          minWidth: 80,
          dataIndex: 'forceEndNum',
          scopedSlots: {customRender: 'forceEndNum'}
        },
        {
          title: '设备内部名称',
          align: 'center',
          minWidth: 200,
          dataIndex: 'devicealias',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '委托单号',
          align: 'center',
          dataIndex: 'applyno',
          minWidth: 120,
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '试验项目',
          align: 'center',
          dataIndex: 'projectName',
          minWidth: 150,
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '工序编号',
          align: 'center',
          dataIndex: 'processno',
          minWidth: 120,
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '产品型号',
          align: 'center',
          dataIndex: 'productModel',
          minWidth: 100,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '试件数量',
          align: 'center',
          dataIndex: 'piececount',
          minWidth: 80,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '产品编号',
          align: 'center',
          dataIndex: 'productnos',
          minWidth: 150,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '预计开始时间',
          align: 'center',
          dataIndex: 'estimatedstarttime',
          width: 150,
          customRender: (text, record) => {
            return text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '--'
          }
        },
        {
          title: '预计结束时间',
          align: 'center',
          dataIndex: 'estimatedendtime',
          width: 150,
          customRender: (text, record) => {
            return text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '--'
          }
        },
        {
          title: '实际开始时间',
          align: 'center',
          dataIndex: 'actualstarttime',
          width: 150,
          customRender: (text, record) => {
            return text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '--'
          }
        },
        {
          title: '实际结束时间',
          align: 'center',
          dataIndex: 'actualendtime',
          width: 150,
          customRender: (text, record) => {
            return text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '--'
          }
        },
        {
          title: '创建人 ',
          align: 'center',
          minWidth: 140,
          dataIndex: 'createby',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '更新时间 ',
          align: 'center',
          minWidth: 150,
          dataIndex: 'updatedate',
          customRender: (text, record) => {
            return text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '--'
          }
        },
        {
          title: '备注信息',
          align: 'center',
          dataIndex: 'remarks',
          minWidth: 150,
        },
        {
          title: '巡检记录',
          align: 'center',
          width: 100,
          dataIndex: 'archiveRecord',
          scopedSlots: {customRender: 'archiveRecord'}
        },
        {
          title: '实施方案',
          align: 'center',
          width: 100,
          dataIndex: 'embodiment',
          scopedSlots: {customRender: 'embodiment'}
        },
      ],
      reviewPdfTitle: "",
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams
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
    handleAbnormalDetail(record) {
      record = {
        ...record,
        testNames: record.projectName,
      }
      this.$refs.abnormalDetailModal.show(record)
    },
    handleDetail(record) {
      this.$refs.testTaskBaseInfoModal.show(record, '1', '20px')
    },
    handleTestBefore() {
      this.$refs.testArchiveDetail.show(this.selectedRows[0], 'before')
    },
    handleTestMiddle() {
      this.$refs.testArchiveDetail.show(this.selectedRows[0], 'middle')
    },
    handleTestAfter() {
      this.$refs.testArchiveDetail.show(this.selectedRows[0], 'after')
    },
    handleReviewPdf(title, path) {
      if (!path) return
      this.reviewPdfTitle = title
      this.$refs.reviewPdf.show(path)
    },
    webOfficeEdit(fileUrl) {
      WebCtrl.ShowEditPage(fileUrl.split('?')[0], this.$ls.get(ACCESS_TOKEN), baseUrl, fileUrl.split('?')[1], 'env')
    },
    refresh(bool = true) {
      this.$refs.testArchiveTable.refresh(bool)
      this.selectedRowKeys = []
      this.selectedRows = []
    },
    onSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
  }
}
</script>
<style lang='less' scoped>
.testArchive {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
