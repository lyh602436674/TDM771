<!--
 * @Author: 陈乾龙
 * @Date: 2021-10-27 09:17:06
 * @LastEditTime: 2021-10-29 17:38:21
 * @LastEditors: 陈乾龙
 * @Description: 试验检查项，根据传入的试验id查询绑定好的试验检查项
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\components\TestTaskCheck.vue
-->
<template>
  <div class="test-task-check">
    <a-empty v-if="!testId" />
    <div v-else>
      <h-card title="试前检查" :bordered="false" :showCollapse="true">
        <div v-if="beforeCheckInfo && beforeCheckInfo.length > 0" slot="table-operator">
          <a-button type="ghost-primary" size="small" @click="handleFillAll('beforeCheckInfo')"> 一键审核 </a-button>
          <a-button type="ghost-primary" size="small" @click="handleCheckAll('beforeCheckInfo')"> 一键复核 </a-button>
        </div>
        <div slot="content" class="check-list">
          <a-empty v-if="beforeCheckInfo && beforeCheckInfo.length <= 0" />
          <template v-else>
            <div class="check-list-item check-list-item-center">
              <div class="check-name">检查项名称</div>
              <div class="check-content">检查项内容</div>
              <div class="check-require">检查项要求</div>
              <div class="check-res">检查结果</div>
              <div class="check-res-person">试验员</div>
              <div class="check-flag-person">检验员</div>
            </div>
            <div v-for="(item, index) in beforeCheckInfo" class="check-list-item">
              <div class="check-name check-list-item-center">
                {{ item.itemName }}
              </div>
              <div class="check-content">
                {{ item.itemContent }}
              </div>
              <div class="check-require">
                {{ item.itemRequire }}
              </div>
              <div
                class="check-res check-list-item-center"
                @click="() => handleCheckRes(item, index, 'beforeCheckInfo')"
              >
                <div v-if="item.itemRes == '1'" class="check-box"></div>
                <h-icon v-else-if="item.itemRes == '2'" type="icon-wancheng1" class="success-text" />
                <h-icon v-else type="icon-chacha" class="danger-text" />
              </div>
              <div class="check-res-person" @click="() => handleFillCheck(item, index)">
                {{ item.fillUserName || '--' }}
              </div>
              <div class="check-flag-person" @click="() => handleFlagCheck(item, index)">
                {{ item.checkUserName || '--' }}
              </div>
            </div>
          </template>
        </div>
      </h-card>
      <h-card title="试中检查" :bordered="false" :showCollapse="true">
        <div v-if="inCheckInfo && inCheckInfo.length > 0" slot="table-operator">
          <a-button type="ghost-primary" size="small" @click="handleFillAll('inCheckInfo')"> 一键审核 </a-button>
          <a-button type="ghost-primary" size="small" @click="handleCheckAll('inCheckInfo')"> 一键复核 </a-button>
        </div>
        <div slot="content" class="check-list">
          <a-empty v-if="inCheckInfo && inCheckInfo.length <= 0" />
          <template v-else>
            <div class="check-list-item check-list-item-center">
              <div class="check-name">检查项名称</div>
              <div class="check-content">检查项内容</div>
              <div class="check-require">检查项要求</div>
              <div class="check-res">检查结果</div>
              <div class="check-res-person">试验员</div>
              <div class="check-flag-person">检验员</div>
            </div>
            <div v-for="(item, index) in inCheckInfo" class="check-list-item">
              <div class="check-name check-list-item-center">
                {{ item.itemName }}
              </div>
              <div class="check-content">
                {{ item.itemContent }}
              </div>
              <div class="check-require">
                {{ item.itemRequire }}
              </div>
              <div class="check-res check-list-item-center" @click="() => handleCheckRes(item, index, 'inCheckInfo')">
                <div v-if="item.itemRes == '1'" class="check-box"></div>
                <h-icon v-else-if="item.itemRes == '2'" type="icon-wancheng1" class="success-text" />
                <h-icon v-else type="icon-chacha" class="danger-text" />
              </div>
              <div class="check-res-person" @click="() => handleFillCheck(item, index)">
                {{ item.fillUserName || '--' }}
              </div>
              <div class="check-flag-person" @click="() => handleFlagCheck(item, index)">
                {{ item.checkUserName || '--' }}
              </div>
            </div>
          </template>
        </div>
      </h-card>
      <h-card title="试后检查" :bordered="false" :showCollapse="true">
        <div v-if="afterCheckInfo && afterCheckInfo.length > 0" slot="table-operator">
          <a-button type="ghost-primary" size="small" @click="handleFillAll('afterCheckInfo')"> 一键审核 </a-button>
          <a-button type="ghost-primary" size="small" @click="handleCheckAll('afterCheckInfo')"> 一键复核 </a-button>
        </div>
        <div slot="content" class="check-list">
          <a-empty v-if="afterCheckInfo && afterCheckInfo.length <= 0" />
          <template v-else>
            <div class="check-list-item check-list-item-center">
              <div class="check-name">检查项名称</div>
              <div class="check-content">检查项内容</div>
              <div class="check-require">检查项要求</div>
              <div class="check-res">检查结果</div>
              <div class="check-res-person">试验员</div>
              <div class="check-flag-person">检验员</div>
            </div>
            <div v-for="(item, index) in afterCheckInfo" class="check-list-item">
              <div class="check-name check-list-item-center">
                {{ item.itemName }}
              </div>
              <div class="check-content">
                {{ item.itemContent }}
              </div>
              <div class="check-require">
                {{ item.itemRequire }}
              </div>
              <div
                class="check-res check-list-item-center"
                @click="() => handleCheckRes(item, index, 'afterCheckInfo')"
              >
                <div v-if="item.itemRes == '1'" class="check-box"></div>
                <h-icon v-else-if="item.itemRes == '2'" type="icon-wancheng1" class="success-text" />
                <h-icon v-else type="icon-chacha" class="danger-text" />
              </div>
              <div class="check-res-person" @click="() => handleFillCheck(item, index)">
                {{ item.fillUserName || '--' }}
              </div>
              <div class="check-flag-person" @click="() => handleFlagCheck(item, index)">
                {{ item.checkUserName || '--' }}
              </div>
            </div>
          </template>
        </div>
      </h-card>
    </div>
    <ensure-modal ref="ensureModal" />
  </div>
