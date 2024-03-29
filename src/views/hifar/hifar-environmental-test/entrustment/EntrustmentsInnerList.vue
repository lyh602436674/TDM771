<template>
  <div ref="entrustmentList" class="entrustment-list">
    <h-card fixed>
      <template slot="title"> 委托管理</template>
      <h-search slot="search-form" v-model="queryParams" :data="searchForm" size="default" @change="refresh(true)"/>
      <template slot="table-operator">
        <a-button v-has="'entrustment:add'" icon="plus" size="small" type="ghost-primary" @click="handleAdd"> 新增
        </a-button>
        <a-button v-has="'entrustment:export'" icon="export" size="small" type="ghost-warning"
                  @click="handleExportXls('委托单信息')">
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
        :rowSelection="{ selectedRowKeys, onSelect }"
      >
        <template #entrustNo="text, record">
          <span style="padding: 0 5px">
            <h-icon v-if="record.entrustType === '1'" type='icon-nei'/>
            <h-icon v-else type='icon-wai'/>
          </span>
          <a v-if="record.entrustNo" @click="handleDetailCode(record,'1')">{{ record.entrustNo }}</a>
          <span v-else>--</span>
        </template>
        <template #entrustCode="text, record">
          <a v-if="record.entrustCode" @click="handleDetailCode(record,'2')">{{ record.entrustCode }}</a>
          <span v-else>--</span>
        </template>
        <span slot="status" slot-scope="text, record">
          <a-badge :color="record.status | wtStatusColorFilter" :text="record.status | wtStatusFilter"/>
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
              <a-menu-item v-has="'entrustment:edit'" v-if="[1,30].includes(record.status)">
                <a @click="handleEdit(record)">编辑</a>
              </a-menu-item>
              <!-- 草稿，已提交，已驳回 状态只能复制委托单，因为还没有运行单 -->
              <a-menu-item v-if="![1,10,15,30,31].includes(record.status)" v-has="'entrustment:add'">
                <a @click="handleCopyItem(record,'1')">复制运行单</a>
              </a-menu-item>
              <a-menu-item v-has="'entrustment:add'">
                <a @click="handleCopyItem(record,'2')">复制委托单</a>
              </a-menu-item>
              <a-menu-item v-if="record.status == 1" v-has="'entrustment:delete'">
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a style="color: #ff4d4f">删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </template>
      </h-vex-table>
    </h-card>
    <entrustment-inner-modal ref="EntrustmentModal" @change="refresh(true)"></entrustment-inner-modal>
    <entrustment-detail-modal ref="EntrustmentDetailModal"></entrustment-detail-modal>
    <entrust-data-entry-modal ref="EntrustDataEntryModal"></entrust-data-entry-modal>
  </div>
</template>

<script>
import moment from 'moment'
import {downloadFile, postAction} from '@/api/manage'
import mixin from '@/views/hifar/hifar-environmental-test/mixin.js'
import EntrustmentDetailModal from '@/views/hifar/hifar-environmental-test/entrustment/modules/EntrustmentDetailModal'
import EntrustDataEntryModal from '@/views/hifar/hifar-environmental-test/entrustment/modules/EntrustDataEntryModal'
import EntrustmentInnerModal from '@views/hifar/hifar-environmental-test/entrustment/modules/EntrustmentInnerModal';

