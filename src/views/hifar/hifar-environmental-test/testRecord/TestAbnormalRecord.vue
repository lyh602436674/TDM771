<!--
 * @Author: 赵峰
 * @Date: 2021-11-02 14:15:33
 * @LastEditTime: 2021-11-12 11:16:28
 * @LastEditors: 赵峰
 * @Descripttion: 试验异常记录
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\testRecord\TestAbnormalRecord.vue
-->
<template>
  <div ref="productList" class="product-list">
    <h-card fixed :bordered="true">
      <template slot="title"> 异常记录 </template>
      <h-search
        v-model="queryParams"
        slot="search-form"
        size="small"
        :showToggleButton="true"
        :data="searchBar"
        @change="refresh"
      />
      <div slot="table-operator" style="border-top: 5px">
        <a-button size="small" @click="handleAdd" type="ghost-primary" icon="plus">添加</a-button>
      </div>
      <h-vex-table
        slot="content"
        ref="materialTable"
        :scroll="{ x: true }"
        :columns="columns"
        :data="loadData"
        :rowKey="(record) => record.id"
      >
        <template slot="testCode" slot-scope="text, record">
          <a @click="() => handleDetail(record)">{{ record.testCode }}</a>
        </template>
        <div slot="exceptionType" slot-scope="text, record">
          <span v-if="record.exceptionType == 1">设备异常</span>
          <span v-if="record.exceptionType == 2">样品异常</span>
          <span v-if="record.exceptionType == 3">动力异常</span>
        </div>
        <template slot="dealStatus" slot-scope="text, record">
          <a-badge v-if="record.dealStatus == 1" color="red" text="未处理" />
          <a-badge v-if="record.dealStatus == 3" color="green" text="已处理" />
        </template>
        <template slot="action" slot-scope="text, record">
          <span v-if="record.dealStatus != 3">
            <a-icon
              type="edit"
              title="编辑"
              class="primary-text"
              style="cursor: pointer"
              @click="() => handleEdit(record)"
            />
            <a-divider type="vertical" />
          </span>
          <a-icon
            type="eye"
            title="详情"
            class="primary-text"
            style="cursor: pointer"
            @click="() => handleDetail(record)"
          />
        </template>
      </h-vex-table>
    </h-card>
    <test-abnormal-record-detail ref="testAbnormalRecordDetail" />
    <test-abnormal-record-modal ref="testAbnormalRecordModal" @change="refresh(true)" />
  </div>
</template>

<script>
import moment from 'moment'
import { getAction, postAction } from '@/api/manage'
import TestAbnormalRecordModal from './modules/TestAbnormalRecordModal'
import TestAbnormalRecordDetail from './modules/TestAbnormalRecordDetail'
export default {
  components: {
    TestAbnormalRecordDetail,
    TestAbnormalRecordModal,
  },
  provide() {
    return {
      getContainer: () => this.$refs.productList,
    }
  },
  data() {
    return {
      moment,
      queryParams: {},
      testId: '',
      url: {
        list: '/HfEnvTestExceptionBusiness/listPage',
      },
      searchBar: [
        {
          title: '试验编号',
          key: 'testCode',
          formType: 'input',
        },
        {
          title: '试验名称',
          key: 'testName',
          formType: 'input',
        },
        {
          title: '记录人',
          key: 'c_recordUserName_7',
          formType: 'input',
        },
        {
          title: '异常类型',
          key: 'c_exceptionType_1',
          formType: 'select',
          options: [
            {
              title: '设备异常',
              key: 1,
              value: 1,
            },
            {
              title: '样品异常',
              key: 2,
              value: 2,
            },
            {
              title: '动力异常',
              key: 3,
              value: 3,
            },
          ],
        },
        {
          title: '处理状态',
          key: 'c_dealStatus_1',
          formType: 'select',
          options: [
            {
              title: '未处理',
              key: 1,
              value: 1,
            },
            {
              title: '处理中',
              key: 2,
              value: 2,
            },
            {
              title: '已处理',
              key: 3,
              value: 3,
            },
          ],
        },
        {
          title: '处理人',
          key: 'c_dealUserName_7',
          formType: 'input',
        },
      ],
      columns: [
        {
          title: '试验编号',
          dataIndex: 'testCode',
          minWidth: 120,
          scopedSlots: { customRender: 'testCode' },
        },
        {
          title: '试验名称',
          dataIndex: 'testNames',
          minWidth: 100,
        },
        {
          title: '异常类型',
          dataIndex: 'exceptionType',
          minWidth: 100,
          scopedSlots: { customRender: 'exceptionType' },
        },
        {
          title: '异常说明',
          dataIndex: 'exceptionDesc',
          minWidth: 180,
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
          customRender: (time) => {
            return time && time != 0 ? moment(parseFloat(time)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '处理状态',
          dataIndex: 'dealStatus',
          minWidth: 100,
          scopedSlots: { customRender: 'dealStatus' },
        },
        {
          title: '处理人',
          dataIndex: 'dealUserName',
          minWidth: 100,
        },
        {
          title: '处理结果',
          dataIndex: 'dealDesc',
          minWidth: 180,
        },
        {
          title: '试验项目',
          dataIndex: 'unitNames',
          minWidth: 100,
        },
        {
          title: '试验设备',
          dataIndex: 'equipName',
          minWidth: 100,
        },
        {
          title: '试验单位',
          dataIndex: 'custNames',
          minWidth: 100,
        },
        {
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          width: 80,
          align: 'center',
          scopedSlots: { customRender: 'action' },
        },
      ],
      loadData: (params) => {
        let data = {
          ...this.queryParams,
          ...params,
          testId: this.testId,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
    }
  },
  created() {
    let testId = this.$route.query.testId
    if (testId) {
      this.refresh()
    }
  },
  methods: {
    refresh() {
      this.$refs.materialTable.refresh(true)
    },
    // 详情
    handleDetail(record) {
      this.$refs.testAbnormalRecordDetail.show(record)
    },
    handleAdd() {
      let record = {}
      this.$refs.testAbnormalRecordModal.show(record, '添加')
    },
    handleEdit(record) {
      this.$refs.testAbnormalRecordModal.show(record, '编辑')
    },
  },
}
</script>

<style lang='less' scoped>
.product-list {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>