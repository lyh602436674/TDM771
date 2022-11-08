<!--
 * @Author: 陈乾龙
 * @Date: 2021-06-08 11:39:06
 * @LastEditTime: 2021-06-08 14:46:59
 * @LastEditors: 陈乾龙
 * @Description: 用不同颜色标识各种状态的Tag
 * @FilePath: \hifar-vue\ant-design-jeecg-vue\src\components\StatusTag\StatusTag.vue
-->
<template>
  <div class="status-tag">
    <a-tag v-if="type == 0" size="small" :color="status | colorFilter(status)" @change="handleClick">{{ text }}</a-tag>
    <template v-if="type == 1">
      {{ text }}
      <h-icon
        v-if="status"
        class="status-tag-hicon"
        :type="status == 'start' ? 'icon-qiyong' : 'icon-yidongjie'"
        :style="{ color: status == 'start' ? colorList[0] : colorList[1] }"
        @click="handleClick"
      />
    </template>
  </div>
</template>

<script>
const colorList = ['#67C23A', '#FF4D4F', '#E6A23C', '#409EFF', 'lightseagreen', 'pink', 'red', 'orange', 'blue']
export default {
  props: {
    status: {
      type: [String, Number],
    },
    type: {
      type: [String, Number],
      default: 0,
    },
    text: {
      type: [Number, String],
    },
  },
  data() {
    return {
      colorList,
    }
  },
  filters: {
    colorFilter(status) {
      return colorList[status]
    },
  },
  methods: {
    handleClick() {
      this.$emit('change', this.status)
    },
  },
}
</script>