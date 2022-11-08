/*
 * @Author: 陈乾龙
 * @Date: 2021-05-27 18:01:26
 * @LastEditTime: 2021-07-21 11:54:14
 * @LastEditors: 陈乾龙
 * @Description: 自定义Iconfont组件
 * @FilePath: \hifar-platform-client\src\components\HIcon\icon.js
 */
import { Icon } from 'ant-design-vue';
import iconfontJS from "@/assets/iconfont/iconfont.js"

const IconFont = Icon.createFromIconfontCN({
    scriptUrl: iconfontJS,
    extraCommonProps: {}
});

export default IconFont