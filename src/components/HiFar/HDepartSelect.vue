<!--
 * @Author: 陈乾龙
 * @Date: 2021-07-22 10:48:44
 * @LastEditTime: 2021-09-13 11:51:52
 * @LastEditors: 赵峰
 * @Description:  部门下拉选择树
 * @FilePath: \hifar-platform-client\src\components\HiFar\HDepartSelect.vue
-->
<template>
  <a-tree-select
    allowClear
    :disabled="disabled"
    :size="size"
    :showSearch="!multiple"
    :multiple="multiple"
    :placeholder="placeholder || '请选择'"
    :value="selectedKeys"
    :treeData="treeData"
    :replaceFields="replaceFields"
    :filterTreeNode="filterTreeNode"
    @change="handleSelectChange"
  >
    <template slot-scope="text" slot="title">
      <h-icon v-if="text.children && text.children.length > 0" type="icon-bumen" />
      <h-icon v-else type="icon-bumen1" />
      {{ text.title }}
    </template>
  </a-tree-select>
</template>

<script>
import { queryDepartListAll } from '@/api/api'
import { createTree } from '@/utils/hasPermission'
export default {
  props: {
    value: {
      type: String,
    },
    // 是否支持多选
    multiple: {
      type: Boolean,
      default: false,
    },
    // 查询条件
    querParams: {
      type: Object,
      default: () => {},
    },
    placeholder: String,
    size: {
      default: 'default',
    },
    disabled: {
      default: false,
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.selectedKeys = val
      },
    },
  },
  data() {
    return {
      treeData: [],
      selectedKeys: undefined,
      replaceFields: {
        children: 'children',
        title: 'deptCode',
        value: 'id',
        key: 'id',
      },
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    async loadData() {
      let result = await queryDepartListAll()
      if (result.code == 200) {
        let departList = []
        let treeData = []
        result.data.map((depart) => {
          let dept = {
            title: depart.deptName,
            deptName: depart.deptName,
            id: depart.id,
            pid: depart.pid,
            scopedSlots: {
              title: 'title',
            },
          }
          treeData.push(dept)
        })
        createTree(treeData, departList, null, '0')
        departList.unshift({
          title: '默认部门',
          deptName: '默认部门',
          id: '0',
          pid: '0',
          scopedSlots: {
            title: 'title',
          },
        })
        this.treeData = departList
      }
    },
    handleSelectChange(v, label, extra) {
      let dataRef = extra.triggerNode.dataRef
      this.selectedKeys = v
      this.dataRef = dataRef
      this.triggerChange()
    },
    triggerChange() {
      this.$emit('change', this.selectedKeys,this.dataRef)
      this.$emit('input', this.selectedKeys,this.dataRef)
    },
    filterTreeNode(inputValue, treeNode) {
      console.log(treeNode)
      return treeNode.componentOptions.propsData.dataRef.deptName.indexOf(inputValue.toLowerCase()) >= 0
    },
  },
}
</script>

<style>
</style>