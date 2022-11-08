<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-31 14:17:36
 * @LastEditTime: 2021-08-31 14:51:10
 * @LastEditors: 陈乾龙
 * @Description: 建议所属模块下拉选择器
 * @FilePath: \hifar-platform-client\src\views\hifar\comments\modules\SuggestModuleSelect.vue
-->
<template>
  <!-- <h-select v-model="localValue" :options="options" @change="triggerChange"></h-select> -->
  <a-tree-select
    v-model="localValue"
    placeholder="请选择父级菜单"
    showSearch
    :replaceFields="{
      children: 'children',
      title: 'title',
      key: 'id',
      value: 'id',
    }"
    :dropdownStyle="{ maxHeight: '200px', overflow: 'auto' }"
    :treeData="options"
    :filterTreeNode="filterTreeNode"
    @change="triggerChange"
  />
</template>

<script>
import { getSystemMenuList } from '@/api/api'
import { rebuildRouter } from '@/utils/hasPermission'
export default {
  props: {
    value: {
      type: String,
      default: '',
    },
  },
  watch: {
    value(val) {
      this.localValue = val
    },
  },
  data() {
    return {
      localValue: this.value || undefined,
      options: [],
    }
  },
  created() {
    this.getSelectOptions()
  },
  methods: {
    async getSelectOptions() {
      this.options = []
      let response = await getSystemMenuList()
      if (response.code == 200) {
        let treeList = rebuildRouter(response.data)
        treeList.unshift({ title: '根模块', id: '0', value: '0' })
        this.options = treeList
      }
    },
    triggerChange(v, option) {
      this.localValue = v
      this.$emit('change', v, option)
    },
    filterTreeNode(inputValue, treeNode) {
      return treeNode.componentOptions.propsData.dataRef.title.indexOf(inputValue.toLowerCase()) >= 0
    },
  },
}
</script>

<style>
</style>