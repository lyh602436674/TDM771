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
           <a-icon v-if="record.recordflag === 1" style="font-size: 16px; color: #e74949" type="issues-close"></a-icon>
            <a :style="{marginLeft: record.recordflag === 1 ? '4px' : '20px'}"
               @click="$refs.ReportCheckBaseModal.show(record)">{{ text }}</a>
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
            {title: '草稿', value: 3, key: 3},
            {title: '待审核', value: 10, key: 10},
            {title: '待批准', value: 20, key: 20},
            {title: '审核驳回', value: 30, key: 30},
            {title: '批准通过', value: 40, key: 40},
            {title: '批准驳回', value: 50, key: 50},
            {title: '修改审批', value: 60, key: 60},
            {title: '修改审批通过', value: 70, key: 70},
            {title: '修改审核驳回', value: 80, key: 80},
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
          width: 160,
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
          title: '试验名称',
          align: 'left',
          width: 120,
          dataIndex: 'testName',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '项目名称',
          align: 'left',
          width: 120,
          dataIndex: 'unitName',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '创建人',
          align: 'left',
          width: 120,
          dataIndex: 'createUserName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '创建时间',
          align: 'left',
          width: 150,
          dataIndex: 'createTime',
          customRender: (time, record) => {
            return time && time != 0 ? moment(parseInt(time)).format('YYYY-MM-DD') : '--'
          },
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