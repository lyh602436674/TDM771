<template>
  <div ref="dictList" style="position: relative; height: 100%; width: 100%">
    <h-card fixed :bordered="true" title="字典管理">
      <h-search
        slot="search-form"
        size="small"
        v-model="queryParam"
        :showToggleButton="true"
        :data="searchBar"
        @change="refresh"
      />
      <div slot="table-operator">
        <a-button v-has="'dictionaries:add'" size="small" @click="handleAdd" type="ghost-primary" icon="plus">添加</a-button>
        <a-button v-has="'dictionaries:derive'" size="small" type="ghost-warning" icon="download" @click="handleExportXls('字典信息')">导出</a-button>
        <!-- <a-upload
        size="small"
        name="file"
        :showUploadList="false"
        :multiple="false"
        :headers="tokenHeader"
        :action="importExcelUrl"
        @change="handleImportExcel"
      >
        <a-button size="small" type="ghost-success" icon="import">导入</a-button>
      </a-upload> -->
        <!-- <a-button size="small" type="success-color" icon="sync" @click="refleshCache">刷新缓存</a-button> -->
        <!-- <a-button size="small" type="ghost-danger" icon="hdd" @click="openDeleteList">回收站</a-button> -->
      </div>

      <h-vex-table
        slot="content"
        ref="table"
        rowKey="id"
        size="small"
        :columns="columns"
        :data="loadData"
        :loading="loading"
      >
        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">
            <a-icon type="edit" />
            编辑
          </a>
          <a-divider type="vertical" />
          <a @click="editDictItem(record)"><a-icon type="setting" /> 字典配置</a>
          <a-divider type="vertical" />
          <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
            <a class="danger-text">
              <h-icon type="icon-shanchu" />
              删除
            </a>
          </a-popconfirm>
        </span>
      </h-vex-table>
    </h-card>
    <dict-modal ref="modalForm" @ok="refresh"></dict-modal>
    <!-- 字典类型 -->
    <dict-item-list ref="dictItemList"></dict-item-list>
    <!-- <dict-delete-list ref="dictDeleteList" @refresh="refresh"></dict-delete-list> -->
  </div>
</template>

<script>
import { filterObj } from '@/utils/util'
import DictModal from './modules/DictModal'
import DictItemList from './DictItemList'
// import DictDeleteList from './DictDeleteList'
import { downloadFile, getAction, postAction } from '@/api/manage'
import { UI_CACHE_DB_DICT_DATA } from '@/store/mutation-types'

export default {
  name: 'DictList',
  provide() {
    return {
      getContainer: () => this.$refs.dictList,
    }
  },
  components: { DictModal, DictItemList /*DictDeleteList*/ },
  data() {
    return {
      description: '这是数据字典页面',
      visible: false,
      loading: false,
      // 查询条件
      queryParam: {},
      searchBar: [
        {
          title: '字典编码',
          key: 'c_dictCode_7',
          formType: 'input',
        },
        {
          title: '字典名称',
          key: 'c_dictName_7',
          formType: 'input',
        },
      ],
      // 表头
      columns: [
        {
          title: '字典名称',
          align: 'left',
          dataIndex: 'dictName',
        },
        {
          title: '字典编号',
          align: 'left',
          dataIndex: 'dictCode',
        },
        {
          title: '描述',
          align: 'left',
          dataIndex: 'dictDesc',
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          width: 240,
          scopedSlots: { customRender: 'action' },
        },
      ],
      selectedRowKeys: [],
      dict: '',
      labelCol: {
        xs: { span: 8 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 16 },
        sm: { span: 19 },
      },
      url: {
        list: '/SysDictClassifyBusiness/listPage',
        delete: '/SysDictClassifyBusiness/logicRemoveById',
        export: '/SysDictClassifyExport/exportExcel',
        importExcelUrl: 'sys/dict/importExcel',
        refleshCache: 'sys/dict/refleshCache',
        queryAllDictItems: 'sys/dict/queryAllDictItems',
      },
      disableMixinCreated: false,
    }
  },
  watch: {
    openKeys(val) {
      console.log('openKeys', val)
    },
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
  },
  methods: {
    refresh(bool = true) {
      if (bool) {
        this.selectedRowKeys = []
      }
      this.$refs.table.refresh(bool)
    },
    loadData(params) {
      let data = {
        ...params,
        ...this.queryParam,
      }
      data = filterObj(data)
      return postAction(this.url.list, data).then((res) => {
        if (res.code == 200) {
          return res.data
        }
      })
    },
    // 添加字典
    handleAdd() {
      this.$refs.modalForm.title = '新建字典'
      this.$refs.modalForm.add()
    },
    // 编辑字典
    handleEdit(record) {
      this.$refs.modalForm.title = '编辑字典'
      this.$refs.modalForm.edit(record)
    },
    // 删除字典
    handleDelete(id) {
      postAction(this.url.delete, { id: id }).then((res) => {
        if (res.code == 200) {
          this.$message.success('删除成功')
          this.refresh(true)
        }
      })
    },
    //取消选择
    cancelDict() {
      this.dict = ''
      this.visible = false
      this.refresh()
    },
    //编辑字典数据
    editDictItem(record) {
      this.$refs.dictItemList.edit(record)
    },
    // 重置字典类型搜索框的内容
    searchReset() {
      var that = this
      that.queryParam.dictName = ''
      that.queryParam.dictCode = ''
      that.refresh()
    },
    openDeleteList() {
      this.$refs.dictDeleteList.show()
    },
    // 导出
    async handleExportXls(name) {
      let data = {
        ...this.queryParam,
      }
      let url = this.url.export
      let params = data
      let fileName = name + '.xls'
      await downloadFile(url, fileName, params)
    },
    refleshCache() {
      // getAction(this.url.refleshCache)
      //   .then((res) => {
      //     if (res.code == 200) {
      //       //重新加载缓存
      //       getAction(this.url.queryAllDictItems).then((res) => {
      //         if (res.data == 200) {
      //           this.$ls.remove(UI_CACHE_DB_DICT_DATA)
      //           this.$ls.set(UI_CACHE_DB_DICT_DATA, res.result, 7 * 24 * 60 * 60 * 1000)
      //         }
      //       })
      //       this.$message.success('刷新缓存完成！')
      //     }
      //   })
      //   .catch((e) => {
      //     this.$message.warn('刷新缓存失败！')
      //     console.log('刷新失败', e)
      //   })
    },
  },
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>