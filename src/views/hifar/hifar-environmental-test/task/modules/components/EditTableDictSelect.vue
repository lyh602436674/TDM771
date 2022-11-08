<!--
 * @Author: 陈乾龙
 * @Date: 2021-11-01 18:12:03
 * @LastEditTime: 2021-11-23 13:59:41
 * @LastEditors: 赵峰
 * @Description: 安装方法下拉选择
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\components\EditTableDictSelect.vue
-->
<template>
  <div class="hifar-install-method-select">
    <a-input
      v-model="selectedValue"
      :size="size"
      :placeholder="placeholder"
      @click="handleInputSelect"
      @input="handleInput"
      @blur="handleBlur"
    >
      <a-icon slot="suffix" :type="localVisible ? 'down' : 'up'" />
    </a-input>
    <ul ref="installMethodPopMenu" :class="['hifar-install-method-select-pop', localVisible ? 'active' : '']">
      <div class="empty" v-if="dictOptions && dictOptions.length <= 0">
        <span>没有查到数据</span>
      </div>
      <template v-else>
        <li v-for="(item, index) in dictOptions" :key="index" @click="() => handleClick(item, index)">
          {{ item.itemValue }}
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
import { getDictItemsFromCache, listByDictCode } from '@/api/api'
import { UI_CACHE_DB_DICT_DATA } from '@/store/mutation-types'
import { find, isEmpty, cloneDeep } from 'lodash'
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
      type: String,
      default: null,
    },
    dictCode: {
      type: String,
      default: null,
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(v) {
        this.selectedKey = v
        this.$nextTick(() => {
          this.initData()
        })
      },
    },
  },
  data() {
    return {
      localVisible: false,
      dictOptions: [],
      dictOptions_buffer: [],
      selectedKey: this.value || null,
      selectedOption: null,
      selectedValue: null,
    }
  },
  created() {
    this.getDictCode()
  },
  methods: {
    initData() {
      if (this.dictOptions_buffer && this.dictOptions_buffer.length) {
        if (this.selectedKey) {
          this.selectedOption = find(this.dictOptions_buffer, (obj) => {
            return obj.itemKey == this.selectedKey
          })
          if (this.selectedOption) {
            this.selectedValue = this.selectedOption.itemValue
          }
        }
      }
    },
    handleClick(item = {}) {
      this.selectedKey = item.itemKey
      this.selectedValue = item.itemValue
      this.selectedOption = item
      this.localVisible = false
      this.triggerChange()
    },
    triggerChange() {
      this.$emit('change', this.selectedKey, this.selectedOption)
      this.$emit('input', this.selectedKey, this.selectedOption)
    },
    handleInput(event) {
      let value = event.target.value
      if (isEmpty(value)) {
        this.getDictCode()
      } else {
        let dictOptions = []
        for (let i = 0, len = this.dictOptions_buffer.length; i < len; i++) {
          let item = this.dictOptions_buffer[i]
          var re = new RegExp(`[${item.itemValue}]`)
          if (re.test(value)) {
            dictOptions.push(item)
          }
          re = null
        }
        this.dictOptions = cloneDeep(dictOptions)
      }
    },
    handleBlur() {
      setTimeout(() => {
        this.localVisible = false
      }, 200)
    },
    handleInputSelect(event) {
      // 计算弹窗弹出后固定到的位置
      let { srcElement } = event
      let { offsetHeight, offsetWidth } = srcElement
      let top = srcElement.getBoundingClientRect().top
      let left = srcElement.getBoundingClientRect().left
      this.$refs.installMethodPopMenu.style.top = top + offsetHeight + 'px'
      this.$refs.installMethodPopMenu.style.left = left + 'px'
      this.$refs.installMethodPopMenu.style.width = offsetWidth + 'px'
      this.localVisible = true
    },
    getDictCode(params) {
      //优先从缓存中读取字典配置
      if (getDictItemsFromCache(this.dictCode)) {
        this.dictOptions = getDictItemsFromCache(this.dictCode)
        this.dictOptions_buffer = getDictItemsFromCache(this.dictCode)
        this.initData()
        return
      }
      listByDictCode(this.dictCode, params).then((res) => {
        if (res.code == 200) {
          let dictVal = this.$ls.get(UI_CACHE_DB_DICT_DATA)
          let dictCode = this.dictCode
          this.dictOptions_buffer = cloneDeep(res.data)
          this.dictOptions = res.data
          this.initData()
          this.$ls.remove(UI_CACHE_DB_DICT_DATA)
          this.$ls.set(UI_CACHE_DB_DICT_DATA, { ...dictVal, [dictCode]: res.data }, 7 * 24 * 60 * 60 * 1000)
        }
      })
    },
  },
}
</script>

<style lang="less">
.vxe-body--column {
  .hifar-install-method-select {
    &-pop {
      li {
        line-height: 1;
      }
    }
  }
}
.hifar-install-method-select {
  width: 100%;
  position: relative;
  &-pop {
    // position: absolute;
    position: fixed;
    height: 0;
    overflow: hidden;
    transition: height 0.2s linear;
    list-style: none;
    padding: 0;
    width: 100%;
    background: #fff;
    z-index: 10;
    margin: 0;
    padding-inline-start: 0;
    margin-block-start: 0;
    margin-block-end: 0;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    max-height: 300px;
    .empty {
      width: 100%;
      height: 100px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }
    li {
      padding: 0 10px;
      height: 36px;
      line-height: 36px;
      color: @text-color;
      background: #fff;
      &:hover {
        background: rgba(@primary-color, 0.6);
        color: #fff;
        cursor: pointer;
      }
    }
    &.active {
      height: auto;
      overflow-y: auto;
      // left: 0;
      // bottom: 0;
      // transform: translate(0, 100%);
      border-radius: @border-radius-base;
      border: solid 1px @border-color-base;
    }
  }
}
</style>
