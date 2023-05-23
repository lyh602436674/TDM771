<!--
 * @Author: 雷宇航
 * @Date: 2023-01-13 14:00:00
 * @fileName: AlarmInfoTable.vue
 * @FilePath: tdm771-client\src\views\hifar\hifar-environmental-test\resource\equipment\components\AlarmInfoTable.vue
 * @Description: 设备台账-报警信息（数据来源于采集库，也可以自行新增）
-->
<template>
  <h-card ref="pageWrapper" :bordered="false" fixed>
    <h-search
      slot="search-form"
      v-model="queryParams"
      :data="columns.filter(_ => _.search !== false)"
      :showToggleButton="false"
      size="small"
      @change="refresh(true)"
    />
    <div slot="table-operator" style="border-top: 5px">
      <a-button icon="plus" size="small" type="ghost-primary" @click="handleAdd">新增</a-button>
      <a-button icon="download" size="small" type="ghost-warning" @click="handleExportXls('报警记录')">导出</a-button>
      <a-button icon="import" size="small" type="ghost-success" @click="handleImportExcel"> 导入</a-button>
      <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(selectedRowKeys.toString())">
        <a-button v-if="selectedRowKeys.length" icon="delete" size="small" type="danger">批量删除
        </a-button>
      </a-popconfirm>

    </div>
    <h-vex-table
      ref="alarmInfoTable"
      slot="content"
      :columns="columns"
      :data="loadData"
      :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
      :rowKey="(record) => record.id"
    >
      <span slot="action" slot-scope="text, record">
        <a-icon
          class="primary-text"
          style="cursor: pointer"
          title="编辑"
          type="edit"
          @click="() => handleEdit(record)"
        />
        <a-divider type="vertical"/>
        <a-icon
          class="primary-text"
          style="cursor: pointer"
          title="详情"
          type="eye"
          @click="() => handleDetail(record)"
        />
        <a-divider type="vertical"/>
        <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
          <a-icon
            class="primary-text"
            style="cursor: pointer"
            theme="twoTone"
            title="删除"
            two-tone-color="#ff4d4f"
            type="delete"
          />
        </a-popconfirm>
      </span>
    </h-vex-table>
    <h-file-import ref="HFileImport" @change="refresh(true)" @downloadExcel="downloadChange"/>
    <alarm-info-modal ref="alarmInfoModal" :equipId="equipId" @change="refresh(true)"></alarm-info-modal>
  </h-card>
</template>

<script>
import moment from "moment";
import {downloadFile, postAction} from "@api/manage";
import AlarmInfoModal from "@views/hifar/hifar-environmental-test/resource/equipment/modules/AlarmInfoModal";

export default {
  name: "AlarmInfoTable",
  components: {AlarmInfoModal},
  props: {
    equipId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      moment,
      queryParams: {},
      selectedRowKeys: [],
      selectedRows: [],
      url: {
        list: '/HfResDeviceWarningBusiness/listPage',
        delete: '/HfResDeviceWarningBusiness/logicRemoveById',
        importExcelUrl: 'HfResDeviceWarningBusiness/importExcel',
        export: '/HfResDeviceWarningBusiness/exportExcel',
      },
      columns: [
        {
          title: '报警内容',
          align: 'left',
          dataIndex: 'contentWarning',
          key: 'c_contentWarning_7',
          formType: 'input'
        },
        {
          title: '报警时间',
          align: 'center',
          width: 200,
          dataIndex: 'warningTime',
          key: 'c_warningTime_1',
          formType: "dateRangePick",
          showTime: true,
          customRender: (time) => {
            return time && +time !== 0 ? moment(+time).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '备注',
          align: 'left',
          dataIndex: 'remarks',
          key: 'c_remarks_7',
          formType: "input",
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          search: false,
          width: 140,
          align: 'center',
          scopedSlots: {customRender: 'action'},
        },
      ],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
          equipId: this.equipId,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code === 200) {
            return res.data
          }
        })
      },
    }
  },
  methods: {
    refresh(bool = true) {
      this.$refs.alarmInfoTable.refresh(bool)
      this.selectedRowKeys = []
      this.selectedRows = []
    },
    handleAdd() {
      this.$refs.alarmInfoModal.show({}, 'add')
    },
    handleEdit(record) {
      this.$refs.alarmInfoModal.show(record, 'edit')
    },
    handleDetail(record) {
      this.$refs.alarmInfoModal.show(record, 'detail')
    },
    handleDelete(id) {
      postAction(this.url.delete, {id}).then((res) => {
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.refresh(true)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    // 导出
    async handleExportXls(name, model) {
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
      let type = '报警信息'
      let {importExcelUrl} = this.url
      let record = {
        equipId: this.equipId,
        importCode:'HfResEquipWarningImport'
      }
      this.$refs.HFileImport.show(type, importExcelUrl, record)
    },
    downloadChange() {
      this.handleExportXls('报警信息', {type: 'template'})
    },
  }
}
</script>

<style scoped>

</style>