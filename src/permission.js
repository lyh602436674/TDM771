/*
 * @Author: 陈乾龙
 * @Date: 2021-06-24 10:47:53
 * @LastEditTime: 2021-09-27 09:48:41
 * @LastEditors: 赵峰
 * @Description:
 * @FilePath: \hifar-platform-client\src\permission.js
 */
import Vue from 'vue'
import router from './router'
import store from './store'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { ACCESS_TOKEN, INDEX_MAIN_PAGE_PATH } from '@/store/mutation-types'
import { generateIndexRouter } from "@/utils/util"

NProgress.configure({ showSpinner: false }) // NProgress Configuration

/**
 * @Date: 2021-07-15 15:05:32
 * @Author: 陈乾龙
 * @description: 系统白名单
 */
var whiteList = ['/user/login', '/user/register', '/user/register-result', '/user/alteration','/home/tdm/sso'] // no redirect whitelist


router.beforeEach((to, from, next) => {
  // 下面这部分是在数据配置中动态配置的白名单，启动位置在main.js中，暂时注释后续需要再打开
  // whiteList = whiteList.concat(Vue.ls.get('ROUTER_WHITELIST') || [])
  // whiteList = [...new Set(whiteList)]
  NProgress.start() // start progress bar

  if (Vue.ls.get(ACCESS_TOKEN)) {
    /* has token */
    if (to.path === '/user/login') {
      next({ path: INDEX_MAIN_PAGE_PATH })
      NProgress.done()
    } else {
      if (store.getters.permissionList.length === 0) {
        // 这里获取用户权限
        store.dispatch('GetPermissionList').then(res => {
          const menuData = res.menu;
          //console.log(res.message)
          if (menuData === null || menuData === "" || menuData === undefined) {
            return;
          }
          let constRoutes = [];
          constRoutes = generateIndexRouter(menuData);
          // 添加主界面路由
          store.dispatch('UpdateAppRouter', { constRoutes }).then(() => {
            // 根据roles权限生成可访问的路由表
            // 动态添加可访问路由表
            router.addRoutes(store.getters.addRouters)
            const redirect = decodeURIComponent(from.query.redirect || to.path)
            if (to.path === redirect) {
              // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
              next({ ...to, replace: true })
            } else {
              // 跳转到目的路由
              next({ path: redirect })
            }
          })
        })
          .catch((err) => {
            console.log('重组路由的问题',err)
            store.dispatch('Logout').then(() => {
              next({ path: '/user/login', query: { redirect: to.fullPath } })
            })
          })
      } else {
        next()
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next()
    } else {
      next({ path: '/user/login', query: { redirect: to.fullPath } })
      NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
    }
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})
