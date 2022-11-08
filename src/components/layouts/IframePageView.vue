<!--
 * @Author: 陈乾龙
 * @Date: 2021-07-14 09:37:38
 * @LastEditTime: 2021-12-01 15:06:57
 * @LastEditors: 陈乾龙
 * @Description: 跳转第三发页面
 * @FilePath: \hifar-platform-client\src\components\layouts\IframePageView.vue
-->
<template>
  <iframe :id="id" :src="url" frameborder="0" width="100%" height="100%" scrolling="auto"></iframe>
</template>

<script>
import Vue from 'vue'
import { ACCESS_TOKEN } from '@/store/mutation-types'

export default {
  name: 'IframePageContent',
  inject: ['closeCurrent'],
  data() {
    return {
      url: '',
      id: '',
    }
  },
  created() {
    this.goUrl()
  },
  updated() {
    this.goUrl()
  },
  watch: {
    $route(to, from) {
      this.goUrl()
    },
  },
  methods: {
    goUrl() {
      let url = this.$route.meta.url
      let id = this.$route.path
      this.id = id
      // url = "http://www.baidu.com"
      // console.log('------url------' + url)
      if (url !== null && url !== undefined) {
        this.url = url
        /*update_begin author:wuxianquan date:20190908 for:判断打开方式，新窗口打开时this.$route.meta.internalOrExternal==true */
        if (this.$route.meta.internalOrExternal != undefined && this.$route.meta.internalOrExternal == true) {
          this.closeCurrent()
          //外部url加入token
          let tokenStr = '${token}'
          if (url.indexOf(tokenStr) != -1) {
            let token = Vue.ls.get(ACCESS_TOKEN)
            this.url = url.replace(tokenStr, token)
          }
          window.open(this.url)
        }
        /*update_end author:wuxianquan date:20190908 for:判断打开方式，新窗口打开时this.$route.meta.internalOrExternal==true */
      }
    },
  },
}
</script>

<style>
</style>