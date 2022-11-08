/*
 * @Author: 陈乾龙
 * @Date: 2021-07-14 09:37:38
 * @LastEditTime: 2021-07-26 09:58:08
 * @LastEditors: 陈乾龙
 * @Description: 登录相关接口
 * @FilePath: \hifar-platform-client\src\api\index.js
 */
const api = {
    Login: '/sys/login',
    Logout: '/BaseUserBusiness/logout',
    ForgePassword: '/auth/forge-password',
    Register: '/auth/register',
    SendSms: '/account/sms',
    // get my info
    UserInfo: '/user/info'
}
export default api