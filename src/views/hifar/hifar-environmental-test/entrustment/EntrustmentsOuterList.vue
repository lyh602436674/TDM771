<!--
 * @Author: 赵峰
 * @Date: 2021-09-15 10:09:09
 * @LastEditTime: 2021-12-06 21:48:37
 * @LastEditors: 赵文凯
 * @Descripttion: 委托管理--委托列表
 * @FilePath: \tdm200-client\src\views\hifar\hifar-environmental-test\entrustment\EntrustmentsList.vue
-->
<template>
  <div ref="entrustmentList" class="entrustment-list">
    <h-card fixed>
      <template slot="title"> 委托管理</template>
      <h-search slot="search-form" v-model="queryParams" :data="searchForm" size="default" @change="refresh(true)"/>
      <template slot="table-operator">
        <a-button v-has="'entrustment:add'" icon="plus" size="small" type="ghost-primary" @click="handleAdd"> 添加
        </a-button>
        <a-button icon="download" size="small" type="ghost-warning" @click="handleExportXls('委托单信息')">
          导出
        </a-button>
        <template v-if="selectedRowKeys.length">
          <a-button v-has="'entrustment:delete'" icon="delete" size="small" type="danger" @click="batchDel">
            批量删除
          </a-button>
        </template>
      </template>
      <h-vex-table
        ref="entrustmentListTable"
        slot="content"
        :columns="columns"
        :data="loadData"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onSelect: onSelect }"
      >
        <template #entrustNo="text, record">
          <a v-if="record.entrustNo" @click="handleDetailCode(record,'1')">{{ record.entrustNo }}</a>
          <span v-else>--</span>
        </template>
        <template #entrustCode="text, record">
          <a v-if="record.entrustCode" @click="handleDetailCode(record)">{{ record.entrustCode }}</a>
          <span v-else>--</span>
        </template>
        <span slot="status" slot-scope="text, record">
          <a-badge :color="record.status | wtStatusColorFilter" :text="record.status | wtStatusFilter('2')"/>
        </span>
        <template slot="actions" slot-scope="text, record">
          <a-tooltip title="详情">
            <a-icon
              class="primary-text"
              style="cursor: pointer"
              title="详情"
              type="eye"
              @click="() => handleDetail(record)"
            />
          </a-tooltip>
          <a-divider type="vertical"/>
          <a-dropdown>
            <a-tooltip title="更多">
              <a class="ant-dropdown-link">
                <h-icon type="icon-gengduo1"/>
              </a>
            </a-tooltip>
            <a-menu slot="overlay">
              <a-menu-item v-if="record.status == 1 || record.status == 30">
                <a @click="handleEdit(record)">编辑</a>
              </a-menu-item>
              <a-menu-item>
                <a @click="handleCopyItem(record)">复制</a>
              </a-menu-item>
              <a-menu-item v-if="record.status == 1">
                <a-popconfirm v-has="'entrustment:delete'" title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a style="color: #ff4d4f">删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </template>
      </h-vex-table>
    </h-card>
    <entrustment-outer-modal ref="EntrustmentModal" @change="refresh(true)"></entrustment-outer-modal>
    <entrustment-detail-modal ref="EntrustmentDetailModal"></entrustment-detail-modal>
    <entrust-data-entry-modal ref="EntrustDataEntryModal"></entrust-data-entry-modal>
  </div>
</template>

<script>
import moment from 'moment'
import {downloadFile, postAction} from '@/api/manage'
import mixin from '@/views/hifar/hifar-environmental-test/mixin.js'
import EntrustmentDetailModal from './modules/EntrustmentDetailModal'
import EntrustDataEntryModal from '@/views/hifar/hifar-environmental-test/entrustment/modules/EntrustDataEntryModal'
import EntrustmentOuterModal from '@views/hifar/hifar-environmental-test/entrustment/modules/EntrustmentOuterModal';

