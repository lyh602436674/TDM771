<template>
  <div ref="reportHistoryList" class="report-history-list">
    <h-card fixed>
      <template slot="title"> 历史报告</template>
      <h-search slot="search-form" v-model="queryParams" :data="searchForm" size="default" @change="refresh(true)"/>
      <template slot="table-operator">
        <a-button
          icon="qrcode"
          size="small"
          type="ghost-primary"
          @click="downloadWordReport">word下载
        </a-button>
        <a-button
          icon="qrcode"
          size="small"
          type="ghost-primary"
          @click="downloadPDFReport">PDF下载
        </a-button>
      </template>
      <h-vex-table
        ref="reportHistoryListTable"
        slot="content"
        :columns="columns"
        :data="loadData"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onSelect: onSelect }"
      >
        <template v-slot:status="text, record">
          <a-tag :color="statusTag[record.status]">{{ record.statustext }}</a-tag>
        </template>
        <template v-slot:downloadRecord="text, record">
          <a @click="downloadHistoryRecord(record)">查看下载记录</a>
        </template>
        <template v-slot:pushmesstate="text, record">
          <a-tag :color="pushmesstatusTag[record.pushmesstate]">{{ record.pushmesstate === '1' ? '成功' : '未知' }}</a-tag>
        </template>
      </h-vex-table>
    </h-card>
    <report-download-history-modal ref='reportDownloadHistoryModal'/>
  </div>
</template>

<script>
import moment from 'moment'
import {downloadFile, postAction} from '@api/manage'
import mixin from '@views/hifar/hifar-environmental-test/mixin.js'
import ReportDownloadHistoryModal
  from '@views/hifar/hifar-environmental-test/history/modules/ReportDownloadHistoryModal'

