/*
 * @Author: 雷宇航
 * @Date: 2022-04-01 14:07:46
 * @LastEditTime: 2022-04-01 14:07:47
 * @LastEditors: 雷宇航
 * @Description: 
 * @FilePath: \tdm200-client\tdm200-client\src\views\hifar\hifar-environmental-test\largeScreen\chartsFontSizeToRem.js
 */
export function fontSize(res) {
  let docEl = document.documentElement,
    clientWidth =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  if (!clientWidth) return;
  // 此处的3840 为设计稿的宽度
  let fontSize = clientWidth / 3840;
  return res * fontSize;
}