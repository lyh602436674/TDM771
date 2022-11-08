<!--
 * @Author: 王洋
 * @Date: 2022年6月1日15:44:00
 * @LastEditTime: 2022年6月1日15:44:07
 * @LastEditors: 王洋
 * @Descripttion: 工装管理table
 * @FilePath: /hifar-platform-client/src/views/hifar/hifar-environmental-test/tools/ToolsProductList
-->
<template>
  <h-card :bordered='true' fixed>
    <h-search
      slot='search-form'
      v-model='queryParam'
      :data='searchBar'
      :showToggleButton='true'
      size='small'
      @change='refresh'
    />
    <div slot='table-operator' style='border-top: 5px'>
      <vxe-toolbar ref='envEquipmentOperator' custom>
        <div slot='buttons'>
          <a-button v-has="'device:add'" icon='plus' size='small' type='ghost-primary' @click='handleAdd'>添加</a-button>
          <a-button v-has="'device:privice'" icon='download' size='small' type='ghost-warning'
                    @click="handleExportXls('工装信息')">
            导出
          </a-button>
          <a-button v-has="'device:import'" icon='import' size='small' type='ghost-success' @click='handleImportExcel'>
            导入
          </a-button>
          <a-button icon='download' size='small' type='ghost-success' @click='handleTagDownload'>
            标签下载
          </a-button>
          <!--          <a-button icon='logout' size='small' type='ghost-primary' @click='handleBorrow'>-->
          <!--            借用-->
          <!--          </a-button>-->
          <!--          <a-button icon='login' size='small' type='ghost-primary' @click='handleReturn'>-->
          <!--            归还-->
          <!--          </a-button>-->
          <!--          <a-button icon='bar-chart' size='small' type='primary' @click='handleStatistics1'>-->
          <!--            统计1-->
          <!--          </a-button>-->
          <!--          <a-button icon='bar-chart' size='small' type='primary' @click='handleStatistics2'>-->
          <!--            统计2-->
          <!--          </a-button>-->
          <template>
            <a-button v-has="'device:delete'" icon='delete' size='small' type='danger' @click='batchDel'>
              批量删除
            </a-button>
          </template>
        </div>
      </vxe-toolbar>
    </div>
    <h-vex-table
      ref='diveceInfoTable'
      slot='content'
      :columns='columns'
      :customConfig='{ storage: { visible: true, resizable: true } }'
      :data='deviceInfoLoadData'
      :row-selection='{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }'
      :rowKey='(record) => record.id'
      :scroll='{ x: true }'
      uid='envEquipmentList'
    >
      <span slot='countBorrow' slot-scope='text, record'>
        <a href='javascript:;' @click='countBorrowDetails(record)'>
          {{ record.countBorrow }}
        </a>
      </span>
      <span slot='toolsCode' slot-scope='text, record'>
        <a href='javascript:;' @click='detailHandle(record)'>
          {{ record.toolsCode ? record.toolsCode : '--' }}
        </a>
      </span>
      <!-- 借用日期 -->
      <span slot='borrowDate' slot-scope='text, record'>
        {{
          record.borrowDate && record.borrowDate !== 0 && record.borrowDate > 0
            ? moment(parseInt(record.borrowDate)).format('YYYY-MM-DD')
            : '--'
        }}
      </span>
      <!-- 检定日期 -->
      <span slot='verificationDate' slot-scope='text, record'>
        {{
          record.verificationDate && record.verificationDate !== 0 && record.verificationDate > 0
            ? moment(parseInt(record.verificationDate)).format('YYYY-MM-DD')
            : '--'
        }}
      </span>
      <!-- 启用日期 -->
      <span slot='activeDate' slot-scope='text, record'>
        {{
          record.activeDate && record.activeDate !== 0 && record.activeDate > 0
            ? moment(parseInt(record.activeDate)).format('YYYY-MM-DD')
            : '--'
        }}
      </span>
      <!-- 操作 -->
      <span slot='action' slot-scope='text, record'>
        <a-icon
          class='primary-text'
          style='cursor: pointer'
          title='编辑'
          type='edit'
          @click='() => handleEdit(record)'
        />
                <a-divider type='vertical'/>
                <a-icon
                  class='primary-text'
                  style='cursor: pointer'
                  title='详情'
                  type='eye'
                  @click='() => detailHandle(record)'
                />
        <a-divider type='vertical'/>
        <a-popconfirm title='确定删除吗?' @confirm='() => handleDelete(record.id)'>
          <a-icon
            class='primary-text'
            style='cursor: pointer'
            theme='twoTone'
            title='删除'
            two-tone-color='#ff4d4f'
            type='delete'
          />
        </a-popconfirm>
      </span>
    </h-vex-table>
    <tool-product-model ref='toolProductModel' @change='refresh(true)'></tool-product-model>
    <tools-product-borrow-list-model ref='borrowListModel'></tools-product-borrow-list-model>
    <tools-product-detail ref='detailModal'></tools-product-detail>
    <tools-products-borrow-model ref='toolProductBorrowModel' @change='refresh(true)'/>
    <tools-products-statistics-model ref='toolProductStatisticsModel' @change='refresh(true)'/>
    <h-file-import ref='HFileImport' @change='refresh(true)' @downloadExcel='downloadChange'/>
  </h-card>


