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
        <a-button v-has="'report:delete'" icon="delete" size="small" type="danger" @click="batchDel()">
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
        :scroll="{ x: true }"
      >
        <span slot="status" slot-scope="text, record">
          <a-badge :color="record.status | reportStatusColorFilter" :text="record.status | reportStatusFilter"/>
        </span>
        <span slot="mesPushStatus" slot-scope="text, record">
          <a-badge :color="record.mesPushStatus | mesPushStatusColorFilter" :text="record.mesPushStatus | mesPushStatusFilter"/>
        </span>
        <template slot="downloadNum" slot-scope="text,record">
          <a @click="downloadRecord(record)">查看下载记录</a>
        </template>
        <div slot="action" slot-scope="text, record">
          <a-icon
            class="primary-text cursor-pointer"
            title="详情"
            type="eye"
            @click="() => handleDetail(record)"
          />
          <a-divider v-if="record.status != 2" style="color: #409eff" type="vertical"/>
          <span v-if="record.status == 1">
            <a-popconfirm
              v-if="record.isExternalManage == 0"
              title="确定生成报告吗?"
              @confirm="() => handleMakeReport(record)">
              <a-icon
                v-has="'report:make'"
                class="primary-text cursor-pointer"
                title="生成"
                type="check-square"/>
            </a-popconfirm>
            <h-upload-file-b
              v-model="reportFileList"
              :customParams="{id:record.id}"
              accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              isPublic
              @beforeUpload="$refs.reportMakeTable.localLoading = true"
              @change="file => handleUploadCallback(file,record,true)"
            >
              <a-icon v-has="'report:upload'" class="primary-text cursor-pointer" title="上传" type="upload"/>
            </h-upload-file-b>
            <a-divider style="color: #409eff" type="vertical"/>
          </span>
          <template v-if="!isIntranet">
             <span v-if="record.status == 3 || record.status == 30 || record.status == 50 ">
              <a-popconfirm title="确定提交吗?" @confirm="() => handleSubmit(record)">
                <h-icon
                  v-if="record.isExternalManage != 1"
                  v-has="'report:submit'"
                  title="提交"
                  class="primary-text cursor-pointer"
                  type="icon-tijiao"/>
              </a-popconfirm>
              <a-divider
                v-if="record.filePath && record.isExternalManage != 1"
                v-has="'report:submit'"
                style="color: #409eff"
                type="vertical"/>
              <a-icon
                v-if="record.filePath"
                v-has="'report:edit'"
                class="primary-text cursor-pointer"
                type="edit"
                @click="handleEdit(record)"/>
             <a-divider style="color: #409eff" type="vertical"/>
               <h-upload-file-b
                 v-model="reportFileList"
                 :customParams="{id:record.id}"
                 accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                 isPublic
                 @beforeUpload="$refs.reportMakeTable.localLoading = true"
                 @change="file => handleUploadCallback(file,record)">
                   <a-icon class="primary-text cursor-pointer" title='替换' type='swap'/>
               </h-upload-file-b>
            <a-divider
              v-if="record.isExternalManage != 1"
              v-has="'report:edit'"
              style="color: #409eff"
              type="vertical"/>
          </span>
            <template v-if="record.status >= 3">
              <span v-has="'report:download'">
                <a-icon
                  :type="record.docxLoading ? 'loading' : 'file-pdf'"
                  title="下载docx"
                  class="primary-text cursor-pointer"
                  @click="handleDownload(record, 'docx')"
                />
                <a-divider type="vertical"/>
                <a-icon
                  :type="record.pdfLoading ? 'loading' : 'file-pdf'"
                  title="下载pdf"
                  class="primary-text cursor-pointer"
                  @click="handleDownload(record, 'pdf')"
                />
              </span>
              <span>
              <a-divider type="vertical"/>
              <a-icon :type="record.intranetLoading ? 'loading' :'cloud-sync'"
                      class="primary-text cursor-pointer"
                      title="推送至内网"
                      @click="handlePush(record,'intranet')"/>
              <a-divider type="vertical"/>
              <a-icon :type="record.mesLoading ? 'loading' :'cloud-sync'" class="primary-text cursor-pointer"
                      title="推送至MES"
                      @click="handlePush(record,'mes')"/>
              </span>
            </template>
            <span v-if="record.status == 1 || record.status == 30 || record.status == 50 " v-has="'report:delete'">
              <a-divider v-if="record.status == 30 || record.status == 50" style="color: #409eff" type="vertical"/>
              <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id, record.status)">
                <a-icon class="danger-text cursor-pointer" title="删除" type="delete"/>
              </a-popconfirm>
            </span>
          </template>
        </div>
      </h-vex-table>
    </h-card>
    <ReportMakeListsModal ref="ReportMakeListsModal" @change="addReportchange"/>
    <report-detail-modal ref="ReportDetailModal"/>
    <report-download-record ref="reportDownloadRecord"/>
  </div>
</template>

