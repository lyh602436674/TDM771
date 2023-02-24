<template>
  <h-card bordered class="questionTable" title="驳回意见">
    <template slot="table-operator">
      <a-button icon="plus" size="small" type="ghost-primary" @click="handleAdd">新增</a-button>
      <a-popconfirm title="确定删除吗?" @confirm="handleBatchDelete">
        <a-button v-if="selectedRowKeys.length" icon="delete" size="small" type="danger">
          批量删除
        </a-button>
      </a-popconfirm>
    </template>
    <a-table
      :columns="columns"
      :dataSource="dataSource"
      :pagination="false"
      :rowSelection="{columnWidth:40, selectedRowKeys, onChange: handleSelect, type: 'checkbox' }"
      bordered
      rowKey="id"
      size="small"
      style="width: 100%;"
    >

    </a-table>
  </h-card>
</template>

<script>
import SysUserSelect from '@/views/components/SysUserSelect'
import {randomUUID} from "@/utils/util";

export default {
  name: "ReportRejectInfoTable",
  components: {SysUserSelect},
  props: {
    reportId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      selectedRowKeys: [],
      selectedRows: [],
      columns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 40,
          align: 'center',
          customRender: function (t, r, index) {
            return index + 1
          }
        },
        {
          title: '问题类型',
          dataIndex: 'questionType',
          align: 'center',
          width: 150,
          customRender: (t, row, index) => {
            return this.$createElement('h-dict-select', {
              props: {
                placeholder: '请选择问题类型',
                value: row.questionType,
                dictCode: "hf_report_question_type"
              },
              style: {width: '100%'},
              on: {
                change: (val) => {
                  row.questionType = val
                }
              }
            })
          }
        },
        {
          title: '内容',
          dataIndex: 'questionContent',
          align: 'center',
          customRender: (t, row, index) => {
            return this.$createElement('a-textarea', {
              props: {
                placeholder: '请输入问题内容',
                value: row.questionContent,
                autoSize: {minRows: 1}
              },
              style: {width: '100%'},
              on: {
                change: (e) => {
                  row.questionContent = e.target.value
                }
              }
            })
          }
        },
        {
          title: '责任人',
          dataIndex: 'questionPerson',
          align: 'center',
          width: 150,
          customRender: (t, row, index) => {
            return this.$createElement('sys-user-select', {
              props: {
                placeholder: '请输入问题内容',
                value: row.questionPerson,
              },
              style: {width: '100%'},
              on: {
                change: (val) => {
                  row.questionPerson = val
                }
              }
            })
          }
        },
      ],
      dataSource: []
    }
  },
  methods: {
    handleAdd() {
      this.dataSource.push({
        id: randomUUID(),
        questionType: undefined,
        questionContent: "",
        questionPerson: "",
      })
    },
    getTableData(){
      return this.dataSource
    },
    handleSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    handleBatchDelete() {
      let {selectedRowKeys} = this
      for (let i = 0; i < selectedRowKeys.length; i++) {
        let index = this.dataSource.findIndex(v => v.id === selectedRowKeys[i])
        this.dataSource.splice(index, 1);
      }
      this.selectedRowKeys = []
      this.selectedRows = []
    },
  },
}
</script>

<style lang="less" scoped>
.questionTable {
  /deep/ .h-card.ant-card .ant-card-body {
    padding: 5px;
  }

  /deep/ .ant-table-content > .ant-table-body {
    margin: 0 !important;
  }
}
</style>