export default {
  provide() {
    return {
      getContainer: () => this.$refs.reportHistoryList
    }
  },
  components: {
    ReportDownloadHistoryModal
  },
  mixins: [mixin],
  data() {
    return {
      moment,
      url: {
        list: '/HfEnvHistoryBusiness/listPage',
        download: '/HfEnvHistoryBusiness/download'
      },
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
          key: 'c_taskNos_7',
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
              title: '环境',
              key: 3,
              value: 3
            }
          ]
        },
        {
          title: '移交状态',
          key: 'c_sendstatus_1',
          formType: 'select',
          options: [
            {
              title: '已移交',
              key: 0,
              value: 0
            },
            {
              title: '待移交',
              key: 1,
              value: 1
            },
            {
              title: '已作废',
              key: 2,
              value: 2
            }
          ]
        },
        {
          title: '领用人',
          key: 'c_receiveCode_7',
          formType: 'input'
        },
        {
          title: '委托编号',
          key: 'c_applynos_7',
          formType: 'input'
        }
      ],
      columns: [
        {
          title: '报告编号',
          align: 'left',
          width: 140,
          dataIndex: 'reportno',
          fixed: 'left'
        },
        {
          title: '状态',
          align: 'center',
          dataIndex: 'status',
          minWidth: 100,
          scopedSlots: { customRender: 'status' }
        },
        {
          title: '移交状态',
          align: 'center',
          minWidth: 120,
          dataIndex: 'sendstatus',
          customRender: (text) => {
            return text === '0' ? '已移交' : text === '1' ? '待移交' : text === '2' ? '已作废' : '未知'
          }
        },
        {
          title: '产品编号',
          align: 'center',
          minWidth: 200,
          dataIndex: 'productnos',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '产品代号',
          align: 'center',
          dataIndex: 'producttypes',
          minWidth: 120,
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '送试单位',
          align: 'center',
          dataIndex: 'customername',
          minWidth: 120,
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '委托编号',
          align: 'center',
          dataIndex: 'applynos',
          minWidth: 120,
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '任务编号',
          align: 'center',
          dataIndex: 'tasknos',
          minWidth: 120,
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '试件数量',
          align: 'center',
          dataIndex: 'piececount',
          minWidth: 100,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '试验名称',
          align: 'center',
          dataIndex: 'testname',
          minWidth: 100,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '试验性质',
          align: 'center',
          dataIndex: 'labnature',
          minWidth: 100,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '试验类型',
          align: 'center',
          dataIndex: 'testtype',
          minWidth: 100,
          customRender: (text) => {
            let obj = {
              1: "气候",
              2: "力学",
              3: "环境",
            }
            return obj[text] || '--'
          }
        },
        {
          title: '内部名称',
          align: 'center',
          dataIndex: 'devicealias',
          minWidth: 100,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '报告实际编号',
          align: 'center',
          width: 120,
          dataIndex: 'reportendcode',
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '领取人',
          align: 'center',
          width: 100,
          dataIndex: 'receivecode',
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '领取时间 ',
          align: 'center',
          minWidth: 140,
          dataIndex: 'receivetime',
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '更新时间 ',
          align: 'center',
          minWidth: 100,
          dataIndex: 'updatedate',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '创建人 ',
          align: 'center',
          minWidth: 140,
          dataIndex: 'username',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '查看下载记录',
          align: 'center',
          dataIndex: 'downloadRecord',
          minWidth: 100,
          scopedSlots: { customRender: 'downloadRecord' }
        },
        {
          title: 'mes推送状态 ',
          align: 'center',
          minWidth: 150,
          dataIndex: 'pushmesstate',
          scopedSlots: { customRender: 'pushmesstate' }
        },
        {
          title: '备注 ',
          align: 'center',
          minWidth: 140,
          dataIndex: 'remarks',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        // {
        //   title: '操作',
        //   dataIndex: 'actions',
        //   fixed: 'right',
        //   width: 100,
        //   align: 'center',
        //   scopedSlots: { customRender: 'actions' }
        // }
      ],
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
      statusTag: ['green', 'red', '', '', 'blue', 'orange', '', '', '', 'lightgrey'],
      pushmesstatusTag: ['', 'green']
    }
  },
  methods: {
    refresh(bool = true) {
      this.$refs.reportHistoryListTable.refresh(bool)
      this.selectedRowKeys = []
      this.selectedRows = []
    },
    onSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    downloadHistoryRecord(record) {
      this.$nextTick(() => {
        this.$refs.reportDownloadHistoryModal.show(record.reportid)
      })
    },
    downloadWordReport() {
      if (!this.selectedRowKeys.length) {
        return this.$message.warning('请先选择数据')
      }
      if (this.validateSelectedRows('labnature')) {
        return this.$message.warning('请选择相同试验性质的数据')
      }
      let zipName = this.selectedRows[0].labnature === '筛选' ? '筛选试验报告.zip' : '环境试验报告.zip';
      let data = {
        'labNature': this.getFieldsByReport('labnature'),
        'reportNos': this.getFieldsByReport('reportno').toString(),
        'reportIds': this.getFieldsByReport('id').toString(),
        'zipName': zipName,
        'type': 'word'
      }
      downloadFile(this.url.download, zipName, data)
    },
    downloadPDFReport() {
      if (!this.selectedRowKeys.length) {
        this.$message.warning('请先选择数据')
        return
      }
      if (this.validateSelectedRows('labnature')) {
        return this.$message.warning('请选择相同试验性质的数据')
      }
      let zipName = this.selectedRows[0].labnature === '筛选' ? '筛选试验报告.zip' : '环境试验报告.zip';
      let data = {
        'labNature': this.getFieldsByReport('labnature'),
        'reportNos': this.getFieldsByReport('reportno').toString(),
        'reportIds': this.getFieldsByReport('id').toString(),
        'zipName': zipName,
        'type': 'word'
      }
      downloadFile(this.url.download, zipName, data)
    },
    validateSelectedRows(field) {
      // 校验选中的行数据类型是否一样
      return Array.from(new Set(this.selectedRows.map(item => item[field]))).length > 1;
    },
    getFieldsByReport(field) {
      if (this.selectedRows.length) {
        return this.selectedRows.map(item => {
          return item[field]
        })
      }
      return ''
    },
  }
}
</script>
<style lang='less' scoped>
.report-history-list {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
