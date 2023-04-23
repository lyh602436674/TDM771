<!--
 * @Author: 赵峰
 * @Date: 2021-09-13 15:52:54
 * @LastEditTime: 2021-11-19 16:10:57
 * @LastEditors: 赵峰
 * @Descripttion: 计费标准详情
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\fee\modules\FeeListDetailModal.vue
-->
<template>
  <h-modal :getContainer="getContainer" :visible="visible" fullScreen inner title="计费标准详情" @cancel="handleCancel">
    <div class="footer" slot="footer">
      <a-button type="ghost-danger" @click="handleCancel"> 关闭</a-button>
    </div>
    <div style="padding:20px">
      <h-desc labelWidth="120px" size="small" style="width: 100%" title="基本信息">
        <h-desc-item :span="4" label="计费标准名称">
          {{ detailData.costName ? detailData.costName : '--' }}
        </h-desc-item>
        <h-desc-item label="备注">
          {{ detailData.remarks ? detailData.remarks : '--' }}
        </h-desc-item>
      </h-desc>
      <div class="h-descriptions-title" style="margin-top: 35px">
        <span class="content">设备单价</span>
      </div>
      <a-table
        :columns="columns"
        :dataSource="priceData"
        :pagination="false"
        bordered
        rowKey="id"
        :scroll="{ x: true, y:470 }"
        size="small"
        style="width: 100%"
      ></a-table>
    </div>
  </h-modal>
</template>

<script>
import {postAction} from '@/api/manage'

export default {
  components: {},

  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  data() {
    return {
      columns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return index + 1
          }
        },
        {
          title: '设备名称',
          dataIndex: 'unitName',
          align: 'center',
          width: 120,
          customRender: (t, row) => {
            return t || '--'
          }
        },
        {
          title: '设备型号',
          dataIndex: 'equipModel',
          align: 'center',
          width: 120,
          customRender: (t, row) => {
            return t || '--'
          }
        },
        {
          title: '资产编号',
          dataIndex: 'assetsCode',
          align: 'center',
          width: 120,
          customRender: (t, row) => {
            return t || '--'
          }
        },
        {
          title: '试验项目',
          dataIndex: 'projectName',
          align: 'center',
          width: 150,
          customRender: (t, row) => {
            return t || '--'
          }
        },
        {
          title: '速率',
          dataIndex: 'rate',
          align: 'center',
          width: 80,
          customRender: (t, row) => {
            return t || '--'
          }
        },
        {
          title: '温度范围(℃)',
          dataIndex: 'temperatureRange',
          align: 'center',
          width: 120,
          customRender: (t, row) => {
            return t || '--'
          }
        },
        {
          title: '湿度范围(RH)',
          dataIndex: 'humidityRange',
          align: 'center',
          width: 120,
          customRender: (t, row) => {
            return t || '--'
          }
        },
        {
          title: '压力范围(Pa)',
          dataIndex: 'pressureRange',
          align: 'center',
          width: 120,
          customRender: (t, row) => {
            return t || '--'
          }
        },
        {
          title: '加速度范围',
          dataIndex: 'accelerationRange',
          align: 'center',
          width: 120,
          customRender: (t, row) => {
            return t || '--'
          }
        },
        {
          title: '折扣',
          dataIndex: 'discount',
          align: 'center',
          width: 80,
          customRender: (t, row) => {
            return t || '--'
          }
        },
        {
          title: '标准单价(元)',
          dataIndex: 'unitPrice',
          align: 'center',
          width: 120,
          customRender: (t, row) => {
            return t || '--'
          }
        },
        {
          title: '折后单价(元)',
          dataIndex: 'discountPrice',
          align: 'center',
          width: 120,
          customRender: (t, row) => {
            return t || '--'
          }
        },
        {
          title: '开机费(元)',
          dataIndex: 'startupCost',
          align: 'center',
          width: 100,
          customRender: (t, row) => {
            return t || '--'
          }
        },
        {
          title: '单价描述',
          dataIndex: 'remarks',
          align: 'center',
          width: 150,
          customRender: (t, row) => {
            return t || '--'
          }
        },
      ],
      title: '计费标准详情',
      visible: false,
      url: {
        detail: '/HfResCustCostBusiness/queryById',
        priceUnit: '/HfResCustPriceBusiness/listAllByCostId',
      },
      priceData: [],
      detailData: {},
    }
  },
  methods: {
    handleCancel() {
      this.visible = false
    },
    show(record) {
      this.visible = true
      if (record.id) {
        this.loadDetail(record.id)
      }
    },
    loadDetail(id) {
      postAction(this.url.detail, {id: id}).then((res) => {
        if (res.code === 200) {
          this.detailData = res.data
          this.loadUnitById(id)
        }
      })
    },
    loadUnitById(costId) {
      postAction(this.url.priceUnit, {costId: costId}).then((res) => {
        if (res.code === 200) {
          let record = res.data
          this.priceData = record && record.length && record.map((item) => {
            return {
              ...item,
              ...item.equipData[0], // 设备信息全部从equipData中拿
              unitName: item.equipData[0].equipName,
              remarks: item.remarks,
            }
          }) || []
        }
      })
    },
  },
}
</script>
<style lang='less' scoped>
.h-descriptions-title {
  margin-bottom: 10px !important;
  display: block;
  width: 100%;
  padding: 0;
  color: rgba(0, 0, 0, 0.45);
  font-size: 16px;
  line-height: inherit;
  border: 0;
  border-bottom: 1px solid #d9d9d9;
  font-weight: 400;

  .content {
    float: left;
    vertical-align: middle;
    margin-bottom: 5px;
  }
}
</style>