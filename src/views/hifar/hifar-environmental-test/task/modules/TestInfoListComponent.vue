<template>
  <div>
    <vxe-table
      size="mini"
      border
      resizable
      style="width: 1530px"
      :data='loacalDataSource'
      keep-source
      show-overflow>
      <vxe-table-column type="seq" title="#" width="40" align="center"></vxe-table-column>
      <vxe-table-column field="equipName" title="设备名称"/>
      <vxe-table-column field="equipModel" title="设备型号"/>
      <vxe-table-column field="testCode" title="试验编号"/>
      <vxe-table-column field="testNames" title="试验项目"/>
      <vxe-table-column field="status" title="状态">
        <template v-slot="{ row }">
          <a-badge v-if="row.status === 0" color="grey" text="未发布"/>
          <a-badge v-else-if="row.status === 1" color="geekblue" text="已发布"/>
          <a-badge v-else-if="row.status === 10" color="red" text="已撤销"/>
          <a-badge v-else-if="row.status === 20" color="green" text="进行中"/>
          <a-badge v-else-if="row.status === 30" color="volcano" text="暂停"/>
          <a-badge v-else-if="row.status === 40" color="red" text="终止"/>
          <a-badge v-else-if="row.status === 45" color="yellow" text="异常"/>
          <a-badge v-else-if="row.status === 50" color="grey" text="已完成"/>
          <a-badge v-else-if="row.status === 60" color="grey" text="已出报告"/>
        </template>
      </vxe-table-column>
      <vxe-table-column field="chargeUserName" title="试验员"/>
      <vxe-table-column field="testRate" title="设备速率"/>
      <vxe-table-column field="predictStartTime" width="140" :formatter="formatTime" title="预计开始时间"/>
      <vxe-table-column field="predictUseTime" title="预计时长(h)"/>
      <vxe-table-column field="realStartTime" width="140" :formatter="formatTime" title="实际开始时间"/>
      <vxe-table-column field="realEndTime" width="140" :formatter="formatTime" title="实际结束时间"/>
      <vxe-table-column width="100" align="center" field="actions" title="操作">
        <template v-slot="{row}">
          <a-popconfirm title="确定发布吗？" @confirm="() => handleRelease(row.id)">
            <a v-if="[0].includes(row.status)">发布</a>
          </a-popconfirm>
          <a-divider v-if="[0].includes(row.status)" type="vertical"/>
          <a-popconfirm title="确定删除吗？" @confirm="() => handleDelete(row.id)">
            <a v-if="[0].includes(row.status)" style="color: red">删除</a>
          </a-popconfirm>
          <a-popconfirm title="确定撤销吗？" @confirm="() => handleBack(row)">
            <a v-if="row.status === 1">撤销</a>
          </a-popconfirm>
        </template>
      </vxe-table-column>
    </vxe-table>
  </div>
</template>

<script>
import moment from 'moment'
import {postAction} from '@/api/manage'
import {dateTimeFormatByStamp} from "@/utils/util";

export default {
  name: "TestInfoListComponent",
  props: {
    dataSource: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    dataSource: {
      immediate: true,
      deep: true,
      handler(val) {
        this.loacalDataSource = val
      },
    }
  },
  data() {
    return {
      moment,
      loacalDataSource: [],
      url: {
        testList: '/HfEnvTaskTestBusiness/listPageForTask',
        recover: '/HfEnvTaskTestBusiness/recover',
        release: '/HfEnvTaskTestBusiness/release', // 发布url
        delete: '/HfEnvTaskTestBusiness/logicRemoveById' // 删除
      },
    }
  },
  methods: {
    formatTime({cellValue, row, column}) {
      return dateTimeFormatByStamp(cellValue)
    },
    refresh() {
      this.$emit('change')
    },
    handleBack(record) {
      postAction(this.url.recover, {id: record.id}).then((res) => {
        if (res.code === 200) {
          this.$message.success('操作成功')
          this.refresh()
        }
      })
    },
    /**
     * 发布
     * @param id 试验id
     */
    handleRelease(id) {
      postAction(this.url.release, {id}).then((res) => {
        if (res.code === 200) {
          if (res.msg) {
            this.$message.success(res.msg)
          } else {
            this.$message.success('操作成功')
          }
          this.refresh()
        } else {
          this.$message.warning('发布失败')
        }
      })
    },
    handleDelete(id) {
      postAction(this.url.delete, {id}).then((res) => {
        if (res.code == 200) {
          this.$message.success('操作成功')
          this.refresh()
        } else {
          this.$message.success('删除失败')
        }
      })
    }
  }
}
</script>


