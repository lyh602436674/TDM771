<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-01 10:56:43
 * @LastEditTime: 2021-09-01 14:39:55
 * @LastEditors: 陈乾龙
 * @Description: 数据源管理新建和编辑
 * @FilePath: \hifar-platform-client\src\views\hifar\sys\backup\modules\DatasourceModal.vue
-->
<template>
  <h-modal
    inner
    fullScreen
    destroyOnClose
    :getContainer="getContainer"
    :visible="visible"
    :title="title"
    :confirmLoading="loading"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <h-card fixed>
      <template slot="content">
        <h-form v-model="model" ref="datasouceForm" :column="2" :formData="formData" @change="submit" />
        <a-button type="primary" block :loading="loading" @click="handleTestConnnect">测试数据库连接</a-button>
      </template>
    </h-card>
  </h-modal>
</template>

<script>
import { postAction } from '@/api/manage'
export default {
  inject: {
    getContainer: {
      default: () => {
        return () => document.body
      },
    },
  },
  data() {
    return {
      visible: false,
      model: {},
      title: '操作',
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '数据源编码',
          key: 'datasourceCode',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入数据源编码' }],
          },
        },
        {
          title: '数据源名称',
          key: 'datasourceName',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入数据源名称' }],
          },
        },
        {
          title: '数据源类型',
          key: 'datasourceTypeCode',
          formType: 'dict',
          dictCode: 'hf_sys_ds_type',
          validate: {
            rules: [{ required: true, message: '请选择数据源类型' }],
          },
          change: (v, option) => {
            this.$refs.datasouceForm.form.setFieldsValue({
              datasourceTypeName: option.title,
              driverClassName: this.dbDriverMap[v].driver,
              linkUrl: this.dbDriverMap[v].source,
            })
          },
        },
        {
          key: 'datasourceTypeName',
          formType: 'input',
          hidden: true,
        },
        {
          title: '驱动类',
          key: 'driverClassName',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入驱动类名称' }],
          },
        },
        {
          title: '数据源地址',
          key: 'linkUrl',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入数据源地址' }],
          },
        },
        {
          title: '数据库名称',
          key: 'databaseName',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入数据源地址' }],
          },
        },
        {
          title: '用户名',
          key: 'userName',
          formType: 'input',
          type: 'password',
          validate: {
            rules: [{ required: true, message: '请输入数据源地址' }],
          },
        },
        {
          title: '密码',
          key: 'password',
          component: <a-input-password autocomplete />,
          validate: {
            rules: [{ required: true, message: '请输入密码' }],
          },
        },
        {
          title: '是否备份',
          key: 'backupFlag',
          component: <h-switch v-decorator={['backupFlag', { initialValue: '1' }]} options={['1', '2']} />,
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
          span: 2,
        },
      ],
      dbDriverMap: {
        // MySQL 数据库
        1: {
          driver: 'com.mysql.cj.jdbc.Driver',
          source:
            'jdbc:mysql://127.0.0.1:3306/hifar_idm?characterEncoding=UTF-8&useUnicode=true&useSSL=false&tinyInt1isBit=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Shanghai',
        },
        // Oracle
        2: {
          driver: 'oracle.jdbc.OracleDriver',
          source: 'jdbc:oracle:thin:@192.168.3.110:1521:tdm',
        },
        // 达梦
        3: {
          driver: 'dm.jdbc.driver.DmDriver',
          source: 'jdbc:dm://192.168.3.74:5236:hifar_demo',
        },
        // SQLServer 数据库
        4: {
          driver: 'com.microsoft.sqlserver.jdbc.SQLServerDriver',
          source: 'jdbc:sqlserver://127.0.0.1:1433;SelectMethod=cursor;DatabaseName=hifar_demo',
        },
      },
      url: {
        add: '/SysDatasourceConfigBusiness/add',
        edit: '/SysDatasourceConfigBusiness/modifyById',
        connect: '/SysDatasourceConfigBusiness/testConnection',
      },
      loading: false,
    }
  },
  methods: {
    add() {
      this.edit({})
    },
    edit(record = {}) {
      this.model = Object.assign({}, record)
      if (this.model.id) {
        this.title = '编辑'
      } else {
        this.title = '新建'
      }
      this.$nextTick(() => {
        this.visible = true
      })
    },
    submit(values) {
      console.log(values)
      if (this.loading) return
      this.loading = true
      let params = {
        ...values,
      }
      let url = null
      if (values.id) {
        url = this.url.edit
      } else {
        url = this.url.add
      }
      postAction(url, params)
        .then((res) => {
          if (res.code == 200) {
            this.$message.success(this.title + '成功')
            this.$emit('change', true)
            this.handleCancel()
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleTestConnnect() {
      if (this.loading) return
      this.loading = true
      let value = this.$refs.datasouceForm.form.getFieldsValue()
      console.log(value)
      if (value) {
        let params = {
          driverClassName: value.driverClassName,
          linkUrl: value.linkUrl,
          userName: value.userName,
          password: value.password,
        }
        postAction(this.url.connect, params)
          .then((res) => {
            if (res.code == 200) {
              this.$message.success('测试连接成功')
            }
          })
          .finally(() => {
            this.loading = false
          })
      }
    },
    handleSubmit() {
      this.$refs.datasouceForm.validateForm()
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style>
</style>
