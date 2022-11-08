<!--
 * @Author: 赵峰
 * @Date: 2021-09-06 14:16:27
 * @LastEditTime: 2021-09-06 17:54:05
 * @LastEditors: 赵峰
 * @Descripttion: 
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-physico-chemical\resource\EquipmentCheck\EquipmentCheckDetail.vue
-->
<template>
  <h-modal
    title="详情"
    inner
    destroyOnClose
    :getContainer="getContainer"
    :width="1000"
    :visible="visible"
    @cancel="handleCancel"
  >
    <div class="footer" slot="footer">
      <a-button @click="handleCancel" type="ghost-danger"> 关闭 </a-button>
    </div>
    <h-detail :showElevator="false">
      <h-descriptions size="small" bordered anchor :column="1" title="基本信息">
        <a-descriptions-item v-for="(item, index) in formData" :key="index" :label="item.title">
          {{ detail ? detail[item.key] : '' }}
        </a-descriptions-item>
      </h-descriptions>
    </h-detail>
    <div class="h-descriptions-title">
      <span class="content">点检项</span>
    </div>
    <vxe-table
      border
      show-all-overflow
      keep-source
      :checkbox-config="{ highlight: true }"
      ref="AcceptanceRecordTable"
      :data="acceptListData"
    >
      <vxe-table-column type="seq" width="60"></vxe-table-column>
      <vxe-table-column title="单位" field="partName"></vxe-table-column>
      <vxe-table-column title="点检项目" field="itemName"></vxe-table-column>
      <vxe-table-column title="周期" field="period"></vxe-table-column>
      <vxe-table-column title="周期单位">
        <template #default="{ row }">
          <div>{{ row.periodUnit == 3 ? '日' : row.periodUnit == 2 ? '月' : row.periodUnit == 1 ? '年' : '时' }}</div>
        </template>
      </vxe-table-column>
    </vxe-table>
  </h-modal>
</template>

<script>
import moment from 'moment'
import { postAction } from '@/api/manage'
export default {
  components: {},

  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  data() {
    return {
      moment,
      visible: false,
      detail: {},
      formData: [
        {
          title: '模板名称',
          key: 'templateName',
          formType: 'input',
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
        },
      ],
      url: {
        detailById: '/HfResEquipCheckTbaseBusiness/queryById',
        accessDetailById: '/HfResEquipCheckTitemBusiness/listAllByTemplateId',
      },
      acceptListData: [],
    }
  },

  methods: {
    show(record) {
      this.visible = true
      let obj = Object.assign({}, record)
      obj.acceptTime =
        obj.acceptTime && obj.acceptTime != 0 ? moment(parseInt(obj.acceptTime)).format('YYYY-MM-DD HH:mm:ss') : '--'
      this.loadAcceptInfoDetail(obj.id)
      this.detail = obj
    },
    handleCancel() {
      this.visible = false
      this.acceptListData = []
    },
    loadAcceptInfoDetail(id) {
      postAction(this.url.accessDetailById, { templateId: id }).then((res) => {
        if (res.code == 200) {
          this.acceptListData = res.data
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
  margin-top: 30px;

  .content {
    float: left;
    vertical-align: middle;
    margin-bottom: 5px;
  }
}
</style>