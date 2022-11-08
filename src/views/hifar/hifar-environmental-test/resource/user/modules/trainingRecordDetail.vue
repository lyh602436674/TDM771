<!--
 * @Author: 赵峰
 * @Date: 2021-08-06 17:54:55
 * @LastEditTime: 2021-11-10 15:22:09
 * @LastEditors: 赵峰
 * @Descripttion: 
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\user\modules\trainingRecordDetail.vue
-->
<template>
  <h-modal title="详情" inner :getContainer="getContainer" :visible="visible" :width="1000" @cancel="handleCancel">
    <div class="footer" slot="footer">
      <a-button @click="handleCancel" type="ghost-danger"> 关闭 </a-button>
    </div>
    <h-desc :data="detailData" size="small" :column="2" labelWidth="110px" title='基本信息'>
      <h-desc-item label="培训主题">
        {{ detailData.trainTheme ? detailData.trainTheme : '--' }}
      </h-desc-item>
      <h-desc-item label="培训时间">
        {{
          detailData.trainTime && detailData.trainTime != 0
            ? moment(parseInt(detailData.trainTime)).format('YYYY-MM-DD')
            : '--'
        }}
      </h-desc-item>
      <h-desc-item label="培训老师">
        {{ detailData.trainTeacher ? detailData.trainTeacher : '--' }}
      </h-desc-item>
      <h-desc-item label="培训方式">
        {{ detailData.trainMode == 1 ? '线下' : detailData.trainMode == 2 ? '线上' : '--' }}
      </h-desc-item>
      <h-desc-item label="培训内容" :span="2">
        {{ detailData.trainContent ? detailData.trainContent : '--' }}
      </h-desc-item>
      <h-desc-item label="备注">
        {{ detailData.remarks ? detailData.remarks : '--' }}
      </h-desc-item>
    </h-desc>
    <div class="h-descriptions-title" style="margin-top: 30px">
      <span class="content">培训结果</span>
    </div>
    <vxe-table
      border
      show-all-overflow
      keep-source
      :checkbox-config="{ highlight: true }"
      ref="AcceptanceRecordTable"
      :data="checkRecordData"
    >
      <vxe-table-column type="seq" width="60"></vxe-table-column>
      <vxe-table-column title="姓名" field="personName"></vxe-table-column>
      <vxe-table-column title="部门" field="deptName"></vxe-table-column>
      <vxe-table-column title="职务" field="postName"></vxe-table-column>
      <vxe-table-column title="出勤情况">
        <template #default="{ row }">
          <div>{{ row.workStatus == 1 ? '是' : row.workStatus == 2 ? '否' : '--' }}</div>
        </template>
      </vxe-table-column>
      <vxe-table-column title="考核结果">
        <template #default="{ row }">
          <div>{{ row.workStatus == 1 ? '合规' : row.workStatus == 2 ? '不合规' : row.workStatus == 3 ? '未考核' : '--' }}</div>
        </template>
      </vxe-table-column>
      <vxe-table-column title="具体成绩" field="workDesc" :width="200"></vxe-table-column>
    </vxe-table>
  </h-modal>
</template>
<script>
import moment from 'moment'
import { postAction } from '@/api/manage'
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
      checkRecordData: [],
      url: {
        detailCheckById: '/HfResPersonTrainCheckBusiness/listAllByTrainRecordId',
      },
    }
  },
  methods: {
    show(record) {
      this.visible = true
      this.detailData = record
      if (record.id) {
        this.loadCheckDetail(record.id)
      }
    },
    loadCheckDetail(id) {
      postAction(this.url.detailCheckById, { trainRecordId: id }).then((res) => {
        if (res.code == 200) {
          let record = res.data
          let checkRecordData = []
          if (record.length > 0) {
            record.forEach((item) => {
              checkRecordData.push({
                id: item.id,
                trainRecordId: item.trainRecordId,
                personId: item.personId ? item.personId : '',
                personName: item.personName ? item.personName : '',
                jobNo: item.jobNo ? item.jobNo : '',
                deptId: item.deptId ? item.deptId : '',
                deptName: item.deptName ? item.deptName : '',
                postName: item.postName ? item.postName : '',
                workStatus: item.workStatus ? item.workStatus : '',
                workRs: item.workRs ? item.workRs : '',
                workDesc: item.workDesc || item.workDesc == 0 ? item.workDesc / 100 : '',
              })
            })
          }
          this.checkRecordData = checkRecordData
        }
      })
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