</template>

<script>
import { postAction } from '@/api/manage'
import { isArray, isObject } from 'lodash'
import ensureModal from './CheckEnsureModal.vue'
export default {
  name: 'TestTaskCheck',
  props: {
    testId: {
      type: String,
      default: null,
    },
  },
  components: { ensureModal },
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
  mounted() {
    if (this.testId) {
      this.getCheckDetail()
    }
  },
  methods: {
    getCheckDetail() {
      console.log(this.testId)
      postAction(this.url.detail, { id: this.testId }).then((res) => {
        if (res.code == 200) {
          let { beforeCheckInfo, inCheckInfo, afterCheckInfo } = res.data
          this.beforeCheckInfo = isArray(beforeCheckInfo) && beforeCheckInfo.length ? beforeCheckInfo : []
          this.inCheckInfo = isArray(inCheckInfo) && inCheckInfo.length ? inCheckInfo : []
          this.afterCheckInfo = isArray(afterCheckInfo) && afterCheckInfo.length ? afterCheckInfo : []
        }
      })
    },
    handleCheckRes(item, index, type) {
      let itemRes = item.itemRes
      if (itemRes == 1) {
        itemRes = 2
      } else if (itemRes == 2) {
        itemRes = 3
      } else if (itemRes == 3) {
        itemRes = 2
      }
      this.$set(this[type][index], 'itemRes', itemRes)
    },
    handleFillCheck(item, index) {
      let record = {
        checkItemInfo: [],
      }
      if (isArray(item)) {
        record.checkItemInfo = item
      } else if (isObject(item)) {
        record.checkItemInfo.push({
          id: item.id,
          itemRes: item.itemRes,
        })
      }
      this.$refs.ensureModal.show(record, this.handleFillSubmit)
    },
    handleFlagCheck(item, index) {
      let record = {
        checkItemInfo: [],
      }
      if (isArray(item)) {
        record.checkItemInfo = item
      } else if (isObject(item)) {
        record.checkItemInfo.push({
          id: item.id,
        })
      }
      this.$refs.ensureModal.show(record, this.handleCheckSubmit)
    },
    handleFillSubmit(values) {
      postAction(this.url.fill, values).then((res) => {
        if (res.code == 200) {
          this.$message.success('检查审核成功')
          this.getCheckDetail()
          this.$refs.ensureModal.handleCancel()
        }
      })
    },
    handleFillAll(type) {
      let items = this[type].map((item) => {
        return {
          id: item.id,
          itemRes: item.itemRes,
        }
      })
      this.handleFillCheck(items)
    },
    handleCheckAll(type) {
      let items = this[type].map((item) => {
        return {
          id: item.id,
        }
      })
      this.handleFlagCheck(items)
    },
    handleCheckSubmit(values) {
      postAction(this.url.check, values).then((res) => {
        if (res.code == 200) {
          this.$message.success('检查复核成功')
          this.getCheckDetail()
          this.$refs.ensureModal.handleCancel()
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
    flex: 1;
  }
  .check-res {
    width: 70px;
    cursor: pointer;
  }
  .check-res-person {
    .check-list-item-center;
    width: 120px;
    cursor: pointer;
  }
  .check-flag-person {
    .check-list-item-center;
    width: 120px;
    cursor: pointer;
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