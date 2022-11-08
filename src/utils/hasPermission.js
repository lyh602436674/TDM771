/*
 * @Author: 陈乾龙
 * @Date: 2021-05-20 11:27:54
 * @LastEditTime: 2021-11-19 11:02:18
 * @LastEditors: 赵峰
 * @Description:
 * @FilePath: \hifar-platform-client\src\utils\hasPermission.js
 */
import {SYS_BUTTON_AUTH, USER_AUTH} from "@/store/mutation-types"
import {BasicLayout, BlankLayout, IframePageView, PageView, RouteView} from '@/components/layouts'

const hasPermission = {
  install(Vue, options) {
    //console.log(options);
    Vue.directive('has', {
      inserted: (el, binding, vnode) => {
        // console.log("页面权限控制----", 1, el, 2, binding, 3, vnode);
        //节点权限处理，如果命中则不进行全局权限处理
        // console.log('先判断流程节点控制', filterNodePermission(el, binding, vnode))
        if (!filterNodePermission(el, binding, vnode)) {
          filterGlobalPermission(el, binding, vnode);
        }
      }
    });
  }
};

/**
 * 流程节点权限控制
 */
export function filterNodePermission(el, binding, vnode) {
  let permissionList = [];
  try {
    let obj = vnode.context.$props && vnode.context.$props.formData;
    if (obj) {
      let bpmList = obj.permissionList;
      for (let bpm of bpmList) {
        if (bpm.type != '2') {
          permissionList.push(bpm);
        }
      }
    } else {
      return false;
    }
  } catch (e) {
    console.log("页面权限异常----", e);
  }
  if (permissionList === null || permissionList === "" || permissionList === undefined || permissionList.length <= 0) {
    //el.parentNode.removeChild(el)
    return false;
  }
  let permissions = [];
  for (let item of permissionList) {
    if (item.type != '2') {
      permissions.push(item.action);
    }
  }
  // console.log("页面权限----", permissions);
  // console.log("页面权限----", binding.value);
  if (!permissions.includes(binding.value)) {
    //el.parentNode.removeChild(el)
    return false;
  } else {
    for (let item2 of permissionList) {
      if (binding.value === item2.action) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 全局权限控制
 */
export function filterGlobalPermission(el, binding, vnode) {
  let permissionList = [];
  let allPermissionList = [];

  //let authList = Vue.ls.get(USER_AUTH);
  let authList = JSON.parse(sessionStorage.getItem(USER_AUTH) || "[]");

  for (let auth of authList) {
    if (auth.type != 2) {
      permissionList.push(auth);
    }
  }
  // console.log("页面权限--permissionList--", permissionList);

  let allAuthList = JSON.parse(sessionStorage.getItem(SYS_BUTTON_AUTH) || "[]");
  for (let gauth of allAuthList) {
    if (gauth.type != '2') {
      allPermissionList.push(gauth);
    }
  }
  // console.log("页面权限--allPermissionList--", allPermissionList);
  //设置全局配置是否有命中
  let invalidFlag = false;//无效命中
  if (allPermissionList != null && allPermissionList != "" && allPermissionList != undefined && allPermissionList.length > 0) {
    for (let itemG of allPermissionList) {
      if (binding.value === itemG.action) {
        if (itemG.status == '0') {
          invalidFlag = true;
          break;
        }
      }
    }
  }
  if (invalidFlag) {
    return;
  }
  if (permissionList === null || permissionList === "" || permissionList === undefined || permissionList.length <= 0) {
    el.parentNode.removeChild(el);
    return;
  }
  let permissions = [];
  for (let item of permissionList) {
    //权限策略1显示2禁用
    if (item.type != '2') {
      //update--begin--autor:wangshuai-----date:20200729------for：按钮权限，授权标识的提示信息是多个用逗号分隔逻辑处理 gitee#I1OUGU-------
      if (item.action) {
        if (item.action.includes(",")) {
          let split = item.action.split(",")
          for (let i = 0; i < split.length; i++) {
            if (!split[i] || split[i].length == 0) {
              continue;
            }
            permissions.push(split[i]);
          }
        } else {
          permissions.push(item.action);
        }
      }
      //update--end--autor:wangshuai-----date:20200729------for：按钮权限，授权标识的提示信息是多个用逗号分隔逻辑处理 gitee#I1OUGU------
    }
  }
  // console.log('这里做组件判断是否移除', permissions, binding)
  if (!permissions.includes(binding.value)) {
    // console.log('这里执行组件移除', el)
    el.parentNode.removeChild(el);
  }
}

export function rebuildRouter(routerList) {
  let routers = []
  let length = routerList.length
  for (let i = 0; i < length; i++) {
    let router = routerList[i]
    let component = RouteView
    switch (router.menuLayout) {
      case "BasicLayout":
        component = BasicLayout;
        break;
      case "RouteView":
        component = RouteView;
        break;
      case "PageView":
        component = PageView;
        break;
      case "BlankLayout":
        component = BlankLayout;
        break;
      case "IframePageView":
        component = IframePageView;
        break
      default:
        component = () => import(/* webpackChunkName:"tssk" */ '@/views' + router.menuLayout)
    }
    let newRouter = {
      component: component,
      name: router.menuCode,
      path: router.menuPath,
      hidden: router.isHidden == 1 ? true : false,
      meta: {
        keepAlive: router.keepAlive == 1 ? true : false,
        icon: router.menuIcon,
        componentName: router.menuCode,
        name: router.menuCode,
        title: router.menuName,
        isInternal: router.isInternal == 1 ? true : false,
        isHidden: router.isHidden == 1 ? true : false,
        componentPath: router.menuLayout,
      },
      // 下面的数据为菜单编辑适配使用
      id: router.id,
      pid: router.pid,
      rowSort: router.rowSort,
      icon: router.menuIcon,
      title: router.menuName,
      menuLayout: router.menuLayout,
      menuType: router.menuType,
      menuCode: router.menuCode,
      isHidden: router.isHidden == 1 ? true : false,
      isInternal: router.isInternal == 1 ? true : false,
      menuRedirect: router.menuRedirect
    }
    if (router.menuRedirect && router.menuLayout !== 'IframePageView') {
      newRouter.redirect = router.menuRedirect
    } else {
      newRouter.meta.url = router.menuRedirect
    }
    routers.push(newRouter)
  }
  let routes = []
  createTree(routers, routes, null, '0')
  return routes
}

export function createTree(dataList, routes, pnode, pid) {
  for (let i = 0; i < dataList.length; i++) {
    const temp = dataList[i]
    if (temp.pid === pid) {
      routes.push(temp)
    }
  }
  if (pnode) {
    if (routes.length === 0) {
      pnode.isLeaf = true
    } else {
      pnode.isLeaf = false
      pnode.children = routes
      for (let j = 0; j < routes.length; j++) {
        let tempNode = routes[j]
        let children = []
        createTree(dataList, children, tempNode, tempNode.id)
      }
    }
  } else {
    for (let j = 0; j < routes.length; j++) {
      let tempNode = routes[j]
      let children = []
      createTree(dataList, children, tempNode, tempNode.id)
    }
  }
}
// 雷宇航 2022-5-9 判断是否有该权限标识 true/false
export function isHiddenColumns(value) {
  let _permissionList = []
  let authList = JSON.parse(sessionStorage.getItem(USER_AUTH) || "[]");
  for (let auth of authList) {
    if (auth.type != 2) {
      _permissionList.push(auth);
    }
  }
  let result = _permissionList.filter(item => value === item.action)
  return result.length > 0
}

export default hasPermission;