<!--
 * @Author: 陈乾龙
 * @Date: 2021-07-16 11:29:14
 * @LastEditTime: 2021-07-26 14:35:46
 * @LastEditors: 陈乾龙
 * @Description: 
 * @FilePath: \hifar-platform-client\src\views\hifar\sys\paramConfig\HfSysConfigDetail.vue
-->
<template>
  <h-descriptions
    bordered
    title="参数配置">
    <a-descriptions-item label="参数键">
      {{ basicInfo.itemKey }}
    </a-descriptions-item>
    <a-descriptions-item label="参数名称">
      {{ basicInfo.itemName }}
    </a-descriptions-item>
    <a-descriptions-item label="系统参数">
      {{ basicInfo.isSys == '1' ? '是' : '否' }}
    </a-descriptions-item>
    <a-descriptions-item label="参数值">
      {{ basicInfo.itemValue }}
    </a-descriptions-item>
    <a-descriptions-item label="参数描述">
      {{ basicInfo.itemDesc == null ? '--' : basicInfo.itemDesc }}
    </a-descriptions-item>
  </h-descriptions>
</template>
<script>
export default {
  name: 'HfSysConfigDetail',
  components: {},
  data() {
    return {
      width: 800,
      size: 'small',
      basicInfo: {}
    }
  },
  created() {
  },
  methods: {
    // 上一组件传过来的值给basicInfo属性
    showDetails(record) {
      this.basicInfo = record
    }
  }
}
</script>
<style scoped>

</style>
