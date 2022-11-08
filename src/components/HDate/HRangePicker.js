/*
 * @Author: 陈乾龙
 * @Date: 2021-06-11 09:35:29
 * @LastEditTime: 2021-09-07 11:53:28
 * @LastEditors: 赵峰
 * @Description: 日期范围选择组件自定义
 * @FilePath: \hifar-platform-client\src\components\HDate\HRangePicker.js
 */
import formMixin from '../_util/formMixin'
import "../HSelect/index.less";
import moment from "moment"
export default {
  name: 'HRangePicker',
  mixins: [formMixin],
  props: {
    size: {
      type: String,
      default: "small"
    },
    value: {
      type: Array,
      default: () => []
    },
    format: {
      type: String,
      default: 'YYYY-MM-DD'
    },
    showTime: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      preCls: "h-date-picker",
      initVal: this.value || []
    }
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler(val) {
        if (!val || val.length <= 0) {
          this.initVal = []
        } else {
          this.initVal = [val[0] ? moment(val[0]) : null, val[1] ? moment(val[1]) : null]
        }
      }
    }
  },
  mode: ['value', 'change', 'input'],
  methods: {
    handleChange(dates, dateStrings) {
      console.log(dates, dateStrings)
      this.initVal = dates.length ? dates : null
      this.$emit('input', dateStrings, dates)
      this.$emit('change', dateStrings, dates)
    },
    handleOk(dates, dateStrings) {
      this.$emit('ok', dateStrings)
    },
    renderDom(h) {
      let domList = []
      domList.push(h("a-range-picker", {
        attrs: {
          ...this.$props,
          value: this.initVal
        },
        on: {
          change: this.handleChange,
          ok: this.handleOk
        }
      }, this.$slots.renderExtraFooter || []))
      if (this.$slots.addonBefore && this.$slots.addonBefore.length) {
        domList.unshift(h("span", {
          class: this.preCls + '-addon'
        }, this.$slots.addonBefore))
      }
      if (this.$slots.addonAfter && this.$slots.addonAfter.length) {
        domList.push(h("span", {
          class: this.preCls + '-addon'
        }, this.$slots.addonAfter))
      }
      return domList
    }
  },
  render(h) {
    return h("div", {
      class: this.preCls
    }, [
      h('div', {
        class: this.renderWrapperClass(this.size)
      }, this.renderDom(h))
    ])
  }
}