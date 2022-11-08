<!--
 * @Author: 赵峰
 * @Date: 2021-08-05 13:54:42
 * @LastEditTime: 2021-11-10 15:18:13
 * @LastEditors: 赵峰
 * @Descripttion: 员工档案详情
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\user\modules\userFileDetailModal.vue
-->
<template>
  <h-modal title="详情" inner :getContainer="getContainer" :visible="visible" :width="1100" @cancel="handleCancel">
    <div class="footer" slot="footer">
      <a-button @click="handleCancel" type="ghost-danger"> 关闭 </a-button>
    </div>
    <h-desc :data="detailData" size="small" :column="2" labelWidth="110px" title='基本信息'>
      <h-desc-item label="姓名">
        {{ detailData.idName ? detailData.idName : '--' }}
      </h-desc-item>
      <h-desc-item label="工号">
        {{ detailData.jobNo ? detailData.jobNo : '--' }}
      </h-desc-item>
      <h-desc-item label="性别">
        {{ detailData.sex == 1 ? '男' : detailData.sex == 2 ? '女' : detailData.sex == 0 ? '保密' : '--' }}
      </h-desc-item>
      <h-desc-item label="状态">
        {{ detailData.status == 1 ? '在职' : detailData.status == 2 ? '离职' : '--' }}
      </h-desc-item>
      <h-desc-item label="部门">
        {{ detailData.deptName ? detailData.deptName : '--' }}
      </h-desc-item>
      <h-desc-item label="加入时间">
        {{
          detailData.entryTime && detailData.entryTime != 0
            ? moment(parseInt(detailData.entryTime)).format('YYYY-MM-DD')
            : '--'
        }}
      </h-desc-item>
      <h-desc-item label="职务">
        {{ detailData.postName ? detailData.postName : '--' }}
      </h-desc-item>
      <h-desc-item label="电话">
        {{ detailData.mobile ? detailData.mobile : '--' }}
      </h-desc-item>
      <h-desc-item label="邮箱">
        {{ detailData.email ? detailData.email : '--' }}
      </h-desc-item>
      <h-desc-item label="出生日期">
        {{
          detailData.birthday && detailData.birthday != 0
            ? moment(parseInt(detailData.birthday)).format('YYYY-MM-DD')
            : '--'
        }}
      </h-desc-item>
      <h-desc-item label="民族">
        {{ detailData.nationName ? detailData.nationName : '--' }}
      </h-desc-item>
      <h-desc-item label="政治面貌">
        {{ detailData.politicName ? detailData.politicName : '--' }}
      </h-desc-item>
      <h-desc-item label="最高学历">
        {{ detailData.eduName ? detailData.eduName : '--' }}
      </h-desc-item>
      <h-desc-item label="毕业院校">
        {{ detailData.school ? detailData.school : '--' }}
      </h-desc-item>
      <h-desc-item label="专业">
        {{ detailData.school ? detailData.school : '--' }}
      </h-desc-item>
      <h-desc-item label="毕业时间">
        {{
          detailData.graduationTime && detailData.graduationTime != 0
            ? moment(parseInt(detailData.graduationTime)).format('YYYY-MM-DD')
            : '--'
        }}
      </h-desc-item>
      <h-desc-item label="备注">
        {{ detailData.remarks ? detailData.remarks : '--' }}
      </h-desc-item>
    </h-desc>
    <div class="h-descriptions-title" style="margin-top: 30px">
      <span class="content">工作履历</span>
    </div>
    <vxe-table
      border
      show-all-overflow
      keep-source
      :checkbox-config="{ highlight: true }"
      ref="AcceptanceRecordTable"
      :data="workRecordData"
    >
      <vxe-table-column type="seq" width="60"></vxe-table-column>
      <vxe-table-column title="起始时间" field="startTime"></vxe-table-column>
      <vxe-table-column title="结束时间" field="endTime"></vxe-table-column>
      <vxe-table-column title="工作单位" field="compayName"></vxe-table-column>
      <vxe-table-column title="部门" field="deptName"></vxe-table-column>
      <vxe-table-column title="职务" field="postName"></vxe-table-column>
      <vxe-table-column title="备注" field="remarks"></vxe-table-column>
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
      url: {
        detailWorkById: '/HfResPersonWorkRecordBusiness/listAllByPersonId',
      },
      workRecordData:[]
    }
  },
  methods: {
    show(record) {
      this.visible = true
      this.detailData = record
      if (record.id) {
        this.loadWorkDetail(record.id)
      }
    },
    handleCancel(e) {
      this.visible = false
      this.detailData = {}
    },
    loadWorkDetail(id) {
      postAction(this.url.detailWorkById, { personId: id }).then((res) => {
        if (res.code == 200) {
          let record = res.data
          let workRecordList = []
          console.log(res)
          if (record.length > 0) {
            record.forEach((item) => {
              workRecordList.push({
                id: item.id ? item.id : '',
                personId: item.personId ? item.personId : '',
                compayName: item.compayName ? item.compayName : '',
                deptName: item.deptName ? item.deptName : '',
                startTime:item.startTime && item.startTime != 0 ? moment(parseInt(item.startTime)).format('YYYY-MM-DD') : '',
                endTime: item.endTime && item.endTime != 0 ? moment(parseInt(item.endTime)).format('YYYY-MM-DD') : '',
                postName: item.postName ? item.postName : '',
                remarks: item.remarks ? item.remarks : '',
              })
            })
          }
          this.workRecordData = workRecordList
        }
      })
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