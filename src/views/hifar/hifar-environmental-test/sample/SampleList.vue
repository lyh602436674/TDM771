<!--
 * @Author: 赵峰
 * @Date: 2021-08-17 15:17:30
 * @LastEditTime: 2021-09-22 15:39:53
 * @LastEditors: 赵峰
 * @Descripttion: 试品管理
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\sample\SampleList.vue
-->
<template>
  <div ref="pageWrapper" class="h-custom-layout" style="height: 100%; position: relative">
    <h-card :bordered="false">
      <template slot="title"> 试品管理 </template>
      <div class="test-tabs">
        <div
          :class="activeKey == index ? 'test-tab-pane tab-active' : 'test-tab-pane'"
          v-for="(item, index) in tabList"
          :key="index"
          @click="handleTabsChange(index)"
        >
          {{ item.title }}
          <span v-if="activeKey == index" class="ant-tabs-ink-bar"></span>
        </div>
      </div>
      <sample-table v-if="activeKey == 0" ref="accesSampleTable" :status="1"></sample-table>
      <sampled-table v-if="activeKey == 1" ref="receiveSampleTable" :status="10"></sampled-table>
    </h-card>
  </div>
</template>

<script>
import { postAction } from '@/api/manage'
import SampleTable from './modules/SampleTable'
import SampledTable from './modules/SampledTable'
export default {
  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper,
    }
  },
  components: {
    SampleTable,
    SampledTable,
  },

  data() {
    return {
      activeKey: 0,
      treeCustData: [],
      treeData: [],
      entrustCode: '',
      custId: '',
      tabList: [
        {
          id: 0,
          title: '待接收',
        },
        {
          id: 1,
          title: '已接收',
        },
      ],
    }
  },
  created() {},
  methods: {
    handleTabsChange(v) {
      this.activeKey = v
    },
  },
}
</script>
<style lang='less' scoped>
.test-tabs {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e8e8e8;
  .test-tab-pane {
    padding: 4px 16px;
    position: relative;
    display: inline-block;
    box-sizing: border-box;
    height: 100%;
    margin: 0 32px 0 0;
    text-decoration: none;
    cursor: pointer;
    transition: color 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

    .ant-tabs-ink-bar {
      width: 74px;
      position: absolute;
      bottom: 1px;
      left: 0;
      z-index: 1;
      box-sizing: border-box;
      height: 2px;
      background-color: #409eff;
      transform-origin: 0 0;
    }
  }
  .tab-active {
    color: #409eff;
    font-weight: 500;
  }
}
</style>