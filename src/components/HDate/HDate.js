/*
 * @Author: 陈乾龙
 * @Date: 2021-08-27 10:12:25
 * @LastEditTime: 2021-08-27 10:56:55
 * @LastEditors: 陈乾龙
 * @Description: 基于Ant-Design DatePicker，修改了样式
 * @FilePath: \hifar-platform-client\src\components\HDate\HDate.js
 */
import formMixin from '../_util/formMixin'
import "../HSelect/index.less"
import "./HDate.less"
import moment from "moment"
import {isString} from 'lodash'

export default {
  name: 'HRangePicker',
  mixins: [formMixin],
  props: {
    size: {
      type: String,
      default: "small"
    },
    value: {
      type: [Object, String, Number],
      // default: () => moment()
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
      initVal: this.value || undefined
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        console.log('日期组件value变化', val)
        if (!val) {
          this.initVal = undefined
        } else {
          if (isString(val)) {
            if (!isNaN(parseFloat(val))) {
              this.initVal = moment(val)
            } else {
              this.initVal = moment(parseFloat(val))
            }
          } else if (val instanceof moment) {
            this.initVal = val
          } else {
            this.initVal = undefined
          }
        }
      }
    }
  },
  mode: ['value', 'change', 'input'],
  methods: {
    handleChange(dates, dateStrings) {
      // console.log(dates, dateStrings)
      this.initVal = dates
      this.$emit('input', dateStrings, dates)
      this.$emit('change', dateStrings, dates)
    },
    handleOk(dates, dateStrings) {
      this.$emit('ok', dateStrings, dates)
    },
    renderDom(h) {
      let domList = []
      domList.push(h("a-date-picker", {
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