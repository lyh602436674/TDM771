import Vue from 'vue'
import {axios} from '@/utils/request'
import {debounceAsync} from '@/utils/util'
import {isObject} from 'lodash'

const api = {
  user: '/mock/api/user',
  role: '/mock/api/role',
  service: '/mock/api/service',
  permission: '/mock/api/permission',
  permissionNoPager: '/mock/api/permission/no-pager'
}

export default api

//防抖异步函数 暂时有问题
export function postActionDebounce(url, parameter, delay) {
  return debounceAsync(
    axios({
      url: url,
      method: 'POST',
      data: parameter
    }),
    delay
  )
}

//post
export function postAction(url, parameter) {
  return axios({
    url: url,
    method: 'POST',
    data: parameter
  })
}

//post method= {post | put}
export function httpAction(url, parameter, method) {
  return axios({
    url: url,
    method: method,
    data: parameter
  })
}

//put
export function putAction(url, parameter) {
  return axios({
    url: url,
    method: 'put',
    data: parameter
  })
}

//get
export function getAction(url, parameter) {
  return axios({
    url: url,
    method: 'get',
    params: parameter
  })
}

//deleteAction
export function deleteAction(url, parameter) {
  return axios({
    url: url,
    method: 'POST',
    params: parameter
  })
}

export function getUserList(parameter) {
  return axios({
    url: api.user,
    method: 'get',
    params: parameter
  })
}

export function getRoleList(parameter) {
  return axios({
    url: api.role,
    method: 'get',
    params: parameter
  })
}

export function getServiceList(parameter) {
  return axios({
    url: api.service,
    method: 'get',
    params: parameter
  })
}

export function getPermissions(parameter) {
  return axios({
    url: api.permissionNoPager,
    method: 'get',
    params: parameter
  })
}

// id == 0 add     post
// id != 0 update  put
export function saveService(parameter) {
  return axios({
    url: api.service,
    method: parameter.id == 0 ? 'post' : 'put',
    data: parameter
  })
}

/**
 * 下载文件 用于excel导出
 * @param url
 * @param parameter
 * @returns {*}
 */
export function downFile(url, parameter) {
  return axios({
    url: url,
    params: parameter,
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 下载文件
 * @param url 文件路径
 * @param fileName 文件名
 * @param parameter
 * @returns {*}
 */
export function downloadFile(url, fileName, parameter) {
  return downFile(url, parameter).then((data) => {
    if (!data || data.size === 0) {
      Vue.prototype['$message'].warning('文件下载失败')
      return false
    }
    if (typeof window.navigator.msSaveBlob !== 'undefined') {
      window.navigator.msSaveBlob(new Blob([data]), fileName)
    } else {
      let url = window.URL.createObjectURL(new Blob([data]))
      createLink(url, fileName)
    }
    return true
  })
}

export function createLink(url, fileName, bool) {
  let link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  link.setAttribute('download', fileName)
  bool && link.setAttribute('target', '_blank')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link) //下载完成移除元素
  window.URL.revokeObjectURL(url) //释放掉blob对象
}

/**
 * 文件上传 用于富文本上传图片
 * @param url
 * @param parameter
 * @returns {*}
 */
export function uploadAction(url, parameter) {
  return axios({
    url: url,
    data: parameter,
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data', // 文件上传
    },
  })
}

/**
 * 获取文件服务访问路径
 * @param avatar
 * @param subStr
 * @returns {*}
 */
export function getFileAccessHttpUrl(avatar, subStr) {
  if (!subStr) subStr = 'http'
  try {
    if (avatar && avatar.startsWith(subStr)) {
      return avatar;
    } else {
      if (avatar && avatar.length > 0 && avatar.indexOf('[') == -1) {
        return window._CONFIG['staticDomainURL'] + "/" + avatar;
      }
    }
  } catch (err) {
    return;
  }
}

/**
 * @description word在线编辑
 * @params fileUrl 文件路径 必须是处理好的文件路径 http://x.x.x.x:xxxx/xxx/xxx/xxx.docx
 * */
export function officeOnlineEdit(fileUrl, extendParams) {
  let obj = {
    AccessKey: 'minioadmin',
    SecretKey: 'minioadmin',
    ServerOfficeFileUrl: decodeURIComponent(fileUrl.replace(/\+/g, '%20')),
    IsSaveAsPDF: true, // 是否可同步保存pdf
    IsSaveEnabled: true,// 保存按钮是否可点击
  }
  if (isObject(extendParams)) {
    obj = Object.assign({}, obj, extendParams)
  }
  let url = 'HifarWebOffice://' + JSON.stringify(obj)
  window.open(url, '_blank')
}