<!--
 * @Author: 马潭龙
 * @Date: 2021-11-02 16:26:00
 * @LastEditors: 马潭龙
 * @Description: 报告生成-----按项目进行查找
 * @LastEditTime: 2021-11-23 16:22:18
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\reports\components\ReportEntrustTable.vue
 -->
<template>
  <h-card :bordered="true" :fixed="true" style="width: 100%">
    <template slot="title"> 项目列表</template>
    <h-search
      slot="search-form"
      v-model="queryParam"
      size="small"
      :showToggleButton="true"
      :data="searchBar"
      style="width: 100%"
      @change="refresh(true)"
    />
    <!-- 项目表格 -->
    <h-vex-table
      slot="content"
      ref="unitListTable"
      :scroll="{ x: true }"
      :columns="columns"
      :data="entrustData"
      :rowKey="(record) => record.id"
      :row-selection="{ selectedRowKeys: selectedRowKeys,  onSelect: onSelect }"
    >
              <span slot="reportFlag" slot-scope="text, record">
<!--                <a-badge
                  :color="record.reportFlag == 1 ? 'red' : 'blue'"
                  :text="record.reportFlag == 1 ? '待出报告' : '已出报告'"
                />-->
                        <a-badge :color='record.status | wtStatusColorFilter' :text='record.status | wtStatusFilter'/>
              </span>
    </h-vex-table>
  </h-card>
</template>
<script>
import {postAction} from '@/api/manage'
import HEditTree from '@/views/components/HEditTree.js'
// import isEmpty from 'lodash'
import mixin from '@/views/hifar/hifar-environmental-test/mixin.js'

export default {
  mixins: [mixin],
  watch: {
    queryType(val) {
      this.queryType = val
      this.refresh(true)
    },
  },
  components: {
    HEditTree,
  },
  data() {
    return {
      replaceFields: {
        children: 'children',
        title: 'custName',
        key: 'id',
      },
      treeData: [],
      selectedKeys: [],
      selectedRows: [],
      treeSearchParams: {},

      selectedRowKeys: [],
      queryParam: {},

      // 表头
      columns: [
        {
          title: '委托单号',
          align: 'left',
          dataIndex: 'entrustNo',
        },
        {
          title: '项目名称',
          align: 'left',
          dataIndex: 'unitName',
        },
        {
          title: '状态',
          align: 'left',
          dataIndex: 'reportFlag',
          scopedSlots: {customRender: 'reportFlag'},
        },

        {
          title: '委托单位',
          align: 'left',
          dataIndex: 'custName',
        },
        {
          title: '联系人 ',
          align: 'left',
          dataIndex: 'custLinkName',
        },
        {
          title: '联系人电话 ',
          align: 'left',
          dataIndex: 'custLinkMobile',
        },
        {
          title: '试品名称',
          align: 'left',
          dataIndex: 'productName',
        },
      ],
      //   查询
      searchBar: [
        {
          title: '委托单号',
          key: 'entrustNo',
          formType: 'input',
        },
        {
          title: '项目名称',
          key: 'unitName',
          formType: 'input',
        },
        {
          title: '状态',
          key: 'reportFlag',
          formType: 'select',
          options: [
            {title: '未出报告', value: 1, key: 1},
            {title: '已出报告', value: 2, key: 2},
          ],
        },

        {
          title: '委托单位',
          key: 'custName',
          formType: 'input',
        },
        {
          title: '联系人',
          key: 'custLinkName',
          formType: 'input',
        },
        {
          title: '联系电话',
          key: 'custLinkMobile',
          formType: 'input',
        },
        {
          title: '试品名称',
          key: 'productName',
          formType: 'input',
        },
      ],
    }
  },
  created() {
    this.refresh();
    this.loadTreeData()
  },
  methods: {
    // 表格数据
    entrustData(params) {
      let data = {
        ...this.queryParam,
        ...params,
        // custId: this.custId,
      }
      return postAction('/HfEnvReportBusiness/listPageProjectByEntrustId', data).then((res) => {
        if (res.code == 200) {
          return res.data
        }
      })
    },
    // 是否选中表格,数据传到父标签,保存
    onSelect(selectedRowKeys, selectedRow) {
      this.selectedRowKeys = selectedRowKeys
      this.$emit('selected', selectedRowKeys, selectedRow)
      this.$emit('change', selectedRowKeys, selectedRow)
    },
    refresh(bool = true) {
      this.$nextTick(() => {
        this.$refs.unitListTable.refresh(bool)
        this.selectedRowKeys = []
      })
    },
    // 客户树
    loadTreeData() {
      let data = {
        ...this.treeSearchParams,
      }
      postAction('/HfEnvReportBusiness/listEntrustCustomer', data).then((res) => {
        this.treeData = res.data.map((item) => {
          item.scopedSlots = {
            title: 'customTitle',
          }
          item.title = item.custName
          item.children = []
          return item
        })
      })
    },
    // 选择每个客户树时给custId重新赋值,刷新表格
    handleSelected(selectedKeys, event) {
      let selectedRows = []
      event.selectedNodes.map((item) => {
        selectedRows.push(item.data.props)
      })
      this.custId = selectedKeys[0]
      this.selectedKeys = selectedKeys
      this.selectedRows = selectedRows
      this.refresh()
    },
  },
}
</script>

<style lang="less" scoped>
.h-report-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;

  .h-report-left {
    height: 100%;
  }
}

/deep/ .ant-tree li span.ant-tree-switcher.ant-tree-switcher-noop {
  display: none;
}
</style>