/*
 * @Author: 陈乾龙
 * @Date: 2021-06-08 15:40:59
 * @LastEditTime: 2021-09-10 14:14:01
 * @LastEditors: 陈乾龙
 * @Description: 详情页面通用组件
 * @FilePath: \hifar-platform-client\src\components\HDetail\HDescriptions.js
 */
import D from 'ant-design-vue/es/descriptions'
import "./HDetail.less";

export default {
  name: "HDescriptions",
  props: Object.assign({}, D.props, {
    title: {
      type: String
    },
    value: {
      type: [Object, Array],
      default: function () {
        return {}
      }
    },
    carded: {
      type: Boolean,
      default: false
    }
  }),
  data() {
    return {
      preCls: 'h-descriptions'
    }
  },
  methods: {
    renderTitle(h) {
      if (!this.title) return
      return h('legend', {
        scopedSlots: this.$scopedSlots
      }, [h("div", {
        class: this.preCls + '-title'
      }, [
        h("span", {
          class: 'content'
        }, [this.$slots.title || this.title]),
        h("div", {
          class: this.preCls + '-title-extra'
        }, [this.$slots.extra])
      ])])

    },
    renderDescriptions(h) {
      if (!this.$slots.default && !this.$slots.default.length) return []
      let ADProps = Object.assign({}, this.$props)
      delete ADProps.title
      delete ADProps.value
      return h("a-descriptions", {
        attrs: {
          ...ADProps
        },
        // scopedSlots: this.$scopedSlots
      }, this.$slots.default)
    },
    renderFooter(h) {
      return h("div", {
        style: {
          textAlign: 'right'
        }
      }, [
        this.$slots.footer
      ])
    }
  },
  render(h) {
    let wrapperClass = this.preCls
    if (this.carded) {
      wrapperClass = `${wrapperClass} ${this.preCls + '-card'}`
    }
    return h("div", {
      class: wrapperClass
    }, [
      h("fieldset", {
        attrs: {
          style: {
            width: '100%;'
          }
        }
      }, [
        this.renderTitle(h),
        h('div', {}, [
          this.renderDescriptions(h),
          this.renderFooter(h)
        ])
      ])
    ])
  }
}