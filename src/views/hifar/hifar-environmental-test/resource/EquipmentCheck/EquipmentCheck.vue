<!--
 * @Author: 赵峰
 * @Date: 2021-08-02 14:23:46
 * @LastEditTime: 2021-09-27 15:05:54
 * @LastEditors: 赵峰
 * @Descripttion: 点检模板
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-physico-chemical\resource\EquipmentCheck\EquipmentCheck.vue
-->
<template>
  <div class="em-custom-wrapper" ref="pageWrapper" style="height: 100%; position: relative">
    <h-card fixed :bordered="true">
      <template slot="title"> 点检模板 </template>
      <h-search
        v-model="queryParam"
        slot="search-form"
        size="small"
        :showToggleButton="true"
        :data="searchBar"
        @change="refresh"
      />
      <div slot="table-operator" style="border-top: 5px">
        <a-button size="small" @click="handleAdd" type="ghost-primary" icon="plus">添加</a-button>
        <a-button size="small" type="ghost-warning" icon="download" @click="handleExportXls('点检模板')">导出</a-button>
        <a-upload
          size="small"
          name="file"
          :showUploadList="false"
          :multiple="false"
          accept=".xls,.xlsx"
          :action="importExcelUrl"
          @change="handleImportExcel"
        >
          <a-button size="small" type="ghost-success" icon="import">导入</a-button>
        </a-upload>
        <a-button v-if="hasSelected" type="danger" size="small" icon="delete" @click="batchDel()">批量删除</a-button>
      </div>
      <h-vex-table
        slot="content"
        ref="equipCheckTable"
        :scroll="{ x: true }"
        :columns="columns"
        :data="checkLoadData"
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
            @click="() => detailHandle(record)"
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
      <equipment-check-modal ref="equipmentCheckModal" @change="refresh"></equipment-check-modal>
      <equipment-check-detail ref="EquipmentCheckDetail"></equipment-check-detail>
    </h-card>
  </div>
</template>

<script>
import moment from 'moment'
import { downloadFile, postAction } from '@/api/manage'
import equipmentCheckModal from './equipmentCheckModal'
import EquipmentCheckDetail from './EquipmentCheckDetail'

export default {
  name: 'EquipmentCheck',
  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper,
    }
  },
  components: {
    equipmentCheckModal,
    EquipmentCheckDetail,
  },
  data() {
    return {
      moment,
      selectedRowKeys: [],
      tokenHeader: '',
      visible: false,
      url: {
        list: '/HfResEquipCheckTbaseBusiness/listPage',
        delete: '/HfResEquipCheckTbaseBusiness/logicRemoveById',
        importExcelUrl: 'HfResEquipCheckTbaseImport/importExcel',
        export: '/HfResEquipCheckTbaseExport/exportExcel',
      },
      checkLoadData: (params) => {
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
          title: '模板名称',
          key: 'c_templateName_7',
          formType: 'input',
        },
      ],
      // 表头
      columns: [
        {
          title: '模板名称',
          align: 'left',
          dataIndex: 'templateName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '创建人',
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
          width: 100,
          align: 'center',
          scopedSlots: { customRender: 'action' },
        },
      ],
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
    refresh() {
      this.$refs.equipCheckTable.refresh(true)
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
        content: '是否要继续删除?',
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
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    // 编辑
    handleEdit(record) {
      this.$refs.equipmentCheckModal.show(record, '编辑')
    },
    handleAdd() {
      let record = {}
      this.$refs.equipmentCheckModal.show(record, '新增')
    },
    // 详情
    detailHandle(record) {
      this.$refs.EquipmentCheckDetail.show(record)
    },
    // 导出
    async handleExportXls(name) {
      let data = {
        ...this.queryParams,
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
          this.$message.success(`${info.file.response.msg}`)
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
