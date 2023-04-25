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
        <template #entrustNos="text, record">
          <a @click="$refs.TaskDetailModal.show(record,'1','20px')">{{ text }}</a>
        </template>
        <template #entrustCodes="text, record">
          <a @click="$refs.TaskDetailModal.show(record,'2','20px')">{{ text }}</a>
        </template>
        <template #testCode="text, record">
          <a @click="$refs.TaskDetailModal.show(record,'3','20px')">{{ text }}</a>
        </template>
        <template slot="status" slot-scope="text">
          <a-badge :color="testStatusMap[text] ? testStatusMap[text].color : ''"
                   :text="testStatusMap[text] ? testStatusMap[text].text : ''"/>
        </template>
        <template #exceptionNum="text, record">
          <a @click="$refs.abnormalDetailModal.show(record)">{{ text }}</a>
        </template>
        <template #archiveRecord="text,record">
          <a-space style="cursor: pointer">
            <a-icon class="primary-text" title="查看" type="eye"
                    @click="handleReviewPdf('巡检记录',record.pdfPathXh)"/>
            <a-icon class="primary-text" title="在线编辑" type="edit"
                    @click="webOfficeEdit(record.docxPathXh)"/>
            <a title="下载word" @click="handleDownloadDocx(record.docxPathXh)">
              <a-icon class="primary-text" type="download"></a-icon>
            </a>
            <h-upload-file-b
              v-model="swapFileList"
              :customParams="{id:record.id}"
              accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
            <a title="下载word" @click="handleDownloadDocx(record.docxPathSs)">
              <a-icon class="primary-text" type="download"></a-icon>
            </a>
            <h-upload-file-b
              v-model="swapFileList"
              :customParams="{id:record.id}"
              accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              isPublic
              @beforeUpload="$refs.taskHistoryTable.localLoading = true"
              @change="file => handleUploadCallback(file, record,'2')">
              <a-icon class="primary-text cursor-pointer" title='替换' type='swap'/>
            </h-upload-file-b>
          </a-space>
        </template>
      </h-vex-table>
    </h-card>
    <test-task-base-info-modal ref="TaskDetailModal" showExceptionAndEnd/>
    <task-abnormal-modal ref="taskAbnormalModal" @change="refreshEquipTaskList"></task-abnormal-modal>
    <test-data-add-modal ref="testDataAddModal" @change="refreshEquipTaskList"></test-data-add-modal>
    <test-check-modal ref="testCheckModal" buildWord/>
    <test-base-edit ref="TestBaseEdit" :records="records" :selectedTreeRows="selectedRows"
                    @change="refreshEquipTaskList"/>
    <test-entrust-review-pdf ref="reviewPdf" :title="reviewPdfTitle"/>
    <abnormal-detail-modal ref="abnormalDetailModal"/>
  </div>
</template>

<script>
import {createLink, downloadFile, postAction} from '@/api/manage'
import moment from 'moment'
import TestTaskBaseInfoModal from '@/views/hifar/hifar-environmental-test/task/TestTaskBaseInfoModal'
import TestCheckModal from "@views/hifar/hifar-environmental-test/task/checkModal/TestCheckModal";
import TestBaseEdit from "@views/hifar/hifar-environmental-test/task/checkModal/TestBaseEdit";
import testDataAddModal from "@views/hifar/hifar-environmental-test/task/modules/TestDataAddModal";
import TaskAbnormalModal from "@views/hifar/hifar-environmental-test/task/checkModal/TaskAbnormalModal";
import {ACCESS_TOKEN} from "@/store/mutation-types";
import * as WebCtrl from "@/plugins/webOffice";
import TestEntrustReviewPdf from "@views/hifar/hifar-environmental-test/task/modules/TestEntrustReviewPdf";
import AbnormalDetailModal from "@views/hifar/hifar-environmental-test/task/modules/AbnormalDetailModal";

let baseUrl = process.env.VUE_APP_API_BASE_URL
export default {
  provide() {
    return {
      getContainer: () => this.$refs.taskHistory,
    }
  },
  components: {
    TestTaskBaseInfoModal, TestCheckModal, TestBaseEdit, testDataAddModal, TaskAbnormalModal, TestEntrustReviewPdf,
    AbnormalDetailModal
  },
  data() {
    return {
      reviewPdfTitle: '',
      testStatusMap: {
        0: {color: "grey", text: "未发布"},
        1: {color: "geekblue", text: "未开始"},
        10: {color: "red", text: "已撤销"},
        20: {color: "green", text: "进行中"},
        30: {color: "volcano", text: "暂停"},
        40: {color: "red", text: "终止"},
        45: {color: "yellow", text: "异常"},
        50: {color: "grey", text: "已完成"},
        60: {color: "grey", text: "已出报告"},
      },
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
              title: '异常',
              key: 45,
              value: 45,
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
          key: 'pieceNo',
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
          scopedSlots: {customRender: 'entrustCodes'},
          minWidth: 160,
        },
        {
          title: '委托单号',
          dataIndex: 'entrustNos',
          scopedSlots: {customRender: 'entrustNos'},
          minWidth: 140,
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
          title: '异常数量',
          dataIndex: 'exceptionNum',
          width: 80,
          align: 'center',
          scopedSlots: {customRender: 'exceptionNum'},
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
    handleDownloadDocx(filePath) {
      if (!filePath) return this.$message.warning('暂无数据')
      createLink(filePath)
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
    onSelect(selectedRowKeys, selectedRows) {
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