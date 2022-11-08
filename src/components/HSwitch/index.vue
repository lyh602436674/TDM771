<!--
 * @Author: 赵峰
 * @Date: 2021-08-09 15:08:40
 * @LastEditTime: 2021-09-10 17:28:14
 * @LastEditors: 赵峰
 * @Descripttion: 开关通用组件
 * @FilePath: \hifar-platform-client\src\components\HSwitch\index.vue
-->
<template>
  <a-switch
    :checked-children="checkedTxt"
    :un-checked-children="uncheckedTxt"
    :checked="checked"
    :defaultChecked="defaultChecked"
    :disabled="disabled"
    :size="size"
    @change="onChangeHandle"
  />
</template>

<script>
export default {
  name: 'HSwitch',
  props: {
    //开关大小，可选值：default small
    size: {
      type: String,
      default: 'default',
      required: false,
    },
    // 开关开启文字
    checkedTxt: {
      type: String,
      default: '是',
      required: false,
    },
    // 开关关闭文字
    uncheckedTxt: {
      type: String,
      default: '否',
      required: false,
    },
    // 初始是否选中
    defaultChecked: {
      type: Boolean,
      default: false,
    },
    value: [String, Number],
    disabled: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Array,
      default: () => [],
    },
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
        if (val == this.options[0]) {
          this.checked = true
        } else {
          this.checked = false
        }
        this.checkVal = val
      },
    },
    checkedTxt: {
      immediate: true,
      handler(val) {
        this.checkedTxt = val
      },
    },
    uncheckedTxt: {
      immediate: true,
      handler(val) {
        this.uncheckedTxt = val
      },
    },
    defaultChecked: {
      immediate: true,
      handler(val) {
        this.defaultChecked = val
      },
    },
    disabled: {
      immediate: true,
      handler(val) {
        this.disabled = val
      },
    },
  },
  data() {
    console.log(this.value, this.options)
    if (this.value == this.options[0]) {
      var checked = true
    } else {
      var checked = false
    }
    var checkVal = this.value
    return {
      checked: checked,
      checkVal: checkVal,
    }
  },
  methods: {
    onChangeHandle(val, event) {
      if (val) {
        this.checkVal = this.options[0] || 1
      } else {
        this.checkVal = this.options[1] || 2
      }
      this.checked = val
      this.$emit('change', this.checkVal, event)
    },
  },
}
</script>