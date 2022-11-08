/*
 * @Author: 陈乾龙
 * @Date: 2021-07-26 18:17:33
 * @LastEditTime: 2021-11-12 13:47:37
 * @LastEditors: 马潭龙
 * @Description: 可编辑选择树
 * @FilePath: \hifar-platform-client\src\views\components\HEditTree.js
 */
import "./HEditTree.less";
import { isArray } from 'lodash'
import { isFunction } from "@antv/g-base/lib/util/util";
export default {
  props: {
    title: {
      type: String,
      default: ""
    },
    // Tree 的数据
    tree: {
      value: Array,
      default: () => []
    },
    value: {
      type: Array,
      default: () => []
    },
    // 替换 treeNode 中 title,key,children 字段为 treeData 中对应的字段
    replaceFields: {
      type: Object,
      default: () => {
        return {
          children: 'children', title: 'title', key: 'key'
        }
      }
    },
    menuIcon: {
      type: String,
      default: 'icon-wenjianjia'
    },
    fileIcon: {
      type: String,
      default: 'icon-wenjian1'
    },
    multiple: {
      type: Boolean,
      default: false
    },
    selectable: {
      type: Boolean,
      default: true
    },
    checkable: {
      type: Boolean,
      default: false
    },
    autoExpandParent: {
      type: Boolean,
      default: false
    },
    checkStrictly: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    // 选中的节点key, key为replaceFields中配置的key
    selectedKeys: {
      type: Array,
      default: () => []
    },
    // 复选框选中的key
    checkedKeys: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    selectedKeys: {
      immediate: true,
      handler(val) {
        if (isArray(val)) {
          this.__selectedKeys__ = val
        } else {
          this.__selectedKeys__ = []
        }

      }
    },
    __checkedKeys__: {
      immediate: true,
      handler(val) {
        if (isArray(val)) {
          this.__checkedKeys__ = val
        } else {
          this.__checkedKeys__ = []
        }
      }
    }
  },
  data() {
    return {
      treeValue: [],
      __selectedKeys__: [],
      __selectedRows__: [],
      __checkedKeys__: [],
      __checkedRows__: []
    }
  },
  methods: {
    handleCheck(checkedKeys, event) {
      this.$emit('onCheck', checkedKeys, event)
    },
    handleExpand(expandedKeys, event) {
      // console.log(expandedKeys, event)
    },
    handleRightClick(event) {
      // console.log(event)
    },
    handleSelect(selectedKeys, event) {
      this.$emit('onSelect', selectedKeys, event)
    },
    renderCardBody(h) {
      if (!this.tree.length) {
        return h('a-empty', {
          style: {
            width: '100%',
            height: "100%",
            margin: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column'
          }
        })
      }
      /**
       * @Date: 2021-11-03 17:06:47
       * @Author: 陈乾龙
       * @description: 这里是为了增加拓展按钮
       */
      let addonAfter = null,
        addonBefore = null,
        slotTitle = null
      if (this.$scopedSlots.addonAfter) {
        addonAfter = this.$scopedSlots.addonAfter
      }
      if (this.$scopedSlots.addonBefore) {
        addonBefore = this.$scopedSlots.addonBefore
      }
      if (this.$scopedSlots.title) {
        slotTitle = (params) => {
          return h('div', { class: 'h-edit-tree-title', props: { title: params.title } }, this.$scopedSlots.title(params))
        }
      } else {
        slotTitle = ({ title }) => {
          return h('div', { class: 'h-edit-tree-title', props: { title: title } }, title)
        }
      }
      return h('a-tree', {
        slot: 'content',
        class: 'h-edit-tree',
        attrs: {
          treeData: this.tree,
          replaceFields: this.replaceFields,
          multiple: this.multiple,
          selectable: this.selectable,
          checkable: this.checkable,
          autoExpandParent: this.autoExpandParent,
          checkStrictly: this.checkStrictly,
          disabled: this.disabled,
          selectedKeys: this.__selectedKeys__,
          checkedKeys: this.__checkedKeys__
        },
        scopedSlots: {
          customTitle: (params) => {
            let { title, children } = params
            // 这里是使用children 而不使用其他字段是为了做兼容
            let icon = null
            if (isArray(children)) {
              icon = this.menuIcon.includes('icon-') ? h('h-icon', { attrs: { type: this.menuIcon } }) : h('a-icon', { attrs: { type: this.menuIcon } })
            } else {
              icon = this.fileIcon.includes('icon-') ? h('h-icon', { attrs: { type: this.fileIcon } }) : h('a-icon', { attrs: { type: this.fileIcon } })
            }
            return h('div', {
              class: {
                'h-edit-tree-title-wrapper': true,
                'h-edit-tree-title-wrapper-addon': true,
              }, attrs: { title: title }
            }, [icon, isFunction(addonBefore) && addonBefore(params), slotTitle(params), isFunction(addonAfter) && addonAfter(params)])
          }
        },
        on: {
          check: this.handleCheck,
          expand: this.handleExpand,
          rightClick: this.handleRightClick,
          select: this.handleSelect
        }
      })
    },
  },
  render(h) {
    let searchForm = null
    if (this.$slots['search-form']) {
      searchForm = h('div', {
        slot: 'search-form'
      }, this.$slots['search-form'])
    }
    let props = {
      title: this.title
    }
    let scopedSlots = {}
    if (this.$scopedSlots.extra) {
      scopedSlots.extra = this.$scopedSlots.extra
    }
    return h('h-card', {
      props: { ...props },
      scopedSlots: scopedSlots
    }, [searchForm, this.renderCardBody(h)])
  }
}