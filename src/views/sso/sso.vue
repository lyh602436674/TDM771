<template>
  <div class="main_login">
    <div id="particles-js"></div>
    <div class="login_left">
      <!-- <div id="particles-js"></div> -->
      <div class="top">
        <img src="~@/assets/login_image/login_bg_1.png" style="margin-right: -33px" alt=""/>
        <img src="~@/assets/login_image/login_dot_2.png" alt=""/>
        <!--        <img :src="loginLogo" style="margin-left: 33px;width: 51px;height: 51px" alt=""/>-->
      </div>
      <div class="center">
        <div>
          <p class="title">{{ loginPrimarySlogan }}</p>
          <p class="describe">{{ loginSecondarySlogan }}</p>
        </div>
        <img src="~@/assets/login_image/login_bg_0.png" alt=""/>
      </div>
      <div class="copyright">
        Copyright &copy; {{ loginCopyRightTime }}
        <a :href="logoinCompanyLink" target="_blank">{{ loginCompanyCH }}</a> 版权所有
      </div>
    </div>
    <div class="login_right">
      <p>{{ loginCompanyEN }}</p>
      <img class="bg" src="~@/assets/login_image/login_bg_2.png" alt=""/>
      <img class="dot" src="~@/assets/login_image/login_dot_1.png" alt=""/>
    </div>
    <login-select-tenant ref="loginSelect" @success="loginSelectOk"></login-select-tenant>
  </div>
</template>

<script>
import {getAction} from '@/api/manage'
import 'particles.js'
import {mapActions, mapState} from "vuex";
import LoginSelectTenant from '../user/LoginSelectTenant'

const particlesJSON = require('../user/particles.json')
export default {
  name: "sso",
  components: {
    LoginSelectTenant
  },
  data() {
    return {
      url: {
        list: "/act/task/list",
        claim: "/act/task/claim",
        taskEntrust: "/act/task/taskEntrust",
      },
      path: "",
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
      },
    }),
  },
  mounted() {
    particlesJS('particles-js', particlesJSON)
    this.loginMethod()
  },
  methods: {
    ...mapActions(['Login2', 'Logout']),
    loginMethod() {
      let loginParams = {
        idCard:this.getParams('a')
      }

      this.Login2(loginParams).then(res=>{
        this.loginSuccess()
      }).catch(err=>{
        this.requestFailed(err)
      })
    },
    //执行登录，但是不跳转到首页
    disLoginMethod() {
      return new Promise((resolve, reject) => {
        let loginParams = {
          idCard: this.getParams('a')
          // username: this.getParams('a'),
          // password: this.getParams('b'),
          // checkKey: this.getParams('d'),//此字段用来验证登录次数，一个d参数只能登陆一次
          // enableCaptcha: true    // 此字段用来判断是否校验Key
        }
        // 页面被刷新
        if (window.performance.navigation.type === 1) {
          loginParams.enableCaptcha = false;
        }
        this.Login2(loginParams).then((res) => {
          resolve()
        }).catch((err) => {
          reject()
          this.requestFailed(err)
          //当出现登录失败。3s后跳转至登录页
          setTimeout(() => {
            this.Logout().then(() => {
              window.location.href = '/'
            })
          }, 3000)
        })
      })
    },
    requestFailed(err) {
      this.$notification['error']({
        message: '登录失败',
        description: ((err.response || {}).data || {}).message || err.message || '请求出现错误，请稍后再试',
        duration: 4,
      })
    },
    loginSelectOk() {
      this.loginSuccess()
    },
    //登录成功路由跳转
    loginSuccess() {
      this.$router.push({ path: '/' }).catch(() => {
        console.log('登录跳转首页出错,这个错误从哪里来的')
      })

      //5秒后执行用户密码到期提醒功能
      // setTimeout(this.resetPasswordTooltip, 5000)
    },
    //开启密码策略后,若密码快到期时提醒用户
    resetPasswordTooltip() {
      getAction('/sys/getPwdToolTip').then((res) => {
        if (res.success) {
          let rs = res.result
          if (rs.code === '1') {
            this.$notification.success({
              message: '系统提示',
              description: `${rs.msg}`,
            })
          }
        }
      })
    },
    getParams(paraName) {
      let url = document.location.toString();
      let arrObj = url.split("?");
      if (arrObj.length > 1) {
        let arrPara = arrObj[1].split("&");
        let arr;
        for (let i = 0; i < arrPara.length; i++) {
          arr = arrPara[i].split("=");
          if (arr != null && arr[0] == paraName) {
            return arr[1];
          }
        }
        return "";
      } else {
        return "";
      }
    }
  }
}
</script>
<style>
@import '../user/index.less';
</style>
<style lang="less" scoped>
#particles-js {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.user-layout-login {
  width: 300px;

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
  margin: 30px 0;
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
  padding: 40px;
  box-shadow: 0 0 13px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
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