<!--
 * @Author: 赵峰
 * @Date: 2021-08-11 17:16:43
 * @LastEditTime: 2021-08-18 15:05:58
 * @LastEditors: 赵峰
 * @Descripttion: 折叠面板通用组件
 * @FilePath: \hifar-platform-client\src\components\HCollapse\index.vue
-->
<template>
  <div>
    <a-collapse v-model='activeKeyArr' :expand-icon-position="expandIconPosition">
      <a-collapse-panel key="1" :forceRender='forceRender'>
        <span slot="header">
          <span>{{ title }}</span>
        </span>
        <div slot="extra" class="extra-box">
          <slot name="extraBox"></slot>
        </div>
        <!--        <div slot="extra" v-if='extraShow' style="margin-right:30px;">-->
        <!--          <a-button type="primary" size="small" @click.stop="handleAdd"> {{buttonTxt}} </a-button>-->
        <!--        </div>-->
        <slot name="content"></slot>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    buttonTxt: {
      type: String,
      default: ''
    },
    // 设置图标位置： left, right
    expandIconPosition: {
      type: String,
      default: 'right'
    },
    // 被隐藏时是否渲染 DOM 结构
    forceRender: {
      type: Boolean,
      default: true
    },
    // 自定义渲染每个面板右上角的内容是否展示
    extraShow: {
      type: Boolean,
      default: true
    },
    // 是否展开第一项
    activeKey: {
      type: [String, Number],
      default: ''
    }
  },

  watch: {
    activeKey: {
      immediate: true,
      handler(val) {
        this.activeKeyArr = [val]
      }
    }
  },

  data() {
    return {
      activeKeyArr: null
    }
  },

  methods: {
    handleAdd() {
      this.$emit('handleAdd', true)
    },
  },
}
</script>
<style lang='less' scoped>
/deep/ .ant-collapse-header:before {
  content: '';
  position: absolute;
  height: 100%;
  top: 0;
  left: 0;
  border-left: 3px solid #409eff;
}

/deep/ .ant-collapse-icon-position-right > .ant-collapse-item > .ant-collapse-header {
  padding: 3px 16px;
  padding-right: 40px;
}

/deep/ .ant-btn-sm {
  height: 22px;
}
/deep/ .extra-box{
  div button {
    margin-right: 5px;
  }
}
</style>