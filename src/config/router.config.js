/*
 * @Author: 陈乾龙
 * @Date: 2021-05-20 11:27:54
 * @LastEditTime: 2021-09-27 09:48:27
 * @LastEditors: 赵峰
 * @Description: 路由菜单
 * @FilePath: \hifar-platform-client\src\config\router.config.js
 */
import { UserLayout, TabLayout, RouteView, BlankLayout, PageView } from '@/components/layouts'

/**
 * 走菜单，走权限控制
 * @type {[null,null]}
 */
export const asyncRouterMap = [

  {
    path: '/',
    name: 'dashboard',
    component: TabLayout,
    meta: { title: '首页' },
    redirect: '/home',
    children: []
  },
  {
    // 2022-4-25 雷宇航 地址跳转错误自动跳转到首页
    path: '*', redirect: '/home', hidden: true
  }
]

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/register/Register')
      },
      {
        path: 'register-result',
        name: 'registerResult',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/register/RegisterResult')
      },
      {
        path: 'alteration',
        name: 'alteration',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/alteration/Alteration')
      }
    ]
  },
  // {
  //   path:"/tools",
  //   component:TabLayout,
  //   redirect:"/tools/fileManage",
  //   hidden:true,
  //   children:[
  //     {
  //       path:'fileManage',
  //       name:'fileManage',
  //       meta: { title: '工具' },
  //       component:()=>import(/* webpackChunkName: "fileManage" */ '@/views/hifar/sys/tools/fileManage/FileManageList.vue')
  //     }
  //   ]
  // },
  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  },
  {
    path: '/home/tdm/sso',
    name: 'sso',
    component: () => import(/* webpackChunkName: "user" */ '@views/sso/sso')
  }

]