<script>
import moment from 'moment'
import {downloadFile, postAction} from '@/api/manage'
import mixin from './mixin'
import * as WebCtrl from '@/plugins/webOffice'
import ReportMakeListsModal from './modules/ReportMakeListsModal.vue'
import ReportDetailModal from './modules/ReportDetailModal'
import {ACCESS_TOKEN, TENANT_ID} from '@/store/mutation-types'
import Vue from 'vue'
import {getAction} from '@api/manage';
import ReportDownloadRecord from './components/ReportDownloadRecord';

let baseUrl = process.env.VUE_APP_API_BASE_URL
export default {
  mixins: [mixin],
  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper
    }
  },
  components: {
    ReportMakeListsModal,
    ReportDetailModal,
    ReportDownloadRecord
  },
  data() {
    return {
      moment,
      queryParams: {},
      isIntranet: true,
      tableLoading: false,
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
      },
      reportNum: 0,
      selectedRowKeys: [],
      selectedRows: [],
      searchBar: [
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
          title: '状态',
          key: 'c_status_1',
          formType: 'select',
          options: [
            { title: '待生成', value: 1, key: 1 },
            { title: '生成中', value: 2, key: 2 },
            { title: '已生成', value: 3, key: 3 },
            { title: '已提交', value: 10, key: 10 },
            { title: '审核通过', value: 20, key: 20 },
            { title: '审核驳回', value: 30, key: 30 },
            { title: '批准通过', value: 40, key: 40 },
            { title: '批准驳回', value: 50, key: 50 }
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
          title: '状态',
          align: 'left',
          width: 80,
          dataIndex: 'status',
          scopedSlots: {customRender: 'status'}
        },
        {
          title: '试验编号',
          align: 'left',
          width: 120,
          dataIndex: 'testCode'
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
          width: 140,
          dataIndex: 'entrustCode',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '委托单号',
          align: 'left',
          width: 120,
          dataIndex: 'entrustNo',
          customRender: (text, record) => {
            return text || '--'
          }
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
          width: 300,
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
    tokenHeader() {
      let head = { 'token': Vue.ls.get(ACCESS_TOKEN) }
      let tenantid = Vue.ls.get(TENANT_ID)
      if (tenantid) {
        head['tenant_id'] = tenantid
      }
      return head
    },
    autoFileUrl() {
      return `${window._CONFIG['domianURL']}${this.url.autoFileUrl}`
    }
  },
  created() {
    this.loadReportNum()
  },
  methods: {
    handleUploadCallback(file, record, isUpload) {
      postAction(this.url.autoFileUrls, {id: record.id, fileId: file[0].fileId, isUpload}).then(res => {
        if (res.code === 200) {
          this.refresh()
          this.$message.success(isUpload ? '上传成功' : '替换成功')
        } else {
          this.$message.error(isUpload ? '上传失败' : '替换失败')
        }
      }).finally(() => {
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
    fileChange({ file }) {
      this.$refs.reportMakeTable.localLoading = true
      if ((file.response && file.response.code === 200) || file.status === 'done') {
        this.refresh()
      }
    },
    refresh(bool = true) {
      this.$refs.reportMakeTable.refresh(bool)
      this.loadReportNum()
      this.selectedRowKeys = []
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      selectedRows.map((item) => {
        this.selectedRows = item
      })
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
      let delInfo = [{ id: id, status: status }]
      postAction(this.url.delete, { delInfo: delInfo }).then((res) => {
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.refresh(true)
        } else {
          this.$message.warning(res.msg)
        }
      })
    },

    // 批量删除
    batchDel() {
      let _this = this
      if (_this.selectedRowKeys.length) {
        this.$confirm({
          title: '确认删除',
          content: '删除后不可恢复，确认删除？',
          onOk: function () {
            let delInfo = [{ id: _this.selectedRowKeys.join(), status: _this.selectedRows.status }]
            postAction(_this.url.delete, { delInfo: delInfo }).then((res) => {
              if (res.code === 200) {
                _this.$message.success('删除成功')
                _this.refresh()
                _this.selectedRowKeys = []
                _this.selectedRows = []
              } else {
                _this.$message.warning(res.msg)
              }
            })
          }
        })
      } else {
        this.openNotificationWithIcon('error', '删除提示', '请至少选择一项')
      }
    },
    // 添加
    handleAdd() {
      this.$refs.ReportMakeListsModal.show()
      this.loadReportNum()
    },
    // 编辑
    handleEdit(record) {
      let fileUrl = record.filePath
      let fileUrlAuth = fileUrl.split('?')[1]
      fileUrl = fileUrl.split('?')[0]
      let token = this.$ls.get(ACCESS_TOKEN)
      WebCtrl.ShowEditPage(fileUrl, token, baseUrl, fileUrlAuth, 'env')
    },
    // 详情
    handleDetail(record) {
      let type = 'detail'
      let activeKey = '1'
      this.$refs.ReportDetailModal.show(record.id, type, activeKey)
    },
    // 提交
    handleSubmit(record) {
      postAction(this.url.submit, {
        id: record.id,
        coverTemplateId: record.coverTemplateId,
        reportCode: record.reportCode
      }).then((res) => {
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
