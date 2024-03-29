<!--
 * @Author: 赵峰
 * @Date: 2021-08-04 14:28:29
 * @LastEditTime: 2021-11-30 11:56:22
 * @LastEditors: 马潭龙
 * @Descripttion: 报告模板
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\ReportTemp.vue
-->

<template>
  <div ref="pageWrapper" class="h-custom-layout" style="height: 100%; position: relative">
    <h-card fixed :bordered="true">
      <template slot="title"> 模板管理 </template>
      <h-search
        v-model="queryParam"
        slot="search-form"
        size="small"
        :showToggleButton="true"
        :data="searchBar"
        @change="searchQuery"
      />
      <div slot="table-operator" style="border-top: 5px">
        <a-button v-has="'template:add'" size="small" @click="handleAdd" type="ghost-primary" icon="plus">添加</a-button>
<!--        <a-button v-has="'template:derive'" size="small" type="ghost-warning" icon="download" @click="handleExportXls('报告模板')">导出</a-button>
        <a-button v-has="'template:import'" size="small" type="ghost-success" icon="import" @click="importHandle">导入</a-button>-->
        <a-button v-has="'template:delete'" type="danger" size="small" icon="delete" @click="batchDel()">批量删除</a-button>
      </div>

      <h-vex-table
        slot="content"
        ref="custTable"
        :columns="columns"
        :data="getLoadData"
        :rowKey="(record) => record.id"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      >
        <span slot="reportType" slot-scope="text, record">
          <a @click="handleEdit(record)">{{ text || '--' }}</a>
        </span>
        <span slot="action" slot-scope="text, record">
          <a-icon
            v-has="'template:add'"
            type="edit"
            title="编辑"
            class="primary-text"
            style="cursor: pointer"
            @click="() => handleEdit(record)"
          />
          <a-divider type="vertical" />
          <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
            <a-icon
              v-has="'template:delete'"
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
      <temp-add-modal ref="TempAddModal" @change="searchQuery"></temp-add-modal>
    </h-card>
    <h-file-import ref="HFileImport" @change="searchQuery(true)" @downloadExcel="downloadChange" />
  </div>
</template>

<script>
import moment from 'moment'
import {downloadFile, postAction} from '@/api/manage'
import TempAddModal from './modules/TempAddModal.vue'

export default {
  name: 'dataTempList',
  components: {
    TempAddModal,
  },
  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper,
    }
  },
  data() {
    return {
      moment,
      selectedRowKeys: [],
      paramsData: {
        importCode:'HfResTemplateImport'
      },
      getLoadData: (params) => {
        let data = {
          ...this.queryParam,
          ...params,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code === 200) {
            return res.data
          }
        })
      },
      // 查询条件
      queryParam: {},
      searchBar: [
        {
          title: '模板名称',
          key: 'c_name_7',
          formType: 'input',
        },
        {
          title: '模版分类',
          key: 'c_reportType_1',
          formType: 'dict',
          dictCode: "report_template_classify",
        },
      ],
      // 表头
      columns: [
        {
          title: '模板分类',
          dataIndex: 'reportType_dictText',
          scopedSlots: {customRender: 'reportType'},
        },
        {
          title: '模板名称',
          align: 'left',
          dataIndex: 'name',
          customRender: (text, record) => {
            return text || '--'
          },
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
          title: '备注',
          align: 'left',
          dataIndex: 'remarks',
          customRender: (text, record) => {
            return text || '--'
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
        list: '/HfResTemplateBusiness/listPage',
        delete: '/HfResTemplateBusiness/logicRemoveById',
        importExcelUrl: 'HfResTemplateImport/importExcel',
        export: '/HfResTemplateExport/exportExcelTemplate',
      },
    }
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
        this.$message.warning('请至少选择一条数据')
      }
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    // 编辑
    handleEdit(record) {
      let title = '编辑'
      this.$refs.TempAddModal.show(record, title)
    },
    handleAdd() {
      let record = {}
      let title = '添加'
      this.$refs.TempAddModal.show(record, title)
    },
    // 导出
    async handleExportXls(name, model) {
      let data = {
        ...this.queryParam,
        ids: this.selectedRowKeys.join(','),
        ...model,
      }
      let url = this.url.export
      let params = data
      let fileName = name + '.xls'
      await downloadFile(url, fileName, params)
    },
    // 导入
    importHandle() {
      let type = '报告模板'
      let { importExcelUrl } = this.url
      let record = this.paramsData
      this.$refs.HFileImport.show(type, importExcelUrl, record)
    },
    downloadChange() {
      this.handleExportXls('报告模板', { type: 'template' })
    },
  },
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>
