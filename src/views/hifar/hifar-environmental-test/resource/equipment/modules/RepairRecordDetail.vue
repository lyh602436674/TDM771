<!--
 * @Author: 赵峰
 * @Date: 2021-09-01 15:42:29
 * @LastEditTime: 2021-09-01 15:45:45
 * @LastEditors: 赵峰
 * @Descripttion: 维修详情
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-physico-chemical\resource\equipment\modules\RepairRecordDetail.vue
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
  </h-modal>
</template>

<script>
import moment from 'moment'
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
          title: '故障原因',
          key: 'fault',
          formType: 'textarea',
          validate: {
            rules: [{ required: true, message: '请输入故障原因' }],
          },
          span: 2,
        },
        {
          title: '维修结果',
          key: 'repairRs',
          formType: 'textarea',
          validate: {
            rules: [{ required: true, message: '请输入维修结果' }],
          },
          span: 2,
        },
        {
          title: '维修人员',
          key: 'repairPerson',
          formType: 'input',
          span: 2,
          validate: {
            rules: [{ required: true, message: '请输入维修人员' }],
          },
        },
        {
          title: '维修日期',
          key: 'repairTime',
          formType: 'datePick',
          validate: {
            rules: [{ required: true, message: '请选择维修日期' }],
          },
          span: 2,
        },
        {
          title: '验收人',
          key: 'checkUserName',
          formType: 'input',
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
          span: 2,
        },
      ],
    }
  },

  methods: {
    show(record) {
      this.visible = true
      let obj = Object.assign({}, record)
      obj.repairTime =
        obj.repairTime && obj.repairTime != 0 ? moment(parseInt(obj.repairTime)).format('YYYY-MM-DD HH:mm:ss') : '--'
      this.detail = obj
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>
<style lang='less' scoped>
</style>