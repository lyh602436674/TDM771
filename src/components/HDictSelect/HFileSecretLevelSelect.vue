<!--
 * @Author: 雷宇航
 * @Date: 2022-06-29 18:18:36
 * @fileName: HFileSecretLevelSelect.vue
 * @FilePath: tdm200-client\src\components\HDictSelect\HFileSecretLevelSelect.vue
 * @Description: 文件密级下拉框专用
-->
<template>
  <h-select
    :allowClear="true"
    :filterOption="filterOption"
    :getPopupContainer="getPopupContainer"
    :placeholder="placeholder"
    :showSearch="true"
    :size="size"
    :value="getValueSting"
    @change="handleInput"
  >
    <!--    @focus="handleFocus"-->
    <template v-if="$slots && $slots.addonBefore && $slots.addonBefore.length" slot="addonBefore">
      <slot name="addonBefore"></slot>
    </template>
    <template slot="default">
      <a-select-option
        v-for="(item, key) in dictOptions"
        :key="key"
        :disabled="item.disabled"
        :title="item.itemValue || item.itemName"
        :value="item.itemKey"
      >
        <span :title="item.itemValue" style="display: inline-block; width: 100%">
          {{ item.itemValue || item.itemName }}
        </span>
      </a-select-option>
    </template>
  </h-select>
</template>

<script>
import {getDictItemsFromCache, listByDictCode} from '@/api/api'
import {UI_CACHE_DB_DICT_DATA} from '@/store/mutation-types'
import {find} from 'lodash'

export default {
  name: 'HFileSecretLevelSelect',
  props: {
    triggerChange: {
      type: Boolean,
      default: false,
    },
    value: [String, Number],
    placeholder: {
      type: String,
      default: '请选择',
    },
    size: {
      type: String,
      default: 'default',
      required: false,
    },
    dictCode: {
      type: String,
      default: 'hf_sys_file_secret',
    },
    getPopupContainer: {
      default: () => {
        return () => document.body
      },
    },
  },
  data() {
    return {
      dictOptions: [],
      getValueSting: undefined,
      formSecretLevel: '1',
    }
  },
  watch: {
    size: {
      immediate: true,
      handler(val) {
        if (!val || !val.length) {
          this.size = 'default'
        } else {
          this.size = val
        }
      },
    },
    dictCode: {
      immediate: true,
      handler(val) {
        this.dictCode = val
        this.initDictData()
      },
    },
    value: {
      immediate: true,
      handler(val) {
        if (!val) {
          this.getValueSting = val
        } else {
          this.getValueSting = String(val)
        }
      },
    },
    // '$store.state.secretLevel.formSecretLevel': {
    //   immediate: true,
    //   handler(val) {
    //     this.formSecretLevel = val
    //     if (+val < +this.getValueSting) {
    //       this.getValueSting = val
    //     }
    //   },
    // },
  },
  mode: ['value', 'change'],
  created() {
    this.initDictData()
  },
  methods: {
    initDictData() {
      //优先从缓存中读取字典配置
      if (getDictItemsFromCache(this.dictCode)) {
        this.dictOptions = getDictItemsFromCache(this.dictCode)
        // this.filterMaxSecretLevel()
        return
      }
      listByDictCode(this.dictCode, null).then((res) => {
        if (res.code == 200) {
          let dictVal = this.$ls.get(UI_CACHE_DB_DICT_DATA)
          let dictCode = this.dictCode
          this.dictOptions = res.data
          this.$ls.remove(UI_CACHE_DB_DICT_DATA)
          this.$ls.set(UI_CACHE_DB_DICT_DATA, {...dictVal, [dictCode]: res.data}, 7 * 24 * 60 * 60 * 1000)
          // this.filterMaxSecretLevel()
        }
      })
    },
    handleFocus() {
      this.filterMaxSecretLevel()
    },
    filterMaxSecretLevel() {
      // 这里根据表单选择的密级，限制文件密级最大选项
      if (this.dictCode === 'hf_sys_file_secret') {
        this.dictOptions.length && this.dictOptions.map(item => item.disabled = +item.itemKey > +this.formSecretLevel)
        this.$forceUpdate()
      }
    },
    handleInput(v, option) {
      this.getValueSting = v
      let dictItem = find(this.dictOptions, (obj) => {
        return obj.itemKey == v
      })
      this.$emit(
        'change',
        this.getValueSting,
        {
          value: dictItem ? dictItem.itemKey : '',
          title: dictItem ? dictItem.itemValue : '',
          dictCode: dictItem ? dictItem.dictCode : '',
        },
        dictItem
      )
      this.$emit(
        'input',
        this.getValueSting,
        {
          value: dictItem ? dictItem.itemKey : '',
          title: dictItem ? dictItem.itemValue : '',
          dictCode: dictItem ? dictItem.dictCode : '',
        },
        dictItem
      )
    },
    filterOption(input, option) {
      return option.componentOptions.propsData.title.toLowerCase().indexOf(input.toLowerCase()) >= 0
    },
  },
}
</script>

<style>
</style>