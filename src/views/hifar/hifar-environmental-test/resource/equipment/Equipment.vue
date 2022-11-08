<!--
 * @Author: 赵峰
 * @Date: 2021-08-26 17:05:44
 * @LastEditTime: 2021-11-30 14:22:24
 * @LastEditors: 马潭龙
 * @Descripttion: 设备信息table
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\equipment\Equipment.vue
-->
<template>
  <h-card :bordered="true" fixed>
    <h-search
      slot="search-form"
      v-model="queryParam"
      :data="searchBar"
      :showToggleButton="true"
      size="small"
      @change="refresh"
    />
    <div slot="table-operator" style="border-top: 5px">
      <vxe-toolbar ref="envEquipmentOperator" custom>
        <div slot="buttons">
          <a-button v-has="'device:add'" icon="plus" size="small" type="ghost-primary" @click="handleAdd">添加</a-button>
          <a-button v-has="'device:privice'" icon="download" size="small" type="ghost-warning"
                    @click="handleExportXls('设备信息')">
            导出
          </a-button>
          <a-button v-has="'device:import'" icon="import" size="small" type="ghost-success" @click="handleImportExcel">
            导入
          </a-button>
            <a-button v-has="'device:delete'" icon="delete" size="small" type="danger" @click="batchDel">
              批量删除
            </a-button>
        </div>
      </vxe-toolbar>
    </div>
    <h-vex-table
      ref="diveceInfoTable"
      slot="content"
      :columns="columns"
      :customConfig="{ storage: { visible: true, resizable: true } }"
      :data="deviceInfoLoadData"
      :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      :rowKey="(record) => record.id"
      :scroll="{ x: true }"
      uid="envEquipmentList"
    >
      <!-- 设备编号跳详情 -->
      <span slot="equipCode" slot-scope="text, record">
        <a href="javascript:;" @click="handleDetailCode(record)">
          {{ record.equipCode ? record.equipCode : '--' }}
        </a>
      </span>
      <!-- 购买日期 -->
      <span slot="buyTime" slot-scope="text, record">
        {{
          record.buyTime && record.buyTime != 0 && record.buyTime > 0
            ? moment(parseInt(record.buyTime)).format('YYYY-MM-DD')
            : '--'
        }}
      </span>
      <!-- 检定有效期 -->
      <span slot="checkValid" slot-scope="text, record">
        <span
          v-if="record.checkValid && record.checkValid != 0 && record.checkValid > 0"
          :style="record.checkValid <= moment().add(30, 'days').valueOf() ? 'color:red;' : ''"
        >
          {{ moment(record.checkValid - 0).format('YYYY-MM-DD') }} [{{
            moment().isSame(record.checkValid - 0, 'day') ? '今天' : moment(record.checkValid - 0).fromNow()
          }}到期]
        </span>
        <span v-else>--</span>
      </span>
      <!-- 检定周期 -->
      <span slot="checkPeriod" slot-scope="text, record">
        {{ record.checkPeriod ? record.checkPeriod : '--' }}
        {{
          record.checkPeriod
            ? record.checkUnit == 1
            ? '日'
            : record.checkUnit == 2
              ? '月'
              : record.checkUnit == 3
                ? '年'
                : ''
            : ''
        }}
      </span>
      <!-- 操作 -->
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
          @click="() => detailHandle(record)"
        />
        <a-divider type="vertical"/>
        <a-icon
          class="primary-text"
          style="cursor: pointer"
          title="历史温度"
          type="history"
          @click="() => historyCollection(record)"
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
    <history-temperature ref="historyTemperature"></history-temperature>
    <equipment-detail ref="detailModal"></equipment-detail>
    <equipment-modal ref="equipmentModal" @change="refresh(true)"></equipment-modal>
    <h-file-import ref="HFileImport" @change="refresh(true)" @downloadExcel="downloadChange"/>
  </h-card>
</template>
<script>
import moment from 'moment'
import mixin from '@/views/hifar/mixin.js'
import {downloadFile, postAction} from '@/api/manage'
import EquipmentDetail from './EquipmentDetail.vue'
import EquipmentModal from './EquipmentModal.vue'
import HistoryTemperature from './components/historyTemperature'

