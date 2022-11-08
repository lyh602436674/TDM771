<!--
 * @Author: 赵峰
 * @Date: 2021-08-24 09:21:32
 * @LastEditTime: 2021-09-30 14:34:21
 * @LastEditors: 赵峰
 * @Descripttion: 用户意见分页列表
 * @FilePath: \hifar-platform-client\src\views\hifar\comments\CommentsList.vue
-->
<template>
  <div ref="pageWrapper" class="h-custom-layout" style="height: 100%; position: relative">
    <h-card>
      <template slot="title"> 问题反馈 </template>
      <h-tabs fixed :activeKey="activeKey" :animated="true" @change="handleTabsChange">
        <a-tab-pane key="1">
          <a-badge :count="0" slot="tab" :offset="offset">现有问题</a-badge>
          <comments-table ref="CommentsTable"></comments-table>
        </a-tab-pane>
        <a-tab-pane key="2">
          <a-badge :count="0" slot="tab" :offset="offset">历史问题</a-badge>
          <comments-history-table ref="CommentsHistoryTable"></comments-history-table>
        </a-tab-pane>
      </h-tabs>
    </h-card>
  </div>
</template>

<script>
import CommentsTable from './CommentsTable.vue'
import CommentsHistoryTable from './CommentsHistoryTable.vue'
export default {
  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper,
    }
  },

  components: {
    CommentsTable,
    CommentsHistoryTable
  },

  data() {
    return {
      activeKey: '1',
      offset: [10, 1],
    }
  },

  methods: {
    handleTabsChange(v) {
      this.activeKey = v
      if (v == 1) {
        setTimeout(()=>{
          this.$refs.CommentsTable.refresh(true)
        },200)
      } else {
        setTimeout(()=>{
          this.$refs.CommentsHistoryTable.refresh(true)
        },200)
      }
    },
  },
}
</script>
<style lang='less' scoped>
</style>