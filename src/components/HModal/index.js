/*
 * @Author: 陈乾龙
 * @Date: 2021-07-30 16:29:44
 * @LastEditTime: 2021-11-18 18:39:00
 * @LastEditors: 马潭龙
 * @Description: 自定义弹窗组件 基于ant-design modal 组件开发
 * @FilePath: \hifar-platform-client\src\components\HModal\index.js
 */
import M from 'ant-design-vue/es/modal'
import "./HModal.less"
export default {
  props: Object.assign({}, M.props, {
    visible: {
      type: Boolean,
      default: false
    },
    // 是否展示在父组件内部
    inner: {
      type: Boolean,
      default: false
    },
    fullScreen: {
      type: Boolean,
      default: false
    },
    dialogStyle: {
      type: Object,
      default: () => { }
    }
  }),
  watch: {
    title(val) {

    },
    visible(val) {
      this.localVisible = val
    }
  },
  data() {
    return {
      localVisible: this.visible,
      localFooter: function () { }
    }
  },
  created() {
    if (this.$slots.footer || !this.footer) {
      this.localFooter = this.renderModalFooter
    }
  },
  methods: {
    show() {
      this.visible = true
    },
    renderModalFooter() {
      if (this.$slots.footer) {
        return this.$createElement('div', {
          class: 'drawer-bootom-button'
        }, this.$slots.footer)
      }
      return (
        <div slot='footer' class="drawer-bootom-button">
          <a-button type="ghost-danger" style="margin-right: 8px" onclick={this.handleCancel}> 关闭 </a-button>
          <a-button type="ghost-primary" loading={this.confirmLoading} onclick={this.handleSubmit}> 确定 </a-button>
        </div >
      )
    },
    handleCancel() {
      this.$emit('cancel')
    },
    handleSubmit() {
      this.$emit('submit')
    }
  },
  render(h) {
    return h('a-modal', {
      class: {
        "h-modal": this.inner,
        'h-modal-fullScreen': this.fullScreen
      },
      props: {
        ...this.$props,
        visible: this.localVisible,
        title: this.title || false,
        dialogStyle:this.dialogStyle
      },
      on: {
        cancel: this.handleCancel,
        submit: this.handleSubmit
      },
      scopedSlots: {
        footer: this.localFooter
      }
    }, [this.$slots.default])
  }
}