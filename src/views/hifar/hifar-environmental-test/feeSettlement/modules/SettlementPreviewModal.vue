<!--
 * @Author: 雷宇航
 * @Date: 2023-04-04 10:20:03
 * @fileName: SettlementPreviewModal.vue
 * @FilePath: tdm771-client\src\views\hifar\hifar-environmental-test\feeSettlement\modules\SettlementPreviewModal.vue
 * @Description: 结算前预览页面和结算后查看详情页面
-->
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
      <a-button v-if="isEdit" :loading="submitLoading" type='primary' @click='handleSubmit'>确定</a-button>
    </div>
    <div style='padding:10px'>
      <h-desc v-if="!isEdit" :column='3' bordered size="small" title="基本信息">
        <h-desc-item label="结算单号">{{ model.billNumber }}</h-desc-item>
        <h-desc-item label="结算人">{{ model.createUserName }}</h-desc-item>
        <h-desc-item label="结算时间">{{ moment(+model.createTime).format('YYYY-MM-DD HH:mm:ss') }}</h-desc-item>
        <h-desc-item label="标准总价">{{ Number(model.standardTotalPrice).toFixed(2) || '--' }}</h-desc-item>
        <h-desc-item label="折后总价">{{ Number(model.discountTotalPrice).toFixed(2) || '--' }}</h-desc-item>
      </h-desc>
      <div class="operator">
        <a-button icon="export" type="primary" @click="handleExportXls('结算单')">导出</a-button>
      </div>
      <h-card fixed style="margin-top: 10px" title="结算项目">
        <h-vex-table
          ref="settlementPreviewTable"
          slot="content"
          :columns="columns"
          :data="loadData"
          :height="400"
        ></h-vex-table>
      </h-card>
    </div>
  </h-modal>
</template>

<script>
import {createLink, downFile, downloadFile, postAction} from '@/api/manage'
import moment from "moment";
import Vue from "vue";

export default {
  name: "SettlementPreviewModal",
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      moment,
      title: '结算单预览',
      visible: false,
      submitLoading: false,
      model: {},
      columns: [
        {
          title: '试验项目',
          dataIndex: 'testName',
          align: 'center',
          width: 150,
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '试验编号',
          dataIndex: 'testCode',
          align: 'center',
          width: 150,
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '试件名称',
          dataIndex: 'productName',
          align: 'center',
          width: 150,
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '试件编号',
          dataIndex: 'pieceNo',
          align: 'center',
          width: 150,
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '试件数量',
          dataIndex: 'pieceNum',
          align: 'center',
          width: 100,
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '试验条件',
          dataIndex: 'testCondition',
          align: 'center',
          width: 200,
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '向次',
          dataIndex: 'testSecondary',
          align: 'center',
          width: 80,
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '一次几台',
          dataIndex: 'empty1',
          align: 'center',
          width: 100,
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '核算当量',
          dataIndex: 'empty2',
          align: 'center',
          width: 100,
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '实际用时(h)',
          dataIndex: 'realUseTime',
          align: 'center',
          width: 100,
          customRender: text => {
            return Number(text).toFixed(2) || '--'
          }
        },
        {
          title: '单价/小时',
          dataIndex: 'unitPrice',
          align: 'center',
          width: 100,
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '标准单价',
          dataIndex: 'standardUnitPrice',
          align: 'center',
          width: 100,
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '标准总价',
          dataIndex: 'standardTotalPrice',
          align: 'center',
          width: 100,
          customRender: (text) => {
            return (Number(text) / 1000) || '--'
          },
        },
        {
          title: '折后单价',
          dataIndex: 'discountUnitPrice',
          align: 'center',
          width: 100,
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '折后总价',
          dataIndex: 'discountTotalPrice',
          align: 'center',
          width: 100,
          customRender: (text) => {
            return (Number(text) / 1000) || '--'
          },
        },
        {
          title: '委托方',
          dataIndex: 'custName',
          align: 'center',
          width: 120,
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '设备编号',
          dataIndex: 'equipCode',
          align: 'center',
          width: 120,
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '试验人',
          dataIndex: 'chargeUserName',
          align: 'center',
          width: 100,
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '复核人',
          dataIndex: 'checkUserName',
          align: 'center',
          width: 100,
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '班次',
          dataIndex: 'empty3',
          align: 'center',
          width: 100,
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '接收日期',
          dataIndex: 'submitPersonDate',
          align: 'center',
          width: 150,
          customRender: (text) => {
            return +text ? moment(+text).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '试验开始日期',
          dataIndex: 'realStartTime',
          align: 'center',
          width: 150,
          customRender: (text) => {
            return +text ? moment(+text).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '试验结束日期',
          dataIndex: 'realEndTime',
          align: 'center',
          width: 150,
          customRender: (text) => {
            return +text ? moment(+text).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
      ],
      url: {
        list: '/HfSettlementBusiness/previewSettleRes',
        settle: "/HfSettlementBusiness/add",
        queryById: "HfSettlementBusiness/queryById"
      },
    }
  },
  methods: {
    show(rowId) {
      this.visible = true
      this.rowId = rowId
    },
    handleExportXls(name) {
      let fileName = name + '.xls'
      let url = this.url.queryById
      let params = {id: this.rowId, type: 'export'}
      downloadFile(url, fileName, params)
    },
    handleSubmit() {
      if (this.submitLoading) return
      this.submitLoading = true
      postAction(this.url.settle, {testIds: this.rowId.toString()}).then(res => {
        if (res.code === 200) {
          this.$message.success('结算成功')
          this.handleCancel()
          this.$emit('change')
        }
      }).finally(() => {
        this.submitLoading = false
      })
    },
    handleCancel() {
      this.visible = false
    },
    refresh(bool = false) {
      this.$refs.settlementPreviewTable.refresh(bool)
    },
    loadData(params) {
      if (this.isEdit) {
        // 结算时预览
        let data = {
          ...params,
          testIds: this.rowId.toString(),
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code === 200) {
            return res.data
          }
        })
      } else {
        // 已结算的预览
        return postAction(this.url.queryById, {id: this.rowId}).then((res) => {
          if (res.code === 200) {
            this.model = res.data
            return res.data.item
          }
        })
      }
    },
  },
}
</script>
<style scoped lang="less">
.operator {
  width: 100%;
  padding-top: 10px;
  text-align: right;
}
</style>