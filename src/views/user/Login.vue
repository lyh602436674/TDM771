<template>
  <div class="main_login">
    <div id="particles-js"></div>
    <div class="login_left">
      <!-- <div id="particles-js"></div> -->
      <div class="top">
        <img src="~@/assets/login_image/login_bg_1.png" style="margin-right: -33px" alt="" />
        <img src="~@/assets/login_image/login_dot_2.png" alt="" />
        <img :src="loginLogo" style="margin-left: 33px" alt="" />
      </div>
      <div class="center">
        <div>
          <p class="title">{{ loginPrimarySlogan }}</p>
          <p class="describe">{{ loginSecondarySlogan }}</p>
        </div>
        <img src="~@/assets/login_image/login_bg_0.png" alt="" />
      </div>
      <div class="copyright">
        Copyright &copy; {{ loginCopyRightTime }}
        <a :href="logoinCompanyLink" target="_blank">{{ loginCompanyCH }}</a> 版权所有
      </div>
    </div>
    <div class="login_right">
      <p>{{ loginCompanyEN }}</p>
      <img class="bg" src="~@/assets/login_image/login_bg_2.png" alt="" />
      <img class="dot" src="~@/assets/login_image/login_dot_1.png" alt="" />
      <div ref="loginForm" class="login_form">
        <div class="loginTab">
          <div
            v-for="(item,index) in tabsData"
            :key="index"
            :class="['tab-item',activeKey === index ? 'active':'']"
            :style="{width: (100 / tabsData.length) + '%'}"
            @click="loginTabChange(item,index)">
            <h-icon :type="item.icon" style="font-size:20px" />
            {{ item.title }}
          </div>
        </div>
        <div class="login_form_content">
          <div v-if="activeKey === 0" class="idLogin">
            <div class="form_title">
              <span>{{ loginWelcome }}</span>
            </div>
            <a-form id="formLogin" ref="formLogin" :form="form" class="user-layout-login">
              <a-form-item>
                <a-input
                  v-decorator="['username', validatorRules.username, { validator: this.handleUsernameOrEmail }]"
                  placeholder="请输入帐户名"
                  size="large"
                  type="text"
                >
                  <a-icon slot="prefix" :style="{ color: 'rgba(0,0,0,.25)' }" type="user"/>
                </a-input>
              </a-form-item>
              <a-form-item>
                <a-input
                  v-decorator="['password', validatorRules.password]"
                  autocomplete="false"
                  placeholder="请输入密码"
                  size="large"
                  type="password"
                >
                  <a-icon slot="prefix" :style="{ color: 'rgba(0,0,0,.25)' }" type="lock"/>
                </a-input>
              </a-form-item>

              <a-form-item style="margin-top: 24px">
                <a-button
                  :disabled="loginBtn"
                  :loading="loginBtn"
                  class="login-button"
                  htmlType="submit"
                  size="large"
                  type="primary"
                  @click.stop.prevent="handleSubmit"
                >
                  确定
                </a-button>
              </a-form-item>
            </a-form>
          </div>
          <div v-if="activeKey === 1" class="fingerprint">
            <img src="~@/assets/zhiwen.jpg">
            <input ref="fingerInput" v-model="fingerprintValue" type="hidden" @change="handleCapture">
          </div>
        </div>
        <login-select-tenant ref="loginSelect" @success="loginSelectOk"></login-select-tenant>
      </div>
    </div>
  </div>
</template>

<script>
import { getAction } from '@api/manage'
import { mapActions, mapState } from 'vuex'
import Vue from 'vue'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import ThirdLogin from './third/ThirdLogin'
import LoginSelectTenant from './LoginSelectTenant'
import { FingerpinttMixin } from '@/mixins/FingerprintMixin'
import 'particles.js'

let password = null
let account = null
if (process.env.NODE_ENV != 'production') {
  password = '123456'
  account = 'admin'
}

