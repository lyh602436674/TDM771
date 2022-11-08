<template>
  <div ref='workingSchedule' class='workingSchedule'>
    <h-card fixed bordered>
      <template slot='title'>排班计划表</template>
      <h-tabs fixed slot='content' :activeKey="activeKey" type="card" @change="handleTabsChange">
        <a-button v-if="activeKey !== '2'" :loading="saveLoading" slot="tabBarExtraContent" type="primary"
                  @click="handleSave">保存
        </a-button>
        <a-tab-pane key="1" tab="当月排班">
          <working-schedule-table ref="monthlyTable" :table-data="monthlyTableData" :userList="userList"
                                  tableEdit table-data-name="monthlyTableData"></working-schedule-table>
        </a-tab-pane>
        <a-tab-pane key="2" tab="历史排班" :forceRender="true">
          <working-schedule-table :table-data="historyTableData" table-data-name="historyTableData"
                                  :userList="userList"></working-schedule-table>
        </a-tab-pane>
        <a-tab-pane key="3" tab="下月排班" :forceRender="true">
          <working-schedule-table ref="nextMonthTableData" :table-data="nextMonthTableData" tableEdit
                                  table-data-name="nextMonthTableData" :userList="userList"></working-schedule-table>
        </a-tab-pane>
      </h-tabs>
    </h-card>
  </div>
</template>

<script>
import {getAction, postAction} from '@/api/manage'
import WorkingScheduleTable from "./WorkingScheduleTable";
import {randomUUID} from '@/utils/util';

export default {
  name: "WorkingScheduleList",
  components: {WorkingScheduleTable},
  data() {
    return {
      activeKey: "1",
      historyTableData: [],
      monthlyTableData: [],
      nextMonthTableData: [],
      queryParams: {},
      url: {
        list: "/DutyRoster/showDutyRoster",
        user: "/DutyRoster/showUser",
        save: "/DutyRoster/saveDutyRoster"
      },
      userList: [],
      saveLoading: false,
    }
  },
  created() {
    this.loadData()
    this.getUserList()
  },
  // 如果页面开启缓存了就把下面的放开，把created删掉
  // activated() {
  //   this.loadData()
  //   this.getUserList()
  // },
  methods: {
    loadData() {
      postAction(this.url.list).then((res) => {
        if (res.code === 200) {
          let {monthly, history, nextMonth} = res.data

          function setRandomUUID(arr) {
            return arr.map(item => {
              return {...item, id: randomUUID()}
            })
          }

          this.monthlyTableData = setRandomUUID(monthly)
          this.historyTableData = setRandomUUID(history)
          this.nextMonthTableData = setRandomUUID(nextMonth)
        }
      })
    },
    handleSave() {
      this.saveLoading = true
      let that = this

      function saveMethod(data) {
        postAction(that.url.save, data).then(res => {
          if (res.code === 200) {
            that.$message.success('保存成功')
            that.saveLoading = false
          } else {
            that.$message.warning('保存失败，请检查网络')
          }
        })
      }

      switch (this.activeKey) {
        case '1':
          saveMethod(this.$refs.monthlyTable.$refs.workTable.getData());
          break;
        case '3':
          saveMethod(this.$refs.nextMonthTableData.$refs.workTable.getData())
          break;
      }

    },
    handleTabsChange(value) {
      this.activeKey = value
    },
    getUserList() {
      getAction(this.url.user).then((res) => {
        if (res.code === 200) {
          this.userList = res.data
        } else {
          this.$message.warning('获取用户数据失败')
        }
      })
    },
  }
}
</script>

<style scoped lang="less">
.workingSchedule {
  height: 100%;
}

/deep/ .ant-select-selection-selected-value {
  width: 100%;
}
</style>