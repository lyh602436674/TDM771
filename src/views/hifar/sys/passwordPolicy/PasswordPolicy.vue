<!--
 * @Author: 陈乾龙
 * @Date: 2021-05-31 10:02:01
 * @LastEditTime: 2021-08-31 16:59:13
 * @LastEditors: 陈乾龙
 * @Description:  密码策略页面，用来设置不同用户密级下的密码策略
 * @FilePath: \hifar-platform-client\src\views\hifar\sys\passwordPolicy\PasswordPolicy.vue
-->
<template>
  <a-card :bordered="false" class="password-policy">
    <a-card type="inner" style="width: 50%">
      <a-form :form="form">
        <h-descriptions title="用户密级">
          <a-descriptions-item>
            <a-form-item v-bind="formLabel" label="用户密级">
              <h-dict-select
                v-decorator="['secretLevel', { rules: [{ required: true, message: '请选择用户密级' }] }]"
                placeholder="请选择用户密级"
                dictCode="hf_sys_secret"
                @change="getPwdPolicyList"
              ></h-dict-select>
            </a-form-item>
          </a-descriptions-item>
        </h-descriptions>
        <h-descriptions title="密码策略">
          <a-descriptions-item>
            <a-empty v-if="!pwdPolicyList.length" description="请选择用户密级"></a-empty>
            <template v-else>
              <a-form-item
                v-for="(item, index) in pwdPolicyList"
                :key="item.id"
                :labelCol="{ span: 0 }"
                style="margin-bottom: 0; height: 30px"
              >
                <render-dom v-decorator="[`rule${index}`, { initialValue: item }]"></render-dom>
              </a-form-item>
            </template>
          </a-descriptions-item>
        </h-descriptions>
      </a-form>
      <a-button :loading="loading" slot="actions" v-if="pwdPolicyList.length" type="success" @click="handleSubmit">
        <h-icon style="font-size: 18px" type="icon-guidang"></h-icon>
        保存
      </a-button>
    </a-card>
  </a-card>
</template>

<script>
import { getAction, postAction } from '@/api/manage'
import RenderDom from './modules/RenderDom.jsx'
export default {
  components: { RenderDom },
  // 定义属性
  data() {
    return {
      loading: false,
      columns: [
        {
          title: '测试',
          key: 'title',
        },
      ],
      dataSource: [
        {
          title: 'hello1',
          type: 'radio',
        },
        {
          title: 'hello2',
        },
      ],
      form: this.$form.createForm(this),
      formLabel: {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 4 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 20 },
        },
      },
      secretList: [],
      pwdPolicyList: [],
      url: {
        pwdPolicyList: '/SysPwdPolicyBusiness/listAllBySecretLevel',
        save: '/SysPwdPolicyBusiness/modifyPolicyValueByIds',
      },
    }
  },
  // 方法集合
  methods: {
    async getPwdPolicyList(value) {
      console.log(value)
      let params = {
        secretLevel: value,
        pageSize: 20,
        pageNo: 1,
      }
      let response = await getAction(this.url.pwdPolicyList, params)
      if (response.code == 200) {
        console.log(response)
        this.pwdPolicyList = response.data
      }
    },
    handleSubmit() {
      this.form.validateFieldsAndScroll(async (err, values) => {
        if (err) {
          this.$message.error(err)
          return
        }
        if (this.loading) return
        this.loading = true
        let params = []
        Object.keys(values).map((key) => {
          if (key.indexOf('rule') != -1) {
            params.push(
              Object.assign(
                {
                  id: values[key].id,
                  // policyName: values[key].policyName,
                  policyValue: values[key].policyValue,
                  status: values[key].status,

                },
                // { secretLevel: values.secretLevel }
              )
            )
          }
        })
        console.log('values:', values)
        console.log('params', params)
        let response = await postAction(this.url.save, { policyConfig: params })
        if ((response.success = true)) {
          this.$message.success('保存成功')
        }
        this.loading = false
      })
    },
  },
}
</script>

<style lang='less' scoped>
.password-policy {
  width: 100%;
  fieldset {
    border: 1;
    legend {
      margin-bottom: 15px;
    }
  }
}
</style>