export default {
  provide() {
    return {
      getContainer: () => this.$refs.entrustmentList
    }
  },
  components: {
    EntrustmentOuterModal,
    EntrustmentDetailModal,
    EntrustDataEntryModal
  },
  mixins: [mixin],
  data() {
    return {
      moment,
      url: {
        list: '/HfEnvEntrustBusiness/listPage',
        delete: '/HfEnvEntrustBusiness/logicRemoveById',
        copy: '/HfEnvEntrustBusiness/copyById',
        export: '/HfEnvEntrustBusiness/listAllForExport',
        signAndIssue: '/HfEnvEntrustBusiness/signAndIssue'
      },
      queryParams: {},
      selectedRowKeys: [],
      selectedRows: [],
      searchForm: [
        {
          title: '运行单号',
          key: 'c_entrustCode_7',
          formType: 'input'
        },
        {
          title: '委托单号',
          key: 'c_entrustNo_7',
          formType: 'input'
        },
        {
          title: '委托单位',
          key: 'c_custName_7',
          formType: 'input'
        },
        {
          title: '样品名称',
          key: 'productName',
          formType: 'input'
        },
        {
          title: '图号',
          key: 'productAlias',
          formType: 'input'
        },
        {
          title: '样品编号',
          key: 'pieceNo',
          formType: 'input'
        },
        {
          title: '试验项目',
          key: 'unitName',
          formType: 'input'
        },
        {
          title: '状态',
          key: 'c_status_1',
          formType: 'select',
          options: [
            {
              title: '草稿',
              key: 1,
              value: 1
            },
            {
              title: '已提交',
              key: 10,
              value: 10
            },
            {
              title: '已通过',
              key: 20,
              value: 20
            },
            {
              title: '已驳回',
              key: 30,
              value: 30
            },
            {
              title: '待出报告',
              key: 40,
              value: 40
            },
            {
              title: '已出报告',
              key: 50,
              value: 50
            }
          ]
        }
      ],
      columns: [
        {
          title: '运行单号',
          align: 'left',
          width: 140,
          dataIndex: 'entrustCode',
          scopedSlots: { customRender: 'entrustCode' },
          fixed: 'left'
        },
        {
          title: '委托单号',
          align: 'left',
          width: 160,
          dataIndex: 'entrustNo',
          scopedSlots: { customRender: 'entrustNo' },
          fixed: 'left'
        },
        {
          title: '状态',
          align: 'left',
          dataIndex: 'status',
          minWidth: 100,
          scopedSlots: { customRender: 'status' }
        },
        {
          title: '试验项目',
          align: 'left',
          dataIndex: 'unitNames',
          minWidth: 100,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '样品名称',
          align: 'left',
          minWidth: 200,
          dataIndex: 'productNames',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '图号',
          align: 'left',
          dataIndex: 'productAlias',
          minWidth: 100,
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '委托单位',
          align: 'left',
          minWidth: 100,
          dataIndex: 'custName',
          customRender: (text, record) => {
            return text || '--';
          }
        },

        {
          title: '委托日期',
          align: 'left',
          dataIndex: 'entrustTime',
          minWidth: 100,
          customRender: (time) => {
            return time && time != 0 ? moment(parseInt(time)).format('YYYY-MM-DD') : '--'
          }
        },
        {
          title: '联系人',
          align: 'center',
          dataIndex: 'linkName',
          width: 120,
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '联系方式',
          align: 'center',
          width: 150,
          dataIndex: 'linkMobile',
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '创建人 ',
          align: 'left',
          minWidth: 100,
          dataIndex: 'createUserName',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '创建时间 ',
          align: 'left',
          minWidth: 140,
          dataIndex: 'createTime',
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          }
        },
        {
          title: '操作',
          dataIndex: 'actions',
          fixed: 'right',
          width: 100,
          align: 'center',
          scopedSlots: { customRender: 'actions' }
        }
      ],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
          c_entrustType_1: '2'
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code === 200) {
            return res.data
          }
        })
      }
    }
  },
  methods: {
    refresh(bool = true) {
      this.$refs.entrustmentListTable.refresh(bool)
      this.selectedRowKeys = []
      this.selectedRows = []
    },
    onSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    handleDataEntry() {
      this.$refs.EntrustDataEntryModal.open()
    },
    handleAdd() {
      let type = 'add'
      this.$refs.EntrustmentModal.show({}, type)
    },
    async handleExportXls(name, model) {
      let data = {
        ...this.queryParams,
        ...model,
        ids: this.selectedRowKeys.join(','),
        entrustType: '2',
        type: 'export'
      }
      let url = this.url.list
      let params = data
      let fileName = name + '.xls'
      await downloadFile(url, fileName, params)
    },
    // 复制
    handleCopyItem(record) {
      let url = this.url.copy
      postAction(url, { id: record.id }).then((res) => {
        if (res.code === 200) {
          this.$message.success('复制成功!')
          this.refresh(true)
        }
      })
    },
    // 详情
    handleDetail(record, type) {
      this.$refs.EntrustmentDetailModal.show(record.id, type)
    },
    // 编辑
    handleEdit(record) {
      let type = 'edit'
      this.$refs.EntrustmentModal.show(record, type)
    },
    // 删除
    handleDelete(id) {
      postAction(this.url.delete, { id: id }).then((res) => {
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.refresh(true)
        }
      })
    },
    // 批量删除
    batchDel() {
      let _this = this
      if (_this.selectedRowKeys.length) {
        this.$confirm({
          title: '确认删除',
          content: '删除后不可恢复，确认删除？',
          onOk: function () {
            postAction(_this.url.delete, { id: _this.selectedRowKeys.join() }).then((res) => {
              if (res.code === 200 && res.data.num) {
                _this.$message.success('删除成功')
                _this.refresh()
              }
            })
          }
        })
      }
    },
    // 1 草稿 10 提交 20审核通过 30审核驳回 40检测完成 50 已出报告 80终止 99逻辑删除
    handleDetailCode(record, type) {
      if (record.status == 1 || record.status == 30) {
        this.handleEdit(record)
      } else if (record.status >= 10 && record.status != 30) {
        this.handleDetail(record, type)
      }
    }
  }
}
</script>
<style lang='less' scoped>
.entrustment-list {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