</template>

<script>
import moment from 'moment'
import mixin from '@views/hifar/mixin.js'
import {downloadFile, postAction} from '@api/manage'
import ToolProductModel from '@views/hifar/hifar-environmental-test/tools/modules/ToolProductModel'
import ToolsProductsBorrowModel from '@views/hifar/hifar-environmental-test/tools/modules/ToolsProductsBorrowModel'
import ToolsProductsStatisticsModel
  from '@views/hifar/hifar-environmental-test/tools/modules/ToolsProductsStatisticsModel'
import ToolsProductDetail from '@views/hifar/hifar-environmental-test/tools/modules/ToolsProductDetail'
import ToolsProductBorrowListModel
  from '@views/hifar/hifar-environmental-test/tools/modules/toolsProductBorrowListModel'

export default {
  name: 'ToolsProductList',
  props: {
    expiryTime: {
      type: String,
      default: ''
    }
  },
  mixins: [mixin],
  components: {
    ToolsProductBorrowListModel,
    ToolsProductDetail,
    ToolProductModel,
    ToolsProductsBorrowModel,
    ToolsProductsStatisticsModel

  },

  data() {
    return {
      moment,
      url: {
        list: '/HfToolsProducts/listAll',
        delete: '/HfToolsProducts/logicRemoveById',
        importExcelUrl: 'HfToolsProductsImport/importExcel',
        export: '/HfToolsProducts/exportExcel',
        downLoadPrintQRCode: '/HfToolsProducts/downLoadPrintQRCode',
      },
      queryParam: {},
      selectedRowKeys: [],
      searchBar: [
        {
          title: '工装编号',
          formType: 'input',
          key: 'c_toolsCode_7'
        },
        {
          title: '工装名称',
          formType: 'input',
          key: 'c_toolsName_7'
        },
        {
          title: '责任部门',
          formType: 'input',
          key: 'c_deptName_7'
        },
        {
          title: '责任人',
          formType: 'input',
          key: 'c_personName_7'
        },
        {
          title: '存放地点',
          formType: 'input',
          key: 'c_location_7'
        },
        {
          title: '在库状态',
          formType: 'dict',
          key: 'c_larbaryStatus_1',
          dictCode: 'larbary_status'
        },
        {
          title: '设备状态',
          formType: 'dict',
          key: 'c_toolsStatus_1',
          dictCode: 'tools_status'
        }
      ],
      // 表头
      columns: [
        // {
        //   title: '借用记录',
        //   align: 'center',
        //   width: 120,
        //   dataIndex: 'countBorrow',
        //   scopedSlots: {customRender: 'countBorrow'}
        // },
        {
          title: '工装编号',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'toolsCode',
          scopedSlots: {customRender: 'toolsCode'}
        },
        {
          title: '工装名称',
          align: 'left',
          width: 120,
          dataIndex: 'toolsName'
        },
        {
          title: '工装规格',
          align: 'left',
          width: 120,
          dataIndex: 'toolsSize'
        },
        {
          title: '借用部门',
          dataIndex: 'borrwoDeptName',
          align: 'left',
          width: 120
        },
        {
          title: '借用人',
          dataIndex: 'borrowPersonName',
          align: 'left',
          width: 120
        },
        {
          title: '借用日期',
          dataIndex: 'borrowDate',
          align: 'left',
          width: 120,
          scopedSlots: {customRender: 'borrowDate'}
        },
        {
          title: '检定日期',
          dataIndex: 'verificationDate',
          align: 'left',
          width: 120,
          scopedSlots: {customRender: 'verificationDate'}
        },
        {
          title: '在库状态',
          dataIndex: 'larbaryStatus_dictText',
          align: 'left',
          width: 120,
        },
        {
          title: '存放地点',
          dataIndex: 'location',
          align: 'left',
          width: 120
        },
        {
          title: '责任部门',
          dataIndex: 'deptName',
          align: 'left',
          width: 120

        },
        {
          title: '责任人',
          dataIndex: 'person',
          align: 'left',
          width: 120
        },
        {
          title: '生产厂家',
          dataIndex: 'factory',
          align: 'left',
          width: 120
        },
        {
          title: '启用日期',
          dataIndex: 'activeDate',
          align: 'left',
          width: 120,
          scopedSlots: {customRender: 'activeDate'}
        },
        {
          title: '设备状态',
          dataIndex: 'toolsStatus_dictText',
          align: 'left',
          width: 120,
        },
        {
          title: '工装分类',
          dataIndex: 'classify_dictText',
          align: 'left',
          width: 120,
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          width: 120,
          scopedSlots: {customRender: 'action'}
        }


      ],
      deviceInfoLoadData: (params) => {
        let data = {
          ...this.queryParam,
          ...params,
          searchType: this.expiryTime
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            let statisticsNum = res.ext
            this.$emit('change', statisticsNum)
            return res.data
          }
        })
      }
    }
  },
  watch: {
    expiryTime: {
      immediate: true,
      handler(val) {
        this.expiryTime = val
      }
    }
  },
  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    }
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
          }
        })
      } else {
        this.openNotificationWithIcon('error', '删除提示', '请至少选择一项')
      }
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    detailHandle(record) {
      this.detailData = record
      this.$refs.detailModal.show(record)
    },
    countBorrowDetails(record) {
      this.$refs.borrowListModel.show(record, '借用记录')
    },
    handleEdit(record) {
      this.$refs.toolProductModel.show(record, '编辑')
    },
    handleAdd() {
      let record = {}
      this.$refs.toolProductModel.show(record, '添加')
    },
    // 导出
    async handleExportXls(name, model) {
      let data = {
        ...this.queryParam,
        ...model,
        ids: this.selectedRowKeys.join(',')
      }
      let url = this.url.export
      let params = data
      let fileName = name + '.xls'
      await downloadFile(url, fileName, params)
    },
    handleImportExcel() {
      let type = '工装信息'
      let {importExcelUrl} = this.url
      let record = {
        importCode: 'HfToolsProductsImport'
      }
      this.$refs.HFileImport.show(type, importExcelUrl, record)
    },
    handleTagDownload() {
      // this.$message.info('标签下载')
      if (this.selectedRowKeys.length === 0) {
        this.$message.info('请至少选择一条记录!')
        return
      }
      let params = {ids: this.selectedRowKeys.join(',')}
      downloadFile(this.url.downLoadPrintQRCode, '工装标签.pdf', params)
    },
    handleBorrow() {
      this.$refs.toolProductBorrowModel.show('borrow')
    },
    handleReturn() {
      this.$refs.toolProductBorrowModel.show('return')
    },
    handleStatistics1() {
      this.$refs.toolProductStatisticsModel.show('1')
    },
    handleStatistics2() {
      this.$refs.toolProductStatisticsModel.show('2')
    },
    downloadChange() {
      this.handleExportXls('工装管理', {type: 'template'})
    }

  }
}
</script>

<style scoped>

</style>