export default {
  props: {
    expiryTime: {
      type: String,
      default: '',
    },
  },
  mixins: [mixin],
  components: {HistoryTemperature, EquipmentDetail, EquipmentModal},
  data() {
    return {
      moment,
      url: {
        list: '/HfResEquipBusiness/listPage',
        delete: '/HfResEquipBusiness/logicRemoveById',
        importExcelUrl: 'HfResEquipImport/importExcel',
        export: '/HfResEquipExport/exportExcel',
      },
      queryParam: {},
      selectedRowKeys: [],
      statisticsNum: {},
      searchBar: [
        {
          title: '设备编号',
          formType: 'input',
          key: 'c_equipCode_7',
        },
        {
          title: '设备名称 ',
          formType: 'input',
          key: 'c_equipName_7',
        },
        {
          title: '设备用途',
          key: 'c_equipUse_1',
          formType: 'dict',
          dictCode: 'hf_res_equip_use',
        },
        {
          title: '设备类型',
          formType: 'dict',
          key: 'c_equipTypeCode_1',
          dictCode: 'hf_res_equip_type',
        },
        {
          title: '内部名称',
          formType: 'input',
          key: 'c_innerName_7',
        },
        {
          title: '设备型号',
          formType: 'input',
          key: 'c_equipModel_7',
        },
        {
          title: '资产编号',
          formType: 'input',
          key: 'c_assetsCode_7',
        },
      ],
      // 表头
      columns: [
        {
          title: '设备编号',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'equipCode',
          scopedSlots: {customRender: 'equipCode'},
        },
        {
          title: '设备名称 ',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'equipName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '设备用途',
          align: 'left',
          ellipsis: true,
          minWidth: 80,
          dataIndex: 'equipUse_dictText',
        },
        {
          title: '设备类型',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'equipTypeCode_dictText',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '计量有效期',
          align: 'left',
          ellipsis: true,
          width: 160,
          dataIndex: 'checkValid',
          scopedSlots: {customRender: 'checkValid'},
        },
        {
          title: '计量周期',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'checkPeriod',
          scopedSlots: {customRender: 'checkPeriod'},
        },
        {
          title: '内部名称',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'innerName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '设备型号',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'equipModel',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '资产编号',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'assetsCode',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '购买日期',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'buyTime',
          scopedSlots: {customRender: 'buyTime'},
        },
        {
          title: '出厂编号',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'leaveCode',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '生产厂家',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'factoryName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '责任人',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'managerName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '技术参数',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'technology',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '状态',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'status_dictText',
        },
        {
          title: '排序',
          align: 'left',
          width: 80,
          dataIndex: 'rowSort',
        },
        {
          title: '备注',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'remarks',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          width: 200,
          scopedSlots: {customRender: 'action'},
        },
      ],
      deviceInfoLoadData: (params) => {
        let data = {
          ...this.queryParam,
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
  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    },
  },
  created() {
    this.$nextTick(() => {
      this.$refs.diveceInfoTable.$refs.envEquipmentList.connect(this.$refs.envEquipmentOperator)
    })
  },
  methods: {
    refresh() {
      this.$refs.diveceInfoTable.refresh(true)
      this.selectedRowKeys = []
    },
    // 单个删除
    handleDelete(id) {
      postAction(this.url.delete, {id: id}).then((res) => {
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
      if (_this.selectedRowKeys.length) {
        this.$confirm({
          title: '确认删除',
          content: '删除后不可恢复，确认删除？',
          onOk: function () {
            postAction(_this.url.delete, {id: _this.selectedRowKeys.join()}).then((res) => {
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
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    // 编辑
    handleEdit(record) {
      this.$refs.equipmentModal.show(record, '编辑')
    },
    handleAdd() {
      let record = {}
      this.$refs.equipmentModal.show(record, '添加')
    },
    // 详情
    detailHandle(record) {
      this.detailData = record
      this.$refs.detailModal.show(record)
    },
    // 历史采集温度
    historyCollection(record) {
      this.detailData = record
      this.$refs.historyTemperature.show(record)
    },
    // 设备编号跳详情
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
    handleImportExcel() {
      let type = '设备信息'
      let {importExcelUrl} = this.url
      let record = {
        importCode: 'HfResEquipExport'
      }
      this.$refs.HFileImport.show(type, importExcelUrl, record)
    },
    downloadChange() {
      this.handleExportXls('设备信息', {type: 'template'})
    },
  },
}
</script>