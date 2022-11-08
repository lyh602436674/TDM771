<!--
 * @Author: 赵峰
 * @Date: 2021-08-03 14:26:08
 * @LastEditTime: 2021-11-01 18:01:13
 * @LastEditors: 陈乾龙
 * @Descripttion:
 * @FilePath: \hifar-platform-client\src\components\HDictSelect\HDictSelect.vue
-->
<template>
  <h-select
    :allowClear="true"
    :filterOption="filterOption"
    :getPopupContainer="getPopupContainer"
    :placeholder="placeholder"
    :showSearch="true"
    :disabled="disabled"
    :size="size"
    :value="getValueSting"
    @change="handleInput"
  >
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
  name: 'HDictSelect',
  props: {
    triggerChange: {
      type: Boolean,
      default: false,
    },
    disabled: {
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
      default: '',
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
          // this.setSecretLevelStore(val)
        }
      },
    },
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
    setSecretLevelStore(val) {
      if (this.dictCode === 'hf_entrustlist_secondary') {
        this.$store.commit('FORM_SECRET_LEVEL', val)
      }
    },
    filterMaxSecretLevel() {
      // 这里根据登录用户的密级，限制表单密级最大选项
      if (this.dictCode === 'hf_entrustlist_secondary') {
        let userSecretLevel = this.$store.getters.userInfo.secretLevel
        this.dictOptions.map(item => item.disabled = +item.itemKey > +userSecretLevel)
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