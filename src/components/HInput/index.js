/*
 * @Author: 陈乾龙
 * @Date: 2021-06-08 15:26:05
 * @LastEditTime: 2021-09-01 18:20:09
 * @LastEditors: 赵峰
 * @Description: 通用输入框组件
 * @FilePath: \hifar-platform-client\src\components\HInput\index.js
 */
import I from 'ant-design-vue/es/input/Input'

const JINPUT_QUERY_LIKE = 'like';
const JINPUT_QUERY_NE = 'ne';
const JINPUT_QUERY_GE = 'ge'; //大于等于
const JINPUT_QUERY_LE = 'le'; //小于等于
export default {
  props: Object.assign({}, I.props, {
    value: {
      type: [String, Number],
      required: false
    },
    type: {
      type: String,
      required: false,
      default: JINPUT_QUERY_LIKE
    },
    trim: {
      type: Boolean,
      required: false,
      default: false
    }
  }),
  watch: {
    value: {
      immediate: true,
      handler: function () {
        this.initVal();
      }
    },
    // update-begin author:sunjianlei date:20200225 for:当 type 变化的时候重新计算值 ------
    type() {
      this.backValue({target: {value: this.inputVal}})
    },
    // update-end author:sunjianlei date:20200225 for:当 type 变化的时候重新计算值 ------
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  data() {
    return {
      inputVal: ''
    }
  },
  methods: {
    /**还原数据 */
    initVal() {
      if (!this.value) {
        this.inputVal = ''
      } else {
        let text = this.value
        switch (this.type) {
          case JINPUT_QUERY_LIKE:
            //修复路由传参的值传送到jinput框被前后各截取了一位 #1336
            if (text.indexOf("*") != -1) {
              text = text.substring(1, text.length - 1);
            }
            break;
          case JINPUT_QUERY_NE:
            text = text.substring(1);
            break;
          case JINPUT_QUERY_GE:
            text = text.substring(2);
            break;
          case JINPUT_QUERY_LE:
            text = text.substring(2);
            break;
          default:
        }
        this.inputVal = text
      }
    },
    backValue(e) {
      let text = e.target.value
      if (text && this.trim === true) {
        text = text.trim()
      }
      switch (this.type) {
        case JINPUT_QUERY_LIKE:
          text = "*" + text + "*";
          break;
        case JINPUT_QUERY_NE:
          text = "!" + text;
          break;
        case JINPUT_QUERY_GE:
          text = ">=" + text;
          break;
        case JINPUT_QUERY_LE:
          text = "<=" + text;
          break;
        default:
      }
      this.$emit("change", text)
      this.$emit('input', text)
    }
  },
  render(h) {
    let renderDom = []
    if (this.$slots.addonBefore) {
      renderDom.push(this.$slots.addonBefore)
    }
    if (this.$slots.default) {
      renderDom.push(this.$slots.default)
    }
    return h("a-input", {
      attrs: {
        ...this.$props,
        value: this.inputVal,
        type: this.type
      },
      on: {
        input: this.backValue,
        blur: (e) => {
          this.$emit('blur', e)
        },
        keyup: (e) => {
          this.$emit('keyup', e)
        },
        click: (e) => {
          this.$emit('click', e)
        }
        // change: (v) => {
        //   console.log('h-input change', v)
        // }
      },
      scopedSlots: this.$scopedSlots
    }, renderDom)
  }
}