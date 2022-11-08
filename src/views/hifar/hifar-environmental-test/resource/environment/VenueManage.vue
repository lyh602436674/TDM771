<!--
 * @Author: 赵峰
 * @Date: 2021-09-02 09:11:19
 * @LastEditTime: 2021-11-30 14:07:16
 * @LastEditors: 马潭龙
 * @Descripttion: 环境设施----场地管理
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\environment\VenueManage.vue
-->
<template>
  <div ref="pageWrapper" class="h-custom-layout" style="height: 100%; position: relative">
    <h-card fixed :bordered="true">
      <template slot="title"> 场地管理 </template>
      <h-search
        v-model="queryParam"
        slot="search-form"
        size="small"
        :showToggleButton="false"
        :data="searchBar"
        @change="refresh(true)"
      />
      <div slot="table-operator" style="border-top: 5px">
        <a-button v-has="'site:add'" size="small" @click="handleAdd" type="ghost-primary" icon="plus">添加</a-button>
        <a-button v-has="'site:privice'" size="small" type="ghost-warning" icon="download" @click="handleExportXls('场地管理')">导出</a-button>
        <a-button v-has="'site:import'" size="small" type="ghost-success" icon="import" @click="handleImportExcel">导入</a-button>
        <a-button v-has="'site:delete'" type="danger" size="small" icon="delete" @click="batchDel()">批量删除</a-button>
      </div>

      <h-vex-table
        slot="content"
        ref="venueManageTable"
        :scroll="{ x: true }"
        :columns="columns"
        :data="loadData"
        :rowKey="(record) => record.id"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      >
        <!-- 点击场地名称跳转详情 -->
        <span slot="placeName" slot-scope="text, record">
          <a href="javascript:;" @click="handleDetailCode(record)">
            {{ record.placeName ? record.placeName : '--' }}
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
      <venue-manage-modal ref="VenueManageModal" @change="refresh(true)"></venue-manage-modal>
      <venue-manage-detail ref="VenueManageDetail"></venue-manage-detail>
      <h-file-import ref="HFileImport" @change="refresh(true)" @downloadExcel="downloadChange" />
    </h-card>
  </div>
</template>

<script>
import moment from 'moment'
import mixin from '@/views/hifar/mixin.js'
import { downloadFile, postAction } from '@/api/manage'
import VenueManageModal from './modules/VenueManageModal'
import VenueManageDetail from './modules/VenueManageDetail'

export default {
  name: 'VenueManage',
  components: {
    VenueManageModal,
    VenueManageDetail,
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
      selectedRowKeys: [],
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
          title: '场地名称',
          key: 'c_placeName_7',
          formType: 'input',
        },
      ],
      columns: [
        {
          title: '场地名称',
          align: 'left',
          dataIndex: 'placeName',
          scopedSlots: { customRender: 'placeName' },
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
          width: 100,
          align: 'center',
          scopedSlots: { customRender: 'action' },
        },
      ],
      url: {
        list: '/HfResPlaceBusiness/listPage',
        delete: '/HfResPlaceBusiness/logicRemoveById',
        importExcelUrl: 'HfResPlaceImport/importExcel',
        export: '/HfResPlaceExport/exportExcel',
      },
      loadData: (params) => {
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
    }
  },
  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    },
  },
  methods: {
    refresh(bool = true) {
      this.selectedRowKeys = []
      this.$refs.venueManageTable.refresh(bool)
    },
    // 编辑
    handleEdit(record) {
      let title = '编辑'
      this.$refs.VenueManageModal.show(record, title)
    },
    handleAdd() {
      let record = {}
      let title = '添加'
      this.$refs.VenueManageModal.show(record, title)
    },

    // 单个删除
    handleDelete(id) {
      postAction(this.url.delete, { id: id }).then((res) => {
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.refresh(true)
        } else {
          this.$message.error(res.msg)
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
                _this.refresh(true)
                _this.selectedRowKeys = []
              } else {
                _this.$message.error(res.msg)
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
    // 详情
    detailHandle(record) {
      this.$refs.VenueManageDetail.show(record)
    },
    // 点击场地名称跳转详情
    handleDetailCode(record) {
      this.detailHandle(record)
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
    handleImportExcel(info) {
      let type = '场地管理'
      let { importExcelUrl } = this.url
      let record = {
        importCode:'HfResPlaceImport'
      }
      this.$refs.HFileImport.show(type, importExcelUrl, record)
    },
    downloadChange() {
      this.handleExportXls('场地管理', { type: 'template' })
    },
  },
}
</script>