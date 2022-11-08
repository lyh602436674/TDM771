<template>
  <div ref="sysConfig" style="position: relative; width: 100%; height: 100%">
    <h-card fixed :bordered="false">
      <!-- 查询区域 -->
      <h-search
        v-model="queryParams"
        slot="search-form"
        size="small"
        :showToggleButton="true"
        :data="searchBar"
        @change="refresh"
      />
      <!-- 查询区域-END -->

      <!-- 操作按钮区域 -->
      <div slot="table-operator">
        <vxe-toolbar ref="operatorBtns" custom>
          <div slot="buttons">
            <a-button v-has="'configuration:add'" @click="handleAdd" type="ghost-primary" size="small" icon="plus">新增</a-button>
          <!--  <a-button v-has="'configuration:derive'" size="small" type="ghost-warning" icon="download" @click="handleExportXls('参数配置')">
              导出
            </a-button>-->
            <!--<a-button v-has="'configuration:import'" size="small" type="ghost-success" icon="import" @click="handleImportExcel">导入</a-button>-->
          </div>
        </vxe-toolbar>
      </div>
      <!-- table区域-begin -->
      <h-vex-table
        uid="HfSysConfigParams"
        class="j-table-force-nowrap"
        ref="table"
        slot="content"
        size="small"
        bordered
        rowKey="id"
        :customConfig="{ storage: { visible: true } }"
        :columns="columns"
        :loading="loading"
        :data="loadData"
      >
        <template slot="imgSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px; font-style: italic">无图片</span>
          <img
            v-else
            height="25px"
            alt=""
            :src="getImgView(text)"
            style="max-width: 80px; font-size: 12px; font-style: italic"
          />
        </template>
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px; font-style: italic">无文件</span>
          <a-button v-else type="primary" icon="download" size="small" :ghost="true" @click="downloadFile(text)">
            下载
          </a-button>
        </template>

        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">
            <a-icon type="edit" />
            编辑
          </a>

          <a-divider type="vertical" />
          <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
            <a class="danger-text" href="javascript:;">
              <h-icon type="icon-shanchu" />
              删除
            </a>
          </a-popconfirm>
        </span>
      </h-vex-table>
    </h-card>
    <hf-sys-config-modal ref="modalForm" @ok="refresh"></hf-sys-config-modal>
    <h-file-import ref="HFileImport" @change="refresh(true)" @downloadExcel="downloadChange" />
  </div>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import HfSysConfigModal from './modules/HfSysConfigModal'
import { downloadFile, postAction } from '@/api/manage'

export default {
  name: 'HfSysConfigList',
  provide() {
    return {
      getContainer: () => this.$refs.sysConfig,
    }
  },
  mixins: [mixinDevice],
  components: {
    HfSysConfigModal,
  },
  data() {
    return {
      loading: false,
      queryParams: {},
      searchBar: [
        {
          title: '参数名称',
          key: 'c_itemName_7',
          placeholder: '请输入参数名称',
          formType: 'input',
        },
        {
          title: '参数键',
          key: 'c_itemKey_7',
          placeholder: '请输入参数键',
          formType: 'input',
        },
        {
          title: '参数值',
          key: 'c_itemValue_7',
          placeholder: '请输入参数值',
          formType: 'input',
        },
        {
          title: '系统参数',
          key: 'c_isSys_1',
          placeholder: '请选择是否是系统参数',
          formType: 'select',
          options: [
            {
              title: '是',
              key: '1',
              value: '1',
            },
            {
              title: '否',
              key: '2',
              value: '2',
            },
          ],
        },
      ],
      // 表头
      columns: [
        {
          title: '参数名称',
          align: 'center',
          dataIndex: 'itemName',
        },
        {
          title: '参数键',
          align: 'center',
          dataIndex: 'itemKey',
        },
        {
          title: '参数值',
          align: 'center',
          dataIndex: 'itemValue',
        },
        {
          title: '参数描述',
          align: 'center',
          dataIndex: 'itemDesc',
          customRender: (text) => text || '--',
        },
        {
          title: '系统参数',
          align: 'center',
          dataIndex: 'isSys',
          customRender: (text) => (text == '1' ? '是' : '否'),
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          width: 147,
          scopedSlots: { customRender: 'action' },
        },
      ],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
      url: {
        list: '/SysSwitchBusiness/listPage',
        delete: '/SysSwitchBusiness/logicRemoveById',
        deleteBatch: '/SysSwitchBusiness/logicRemoveById',
        export: '/SysSwitchExport/exportExcelSysSwitch',
        importExcelUrl: 'SysSwitchImport/importExcel',
      },
      dictOptions: {},
      superFieldList: [],
    }
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
  },
  created() {
    this.$nextTick(() => {
      this.$refs.table.$refs.HfSysConfigParams.connect(this.$refs.operatorBtns)
    })
  },
  methods: {
    handleAdd() {
      this.$refs.modalForm.title = '新增参数'
      this.$refs.modalForm.add()
    },
    handleEdit(record) {
      this.$refs.modalForm.title = '编辑参数'
      this.$refs.modalForm.edit(record)
    },
    handleDelete(id) {
      postAction(this.url.delete, { id: id }).then((res) => {
        if (res.code == 200) {
          this.$message.success('删除成功')
          this.refresh()
        }
      })
    },
    refresh(bool = false) {
      this.$refs.table.refresh(bool)
    },
    // 显示详情页方法
    myHandleDetail(record) {
      this.$refs.modalForm.showDetail(record) // 调用HfSysConfigModal中的show方法
      this.$refs.modalForm.title = '详情'
      this.$refs.modalForm.disableSubmit = true
    },
    initDictConfig() {},
    // 导出
    async handleExportXls(name, model) {
      let data = {
        ...this.queryParams,
        ...model,
      }
      let url = this.url.export
      let params = data
      let fileName = name + '.xls'
      await downloadFile(url, fileName, params)
    },
    // 导入
    handleImportExcel() {
      let type = '参数配置'
      let { importExcelUrl } = this.url
      let record = {
        importCode:'SysSwitchImport'
      }
      this.$refs.HFileImport.show(type, importExcelUrl,record)
    },
    downloadChange() {
      this.handleExportXls('参数配置', { type: 'template' })
    },
  },
}
</script>