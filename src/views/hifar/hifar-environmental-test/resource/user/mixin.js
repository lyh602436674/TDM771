/*
 * @Author: 赵峰
 * @Date: 2021-09-07 15:17:35
 * @LastEditTime: 2021-09-28 14:52:47
 * @LastEditors: 赵峰
 * @Descripttion: 用户正则检验方法
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\user\mixin.js
 */
export default {
    data() {
        return {}
    },
    methods: {
        // 校验方法
        validatejobNo(rule, value, callback) {
            if (!value) {
                callback('请输入工号')
            } else {
                if (new RegExp(/^[A-Za-z0-9_\( \)\-]+$/).test(value) && new RegExp(/^\S+$/).test(value)) {
                    callback()
                } else {
                    callback('请输入正确格式的工号!')
                }
            }
        },
        // 检验邮箱
        validateEmail(rule, value, callback) {
            if (!value) {
                callback()
            } else {
                if (
                    new RegExp(
                        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    ).test(value)
                ) {
                    callback()
                } else {
                    callback('请输入正确格式的邮箱!')
                }
            }
        },
        // 检验电话
        validateMobile(rule, value, callback) {
            if (!value) {
                callback('请输入联系电话')
            } else {
                if (new RegExp(/^1[3|4|5|7|8|9][0-9]\d{8}$/).test(value) || new RegExp(/^0\d{2,3}-[1-9]\d{6,7}$/).test(value)) {
                    callback()
                } else {
                    callback('请输入正确格式的手机号码或座机号码!')
                }
            }
        },
        // 检验姓名
        validateidName(rule, value, callback) {
            if (!value) {
                callback('请输入姓名')
            } else {
                if (new RegExp(/^\S+$/).test(value)) {
                    callback()
                } else {
                    callback('请输入正确格式的姓名!')
                }
            }
        },
    }
}