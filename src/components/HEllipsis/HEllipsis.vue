<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-11 14:26:17
 * @LastEditTime: 2021-08-11 14:40:04
 * @LastEditors: 陈乾龙
 * @Description: 文本溢出显示省略号，鼠标hover时，气泡显示内容
 * @FilePath: \hifar-platform-client\src\components\HEllipsis\HEllipsis.vue
-->
<template>
  <a-tooltip placement="topLeft">
    <template slot="title">
      <span>{{value}}</span>
    </template>
    {{ value | ellipsis(length) }}
  </a-tooltip>
</template>

<script>
  export default {
    name: 'HEllipsis',
    props: {
      value: {
        type: String,
        required: false,
      },
      length: {
        type: Number,
        required: false,
        default: 25,
      }
    }
  }
</script>