<!--
 * @Author: 赵峰
 * @Date: 2021-08-02 14:23:46
 * @LastEditTime: 2021-11-30 14:44:12
 * @LastEditors: 马潭龙
 * @Descripttion: 耗材管理
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\material\material.vue
-->
<template>
  <div ref="pageWrapper" class="h-custom-layout" style="height: 100%; position: relative">
    <h-card fixed :bordered="true">
      <template slot="title"> 耗材管理 </template>
      <h-search
        v-model="queryParam"
        slot="search-form"
        size="small"
        :showToggleButton="true"
        :data="searchBar"
        @change="searchQuery"
      />
      <div slot="table-operator" style="border-top: 5px">
        <a-button v-has="'consumable:add'" size="small" @click="handleAdd" type="ghost-primary" icon="plus">添加</a-button>
        <a-button v-has="'consumable:privice'" size="small" type="ghost-warning" icon="download" @click="handleExportXls('耗材管理')">导出</a-button>
        <a-button v-has="'consumable:import'" size="small" type="ghost-success" icon="import" @click="handleImportExcel">导入</a-button>
        <a-button v-has="'consumable:delete'" type="danger" size="small" icon="delete" @click="batchDel()">批量删除</a-button>
      </div>

      <h-vex-table
        slot="content"
        ref="materialTable"
        :scroll="{ x: true }"
        :columns="columns"
        :data="loadData"
        :rowKey="(record) => record.id"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      >
        <span slot="materialCode" slot-scope="text,record">
          <a href="javascript:;" @click="handleDetailCode(record)">
            {{ record.materialCode? record.materialCode:'--' }}
          </a>
        </span>
        <span slot="period" slot-scope="text, record">
          {{ record.period && record.period != 0 ? record.period + '个月' : '--' }}
        </span>
        <div slot="quantity" slot-scope="text, record">
          <a-tooltip v-if="Number(record.quantity) < Number(record.quantityMax)" placement="right" title="库存低于下限">
            <span style="color: red; margin-right: 4px">{{ record.quantity }}</span>
            <a-icon type="arrow-up" class="danger-text" />
          </a-tooltip>
          <a-tooltip
            v-else-if="Number(record.quantity) > Number(record.quantityMin)"
            placement="right"
            title="库存高于上限"
          >
            <span style="color: red; margin-right: 4px">{{ record.quantity }}</span>
            <a-icon type="arrow-down" class="danger-text" />
          </a-tooltip>
          <span v-else>{{ record.quantity }}</span>
        </div>
        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">更多<a-icon type="down" /> </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a @click="handleDetail(record)">详情</a>
              </a-menu-item>
              <a-menu-item>
                <a @click="handleEntrant(record)">入库</a>
              </a-menu-item>
              <a-menu-item>
                <a @click="handleGoout(record)">出库</a>
              </a-menu-item>
              <a-menu-item>
                <a @click="handleCirculationRecord(record)">流转记录</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a style="color: #ff4d4f">删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
      </h-vex-table>
      <material-detail ref="MaterialDetail"></material-detail>
      <material-modal ref="MaterialModal" @change="searchQuery"></material-modal>
      <material-libiary ref="MaterialLibiary" @change="searchQuery"></material-libiary>
      <material-libiary-record ref="MaterialLibiaryRecord" :materialId="materialId"></material-libiary-record>
      <h-file-import ref="HFileImport" @change="searchQuery(true)" @downloadExcel="downloadChange" />
    </h-card>
  </div>
</template>

