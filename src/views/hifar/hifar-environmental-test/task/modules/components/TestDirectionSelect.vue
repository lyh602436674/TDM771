<!--
 * @Author: 陈乾龙
 * @Date: 2021-11-01 18:12:03
 * @LastEditTime: 2022-04-12 14:05:44
 * @LastEditors: 雷宇航
 * @Description: 试验方向下拉选择
 * @FilePath: \tdm200-client\tdm200-client\src\views\hifar\hifar-environmental-test\task\modules\components\TestDirectionSelect.vue
-->
<template>
  <div class="hifar-test-direction">
    <div ref="testDirectionInput" class="test-direction-input" tabindex="1" @click="handleInputSelect">
      <span>
        {{ selectedValue }}
      </span>
      <a-icon :type="localVisible ? 'down' : 'up'" />
    </div>
    <div ref="testDirectionSelect" :class="['hifar-test-direction-pop', localVisible ? 'active' : '']">
      <div v-if="treeData && treeData.length <= 0" class="empty">
        <span>没有查到数据</span>
      </div>
      <template v-else>
        <a-tree
          :checkable="true"
          :multiple="true"
          :checkedKeys="selectedKey"
          :selectable="false"
          :replaceFields="replaceFields"
          :treeData="treeData"
          @check="handleCheck"
        ></a-tree>
      </template>
    </div>
  </div>
</template>

<script>
import { postAction } from '@/api/manage'
import { createTree } from '@/utils/hasPermission'
import { isString, isArray } from 'lodash'
export default {
  props: {
    size: {
      type: String,
      default: 'small',
    },
    placeholder: {
      type: String,
      default: '请选择',
    },
    value: {
      type: [String, Array],
      default: () => [],
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        if (isArray(val)) {
          this.selectedKey = val
        } else if (isString(val)) {
          this.selectedKey = val.split(',')
        }
      },
    },
  },
  data() {
    let selectedKey = []
    if (isArray(this.value)) {
      this.selectedKey = this.value
    } else if (isString(this.value)) {
      this.selectedKey = this.value.split(',')
    }
    return {
      url: {
        list: '/HfEnvTestDirectionBusiness/listAll',
      },
      localVisible: false,
      checkedKeys: [],
      treeData: [],
      selectedKey: selectedKey,
      selectedOption: null,
      selectedValue: null,
      replaceFields: {
        children: 'children',
        title: 'testDirectionName',
        value: 'id',
        key: 'id',
      },
    }
  },
  created() {
    this.getTreeData()
  },
  methods: {
    handleCheck(checkedKeys, e) {
      // 这里对选择框做聚焦操作
      this.$refs.testDirectionInput.focus()
      this.selectedKey = checkedKeys
      let { checkedNodes } = e
      let selectedValue = []
      this.selectedOption = checkedNodes.map((item) => {
        selectedValue.push(item.data.props.testDirectionName)
        return item.data.props
      })
      this.selectedValue = selectedValue.join(',')
      this.triggerChange()
    },
    triggerChange() {
      this.$emit('change', this.selectedKey, this.selectedOption)
      this.$emit('input', this.selectedKey, this.selectedOption)
    },
    handleInputSelect(event) {
      if (this.localVisible) return (this.localVisible = false)
      // 计算弹窗弹出后固定到的位置
      let { srcElement } = event
      let { offsetHeight, offsetWidth } = srcElement
      let top = srcElement.getBoundingClientRect().top
      let left = srcElement.getBoundingClientRect().left
      this.$refs.testDirectionSelect.style.top = top + offsetHeight + 'px'
      this.$refs.testDirectionSelect.style.left = left + 'px'
      this.$refs.testDirectionSelect.style.width = offsetWidth + 'px'
      this.localVisible = true
    },
    getTreeData(params = {}) {
      postAction(this.url.list, params).then((res) => {
        if (res.code == 200) {
          let data = []
          let treeData = []
          let selectedOption = [],
            selectedValue = []
          res.data.map((item) => {
            if (this.selectedKey.includes(item.id)) {
              selectedOption.push(item)
              selectedValue.push(item.testDirectionName)
            }
            let dept = {
              title: item.testDirectionName,
              testDirectionName: item.testDirectionName,
              id: item.id,
              pid: item.pid,
              testDirectionId: item.id,
            }
            treeData.push(dept)
          })
          createTree(treeData, data, null, '0')
          this.treeData = data
          this.selectedOption = selectedOption
          this.selectedValue = selectedValue.join(',')
        }
      })
    },
  },
}
</script>

<style lang="less">
.hifar-test-direction {
  width: 100%;
  position: relative;
  .test-direction-input {
    padding: 4px 11px;
    height: 32px;
    border-radius: @border-radius-base;
    border: solid 1px @border-color-base;
    width: 100%;
    background: #fff;
    cursor: pointer;
    font-size: 14px;
    overflow: hidden;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    span {
      pointer-events: none;
      flex: 1;
      height: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      line-height: 19px;
    }
    .anticon {
      pointer-events: none;
      font-size: 14px;
    }
    &:focus {
      border-color: @primary-color;
    }
  }
  &-pop {
    position: fixed;
    height: 0;
    overflow: hidden;
    transition: height 0.2s linear;
    list-style: none;
    padding: 0 5px;
    width: 100%;
    background: #fff;
    z-index: 10;
    margin: 0;
    margin-block-end: 0;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    max-height: 300px;
    box-sizing: border-box;
    .empty {
      width: 100%;
      height: 100px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }
    &.active {
      height: auto;
      overflow-y: auto;
      border-radius: @border-radius-base;
      border: solid 1px @border-color-base;
    }
  }
}
</style>
