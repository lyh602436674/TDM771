<!--
 * @Author: 赵峰
 * @Date: 2021-09-01 15:06:50
 * @LastEditTime: 2021-09-06 14:02:06
 * @LastEditors: 赵峰
 * @Descripttion: 验收记录详情
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-physico-chemical\resource\equipment\modules\AcceptanceRecordDetail.vue
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
      <span class="content">验收列表</span>
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
        <vxe-table-column
          title="项目"
          field="acceptName"
        ></vxe-table-column>
        <vxe-table-column
          title="情况"
          field="acceptDesc"
        ></vxe-table-column>
        <vxe-table-column
          title="备注"
          field="remarks"
        ></vxe-table-column>
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
          title: '验收方式',
          key: 'acceptMethod',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入验收方式' }],
          },
        },
        {
          title: '验收人',
          key: 'acceptUserName',
          formType: 'input',
          hidden: true,
        },
        {
          title: '验收日期',
          key: 'acceptTime',
          formType: 'datePick',
          validate: {
            rules: [{ required: true, message: '请选择验收日期' }],
          },
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
          span: 2,
        },
      ],
      url: {
        detailById: '/HfResEquipAcceptBusiness/queryById',
        accessDetailById: '/HfResEquipAcceptListBusiness/listAllByAcceptId',
      },
      acceptListData:[]
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
    },
    loadAcceptInfoDetail(id) {
      postAction(this.url.accessDetailById, { acceptId: id }).then((res) => {
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