<!--
 * @Author: 赵峰
 * @Date: 2021-09-01 12:03:26
 * @LastEditTime: 2021-11-25 11:07:20
 * @LastEditors: 赵峰
 * @Descripttion: 验收记录
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\equipment\components\AcceptanceRecordTable.vue
-->
<template>
  <h-card fixed :bordered="false">
    <h-search
      v-model="queryParams"
      slot="search-form"
      size="small"
      :showToggleButton="true"
      :data="searchBar"
      @change="refresh(true)"
    />
    <div slot="table-operator" style="border-top: 5px">
      <a-button size="small" @click="handleAdd" type="ghost-primary" icon="plus">添加</a-button>
      <a-button size="small" type="ghost-warning" icon="download" @click="handleExportXls('验收记录')">导出</a-button>
      <a-button size="small" type="ghost-success" icon="import" @click="handleImportExcel">导入</a-button>
      <a-button v-if="hasSelected" type="danger" size="small" icon="delete" @click="batchDel()">批量删除</a-button>
    </div>
    <h-vex-table
      ref="acceptanceRecordTable"
      slot="content"
      :scroll="{ x: true }"
      :columns="columns"
      :data="loadData"
      :rowKey="(record) => record.id"
      :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
    >
    <!-- 验收记录-验收类型-跳转详情 -->
      <span slot="acceptMethod" slot-scope="text,record">
          <a href="javascript:;" @click="handleDetailCode(record)">
            {{ record.acceptMethod? record.acceptMethod:'--' }}
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
    <acceptance-record-modal ref="AcceptanceRecordModal" @change="refresh(true)"></acceptance-record-modal>
    <acceptance-record-detail ref="AcceptanceRecordDetail"></acceptance-record-detail>
    <h-file-import ref="HFileImport" @change="refresh(true)" @downloadExcel="downloadChange" />
  </h-card>
</template>

<script>
import moment from 'moment'
import mixin from '@/views/hifar/mixin.js'
import { downloadFile, postAction } from '@/api/manage'
import AcceptanceRecordModal from '../modules/AcceptanceRecordModal'
import AcceptanceRecordDetail from '../modules/AcceptanceRecordDetail'
export default {
  props: {
    equipId: {
      type: String,
      default: '',
    },
  },
  mixins: [mixin],
  components: {
    AcceptanceRecordModal,
    AcceptanceRecordDetail,
  },
  watch: {
    equipId: {
      immediate: true,
      handler(val) {
        this.equipId = val
        this.paramsData.equipId = val
      },
    },
  },
  data() {
    return {
      moment,
      paramsData: {
        equipId: '',
        importCode:'HfResEquipAcceptImport'
      },
      queryParams: {},
      searchBar: [
        {
          title: '验收类型',
          formType: 'input',
          key: 'c_acceptMethod_7',
        },
        {
          title: '验收人',
          formType: 'input',
          key: 'c_acceptUserName_7',
        },
      ],
      selectedRowKeys: [],
      url: {
        list: '/HfResEquipAcceptBusiness/listPage',
        delete: '/HfResEquipAcceptBusiness/logicRemoveById',
        importExcelUrl: 'HfResEquipAcceptImport/importExcel',
        export: '/HfResEquipAcceptExport/exportExcel',
      },
      columns: [
        {
          title: '验收类型',
          align: 'left',
          dataIndex: 'acceptMethod',
          scopedSlots:{ customRender:'acceptMethod' }
        },
        {
          title: '验收人',
          align: 'left',
          dataIndex: 'acceptUserName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '验收日期',
          align: 'left',
          dataIndex: 'acceptTime',
          customRender: (time) => {
            return time && time != 0 ? moment(parseInt(time)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '操作时间',
          align: 'left',
          dataIndex: 'updateTime',
          customRender: (time) => {
            return time && time != 0 ? moment(parseInt(time)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          width: 140,
          align: 'center',
          scopedSlots: { customRender: 'action' },
        },
      ],
      loadData: (params) => {
        let data = {
          ...this.queryParams,
          ...params,
          equipId: this.equipId,
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
      this.selectedRow = []
      this.$refs.acceptanceRecordTable.refresh(bool)
    },

    // 单个删除
    handleDelete(id) {
      console.log(id)
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
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    handleAdd() {
      let record = {
        equipId: this.equipId,
      }
      this.$refs.AcceptanceRecordModal.show(record, '添加')
    },
    handleEdit(record) {
      this.$refs.AcceptanceRecordModal.show(record, '编辑')
    },
    detailHandle(record) {
      this.$refs.AcceptanceRecordDetail.show(record)
    },
    // 验收记录-验收类型-跳转详情
    handleDetailCode(record){
      this.detailHandle(record)
    },
    // 导出
    async handleExportXls(name,model) {
      let data = {
        ...this.queryParams,
        ...model,
        equipId: this.equipId,
        ids: this.selectedRowKeys.join(','),
      }
      let url = this.url.export
      let params = data
      let fileName = name + '.xls'
      await downloadFile(url, fileName, params)
    },
    // 导入
    handleImportExcel() {
      let type = '验收记录'
      let { importExcelUrl } = this.url
      let record = this.paramsData
      this.$refs.HFileImport.show(type, importExcelUrl, record)
    },
    downloadChange() {
      this.handleExportXls('验收记录', {type:'template'})
    },
  },
}
</script>
<style lang='less' scoped>
</style>