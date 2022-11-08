<!--
 * @Author: 马潭龙
 * @Date: 2021-11-23 09:40:02
 * @LastEditTime: 2021-11-23 14:42:08
 * @LastEditors: 马潭龙
 * @Descripttion: 报告生成-按试品查找-表格内容
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\reports\components\ReportProductTable.vue
-->
<template>
  <h-card :border="true" :fixed="true">
    <template slot="title"> 按试品进行查找 </template>
    <h-search
      v-model="queryParam"
      slot="search-form"
      size="small"
      :showToggleButton="true"
      :data="searchBar"
      @change="refresh(true)"
      style="width:100%"
    />
    <h-vex-table slot="content" ref="reportProductTable" :scroll="{ x: true }" :columns="columns" :data="custLoadData">
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
      queryParam: {},
      MainSearchParams: {},
      url: {
        productTable: '/HfEnvReportBusiness/listPagePieceByCustId',
      },
      // 搜索
      searchBar: [
        {
          title: '委托单号',
          key: 'c_entrustNo_7',
          formType: 'input',
        },
        {
          title: '委托单位',
          key: 'c_custName_7',
          formType: 'input',
        },
        {
          title: '客户电话',
          key: 'c_linkMobile_7',
          formType: 'input',
        },
        {
          title: '委托日期',
          key: 'c_entrustTime_7',
          formType: 'input',
        },
        {
          title: '试品名称',
          key: 'c_productName_7',
          formType: 'input',
        },
        {
          title: '试品代号',
          key: 'c_productAlias_7',
          formType: 'input',
        },
        {
          title: '试品编号',
          key: 'c_productCode_7',
          formType: 'input',
        },
      ],
      // 表头
      columns: [
        {
          title: '委托单号',
          align: 'left',
          dataIndex: 'entrustNo',
        },
        {
          title: '试品编号 ',
          align: 'left',
          dataIndex: 'productCode',
        },
        {
          title: '试品代号 ',
          align: 'left',
          dataIndex: 'productAlias',
        },
        {
          title: '试品名称 ',
          align: 'left',
          dataIndex: 'productName',
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
      ],
      custLoadData: (params) => {
        let data = {
          ...this.queryParam,
          ...params,
          custId: this.custId,
        }
        return postAction(this.url.productTable, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
    }
  },
  methods: {
    refresh(bool = true) {
      this.$refs.reportProductTable.refresh(bool)
    },
  },
}
</script>

<style>
</style>