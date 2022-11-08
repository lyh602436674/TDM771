<!--
 * @Author: 赵峰
 * @Date: 2021-10-25 16:22:13
 * @LastEditTime: 2021-11-30 14:41:33
 * @LastEditors: 马潭龙
 * @Descripttion: 传感器管理-table
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\equipmentManage\SensorManagement.vue
-->
<template>
  <h-card fixed :bordered="true" style="height: 95.8%">
    <h-search
      v-model="queryParams"
      slot="search-form"
      size="small"
      :showToggleButton="true"
      :data="searchBar"
      @change="refresh(true)"
    />
    <div slot="table-operator" style="border-top: 5px">
      <a-button v-has="'sensorlist:add'" type="ghost-primary" size="small" icon="plus" @click="handleAdd">新建</a-button>
<!--      <a-button v-has="'sensorlist:export'" icon="download" size="small" type="ghost-warning"-->
<!--                @click="handleExportXls('传感器信息')">-->
<!--        导出-->
<!--      </a-button>-->
<!--      <a-button v-has="'sensorlist:import'" icon="import" size="small" type="ghost-success" @click="handleImportExcel">-->
<!--        导入-->
<!--      </a-button>-->
      <a-button v-has="'sensorlist:delete'" icon="delete" size="small" type="danger" @click="batchDel">
        批量删除
      </a-button>
    </div>
    <h-vex-table
      ref="sensorManagementTable"
      slot="content"
      :scroll="{ x: true }"
      :columns="columns"
      :data="loadData"
      :rowKey="(record) => record.id"
      :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
    >
      <span slot="equipCode" slot-scope="text, record">
        <a @click="handleDetail(record)">{{ record.equipCode }}</a>
      </span>
      <!-- 检定有效期 -->
      <span slot="checkValid" slot-scope="text, record">
        <span
          v-if="record.checkValid && record.checkValid != 0"
          :style="record.checkValid <= moment().add(30, 'days').valueOf() ? 'color:red;' : ''"
        >
          {{ moment(record.checkValid - 0).format('YYYY-MM-DD') }} [{{
            moment().isSame(record.checkValid - 0, 'day') ? '今天' : moment(record.checkValid - 0).fromNow()
          }}到期]
        </span>
        <span v-else>--</span>
      </span>
      <template slot="actions" slot-scope="text, record">
        <a-icon type="edit" class="primary-text" @click="() => handleEdit(record)" />
        <a-divider type="vertical" />
        <a-icon
          type="eye"
          title="详情"
          class="primary-text"
          style="cursor: pointer"
          @click="() => handleDetail(record)"
        />
        <a-divider type="vertical" />
        <a-popconfirm title="确认删除" @confirm="() => handleDelete(record.id)">
          <h-icon class="danger-text" type="icon-shanchu" />
        </a-popconfirm>
      </template>
    </h-vex-table>
    <sensor-management-modal ref="SensorManagementModal" @change="refresh(true)"></sensor-management-modal>
    <sensor-management-detail ref="SensorManagementDetail" @change="refresh(true)" />
    <h-file-import ref="HFileImport" @change="refresh(true)" @downloadExcel="downloadChange"/>
  </h-card>
</template>

<script>
import moment from 'moment'
import {downloadFile, postAction} from '@/api/manage'
import SensorManagementModal from './modules/SensorManagementModal'
import SensorManagementDetail from './modules/SensorManagementDetail'
import mixin from '@/views/hifar/mixin.js'

