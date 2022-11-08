<!--
 * @Author: 赵峰
 * @Date: 2021-11-05 09:44:28
 * @LastEditTime: 2021-11-15 16:33:36
 * @LastEditors: 赵峰
 * @Descripttion: 异常记录列表
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\components\detail\AbnormalRecordTable.vue
-->
<template>
  <div style="height: 100%">
    <h-card fixed :bordered="false" class="abnormalRecord">
      <div class="abnormal-search">
        <h-search v-model="queryParams" slot="search-form" :data="searchForm" @change="refresh"/>
      </div>
      <div class="abnormal-table" style="margin-top: 10px">
        <h-vex-table slot="content" ref="abnormalRecordTable" :columns="columns" :data="loadData" style="width: 100%">
          <div slot="exceptionType" slot-scope="text, record">
            <span v-if="record.exceptionType == 1">设备异常</span>
            <span v-if="record.exceptionType == 2">样品异常</span>
            <span v-if="record.exceptionType == 3">动力异常</span>
          </div>
          <template #dealStatus="text, record">
            <a-badge v-if="record.dealStatus == 1" color="red" text="未处理"/>
            <!--<a-badge v-if="record.dealStatus == 2" color="green" text="处理中" />-->
            <a-badge v-if="record.dealStatus == 3" color="green" text="已处理"/>
          </template>
          <template slot="actions" slot-scope="text, record">
            <template v-if="isReadOnly">
              <a-tooltip title="详情">
                <a-icon class="primary-text" type="eye" @click="handleShowDetailDesc(record)"/>
              </a-tooltip>
            </template>
            <template v-else>
              <a-tooltip title="编辑">
                <a-icon class="primary-text" type="edit" @click="handleShowDetail(record)"/>
              </a-tooltip>
              <a-divider type="vertical"/>
              <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                <a-icon class="danger-text" type="delete"/>
              </a-popconfirm>
            </template>
          </template>
        </h-vex-table>
      </div>
      <task-abnormal-modal ref="taskAbnormalModal" @change="refresh(true)"></task-abnormal-modal>
      <abnormal-detail-desc ref="AbnormalDetailDesc"></abnormal-detail-desc>
    </h-card>
  </div>
</template>

<script>
import {postAction} from '@api/manage'
import moment from 'moment'
import TaskAbnormalModal from '../../../checkModal/TaskAbnormalModal.vue'
import AbnormalDetailDesc from "@views/hifar/hifar-environmental-test/task/modules/AbnormalDetailDesc";

export default {
  name: 'AbnormalRecord',
  components: {
    AbnormalDetailDesc,
    TaskAbnormalModal,
  },
  props: {
    records: {
      type: Object,
      default: () => {
      },
    },
    isReadOnly: {
      type: Boolean,
      default: false
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
  data() {
    return {
      queryParams: {},
      searchForm: [
        {
          title: '处理状态',
          key: 'c_dealStatus_7',
          formType: 'select',
          options: [
            {
              title: '未处理',
              key: '1',
              value: '1',
            },
            /*          {
                        title: '处理中',
                        key: '2',
                        value: '2',
                      },*/
            {
              title: '已处理',
              key: '3',
              value: '3',
            },
          ],
        },
        {
          title: '记录人',
          key: 'c_recordUserName_7',
          formType: 'input',
        },
        {
          title: '处理人',
          key: 'c_dealUserName_7',
          formType: 'input',
        },
      ],
      columns: [
        {
          title: '异常类型',
          dataIndex: 'exceptionType',
          minWidth: 100,
          scopedSlots: {customRender: 'exceptionType'},
        },
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
          title: '处理状态',
          dataIndex: 'dealStatus',
          minWidth: 180,
          scopedSlots: {customRender: 'dealStatus'},
        },
        {
          title: '处理人姓名',
          dataIndex: 'dealUserName',
          minWidth: 180,
        },
        {
          title: '异常说明',
          dataIndex: 'exceptionDesc',
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
        list: '/HfEnvTestExceptionBusiness/listPage',
        delete: '/HfEnvTestExceptionBusiness/logicRemoveById',
      },
    }
  },
  methods: {
    refresh(bool) {
      this.$nextTick(() => {
        this.$refs.abnormalRecordTable.refresh(bool)
      })
    },
    handleDelete(id) {
      postAction(this.url.delete, {id: id}).then((res) => {
        if (res.code == 200) {
          this.refresh(true)
          this.$message.success('删除成功')
        }
      })
    },
    handleShowDetail(record) {
      this.$refs.taskAbnormalModal.show('edit', record)
    },
    handleShowDetailDesc(record) {
      this.$refs.AbnormalDetailDesc.show(record)
    },
  },
}
</script>

<style scoped lang="less">
.abnormalRecord {
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;

  .abnormal-search {
    width: 100%;
    margin-top: -10px;
  }

  .abnormal-button {
    margin: 10px 0;
    width: 100%;
  }

  .abnormal-table {
    flex: 1;
    width: 100%;
    overflow: hidden;
  }
}
</style>