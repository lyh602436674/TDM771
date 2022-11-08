<!--
 * @Author: 赵峰
 * @Date: 2021-11-05 11:53:26
 * @LastEditTime: 2021-11-05 12:02:50
 * @LastEditors: 赵峰
 * @Descripttion: 试验检查项，根据传入的试验id查询绑定好的试验检查项详情
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\components\detail\TestTaskCheck.vue
-->
<template>
  <div class="test-task-check">
    <a-empty v-if="!testId"/>
    <div v-else>
      <h-card :bordered="false" :showCollapse="true" title="试前检查">
        <div slot="content" class="check-list">
          <a-empty v-if="beforeCheckInfo && beforeCheckInfo.length <= 0"/>
          <template v-else>
            <div class="check-list-item check-list-item-center">
              <div class="check-name">检查项名称</div>
              <div class="check-content">检查项内容</div>
              <div class="check-require">检查项要求</div>
              <div class="check-res">检查结果</div>
              <div class="check-res-person">试验员</div>
              <div class="check-flag-person">检验员</div>
            </div>
            <div v-for="(item, index) in beforeCheckInfo" :key="index" class="check-list-item">
              <div class="check-name check-list-item-center">
                {{ item.itemName }}
              </div>
              <div class="check-content">
                {{ item.itemContent }}
              </div>
              <div class="check-require">
                {{ item.itemRequire }}
              </div>
              <div class="check-res check-list-item-center">
                <h-icon v-if="item.itemRes == '2'" class='success-text' type='icon-wancheng1'/>
                <h-icon v-else-if="item.itemRes == '3'" class='danger-text' type='icon-chacha'/>
                <span v-else style="display:inline-block;width:100%;text-align: left;" v-text="item.itemRes"></span>
              </div>
              <div class="check-res-person">
                {{ item.fillUserName || '--' }}
              </div>
              <div class="check-flag-person">
                {{ item.checkUserName || '--' }}
              </div>
            </div>
          </template>
        </div>
      </h-card>
      <h-card :bordered="false" :showCollapse="true" title="试中检查">
        <div slot="content" class="check-list">
          <a-empty v-if="inCheckInfo && inCheckInfo.length <= 0"/>
          <template v-else>
            <div class="check-list-item check-list-item-center">
              <div class="check-name">检查项名称</div>
              <div class="check-content">检查项内容</div>
              <div class="check-require">检查项要求</div>
              <div class="check-res">检查结果</div>
              <div class="check-res-person">试验员</div>
              <div class="check-flag-person">检验员</div>
            </div>
            <div v-for="(item, index) in inCheckInfo" :key="index" class="check-list-item">
              <div class="check-name check-list-item-center">
                {{ item.itemName }}
              </div>
              <div class="check-content">
                {{ item.itemContent }}
              </div>
              <div class="check-require">
                {{ item.itemRequire }}
              </div>
              <div class="check-res check-list-item-center">
                <h-icon v-if="item.itemRes == '2'" class='success-text' type='icon-wancheng1'/>
                <h-icon v-else-if="item.itemRes == '3'" class='danger-text' type='icon-chacha'/>
                <span v-else style="display:inline-block;width:100%;text-align: left;" v-text="item.itemRes"></span>
              </div>
              <div class="check-res-person">
                {{ item.fillUserName || '--' }}
              </div>
              <div class="check-flag-person">
                {{ item.checkUserName || '--' }}
              </div>
            </div>
          </template>
        </div>
      </h-card>
      <h-card :bordered="false" :showCollapse="true" title="试后检查">
        <div slot="content" class="check-list">
          <a-empty v-if="afterCheckInfo && afterCheckInfo.length <= 0"/>
          <template v-else>
            <div class="check-list-item check-list-item-center">
              <div class="check-name">检查项名称</div>
              <div class="check-content">检查项内容</div>
              <div class="check-require">检查项要求</div>
              <div class="check-res">检查结果</div>
              <div class="check-res-person">试验员</div>
              <div class="check-flag-person">检验员</div>
            </div>
            <div v-for="(item, index) in afterCheckInfo" :key="index" class="check-list-item">
              <div class="check-name check-list-item-center">
                {{ item.itemName }}
              </div>
              <div class="check-content">
                {{ item.itemContent }}
              </div>
              <div class="check-require">
                {{ item.itemRequire }}
              </div>
              <div class="check-res check-list-item-center">
                <h-icon v-if="item.itemRes == '2'" class='success-text' type='icon-wancheng1'/>
                <h-icon v-else-if="item.itemRes == '3'" class='danger-text' type='icon-chacha'/>
                <span v-else style="display:inline-block;width:100%;text-align: left;" v-text="item.itemRes"></span>
              </div>
              <div class="check-res-person">
                {{ item.fillUserName || '--' }}
              </div>
              <div class="check-flag-person">
                {{ item.checkUserName || '--' }}
              </div>
            </div>
          </template>
        </div>
      </h-card>
    </div>
  </div>
</template>

<script>
import {postAction} from '@/api/manage'
import {isArray} from 'lodash'

export default {
  name: 'TestTaskCheck',
  props: {
    testId: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      beforeCheckInfo: [],
      inCheckInfo: [],
      afterCheckInfo: [],
      url: {
        detail: '/HfEnvTaskTestBusiness/queryTestCheckItem',
        fill: '/HfEnvTaskTestBusiness/saveTestCheckItem',
        check: '/HfEnvTaskTestBusiness/checkTestCheckItem',
      },
    }
  },
  created() {
    this.getCheckDetail()
  },
  methods: {
    getCheckDetail() {
      console.log(this.testId)
      postAction(this.url.detail, {id: this.testId}).then((res) => {
        if (res.code == 200) {
          let {beforeCheckInfo, inCheckInfo, afterCheckInfo} = res.data
          this.beforeCheckInfo = isArray(beforeCheckInfo) && beforeCheckInfo.length ? beforeCheckInfo : []
          this.inCheckInfo = isArray(inCheckInfo) && inCheckInfo.length ? inCheckInfo : []
          this.afterCheckInfo = isArray(afterCheckInfo) && afterCheckInfo.length ? afterCheckInfo : []
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>
.test-task-check {
  height: 100%;
  overflow: auto;
}

.check-list-item-center {
  text-align: center;
}

.check-list-item {
  display: flex;
  align-items: center;
  border: solid 1px @border-color-base;
  border-bottom: none;

  &:last-child {
    border-bottom: solid 1px @border-color-base;
    border-bottom-left-radius: @border-radius-base;
    border-bottom-right-radius: @border-radius-base;
  }

  &:first-child {
    border-top-left-radius: @border-radius-base;
    border-top-right-radius: @border-radius-base;
  }

  > div {
    border-right: solid 1px @border-color-base;
    min-height: 30px;
    padding: 5px;
    overflow: hidden;
    align-self: stretch;

    &:last-child {
      border-right: none;
    }
  }

  .check-name {
    width: 10%;
  }

  .check-content {
    width: 25%;
  }

  .check-require {
    width: 25%;
  }

  .check-res {
    width: 24%;
  }

  .check-res-person {
    .check-list-item-center;
    width: 8%;
  }

  .check-flag-person {
    .check-list-item-center;
    width: 8%;
  }

  .check-box {
    width: 18px;
    height: 18px;
    border: solid 1px @border-color-base;
    border-radius: @border-radius-base;
    margin: 0 auto;
  }
}
</style>