const particlesJSON = require('./particles.json')
export default {
  components: {
    LoginSelectTenant,
    ThirdLogin
  },
  mixins: [FingerpinttMixin],
  data() {
    return {
      tabsData: [
        { title: '账号密码登录', icon: 'icon-zhanghaoquanxianguanli' },
        { title: '指纹登录', icon: 'icon-zhiwen', type: 'fingerprint' }
      ],
      fingerprintValue: '',
      activeKey: 0,
      loginBtn: false,
      // login type: 0 email, 1 username, 2 telephone
      loginType: 0,
      stepCaptchaVisible: false,
      form: this.$form.createForm(this),
      encryptedString: {
        key: '',
        iv: ''
      },
      state: {
        time: 60,
        smsSendBtn: false
      },
      validatorRules: {
        username: {
          rules: [{ required: true, message: '请输入用户名!' }, { validator: this.handleUsernameOrEmail }],
          initialValue: account
        },
        password: { rules: [{ required: true, message: '请输入密码!', validator: 'click' }], initialValue: password },
        mobile: { rules: [{ validator: this.validateMobile }] },
        captcha: { rule: [{ required: true, message: '请输入验证码!' }] },
        inputCode: { rules: [{ required: true, message: '请输入验证码!' }] }
      },
      verifiedCode: '',
      inputCodeContent: '',
      inputCodeNull: true,
      currentUsername: '',
      currdatetime: '',
      randCodeImage: '',
      requestCodeSuccess: false,
      resetPwdTimer: ''
    }
  },
  computed: {
    ...mapState({
      loginLogo: (state) => {
        return state.app.loginLogo
      },
      loginPrimarySlogan: (state) => {
        return state.app.loginPrimarySlogan
      },
      loginSecondarySlogan: (state) => {
        return state.app.loginSecondarySlogan
      },
      loginWelcome: (state) => {
        return state.app.loginWelcome
      },
      loginCompanyCH: (state) => {
        return state.app.loginCompanyCH
      },
      loginCompanyEN: (state) => {
        return state.app.loginCompanyEN
      },
      loginCopyRightTime: (state) => {
        return state.app.loginCopyRightTime
      },
      logoinCompanyLink: (state) => {
        return state.app.logoinCompanyLink
      }
    })
  },
  created() {
    this.currdatetime = new Date().getTime()
    Vue.ls.remove(ACCESS_TOKEN)
    this.getRouterData()
  },
  mounted() {
    particlesJS('particles-js', particlesJSON)
  },
  methods: {
    ...mapActions(['Login', 'Logout', 'PhoneLogin', 'fingerprintLogin']),
    // handler
    handleUsernameOrEmail(rule, value, callback) {
      const regex = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/
      if (regex.test(value)) {
        this.loginType = 0
      } else {
        this.loginType = 1
      }
      callback()
    },
    handleCapture(e) {
      console.log('指纹采集')
      this.init()
      this.timer = setInterval(() => {
        this.getTemplate()
      }, 10)
    },
    loginTabChange(item, index) {
      this.activeKey = index
      if (item.type === 'fingerprint') {
        // 开始采集
        this.$nextTick(() => {
          this.handleCapture()
        })
      } else {
        this.timer = null
      }
    },
    handleSubmit() {
      let loginParams = {}
      this.loginBtn = true
      this.form.validateFields(['username', 'password'], { force: true }, async (err, values) => {
        if (!err) {
          loginParams.userCode = values.username
          loginParams.pwd = values.password
          let response = await this.Login(loginParams).finally(() => {
            this.loginBtn = false
          })
          if (response.code === 200) {
            this.$refs.loginSelect.show(response.data)
          } else {
            this.requestFailed(response)
          }
        } else {
          this.loginBtn = false
        }
      })
    },
    stepCaptchaSuccess() {
      this.loginSuccess()
    },
    stepCaptchaCancel() {
      this.Logout().then(() => {
        this.loginBtn = false
        this.stepCaptchaVisible = false
      })
    },
    // 登录成功路由跳转
    loginSuccess() {
      this.$router.push({ path: '/' }).catch(() => {
        console.log('登录跳转首页出错,这个错误从哪里来的')
      })
      // this.$notification.success({
      //   message: '欢迎',
      //   description: `${timeFix()}，欢迎回来`,
      // })

      // 5秒后执行用户密码到期提醒功能
      setTimeout(this.resetPasswordTooltip, 5000)
    },
    // 开启密码策略后,若密码快到期时提醒用户
    resetPasswordTooltip() {
      // getAction('/sys/getPwdToolTip').then((res) => {
      //   if (res.success) {
      //     let rs = res.result
      //     if (rs.code === '1') {
      //       this.$notification.success({
      //         message: '系统提示',
      //         description: `${rs.msg}`,
      //       })
      //     }
      //   }
      // })
    },
    cmsFailed(err) {
      this.$notification['error']({
        message: '登录失败',
        description: err,
        duration: 4
      })
    },
    requestFailed(err) {
      this.$notification['error']({
        message: '登录失败',
        description: ((err.response || {}).data || {}).message || err.message || '请求出现错误，请稍后再试',
        duration: 4
      })
      this.loginBtn = false
    },
    validateMobile(rule, value, callback) {
      if (!value || new RegExp(/^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/).test(value)) {
        callback()
      } else {
        callback('您的手机号码格式不正确!')
      }
    },
    loginSelectOk() {
      this.loginSuccess()
    },
    getRouterData() {
      this.$nextTick(() => {
        if (this.$route.params.username) {
          this.form.setFieldsValue({
            username: this.$route.params.username
          })
        }
      })
    },
    async fingerprint(val) {
      let response = await this.fingerprintLogin(val).finally(() => {
        this.loginBtn = false
      })
      if (response.code === 200) {
        this.timer = null
        this.$refs.loginSelect.show(response.data)
      } else {
        this.requestFailed(response)
      }
    }
  },
  watch: {
    data(val) {
      if (val != null) {
        this.fingerprint(val)
      }
    }
  }
}
</script>

