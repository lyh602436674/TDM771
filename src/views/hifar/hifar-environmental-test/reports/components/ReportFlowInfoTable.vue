<!--
 * @Author: 赵峰
 * @Date: 2021-09-09 15:53:47
 * @LastEditTime: 2021-10-14 09:58:00
 * @LastEditors: 赵峰
 * @Descripttion: 报告流转信息
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\reports\components\ReportFlowInfoTable.vue
-->
<template>
  <h-card fixed :bordered="true">
    <h-search
      v-model="queryParams"
      slot="search-form"
      size="small"
      :showToggleButton="true"
      :data="searchBar"
      @change="refresh(true)"
    />

    <h-vex-table
      slot="content"
      ref="reportFlowTable"
      :scroll="{ x: true }"
      :columns="columns"
      :data="loadData"
      :rowKey="(record) => record.id"
    >
      <span slot="status" slot-scope="text, record">
        <a-badge :color="record.status | reportStatusColorFilter" :text="record.status | reportFlowStatusFilter" />
      </span>
      <span slot="optType" slot-scope="text, record">
        {{ record.optType | reportOptFilter }}
      </span>
    </h-vex-table>
  </h-card>
</template>

<script>
import moment from 'moment'
import { postAction } from '@/api/manage'
import mixin from '../mixin'
export default {
  mixins: [mixin],
  props: ['reportId'],
  components: {},
  data() {
    return {
      moment,
      queryParams: {},
      url: {
        list: '/HfEnvReportRecordBusiness/listPageByReportId',
      },
      searchBar: [
        {
          title: '操作时间',
          key: 'createTime',
          formType: 'dateRangePick',
          showTime: true,
          format: 'YYYY-MM-DD',
        },
        {
          title: '操作人',
          key: 'c_createUserName_7',
          formType: 'input',
        },
      ],
      columns: [
        {
          title: '操作时间',
          align: 'left',
          dataIndex: 'createTime',
          customRender: (time, record) => {
            return time && time != 0 ? moment(parseInt(time)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '操作人',
          align: 'left',
          dataIndex: 'createUserName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '操作',
          align: 'left',
          dataIndex: 'optType',
          scopedSlots: { customRender: 'optType' },
        },
        {
          title: '状态',
          align: 'left',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
        },
        {
          title: '备注',
          align: 'left',
          dataIndex: 'remarks',
          customRender: (text, record) => {
            return text || '--'
          },
        },
      ],
      loadData: (params) => {
        let data = {
          ...this.queryParams,
          ...params,
          reportId: this.reportId,
        }
        if (data.createTime && data.createTime.length > 0) {
          data.beginTime = moment(data.createTime[0]).format('YYYY-MM-DD') + ' 00:00:00'
          data.endTime = moment(data.createTime[1]).format('YYYY-MM-DD') + ' 23:59:59'
          data.c_createTime_4 = moment(data.beginTime).format('X') * 1000
          data.c_createTime_6 = moment(data.endTime).format('X') * 1000
        }
        delete data.beginTime
        delete data.endTime
        delete data.createTime
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
    }
  },
  methods: {
    refresh(bool = true) {
      this.$refs.reportFlowTable.refresh(bool)
    },
  },
}
</script>