<template>
  <div ref="approval" style="height: 100%; position: relative">
    <h-card>
      <template slot="title"> 终止审批</template>
      <h-tabs :activeKey="activeKey" :animated="true" fixed @change="handleTabsChange">
        <a-tab-pane key="1">
          <a-badge slot="tab" :count="taskCount" :offset="offset">试验安排</a-badge>
          <task-approval-list ref="taskApproval" @reload="getCount"></task-approval-list>
        </a-tab-pane>
        <a-tab-pane key="2">
          <a-badge slot="tab" :count="testCount" :offset="offset">试验任务</a-badge>
          <test-approval-list ref="testApproval" @reload="getCount"></test-approval-list>
        </a-tab-pane>
      </h-tabs>
    </h-card>
  </div>
</template>

<script>

import TaskApprovalList from "@views/hifar/hifar-environmental-test/approvalTerminated/TaskApprovalList";
import TestApprovalList from "@views/hifar/hifar-environmental-test/approvalTerminated/TestApprovalList";
import {postAction} from "@api/manage";

export default {
  name: "ApprovalTerminatedList",
  components: {TestApprovalList, TaskApprovalList},
  provide() {
    return {
      getContainer: () => this.$refs.approval,
    }
  },
  data() {
    return {
      activeKey: "1",
      offset: [10, 1],
      taskCount: 0,
      testCount: 0,
      url: {
        count: "HfEnvTestForceEndBusiness/queryTaskAndTestCount"
      }
    }
  },
  created() {
    this.getCount()
  },
  methods: {
    getCount() {
      postAction(this.url.count).then(res => {
        if (res.code === 200) {
          this.taskCount = res.data.taskCount
          this.testCount = res.data.testCount
        }
      })
    },
    handleTabsChange(val) {
      this.activeKey = val
    },
  },
}
</script>

<style scoped>

</style>