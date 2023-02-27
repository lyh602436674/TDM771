<template>
  <h-modal
    :getContainer="getContainer"
    :visible="visible"
    destroyOnClose
    fullScreen
    inner
    title="报告驳回列表"
    @cancel="handleCancel"
  >
    <r-l-layout :leftMinWidth="250" style="height: 100%">
      <template slot="left">
        <h-edit-tree
          ref="reportTree"
          :replaceFields="replaceFields"
          :selectedKeys="selectedTreeKeys"
          :tree="treeData"
          title="报告列表"
          @onSelect="handleTreeSelected"
        >
          <a-input-search
            slot="search-form"
            v-model="treeSearchParams.c_reportCode_7"
            allowClear
            enter-button="搜索"
            placeholder="请输入报告编号"
            size="small"
            @search="getReportTree"
            @keyup.enter.native="getReportTree"
          />
        </h-edit-tree>
      </template>
      <template slot="right">
        <h-card :bordered="false" fixed>
          <span slot="title">意见列表</span>
          <h-search
            slot="search-form"
            v-model="queryParams"
            :data="searchData"
            :showToggleButton="true"
            size="small"
            @change="refresh"
          />
          <template slot="table-operator">
            <a-button icon="plus" size="small" type="ghost-primary" @click="handleAdd"> 新增
            </a-button>
            <a-button icon="export" size="small" type="ghost-warning" @click="handleExportXls('驳回意见')">
              导出
            </a-button>
          </template>
          <h-vex-table
            ref="reportRejectTable"
            slot="content"
            :columns="columns"
            :data="loadData"
            :rowKey="(record) => record.id"
            :rowSelection="{ selectedRowKeys, onSelect }"
          >
            <template slot="reportCode" slot-scope="text,record">
              <a @click="handleEdit(record)">{{ text || '' }}</a>
            </template>
            <div slot="action" slot-scope="text, record">
              <a-space>
                <a @click="handleEdit(record)">编辑</a>
                <a-popconfirm title="确定删除吗?" @confirm="handleDelete(record.id)">
                  <a class="danger-text">删除</a>
                </a-popconfirm>
              </a-space>
            </div>
          </h-vex-table>
        </h-card>
      </template>
    </r-l-layout>
    <report-reject-all-info-modal ref="reportRejectAllInfoModal" :selectedTreeRows="selectedTreeRows"
                                  @change="refresh"/>
  </h-modal>
</template>

<script>
import {downloadFile, postAction} from "@api/manage";
import HEditTree from "@views/components/HEditTree";
import ReportRejectAllInfoModal from "@views/hifar/hifar-environmental-test/reports/modules/ReportRejectAllInfoModal";

const rejectType = [
  {title: "报告生成", key: "1", value: "1"},
  {title: "报告审核", key: "2", value: "2"},
  {title: "报告批准", key: "3", value: "3"},
  {title: "修改审批", key: "4", value: "4"},
]
export default {
  name: "ReportRejectAllInfo",
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  components: {
    ReportRejectAllInfoModal,
    HEditTree
  },
  data() {
    return {
      visible: false,
      replaceFields: {
        title: "reportCode",
        value: 'id',
        key: 'id',
      },
      queryParams: {},
      treeSearchParams: {},
      selectedTreeKeys: [],
      selectedTreeRows: [],
      treeData: [],
      selectedRowKeys: [],
      searchData: [
        {
          title: '报告编号',
          formType: 'input',
          key: 'c_reportCode_7'
        },
        {
          title: '运行单号',
          key: 'c_entrustCode_7',
          formType: 'input'
        },
        {
          title: '委托单号',
          key: 'c_entrustNo_7',
          formType: 'input'
        },
        {
          title: '试验编号',
          formType: 'input',
          key: 'c_testCode_7'
        },
        {
          title: '试验项目',
          formType: 'input',
          key: 'c_testNames_7'
        },
        {
          title: '驳回节点',
          formType: 'select',
          key: 'rejectType',
          options: rejectType,
        },
        {
          title: '问题类型',
          formType: 'dict',
          key: 'c_questionType_1',
          dictCode: 'hf_report_question_type'
        },
        {
          title: '责任人 ',
          formType: 'input',
          key: 'c_questionPersonName_7'
        },
      ],
      columns: [
        {
          title: "报告编号",
          width: 140,
          dataIndex: 'reportCode',
          scopedSlots: {customRender: "reportCode"}
        },
        {
          title: '运行单号',
          width: 160,
          dataIndex: 'entrustCode',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '委托单号',
          width: 140,
          dataIndex: 'entrustNo',
        },
        {
          title: '试验编号',
          dataIndex: 'testCode',
          minWidth: 120,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '试验项目',
          dataIndex: 'testNames',
          minWidth: 100,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '送试单位',
          minWidth: 120,
          dataIndex: 'custName',
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '驳回节点',
          minWidth: 120,
          dataIndex: 'rejectType',
          customRender: (text, record) => {
            let [res] = rejectType.filter(item => item.key === text)
            return res.title
          }
        },
        {
          title: '问题类型',
          dataIndex: 'questionTypeName',
          width: 150,
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '内容',
          dataIndex: 'questionContent',
          width: 200,
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '责任人',
          dataIndex: 'questionPersonName',
          width: 150,
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: 120,
          fixed: 'right',
          align: "center",
          scopedSlots: {customRender: "action"}
        }
      ],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
          reportId: this.selectedTreeKeys.toString(),
        }
        return postAction(this.url.list, data).then(res => {
          if (res.code === 200) {
            return res.data
          }
        })
      },
      url: {
        list: "/HfEnvReportRejectBusiness/listPage",
        delete: "HfEnvReportRejectBusiness/logicRemoveById",
        tree: "/HfEnvReportRejectBusiness/reportTree",
        export: "/HfResReportRejectExport/exportExcel"
      }
    }
  },
  methods: {
    show() {
      this.visible = true
      this.getReportTree()
    },
    handleTreeSelected(selectedKeys, e, selectedRows) {
      this.selectedTreeKeys = selectedKeys
      this.selectedTreeRows = selectedRows
      this.refresh(true)
    },
    getReportTree() {
      postAction(this.url.tree, {...this.treeSearchParams}).then(res => {
        if (res.code === 200) {
          this.treeData = res.data
        }
      })
    },
    handleAdd() {
      if (!this.selectedTreeKeys.length) return this.$message.warning('请选择左侧报告编号')
      this.$refs.reportRejectAllInfoModal.show({}, 'add')
    },
    handleEdit(record) {
      this.$refs.reportRejectAllInfoModal.show(record, 'edit')
    },
    async handleExportXls(name) {
      let data = {
        ...this.queryParam,
        ids: this.selectedRowKeys.join(','),
      }
      let url = this.url.export
      let params = data
      let fileName = name + '.xls'
      await downloadFile(url, fileName, params)
    },
    handleDelete(id) {
      postAction(this.url.delete, {id}).then(res => {
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.refresh()
        }
      })
    },
    refresh(bool) {
      this.$refs.reportRejectTable.refresh(bool)
    },
    onSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    handleCancel() {
      this.visible = false;
    },
  }
}
</script>

<style scoped>

</style>