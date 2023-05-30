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
      ref="entrustFlowTable"
      :columns="columns"
      :data="loadData"
      :rowKey="(record) => record.id"
      :height="500"
    >
      <span slot="optType" slot-scope="text, record">
        {{ record.optType | entrustOptFilter }}
      </span>
    </h-vex-table>
  </h-card>
</template>

<script>
import moment from 'moment'
import {postAction} from '@/api/manage'
import mixin from '@views/hifar/hifar-environmental-test/mixin'

export default {
  name: "EntrustFlowInfoTable",
  mixins: [mixin],
  props: {
    entrustId: {
      type: String,
      default: ''
    }
  },
  watch: {
    entrustId: {
      immediate: true,
      handler(val) {
        if (val) {
          this.$nextTick(() => {
            this.refresh(true)
          })
        }
      },
    }
  },
  data() {
    return {
      moment,
      queryParams: {},
      url: {
        list: '/HfEnvEntrustBusiness/listAll',
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
          width: 200,
          dataIndex: 'createTime',
          customRender: (time, record) => {
            return time && time != 0 ? moment(parseInt(time)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '操作人',
          align: 'left',
          width: 200,
          dataIndex: 'createUserName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '操作',
          align: 'left',
          width: 200,
          dataIndex: 'optType',
          scopedSlots: {customRender: 'optType'},
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
          entrustId: this.entrustId,
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
          if (res.code === 200) {
            return res.data
          }
        })
      },
    }
  },
  methods: {
    refresh(bool = true) {
      this.$refs.entrustFlowTable.refresh(bool)
    },
  },
}
</script>