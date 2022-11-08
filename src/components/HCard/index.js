/*
 * @Author: 陈乾龙
 * @Date: 2021-07-19 18:36:21
 * @LastEditTime: 2021-11-19 10:16:34
 * @LastEditors: 赵峰
 * @Description: HCard 组件 
 * @FilePath: \hifar-platform-client\src\components\HCard\index.js
 */
import "./HCard.less";
export default {
  props: {
    bordered: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      default: '',
    },
    showCollapse: {
      type: Boolean,
      default: false
    },
    bodyStyle: {
      type: Object,
      default: () => { }
    },
    // 是否默认高度固定
    fixed: {
      type: Boolean,
      default: false
    },
    // 操作按钮位置- 默认右边
    operatorLocation: {
      type: Boolean,
      default: true
    },
    // 是否全屏
    isFullScreen: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      collapse: false,
      fullScreen: false
    }
  },
  methods: {
    renderDom(h) {
      return h('div', {
        class: "h-card-wrapper",
      }, [this.renderSearch(h), this.renderCard(h), this.renderFooter(h)])
    },
    renderCard(h) {
      let title = [],
        tableOperator = null,
        content = null,
        extra = null;
      if (this.title) {
        title.push(<span slot="title" style="display:inline-block;height:28px;line-height:28px;">{this.title}</span>)
      }
      if (this.showCollapse) {
        extra = h('div', {
          slot: 'extra',
          class: 'h-card-extra' + (this.collapse ? ' h-card-extra-collapse' : ''),
          style: {
            color: this.collapse ? '' : ''
          }
        }, [h('a-icon', {
          attrs: {
            type: this.collapse ? "down" : "up"
          },
          on: {
            click: () => {
              this.collapse = !this.collapse
            }
          }
        })])
      }
      if (this.isFullScreen) {
        extra = h('div', {
          slot: 'extra',
        }, [h('a-icon', {
          attrs: {
            type: !this.fullScreen ? "fullscreen" : "fullscreen-exit"
          },
          on: {
            click: () => {
              this.fullScreen = !this.fullScreen
            }
          }
        })])
      }
      if (this.$slots['table-operator']) {
        tableOperator = h('div', {
          class: this.operatorLocation ? 'h-table-operator h-table-operator-right' : 'h-table-operator'
        }, this.$slots['table-operator'])
      }
      if (this.$slots.content) {
        content = h('div', {
          class: `h-card-content`
        }, this.$slots.content)
      }
      return h('a-card', {
        class: ['h-card', this.fixed ? 'h-card-fixed' : 'h-card-unfixed', this.collapse ? 'h-card-collapse' : '', this.fullScreen ? 'h-full-screen-extra' : ''],
        props: {
          bordered: this.bordered,
          bodyStyle: this.bodyStyle
        },
        scopedSlots: {
          ...this.$scopedSlots
        }
      }, [title, tableOperator, content, extra, this.$slots.default])
    },
    renderSearch(h) {
      if (this.$slots['search-form'] || this.$scopedSlots['search-form']) {
        return h('a-card', {
          class: 'search-form',
          props: {
            bodyStyle: {
              padding: '5px 8px',
            }
          },
          style: {
            marginBottom: '5px'
          }
        }, this.$slots['search-form'] || h(this.$scopedSlots['search-form']))
      } else {
        return null
      }
    },
    renderFooter(h) {
      if (this.$slots['card-footer'] || this.$scopedSlots['card-footer']) {
        return h('a-card', {
          class: 'card-footer',
          props: {
            bodyStyle: {
              padding: '5px 8px',
            }
          },
          style: {
            marginTop: 0
          }
        }, this.$slots['card-footer'] || h(this.$scopedSlots['card-footer']))
      } else {
        return null
      }
    },
  },
  render(h) {
    return this.renderDom(h)
  }
}