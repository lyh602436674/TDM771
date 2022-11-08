<!--
 * @Author: 赵峰
 * @Date: 2021-08-04 14:24:20
 * @LastEditTime: 2021-11-08 16:18:56
 * @LastEditors: Please set LastEditors
 * @Descripttion: 表单模板
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-physico-chemical\resource\FormTemp.vue
-->
<template>
  <div ref="pageWrapper" class="h-custom-layout" style="height: 100%; position: relative">
    <h-card fixed :bordered="true">
      <template slot="title"> 表单模板 </template>
      <h-search
        v-model="queryParam"
        slot="search-form"
        size="small"
        :showToggleButton="true"
        :data="searchBar"
        @change="searchQuery"
      />
      <div slot="table-operator" style="border-top: 5px">
        <a-button size="small" @click="handleAdd" type="ghost-primary" icon="plus">添加</a-button>
        <a-button size="small" type="ghost-warning" icon="download" @click="handleExportXls('表单模板')">导出</a-button>
        <a-upload
          size="small"
          name="file"
          :showUploadList="false"
          :multiple="false"
          :headers="tokenHeader"
          :action="importExcelUrl"
          :data="paramsData"
          accept=".xls,.xlsx"
          @change="handleImportExcel"
        >
          <a-button size="small" type="ghost-success" icon="import">导入</a-button>
        </a-upload>
        <a-button type="danger" size="small" icon="delete" @click="batchDel()">批量删除</a-button>
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
      <data-temp-detail ref="dataTempDetail" :detail="detailData" :config="formData"></data-temp-detail>
      <temp-add-modal ref="TempAddModal" @change="searchQuery"></temp-add-modal>
    </h-card>
  </div>
</template>

<script>
import moment from 'moment'
import mixin from '@/views/hifar/mixin.js'
import { getAction, downloadFile, postAction } from '@/api/manage'
import dataTempDetail from './modules/dataTempDetail.vue'
import TempAddModal from './modules/TempAddModal.vue'

export default {
  name: 'dataTempList',
  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper,
    }
  },
  components: {
    dataTempDetail,
    TempAddModal,
  },
  mixins: [mixin],
  data() {
    return {
      moment,
      templateInfo: {},
      paramsData: {
        groupCode: 'form',
      },
      selectedRowKeys: [],
      detailData: {},
      getLoadData: (params) => {
        let data = {
          ...this.queryParam,
          ...params,
          groupCode: 'form',
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
      ],
      // 表头
      columns: [
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
  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    },
  },
  methods: {
    searchQuery() {
      this.queryParam.groupCode = 'form'
      this.$refs.custTable.refresh(true)
      this.selectedRowKeys = []
    },
    // 编辑
    handleEdit(record) {
      let title = '编辑'
      let groupCode = 'form'
      this.$refs.TempAddModal.show(record, title, groupCode)
    },
    handleAdd() {
      let record = {}
      let title = '添加'
      let groupCode = 'form'
      this.$refs.TempAddModal.show(record, title, groupCode)
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
      if(_this.selectedRowKeys.length){
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
      }else{
        this.openNotificationWithIcon('error','删除提示','请至少选择一项')
      }
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    // 详情
    editDictItem(record) {
      this.detailData = record
      this.$refs.dataTempDetail.visible = true
    },
    // 导出
    async handleExportXls(name) {
      let data = {
        ...this.queryParam,
        groupCode: 'form',
        ids: this.selectedRowKeys.join(','),
      }
      let url = this.url.export
      let params = data
      let fileName = name + '.xls'
      await downloadFile(url, fileName, params)
    },
    // 导入
    handleImportExcel(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList)
      }
      if (info.file.status === 'done') {
        if (info.file.response.code == 200) {
          this.$message.success(`${info.file.name} 文件导入成功`)
          this.searchQuery()
        } else {
          this.$message.error(`${info.file.name} ${info.file.response.msg}.`)
        }
      } else if (info.file.status === 'error') {
        this.$message.error(`文件导入失败: ${info.file.msg} `)
      }
    },
  },
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>