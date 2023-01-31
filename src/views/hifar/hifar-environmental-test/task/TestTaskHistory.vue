<!--
 * @Author: 赵峰
 * @Date: 2021-11-05 14:30:49
 * @LastEditTime: 2021-11-26 13:29:08
 * @LastEditors: 马潭龙
 * @Descripttion: 历史试验
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\TestTaskHistory.vue
-->
<template>
  <div class="task-history" ref="taskHistory">
    <h-card fixed title="试验查询">
      <h-search v-model="queryParams" slot="search-form" :data="searchForm" @change="refresh"/>
      <div slot="table-operator" style="border-top: 5px">
        <a-button
          v-for="(item, index) in operatorButtons"
          :key="item.key"
          :size="item.size"
          :type="item.type"
          :v-has="item.has"
          @click="() => item.click(item, index)"
        >
          <a-icon v-if="item.icon.indexOf('icon-') === -1" :type="item.icon"/>
          <h-icon v-else :type="item.icon"/>
          {{ item.title }}
        </a-button>
        <a-button icon="export" size="small" type="ghost-warning" @click="handleExportXls('试验查询信息')">
          导出
        </a-button>
      </div>
      <h-vex-table ref="taskHistoryTable" slot="content" :columns="columns" :data="loadData"
                   :rowSelection='{ selectedRowKeys, onSelect }'>
        <a slot="testCode" slot-scope="text, record" @click="handleShowDetail(record)">
          {{ record.testCode || '--' }}
        </a>
        <template slot="status" slot-scope="text">
          <a-badge v-if="text == 1" color="geekblue" text="未开始"/>
          <a-badge v-else-if="text == 10" color="red" text="已撤销"/>
          <a-badge v-else-if="text == 20" color="green" text="进行中"/>
          <a-badge v-else-if="text == 30" color="volcano" text="暂停"/>
          <a-badge v-else-if="text == 40" color="red" text="终止"/>
          <a-badge v-else-if="text == 50" color="grey" text="已完成"/>
          <a-badge v-else-if="text == 60" color="grey" text="已出报告"/>
        </template>
        <template #archiveRecord="text,record">
          <a-space style="cursor: pointer">
            <a-icon class="primary-text" title="查看" type="eye"
                    @click="handleReviewPdf('巡检记录',record.pdfPathXh)"/>
            <a-icon class="primary-text" title="在线编辑" type="edit"
                    @click="webOfficeEdit(record.docxPathXh)"/>
            <a :href="record.docxPathXh" title="下载word">
              <a-icon class="primary-text" type="download"/>
            </a>
            <h-upload-file-b
              v-model="swapFileList"
              :customParams="{id:record.id}"
              accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              isPublic
              @beforeUpload="$refs.taskHistoryTable.localLoading = true"
              @change="file => handleUploadCallback(file, record,'1')">
              <a-icon class="primary-text cursor-pointer" title='替换' type='swap'/>
            </h-upload-file-b>
          </a-space>
        </template>
        <template #embodiment="text,record">
          <a-space style="cursor: pointer">
            <a-icon class="primary-text" title="查看" type="eye"
                    @click="handleReviewPdf('实施方案',record.pdfPathSs)"/>
            <a-icon class="primary-text" title="在线编辑" type="edit"
                    @click="webOfficeEdit(record.docxPathSs)"/>
            <a :href="record.docxPathSs" title="下载word">
              <a-icon class="primary-text" type="download"/>
            </a>
            <h-upload-file-b
              v-model="swapFileList"
              :customParams="{id:record.id}"
              accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              isPublic
              @beforeUpload="$refs.taskHistoryTable.localLoading = true"
              @change="file => handleUploadCallback(file, record,'2')">
              <a-icon class="primary-text cursor-pointer" title='替换' type='swap'/>
            </h-upload-file-b>
          </a-space>
        </template>
        <template slot="actions" slot-scope="text, record">
          <a-tooltip title="查看">
            <a-icon class="primary-text" type="eye" @click="() => handleShowDetail(record)"/>
          </a-tooltip>
        </template>
      </h-vex-table>
    </h-card>
    <!--    showExceptionAndEnd 是否展示异常信息和终止信息-->
    <test-task-base-info-modal ref="TaskDetailModal" :showExceptionAndEnd="true"/>
    <task-abnormal-modal ref="taskAbnormalModal" @change="refreshEquipTaskList"></task-abnormal-modal>
    <test-data-add-modal ref="testDataAddModal" @change="refreshEquipTaskList"></test-data-add-modal>
    <test-check-modal ref="testCheckModal"/>
    <test-base-edit ref="TestBaseEdit" :records="records" :selectedTreeRows="selectedRows"
                    @change="refreshEquipTaskList"/>
    <test-entrust-review-pdf ref="reviewPdf" :title="reviewPdfTitle"/>
  </div>
