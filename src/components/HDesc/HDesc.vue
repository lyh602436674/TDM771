<!--
 * @Author: 赵峰
 * @Date: 2021-11-08 17:34:57
 * @LastEditTime: 2021-11-25 18:56:26
 * @LastEditors: 赵峰
 * @Descripttion: 系统通用描述组件
 * @FilePath: \hifar-platform-client\src\components\HDesc\HDesc.vue
-->
<template>
  <div class="desc" :style="{ margin }">
    <!-- 标题 -->
    <h1 v-if="title" class="desc-title" v-html="title"></h1>
    <a-row :class="bordered ? 'desc-row bordered' : 'desc-row'">
      <slot />
    </a-row>
  </div>
</template>

<script>
export default {
  name: 'HDesc',
  // 通过provide提供给子组件
  provide() {
    return {
      labelWidth: this.labelWidth,
      column: this.column,
      size: this.size,
    }
  },
  props: {
    // 数据源，监听数据重绘
    data: {
      type: Object,
      required: false,
      default() {
        return {}
      },
    },
    // 标题
    title: {
      type: String,
      default: '',
    },
    // 边距
    margin: {
      type: String,
      default: '0',
    },
    // label宽度
    labelWidth: {
      type: String,
      default: '120px',
    },
    column: {
      // 每行显示的项目个数
      type: [Number, String],
      default: 3,
    },
    size: {
      // 大小可选small、middle
      type: String,
      default: '',
    },
    // 是否有边框
    bordered: {
      type: Boolean,
      default: true,
    },
  },
  watch: {
    data: {
      deep: true,
      immediate: true,
      handler(val) {
        this.$nextTick(() => {
          // 筛选出子组件h-desc-item
          const dataSource = this.$slots.default
          const dataList = []
          if (dataSource && dataSource.length) {
            dataSource.forEach((item) => {
              if (item.componentOptions && item.componentOptions.tag === 'h-desc-item') {
                dataList.push(item.componentInstance)
              }
            })
          }
          // 剩余span
          let leftSpan = this.column
          const len = dataList.length
          dataList.forEach((item, index) => {
            // 处理column与span之间的关系
            // 剩余的列数小于设置的span数
            const hasLeft = leftSpan <= (item.span || 1)
            // 当前列的下一列大于了剩余span
            const nextColumnSpan = index < len - 1 && dataList[index + 1].span >= leftSpan
            // 是最后一行的最后一列
            const isLast = index === len - 1
            if (hasLeft || nextColumnSpan || isLast) {
              // 满足以上条件，需要自动补全span，避免最后一列出现残缺的情况
              item.selfSpan = leftSpan
              leftSpan = this.column
            } else {
              leftSpan -= item.span || 1
            }
          })
        })
      },
    },
  },
}
</script>

<style scoped lang="less">
.desc {
  width: 100%;
  .desc-title {
    color: rgba(0, 0, 0, 0.45);
    font-weight: 400;
    font-size: 16px;
    line-height: 1.5715;
    padding-bottom: 4px;
    border-bottom: 1px solid #ccc;
  }
  .desc-row {
    display: flex;
    flex-wrap: wrap;
    border-radius: 2px;
    border-bottom: 0;
    border-right: 0;
    width: 100%;
    height: 100%;
  }
  .bordered {
    border: 1px solid #e8e8e8;
    //border-right: none;
    //border-bottom: none;
  }
}
</style>

