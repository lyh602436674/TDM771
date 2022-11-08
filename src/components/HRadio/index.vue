<!--
 * @Author: 赵峰
 * @Date: 2021-08-06 09:31:55
 * @LastEditTime: 2021-08-30 17:04:03
 * @LastEditors: 赵峰
 * @Descripttion: 单选通用组件
 * @FilePath: \hifar-platform-client\src\components\HRadio\index.vue
-->
<template>
  <a-radio-group :value="valueRadio" :disabled='disabled' :default-value='defaultValue' @change="onChangeHandle">
    <template v-if="radioType === 'radioText'">
      <a-radio
        :value="item.value"
        :data-title="item.title"
        :disabled="item.disabled"
        v-for="item in options"
        :key="item.value"
      >
        {{ item.title }}
      </a-radio>
    </template>
    <template v-else>
      <a-radio-button
        :value="item.value"
        :data-title="item.title"
        :disabled="item.disabled"
        v-for="item in options"
        :key="item.value"
      >
        {{ item.title }}
      </a-radio-button>
    </template>
  </a-radio-group>
</template>

<script>
export default {
  components: {},
  props: {
    size: {
      type: String,
      default: 'default',
      required: false,
    },
    radioType: {
      type: String,
      default: 'radioText', // radioButton | radioText
      required: false,
    },
    value: [String, Number],
    options: {
      type: Array,
      default: [],
    },
    defaultValue: {
      type:[String,Number]
    },
    disabled:{
      type:Boolean,
      default:false,
    }
  },
  watch: {
    size(val) {
      if (!val || !val.length) {
        this.size = 'default'
      } else {
        this.size = val
      }
    },
    value: {
      immediate: true,
      handler(val) {
        this.valueRadio = val
      },
    },
    defaultValue: {
      immediate: true,
      handler(val) {
        this.valueRadio = val
        this.$emit('change', this.valueRadio)
      },
    },
    radioType: {
      immediate: true,
      handler(val) {
        this.radioType = val
      },
    },
    options: {
      immediate: true,
      handler(val) {
        this.options = val
      },
    },
  },
  data() {
    return {
      valueRadio: '',
    }
  },
  methods: {
    onChangeHandle(e) {
      let val = e.target.value
      let valItem = this.options.filter(function (item) {
        return item.value == val
      })
      this.valueRadio = val
      this.$emit('change', this.valueRadio, valItem)
    },
  },
}
</script>
<style lang='less' scoped>
/deep/ .ant-radio-button-wrapper {
  border-radius: 4px;
  margin-right: 10px;
  min-width: 80px;
  text-align: center;
}
/deep/ .ant-radio-button-wrapper:first-child {
  border-radius: 4px;
}
/deep/ .ant-radio-button-wrapper:last-child {
  border-radius: 4px;
}
</style>