export default {
  provide() {
    return {
      getContainer: () => this.$refs.entrustmentList
    }
  },
  components: {
    EntrustmentInnerModal,
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
      },
      queryParams: {},
      selectedRowKeys: [],
      selectedRows: [],
      searchForm: [
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
          title: '委托单位',
          key: 'c_custName_7',
          formType: 'input'
        },
        {
          title: '产品名称',
          key: 'productName',
          formType: 'input'
        },
        {
          title: '产品代号',
          key: 'productAlias',
          formType: 'input'
        },
        {
          title: '产品编号',
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
              title: '待审核',
              key: 10,
              value: 10
            },
            {
              title: '待复核',
              key: 15,
              value: 15
            },
            {
              title: '复核通过',
              key: 20,
              value: 20
            },
            {
              title: '审核驳回',
              key: 30,
              value: 30
            },
            {
              title: '复核驳回',
              key: 31,
              value: 31
            },
            {
              title: '已完成',
              key: 40,
              value: 40
            },
            {
              title: '已出报告',
              key: 50,
              value: 50
            },
            {
              title: '已终止',
              key: 80,
              value: 80
            }
          ]
        },
        {
          title: '创建时间',
          key: 'entrustCreateTime',
          formType: 'dateRangePick',
          showTime: true,
          format: 'YYYY-MM-DD HH:mm',
        },
      ],
      columns: [
        {
          title: '运行单号',
          align: 'left',
          width: 160,
          dataIndex: 'entrustCode',
          scopedSlots: {customRender: 'entrustCode'},
          fixed: 'left'
        },
        {
          title: '委托单号',
          align: 'left',
          width: 160,
          dataIndex: 'entrustNo',
          scopedSlots: {customRender: 'entrustNo'},
          fixed: 'left'
        },
        {
          title: '状态',
          align: 'left',
          dataIndex: 'status',
          minWidth: 100,
          scopedSlots: {customRender: 'status'}
        },
        {
          title: '送试单位',
          align: 'left',
          minWidth: 120,
          dataIndex: 'custName',
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '产品名称',
          align: 'left',
          minWidth: 200,
          dataIndex: 'productNames',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '产品编号',
          align: 'left',
          dataIndex: 'pieceNo',
          minWidth: 120,
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '产品代号',
          align: 'left',
          dataIndex: 'productAlias',
          minWidth: 120,
          customRender: (text, record) => {
            return text || '--';
          }
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
          title: '试验名称',
          align: 'left',
          dataIndex: 'testNames',
          minWidth: 100,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '工序编号',
          align: 'left',
          dataIndex: 'processNo',
          minWidth: 100,
          customRender: (text, record) => {
            return text || '--'
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
          title: '要求试验时间',
          align: 'center',
          width: 150,
          dataIndex: 'requireTestTime',
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          }
        },
        {
          title: '试验性质',
          align: 'center',
          width: 120,
          dataIndex: 'testPropertyCode_dictText',
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '试件数量',
          align: 'center',
          width: 100,
          dataIndex: 'pieceNum',
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '审核人',
          align: 'center',
          width: 80,
          dataIndex: 'approveName',
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '审核时间',
          align: 'center',
          width: 140,
          dataIndex: 'approveTime',
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          }
        },
        {
          title: '复核人',
          align: 'center',
          width: 80,
          dataIndex: 'ratifyName',
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '复核时间',
          align: 'center',
          width: 140,
          dataIndex: 'ratifyTime',
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          }
        },
        {
          title: '更新时间 ',
          align: 'left',
          minWidth: 140,
          dataIndex: 'updateTime',
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
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
          title: '备注信息 ',
          align: 'left',
          minWidth: 150,
          dataIndex: 'remarks',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '操作',
          dataIndex: 'actions',
          fixed: 'right',
          width: 100,
          align: 'center',
          scopedSlots: {customRender: 'actions'}
        }
      ],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
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
    refresh(bool = false) {
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
      this.$refs.EntrustmentModal.show({}, 'add')
    },
    async handleExportXls(name, model) {
      let data = {
        ...this.queryParams,
        ...model,
        ids: this.selectedRowKeys.join(','),
        entrustType: '1',
        type: 'export'
      }
      let url = this.url.list
      let params = data
      let fileName = name + '.xls'
      await downloadFile(url, fileName, params)
    },
    // 复制
    handleCopyItem(record, copyType) {
      let url = this.url.copy
      postAction(url, {id: record.id, copyType}).then((res) => {
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
      this.$refs.EntrustmentModal.show(record, 'edit')
    },
    // 删除
    handleDelete(id) {
      postAction(this.url.delete, {id: id}).then((res) => {
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.refresh()
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
            postAction(_this.url.delete, {id: _this.selectedRowKeys.join()}).then((res) => {
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