<style>
@import './index.less';
</style>
<style lang="less" scoped>
#particles-js {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

@layoutLoginWidth: 300px;

.user-layout-login {
  width: @layoutLoginWidth;

  label {
    font-size: 14px;
  }

  .getCaptcha {
    display: block;
    width: 100%;
    height: 40px;
  }

  .forge-password {
    font-size: 14px;
  }

  button.login-button {
    padding: 0 15px;
    font-size: 16px;
    height: 40px;
    width: 100%;
  }

  .user-login-other {
    text-align: left;
    margin-top: 24px;
    line-height: 22px;

    .item-icon {
      font-size: 24px;
      color: rgba(0, 0, 0, 0.2);
      margin-left: 16px;
      vertical-align: middle;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #1890ff;
      }
    }

    .register {
      float: right;
    }
  }
}
.form_title {
  margin: 0 0 30px 0;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 25px;
    height: 26px;
  }

  span {
    font-size: 22px;
    font-family: Microsoft YaHei;
    font-weight: bold;
    line-height: 29px;
    color: rgba(17, 17, 17, 1);
    margin-left: 10px;
  }
}
.login_right {
  width: 520px;
  height: auto;
  position: relative;
  .bg {
    width: 100%;
    height: 100%;
  }
  .dot {
    position: absolute;
    transform: translate(-50%, -50%);
    left: 0;
    bottom: 0;
  }
  p {
    font-size: 16px;
    position: absolute;
    color: #fff;
    right: 60px;
    top: 60px;
  }
}

.login_form {
  background-color: #fff;
  position: absolute;
  transform: translate(-50%, -50%);
  left: 0;
  top: 50%;
  box-shadow: 0 0 13px rgba(0, 0, 0, 0.1);
  border-radius: 5px;

  @tabHeight: 60px;

  .fingerprint {
    width: @layoutLoginWidth;

    img {
      margin-left: 50%;
      transform: translateX(-50%);
    }
  }

  .login_form_content {
    min-height: 340px;
    padding: 40px;
  }

  .loginTab {
    display: flex;
    height: @tabHeight;
    font-size: 18px;
    cursor: pointer;

    .tab-item {
      text-align: center;
      line-height: @tabHeight;
      border-bottom: 1px solid #d9d9d9;
      border-right: 1px solid #d9d9d9;

      &:first-child {
        border-radius: 5px 0 0 0;
      }

      &:last-child {
        border-right: none;
        border-radius: 0 5px 0 0;
      }
    }

    .active {
      border-bottom: none;
      color: #fff;
      background-color: #0E6EE5;
    }

  }
}
.login_left {
  flex-grow: 1;
  padding-left: 40px;
  position: relative;
  p {
    margin: 0;
  }
  .top {
    span {
      margin-left: 15px;
      font-size: 26px;
      font-weight: bold;
      vertical-align: middle;
    }
  }
  .center {
    position: absolute;
    top: 15%;
    left: 190px;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    img {
      margin: 70px 0 0;
    }
    .title {
      font-size: 46px;
      font-weight: bold;
      line-height: 61px;
      margin-top: 40px;
    }
    .describe {
      font-size: 26px;
      font-weight: 400;
      color: #333;
      margin-top: 10px;
    }
  }
  .copyright {
    position: absolute;
    bottom: 15px;
    left: 190px;
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
  }
}
</style>
<style>
.valid-error .ant-select-selection__placeholder {
  color: #f5222d;
}

@media screen and (max-width: 1024px) {
  .login_left {
    display: none;
  }

  .login-right {
    width: 100% !important;
  }

  .main,
  .main_login,
  .login_right {
    max-width: 100% !important;
    width: 100% !important;
  }
  .login_form {
    left: 50% !important;
  }
}
</style>
