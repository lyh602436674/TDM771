<!--
 * @Author: 赵峰
 * @Date: 2021-10-26 17:34:06
 * @LastEditTime: 2021-10-27 09:51:19
 * @LastEditors: 赵峰
 * @Descripttion: 试前检查项管理
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\testTemplate\TestBeforeTemplate.vue
-->
<template>
  <div style="height: 100%">
    <test-template-table ref="TestTemplateTable" checkType="1"></test-template-table>
  </div>
</template>

<script>
import TestTemplateTable from './components/TestTemplateTable'
export default {
  components: {
    TestTemplateTable,
  },
  data() {
    return {}
  },
  methods: {},
}
</script>
<style lang='less' scoped>
</style>