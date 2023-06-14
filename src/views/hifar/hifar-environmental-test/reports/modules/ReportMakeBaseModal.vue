<template>
  <h-modal
    title="报告信息"
    inner
    fullScreen
    destroyOnClose
    :visible="visible"
    :getContainer="getContainer"
    @cancel="handleCancel">
    <template slot="footer">
      <a-button type="ghost-danger" @click="handleCancel"> 关闭</a-button>
    </template>
    <div class="reportMakeBase">
      <h-card title="基本信息">
        <h-desc :data="detailData" size="small" :column="3">
          <h-desc-item label="报告编号">
            {{ detailData.reportCode || '--' }}
          </h-desc-item>
          <h-desc-item label="产品编号">
            {{ detailData.pieceNo || '--' }}
          </h-desc-item>
          <h-desc-item label="试验编号">
            {{ detailData.testCode || '--' }}
          </h-desc-item>
          <h-desc-item label="送试单位">
            {{ detailData.custName || '--' }}
          </h-desc-item>
          <h-desc-item label="联系人">
            {{ detailData.custLinkName || '--' }}
          </h-desc-item>
          <h-desc-item label="联系方式">
            {{ detailData.custLinkMobile || '--' }}
          </h-desc-item>
          <h-desc-item label="产品代号">
            {{ detailData.productAlias || '--' }}
          </h-desc-item>
          <h-desc-item label="产品名称">
            {{ detailData.productName || '--' }}
          </h-desc-item>
          <h-desc-item label="委托单号">
            {{ detailData.entrustNo || '--' }}
          </h-desc-item>
          <h-desc-item label="运行单号">
            {{ detailData.entrustCode || '--' }}
          </h-desc-item>
          <h-desc-item label="试验名称">
            {{ detailData.testName || '--' }}
          </h-desc-item>
          <h-desc-item label="试验性质">
            {{ detailData.testPropertyCode_dictText || '--' }}
          </h-desc-item>
          <h-desc-item label="是否显示最终用户">
            {{ detailData.isShowUserInReport === '1' ? '是' : "否" }}
          </h-desc-item>
          <h-desc-item label="最终用户">
            {{ detailData.lastUser_dictText || '--' }}
          </h-desc-item>
        </h-desc>
      </h-card>
      <h-card title="报告信息">
        <vxe-table
          border
          resizable
          round
          show-all-overflow
          :data="tableData"
        >
          <vxe-table-column type="seq" width="60" align="center"></vxe-table-column>
          <vxe-table-column title="报告名称" field="fileName"></vxe-table-column>
          <vxe-table-column title="操作" field="action">
            <template v-slot="{row}">
              <a-space>
                <a-button
                  title="详情"
                  type="primary"
                  @click="handleDetail(row)"
                >详情
                </a-button>
                <a-popconfirm v-if="row.status === 40" title="确定申请修改吗?" @confirm="() => handleAmend(row)">
                  <a-button
                    title="申请修改"
                    type="primary"
                  >申请修改
                  </a-button>
                </a-popconfirm>
                <span v-if="row.status === 1">
                  <a-space>
                    <h-upload-file-b
                      v-model="reportFileList"
                      :customParams="{id:row.id}"
                      accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      isPublic
                      @beforeUpload="$refs.reportMakeTable.localLoading = true"
                      @change="file => handleUploadCallback(file,row,true)"
                    >
                      <a-icon v-has="'report:upload'" class="primary-text cursor-pointer" title="上传" type="upload"/>
                    </h-upload-file-b>
                  </a-space>
                </span>
                <template v-if="!isIntranet">
                   <span v-if="[3,30,50,70,80].includes(row.status)">
                     <a-space>
                      <a-popconfirm title="确定提交吗?" @confirm="() => handleSubmit(row)">
                        <a-button
                          v-has="'report:submit'"
                          title="提交"
                          type="primary">提交</a-button>
                      </a-popconfirm>
                       <template v-if="!([80].includes(row.status))">
                        <!-- 修改审批被驳回后不能修改和替换-->
                         <a-button
                           v-if="row.filePath"
                           v-has="'report:edit'"
                           type="primary"
                           title="编辑"
                           @click="handleEdit(row)">编辑</a-button>
                         <h-upload-file-b
                           v-model="reportFileList"
                           action="/MinioLocalBusiness/authUpload"
                           v-has="'report:edit'"
                           :customParams="{id:row.id}"
                           accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                           isPublic
                           @beforeUpload="$refs.reportMakeTable.localLoading = true"
                           @change="file => handleUploadCallback(file,row)">
                           <a-button title='替换' type='primary'>替换</a-button>
                         </h-upload-file-b>
                       </template>
                     </a-space>
                  </span>
                  <template v-if="row.status >= 3">
                    <span v-has="'report:download'">
                      <a-space>
                        <a-button
                          :loading="row.docxLoading"
                          title="下载word"
                          type="primary"
                          @click="handleDownload(row, 'docx')"
                        >下载word</a-button>
                        <a-button
                          :loading="row.pdfLoading"
                          title="下载pdf"
                          type="primary"
                          @click="handleDownload(row, 'pdf')"
                        >下载pdf</a-button>
                      </a-space>
                    </span>
                  </template>
                </template>
              </a-space>
            </template>
          </vxe-table-column>
        </vxe-table>
      </h-card>
    </div>
    <report-detail-modal ref="ReportDetailModal"/>
  </h-modal>
</template>

<script>
import {downloadFile, getAction, officeOnlineEdit, postAction} from "@api/manage";
import ReportDetailModal from "@views/hifar/hifar-environmental-test/reports/modules/ReportDetailModal.vue";

export default {
  name: "ReportMakeBaseModal",
  components: {ReportDetailModal},
  inject: {
    getContainer: {
      default: () => document.body
    }
  },
  data() {
    return {
      visible: false,
      reportCode: "",
      isIntranet: true,
      detailData: {},
      tableData: [],
      reportFileList: [],
      refreshFlag: false,
      url: {
        list: '/HfEnvReportBusiness/listPage',
        submit: '/HfEnvReportBusiness/submitById',
        autoFileUrls: '/HfEnvReportBusiness/authUploads',
        download: '/HfEnvReportBusiness/download',
      },
    }
  },
  methods: {
    loadData() {
      postAction(this.url.list, {
        c_reportCode_7: this.reportCode,
        pageNo: 1, pageSize: 10
      }).then((res) => {
        if (res.code === 200) {
          this.isIntranet = res.ext.isIntranet
          if (res.data.data && res.data.data.length) {
            this.initData(res.data.data[0])
          } else {
            this.$message.warning('报告已被删除，请刷新列表重试')
          }
        }
      })
    },
    show(row) {
      this.reportCode = row.reportCode
      this.loadData()
    },
    initData(data) {
      this.detailData = Object.assign({}, data)
      this.tableData = [this.detailData]
      this.visible = true
    },
    handleCancel() {
      this.visible = false
      if (this.refreshFlag) {
        this.$emit('change')
      }
      this.refreshFlag = false
    },
    handleUploadCallback(file, record, isUpload) {
      postAction(this.url.autoFileUrls, {id: record.id, fileId: file[0].fileId, status: 3, isUpload}).then(res => {
        if (res.code === 200) {
          this.$message.success(isUpload ? '上传成功' : '替换成功')
        } else {
          this.$message.error(isUpload ? '上传失败' : '替换失败')
        }
      }).finally(() => {
        this.loadData()
        this.reportFileList = []
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
          this.refreshFlag = true
          this.loadData()
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>
.reportMakeBase {
  /deep/ .h-card-wrapper {
    height: auto;
  }
}

</style>