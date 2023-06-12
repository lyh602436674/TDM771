<template>
  <div class="container">
    <vxe-table
      border
      show-all-overflow
      resizable
      stripe
      round
      keep-source
      :data="dataSource"
      class="table"
    >
      <vxe-table-column type="seq" width="60" align="center"></vxe-table-column>
      <vxe-table-column title="检查项名称" field="itemName"></vxe-table-column>
      <vxe-table-column title="检查项内容" field="itemContent"></vxe-table-column>
      <vxe-table-column title="检查项要求" field="itemRequire"></vxe-table-column>
      <vxe-table-column title="检查结果" field="checkFlag">
        <template v-slot="{row}">
          <h-icon v-if="row.itemRes === '1'" class='success-text' type='icon-wancheng1'/>
          <h-icon v-else-if="row.itemRes === '2'" class='danger-text' type='icon-chacha'/>
          <h-icon v-else-if="row.itemRes === '3'" class='danger-text' type='icon-xieti'/>
          <span v-else style='display:inline-block;width:100%;text-align: left;' v-text='row.itemRes'></span>
        </template>
      </vxe-table-column>
      <vxe-table-column title="试验员" field="fillUserName">
        <template v-slot="{row}">
          {{ row.fillUserName || '--' }}
          <div>{{ dateTimeFormatByStamp(row.fillTime) }}</div>
        </template>
      </vxe-table-column>
      <vxe-table-column title="复核人" field="checkUserName">
        <template v-slot="{row}">
          <template v-if='row.checkFlag === 2'>
            <h-icon type='icon-xieti'/>
          </template>
          <template v-else>
            {{ row.checkUserName || '--' }}
            <div>{{ dateTimeFormatByStamp(row.checkTime) }}</div>
          </template>
        </template>
      </vxe-table-column>
    </vxe-table>
  </div>
</template>

<script>
import {postAction} from "@api/manage";
import {dateTimeFormatByStamp} from "@/utils/util";

export default {
  name: "TestCheckListByBefore",
  data() {
    return {
      dateTimeFormatByStamp,
      dataSource: [],
      url: {
        checkInfo: '/HfEnvTaskTestBusiness/queryTestCheckItem',
      },
      testId: ""
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler(val) {
        let testId = val.query.testId
        if (testId) {
          this.loadData(testId)
        }
      },
    }
  },

  methods: {
    loadData(id) {
      postAction(this.url.checkInfo, {id}).then((res) => {
        if (res.code === 200) {
          this.dataSource = res.data.beforeCheckInfo
        }
      })
    },
  }
}
</script>

<style scoped lang="less">
.container {
  width: 100%;
  height: 100%;
  padding: 5px;
  overflow: hidden;

  .table {
    width: 100%;
    height: 100%;
    overflow: auto;
  }
}
</style>