<script>
import moment from 'moment'
import mixin from '@/views/hifar/mixin.js'
import { downloadFile, postAction } from '@/api/manage'
import MaterialModal from './modules/MaterialModal'
import MaterialDetail from './modules/MaterialDetail'
import MaterialLibiary from './modules/MaterialLibiary'
import MaterialLibiaryRecord from './modules/MaterialLibiaryRecord'
export default {
  mixins: [mixin],
  components: {
    MaterialModal,
    MaterialDetail,
    MaterialLibiary,
    MaterialLibiaryRecord,
  },

  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper,
    }
  },
  data() {
    return {
      moment,
      queryParam: {},
      selectedRowKeys: [],
      materialId: '',
      url: {
        list: '/HfResMaterialBusiness/listPage',
        delete: '/HfResMaterialBusiness/logicRemoveById',
        importExcelUrl: 'HfResMaterialImport/importExcel',
        export: '/HfResMaterialExport/exportExcelHfResMaterial',
      },
      loadData: (params) => {
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
      searchBar: [
        {
          title: '材料名称',
          key: 'c_materialName_7',
          formType: 'input',
        },
        {
          title: '类别',
          key: 'c_materialType_7',
          formType: 'input',
        },
        {
          title: '规格型号',
          key: 'c_materialSpecs_7',
          formType: 'input',
        },
        {
          title: '品牌',
          key: 'c_materialBrand_7',
          formType: 'input',
        },
        {
          title: '计量单位',
          key: 'c_materialUnit_7',
          formType: 'input',
        },
        {
          title: '采购来源',
          key: 'c_buySource_7',
          formType: 'input',
        },
        {
          title: '生产厂家',
          key: 'c_factoryName_7',
          formType: 'input',
        },
        {
          title: '存储位置',
          key: 'c_location_7',
          formType: 'input',
        },
      ],
      // 表头
      columns: [
        {
          title: '编号',
          align: 'left',
          dataIndex: 'materialCode',
          scopedSlots:{ customRender:'materialCode' }
        },
        {
          title: '名称',
          align: 'left',
          dataIndex: 'materialName',
        },
        {
          title: '类别',
          align: 'left',
          dataIndex: 'materialType',
        },
        {
          title: '规格型号 ',
          align: 'left',
          dataIndex: 'materialSpecs',
        },
        {
          title: '品牌 ',
          align: 'left',
          dataIndex: 'materialBrand',
        },
        {
          title: '计量单位 ',
          align: 'left',
          dataIndex: 'materialUnit',
        },
        {
          title: '库存量 ',
          align: 'left',
          dataIndex: 'quantity',
          scopedSlots: { customRender: 'quantity' },
        },
        {
          title: '采购来源 ',
          align: 'left',
          dataIndex: 'buySource',
        },
        {
          title: '生产厂家 ',
          align: 'left',
          dataIndex: 'factoryName',
        },
        {
          title: '保质期 ',
          align: 'left',
          dataIndex: 'period',
          scopedSlots: { customRender: 'period' },
        },
        {
          title: '存储位置 ',
          align: 'left',
          dataIndex: 'location',
        },
        {
          title: '操作',
          width: '120',
          dataIndex: 'action',
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
  },

  created() {},
  mounted() {},

  methods: {
    searchQuery() {
      this.$refs.materialTable.refresh(true)
      this.selectedRowKeys = []
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
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
    // 添加
    handleAdd() {
      let record = {}
      this.$refs.MaterialModal.show(record, '添加')
    },
    // 编辑
    handleEdit(record) {
      this.$refs.MaterialModal.show(record, '编辑')
    },
    // 详情
    handleDetail(record) {
      this.$refs.MaterialDetail.show(record)
    },
    handleDetailCode(record){
      this.handleDetail(record)
    },
    // 入库
    handleEntrant(record) {
      this.$refs.MaterialLibiary.show(record, '入库')
    },
    // 出库
    handleGoout(record) {
      this.$refs.MaterialLibiary.show(record, '出库')
    },
    // 流转记录
    handleCirculationRecord(record) {
      this.materialId = record.id
      this.$refs.MaterialLibiaryRecord.visible = true
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
      let type = '耗材管理'
      let { importExcelUrl } = this.url
      let record = {
        importCode:'HfResMaterialImport'
      }
      this.$refs.HFileImport.show(type, importExcelUrl, record)
    },
    downloadChange() {
      this.handleExportXls('耗材管理', { type: 'template' })
    },
  },
}
</script>
<style lang='less' scoped>
@import '~@assets/less/common.less';
</style>