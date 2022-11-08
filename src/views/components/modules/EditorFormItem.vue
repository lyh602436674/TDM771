<!--
 * @Author: 赵峰
 * @Date: 2021-09-15 16:16:23
 * @LastEditTime: 2021-09-23 11:46:14
 * @LastEditors: 赵峰
 * @Descripttion: 指标单选组件
 * @FilePath: \hifar-platform-client\src\views\components\modules\EditorFormItem.vue
-->
<template>
  <div  @click="handleRadioClick(item, index)">
    <h-icon
      :type="item.radio ? 'icon-danxuan1' : 'icon-danxuan'"
      :class="{ 'primary-text': item.radio }"
    />
    <span>
      {{ label }}
    </span>
    <template v-if='!item.hidden'>
      <a-input
        v-for="item in inputKeys"
        :key="item"
        type="number"
        min="0"
        placeholder="请输入"
        :value="inputValue[item]"
        @change="(v) => handleInputChange(v, item)"
        class="inputVal"
      ></a-input>
    </template>
  </div>
</template>

<script>
import { isObject, isEmpty } from 'lodash'
export default {
  props: {
    item: {
      type: Object,
      default: () => {},
    },
    value: {
      type: Object,
      default: () => {},
    },
    index: {
      type: [String, Number],
      default: null,
    },
  },
  watch: {
    item: {
      immediate: true,
      handler(val) {
        if (isObject(val) && !isEmpty(val)) {
          this.label = val.label
          val.inputKeys.map((item) => {
            if(val.conditonType == 'A01'){
              this.inputValue.minValue = '0'
            }else{
              this.inputValue[item] = undefined
            }
          })
          this.inputKeys = val.inputKeys
          this.conditonType = val
        }
      },
    },
  },
  data() {
    return {
      label: '',
      inputKeys: [],
      inputValue: {},
      valueChange: {},
      conditonType: null,
    }
  },
  methods: {
    handleRadioClick(item, index) {
      let itemVal = {
        conditonType: item.conditonType,
        index: index,
      }
      this.$emit('selectHandle', itemVal)
      this.triggerChange()
    },
    handleInputChange(event, item) {
      let v = event.target.value
      this.inputValue[item] = v
      this.triggerChange()
    },
    triggerChange() {
      this.$emit('change', Object.assign({}, this.inputValue, { radio: this.item.radio }))
    },
  },
}
</script>

<style lang="less" scoped>
.inputVal {
  width: 100px;
  margin-left: 10px;
}
</style>