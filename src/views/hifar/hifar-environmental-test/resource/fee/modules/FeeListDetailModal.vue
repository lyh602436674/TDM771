<!--
 * @Author: 赵峰
 * @Date: 2021-09-13 15:52:54
 * @LastEditTime: 2021-11-19 16:10:57
 * @LastEditors: 赵峰
 * @Descripttion: 计费标准详情
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\fee\modules\FeeListDetailModal.vue
-->
<template>
  <h-modal inner :width="900" :visible="visible" :getContainer="getContainer" @cancel="handleCancel">
    <div class="footer" slot="footer">
      <a-button @click="handleCancel" type="ghost-danger"> 关闭 </a-button>
    </div>
    <h-desc labelWidth="120px" size="small" style="width: 100%" title="基本信息">
      <h-desc-item label="计费标准名称" :span="4">
        {{ detailData.costName ? detailData.costName : '--' }}
      </h-desc-item>
      <h-desc-item label="备注">
        {{ detailData.remarks ? detailData.remarks : '--' }}
      </h-desc-item>
    </h-desc>
    <div class="h-descriptions-title" style="margin-top: 35px">
      <span class="content">设备单价</span>
    </div>
    <vxe-table
      border
      show-all-overflow
      keep-source
      ref="priceDataTable"
      :data="priceData"
      :edit-config="{ key: 'id', trigger: 'click', mode: 'row', showStatus: true }"
    >
      <vxe-table-column type="seq" width="60"></vxe-table-column>
      <vxe-table-column title="设备名称" field="unitName" :disabled="true"></vxe-table-column>
      <vxe-table-column title="设备型号" field="equipModel" :disabled="true"></vxe-table-column>
      <vxe-table-column title="速率" field="rate" :disabled="true"></vxe-table-column>
      <vxe-table-column title="单价（元）" field="unitPrice"></vxe-table-column>
      <vxe-table-column title="单价描述" field="remarks"></vxe-table-column>
    </vxe-table>
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
      postAction(this.url.detail, { id: id }).then((res) => {
        if (res.code == 200) {
          this.detailData = res.data
          this.loadUnitById(id)
        }
      })
    },
    loadUnitById(costId) {
      let newTableData = []
      postAction(this.url.priceUnit, { costId: costId }).then((res) => {
        if (res.code == 200) {
          let record = res.data
          if (record.length > 0) {
            record.forEach((item) => {
              newTableData.push({
                costId: item.costId,
                unitId: item.unitId,
                equipModel: item.equipModel,
                rate: item.rate,
                id: item.id,
                unitName: item.unitName,
                unitPrice: item.unitPrice / 100,
                remarks: item.remarks,
              })
            })
          }
          this.priceData = newTableData
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