import Vue from 'vue'
import {
  SIDEBAR_TYPE,
  DEFAULT_THEME,
  DEFAULT_LAYOUT_MODE,
  DEFAULT_COLOR,
  DEFAULT_COLOR_WEAK,
  DEFAULT_FIXED_HEADER,
  DEFAULT_FIXED_SIDEMENU,
  DEFAULT_FIXED_HEADER_HIDDEN,
  DEFAULT_CONTENT_WIDTH_TYPE,
  DEFAULT_MULTI_PAGE,
  DEFAULT_MULTI_FIXED,
  DEFAULT_LOGINCONFIG
} from "@/store/mutation-types"
const sysLoginConfigUrl = '/SysSwitchBusiness/queryByItemKeyPrefix'
import { getAction } from '@/api/manage'

const app = {
  state: {
    // 路由白名单
    whiteList:[],
    sidebar: {
      opened: true,
      withoutAnimation: false
    },
    device: 'desktop',
    theme: '',
    layout: '',
    contentWidth: '',
    fixedHeader: true,
    fixSiderbar: true,
    autoHideHeader: false,
    color: null,
    weak: false,
    multipage: true, //默认多页签模式
    fixedMultipage: true, //默认多页签模式是固定到顶部的
    loginLogo: "",  //登录页logo
    loginPrimarySlogan: "", //登录页主Slogan
    loginSecondarySlogan: "", // 登录页次Slogan
    loginWelcome: "", //登录页欢迎语
    loginCompanyCH: "", // 登录页公司中文名
    loginCompanyEN: "", // 登录页公司英文名
    loginSysLogo: "", // 系统Logo，单logo
    loginSysNameCH: "",//系统中文名
    loginSysNameEN: "", // 系统英文名
    loginSysNameSample:"",// 系统名称简写
    loginCopyRightTime: "", // 版权时间
    logoinCompanyLink: "", // 官网首页

  },
  mutations: {
    SET_SIDEBAR_TYPE: (state, type) => {
      Vue.ls.set(SIDEBAR_TYPE, type)
      state.sidebar.opened = type
    },
    CLOSE_SIDEBAR: (state, withoutAnimation) => {
      Vue.ls.set(SIDEBAR_TYPE, true)
      state.sidebar.opened = false
      state.sidebar.withoutAnimation = withoutAnimation
    },
    TOGGLE_DEVICE: (state, device) => {
      state.device = device
    },
    TOGGLE_THEME: (state, theme) => {
      // setStore('_DEFAULT_THEME', theme)
      Vue.ls.set(DEFAULT_THEME, theme)
      state.theme = theme
    },
    TOGGLE_LAYOUT_MODE: (state, layout) => {
      Vue.ls.set(DEFAULT_LAYOUT_MODE, layout)
      state.layout = layout
    },
    TOGGLE_FIXED_HEADER: (state, fixed) => {
      Vue.ls.set(DEFAULT_FIXED_HEADER, fixed)
      state.fixedHeader = fixed
    },
    TOGGLE_FIXED_SIDERBAR: (state, fixed) => {
      Vue.ls.set(DEFAULT_FIXED_SIDEMENU, fixed)
      state.fixSiderbar = fixed
    },
    TOGGLE_FIXED_HEADER_HIDDEN: (state, show) => {
      Vue.ls.set(DEFAULT_FIXED_HEADER_HIDDEN, show)
      state.autoHideHeader = show
    },
    TOGGLE_CONTENT_WIDTH: (state, type) => {
      Vue.ls.set(DEFAULT_CONTENT_WIDTH_TYPE, type)
      state.contentWidth = type
    },
    TOGGLE_COLOR: (state, color) => {
      Vue.ls.set(DEFAULT_COLOR, color)
      state.color = color
    },
    TOGGLE_WEAK: (state, flag) => {
      Vue.ls.set(DEFAULT_COLOR_WEAK, flag)
      state.weak = flag
    },
    SET_MULTI_PAGE(state, multipageFlag) {
      Vue.ls.set(DEFAULT_MULTI_PAGE, multipageFlag)
      state.multipage = multipageFlag
    },
    SET_MULTI_FIXED(state, flag) {
      Vue.ls.set(DEFAULT_MULTI_FIXED, flag)
      state.fixedMultipage = flag
    },
    SET_LOGINCONFIG(state, config) {
      Vue.ls.set(DEFAULT_LOGINCONFIG, config)
      Object.keys(config).map(key => {
        state[key] = config[key] || '--'
      })
    },
    SET_ROUTERWHITELIST(state,whiteList){
      Vue.ls.set('ROUTER_WHITELIST',whiteList)
      state.whiteList = whiteList
    }
  },
  actions: {
    setSidebar: ({ commit }, type) => {
      commit('SET_SIDEBAR_TYPE', type)
    },
    CloseSidebar({ commit }, { withoutAnimation }) {
      commit('CLOSE_SIDEBAR', withoutAnimation)
    },
    ToggleDevice({ commit }, device) {
      commit('TOGGLE_DEVICE', device)
    },
    ToggleTheme({ commit }, theme) {
      commit('TOGGLE_THEME', theme)
    },
    ToggleLayoutMode({ commit }, mode) {
      commit('TOGGLE_LAYOUT_MODE', mode)
    },
    ToggleFixedHeader({ commit }, fixedHeader) {
      if (!fixedHeader) {
        commit('TOGGLE_FIXED_HEADER_HIDDEN', false)
      }
      commit('TOGGLE_FIXED_HEADER', fixedHeader)
    },
    ToggleFixSiderbar({ commit }, fixSiderbar) {
      commit('TOGGLE_FIXED_SIDERBAR', fixSiderbar)
    },
    ToggleFixedHeaderHidden({ commit }, show) {
      commit('TOGGLE_FIXED_HEADER_HIDDEN', show)
    },
    ToggleContentWidth({ commit }, type) {
      commit('TOGGLE_CONTENT_WIDTH', type)
    },
    ToggleColor({ commit }, color) {
      commit('TOGGLE_COLOR', color)
    },
    ToggleWeak({ commit }, weakFlag) {
      commit('TOGGLE_WEAK', weakFlag)
    },
    ToggleMultipage({ commit }, multipageFlag) {
      commit('SET_MULTI_PAGE', multipageFlag)
    },
    ToggleFixMultipage({ commit }, flag) {
      commit("SET_MULTI_FIXED", flag)
    },
    GetSysLoginConfig({ commit }, config={}) {
      getAction(sysLoginConfigUrl, { itemKey: 'login' }).then(result => {
        if (result.code == 200) {
          let systemConfig = {}
          result.data.map(item=>{
            systemConfig[item.itemKey] = item.itemValue
          })
          commit('SET_LOGINCONFIG', systemConfig)
          document.title = systemConfig.loginSysNameCH
        } else {
          commit('SET_LOGINCONFIG', config)
        }
      })

    },
    GetRouteWhiteList({commit},callback){
      getAction('/hifarsys/hfSysConfig/queryByKey',{key:'routerWhiteList'}).then(response=>{
        if(response.success){
          let configValue = response.result.configValue || ""
          configValue = configValue.split(",")
          commit('SET_ROUTERWHITELIST',configValue)
          if(typeof callback== 'function'){
            callback()
          }
        }
      })
    }
  }
}

export default app