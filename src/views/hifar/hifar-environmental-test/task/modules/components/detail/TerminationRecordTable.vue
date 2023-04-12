<!--
 * @Author: 赵峰
 * @Date: 2021-11-05 09:57:30
 * @LastEditTime: 2021-11-05 09:58:39
 * @LastEditors: 赵峰
 * @Descripttion: 试验终止记录table
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\components\detail\TerminationRecordTable.vue
-->
<template>
  <h-card :bordered="false" class="terminationRecord" fixed style="height: 100%">
    <div slot="search-form" class="termination-search">
      <h-search
        v-model="queryParams"
        :data="searchForm"
        :showToggleButton="false"
        @change="refresh"
      />
    </div>
    <div class="termination-table">
      <h-vex-table ref="terminationRecordTable" slot="content" :columns="columns" :data="loadData" :height="500"
                   style="width: 100%">
        <template slot="filePath" slot-scope="text, record">
          <a v-if="text" @click="handleDownloadFile(record)">点击下载</a>
          <span v-else>暂无附件</span>
        </template>
        <template slot="actions" slot-scope="text, record">
          <a-icon class="primary-text" title="查看" type="eye" @click="handleShowDetail(record)"/>
        </template>
      </h-vex-table>
    </div>
    <task-force-end-detail ref="taskForceEndDetail"/>
  </h-card>
</template>

<script>
import {createLink, postAction} from '@api/manage'
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
      default: () => {
      },
    },
    listType: {
      type: String,
      default: '',
    }
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
  computed: {
    columns() {
      return [
        {
          title: '记录人',
          dataIndex: 'recordUserName',
          minWidth: 100,
        },
        {
          title: '终止时间',
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
          title: '附件',
          dataIndex: 'filePath',
          minWidth: 180,
          scopedSlots: {
            customRender: 'filePath',
          },
        },
        // {
        //   title: '操作',
        //   dataIndex: 'actions',
        //   align: 'center',
        //   fixed: 'right',
        //   width: 80,
        //   scopedSlots: {
        //     customRender: 'actions',
        //   },
        // },
      ]
    }
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

      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
        }
        if (this.listType === 'testForceEndList') {
          data.testId = this.records.id
        }
        if (this.listType === 'taskForceEndList') {
          data.taskId = this.records.id
        }
        return postAction(this.url[this.listType || 'list'], data).then((res) => {
          if (res.code === 200) {
            return res.data
          }
        })
      },
      url: {
        // 原始查询终止记录的接口，但是只能查询试验，不能查询任务
        list: '/HfEnvTestForceEndBusiness/queryByTestIdPage',
        taskForceEndList: '/HfEnvTaskTestBusiness/listForceEndPage',
        testForceEndList: '/HfEnvTestForceEndBusiness/listForceEndPage',
      },
    }
  },
  methods: {
    refresh(bool) {
      this.$nextTick(() => {
        this.$refs.terminationRecordTable.refresh(bool)
      })
    },
    handleDownloadFile(record) {
      createLink(record.filePath, '', true)
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