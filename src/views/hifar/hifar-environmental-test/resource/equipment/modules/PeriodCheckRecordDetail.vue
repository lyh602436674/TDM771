<!--
 * @Author: 赵峰
 * @Date: 2021-09-01 16:33:26
 * @LastEditTime: 2021-11-29 15:45:27
 * @LastEditors: 马潭龙
 * @Descripttion: 期间核查记录 ---详情
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\equipment\modules\PeriodCheckRecordDetail.vue
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
    <!-- <h-detail :showElevator="false">
      <h-descriptions size="small" bordered anchor :column="1" title="基本信息">
        <a-descriptions-item v-for="(item, index) in formData" :key="index" :label="item.title">
          {{ detail ? detail[item.key] : '' }}
        </a-descriptions-item>
      </h-descriptions>
    </h-detail> -->
    <h-desc size="small" bordered :column='1' title="基本信息"> 
      <h-desc-item v-for="(item, index) in formData" :key="index" :label="item.title">
        {{ detail?detail[item.key] : '' }}
      </h-desc-item>
    </h-desc>
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
          title: '检测类型',
          key: 'checkTypeName',
        },
        {
          title: '检查人',
          key: 'checkUserName',
          formType: 'input',
        },
        {
          title: '核查日期',
          key: 'checkTime',
          formType: 'datePick',
        },
        {
          title: '环境温度(℃)',
          key: 'envH',
          formType: 'input',
          inputType:'number',
        },
        {
          title: '相对湿度(%)',
          key: 'envT',
          formType: 'input',
          inputType:'number',
        },
        {
          title: '检查结果',
          key: 'checkRs',
          formType: 'textarea',
        },
        {
          title: '检查结论',
          key: 'conclusion',
          formType: 'textarea',
        },
        {
          title: '审核意见',
          key: 'audit',
          formType: 'textarea',
        },
      ],
    }
  },

  methods: {
    show(record) {
      this.visible = true
      let obj = Object.assign({}, record)
      obj.checkTime =
        obj.checkTime && obj.checkTime != 0 ? moment(parseInt(obj.checkTime)).format('YYYY-MM-DD HH:mm:ss') : '--'
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