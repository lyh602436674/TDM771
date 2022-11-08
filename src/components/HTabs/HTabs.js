/*
 * @Author: 陈乾龙
 * @Date: 2021-08-10 09:54:17
 * @LastEditTime: 2021-08-10 10:14:55
 * @LastEditors: 陈乾龙
 * @Description: 自定义样式Tabs
 * @FilePath: \hifar-platform-client\src\components\HTabs\HTabs.js
 */
import Tab from 'ant-design-vue/es/tabs'
import './HTabs.less'
export default {
  props: Object.assign({}, Tab.props, {
    fixed: {
      type: Boolean,
      default: false
    }
  }),
  watch: {
    activeKey(val) {
      this.localActiveKey = val
    }
  },
  data() {
    return {
      localActiveKey: this.activeKey
    }
  },
  methods: {
    handleChange(v) {
      this.localActiveKey = v
      this.$emit('change', v)
    },
    handleNextClick() {
      this.$emit('nextClick', this)
    },
    handlePrevClick() {
      this.$emit('prevClick', this)
    }
  },
  render(h) {
    let props = {
      ...this.$props,
      activeKey: this.localActiveKey
    }
    return h('a-tabs', {
      class: `h-tabs ${this.fixed ? 'h-tabs-fixed' : ''}`,
      props: props,
      on: {
        change: this.handleChange,
        nextClick: this.handleNextClick,
        prevClick: this.handlePrevClick
      },
      scopedSlots: this.$scopedSlots
    }, this.$slots.default)
  }
}
