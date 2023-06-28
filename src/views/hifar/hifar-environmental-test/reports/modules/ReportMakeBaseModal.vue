<template>
  <div>
    <report-base-info-modal :reportId="reportId" :localLoading="localLoading" ref="reportBaseInfoModal"
                            :detailData="detailData"
                            @close="handleCancel">
      <a-space>
        <a-button
          title="详情"
          type="primary"
          @click="handleDetail(detailData)"
        >详情
        </a-button>
        <a-popconfirm v-if="detailData.status === 40" title="确定申请修改吗?" @confirm="() => handleAmend(detailData)">
          <a-button
            title="申请修改"
            type="primary"
          >申请修改
          </a-button>
        </a-popconfirm>
        <span v-if="detailData.status === 1">
          <a-space>
            <h-upload-file-b
              v-model="reportFileList"
              :customParams="{id:detailData.id}"
              accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              isPublic
              @beforeUpload="localLoading = true"
              @change="file => handleUploadCallback(file,detailData,true)"
            >
              <a-button v-has="'report:upload'" type="primary" icon="upload">上传</a-button>
            </h-upload-file-b>
          </a-space>
        </span>
        <template v-if="!isIntranet">
           <span v-if="[3,30,50,70,80].includes(detailData.status)">
             <a-space>
              <a-popconfirm title="确定提交吗?" @confirm="() => handleSubmit(detailData)">
                <a-button
                  v-has="'report:submit'"
                  title="提交"
                  type="primary">提交</a-button>
              </a-popconfirm>
               <template v-if="!([80].includes(detailData.status))">
                <!-- 修改审批被驳回后不能修改和替换-->
                 <a-button
                   v-if="detailData.filePath"
                   v-has="'report:edit'"
                   type="primary"
                   title="编辑"
                   @click="handleEdit(detailData)">编辑</a-button>
                 <h-upload-file-b
                   v-model="reportFileList"
                   action="/MinioLocalBusiness/authUpload"
                   v-has="'report:edit'"
                   :customParams="{id:detailData.id}"
                   accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                   isPublic
                   @beforeUpload="localLoading = true"
                   @change="file => handleUploadCallback(file,detailData)">
                   <a-button title='替换' type='primary'>替换</a-button>
                 </h-upload-file-b>
               </template>
             </a-space>
          </span>
          <template v-if="detailData.status >= 3">
            <span v-has="'report:download'">
              <a-space>
                <a-button
                  title="下载word"
                  type="primary"
                  @click="handleDownload(detailData, 'docx')"
                >下载word</a-button>
                <a-button
                  title="下载pdf"
                  type="primary"
                  @click="handleDownload(detailData, 'pdf')"
                >下载pdf</a-button>
              </a-space>
            </span>
          </template>
        </template>
      </a-space>
    </report-base-info-modal>
    <report-detail-modal ref="ReportDetailModal"/>
  </div>
</template>

<script>
import {downloadFile, getAction, officeOnlineEdit, postAction} from "@api/manage";
import ReportBaseInfoModal from "@views/hifar/hifar-environmental-test/reports/modules/ReportBaseInfoModal.vue";
import ReportDetailModal from '@/views/hifar/hifar-environmental-test/reports/modules/ReportDetailModal'

export default {
  name: "ReportMakeBaseModal",
  components: {ReportDetailModal, ReportBaseInfoModal},
  inject: {
    getContainer: {
      default: () => document.body
    }
  },
  data() {
    return {
      reportId: "",
      detailData: {},
      tableData: [],
      localLoading: false,
      refreshFlag: false,
      reportFileList: [],
      url: {
        submit: '/HfEnvReportBusiness/submitById',
        autoFileUrls: '/HfEnvReportBusiness/authUploads',
        download: '/HfEnvReportBusiness/download',
        amend: "/HfEnvReportAmendBusiness/amendReport",
        detail: "/HfEnvReportBusiness/listDetailByReportId"
      },
    }
  },
  props: {
    isIntranet: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    // 申请修改报告
    handleAmend(record) {
      postAction(this.url.amend, {id: record.id}).then(res => {
        if (res.code === 200) {
          this.$message.success('申请成功')
          this.refreshFlag = true
          this.loadData()
        }
      })
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
      if (!record.pdfPath && type === 'pdf') return this.$message.warning('pdf文件不存在')
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
      officeOnlineEdit(fileUrl, {IsSaveAsPDF: [40, 50, 80].includes(record.status)})
    },
    // 详情
    handleDetail(record) {
      let fileUrl = record.filePath.split('?')[0]
      officeOnlineEdit(fileUrl, {IsSaveEnabled: false})
      // this.$refs.ReportDetailModal.show(record.id, 'detail')
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
    loadData() {
      postAction(this.url.detail, {id: this.reportId,}).then((res) => {
        if (res.code === 200) {
          if (res.data.data && res.data.data.length) {
            this.detailData = res.data.data[0]
            this.localLoading = false
          } else {
            this.$message.warning('报告已被删除，请刷新列表重试')
          }
        }
      })
    },
    show(row, field = 'id') {
      this.localLoading = true
      this.refreshFlag = false
      this.reportId = row[field]
      this.loadData()
      this.$refs.reportBaseInfoModal.visible = true
    },
    handleCancel() {
      if (this.refreshFlag) {
        this.$emit('change')
      }
    },
  },
}
</script>

<style lang="less" scoped>

</style>