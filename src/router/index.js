/*
 * @Author: 陈乾龙
 * @Date: 2021-05-20 11:27:54
 * @LastEditTime: 2021-06-16 13:40:48
 * @LastEditors: 陈乾龙
 * @Description: 
 * @FilePath: \hifar-vue\ant-design-jeecg-vue\src\router\index.js
 */
import Vue from 'vue'
import Router from 'vue-router'
import { constantRouterMap } from '@/config/router.config'

Vue.use(Router)

const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})