import Vue from 'vue'
import { login, login2, logout, phoneLogin, thirdLogin } from "@/api/login"
import { USER_ID, ACCESS_TOKEN, USER_NAME, USER_INFO, USER_AUTH, UI_CACHE_DB_DICT_DATA, TENANT_ID, CACHE_INCLUDED_ROUTES } from "@/store/mutation-types"
import { welcome } from "@/utils/util"
import { queryPermissionsByUser } from '@/api/api'
import { getAction } from '@/api/manage'
import { rebuildRouter } from '@/utils/hasPermission'

const user = {
  state: {
    id:'',
    token: '',
    username: '',
    realname: '',
    tenantid: '',
    welcome: '',
    avatar: '',
    permissionList: [],
    info: {}
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, { username, realname, welcome }) => {
      state.username = username
      state.realname = realname
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_PERMISSIONLIST: (state, permissionList) => {
      state.permissionList = permissionList
    },
    SET_INFO: (state, info) => {
      state.info = info
    },
    SET_TENANT: (state, id) => {
      state.tenantid = id
    },
  },

  actions: {
    // CAS验证登录
    ValidateLogin({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        getAction("/sys/cas/client/validateLogin", userInfo).then(response => {
          console.log("----cas 登录--------", response);
          if (response.success) {
            const result = response.result
            const userInfo = result.userInfo
            Vue.ls.set(ACCESS_TOKEN, result.token, 7 * 24 * 60 * 60 * 1000)
            Vue.ls.set(USER_NAME, userInfo.username, 7 * 24 * 60 * 60 * 1000)
            Vue.ls.set(USER_INFO, userInfo, 7 * 24 * 60 * 60 * 1000)
            Vue.ls.set(USER_ID, userInfo.id, 7 * 24 * 60 * 60 * 1000)
            commit('SET_TOKEN', result.token)
            commit('SET_INFO', userInfo)
            commit('SET_NAME', { username: userInfo.username, realname: userInfo.realname, welcome: welcome() })
            commit('SET_AVATAR', userInfo.avatar)
            resolve(response)
          } else {
            resolve(response)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 登录
    Login({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo).then(response => {
          console.log("User Login:", response)
          if (response.code == 200) {
            const result = response.data
            const userInfo = result.userInfo
            Vue.ls.set(ACCESS_TOKEN, result.token, 7 * 24 * 60 * 60 * 1000)
            Vue.ls.set(USER_NAME, userInfo.idName, 7 * 24 * 60 * 60 * 1000)
            Vue.ls.set(USER_INFO, userInfo, 7 * 24 * 60 * 60 * 1000)
            Vue.ls.set(USER_ID, userInfo.id, 7 * 24 * 60 * 60 * 1000)
            // Vue.ls.set(UI_CACHE_DB_DICT_DATA, result.sysAllDictItems, 7 * 24 * 60 * 60 * 1000)
            console.log('登录的用户信息', userInfo)
            commit('SET_TOKEN', result.token)
            commit('SET_INFO', userInfo)
            commit('SET_NAME', { username: userInfo.idName, realname: userInfo.idName, welcome: welcome() })
            commit('SET_AVATAR', userInfo.headUrl || '')
            resolve(response)
          } else {
            resolve(response)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },
    Login2({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        login2(userInfo).then(response => {
          console.log("User Login:", response)
          if (response.code == 200) {
            const result = response.data
            const userInfo = result.userInfo
            Vue.ls.set(ACCESS_TOKEN, result.token, 7 * 24 * 60 * 60 * 1000)
            Vue.ls.set(USER_NAME, userInfo.idName, 7 * 24 * 60 * 60 * 1000)
            Vue.ls.set(USER_INFO, userInfo, 7 * 24 * 60 * 60 * 1000)
            Vue.ls.set(USER_ID, userInfo.id, 7 * 24 * 60 * 60 * 1000)
            // Vue.ls.set(UI_CACHE_DB_DICT_DATA, result.sysAllDictItems, 7 * 24 * 60 * 60 * 1000)
            console.log('登录的用户信息', userInfo)
            commit('SET_TOKEN', result.token)
            commit('SET_INFO', userInfo)
            commit('SET_NAME', { username: userInfo.idName, realname: userInfo.idName, welcome: welcome() })
            commit('SET_AVATAR', userInfo.headUrl || '')
            resolve(response)
          } else {
            reject(response)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },
    //手机号登录
    PhoneLogin({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        phoneLogin(userInfo).then(response => {
          if (response.code == 200) {
            console.log('用户登录信息', response)
            const result = response.data
            const userInfo = result.userInfo
            Vue.ls.set(ACCESS_TOKEN, result.token, 7 * 24 * 60 * 60 * 1000)
            Vue.ls.set(USER_NAME, userInfo.idName, 7 * 24 * 60 * 60 * 1000)
            Vue.ls.set(USER_INFO, userInfo, 7 * 24 * 60 * 60 * 1000)
            Vue.ls.set(UI_CACHE_DB_DICT_DATA, result.sysAllDictItems, 7 * 24 * 60 * 60 * 1000)
            commit('SET_TOKEN', result.token)
            commit('SET_INFO', userInfo)
            commit('SET_NAME', { username: userInfo.idName, realname: userInfo.realname, welcome: welcome() })
            commit('SET_AVATAR', userInfo.headUrl)
            resolve(response)
          } else {
            reject(response)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 获取用户信息
    GetPermissionList({ commit }) {
      return new Promise((resolve, reject) => {
        queryPermissionsByUser().then(response => {
          // 这里处理获取到的按钮权限和授权菜单
          let menuData = response.data.menuList;
          let authData = response.data.btnList;
          if (authData.length) {
            authData = authData.map(auth => {
              return {
                action: auth.menuCode,
                describe: auth.menuName,
                type: "1"
              }
            })
          } else {
            authData = []
          }
          Vue.ls.set(USER_AUTH, authData);
          sessionStorage.setItem(USER_AUTH, JSON.stringify(authData));
          if (menuData && menuData.length > 0) {
            menuData = rebuildRouter(menuData)
            commit('SET_PERMISSIONLIST', menuData)
          } else {
            reject('getPermissionList: permissions must be a non-null array !')
          }
          // resolve(response)
          resolve({ menu: menuData })
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    Logout({ commit, state }) {
      return new Promise((resolve) => {
        let logoutToken = state.token;
        commit('SET_TOKEN', '')
        commit('SET_PERMISSIONLIST', [])
        Vue.ls.remove(ACCESS_TOKEN)
        Vue.ls.remove(USER_INFO)
        Vue.ls.remove(USER_NAME)
        Vue.ls.remove(UI_CACHE_DB_DICT_DATA)
        Vue.ls.remove(CACHE_INCLUDED_ROUTES)
        logout(logoutToken).then(() => {
          if (process.env.VUE_APP_SSO == 'true') {
            let sevice = 'http://' + window.location.host + '/'
            let serviceUrl = encodeURIComponent(sevice)
            window.location.href = process.env.VUE_APP_CAS_BASE_URL + '/logout?service=' + serviceUrl
          }
          resolve()
        }).catch(() => {
          resolve()
        })
      })
    },
    // 第三方登录
    ThirdLogin({ commit }, param) {
      return new Promise((resolve, reject) => {
        thirdLogin(param.token, param.thirdType).then(response => {
          if (response.code == '200') {
            const result = response.result
            const userInfo = result.userInfo
            Vue.ls.set(ACCESS_TOKEN, result.token, 7 * 24 * 60 * 60 * 1000)
            Vue.ls.set(USER_NAME, userInfo.username, 7 * 24 * 60 * 60 * 1000)
            Vue.ls.set(USER_INFO, userInfo, 7 * 24 * 60 * 60 * 1000)
            commit('SET_TOKEN', result.token)
            commit('SET_INFO', userInfo)
            commit('SET_NAME', { username: userInfo.username, realname: userInfo.realname, welcome: welcome() })
            commit('SET_AVATAR', userInfo.avatar)
            resolve(response)
          } else {
            reject(response)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },
    saveTenant({ commit }, id) {
      Vue.ls.set(TENANT_ID, id, 7 * 24 * 60 * 60 * 1000)
      commit('SET_TENANT', id)
    }


  }
}

export default user