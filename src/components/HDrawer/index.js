/*
 * @Author: 陈乾龙
 * @Date: 2021-07-22 16:03:42
 * @LastEditTime: 2021-07-22 16:15:00
 * @LastEditors: 陈乾龙
 * @Description: 自定义HDrawer抽屉组件
 * @FilePath: \hifar-platform-client\src\components\HDrawer\index.js
 */
import Drawer from 'ant-design-vue/es/drawer'

export default {
  props: Object.assign({}, Drawer, {

  }),
  methods: {
    renderDom() {
      return (
        <div class="h-drawer-body-wrapper">
          {this.$slots.default}
        </div>
      )
    }
  },
  render(h) {
    let props = {
      ...this.$props
    }
    return h('a-drawer', {
      attrs: {
        ...props
      },
      scopedSlots: this.$scopedSlots
    }, this.renderDom(h))
  }
}