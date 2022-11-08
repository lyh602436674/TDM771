<template>
  <a-drawer
    placement="right"
    style="height: 100%; overflow: hidden"
    destroyOnClose
    :title="title"
    :maskClosable="true"
    :width="drawerWidth"
    :closable="true"
    :visible="visible"
    @close="handleCancel"
  >
    <template slot="title">
      <div style="width: 100%">
        <span>{{ title }}</span>
      </div>
    </template>
    <div class="h-drawer-body-wrapper">
      <a-spin v-if="!disableSubmit" :spinning="confirmLoading">
        <h-form
          ref="userForm"
          v-model="userInfo"
          :width="drawerWidth - 48"
          :formData="formData"
          :column="1"
          @change="submit"
        ></h-form>
      </a-spin>
      <h-detail v-else>
        <h-descriptions title="用户信息" bordered size="small" :column="2">
          <a-descriptions-item v-if="!item.hidden" v-for="(item, index) in formData" :key="index" :label="item.title">
            <span v-if="item.key == 'deptId'">
              {{ userInfo.deptName }}
            </span>
            <span v-else-if="item.key == 'sex'">
              {{ userInfo.sex == 0 ? '保密' : userInfo.sex == 1 ? '男' : '女' }}
            </span>
            <span v-else-if="item.key == 'avatar'">
              <!-- <img :src="userInfo[item.key]" alt=""> -->
              <a-avatar shape="square" :size="128" :src="userInfo[item.key]"/>
            </span>
            <span v-else-if="item.key == 'userType'">
              {{ userType[userInfo[item.key]] }}
            </span>
            <span v-else-if="item.key == 'birthday'">
              {{ moment(userInfo[item.key]).format('YYYY-MM-DD') }}
            </span>
            <span v-else>
              {{ userInfo[item.key] || '----------------' }}
            </span>
          </a-descriptions-item>
        </h-descriptions>
      </h-detail>
    </div>
    <div v-if="!disableSubmit" class="drawer-bootom-button">
      <a-popconfirm title="确定放弃编辑？" @confirm="handleCancel" okText="确定" cancelText="取消">
        <a-button style="margin-right: 8px">取消</a-button>
      </a-popconfirm>
      <a-button type="primary" :loading="confirmLoading" @click="handleClickSubmit">提交</a-button>
    </div>
  </a-drawer>
</template>

<script>
import {reduceRight, isArray} from 'lodash'
import {addUser, editUser, duplicateCheck} from '@/api/api'
import moment from 'moment'

