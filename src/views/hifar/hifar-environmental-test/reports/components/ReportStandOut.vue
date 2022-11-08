<!--
 * @Author: 赵峰
 * @Date: 2021-09-03 17:53:24
 * @LastEditTime: 2021-11-04 10:15:18
 * @LastEditors: 赵峰
 * @Descripttion: 待出报告
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\reports\components\ReportStandOut.vue
-->
<template>
  <div class="h-report-wrapper">
    <a-alert v-if="messageErrorShow" :message="messageError" type="error" show-icon />
    <r-l-layout class="h-custom-layout" :leftMinWidth="180">
      <div slot="left" class="h-report-left">
        <h-card>
          <h-select v-model="coverTemplateId" size="small" placeholder="请选择封面">
            <span slot="addonBefore">封面</span>
            <a-select-option v-for="(item, index) in coverList" :key="index" :value="item.id">{{
              item.name
            }}</a-select-option>
          </h-select>
          <a-tree :tree-data="treeData" :show-line="true" @select="onSelect"> </a-tree>
          <a-empty v-if="treeCustData.length == 0" style="margin-top: 260px" />
        </h-card>
      </div>
      <template slot="right">
        <div style="display: flex; width: 100%; height: 100%; flex-direction: column">
          <div>
            <h-search
              v-model="queryParams"
              style="width: 100%"
              slot="search-form"
              size="small"
              :showToggleButton="true"
              :data="searchBar"
              @change="refresh(true)"
            />
          </div>
          <div style="width: 100%; height: 100%; flex: 1; margin-top: 10px">
            <h-vex-table
              ref="reportMakeTable"
              :columns="columns"
              :data="loadData"
              :rowKey="(record) => record.unitId"
              :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
            >
              <div slot="reportFlag" slot-scope="text, record">
                <span v-if="record.reportFlag == 1" style="color: red">待出报告</span>
                <span v-if="record.reportFlag == 2" style="color: #409eff">已出报告</span>
              </div>
            </h-vex-table>
          </div>
        </div>
      </template>
    </r-l-layout>
  </div>
</template>

<script>
import { postAction } from '@/api/manage'
export default {
  components: {},

  data() {
    return {
      messageError: '',
      messageErrorShow: false,
      url: {
        tree: '/HfEnvReportBusiness/listAllCustomerAndEntrust',
        list: '/HfEnvReportBusiness/listPageProjectByEntrustId',
        cover: '/HfEnvReportBusiness/reportCoverList',
      },
      coverTemplateId: undefined,
      entrustId: '',
      treeCustData: [],
      treeData: [],
      queryParams: {},
      selectedRowKeys: [],
      selectedRow: [],
      entrustCodeArr: [],
      coverList: [],
      selectedTreeRows: {},
      searchBar: [
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
          title: '联系方式',
          key: 'custLinkMobile',
          formType: 'input',
        },
        {
          title: '材料名称',
          key: 'productName',
          formType: 'input',
        },
      ],
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
          dataIndex: 'entrustCode',
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
      loadData: (params) => {
        let data = {
          ...this.queryParams,
          ...params,
          reportFlag: 1,
          entrustId: this.entrustId,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
    }
  },
  created() {
    this.loadTreeData()
    this.loadCoverData()
  },
  methods: {
    isRepeat(arr) {
      var isTrue = true
      var length = arr.length
      if (length > 0) {
        var temp = arr[0]
        for (var i = 0; i < length; i++) {
          if (arr.indexOf(arr[i]) != 0) {
            isTrue = false
            break
          }
        }
      }
      if (isTrue) {
        return true
      } else {
        return false
      }
    },
    refresh(bool = true) {
      this.$refs.reportMakeTable.refresh(bool)
    },
    onSelectChange(selectedRowKeys, selectedRow) {
      let entrustCodeArr = []
      if (selectedRow.length > 0) {
        selectedRow.forEach((item) => {
          entrustCodeArr.push(item.entrustCode)
        })
      }
      this.entrustCodeArr = entrustCodeArr
      this.selectedRowKeys = selectedRowKeys
      this.selectedRow = selectedRow
    },
    loadCoverData() {
      postAction(this.url.cover, {}).then((res) => {
        if (res.code == 200) {
          let { data } = res
          this.coverList = data
          this.coverTemplateId = data.length > 0 ? data[0].id : undefined
        }
      })
    },
    loadTreeData() {
      postAction(this.url.tree, {}).then((res) => {
        if (res.code == 200) {
          let treeData = []
          this.treeCustData = res.data
          res.data.forEach((item) => {
            let treeDataItem = {
              title: item.custName,
              key: item.custId,
              disabled: true,
              children: [],
            }
            item.entrustList.forEach((element) => {
              treeDataItem.children.push({
                title: element.entrustCode,
                key: element.id,
                custName: element.custName,
                custLinkName: element.custLinkName,
                custLinkMobile: element.custLinkMobile,
                custType: element.custType,
                id: element.id,
                productId: element.productId,
                productName: element.productName,
                entrustCode: element.entrustCode,
                custId: element.custId,
              })
            })
            treeData.push(treeDataItem)
          })
          this.$nextTick(() => {
            this.treeData = treeData
          })
        }
      })
    },
    onSelect(selectedKeys, event) {
      let selectedRows = []
      event.selectedNodes.map((item) => {
        selectedRows.push(item.data.props)
      })
      console.log(selectedKeys, selectedRows)
      this.selectedTreeRows = selectedRows[0]
      this.entrustId = selectedKeys[0]
      this.refresh(true)
    },
    onSubmitHandle() {
      let { selectedTreeRows, selectedRowKeys, selectedRow, coverTemplateId, entrustCodeArr } = this
      let data = {
        projectIds: selectedRowKeys.join(','),
        coverTemplateId: coverTemplateId,
        entrustId: selectedTreeRows.id ? selectedTreeRows.id : selectedRow[0].entrustId,
        entrustCode: selectedTreeRows.entrustCode ? selectedTreeRows.entrustCode : selectedRow[0].entrustCode,
        custId: selectedTreeRows.custId ? selectedTreeRows.custId : selectedRow[0].custId,
        custName: selectedTreeRows.custName ? selectedTreeRows.custName : selectedRow[0].custName,
        custLinkName: selectedTreeRows.custLinkName ? selectedTreeRows.custLinkName : selectedRow[0].custLinkName,
        custLinkMobile: selectedTreeRows.custLinkMobile
          ? selectedTreeRows.custLinkMobile
          : selectedRow[0].custLinkMobile,
        productId: selectedTreeRows.productId ? selectedTreeRows.productId : selectedRow[0].productId,
        productName: selectedTreeRows.productName ? selectedTreeRows.productName : selectedRow[0].productName,
      }
      if (!coverTemplateId) {
        this.openNotificationWithIcon('error', '请选择封面！')
      } else if (!this.isRepeat(entrustCodeArr)) {
        this.openNotificationWithIcon('error', '请选择同一委托单的项目')
      } else if (!data.entrustId) {
        this.openNotificationWithIcon('error', '请选择委托单！')
      } else if (!data.projectIds) {
        this.openNotificationWithIcon('error', '请选择项目！')
      } else {
        return data
      }
    },
    openNotificationWithIcon(type, desc) {
      this.$notification[type]({
        duration: 2,
        message: '请选择',
        description: desc,
      })
    },
  },
}
</script>
<style lang='less' scoped>
.h-report-wrapper {
  height: 100%;
  overflow: hidden;
  display: flex;
  .h-report-left {
    height: 100%;
  }
}
</style>