<template>
  <h-modal
    ref='reportDownloadHistoryModal'
    inner
    destroyOnClose
    :visible='visible'
    :title='title'
    :confirm-loading='confirmLoading'
    @cancel='handleCancel'
    @submit="handleCancel"
    width='70%'
  >
    <div class="report-download-history-list">
      <h-card fixed>
        <h-vex-table
          ref="reportDownloadHistoryListTable"
          slot="content"
          :columns="columns"
          :data="loadData"
          :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelect }"
        />
      </h-card>
    </div>
  </h-modal>
</template>

<script>
import { postAction } from '@/api/manage'

export default {
  inject: {
    getContainer: {
      default: () => {
        return () => document.body
      },
    },
  },
  data() {
    return {
      model: {},
      confirmLoading: false,
      visible: false,
      runNum: '',
      title: '下载记录',
      reportId: '',
      url: {
        reportDownloadHistoryList: '/HfEnvHistoryBusiness/reportDownloadHistoryList'
      },
      // 执行任务总览表格
      columns: [
        {
          title: '下载人',
          align: 'center',
          width: 250,
          dataIndex: 'downloadBy',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '下载人部门',
          align: 'center',
          width: 250,
          dataIndex: 'downloadDept',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '下载时间',
          align: 'center',
          width: 250,
          dataIndex: 'downloadTime',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '客户机IP',
          align: 'center',
          dataIndex: 'downloadSrc',
          minWidth: 250,
          customRender: (text, record) => {
            return text || '--'
          }
        }
      ],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
          'reportId': this.reportId
        }
        return postAction(this.url.reportDownloadHistoryList, data).then((res) => {
          if (res.code === 200) {
            return res.data
          }
        })
      },
      selectedRowKeys: [],
    }
  },
  methods: {
    // 取消
    handleCancel() {
      this.model = {}
      this.visible = false
    },
    show(id) {
      this.reportId = id
      this.visible = true
    },
    onSelect(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
  }
}
</script>

<style lang='less' scoped>
.report-download-history-list {
  width: 100%;
  height: 550px;
  position: relative;
}
</style>