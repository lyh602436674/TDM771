<!--
 * @Author: 赵峰
 * @Date: 2021-11-08 17:36:50
 * @LastEditTime: 2021-11-12 16:09:28
 * @LastEditors: 赵峰
 * @Descripttion: 系统通用描述子组件
 * @FilePath: \hifar-platform-client\src\components\HDesc\HDescItem.vue
-->
<template>
  <a-col :span="computedSpan" class="desc-item">
    <div class="desc-item-content" :class="size">
      <label class="desc-item-label" :style="{ width: labelWidth }" v-html="label"></label>
      <div class="desc-item-value" v-if="$slots">
        <slot v-if="$slots.default && $slots.default[0].text" />
        <slot name="content" v-else-if="$slots.content" />
        <span v-else></span>
      </div>
    </div>
  </a-col>
</template>

<script>
export default {
  name: 'HDescItem',
  inject: ['labelWidth', 'column', 'size'],
  props: {
    // 包含列的数量，单行合并列的数量
    span: {
      type: [Number, String],
      required: false,
      default: 0,
    },
    // 内容名称
    label: {
      type: String,
      required: false,
      default: '',
    },
    // 控制多少行显示省略号，默认1
    rowEllipsis: {
      type: [Number, String],
      required: false,
      default: 1,
    },
  },
  data() {
    return {
      // 子组件自己的span
      selfSpan: 0,
    }
  },
  computed: {
    computedSpan() {
      // 子组件自己的span，用于父组件计算修改span
      if (this.selfSpan) {
        return (24 / this.column) * this.selfSpan
      } else if (this.span) {
        // props传递的span
        return (24 / this.column) * this.span
      } else {
        // 若未传递span时，取column
        return 24 / this.column
      }
    },
  },
  filters: {
    oneEllipsis(num) {
      let s = Number(num)
      switch (s) {
        case 1:
          return 'oneEllipsis'
        case 2:
          return 'twoEllipsis'
        case 3:
          return 'threeEllipsis'
        case 4:
          return 'fourEllipsis'
      }
    },
  },
}
</script>

<style scoped lang="less">
.desc-item {
  border-right: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
  .desc-item-content {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    color: rgba(0, 0, 0, 0.65);
    font-size: 14px;
    line-height: 1.5;
    width: 100%;
    background-color: #fafafa;
    height: 100%;
    .desc-item-label {
      border-right: 1px solid #e8e8e8;
      display: inline-block;
      padding: 12px 16px;
      flex-grow: 0;
      flex-shrink: 0;
      color: rgba(0, 0, 0, 0.6);
      font-weight: 400;
      font-size: 14px;
      line-height: 1.5;
      height: 100%;
      display: flex;
      align-items: center;
    }
    .desc-item-value {
      background: #fff;
      padding: 12px 16px;
      flex-grow: 1;
      overflow: hidden;
      word-break: break-all;
      height: 100%;
      display: flex;
      align-items: center;
      color: rgba(0, 0, 0, 0.6);
      span {
        color: #aaa;
      }
    }
  }
}
.desc-item .desc-item-content.small .desc-item-label,
.desc-item .desc-item-content.small .desc-item-value {
  padding: 8px 14px;
}
.desc-item .desc-item-content.middle .desc-item-label,
.desc-item .desc-item-content.middle .desc-item-value {
  padding: 16px 24px;
}
</style>
