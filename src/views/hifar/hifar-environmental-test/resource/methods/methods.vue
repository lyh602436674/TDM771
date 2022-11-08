<template>
  <div ref="pageWrapper" class="h-custom-layout" style="height: 100%; position: relative">
    <h-card fixed :bordered="true">
      <template slot="title"> 标准管理 </template>
      <h-search
        v-model="queryParam"
        slot="search-form"
        size="small"
        :showToggleButton="true"
        :data="searchBar"
        @change="searchQuery"
      />
      <div slot="table-operator" style="border-top: 5px">
        <a-button v-has="'method:add'" size="small" @click="handleAdd" type="ghost-primary" icon="plus">添加</a-button>
        <a-button v-has="'method:privice'" size="small" type="ghost-warning" icon="download" @click="handleExportXls('标准管理')">导出</a-button>
<!--        <a-button v-has="'method:import'" size="small" type="ghost-success" icon="import" @click="handleImportExcel">导入</a-button>-->
        <a-button v-has="'method:delete'" type="danger" size="small" icon="delete" @click="batchDel()">批量删除</a-button>
      </div>
      <h-vex-table
        slot="content"
        ref="methodsTable"
        :scroll="{ x: true }"
        :columns="columns"
        :data="getLoadData"
        :rowKey="(record) => record.id"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      >
        <span slot="standardCode" slot-scope="text,record">
          <a href="javascript:;" @click="handleDetailCode(record)">
            {{ record.standardCode? record.standardCode:'--' }}
          </a>
        </span>
        <span slot="status" slot-scope="text">
          <a-tag v-if="text === 88" color="pink">
            {{ text === 88 ? (text = '禁用') : '' }}
          </a-tag>
          <a-tag v-else color="green">
            {{ text === 1 ? (text = '启用') : '' }}
          </a-tag>
        </span>

        <span slot="standardFlag" slot-scope="text">
          <a-tag v-if="text === 1" color="pink">
            {{ text === 1 ? (text = '标准方法') : '' }}
          </a-tag>
          <a-tag v-else color="green">
            {{ text === 2 ? (text = '非标准方法') : '' }}
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
      <methods-detail :detail="detailData" ref="detail" />
      <methods-modal ref="MethodsModal" @ok="searchQuery"></methods-modal>
      <h-file-import ref="HFileImport" @change="searchQuery(true)" @downloadExcel="downloadChange" />
    </h-card>
  </div>
</template>

<script>
import moment from 'moment'
import mixin from '@/views/hifar/mixin.js'
import { downloadFile, postAction } from '@/api/manage'
import MethodsDetail from './modules/methodsDetail'
import MethodsModal from './modules/MethodsModal'

export default {
  name: 'methodsList',
  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper,
    }
  },
  mixins: [mixin],
  components: {
    MethodsDetail,
    MethodsModal,
  },
  data() {
    return {
      drawerWidth: 800,
      methodsInfo: {},
      selectedRowKeys: [],
      detailData: {},
      visible: false,
      // 查询条件
      queryParam: {},
      getLoadData: (params) => {
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
      searchBar: [
        {
          title: '标准名称',
          key: 'c_standardName_7',
          formType: 'input',
        },
        {
          title: '标准编号',
          key: 'c_standardCode_7',
          formType: 'input',
        },
        {
          title: '方法类型',
          key: 'c_standardTypeCode_1',
          formType: 'dict',
          dictCode: 'hf_res_standard_type',
        },
        {
          title: '发布机构',
          key: 'c_publishOrg_7',
          formType: 'input',
        },
      ],
      // 表头
      columns: [
        // {
        //   title: '方法分类',
        //   align: 'left',
        //   ellipsis: true,
        //   width: 120,
        //   dataIndex: 'standardFlag',
        //   scopedSlots: { customRender: 'standardFlag' }
        // },
        {
          title: '标准编号',
          align: 'left',
          ellipsis: true,
          dataIndex: 'standardCode',
          scopedSlots:{ customRender:'standardCode' }
        },
        {
          title: '标准名称 ',
          align: 'left',
          ellipsis: true,
          dataIndex: 'standardName',
        },
        {
          title: '类别',
          align: 'left',
          ellipsis: true,
          dataIndex: 'standardTypeName',
        },
        {
          title: '发布日期',
          align: 'left',
          ellipsis: true,
          dataIndex: 'publishTime',
          customRender: (time) => {
            return time && time != 0 ? moment(parseInt(time)).format('YYYY-MM-DD') : '--'
          },
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: 100,
          fixed: 'right',
          align: 'center',
          scopedSlots: { customRender: 'action' },
        },
      ],
      url: {
        list: '/HfResStandardBusiness/listPage',
        delete: '/HfResStandardBusiness/logicRemoveById',
        importExcelUrl: 'HfResStandardImport/importExcel',
        export: '/HfResStandardExport/exportExcel',
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
      this.$refs.methodsTable.refresh(true)
      this.selectedRowKeys = []
    },
    // 单个删除
    handleDelete(id) {
      postAction(this.url.delete, { id: id }).then((res) => {
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.searchQuery()
        } else {
          this.$message.warning(res.msg)
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
      let title = '编辑'
      this.$refs.MethodsModal.show(record, title)
      this.methodsInfo = record
    },
    handleAdd() {
      let title = '新增'
      let record = {}
      this.$refs.MethodsModal.show(record, title)
      this.methodsInfo = {}
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
        ...model,
        ...this.queryParam,
        ids: this.selectedRowKeys.join(','),
      }
      let url = this.url.export
      let params = data
      let fileName = name + '.xls'
      await downloadFile(url, fileName, params)
    },
    // 导入
    handleImportExcel() {
      let type = '方法管理'
      let { importExcelUrl } = this.url
      let record = {
        importCode:'HfResStandardImport'
      }
      this.$refs.HFileImport.show(type, importExcelUrl,record)
    },
    downloadChange() {
      this.handleExportXls('方法管理', { type: 'template' })
    },
  },
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>
