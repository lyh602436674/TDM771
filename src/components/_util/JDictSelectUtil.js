/**
 * 字典 util
 * author: scott
 * date: 20190109
 */

import {getDictItemsFromCache} from '@/api/api'

/**
 * 字典值替换文本通用方法
 * @param dictOptions  字典数组
 * @param text  字典值
 * @return String
 */
export function filterDictText(dictOptions, text) {
  // --update-begin----author:sunjianlei---date:20200323------for: 字典翻译 text 允许逗号分隔 ---
  if (text != null && Array.isArray(dictOptions)) {
    let result = []
    // 允许多个逗号分隔，允许传数组对象
    let splitText
    if (Array.isArray(text)) {
      splitText = text
    } else {
      splitText = text.toString().trim().split(',')
    }
    for (let txt of splitText) {
      let dictText = txt
      for (let dictItem of dictOptions) {
        if (txt.toString() === dictItem.value.toString()) {
          dictText = (dictItem.text || dictItem.title || dictItem.label)
          break
        }
      }
      result.push(dictText)
    }
    return result.join(',')
  }
  return text
  // --update-end----author:sunjianlei---date:20200323------for: 字典翻译 text 允许逗号分隔 ---
}

/**
 * 字典值替换文本通用方法(多选)
 * @param dictOptions  字典数组
 * @param text  字典值
 * @return String
 */
export function filterMultiDictText(dictOptions, text) {
  //js “!text” 认为0为空，所以做提前处理
  if(text === 0 || text === '0'){
    if(dictOptions){
      for (let dictItem of dictOptions) {
        if (text == dictItem.value) {
          return dictItem.text
        }
      }
    }
  }

  if(!text || text=='null' || !dictOptions || dictOptions.length==0){
    return ""
  }
  let re = "";
  text = text.toString()
  let arr = text.split(",")
  dictOptions.forEach(function (option) {
    if(option){
      for(let i=0;i<arr.length;i++){
        if (arr[i] === option.value) {
          re += option.text+",";
          break;
        }
      }
    }
  });
  if(re==""){
    return text;
  }
  return re.substring(0,re.length-1);
}

/**
 * 翻译字段值对应的文本
 * @param children
 * @returns string
 */
export function filterDictTextByCache(dictCode, key) {
  if(key==null ||key.length==0){
    return;
  }
  if (!dictCode) {
    return '字典Code不能为空!';
  }
   //优先从缓存中读取字典配置
  if(getDictItemsFromCache(dictCode)){
    let item = getDictItemsFromCache(dictCode).filter(t => t["itemKey"] == key)
    if(item && item.length>0){
      return item[0]["itemValue"]
    }
  }
}