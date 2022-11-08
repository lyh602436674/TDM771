<!--
 * @Author: 赵峰
 * @Date: 2021-11-02 14:17:03
 * @LastEditTime: 2021-11-12 11:13:49
 * @LastEditors: 赵峰
 * @Descripttion: 试验终止记录
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\testRecord\TestTerminateRecord.vue
-->
<template>
  <div ref="productList" class="product-list">
    <h-card fixed :bordered="true">
      <template slot="title"> 终止记录 </template>
      <h-search
        v-model="queryParams"
        slot="search-form"
        size="small"
        :showToggleButton="true"
        :data="searchBar"
        @change="refresh"
        @reload="handleReset"
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
        <template slot="status" slot-scope="text, record">
          <a-badge v-if="record.status == 10" color="blue" text="申请中 " />
          <a-badge v-else-if="record.status == 20" color="red" text="已驳回" />
          <a-badge v-else-if="record.status == 30" color="green" text="已通过" />
        </template>
        <span slot="action" slot-scope="text, record">
          <!-- <a-icon
            type="edit"
            title="编辑"
            class="primary-text"
            style="cursor: pointer"
            @click="() => handleEdit(record)"
          />
          <a-divider type="vertical" /> -->
          <a-icon
            type="eye"
            title="详情"
            class="primary-text"
            style="cursor: pointer"
            @click="() => handleDetail(record)"
          />
          <!-- <a-divider type="vertical" />
          <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
            <a-icon
              type="delete"
              title="删除"
              class="primary-text"
              style="cursor: pointer"
              theme="twoTone"
              two-tone-color="#ff4d4f"
            />
          </a-popconfirm> -->
        </span>
      </h-vex-table>
    </h-card>
    <test-terminate-record-modal ref="testTerminateRecordModal" @change="refresh(true)" />
    <test-terminate-record-detail ref="testTerminateRecordDetail" />
  </div>
</template>

<script>
import moment from 'moment'
import { getAction, postAction } from '@/api/manage'
import TestTerminateRecordModal from './modules/TestTerminateRecordModal'
import TestTerminateRecordDetail from './modules/TestTerminateRecordDetail'
export default {
  provide() {
    return {
      getContainer: () => this.$refs.productList,
    }
  },
  components: {
    TestTerminateRecordDetail,
    TestTerminateRecordModal
  },
  data() {
    return {
      moment,
      queryParams: {},
      selectedRowKeys: [],
      url: {
        list: '/HfEnvTestForceEndBusiness/listPage',
        delete: '/HfEnvTestForceEndBusiness/logicRemoveById',
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
          title:'状态',
          key: 'c_status_1',
          formType: 'select',
          options:[
            {
              title:'申请中',
              key:10,
              value:10
            },
            {
              title:'已驳回',
              key:20,
              value:20
            },
            {
              title:'已通过',
              key:30,
              value:30
            },
          ]
        }
      ],
      columns: [
        {
          title: '试验编号',
          dataIndex: 'testCode',
          minWidth: 100,
          scopedSlots: { customRender: 'testCode' },
        },
        {
          title: '状态',
          dataIndex: 'status',
          minWidth: 100,
          scopedSlots: { customRender: 'status' },
        },
        {
          title: '试验名称',
          dataIndex: 'testNames',
          minWidth: 100,
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
          title: '终止说明',
          dataIndex: 'forceEndDesc',
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
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
    }
  },

  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    },
  },
  methods: {
    refresh() {
      this.$refs.materialTable.refresh(true)
    },
    handleReset() {
      this.selectedRowKeys = []
      this.refresh()
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },

    // 单个删除
    handleDelete(id) {
      postAction(this.url.delete, { id: id }).then((res) => {
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.refresh()
        } else {
          this.$message.warning('删除失败')
        }
      })
    },

    // 批量删除
    batchDel() {
      let _this = this
      this.$confirm({
        title: '确认删除',
        content: '删除后不可恢复，确认删除？',
        onOk: function () {
          postAction(_this.url.delete, { id: _this.selectedRowKeys.join() }).then((res) => {
            if (res.code === 200) {
              _this.$message.success('删除成功')
              _this.refresh()
              _this.selectedRowKeys = []
            } else {
              _this.$message.warning('删除失败')
            }
          })
        },
      })
    },
    // 添加
    handleAdd() {
      let record = {}
      this.$refs.testTerminateRecordModal.show(record, '添加')
    },
    // 编辑
    handleEdit(record) {
      this.$refs.testTerminateRecordModal.show(record, '编辑')
    },
    // 详情
    handleDetail(record) {
      this.$refs.testTerminateRecordDetail.show(record)
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

  methods: {}
}

</script>
<style lang='less' scoped>
</style>