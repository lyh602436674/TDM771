/*
 * @Author: 陈乾龙
 * @Date: 2021-06-24 10:35:38
 * @LastEditTime: 2021-10-22 16:16:15
 * @LastEditors: 陈乾龙
 * @Description: 定义babel配置
 * @FilePath: \hifar-platform-client\babel.config.js
 */
var plugins = []

if (process.env.NODE_ENV !== 'production') {
  // plugins.push(new consolePlugin())
}


module.exports = {
  presets: [
    ['@vue/app',
      { useBuiltIns: 'entry' }]
  ],
  plugins
}
