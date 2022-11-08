/*
 * @Author: 陈乾龙
 * @Date: 2021-05-20 11:27:54
 * @LastEditTime: 2022-04-06 14:10:22
 * @LastEditors: 雷宇航
 * @Description:
 * @FilePath: \tdm200-client\tdm200-client\src\main.js
 */
/** init domain config */
import './config'

import Vue from 'vue'
import App from './App.vue'
import Storage from 'vue-ls'
import router from './router'
import store from './store/'
import {
  VueAxios
} from "@/utils/request"
import {
  WOW
} from 'wowjs'

// import Viser from 'viser-vue'
/**
 * @description: 这里引入echarts依赖包，echarts本身比较大这里先暂时引入，后面做成CDN引入
 */
import * as echarts from 'echarts'
Vue.prototype.$echarts = echarts
Vue.use(echarts)
/**
 * @description: 全局组件和样式定义
 */
import "@/components/lazy_antd.js"
import 'ant-design-vue/dist/antd.less'; // or 'ant-design-vue/dist/antd.less'
import "@/assets/less/custom_theme.less";
import "@/assets/less/common.less";
import "@/views/assets/less/index.less";
import animated from 'animate.css'

import '@/permission'
import '@/utils/filter' // 基础的过滤器
import Print from 'vue-print-nb-jeecg'
/*import '@babel/polyfill'*/
import preview from 'vue-photo-preview'
import 'vue-photo-preview/dist/skin.css'
import SSO from '@/cas/sso.js'
// import vueSeamlessScroll from 'vue-seamless-scroll'
import {
  ACCESS_TOKEN,
  DEFAULT_COLOR,
  DEFAULT_THEME,
  DEFAULT_LAYOUT_MODE,
  DEFAULT_COLOR_WEAK,
  SIDEBAR_TYPE,
  DEFAULT_FIXED_HEADER,
  DEFAULT_FIXED_HEADER_HIDDEN,
  DEFAULT_FIXED_SIDEMENU,
  DEFAULT_CONTENT_WIDTH_TYPE,
  DEFAULT_MULTI_PAGE,
  DEFAULT_MULTI_FIXED,
  DEFAULT_LOGINCONFIG
} from "@/store/mutation-types"
import config from '@/defaultSettings'

import hasPermission from '@/utils/hasPermission'
import vueBus from '@/utils/vueBus';
import VueIntro from 'vue-introjs'
import 'intro.js/introjs.css'
Vue.use(VueIntro)
// Vue.use(vueSeamlessScroll)

// Vue.prototype.wps = WPS
Vue.prototype.$wow = WOW
Vue.config.productionTip = false
Vue.use(Storage, config.storageOptions)
Vue.use(VueAxios, router)
// Vue.use(Viser)
Vue.use(hasPermission)
Vue.use(Print)
Vue.use(preview)
Vue.use(vueBus)
// Vue.use(VueAreaLinkage)
Vue.use(animated)

SSO.init(() => {
  /**
   * @Date: 2021-07-06 11:05:35
   * @Author: 陈乾龙
   * @description: 下面的配置参数是配置白名单的接口，在拿到白名单后再挂载app，防止路由地址找不到
   */
  // store.dispatch('GetRouteWhiteList',main)
  main()
})

function main() {
  new Vue({
    router,
    store,
    mounted() {
      store.commit('SET_SIDEBAR_TYPE', Vue.ls.get(SIDEBAR_TYPE, true))
      store.commit('TOGGLE_THEME', Vue.ls.get(DEFAULT_THEME, config.navTheme))
      store.commit('TOGGLE_LAYOUT_MODE', Vue.ls.get(DEFAULT_LAYOUT_MODE, config.layout))
      store.commit('TOGGLE_FIXED_HEADER', Vue.ls.get(DEFAULT_FIXED_HEADER, config.fixedHeader))
      store.commit('TOGGLE_FIXED_SIDERBAR', Vue.ls.get(DEFAULT_FIXED_SIDEMENU, config.fixSiderbar))
      store.commit('TOGGLE_CONTENT_WIDTH', Vue.ls.get(DEFAULT_CONTENT_WIDTH_TYPE, config.contentWidth))
      store.commit('TOGGLE_FIXED_HEADER_HIDDEN', Vue.ls.get(DEFAULT_FIXED_HEADER_HIDDEN, config.autoHideHeader))
      store.commit('TOGGLE_WEAK', Vue.ls.get(DEFAULT_COLOR_WEAK, config.colorWeak))
      store.commit('TOGGLE_COLOR', Vue.ls.get(DEFAULT_COLOR, config.primaryColor))
      store.commit('SET_TOKEN', Vue.ls.get(ACCESS_TOKEN))
      store.commit('SET_MULTI_PAGE', Vue.ls.get(DEFAULT_MULTI_PAGE, config.multipage))
      store.commit('SET_MULTI_FIXED', Vue.ls.get(DEFAULT_MULTI_FIXED, config.fixedMultipage))
      // 获取系统配置参数
      store.dispatch('GetSysLoginConfig', Vue.ls.get(DEFAULT_LOGINCONFIG))
    },
    render: h => h(App)
  }).$mount('#app')
}