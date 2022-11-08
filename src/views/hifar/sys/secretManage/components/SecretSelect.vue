<!--
 * @Author: 陈乾龙
 * @Date: 2021-05-28 16:19:49
 * @LastEditTime: 2021-08-27 18:17:10
 * @LastEditors: 陈乾龙
 * @Description: 密级选择下拉选择器
 * @FilePath: \hifar-platform-client\src\views\hifar\sys\secretManage\components\SecretSelect.vue
-->
<template>
  <a-dropdown>
    <a-button size="small" type="default" icon="setting">设置密级</a-button>
    <a-menu slot="overlay" @click="handleMenuClick">
      <a-menu-item v-for="(item, index) in secretList" :key="index">
        {{ item.itemValue }}
      </a-menu-item>
    </a-menu>
  </a-dropdown>
</template>

<script>
import { getDictItemsFromCache, listByDictCode } from '@/api/api'
export default {
  data() {
    return {
      secretList: [],
      dictCode: 'hf_sys_secret',
      url: {
        list: '/hifarsys/secret/getSecretList',
      },
    }
  },
  created() {
    this.initDictData()
  },
  methods: {
    initDictData() {
      //优先从缓存中读取字典配置
      if (getDictItemsFromCache(this.dictCode)) {
        this.secretList = getDictItemsFromCache(this.dictCode)
        return
      }
      listByDictCode(this.dictCode, null).then((res) => {
        if (res.code == 200) {
          this.secretList = res.data
        }
      })
    },
    handleMenuClick(item) {
      let key = item.key
      this.$emit('select', this.secretList[key])
    },
  },
}
</script>