<!--
 * @Author: 赵峰
 * @Date: 2021-08-05 10:57:32
 * @LastEditTime: 2021-11-30 14:01:48
 * @LastEditors: 马潭龙
 * @Descripttion: 人员档案
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\user\UserFile.vue
-->
<template>
  <div ref="pageWrapper" style="height: 100%; position: relative">
    <h-card fixed :bordered="true">
      <template slot="title"> 人员档案 </template>
      <h-search
        v-model="queryParams"
        slot="search-form"
        size="small"
        :showToggleButton="true"
        :data="searchBar"
        @change="refresh"
      />
      <div slot="table-operator" style="border-top: 5px">
        <a-button v-has="'PersonnelFile:add'" size="small" @click="handleAdd" type="ghost-primary" icon="plus">添加</a-button>
        <a-button v-has="'PersonnelFile:derive'" size="small" type="ghost-warning" icon="download" @click="handleExportXls('人员档案')">导出</a-button>
        <a-button v-has="'PersonnelFile:import'" size="small" type="ghost-success" icon="import" @click="handleImportExcel">导入</a-button>
        <template>
          <a-button v-has="'personnelFile:delete'" type="danger" size="small" icon="delete" @click="batchDel">
            批量删除
          </a-button>
        </template>
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
        <!-- 点击姓名跳转详情 -->
        <span slot="idName" slot-scope="text, record">
          <a href="javascript:;" @click="handleDetailCode(record)">
            {{ record.idName ? record.idName : '--' }}
          </a>
        </span>
        <!-- 性别 -->
        <span slot="sex" slot-scope="text, record">
          {{ record.sex | sexFilter }}
        </span>
        <!-- 状态 -->
        <span slot="status" slot-scope="text, record">
          {{ record.status | positionStatusFilter }}
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
            @click="() => handleDetail(record)"
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
      <user-file-modal ref="userFileModal" @change="refresh"></user-file-modal>
      <user-file-detail-modal ref="userFileDetailModal"></user-file-detail-modal>
      <h-file-import ref="HFileImport" @change="refresh(true)" @downloadExcel="downloadChange" />
    </h-card>
  </div>
</template>

<script>
import moment from 'moment'
import mixin from '@/views/hifar/mixin.js'
import { downloadFile, postAction } from '@/api/manage'
import userFileModal from './modules/userFileModal.vue'
import userFileDetailModal from './modules/userFileDetailModal.vue'
export default {
  components: {
    userFileModal,
    userFileDetailModal,
  },
  mixins: [mixin],
  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper,
    }
  },
  data() {
    return {
      moment,
      queryParams: {},
      selectedRowKeys: [],
      url: {
        list: '/HfResPersonBusiness/listPage',
        delete: '/HfResPersonBusiness/logicRemoveById',
        importExcelUrl: 'HfResPersonImport/importExcel',
        export: '/HfResPersonExport/exportExcel',
      },
      loadData: (params) => {
        let data = {
          ...this.queryParams,
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
          title: '姓名',
          key: 'c_idName_7',
          formType: 'input',
        },
        {
          title: '工号',
          key: 'c_jobNo_7',
          formType: 'input',
        },
        {
          title: '性别',
          key: 'c_sex_1',
          formType: 'select',
          options: [
            { title: '男', value: 1, key: 1 },
            { title: '女', value: 2, key: 2 },
            { title: '保密', value: 0, key: 0 },
          ],
        },
        {
          title: '部门',
          key: 'c_deptName_7',
          formType: 'input',
        },
        {
          title: '职位',
          key: 'c_postName_7',
          formType: 'input',
        },
        {
          title: '电话',
          key: 'c_mobile_7',
          formType: 'input',
        },
        {
          title: '邮箱',
          key: 'c_email_7',
          formType: 'input',
        },
      ],
      // 表头
      columns: [
        {
          title: '姓名',
          align: 'left',
          dataIndex: 'idName',
          scopedSlots: { customRender: 'idName' },
        },
        {
          title: '工号',
          align: 'left',
          dataIndex: 'jobNo',
        },
        {
          title: '性别',
          align: 'left',
          dataIndex: 'sex',
          scopedSlots: { customRender: 'sex' },
        },
        {
          title: '部门',
          align: 'left',
          dataIndex: 'deptName',
        },
        {
          title: '职务 ',
          align: 'left',
          dataIndex: 'postName',
        },
        {
          title: '电话 ',
          align: 'left',
          dataIndex: 'mobile',
        },
        {
          title: '邮箱 ',
          align: 'left',
          dataIndex: 'email',
        },
        {
          title: '状态 ',
          align: 'left',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: 100,
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
  methods: {
    refresh() {
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
    // 添加
    handleAdd() {
      let record = {}
      this.$refs.userFileModal.show(record, '添加')
    },
    // 编辑
    handleEdit(record) {
      this.$refs.userFileModal.show(record, '编辑')
    },
    // 详情
    handleDetail(record) {
      this.$refs.userFileDetailModal.show(record)
    },
    // 点击姓名跳转详情
    handleDetailCode(record) {
      this.handleDetail(record)
    },
    // 导出
    async handleExportXls(name, model) {
      let data = {
        ...this.queryParams,
        ids: this.selectedRowKeys.join(','),
        ...model,
      }
      let url = this.url.export
      let params = data
      let fileName = name + '.xls'
      await downloadFile(url, fileName, params)
    },
    // 导入
    handleImportExcel() {
      let type = '人员档案'
      let { importExcelUrl } = this.url
      let record = {
        importCode:'HfResPersonImport'
      }
      this.$refs.HFileImport.show(type, importExcelUrl,record)
    },
    downloadChange() {
      this.handleExportXls('人员档案', { type: 'template' })
    },
  },
}
</script>
<style lang='less' scoped>
@import '~@assets/less/common.less';
</style>