export default {
  props: {
    expiryTime: {
      type: String,
      default: '',
    },
  },
  components: {
    SensorManagementModal,
    SensorManagementDetail,
  },
  mixins:[mixin],
  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    },
  },
  data() {
    return {
      moment,
      queryParams: {},
      searchBar: [
        {
          title: '设备编号',
          key: 'c_equipCode_7',
          formType: 'input',
        },
        {
          title: '设备名称',
          key: 'c_equipName_7',
          formType: 'input',
        },
        {
          title: '内部名称',
          key: 'c_innerName_7',
          formType: 'input',
        },
        {
          title: '设备型号',
          key: 'c_equipModel_7',
          formType: 'input',
        },
        {
          title: '资产编号',
          key: 'c_assetsCode_7',
          formType: 'input',
        },
        {
          title: '生产厂家',
          key: 'c_factoryName_7',
          formType: 'input',
        },
      ],
      columns: [
        {
          title: '设备编号',
          align: 'left',
          width: 100,
          dataIndex: 'equipCode',
          scopedSlots: { customRender: 'equipCode' },
        },
        {
          title: '设备名称',
          align: 'left',
          minWidth: 100,
          dataIndex: 'equipName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '内部名称',
          minWidth: 100,
          align: 'left',
          dataIndex: 'innerName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '设备型号',
          align: 'left',
          minWidth: 100,
          dataIndex: 'equipModel',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '资产编号',
          align: 'left',
          minWidth: 100,
          dataIndex: 'assetsCode',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '检定日期',
          minWidth: 100,
          dataIndex: 'checkTime',
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD') : '--'
          },
        },
        {
          title: '检定有限期',
          minWidth: 160,
          dataIndex: 'checkValid',
          scopedSlots: { customRender: 'checkValid' },
        },
        {
          title: '购买日期',
          align: 'left',
          minWidth: 100,
          dataIndex: 'buyTime',
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD') : '--'
          },
        },
        {
          title: '生产厂家',
          align: 'left',
          minWidth: 100,
          dataIndex: 'factoryName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '检定编号',
          minWidth: 100,
          dataIndex: 'checkCode',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '技术参数',
          minWidth: 140,
          dataIndex: 'technologyParam',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '备注',
          minWidth: 120,
          dataIndex: 'remarks',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '操作',
          dataIndex: 'actions',
          fixed: 'right',
          width: 100,
          align: 'center',
          scopedSlots: { customRender: 'actions' },
        },
      ],
      selectedRowKeys: [],
      selectedRow: [],
      url: {
        list: '/HfResSensorBusiness/listPageBySearchType',
        delete: '/HfResSensorBusiness/logicRemoveById',
        importExcelUrl: "",
        export: "",
      },
      loadData: (params) => {
        let data = {
          ...this.queryParams,
          ...params,
          searchType: this.expiryTime,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            let statisticsNum = res.ext
            this.$emit('change', statisticsNum)
            return res.data
          }
        })
      },
    }
  },
  watch: {
    expiryTime: {
      immediate: true,
      handler(val) {
        this.expiryTime = val
      },
    },
  },
  methods: {
    refresh(bool = true) {
      this.$refs.sensorManagementTable.refresh(bool)
      this.selectedRowKeys = []
      this.selectedRow = []
    },
    onSelectChange(selectedRowKeys, selectedRow) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRow = selectedRow
    },
    handleAdd() {
      let record = {}
      let title = '新增'
      this.$refs.SensorManagementModal.show(record, title)
    },
    handleEdit(record) {
      let title = '编辑'
      this.$refs.SensorManagementModal.show(record, title)
    },
    // 删除
    handleDelete(id) {
      postAction(this.url.delete, { id: id }).then((res) => {
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.refresh(true)
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
          content: '删除后不可恢复，确认删除？',
          onOk: function () {
            postAction(_this.url.delete, { id: _this.selectedRowKeys.join() }).then((res) => {
              if (res.code === 200) {
                _this.$message.success('删除成功')
                _this.refresh()
                _this.selectedRowKeys = []
                _this.selectedRows = []
              } else {
                _this.$message.warning(res.msg)
              }
            })
          },
        })
      } else {
        this.openNotificationWithIcon('error', '删除提示', '请至少选择一项')
      }
    },
    handleDetail(record) {
      this.$refs.SensorManagementDetail.show(record)
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
      let type = '传感器信息'
      let {importExcelUrl} = this.url
      let record = {
        importCode: 'HfResSensorExport'
      }
      this.$refs.HFileImport.show(type, importExcelUrl, record)
    },
    downloadChange() {
      this.handleExportXls('传感器信息', {type: 'template'})
    },
  },
}
</script>
<style lang='less' scoped>
</style>