<!--
 * @Author: 赵峰
 * @Date: 2021-11-05 09:57:30
 * @LastEditTime: 2021-11-05 09:58:39
 * @LastEditors: 赵峰
 * @Descripttion: 试验终止记录table
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\components\detail\TerminationRecordTable.vue
-->
<template>
  <h-card fixed :bordered="false" class="terminationRecord">
    <div class="termination-search">
      <h-search
        v-model="queryParams"
        slot="search-form"
        :data="searchForm"
        :showToggleButton="false"
        @change="refresh"
      />
    </div>
    <div class="termination-table" style="margin-top: 10px">
      <h-vex-table slot="content" ref="terminationRecordTable" :columns="columns" :data="loadData" style="width: 100%">
        <template slot="actions" slot-scope="text, record">
          <a-tooltip title="查看">
            <a-icon class="primary-text" type="eye" @click="handleShowDetail(record)" />
          </a-tooltip>
        </template>
      </h-vex-table>
    </div>
    <task-force-end-detail ref="taskForceEndDetail" />
  </h-card>
</template>

<script>
import { postAction } from '@api/manage'
import moment from 'moment'
import TaskForceEndDetail from '../../TaskForceEndDetail'

export default {
  name: 'TerminationRecord',
  components: {
    TaskForceEndDetail,
  },
  props: {
    records: {
      type: Object,
      default: () => {},
    },
  },
  watch: {
    records: {
      immediate: true,
      deep: true,
      handler(val) {
        this.refresh(true)
      },
    },
  },
  data() {
    return {
      queryParams: {},
      searchForm: [
        {
          title: '记录人',
          key: 'c_recordUserName_7',
          formType: 'input',
        },
      ],
      columns: [
        {
          title: '记录人',
          dataIndex: 'recordUserName',
          minWidth: 100,
        },
        {
          title: '记录时间',
          dataIndex: 'recordTime',
          minWidth: 180,
          customRender: (text) => {
            return text ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '终止说明',
          dataIndex: 'forceEndDesc',
          minWidth: 180,
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          width: 80,
          scopedSlots: {
            customRender: 'actions',
          },
        },
      ],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
          testId: this.records.id,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
      url: {
        list: '/HfEnvTestForceEndBusiness/queryByTestIdPage',
      },
    }
  },
  methods: {
    refresh(bool) {
      this.$nextTick(() => {
        this.$refs.terminationRecordTable.refresh(bool)
      })
    },
    handleShowDetail(record) {
      let testId = this.records.id
      this.$refs.taskForceEndDetail.show(record, testId)
    },
  },
}
</script>

<style scoped lang="less">
.terminationRecord {
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;

  .termination-search {
    width: 100%;
    margin-top: -10px;
  }

  .termination-button {
    margin: 10px 0;
    width: 100%;
  }

  .termination-table {
    flex: 1;
    width: 100%;
    overflow: hidden;
  }
}
</style>