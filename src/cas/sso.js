/*
 * @Author: 陈乾龙
 * @Date: 2021-06-24 10:47:53
 * @LastEditTime: 2021-06-29 10:41:55
 * @LastEditors: 陈乾龙
 * @Description: 单点登录判断
 * @FilePath: \hifar-platform-vue\src\cas\sso.js
 */
import Vue from 'vue'
import { ACCESS_TOKEN } from "@/store/mutation-types"
import store from '@/store'
import moment from 'moment'
const IsPro = ['production', 'product', 'pro'].includes(process.env.NODE_ENV)
if (!IsPro) {
  console.log = (function (oriLogFunc) {
    return function () {
      let time = `%c[${moment().format("YYYY-MM-DD HH:mm:ss.SSS")}]`
      try {
        if (arguments && arguments.length > 1) {
          let first = arguments[0];
          let arr = Array.prototype.slice.call(arguments);
          let more = arr.slice(1);
          oriLogFunc(time, "color:lightseagreen;", first, ...more)
        } else if (arguments && arguments.length == 1) {
          oriLogFunc(time, "color:lightseagreen;", arguments[0])
        }
      } catch (e) {
        console.error('console.log error', e);
      }
    }
  })(console.log);
}

/**
 * 单点登录
 */
const init = (callback) => {
  if (process.env.VUE_APP_SSO == 'true') {
    console.log("-------单点登录开始-------");
    let token = Vue.ls.get(ACCESS_TOKEN);
    let st = getUrlParam("ticket");
    let sevice = "http://" + window.location.host + "/";
    if (token) {
      loginSuccess(callback);
    } else {
      if (st) {
        validateSt(st, sevice, callback);
      } else {
        let serviceUrl = encodeURIComponent(sevice);
        window.location.href = window._CONFIG['casPrefixUrl'] + "/login?service=" + serviceUrl;
      }
    }
    console.log("-------单点登录结束-------");
  } else {
    callback && callback()
  }
};
const SSO = {
  init: init
};

function getUrlParam(paraName) {
  let url = document.location.toString();
  let arrObj = url.split("?");

  if (arrObj.length > 1) {
    let arrPara = arrObj[1].split("&");
    let arr;

    for (let i = 0; i < arrPara.length; i++) {
      arr = arrPara[i].split("=");

      if (arr != null && arr[0] == paraName) {
        return arr[1];
      }
    }
    return "";
  }
  else {
    return "";
  }
}

function validateSt(ticket, service, callback) {
  let params = {
    ticket: ticket,
    service: service
  };
  store.dispatch('ValidateLogin', params).then(res => {
    //this.departConfirm(res)
    if (res.success) {
      loginSuccess(callback);
    } else {
      let sevice = "http://" + window.location.host + "/";
      let serviceUrl = encodeURIComponent(sevice);
      window.location.href = window._CONFIG['casPrefixUrl'] + "/login?service=" + serviceUrl;
    }
  }).catch((err) => {
    console.log(err);
    //that.requestFailed(err);
  });
}

function loginSuccess(callback) {
  callback();
}
export default SSO;