</template>

<script>
import {downloadFile, postAction} from '@/api/manage'
import moment from 'moment'
import TestTaskBaseInfoModal from '@/views/hifar/hifar-environmental-test/task/TestTaskBaseInfoModal'
import TestCheckModal from "@views/hifar/hifar-environmental-test/task/checkModal/TestCheckModal";
import TestBaseEdit from "@views/hifar/hifar-environmental-test/task/checkModal/TestBaseEdit";
import testDataAddModal from "@views/hifar/hifar-environmental-test/task/modules/TestDataAddModal";
import TaskAbnormalModal from "@views/hifar/hifar-environmental-test/task/checkModal/TaskAbnormalModal";
import {ACCESS_TOKEN} from "@/store/mutation-types";
import * as WebCtrl from "@/plugins/webOffice";
import TestEntrustReviewPdf from "@views/hifar/hifar-environmental-test/task/modules/TestEntrustReviewPdf";

let baseUrl = process.env.VUE_APP_API_BASE_URL
export default {
  provide() {
    return {
      getContainer: () => this.$refs.taskHistory,
    }
  },
  components: {
    TestTaskBaseInfoModal, TestCheckModal, TestBaseEdit, testDataAddModal, TaskAbnormalModal, TestEntrustReviewPdf
  },
  data() {
    return {
      reviewPdfTitle: '',
      queryParams: {},
      records: {},
      swapFileList: [],
      selectedRowKeys: [],
      selectedRows: [],
      operatorButtons: [
        {
          title: '试前检查',
          key: '0',
          size: 'small',
          type: 'primary',
          has: 'ArrangeMent:boforTest',
          icon: 'icon-jianchaqianzhunbei',
          click: (item, index) => {
            if (!this.selectedRows.length) {
              this.$message.error('请至少选择一项')
            } else {
              this.$refs.testCheckModal.show(this.selectedRows[0], '试前', 'before')
            }
          },
        },
        {
          title: '试中检查',
          key: '1',
          size: 'small',
          type: 'primary',
          has: 'ArrangeMent:intest',
          icon: 'icon-jianchazhong',
          click: (item, index) => {
            if (!this.selectedRows.length) {
              this.$message.error('请至少选择一项')
            } else if (this.selectedRows.length > 1) {
              this.$message.error('请至少选择一项')
            } else {
              this.$refs.testCheckModal.show(this.selectedRows[0], '试中', 'testMiddle')
            }
          },
        },
        {
          title: '试后检查',
          key: '2',
          size: 'small',
          type: 'primary',
          has: 'ArrangeMent:afterTest',
          icon: 'icon-shiyanhouguanli',
          click: (item, index) => {
            if (!this.selectedRows.length) {
              this.$message.error('请至少选择一项')
            } else if (this.selectedRows.length > 1) {
              this.$message.error('请至少选择一项')
            } else {
              this.$refs.testCheckModal.show(this.selectedRows[0], '试后', 'after')
            }
          },
        },
        {
          title: '试验结果',
          key: '3',
          size: 'small',
          has: 'ArrangeMent:edit',
          icon: 'icon-tianxie',
          type: 'primary',
          click: (item, index) => {
            if (this.selectedRows.length === 0) {
              this.$message.error('请至少选择一项')
            } else if (this.selectedRows.length > 1) {
              this.$message.error('请至少选择一项')
            } else {
              this.records = this.selectedRows[0]
              this.$refs.TestBaseEdit.show(this.selectedRows[0])
            }
          },
        },
        {
          title: '试验数据',
          key: '4',
          size: 'small',
          has: 'ArrangeMent:dataTest',
          icon: 'icon-shiyanshuju',
          type: 'primary',
          click: (item, index) => {
            if (!this.selectedRows.length) {
              this.$message.error('请至少选择一项')
            } else if (this.selectedRows.length > 1) {
              this.$message.error('请至少选择一项')
            } else {
              this.$refs.testDataAddModal.show(this.selectedRows[0])
            }
          },
        },
        {
          title: '异常记录',
          key: '5',
          size: 'small',
          has: 'ArrangeMent:errRecord',
          icon: 'icon-gantanhao',
          type: 'primary',
          click: (item, index) => {
            if (!this.selectedRows.length) {
              this.$message.error('请至少选择一项')
            } else if (this.selectedRows.length > 1) {
              this.$message.error('请至少选择一项')
            } else {
              this.$refs.taskAbnormalModal.show('error', this.selectedRows[0])
            }
          },
        },
      ],
      searchForm: [
        {
          title: '运行单号',
          key: 'entrustCode',
          formType: 'input',
        },
        {
          title: '委托单号',
          key: 'entrustNo',
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
          key: 'productNo',
          formType: 'input',
        },
      ],
      columns: [
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
        if (data.realStartTime && data.realStartTime.length > 0) {
          data.beginTime = moment(data.realStartTime[0]).format('YYYY-MM-DD') + ' 00:00:00'
          data.endTime = moment(data.realStartTime[1]).format('YYYY-MM-DD') + ' 23:59:59'
          data.c_realStartTime_4 = moment(data.beginTime).format('X') * 1000
          data.c_realStartTime_6 = moment(data.endTime).format('X') * 1000
        }
        delete data.beginTime
        delete data.endTime
        delete data.realStartTime

        return postAction(this.url.list, data).then((res) => {
          if (res.code === 200) {
            return res.data
          }
        })
      },
      url: {
        list: '/HfEnvTaskTestBusiness/listPageForEquipAll',
        export: '/HfEnvTaskTestBusiness/listAllForExport',
        authUploads: "/HfResEquipBusiness/authUploads"
      },
    }
  },
  methods: {
    /**
     * @type 1:巡检 2:实施
     * */
    handleUploadCallback(file, record, type) {
      postAction(this.url.authUploads, {id: record.id, fileId: file[0].fileId, type}).then(res => {
        if (res.code === 200) {
          this.$message.success('替换成功')
        } else {
          this.$message.error('替换失败')
        }
      }).finally(() => {
        this.refresh()
        this.swapFileList = []
      })
    },
    handleReviewPdf(title, path) {
      this.reviewPdfTitle = title
      this.$refs.reviewPdf.show(path)
    },
    webOfficeEdit(fileUrl) {
      let fileUrlAuth = fileUrl.split('?')[1]
      fileUrl = fileUrl.split('?')[0]
      let token = this.$ls.get(ACCESS_TOKEN)
      WebCtrl.ShowEditPage(fileUrl, token, baseUrl, fileUrlAuth, 'env')
    },
    refresh(bool = false) {
      this.$refs.taskHistoryTable.refresh(bool)
    },
    refreshEquipTaskList(bool = true) {
      this.refresh(bool)
      this.selectedRowKeys = []
      this.selectedRows = []
    },
    handleShowDetail(record) {
      this.$refs.TaskDetailModal.show(record, '1', '10px')
    },
    async handleExportXls(name, model) {
      let data = {
        ...this.queryParams,
        ...model,
        ids: this.selectedRowKeys.join(','),
      }
      let url = this.url.export
      let params = data
      let fileName = name + '.xls'
      await downloadFile(url, fileName, params)
    },
    onSelect(selectedRowKeys, selectedRows){
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    }
  },
}
</script>

<style lang="less" scoped>
.task-history {
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
}
</style>