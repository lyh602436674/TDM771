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
                <a-icon
                  class="primary-text cursor-pointer"
                  title="详情"
                  type="eye"
                  @click="() => handleDetail(row)"
                />
                <a-popconfirm v-if="row.status === 40" title="确定申请修改吗?" @confirm="() => handleAmend(row)">
                  <a-icon
                    class="primary-text cursor-pointer"
                    title="申请修改"
                    type="tool"
                  />
                </a-popconfirm>
                <span v-if="row.status === 1">
              <a-space>
                <!--                  <a-popconfirm-->
                <!--                  title="确定生成报告吗?"-->
                <!--                  @confirm="() => handleMakeReport(row)">-->
                <!--                  <a-icon-->
                <!--                    v-has="'report:make'"-->
                <!--                    class="primary-text cursor-pointer"-->
                <!--                    title="生成"-->
                <!--                    type="check-square"/>-->
                <!--                </a-popconfirm>-->
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
                    <h-icon
                      v-has="'report:submit'"
                      class="primary-text cursor-pointer"
                      title="提交"
                      type="icon-tijiao"/>
                  </a-popconfirm>
                   <template v-if="!([80].includes(row.status))">
                    <!-- 修改审批被驳回后不能修改和替换-->
                     <a-icon
                       v-if="row.filePath"
                       v-has="'report:edit'"
                       class="primary-text cursor-pointer"
                       type="edit"
                       title="编辑"
                       @click="handleEdit(row)"/>
                     <h-upload-file-b
                       v-model="reportFileList"
                       action="/MinioLocalBusiness/authUpload"
                       v-has="'report:edit'"
                       :customParams="{id:row.id}"
                       accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                       isPublic
                       @beforeUpload="$refs.reportMakeTable.localLoading = true"
                       @change="file => handleUploadCallback(file,row)">
                         <a-icon class="primary-text cursor-pointer" title='替换' type='swap'/>
                     </h-upload-file-b>
                   </template>
                 </a-space>
              </span>
                  <template v-if="row.status >= 3">
                  <span v-has="'report:download'">
                    <a-space>
                      <a-icon
                        :type="row.docxLoading ? 'loading' : 'file-word'"
                        class="primary-text cursor-pointer"
                        title="下载word"
                        @click="handleDownload(row, 'docx')"
                      />
                      <a-icon
                        :type="row.pdfLoading ? 'loading' : 'file-pdf'"
                        class="primary-text cursor-pointer"
                        title="下载pdf"
                        @click="handleDownload(row, 'pdf')"
                      />
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
          }
        }
      })
    },
    show(row) {
      this.reportCode = row.reportCode
      this.loadData()
      this.visible = true
    },
    initData(data) {
      this.detailData = Object.assign({}, data)
      this.tableData = [this.detailData]
    },
    handleCancel() {
      this.visible = false
      if (this.refreshFlag) {
        this.$emit('change')
      }
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