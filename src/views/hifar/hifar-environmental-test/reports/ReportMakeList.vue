<!--
 * @Author: 雷宇航
 * @Date: 2022-10-08 15:50:24
 * @fileName: ReportMakeList.vue
 * @FilePath: tdm724-client\src\views\hifar\hifar-environmental-test\reports\ReportMakeList.vue
 * @Description: 报告生成页面
-->
<template>
  <div ref="pageWrapper" class="h-custom-layout" style="height: 100%; position: relative">
    <h-card :bordered="true" fixed>
      <template slot="title"> 报告生成</template>
      <h-search
        slot="search-form"
        v-model="queryParams"
        :data="searchBar"
        :showToggleButton="true"
        size="small"
        @change="refresh(true)"
      />
      <div slot="table-operator" style="border-top: 5px">
        <a-button icon="eye" size="small" type="primary" @click="handleIdea">
          意见汇总
        </a-button>
        <a-button icon="export" size="small" type="primary" @click="handleTurnover">
          移交
        </a-button>
        <a-badge :count="reportNum">
          <a-button
            v-has="'report:add'"
            icon="plus"
            size="small"
            type="ghost-primary"
            @click="handleAdd"
          >添加
          </a-button>
        </a-badge>
        <a-button :loading="loading" v-has="'report:download'" icon="download" size="small" type="primary"
                  @click="batchDownload">
          批量下载
        </a-button>
        <a-button v-has="'report:delete'" icon="delete" size="small" type="danger" @click="batchDel">
          批量删除
        </a-button>
      </div>

      <h-vex-table
        ref="reportMakeTable"
        slot="content"
        :columns="columns"
        :data="loadData"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        :rowKey="(record) => record.id"
      >
        <span slot="reportCode" slot-scope="text, record">
            <a @click="$refs.ReportMakeBaseModal.show(record)">{{ text }}</a>
        </span>
        <span slot="entrustCode" slot-scope="text, record">
            <a @click="$refs.testTaskBaseInfoModal.show(record,'2','20px','testId')">{{ text }}</a>
        </span>
        <span slot="status" slot-scope="text, record">
          <a-badge :color="record.status | reportStatusColorFilter" :text="record.status | reportStatusFilter"/>
        </span>
        <span slot="mesPushStatus" slot-scope="text, record">
          <a-badge :color="record.mesPushStatus | mesPushStatusColorFilter"
                   :text="record.mesPushStatus | mesPushStatusFilter"/>
        </span>
        <template slot="downloadNum" slot-scope="text,record">
          <a @click="downloadRecord(record)">查看下载记录</a>
        </template>
        <template slot="transferStatus" slot-scope="text,record">
          <a-tag v-if="text === 0" color="#f50">待移交</a-tag>
          <a-tag v-if="text === 1" color="#87d068">已移交</a-tag>
        </template>
        <div slot="action" slot-scope="text, record">
          <a-space>
            <a-icon :type="record.intranetLoading ? 'loading' :'cloud-sync'"
                    class="primary-text cursor-pointer"
                    title="推送至内网"
                    v-has="'report:pushinner'"
                    @click="handlePush(record,'intranet')"/>
            <a-icon :type="record.mesLoading ? 'loading' :'cloud-sync'" class="primary-text cursor-pointer"
                    title="推送至MES"
                    v-has="'report:pushmes'"
                    @click="handlePush(record,'mes')"/>
            <span v-if="[3].includes(record.status)" v-has="'report:delete'">
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id, record.status)">
                  <a-icon class="danger-text cursor-pointer" title="删除" type="delete"/>
                </a-popconfirm>
              </span>
          </a-space>
        </div>
      </h-vex-table>
    </h-card>
    <ReportMakeListsModal ref="ReportMakeListsModal" @change="addReportchange"/>
    <report-detail-modal ref="ReportDetailModal"/>
    <report-make-base-modal ref="ReportMakeBaseModal" @change="refresh(false)"></report-make-base-modal>
    <report-download-record ref="reportDownloadRecord"/>
    <report-reject-all-info ref="reportRejectAllInfo"/>
    <test-task-base-info-modal ref="testTaskBaseInfoModal"/>
  </div>
</template>

<script>
import moment from 'moment'
import {createLink, downloadFile, officeOnlineEdit, postAction} from '@/api/manage'
import mixin from './mixin'
import * as WebCtrl from '@/plugins/webOffice'
import ReportMakeListsModal from './modules/ReportMakeListsModal.vue'
import ReportDetailModal from './modules/ReportDetailModal'
import {ACCESS_TOKEN} from '@/store/mutation-types'
import {getAction} from '@api/manage';
import ReportDownloadRecord from './components/ReportDownloadRecord';
import ReportRejectAllInfo from "@views/hifar/hifar-environmental-test/reports/modules/ReportRejectAllInfo";
import TestTaskBaseInfoModal from "@views/hifar/hifar-environmental-test/task/TestTaskBaseInfoModal.vue";
import ReportMakeBaseModal from "@views/hifar/hifar-environmental-test/reports/modules/ReportMakeBaseModal.vue";

