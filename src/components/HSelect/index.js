/*
 * @Author: 陈乾龙
 * @Date: 2021-06-09 11:38:47
 * @LastEditTime: 2021-11-02 17:08:27
 * @LastEditors: 赵峰
 * @Description:  自定义select组件
 * @FilePath: \hifar-platform-client\src\components\HSelect\index.js
 */
import S from "ant-design-vue/es/select"
import "./index.less"
import formMixin from '../_util/formMixin'

export default {
  props: Object.assign({}, S.props, {
    size: {
      type: String,
      default: 'default',
      required: false
    },
    value: {
      type: [String, Object, Array, Number]
    },
    filterOption: {
      type: Function,
      default: (input, option) => {
        return (
          option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
        );
      }
    }
  }),
  mixins: [formMixin],
  model: {prop: "value", event: "change"},
  data() {
    return {
      preCls: 'h-select-group',
      initVal: this.value || undefined,
      selectSize: this.size || 'default'
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.initVal = val
      }
    },
    size(val) {
      if (!val || !val.length) {
        this.selectSize = 'default'
      } else {
        this.selectSize = val
      }
    },
  },
  methods: {
    handleChange(value, option) {
      this.initVal = value
      if (this.mode != 'multiple') {
        this.$refs['h-select-ref'].blur()
      }
      this.$nextTick(() => {
        this.$emit('change', this.initVal, option)
      })
    },
    handleSelect(value, option) {
      // this.initVal = value
      this.$emit('select', this.initVal, option)
      if (this.mode != 'multiple') {
        this.$refs['h-select-ref'].blur()
      }
    },
    handleDeselect(value, option) {
      this.initVal = value
      this.$emit('deselect', this.initVal, option)
      if (this.mode != 'multiple') {
        this.$refs['h-select-ref'].blur()
      }
    },
    handleFocus() {
      this.$emit('focus')
    },
    handleBlur(e) {
      this.$emit('blur',e)
    },
    handleSearch(value) {
      this.$emit('search', value)
    },
    renderDom(h) {
      let domList = []
      let selectPorps = {
        ...this.$props,
        value: this.initVal
      }
      selectPorps.size = this.selectSize
      domList.push(this.$createElement('a-select', {
        props: selectPorps,
        ref: "h-select-ref",
        on: {
          change: this.handleChange,
          select: this.handleSelect,
          deselect: this.handleDeselect,
          focus: this.handleFocus,
          blur: this.handleBlur,
          search: this.handleSearch,
        }
      }, [this.$slots.default]))
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
    let _vm = this
    return h("div", {
      tag: "component",
      class: _vm.preCls,
      scopedSlots: this.$scopedSlots
    }, [
      h('div', {
        class: _vm.renderWrapperClass(_vm.size)
      }, _vm.renderDom(h))
    ])
  }
}