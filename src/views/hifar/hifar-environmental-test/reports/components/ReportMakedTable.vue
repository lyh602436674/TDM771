<!--
 * @Author: 赵峰
 * @Date: 2021-09-03 18:09:07
 * @LastEditTime: 2021-11-04 13:40:22
 * @LastEditors: 赵峰
 * @Descripttion: 已出报告
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\reports\components\ReportMakedTable.vue
-->
<template>
  <h-card :bordered="false" style="width: 100%">
    <h-search
      v-model="queryParams"
      style="width: 100%"
      slot="search-form"
      size="small"
      :showToggleButton="true"
      :data="searchBar"
      @change="refresh(true)"
    />
    <h-vex-table
      ref="reportMakeTable"
      :columns="columns"
      :data="loadData"
      :rowKey="(record) => record.id"
      :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
    >
      <div slot="reportFlag" slot-scope="text, record">
        <span v-if="record.reportFlag == 1" style="color: red">待出报告</span>
        <span v-if="record.reportFlag == 2" style="color: #409eff">已出报告</span>
      </div>
    </h-vex-table>
  </h-card>
</template>

<script>
import { postAction } from '@/api/manage'
export default {
  components: {},

  data() {
    return {
      url: {
        list: '/HfEnvReportBusiness/listPageGeneratedProjects',
      },
      queryParams: {},
      selectedRowKeys: [],
      selectedRow: [],
      columns: [
        {
          title: '项目名称',
          align: 'left',
          dataIndex: 'unitName',
        },
        {
          title: '状态',
          align: 'left',
          dataIndex: 'reportFlag',
          scopedSlots: { customRender: 'reportFlag' },
        },
        {
          title: '委托单位',
          align: 'left',
          dataIndex: 'custName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '委托单号',
          align: 'left',
          dataIndex: 'entrustNo',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '联系人',
          align: 'left',
          dataIndex: 'custLinkName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '联系方式',
          align: 'left',
          dataIndex: 'custLinkMobile',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '材料名称',
          align: 'left',
          dataIndex: 'productName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
      ],
      searchBar: [
        {
          title: '委托单位',
          key: 'c_custName_7',
          formType: 'input',
        },
        {
          title: '联系人',
          key: 'c_custLinkName_7',
          formType: 'input',
        },
        {
          title: '联系方式',
          key: 'c_custLinkMobile_7',
          formType: 'input',
        },
        {
          title: '委托单号',
          key: 'c_entrustNo_7',
          formType: 'input',
        },
        {
          title: '材料名称',
          key: 'c_productName_7',
          formType: 'input',
        },
      ],
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
    }
  },

  methods: {
    refresh(bool = true) {
      this.$refs.reportMakeTable.refresh(bool)
      this.selectedRowKeys = []
      this.selectedRow = []
    },
    // 对外释放选中的值
    triggerChange() {
      this.$emit('selected', this.selectedRowKeys, this.selectedRow)
      this.$emit('change', this.selectedRowKeys, this.selectedRow)
    },
    onSelectChange(selectedRowKeys, selectedRow) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRow = selectedRow
      this.triggerChange()
    },
  },
}
</script>
<style lang='less' scoped>
.h-vex-table-wrapper {
  width: 100%;
}
</style>