let baseUrl = process.env.VUE_APP_API_BASE_URL
export default {
  mixins: [mixin],
  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper
    }
  },
  components: {
    ReportMakeBaseModal,
    TestTaskBaseInfoModal,
    ReportRejectAllInfo,
    ReportMakeListsModal,
    ReportDetailModal,
    ReportDownloadRecord
  },
  data() {
    return {
      moment,
      queryParams: {},
      loading: false,
      isIntranet: true,
      url: {
        list: '/HfEnvReportBusiness/listPage',
        delete: '/HfEnvReportBusiness/logicRemoveById',
        submit: '/HfEnvReportBusiness/submitById',
        submitFlow: '/HfEnvReportBusiness/submitFlow',
        makeReport: '/HfEnvReportBusiness/generateReport',
        static: '/HfEnvReportBusiness/countNotGenerated',
        autoFileUrl: '/HfEnvReportBusiness/authUpload',
        autoFileUrls: '/HfEnvReportBusiness/authUploads',
        download: '/HfEnvReportBusiness/download',
        pushIntranet: '/ReportPushApiBusiness/pushIntranet',
        pushMes: '/ReportPushApiBusiness/pushReportToMes',
        amend: "/HfEnvReportAmendBusiness/amendReport",
        turnover: "/HfEnvReportBusiness/modifyReportStatus",
        downLoadBatchById: "/HfEnvReportReceiveBusiness/downLoadBatchById",
      },
      reportNum: 0,
      selectedRowKeys: [],
      selectedRows: [],
      searchBar: [
        {
          title: '试件代号',
          formType: 'input',
          key: 'c_productAlias_7',
        },
        {
          title: '产品名称',
          formType: 'input',
          key: 'c_productName_7',
        },
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
          scopedSlots: {customRender: 'reportCode'}
        },
        {
          title: '状态',
          align: 'left',
          width: 120,
          dataIndex: 'status',
          scopedSlots: {customRender: 'status'}
        },
        {
          title: '试验编号',
          align: 'left',
          width: 130,
          dataIndex: 'testCode'
        },
        {
          title: '试件代号',
          align: 'left',
          width: 130,
          dataIndex: 'productAlias'
        },
        {
          title: '产品名称',
          align: 'left',
          width: 130,
          dataIndex: 'productName'
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
          title: '运行单号',
          align: 'left',
          width: 165,
          dataIndex: 'entrustCode',
          scopedSlots: {customRender: 'entrustCode'},
        },
        {
          title: '委托单号',
          align: 'left',
          width: 130,
          dataIndex: 'entrustNo',
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
          width: 120,
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
          width: 100,
          align: 'center',
          scopedSlots: {customRender: 'action'}
        }
      ],
      loadData: (params) => {
        let data = {
          ...this.queryParams,
          ...params
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code === 200) {
            this.isIntranet = res.ext.isIntranet
            return Object.assign({}, res.data, {
              data: res.data.data.map(item => {
                return {
                  ...item,
                  docxLoading: false,
                  pdfLoading: false,
                  intranetLoading: false,
                  mesLoading: false,
                }
              })
            })
          }
        })
      },
      reportFileList: [],
    }
  },

  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    },
  },
  created() {
    this.loadReportNum()
  },
  methods: {
    batchDownload() {
      this.$refs.reportMakeTable.localLoading = true
      this.loading = true
      if (!this.selectedRowKeys.length) return this.$message.warning('请至少选择一条报告')
      getAction(this.url.downLoadBatchById, {ids: this.selectedRowKeys.toString()}).then(res => {
        if (res.code === 200) {
          createLink(res.data, '试验报告')
        } else {
          this.$message.error('下载失败!')
        }
      }).finally(() => {
        this.$refs.reportMakeTable.localLoading = false
        this.loading = false
      })
    },
    handleTurnover() {
      if (!this.selectedRowKeys.length) return this.$message.warning('请选择需要移交的报告')
      if (Array.from(new Set(this.selectedRows.map(item => item.status))).toString() !== '40') return this.$message.warning('请选择批准通过的报告进行移交')
      postAction(this.url.turnover, {id: this.selectedRowKeys.toString(), transferStatus: "1"}).then(res => {
        if (res.code === 200) {
          this.$message.success('移交成功')
          this.refresh()
        } else {
          this.$message.warning('移交失败')
        }
      })
    },
    handleIdea() {
      if (this.selectedRowKeys.length > 1) {
        return this.$message.warning('只能选择一条报告')
      }
      this.$refs.reportRejectAllInfo.show(this.selectedRowKeys)
    },
    handleUploadCallback(file, record, isUpload) {
      postAction(this.url.autoFileUrls, {id: record.id, fileId: file[0].fileId, status: 3, isUpload}).then(res => {
        if (res.code === 200) {
          this.$message.success(isUpload ? '上传成功' : '替换成功')
        } else {
          this.$message.error(isUpload ? '上传失败' : '替换失败')
        }
      }).finally(() => {
        this.refresh()
        this.reportFileList = []
      })
    },

    // 推送内网/Mes
    handlePush(record, type) {
      let obj = {
        intranet: {
          loading: 'intranetLoading',
          url: this.url.pushIntranet
        },
        mes: {
          loading: 'mesLoading',
          url: this.url.pushMes
        },
      }
      this.$set(record, obj[type].loading, true)
      postAction(obj[type].url, {id: record.id}).then(res => {
        if (res.code === 200) {
          this.$message.success('推送成功!')
        } else {
          this.$message.error(res.msg);
        }
      }).finally(() => {
        this.$set(record, obj[type].loading, false)
      })
    },
    downloadRecord(record) {
      this.$refs.reportDownloadRecord.show(record.id)
    },
    addReportchange() {
      this.refresh(true)
    },
    fileChange({file}) {
      this.$refs.reportMakeTable.localLoading = true
      if ((file.response && file.response.code === 200) || file.status === 'done') {
        this.refresh()
      }
    },
    refresh(bool = true) {
      this.$refs.reportMakeTable.refresh(bool)
      this.loadReportNum()
      this.selectedRowKeys = []
      this.selectedRows = []
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    handleDownload(record, type) {
      let obj = {
        docx: {
          loading: 'docxLoading',
        },
        pdf: {
          loading: 'pdfLoading',
        },
      }
      this.$set(record, obj[type].loading, true)
      getAction(this.url.download, {id: record.id, type}).then(res => {
        if (res.code === 200) {
          let filePath = res.data.url;
          let fileName = res.data.fileName;
          downloadFile(filePath, fileName)
        } else {
          this.$message.error('下载失败!')
        }
      }).finally(() => {
        this.$set(record, obj[type].loading, false)
      })
    },
    loadReportNum() {
      postAction(this.url.static, {}).then((res) => {
        this.reportNum = res.data.num
      })
    },
    getCheckboxProps(record) {
      return record.status == 1 || record.status == 30 || record.status == 50
    },
    // 单个删除
    handleDelete(id, status) {
      this.$refs.reportMakeTable.localLoading = true
      let delInfo = [{id, status}]
      postAction(this.url.delete, {delInfo: delInfo}).then((res) => {
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.refresh(true)
        } else {
          this.$message.warning(res.msg)
        }
      }).finally(() => {
        this.$refs.reportMakeTable.localLoading = false
      })
    },

    // 批量删除
    batchDel() {
      if (!this.selectedRowKeys.length) return this.$message.warning('请至少选择一条报告')
      for (let i = 0; i < this.selectedRows.length; i++) {
        let iten = this.selectedRows[i]
        if (iten.status !== 3) {
          return this.$message.warning('只能删除草稿状态的报告！')
        }
      }
      this.$confirm({
        title: '确认删除',
        content: '删除后不可恢复，确认删除？',
        onOk: () => {
          this.$refs.reportMakeTable.localLoading = true
          let delInfo = this.selectedRows.map(item => {
            return {
              id: item.id,
              status: item.status,
            }
          })
          postAction(this.url.delete, {delInfo: delInfo}).then((res) => {
            if (res.code === 200) {
              this.$message.success('删除成功')
              this.refresh()
              this.selectedRowKeys = []
              this.selectedRows = []
            } else {
              this.$message.warning(res.msg)
            }
          }).finally(() => {
            this.$refs.reportMakeTable.localLoading = false
          })
        },
      })

    },
    // 申请修改报告
    handleAmend(record) {
      postAction(this.url.amend, {id: record.id}).then(res => {
        if (res.code === 200) {
          this.$message.success('申请成功')
          this.refresh()
        }
      })
    },
    // 添加
    handleAdd() {
      this.$refs.ReportMakeListsModal.show()
      this.loadReportNum()
    },
    // 编辑
    handleEdit(record) {
      let fileUrl = record.filePath.split('?')[0]
      officeOnlineEdit(fileUrl)
    },
    // 详情
    handleDetail(record) {
      let type = 'detail'
      this.$refs.ReportDetailModal.show(record.id, type)
    },
    // 提交
    handleSubmit(record) {
      let data = {
        id: record.id,
        coverTemplateId: record.coverTemplateId,
        reportCode: record.reportCode,
      }
      postAction(this.url.submit, data).then((res) => {
        if (res.code === 200) {
          this.$message.success('操作成功!')
          this.refresh(true)
        }
      })
    },
    // 生成报告
    handleMakeReport(record) {
      postAction(this.url.makeReport, {
        id: record.id,
        coverTemplateId: record.coverTemplateId,
        reportCode: record.reportCode,
        entrustId: record.entrustId,
        unitId: record.unitId,
        projectId: record.projectId
      }).then((res) => {
        if (res.code === 200) {
          this.$message.success('操作成功!')
          this.refresh(true)
          this.loadReportNum()
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
.cursor-pointer {
  cursor: pointer
}
</style>
