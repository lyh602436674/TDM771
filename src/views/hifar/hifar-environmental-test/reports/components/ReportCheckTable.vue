<!--
 * @Author: 赵峰
 * @Date: 2021-09-09 13:49:02
 * @LastEditTime: 2021-11-10 09:33:03
 * @LastEditors: 赵峰
 * @Descripttion: 报告审核Table
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\reports\components\ReportCheckTable.vue
-->
<template>
  <h-card fixed :bordered="false">
    <h-search
      v-model="queryParams"
      slot="search-form"
      size="small"
      :showToggleButton="true"
      :data="searchBar"
      @change="refresh"
    />
    <h-vex-table
      slot="content"
      ref="dataCheckTable"
      :columns="columns"
      :data="loadData"
      :rowKey="(record) => record.id"
    >
      <span slot="reportCode" slot-scope="text, record">
            <a @click="$refs.ReportCheckBaseModal.show(record)">{{ text }}</a>
      </span>
      <span slot="status" slot-scope="text, record">
        <a-badge :color="record.status | reportStatusColorFilter" :text="record.status | reportStatusFilter"/>
      </span>

    </h-vex-table>
    <report-check-base-modal :queryType='queryType' ref="ReportCheckBaseModal" @change="refresh(false)"/>
  </h-card>
</template>

<script>
import moment from 'moment'
import {downloadFile, getAction, officeOnlineEdit, postAction} from '@/api/manage'
import mixin from '../mixin'
import ReportRejectPopover from "@views/hifar/hifar-environmental-test/reports/components/ReportRejectPopover";
import ReportCheckBaseModal from "@views/hifar/hifar-environmental-test/reports/modules/ReportCheckBaseModal";

export default {
  mixins: [mixin],
  props: ['queryType'],
  components: {
    ReportRejectPopover,
    ReportCheckBaseModal
  },
  watch: {
    queryType(val) {
      this.queryType = val
      this.refresh(true)
    },
  },
  data() {
    return {
      moment,
      queryParams: {},
      id: '',
      title: '',
      url: {
        list: '/HfEnvReportExamineBusiness/listPage',
        autoFileUrls: '/HfEnvReportBusiness/authUploads',
      },
      unitId: '',
      searchBar: [
        {
          title: '运行单号',
          key: 'c_entrustCode_7',
          formType: 'input',
        },
        {
          title: '产品代号',
          key: 'c_productAlias_7',
          formType: 'input',
        },
        {
          title: '产品名称',
          key: 'c_productName_7',
          formType: 'input',
        },
        {
          title: '产品编号',
          key: 'c_pieceNo_7',
          formType: 'input',
        },
        {
          title: '试验项目',
          key: 'c_testName_7',
          formType: 'input',
        },
        {
          title: '试验性质',
          key: 'c_testPropertyCode_1',
          formType: 'dict',
          dictCode: "env_test_quality"
        },
        {
          title: '生成时间',
          key: 'createTime',
          formType: 'dateRangePick',
          showTime: true,
          format: 'YYYY-MM-DD HH:mm',
        },
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
          title: '运行单号',
          align: 'left',
          dataIndex: 'entrustCode',
          width: 160,
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '状态',
          align: 'left',
          width: 120,
          dataIndex: 'status',
          scopedSlots: {customRender: 'status'},
        },
        {
          title: '产品代号',
          align: 'left',
          width: 120,
          dataIndex: 'productAlias',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '产品名称',
          align: 'left',
          dataIndex: 'productName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '产品编号',
          align: 'left',
          width: 100,
          dataIndex: 'pieceNo',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '产品数量',
          align: 'left',
          width: 80,
          dataIndex: 'pieceCount',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '试验项目',
          align: 'left',
          width: 120,
          dataIndex: 'testName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '试验性质',
          width: 100,
          align: 'center',
          dataIndex: 'testPropertyCode_dictText',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '是否加电',
          align: 'center',
          width: 80,
          dataIndex: 'isPowerUp',
          customRender: (text, record) => {
            return text === '1' ? '是' : "否"
          },
        },
        {
          title: '加电时间',
          width: 100,
          align: 'center',
          dataIndex: 'powerUpTime_dictText',
        },
        {
          title: '是否显示最终用户',
          width: 140,
          align: 'center',
          dataIndex: 'isShowUserInReport',
          customRender: (text) => {
            return text === '1' ? '是' : "否"
          }
        },
        {
          title: '最终用户',
          width: 100,
          align: 'center',
          dataIndex: 'lastUser_dictText',
        },
      ],
      type: 'check',
      loadData: (params) => {
        let data = {
          ...this.queryParams,
          ...params,
          queryType: this.queryType,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code === 200) {
            return Object.assign({}, res.data, {
              data: res.data.data.map(item => {
                return {
                  ...item,
                  docxLoading: false,
                }
              })
            })
          }
        })
      },
      reportFileList: []
    }
  },

  methods: {
    refresh(bool = false) {
      this.$refs.dataCheckTable.refresh(bool)
    },
    handleOnlineEdit(record) {
      let fileUrl = record.filePath.split('?')[0]
      officeOnlineEdit(fileUrl)
    },
    // 替换
    handleUploadCallback(file, record, isUpload) {
      postAction(this.url.autoFileUrls, {id: record.id, fileId: file[0].fileId, status: 10, isUpload}).then(res => {
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
  },
}
</script>
<style lang='less' scoped>
/deep/ .h-card.ant-card .ant-card-body {
  padding: 0;
}
</style>