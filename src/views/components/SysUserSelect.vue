<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-03 16:51:00
 * @LastEditTime: 2021-08-05 10:02:10
 * @LastEditors: 赵峰
 * @Description: 系统内用户下拉选择
 * @FilePath: \hifar-platform-client\src\views\components\SysUserSelect.vue
-->
<template>
  <h-select
    placeholder="请选择用户"
    :value="localValue"
    :mode="multiple ? 'multiple' : 'default'"
    :options="options"
    :showSearch="showSearch"
    :size="size"
    @change="handleSelectChange"
  ></h-select>
</template>

<script>
import { getAction } from '@/api/manage'
import { findIndex, isArray } from 'lodash'
export default {
  props: {
    value: {
      type: [String, Number, Array],
      default: () => [],
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    showSearch: {
      type: Boolean,
      default: true,
    },
    size: {
      type: String,
      default: 'default',
    },
  },
  data() {
    return {
      localValue: this.value || undefined,
      options: [], // 下拉数据
      model: [], // 原始数据
      url: {
        list: '/OrgUserBusiness/listAll',
      },
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.resetSelected(val)
      },
    },
  },
  created() {
    this.getSysUserList()
  },
  methods: {
    resetSelected(val) {
      this.localValue = val
      if (isArray(val)) {
        let selected = []
        val.map((key) => {
          let index = findIndex(this.model, function (obj) {
            return obj.id == key
          })
          selected.push(this.model[index])
        })
        this.selected = selected
      } else if (val) {
        let index = findIndex(this.model, function (obj) {
          return obj.id == val
        })
        this.selected = this.model[index]
      } else {
        this.selected = null
      }
    },
    handleSelectChange(v) {
      if (this.multiple) {
        let selected = []
        v.map((key) => {
          let index = findIndex(this.model, function (obj) {
            return obj.id == key
          })
          selected.push(this.model[index])
        })
        this.selected = selected
      } else {
        let index = findIndex(this.model, function (obj) {
          return obj.id == v
        })
        this.selected = this.model[index]
      }
      this.localValue = v
      this.triggerChange()
    },
    triggerChange() {
      this.$emit('change', this.localValue, this.selected)
      this.$emit('input', this.localValue, this.selected)
    },
    getSysUserList() {
      getAction(this.url.list).then((res) => {
        if (res.code == 200) {
          let options = res.data.map((item) => {
            return {
              title: item.idName,
              key: item.id,
              value: item.id,
            }
          })
          this.options = options
          this.model = res.data
        }
      })
    },
  },
}
</script>

<style lang='less' scoped>
</style>