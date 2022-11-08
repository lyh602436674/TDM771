/*
 * @Author: 陈乾龙
 * @Date: 2021-05-20 11:27:54
 * @LastEditTime: 2021-09-16 17:31:46
 * @LastEditors: 陈乾龙
 * @Description: 全局filter
 * @FilePath: \hifar-platform-client\src\utils\filter.js
 */
import Vue from "vue";
import * as dayjs from "dayjs";

Vue.filter('NumberFormat', function (value) {
  if (!value) {
    return '0'
  }
  let intPartFormat = value.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') //将整数部分逢三一断
  return intPartFormat
})

Vue.filter('dayjs', function(dataStr, pattern = 'YYYY-MM-DD HH:mm:ss') {
  return dayjs(dataStr).format(pattern)
})

Vue.filter('moment', function(dataStr, pattern = 'YYYY-MM-DD HH:mm:ss') {
  return dayjs(dataStr).format(pattern)
})

/** 字符串超长截取省略号显示 */
Vue.filter('ellipsis', function (value, vlength = 25) {
  if(!value){
    return "";
  }
  if (value.length > vlength) {
    return value.slice(0, vlength) + '...'
  }
  return value
})

/**
 * @description: 过滤文件类型，返回对应文件Icon的type类型名
 * @param {*} fileTypeFilter
 * @param {*} function
 * @return {*} IconType
 */
Vue.filter('fileTypeFilter',function(type){
  if(!type){
    return 'icon-wenjian'
  }
  type = type.toLowerCase()
  if (['zip', '7z', 'rar'].includes(type)) {
    return 'icon-yasuobao'
  } else if (['images/jpg', 'images/png', 'images/gif', 'images/svg', 'images/jpeg', 'images/webp'].includes(type)) {
    return 'icon-tupian'
  } else if (
    [
      'cd',
      'wave',
      'aiff',
      'mpeg',
      'mpeg-4',
      'mp3',
      'midi',
      'wma',
      'realaudio',
      'rm',
      'rmx',
      'vqf',
      'amr',
      'ape',
      'flac',
      'aac',
    ].includes(type)
  ) {
    return 'icon-wenjianleixing-yinpin'
  }else if(['mpeg','avi','mov','mp4','asf','wmv','navi','3gp','ra','ram','mkv','flv'].includes(type)){
    return 'icon-shipin'
  }else{
    return 'icon-wenjian'
  }
})

// 文件大小显示转换
Vue.filter('sizeFormat',function($size=0){
  var size  = parseFloat($size);
  var rank =0;
  var rankchar ='Bytes';
  while(size>1024){
    size = size/1024;
    rank++;
  }
  if(rank==1){
    rankchar="KB";
  }
  else if(rank==2){
    rankchar="MB";
  }
  else if(rank==3){
    rankchar="GB";
  }   
  return size.toFixed(2)+ " "+ rankchar;
})