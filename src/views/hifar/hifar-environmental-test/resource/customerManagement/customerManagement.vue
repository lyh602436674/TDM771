<!--
 * @Author: 赵峰
 * @Date: 2021-08-02 14:23:46
 * @LastEditTime: 2021-11-30 14:47:54
 * @LastEditors: 马潭龙
 * @Descripttion: 客户管理
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\customerManagement\customerManagement.vue
-->
<template>
  <div ref="pageWrapper" class="h-custom-layout" style="height: 100%; position: relative">
    <h-card fixed :bordered="true">
      <template slot="title"> 客户管理 </template>
      <h-search
        v-model="queryParam"
        slot="search-form"
        size="small"
        :showToggleButton="true"
        :data="searchBar"
        @change="searchQuery"
      />
      <div slot="table-operator" style="border-top: 5px">
        <a-button v-has="'user:add'" size="small" @click="handleAdd" type="ghost-primary" icon="plus">添加</a-button>
        <a-button v-has="'user:privice'" size="small" type="ghost-warning" icon="download" @click="handleExportXls('客户管理')">导出</a-button>
        <a-button v-has="'user:import'" size="small" type="ghost-success" icon="import" @click="handleImportExcel">导入</a-button>
        <a-button v-has="'user:delete'" type="danger" size="small" icon="delete" @click="batchDel()">批量删除</a-button>
      </div>
      <h-vex-table
        slot="content"
        ref="custTable"
        :scroll="{ x: true }"
        :columns="columns"
        :data="custLoadData"
        :rowKey="(record) => record.id"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      >
        <span slot="custName" slot-scope="text,record">
          <a href="javascript:;" @click="handleDetailCode(record)">
            {{ record.custName? record.custName:'--' }}
          </a>
        </span>
        <span slot="custType" slot-scope="text">
          <a-tag v-if="text === 'inside'" color="pink">
            {{ text === 'inside' ? (text = '内部') : '' }}
          </a-tag>
          <a-tag v-if="text === 'outside'" color="green">
            {{ text === 'outside' ? (text = '外部') : '' }}
          </a-tag>
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
      <customer-detail :detail="detailData" ref="detail" />
      <customer-modal ref="CustomerModal" @change="searchQuery"></customer-modal>
      <h-file-import ref="HFileImport" @change="searchQuery(true)" @downloadExcel="downloadChange" />
    </h-card>
  </div>
</template>

<script>
import mixin from '@/views/hifar/mixin.js'
import { downloadFile, postAction } from '@/api/manage'
import CustomerDetail from './customerDetail'
import CustomerModal from './CustomerModal'

export default {
  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper,
    }
  },
  mixins: [mixin],
  components: {
    CustomerDetail,
    CustomerModal,
  },
  data() {
    return {
      customerInfo: {},
      selectedRowKeys: [],
      detailData: {},
      formDatas: {},
      custLoadData: (params) => {
        let data = {
          ...this.queryParam,
          ...params,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
      // 查询条件
      queryParam: {},
      searchBar: [
        {
          title: '客户名称',
          key: 'c_custName_7',
          formType: 'input',
        },
        {
          title: '客户简称',
          key: 'c_custShort_7',
          formType: 'input',
        },
        {
          title: '客户类型',
          key: 'c_custType_7',
          formType: 'select',
          options: [
            { title: '内部', value: 'inside', key: 'inside' },
            { title: '外部', value: 'outside', key: 'outside' },
          ],
        },
        {
          title: '联系人',
          key: 'c_linkName_7',
          formType: 'input',
        },
        {
          title: '联系电话',
          key: 'c_linkMobile_7',
          formType: 'input',
        },
        {
          title: '客户地址',
          key: 'c_custAddress_7',
          formType: 'input',
        },
        {
          title: '备注',
          key: 'c_remarks_7',
          formType: 'input',
        },
      ],
      // 表头
      columns: [
        {
          title: '客户名称',
          align: 'left',
          dataIndex: 'custName',
          scopedSlots:{ customRender:'custName' }
        },
        {
          title: '客户简称',
          align: 'left',
          dataIndex: 'custShort',
        },
        {
          title: '客户类型',
          align: 'left',
          dataIndex: 'custType',
          scopedSlots: { customRender: 'custType' },
        },
        {
          title: '客户地址 ',
          align: 'left',
          dataIndex: 'custAddress',
        },
        {
          title: '联系人 ',
          align: 'left',
          dataIndex: 'linkName',
        },
        {
          title: '联系电话 ',
          align: 'left',
          dataIndex: 'linkMobile',
        },
        {
          title: '备注 ',
          align: 'left',
          dataIndex: 'remarks',
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: 100,
          align: 'center',
          scopedSlots: { customRender: 'action' },
        },
      ],
      url: {
        list: '/HfResCustBusiness/listPage',
        delete: '/HfResCustBusiness/logicRemoveById',
        importExcelUrl: 'HfResCustImport/importExcel',
        export: '/HfResCustExport/exportExcel',
      },
    }
  },
  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    },
  },
  methods: {
    searchQuery() {
      this.$refs.custTable.refresh(true)
      this.selectedRowKeys = []
    },

    // 单个删除
    handleDelete(id) {
      postAction(this.url.delete, { id: id }).then((res) => {
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.searchQuery()
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
          content: '是否要继续删除?',
          onOk: function () {
            postAction(_this.url.delete, { id: _this.selectedRowKeys.join() }).then((res) => {
              if (res.code === 200) {
                _this.$message.success('删除成功')
                _this.searchQuery()
                _this.selectedRowKeys = []
              } else {
                _this.$message.warning('删除失败')
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
      this.$refs.CustomerModal.show(record, '编辑')
    },
    handleAdd() {
      let record = {}
      this.$refs.CustomerModal.show(record, '添加')
    },
    // 详情
    editDictItem(record) {
      this.detailData = record
      this.$refs.detail.visible = true
    },
    handleDetailCode(record){
      this.editDictItem(record)
    },
    // 导出
    async handleExportXls(name, model) {
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
      let type = '客户管理'
      let { importExcelUrl } = this.url
      let record = {
        importCode:'HfResCustImport'
      }
      this.$refs.HFileImport.show(type, importExcelUrl,record)
    },
    downloadChange() {
      this.handleExportXls('客户管理', { type: 'template' })
    },
  },
}
</script>
