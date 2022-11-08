<!--
 * @Author: 马潭龙
 * @Date: 2021-11-22 16:13:01
 * @LastEditTime: 2021-11-23 14:22:33
 * @LastEditors: 马潭龙
 * @Descripttion: 按试品查找
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\reports\components\ReportProductMain.vue
-->
<template>
  <div class="h-report-wrapper h-custom-layout">
    <r-l-layout class="h-custom-layout" :leftMinWidth="220">
      <!-- 左边客户列表 -->
      <div slot="left" class="h-report-left">
        <h-edit-tree
          ref="ReportProductMain"
          title="客户中心"
          menuIcon="icon-bumen"
          fileIcon="icon-xiangmuchengyuan"
          :tree="treeData"
          :replaceFields="replaceFields"
          :selectedKeys="selectedKeys"
          @onSelect="handleSelected"
        >
          <a-input-search
            v-model="treeSearchParams.custName"
            allowClear
            slot="search-form"
            size="small"
            placeholder="请选择客户名称查找"
            enter-button="搜索"
            @keyup.enter.native="CustemTree"
            @search="loadTreeData"
          />
        </h-edit-tree>
      </div>
      <!-- 右边 -->
      <div slot="right" style="background: #fff; width: 100%; height: 100%">
        <div
          v-if="selectedRows && selectedRows.length <= 0"
          style="display: flex; justify-content: center; align-items: center; height: 100%"
        >
          <a-empty description="请选择客户进行查找"> </a-empty>
        </div>
        <template v-else>
          <report-product-table ref="reportProductTable" :custId="custId"></report-product-table>
        </template>
      </div>
    </r-l-layout>
  </div>
</template>

<script>
import { postAction } from '@/api/manage'
import HEditTree from '@/views/components/HEditTree.js'
import isEmpty from 'lodash'
import reportProductTable from './ReportProductTable.vue'
export default {
  data() {
    return {
      replaceFields: {
        children: 'children',
        title: 'custName',
        key: 'id',
      },
      treeData: [],
      // custId:'',
      selectedKeys: [],
      selectedRows:[],
      treeSearchParams: {},
    }
  },
  components: {
    HEditTree,
    reportProductTable
  },
  created() {
    this.loadTreeData()
  },
  methods: {
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
    handleSelected(selectedKeys, event) {
      // if (isEmpty(selectedKeys)) return
      let selectedRows = []
      event.selectedNodes.map((item) => {
        selectedRows.push(item.data.props)
      })
      this.custId = selectedKeys[0]
      this.selectedKeys = selectedKeys
      this.selectedRows = selectedRows
    },
  },
}
</script>

<style lang='less' scoped>
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