export default {
  name: 'UserModal',
  components: {},
  data() {
    return {
      isPublic: false,
      userType: {
        base: "普通用户",
        sys: "系统管理员",
        security: "安全保密管理员",
        audit: "安全审计管理员",
      },
      columns: [
        [
          {
            title: 'id',
            formType: 'input',
            key: 'id',
            hidden: true,
          },
          {
            title: '用户账号',
            key: 'userCode',
            formType: 'input',
            placeholder: '请输入用户账号',
            validate: {
              rules: [
                {
                  required: true,
                  validator: this.validateUsername,
                },
              ],
            },
          },
        ],
        [
          {
            title: '登录密码',
            key: 'pwd',
            component: <a-input-password autocomplete="new-password"/>,
            placeholder: '请输入用户密码',
            validate: {
              rules: [
                // {
                //   required: true,
                //   pattern: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,./]).{8,}$/,
                //   message: '密码由8位数字、大小写字母和特殊符号组成!',
                // },
                {
                  validator: this.validateToNextPassword,
                },
              ],
            },
          },
          {
            title: '确认密码',
            key: 'confirmpassword',
            component: <a-input-password autocomplete="new-password"/>,
            placeholder: '请确认密码',
            validate: {
              rules: [
                {
                  required: true,
                  validator: this.compareToFirstPassword,
                },
              ],
            },
          },
        ],
        [
          {
            title: '用户姓名',
            key: 'idName',
            formType: 'input',
            placeholder: '请输入用户姓名',
            validate: {
              rules: [
                {
                  required: true,
                  message: '用户姓名不能为空',
                },
              ],
            },
          },
          {
            title: '用户类型',
            key: 'userType',
            formType: 'select',
            options: [
              {
                title: '普通用户',
                key: 'base',
                value: 'base',
              },
              {
                title: '系统管理员',
                key: 'sys',
                value: 'sys',
              },
              {
                title: '安全保密管理员',
                key: 'security',
                value: 'security',
              },
              {
                title: '安全审计管理员',
                key: 'audit',
                value: 'audit',
              },
            ],
            placeholder: '请选择用户类型',
            validate: {
              rules: [
                {
                  required: true,
                  message: '请选择用户类型',
                },
              ]
            },
          },
          {
            title: '身份证号',
            key: 'idCard',
            formType: 'input',
            placeholder: '请输入身份证号',
            validate: {
              rules: [
                {
                  required: true,
                  validator: this.validateIdCard,
                },
              ],
            },
          },
          {
            title: '工号',
            key: 'jobCode',
            formType: 'input',
            placeholder: '请输入用户工号',
          },
          {
            title: '部门分配',
            key: 'deptId',
            component: (
              <h-depart-select
                placeholder="请选择部门"
                v-decorator={['deptId', {initialValue: undefined}]}
              ></h-depart-select>
            ),
          },
          {
            title: '头像',
            key: 'avatar',
            component: (
              <h-upload-img
                accept="image/png,image/jpg,image/jpeg,image/gif"
                multiple={false}
                isPublic={this.isPublic}
              />
            ),
            validate: {
              initialValue: '',
            },
          },
          {
            title: '生日',
            key: 'birthday',
            formType: 'datePick',
            format: 'YYYY-MM-DD',
          },
          {
            title: '性别',
            key: 'sex',
            placeholder: '请选择性别',
            formType: 'select',
            options: [
              {
                title: '保密',
                key: 0,
                value: 0,
              },
              {
                title: '男',
                key: 1,
                value: 1,
              },
              {
                title: '女',
                key: 2,
                value: 2,
              },
            ],
            validate: {initialValue: undefined},
          },
          {
            title: '邮箱',
            key: 'email',
            formType: 'input',
            validate: {
              rules: [
                {
                  validator: this.validateEmail,
                },
              ],
            },
          },
          {
            title: '手机号',
            key: 'mobile',
            formType: 'input',
            validate: {
              rules: [{validator: this.validatePhone}],
            },
          },
          {
            title: '座机号',
            key: 'telephone',
            formType: 'input',
            validate: {
              rules: [{pattern: /^0\d{2,3}-[1-9]\d{6,7}$/, message: '请输入正确的座机号码'}],
            },
          },
        ],
      ],
      formData: [],
      drawerWidth: 700,
      title: '操作',
      visible: false,
      confirmLoading: false,
      // 用户信息
      userInfo: {},
      // 是否展示详情页面
      disableSubmit: false,
    }
  },
  computed: {
    uploadAction: function () {
      return this.url.fileUpload
    },
  },
  methods: {
    moment,
    add() {
      this.edit()
    },
    edit(record = {}) {
      console.log(record)
      this.userInfo = Object.assign({}, record, {
        avatar: record.headUrl,
        birthday: record.birthday == 0 || !record.birthday ? moment() : moment(record.birthday.toString()),
      })
      // 根据数据中是否包含id这个字段，如果包含，那么创建的form中不包含密码字段
      if (this.userInfo.id) {
        this.formData = reduceRight(
          [this.columns[2], this.columns[0]],
          (flattened, other) => {
            return flattened.concat(other)
          },
          []
        )
      } else {
        this.formData = reduceRight(
          [this.columns[2], this.columns[1], this.columns[0]],
          (flattened, other) => {
            return flattened.concat(other)
          },
          []
        )
      }
      this.$nextTick(() => {
        this.visible = true
      })
    },
    show(record) {
      this.disableSubmit = true
      this.edit(record)
    },
    handleClickSubmit() {
      this.$refs.userForm.validateForm()
    },
    // 新建用户提交代码
    async submit(value) {
      let params = {
        ...value,
      }
      if (value.avatar && value.avatar.length > 0) {
        if (isArray(value.avatar)) {
          params.headUrl = value.avatar[0].url
        } else {
          params.headUrl = value.avatar
        }
        delete params.avatar
        if (this.isPublic) {
          params.bucketName = 'public'
        } else {
          params.bucketName = 'private'
        }
      }
      if (params.birthday instanceof moment) {
        params.birthday = params.birthday.format('YYYYMMDD')
      }
      let result = null
      if (this.userInfo.id) {
        result = await editUser(params)
      } else {
        result = await addUser(params)
      }
      if (result.code == 200) {
        this.$message.success(`${this.title}成功`)
        this.$emit('ok', true)
        this.handleCancel()
      }
    },
    // 关闭弹窗
    handleCancel() {
      this.visible = false
    },
    // 二次确认密码
    validateToNextPassword(rule, value, callback) {
      const form = this.$refs.userForm.form
      const confirmpassword = form.getFieldValue('confirmpassword')
      if (value && confirmpassword && value !== confirmpassword) {
        callback('两次输入的密码不一样！')
      }
      if (value && this.confirmDirty) {
        form.validateFields(['confirm'], {force: true})
      }
      callback()
    },
    // 两次密码比较
    compareToFirstPassword(rule, value, callback) {
      const form = this.$refs.userForm.form
      let password = form.getFieldValue('pwd')
      if (!value) {
        callback('请再次确认密码')
      } else if (value !== password) {
        callback('两次输入的密码不一样！')
      } else {
        callback()
      }
    },
    // 校验手机号
    validatePhone(rule, value, callback) {
      if (!value) {
        callback()
      } else {
        if (new RegExp(/^1[3|4|5|7|8|9][0-9]\d{8}$/).test(value)) {
          callback()
        } else {
          callback('请输入正确格式的手机号码!')
        }
      }
    },
    // 校验邮箱
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
    // 校验用户名
    validateUsername(rule, value, callback) {
      if (!value) {
        callback('请输入用户账号')
      } else {
        if (
          new RegExp(/^\S+$/).test(value)
        ) {
          callback()
        } else {
          callback('请输入正确格式的用户账号!')
        }
      }
      if (this.userInfo.id) {
        callback()
        return
      }
      var params = {
        tableName: 'BaseOrgUser',
        columnName: 'userCode',
        columnValue: value,
      }
      duplicateCheck(params).then((res) => {
        if (res.data.num == '0') {
          callback()
        } else {
          callback('用户名已存在!')
        }
      })
    },
    //校验身份证号
    validateIdCard(rule, value, callback) {
      if (!value) {
        callback('请输入身份证号')
      } else {
        if (
          new RegExp(/^\S+$/).test(value)
        ) {
          callback()
        } else {
          callback('请输入正确格式的身份证号!')
        }
      }
      if (this.userInfo.id) {
        callback()
        return
      }
      var params = {
        tableName: 'BaseOrgUser',
        columnName: 'idCard',
        columnValue: value,
      }
      duplicateCheck(params).then((res) => {
        if (res.data.num == '0') {
          callback()
        } else {
          callback('身份证号已存在!')
        }
      })
    },
    // 校验工号
    validateWorkNo(rule, value, callback) {
      if (!value) {
        callback('请输入工号')
        return
      }
      if (this.userInfo.id) {
        callback()
        return
      }
      var params = {
        tableName: 'BaseOrgUser',
        columnName: 'jobCode',
        columnValue: value,
      }
      duplicateCheck(params).then((res) => {
        if (res.data.num == '0') {
          callback()
        } else {
          callback('请输入工号!')
        }
      })
    },
    // 根据屏幕变化,设置抽屉尺寸
    resetScreenSize() {
      let screenWidth = document.body.clientWidth
      if (screenWidth < 500) {
        this.drawerWidth = screenWidth
      } else {
        this.drawerWidth = 700
      }
    },
  },
}
</script>