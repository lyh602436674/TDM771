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