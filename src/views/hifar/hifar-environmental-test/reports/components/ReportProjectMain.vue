<!--
 * @Author: 马潭龙
 * @Date: 2021-11-03 10:45:23
 * @LastEditors: 马潭龙
 * @Description: 客户委托单
 * @LastEditTime: 2021-11-23 14:40:48
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\reports\components\ReportProjectMain.vue
 -->
<template>
  <h-card :bordered="true" :fixed="true">
    <template slot="title"> 客户委托单 </template>
    <h-search
    slot="search-form"
    size="small"
    :showToggleButton="true"
    :data="searchBar"
    style="width:100%"
    @change="refresh(true)"
    />
    <div slot="table-operator" style="border-top: 5px">
      <!-- <a-button type="ghost-primary" size="small" icon="plus">批量生成</a-button> -->
    </div>
    <!-- 委托单表格 -->
    <h-vex-table
      slot="content"
      ref="entrusListTable"
      :scroll="{ x: true }"
      :columns="columns"
      :data="custLoadData"
      :rowKey="(record) => record.id"
      :row-selection="{ selectedRowKeys: selectedRowKeys}"
    >
    </h-vex-table>
  </h-card>
</template>

<script>
import { postAction } from '@/api/manage'
import moment from 'moment'
export default {
  props: ['custId'],
  watch: {
    custId(val) {
      this.custId = val
      this.refresh(true)
    },
  },
  data() {
    return {
      moment,
      selectedRowKeys: [],
      formDatas: {},
      MainSearchParams:{},
      custLoadData: (params) => {
        let data = {
          ...this.queryParam,
          ...params,
          custId: this.custId,
        }
        return postAction('/HfEnvReportBusiness/listPageEntrustByCusId', data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
      // 表头
      columns: [
        {
          title: '委托单号',
          align: 'left',
          dataIndex: 'entrustNo',
        },
        {
          title: '委托单位 ',
          align: 'left',
          dataIndex: 'custName',
        },
        {
          title: '客户电话 ',
          align: 'left',
          dataIndex: 'custLinkMobile',
        },
        {
          title: '委托日期 ',
          align: 'left',
          dataIndex: 'entrustTime',
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD HH:mm') : '--'
          },
        },
        {
          title: '项目名称 ',
          align: 'left',
          dataIndex: 'unitName',
        },
        {
          title: '实验性质 ',
          align: 'left',
          dataIndex: 'testPropertyName',
        },
        {
          title: '试品型号 ',
          align: 'left',
          dataIndex: 'productModel',
        },
      ],
      //   查询
      searchBar: [
        {
          title: '委托单号',
          key: 'c_custName_7',
          formType: 'input',
        },
        {
          title: '送试单位',
          key: 'c_custShort_7',
          formType: 'input',
        },
        {
          title: '客户电话',
          key: 'c_custType_7',
          formType:'input'
        },
        {
          title: '委托日期',
          key: 'c_linkName_7',
          formType: 'input',
        },
        {
          title: '项目名称',
          key: 'c_linkMobile_7',
          formType: 'input',
        },
        {
          title: '试验性质',
          key: 'c_testPropertyName_7',
          formType: 'input',
        },
        {
          title: '试品型号',
          key: 'c_remarks_7',
          formType: 'input',
        },
      ],
    }
  },
  methods: {
    refresh(bool = true) {
      this.$refs.entrusListTable.refresh(bool)
    }
  },
}
</script>

<style lang="less" scoped>
</style>