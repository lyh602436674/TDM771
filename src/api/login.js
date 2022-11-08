/*
 * @Author: 陈乾龙
 * @Date: 2021-07-14 09:37:38
 * @LastEditTime: 2021-07-16 10:50:45
 * @LastEditors: 陈乾龙
 * @Description: 登录授权相关接口
 * @FilePath: \hifar-platform-client\src\api\login.js
 */
import api from './index'
import { axios } from '@/utils/request'

/**
 * login func
 * parameter: {
 *     username: '',
 *     password: '',
 *     remember_me: true,
 *     captcha: '12345'
 * }
 * @param parameter
 * @returns {*}
 */
export function login(parameter) {
  return axios({
    url: '/BaseUserBusiness/loginBase',
    method: 'POST',
    data: parameter
  })
}

export function login2(parameter) {
  return axios({
    url: '/BaseUserBusiness/ssoLoginBase',
    method: 'post',
    data: parameter
  })
}


export function phoneLogin(parameter) {
  return axios({
    url: '/sys/phoneLogin',
    method: 'post',
    data: parameter
  })
}

export function getSmsCaptcha(parameter) {
  return axios({
    url: api.SendSms,
    method: 'post',
    data: parameter
  })
}

// export function getInfo() {
//   return axios({
//     url: '/api/user/info',
//     method: 'get',
//     headers: {
//       'Content-Type': 'application/json;charset=UTF-8'
//     }
//   })
// }

export function logout(logoutToken) {
  return axios({
    url: '/BaseUserBusiness/logout',
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'token':  logoutToken
    }
  })
}

/**
 * 第三方登录
 * @param token
 * @param thirdType
 * @returns {*}
 */
export function thirdLogin(token,thirdType) {
  return axios({
    url: `/sys/thirdLogin/getLoginUser/${token}/${thirdType}`,
    method: 'get',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}