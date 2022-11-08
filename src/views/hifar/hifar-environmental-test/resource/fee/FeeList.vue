<!--
 * @Author: 赵峰
 * @Date: 2021-09-13 13:54:04
 * @LastEditTime: 2021-11-30 14:48:45
 * @LastEditors: 马潭龙
 * @Descripttion: 计费标准
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\fee\FeeList.vue
-->
<template>
  <div ref="pageWrapper" class="h-custom-layout" style="height: 100%; position: relative">
    <h-card fixed :bordered="true">
      <template slot="title"> 计费标准 </template>
      <h-search
        v-model="queryParam"
        slot="search-form"
        size="small"
        :showToggleButton="false"
        :data="searchBar"
        @change="refresh(true)"
      />
      <div slot="table-operator" style="border-top: 5px">
        <a-button v-has="'billing:add'" size="small" @click="handleAdd" type="ghost-primary" icon="plus">添加</a-button>
        <a-button v-has="'billing:privice'" size="small" type="ghost-warning" icon="download" @click="handleExportXls('计费标准')">导出</a-button>
        <a-button v-has="'billing:import'" size="small" type="ghost-success" icon="import" @click="handleImportExcel">导入</a-button>
        <template>
          <a-button v-has="'billing:delete'" type="danger" size="small" icon="delete" @click="batchDel">
            批量删除
          </a-button>
        </template>
      </div>

      <h-vex-table
        slot="content"
        ref="custTable"
        :scroll="{ x: true }"
        :columns="columns"
        :data="getLoadData"
        :rowKey="(record) => record.id"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      >
        <span slot="costName" slot-scope="text,record">
          <a href="javascript:;" @click="handleDetailCode(record)">
            {{ record.costName? record.costName:'--' }}
          </a>
        </span>
        <span slot="action" slot-scope="text, record">
          <a-icon
            type="edit"
            title="编辑"
            class="primary-text"
            style="cursor: pointer"
            @click="() => handleEdit(record)"
          />
          <a-divider type="vertical" />
          <a-icon
            type="eye"
            title="详情"
            class="primary-text"
            style="cursor: pointer"
            @click="() => editDictItem(record)"
          />
          <a-divider type="vertical" />
          <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
            <a-icon
              type="delete"
              title="删除"
              class="primary-text"
              style="cursor: pointer"
              theme="twoTone"
              two-tone-color="#ff4d4f"
            />
          </a-popconfirm>
        </span>
      </h-vex-table>
    </h-card>
    <fee-list-modal ref="FeeListModal" @change="refresh(true)"></fee-list-modal>
    <fee-list-detail-modal ref="FeeListDetailModal"></fee-list-detail-modal>
    <h-file-import ref="HFileImport" @change="refresh(true)" @downloadExcel="downloadChange" />
  </div>
</template>

<script>
import moment from 'moment'
import mixin from '@/views/hifar/mixin.js'
import { downloadFile, postAction } from '@/api/manage'
import FeeListModal from './modules/FeeListModal'
import FeeListDetailModal from './modules/FeeListDetailModal'

export default {
  name: 'dataTempList',
  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper,
    }
  },
  mixins: [mixin],
  components: {
    FeeListModal,
    FeeListDetailModal,
  },
  data() {
    return {
      moment,
      templateInfo: {},
      selectedRowKeys: [],
      // 查询条件
      queryParam: {},
      searchBar: [
        {
          title: '计费标准名称',
          key: 'c_costName_7',
          formType: 'input',
        },
      ],
      // 表头
      columns: [
        {
          title: '计费标准名称',
          align: 'left',
          dataIndex: 'costName',
          scopedSlots:{ customRender:'costName' }
        },
        {
          title: '创建人 ',
          align: 'left',
          dataIndex: 'createUserName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '创建时间 ',
          align: 'left',
          dataIndex: 'createTime',
          customRender: (time) => {
            return time && time != 0 ? moment(parseInt(time)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          width: 120,
          scopedSlots: { customRender: 'action' },
        },
      ],
      url: {
        list: '/HfResCustCostBusiness/listPage',
        delete: '/HfResCustCostBusiness/logicRemoveCostAndPriceById',
        importExcelUrl: 'HfResCustCostImport/importExcel',
        export: '/HfResCustCostExport/exportExcel',
      },
      getLoadData: (params) => {
        let data = {
          ...params,
          ...this.queryParam,
          groupCode: 'data',
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
      disableMixinCreated: true,
    }
  },
  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    },
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
  },
  methods: {
    refresh(bool = true) {
      this.$refs.custTable.refresh(bool)
      this.selectedRowKeys = []
    },
    // 单个删除
    handleDelete(id) {
      postAction(this.url.delete, { id: id }).then((res) => {
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.refresh(true)
        } else {
          this.$message.warning('删除失败')
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
              if (res.code === 200) {
                _this.$message.success('删除成功')
                _this.refresh()
                _this.selectedRowKeys = []
                _this.selectedRows = []
              } else {
                _this.$message.warning(res.msg)
              }
            })
          },
        })
      } else {
        this.openNotificationWithIcon('error', '删除提示', '请至少选择一项')
      }
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    // 编辑
    handleEdit(record) {
      let title = '编辑'
      this.$refs.FeeListModal.show(record, title)
    },
    // 添加
    handleAdd() {
      let record = {}
      let title = '添加'
      this.$refs.FeeListModal.show(record, title)
    },
    // 详情
    editDictItem(record) {
      this.$refs.FeeListDetailModal.show(record)
    },
    handleDetailCode(record){
      this.editDictItem(record)
    },
    // 导出
    async handleExportXls(name,model) {
      let data = {
        ...this.queryParam,
        ...model,
        ids: this.selectedRowKeys.join(','),
      }
      let url = this.url.export
      let params = data
      let fileName = name + '.xls'
      await downloadFile(url, fileName, params)
    },
    // 导入
    handleImportExcel() {
      let type = '计费标准'
      let { importExcelUrl } = this.url
      let record = {
        importCode:'HfResCustCostImport'
      }
      this.$refs.HFileImport.show(type, importExcelUrl,record)
    },
    downloadChange() {
      this.handleExportXls('计费标准', { type: 'template' })
    },
  },
}
</script>
<style lang="less" scoped>
</style>