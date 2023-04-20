<template>
  <h-modal
    :getContainer="getContainer"
    :title="title"
    :visible="visible"
    destroyOnClose
    inner
    width="90%"
    @cancel="handleCancel"
  >
    <div slot='footer' class='footer'>
      <a-button type='ghost-danger' @click='handleCancel'> 关闭</a-button>
    </div>
    <div style="padding:10px">
      <h-tabs :activeKey="activeKey" :animated="true" fixed @change="handleTabsChange">
        <a-tab-pane key="beforeSnapshot">
          <a-badge slot="tab" :offset="offset">实际开始任务</a-badge>
          <inspection-record-item-list ref="beforeSnapshotTable" :activeKey="activeKey"
                                       :rowId="rowId"></inspection-record-item-list>
        </a-tab-pane>
        <a-tab-pane key="afterSnapshot">
          <a-badge slot="tab" :offset="offset">计划结束任务</a-badge>
          <inspection-record-item-list ref="afterSnapshotTable" :activeKey="activeKey"
                                       :rowId="rowId"></inspection-record-item-list>
        </a-tab-pane>
      </h-tabs>
    </div>
  </h-modal>
</template>

<script>
import moment from "moment";
import {postAction} from "@api/manage";
import InspectionRecordItemList from "@views/hifar/hifar-environmental-test/inspectionRecord/InspectionRecordItemList";

export default {
  name: "InspectionRecordModal",
  components: {InspectionRecordItemList},
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  data() {
    return {
      moment,
      offset: [10, 1],
      title: '巡检记录快照',
      visible: false,
      queryParams: {},
      rowId: "",
      activeKey: "beforeSnapshot",
      columns: [
        {
          title: '试验编号',
          dataIndex: 'testCode',
          minWidth: 120,
          scopedSlots: {customRender: 'testCode'},
        },
        {
          title: '运行单号',
          dataIndex: 'entrustCodes',
          minWidth: 140,
        },
        {
          title: '委托单号',
          dataIndex: 'entrustNos',
          minWidth: 120,
        },
        {
          title: '报告编号',
          dataIndex: 'reportCodes',
          minWidth: 140,
        },
        {
          title: '状态',
          dataIndex: 'status',
          scopedSlots: {customRender: 'status'},
          minWidth: 100,
        },
        {
          title: "产品名称",
          align: "left",
          dataIndex: "productName",
          minWidth: 100,
          customRender: (text, record) => {
            return text || "--";
          },
        },
        {
          title: "产品代号",
          align: "left",
          dataIndex: "productAlias",
          minWidth: 100,
          customRender: (text, record) => {
            return text || "--";
          },
        },
        {
          title: "产品编号",
          align: "left",
          dataIndex: "pieceNo",
          minWidth: 100,
          customRender: (text, record) => {
            return text || "--";
          },
        },
        {
          title: '送试单位',
          dataIndex: 'custNames',
          minWidth: 100,
        },
        {
          title: '试验项目',
          dataIndex: 'unitNames',
          minWidth: 120,
        },
        {
          title: '试验设备',
          dataIndex: 'equipName',
          minWidth: 150,
        },
        {
          title: '巡检记录',
          align: 'center',
          width: 110,
          dataIndex: 'archiveRecord',
          scopedSlots: {customRender: 'archiveRecord'}
        },
        {
          title: '实施方案',
          align: 'center',
          width: 110,
          dataIndex: 'embodiment',
          scopedSlots: {customRender: 'embodiment'}
        },
        {
          title: '期望开始时间',
          dataIndex: 'predictStartTime',
          customRender: (time) => {
            return time && time != 0 ? moment(parseFloat(time)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
          minWidth: 150,
        },
        {
          title: '预计用时(h)',
          dataIndex: 'predictUseTime',
          minWidth: 100,
        },
        {
          title: '实际开始时间',
          dataIndex: 'realStartTime',
          customRender: (time) => {
            return time && time != 0 ? moment(parseFloat(time)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
          minWidth: 150,
        },
        {
          title: '实际用时(h)',
          dataIndex: 'realUseTime',
          minWidth: 100,
          customRender: text => {
            return Number(text).toFixed(2) || '--'
          }
        },
        {
          title: '标准总价',
          dataIndex: 'standardTotalPrice',
          minWidth: 100,
          customRender: text => {
            return Number(text)
          }
        },
        {
          title: '折后总价',
          dataIndex: 'totalExpenses',
          minWidth: 100,
          customRender: text => {
            return Number(text)
          }
        },
        {
          title: '操作',
          dataIndex: 'actions',
          align: 'center',
          fixed: 'right',
          width: 80,
          scopedSlots: {
            customRender: 'actions',
          },
        },
      ],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams
        }
        return postAction(this.url.list, data).then(res => {
          if (res.code === 200) {
            return res.data[this.activeKey]
          }
        })
      },
    }
  },
  methods: {
    show(rowId, activeKey) {
      this.visible = true
      this.activeKey = activeKey
      this.rowId = rowId
      this.handleTabsChange(activeKey)
    },
    handleTabsChange(val) {
      this.activeKey = val
      this.$nextTick(() => {
        if (val === 'beforeSnapshot') {
          this.$refs.beforeSnapshotTable.refresh(true)
        } else if (val === 'afterSnapshot') {
          this.$refs.afterSnapshotTable.refresh(true)
        }
      })
    },
    handleCancel() {
      this.visible = false
    },
  }
}
</script>

<style scoped>

</style>