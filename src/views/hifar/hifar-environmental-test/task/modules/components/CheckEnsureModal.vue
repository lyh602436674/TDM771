<!--
 * @Author: 陈乾龙
 * @Date: 2021-10-28 17:36:50
 * @LastEditTime: 2021-10-29 09:50:50
 * @LastEditors: 陈乾龙
 * @Description: 检查人或复核人确认弹窗
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\components\CheckEnsureModal.vue
-->
<template>
  <h-modal
    :width="500"
    inner
    :getContainer="getContainer"
    :visible="visible"
    :footer="false"
    destroyOnClose
    @cancel="handleCancel"
  >
    <div class="check-ensure">
      <div class="check-ensure-right">
        <a-form :form="form">
          <a-form-item>
            <a-input
              v-decorator="['userCode', { rules: [{ required: true, message: '请输入用户名' }] }]"
              placeholder="请输入用户名"
              @keyup="submitKeyup"
            >
              <a-icon slot="prefix" type="user" />
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-input-password
              v-decorator="['password', { rules: [{ required: true, message: '请输入密码' }] }]"
              placeholder="请输入密码"
              @keyup="submitKeyup"
            >
              <a-icon slot="prefix" type="security-scan" />
            </a-input-password>
          </a-form-item>
        </a-form>
        <a-button block type="primary" @click="submit">确认</a-button>
      </div>
      <div class="divider-line"></div>
      <div class="check-ensure-left"></div>
    </div>
  </h-modal>
</template>

<script>
import {isFunction} from 'lodash'

export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  data() {
    return {
      visible: false,
      model: {},
      form: null,
      localCallback: () => {},
    }
  },
  methods: {
    show(record = {}, cb) {
      if (isFunction(cb)) {
        this.localCallback = cb
      }
      this.model = Object.assign({}, record)
      this.form = this.$form.createForm(this, {
        mapPropsToFields: () => {
          return {
            userCode: this.$form.createFormField({
              value: undefined,
            }),
            password: this.$form.createFormField({
              value: undefined,
            }),
          }
        },
      })
      this.visible = true
    },
    submitKeyup(e) {
      if (e.keyCode === 13) {
        this.submit()
      }
    },
    submit() {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.localCallback(Object.assign({}, this.model, values))
        }
      })
    },
    handleCancel() {
      this.model = {}
      this.form = null
      this.visible = false
    },
  },
}
</script>

<style lang="less" scoped>
.check-ensure {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  &-right {
    width: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  &-left {
    flex: 1;
    align-self: stretch;
    background: rgba(@primary-color, 0.2) url('../../../../../../assets/card.png') no-repeat;
    background-size: 100% 100%;
  }
  .divider-line {
    width: 1px;
    align-self: stretch;
    background: @border-color-base;
    margin: 0 10px 0 15px;
  }
}
</style>