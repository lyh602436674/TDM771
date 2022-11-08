<!--
 * @Author: 赵峰
 * @Date: 2021-10-27 09:16:41
 * @LastEditTime: 2021-11-30 11:54:24
 * @LastEditors: 马潭龙
 * @Descripttion: 试验检查Table
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\testTemplate\components\TestTemplateTable.vue
-->
<template>
  <div ref="pageWrapper" class="h-custom-layout" style="height: 100%; position: relative">
    <h-card fixed :bordered="true">
      <h-search
        v-model="queryParams"
        slot="search-form"
        size="small"
        :showToggleButton="false"
        :data="searchBar"
        @change="refresh(true)"
      />
      <template slot="title">
        试{{ checkType == 1 ? '前' : checkType == 2 ? '中' : checkType == 3 ? '后' : '' }}检查
      </template>
      <div slot="table-operator" style="border-top: 5px">
        <a-button v-has="hasAdd" type="ghost-primary" size="small" icon="plus" @click="handleAdd">新建</a-button>
        <template>
          <a-button v-has="hasDelete" type="danger" size="small" icon="delete" @click="batchDel">
            批量删除
          </a-button>
        </template>
      </div>
      <h-vex-table
        slot="content"
        ref="TestTemplateTable"
        :scroll="{ x: true }"
        :columns="columns"
        :data="loadData"
        :rowKey="(record) => record.id"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      >
        <span slot="checkName" slot-scope="text, record">
          <a @click="handleDetailCode(record)">
            {{ record.checkName ? record.checkName : '--' }}
          </a>
        </span>
        <span slot="equipCode" slot-scope="text, record">
          <a @click="handleDetail(record)">{{ record.equipCode }}</a>
        </span>
        <template slot="actions" slot-scope="text, record">
          <a-icon type="edit" class="primary-text" @click="() => handleEdit(record)"/>
          <a-divider type="vertical"/>
          <a-icon
            type="eye"
            title="详情"
            class="primary-text"
            style="cursor: pointer"
            @click="() => handleDetail(record)"
          />
          <a-divider type="vertical"/>
          <a-popconfirm title="确认删除" @confirm="() => handleDelete(record.id)">
            <h-icon class="danger-text" type="icon-shanchu"/>
          </a-popconfirm>
        </template>
      </h-vex-table>
    </h-card>
    <test-template-modal ref="testTemplateModal" @change="refresh(true)"></test-template-modal>
    <test-template-detail-modal ref="testTemplateDetailModal" @change="refresh(true)"/>
  </div>
</template>

<script>
import moment from 'moment'
import {postAction} from '@/api/manage'
import TestTemplateModal from '../modules/TestTemplateModal'
import TestTemplateDetailModal from '../modules/TestTemplateDetailModal'
import mixin from '@/views/hifar/mixin.js'

export default {
  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper,
    }
  },
  components: {
    TestTemplateModal,
    TestTemplateDetailModal,
  },
  mixins: [mixin],
  props: {
    checkType: {
      type: String,
      default: 1, //检查类型：1试前检查 2 试中检查 3 试后检查
    },
  },
  data() {
    return {
      moment,
      queryParams: {},
      selectedRowKeys: [],
      selectedRow: [],
      hasAdd: 'beforCheck:add',
      hasDelete: 'beforCheck:delete',
      url: {
        list: '/HfEnvTestCheckBusiness/listPageCheckTemplateAndItem',
        delete: '/HfEnvTestCheckBusiness/logicRemoveCheckTemplateAndItemById',
      },
      searchBar: [
        {
          title: '名称',
          key: 'c_checkName_7',
          formType: 'input',
        },
      ],
      columns: [
        {
          title: '名称',
          align: 'left',
          minWidth: 100,
          dataIndex: 'checkName',
          scopedSlots: {customRender: 'checkName'},
        },
        {
          title: '创建人',
          align: 'left',
          minWidth: 100,
          dataIndex: 'createUserName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '创建时间',
          align: 'left',
          minWidth: 100,
          dataIndex: 'createTime',
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '更新人',
          align: 'left',
          minWidth: 100,
          dataIndex: 'updateUserName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '更新时间',
          align: 'left',
          minWidth: 100,
          dataIndex: 'updateTime',
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '备注',
          minWidth: 100,
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
          scopedSlots: {customRender: 'actions'},
        },
      ],
      loadData: (params) => {
        let data = {
          ...this.queryParams,
          ...params,
          c_checkType_1: this.checkType,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
    }
  },
  watch: {
    checkType: {
      immediate: true,
      handler(val) {
        if (val == 1) {
          this.hasAdd = 'beforCheck:add'
          this.hasDelete = 'beforCheck:delete'
        } else if (val == 2) {
          this.hasAdd = 'inCheck:add'
          this.hasDelete = 'inCheck:delete'
        } else {
          this.hasAdd = 'afterCheck:add'
          this.hasDelete = 'afterCheck:delete'
        }
      }
    }
  },
  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    },
  },
  methods: {
    refresh(bool = true) {
      this.$refs.TestTemplateTable.refresh(bool)
      this.selectedRowKeys = []
      this.selectedRow = []
    },
    onSelectChange(selectedRowKeys, selectedRow) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRow = selectedRow
    },
    handleAdd() {
      const {checkType} = this
      let record = {}
      let title =
        checkType == 1 ? '试前检查添加' : checkType == 2 ? '试中检查添加' : checkType == 3 ? '试后检查添加' : ''
      this.$refs.testTemplateModal.show(record, title, checkType)
    },
    handleEdit(record) {
      const {checkType} = this
      let title =
        checkType == 1 ? '试前检查编辑' : checkType == 2 ? '试中检查编辑' : checkType == 3 ? '试后检查编辑' : ''
      this.$refs.testTemplateModal.show(record, title, checkType)
    },
    handleDetail(record) {
      const {checkType} = this
      let title =
        checkType == 1 ? '试前检查详情' : checkType == 2 ? '试中检查详情' : checkType == 3 ? '试后检查详情' : ''
      this.$refs.testTemplateDetailModal.show(record, title)
    },
    handleDetailCode(record) {
      this.handleDetail(record)
    },
    // 删除
    handleDelete(id) {
      postAction(this.url.delete, {id: id}).then((res) => {
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
  },
}
</script>
<style lang='less' scoped>
</style>