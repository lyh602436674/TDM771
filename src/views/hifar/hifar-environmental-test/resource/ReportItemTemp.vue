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
      <template slot="title"> 报告子项模板 </template>
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
        :scroll="{ x: true }"
        :columns="columns"
        :data="getLoadData"
        :rowKey="(record) => record.id"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      >
        <span slot="reportType" slot-scope="text, record">
          <a href="javascript:;" @click="handleDetailCode(record)">
            {{ text == 'cover' ? '封面' : text == 'report' ? '报告' : '--' }}
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
      <data-temp-item-detail ref="dataTempItemDetail" :detail="detailData" :config="formData"></data-temp-item-detail>
      <temp-item-add-modal ref="TempItemAddModal" @change="searchQuery"/>
    </h-card>
    <h-file-import ref="HFileImport" @change="searchQuery(true)" @downloadExcel="downloadChange" />
  </div>
</template>

<script>
import moment from 'moment'
import mixin from '@/views/hifar/mixin.js'
import { getAction, downloadFile, postAction } from '@/api/manage'
import dataTempItemDetail from './modules/dataTempItemDetail.vue'
import TempItemAddModal from '@views/hifar/hifar-environmental-test/resource/modules/TempItemAddModal'

export default {
  name: 'dataTempList',
  components: {
    dataTempItemDetail,
    TempItemAddModal,
  },
  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper,
    }
  },
  mixins: [mixin],
  data() {
    return {
      moment,
      templateInfo: {},
      selectedRowKeys: [],
      detailData: {},
      paramsData: {
        groupCode: 'report',
        importCode:'HfResTemplateImport'
      },
      getLoadData: (params) => {
        let data = {
          ...this.queryParam,
          ...params,
          groupCode: 'report',
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
      // 查询条件
      queryParam: {},
      formData: [
        {
          title: '模板名称',
          key: 'name',
          formType: 'input',
          span: 2,
          validate: {
            rules: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
          },
        },
        {
          title: '模版分组',
          key: 'groupCode',
          formType: 'input',
          span: 2,
          hidden: true,
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
          span: 2,
        },
        {
          title: '附件',
          key: 'attachIds',
          span: 2,
          component: <h-upload-file v-decorator={['attachIds', { initialValue: [] }]} />,
        },
      ],
      searchBar: [
        {
          title: '模板名称',
          key: 'c_name_7',
          formType: 'input',
        },
        {
          title: '模版分类',
          key: 'c_reportType_1',
          formType: 'select',
          options: [
            {
              title: '封面',
              key: 'cover',
              value: 'cover',
            },
            {
              title: '报告',
              key: 'report',
              value: 'report',
            },
          ],
        },
      ],
      // 表头
      columns: [
        {
          title: '排序',
          align: 'left',
          dataIndex: 'rowSort',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '报告名称',
          align: 'left',
          dataIndex: 'name',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '报告标签',
          align: 'left',
          dataIndex: 'label',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '所属报告',
          align: 'left',
          dataIndex: 'pName',
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
        list: '/HfResTemplateItemBusiness/listPage',
        delete: '/HfResTemplateItemBusiness/logicRemoveById',
        importExcelUrl: 'HfResTemplateItemBusiness/importExcel',
        export: '/HfResTemplateItemBusiness/exportExcelTemplate',
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
      this.queryParam.groupCode = 'report'
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
      let title = '编辑'
      let groupCode = 'report'
      this.$refs.TempItemAddModal.show(record, title, groupCode)
    },
    handleAdd() {
      let record = {}
      let title = '添加'
      let groupCode = 'report'
      this.$refs.TempItemAddModal.show(record, title, groupCode)
    },
    // 详情
    editDictItem(record) {
      this.detailData = record
      this.$refs.dataTempItemDetail.visible = true
    },
    handleDetailCode(record) {
      this.editDictItem(record)
    },
    // 导出
    async handleExportXls(name, model) {
      let data = {
        ...this.queryParam,
        groupCode: 'report',
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
