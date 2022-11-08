<!--
 * @Author: 马潭龙
 * @Date: 2021-11-23 10:52:40
 * @LastEditTime: 2021-11-23 14:48:02
 * @LastEditors: 马潭龙
 * @Descripttion: 报告生成-按试验查找-表格内容
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\reports\components\ReportExperimentTable.vue
-->
<template>
  <h-card :border='true' :fixed='true'>
    <template slot='title'> 试验列表</template>
    <h-search
      slot='search-form'
      v-model='queryParam'
      :data='searchBar'
      :showToggleButton='true'
      size='small'
      style='width: 100%'
      @change='refresh(true)'
    />
    <h-vex-table
      ref='reportProductTable'
      slot='content'
      :columns='columns'
      :data='custLoadData'
      :row-selection="{ selectedRowKeys: selectedRowKeys,  onSelect: onSelect }"
      :rowKey="(record) => record.id"
      :scroll='{ x: true }'
    >
                    <span slot="reportFlag" slot-scope="text, record">
                        <a-badge :color='text | testStatusColorFilter' :text='text | testStatusFilter'/>
              </span>
    </h-vex-table>
  </h-card>
</template>

<script>
import {postAction} from '@/api/manage'
import moment from 'moment'
import mixin from '@/views/hifar/hifar-environmental-test/mixin.js'
import HEditTree from '@/views/components/HEditTree.js'

export default {
  mixins: [mixin],
  components: {
    HEditTree,
  },
  data() {
    return {
      moment,
      selectedRowKeys: [],
      queryParam: {},
      formDatas: {},
      MainSearchParams: {},
      url: {
        productTable: '/HfEnvReportBusiness/listPageTest'
      },
      // 搜索
      searchBar: [
        {
          title: '试验编号',
          key: 'c_testCode_7',
          formType: 'input'
        },
        {
          title: '项目名称',
          key: 'c_unitName_7',
          formType: 'input'
        },
        {
          title: '委托单号',
          key: 'c_entrustNo_7',
          formType: 'input'
        },
        {
          title: '运行单号',
          key: 'c_entrustCode_7',
          formType: 'input'
        },
        {
          title: '委托单位',
          key: 'c_custName_7',
          formType: 'input'
        },
        {
          title: '联系人',
          key: 'c_custLinkName_7',
          formType: 'input'
        },
        {
          title: '联系电话',
          key: 'c_custLinkMobile_7',
          formType: 'input'
        },
        {
          title: '样品名称',
          key: 'c_productName_7',
          formType: 'input'
        },
      ],
      // 表头
      columns: [
        {
          title: '试验编号',
          align: 'left',
          dataIndex: 'testCode',
        },
        {
          title: '委托单号',
          align: 'left',
          dataIndex: 'entrustNo',
        },
        {
          title: '运行单号',
          align: 'left',
          dataIndex: 'entrustCode',
        },
        {
          title: '委托单类型',
          align: 'left',
          dataIndex: 'entrustType',
          customRender: (t) => {
            return +t === 1 ? '内部' : "外部"
          }
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
          title: '样品名称',
          align: 'left',
          dataIndex: 'productName',
        },
      ],
      custLoadData: (params) => {
        let data = {
          ...this.queryParam,
          ...params,
        }
        return postAction(this.url.productTable, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      }
    }
  },
  methods: {
    refresh(bool = true) {
      this.$refs.reportProductTable.refresh(bool)
    },
    // 是否选中表格,数据传到父标签,保存
    onSelect(selectedRowKeys, selectedRow) {
      this.selectedRowKeys = selectedRowKeys
      this.$emit('selected', selectedRowKeys, selectedRow)
      this.$emit('change', selectedRowKeys, selectedRow)
    },
  }
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

.h-card-fixed .ant-card-body {
  display: block;
}

/deep/ .ant-tree li span.ant-tree-switcher.ant-tree-switcher-noop {
  display: none;
}
</style>