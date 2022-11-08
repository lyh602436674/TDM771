<!--
 * @Author: 赵峰
 * @Date: 2021-09-02 09:50:57
 * @LastEditTime: 2021-11-10 15:50:43
 * @LastEditors: 马潭龙
 * @Descripttion: 场地管理--详情
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\environment\modules\VenueManageDetail.vue
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
      <h-desc size="small" labelWidth="110px" :column="1" title="基本信息">
        <h-desc-item v-for="(item, index) in formData" :key="index" :label="item.title">
          {{ detail ? detail[item.key] : '' }}
        </h-desc-item>
      </h-desc>
    </h-detail>
  </h-modal>
</template>

<script>
import moment from 'moment'
import HDesc from '../../../../../../components/HDesc/HDesc.vue'
export default {
  components: {HDesc},
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
          title: '场地名称',
          key: 'placeName',
          formType: 'input',
          span: 2,
        },
        {
          title: '创建日期',
          key: 'createTime',
          formType: 'datePick',
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
      obj.createTime =
        obj.createTime && obj.createTime != 0 ? moment(parseInt(obj.createTime)).format('YYYY-MM-DD HH:mm:ss') : '--'
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