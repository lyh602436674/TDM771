<!--
 * @Author: 赵峰
 * @Date: 2021-08-06 17:08:15
 * @LastEditTime: 2021-11-10 15:22:01
 * @LastEditors: 赵峰
 * @Descripttion: 培训计划详情
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\user\modules\trainingProgramDetail.vue
-->
<template>
  <h-modal title="详情" :visible="visible" :width="800" inner :getContainer="getContainer" @cancel="handleCancel">
    <div class="footer" slot="footer">
      <a-button @click="handleCancel" type="ghost-danger"> 关闭 </a-button>
    </div>
    <h-desc :data="detailData" size="small" :column="2" labelWidth="100px" title='基本信息'>
      <h-desc-item label="计划名称">
        {{ detailData.trainTheme ? detailData.trainTheme : '--' }}
      </h-desc-item>
      <h-desc-item label="年度">
        {{
          detailData.trainYear && detailData.trainYear != 0
            ? moment(parseInt(detailData.trainYear)).format('YYYY')
            : '--'
        }}
      </h-desc-item>
      <h-desc-item label="培训内容" :span="2">
        {{ detailData.trainContent ? detailData.trainContent : '--' }}
      </h-desc-item>
      <h-desc-item label="培训人员">
        {{ detailData.trainTeacher ? detailData.trainTeacher : '--' }}
      </h-desc-item>
      <h-desc-item label="培训方式">
        {{ detailData.trainMode == 1 ? '线下' : detailData.trainMode == 2 ? '线上' : '--' }}
      </h-desc-item>
      <h-desc-item label="开始日期">
        {{
          detailData.startTime && detailData.startTime != 0
            ? moment(parseInt(detailData.startTime)).format('YYYY-MM-DD')
            : '--'
        }}
      </h-desc-item>
      <h-desc-item label="结束日期">
        {{
          detailData.endTime && detailData.endTime != 0
            ? moment(parseInt(detailData.endTime)).format('YYYY-MM-DD')
            : '--'
        }}
      </h-desc-item>
      <h-desc-item label="备注">
        {{ detailData.remarks ? detailData.remarks : '--' }}
      </h-desc-item>
    </h-desc>
  </h-modal>
</template>
<script>
import moment from 'moment'
import HDesc from '../../../../../../components/HDesc/HDesc.vue'
export default {
  components: { HDesc },
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  data() {
    return {
      moment,
      visible: false,
      detailData: {},
    }
  },
  methods: {
    show(record) {
      this.visible = true
      this.detailData = record
    },
    handleCancel(e) {
      this.visible = false
      this.detailData = {}
    },
  },
}
</script>

<style lang="less" scoped>
/deep/ .ant-descriptions-title {
  margin-bottom: 0;
}
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