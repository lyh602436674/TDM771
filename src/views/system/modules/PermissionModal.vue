<template>
  <a-drawer
    :title="title"
    :width="drawerWidth"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @close="handleCancel"
  >
    <div v-if="form" :style="{ width: '100%', padding: '10px 16px', background: '#fff' }" style="height: 100%; overflow:scroll">
      <a-spin :spinning="confirmLoading">
        <a-form :form="form">
          <a-form-item v-show="false">
            <a-input v-decorator="['id']"></a-input>
          </a-form-item>
          <a-form-item label="菜单类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-radio-group v-decorator="['menuType', validatorRules.menuType]" @change="onChangeMenuType">
              <a-radio value="menu">菜单</a-radio>
              <a-radio value="btn">按钮/权限</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item :label="menuLabel" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input v-decorator="['title', validatorRules.title]" :placeholder="'请输入' + menuLabel" />
          </a-form-item>

          <a-form-item label="上级菜单" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-tree-select
              v-decorator="['pid']"
              style="width: 100%"
              placeholder="请选择父级菜单"
              :replaceFields="{
                children: 'children',
                title: 'title',
                key: 'id',
                value: 'id',
              }"
              :dropdownStyle="{ maxHeight: '200px', overflow: 'auto' }"
              :treeData="treeData"
            />
          </a-form-item>

          <template v-if="form.getFieldValue('menuType') == 'menu'">
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="菜单路径">
              <a-input v-decorator="['path', validatorRules.path]" placeholder="请输入菜单路径" />
            </a-form-item>

            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="组件路径">
              <a-input v-decorator="['menuLayout', validatorRules.menuLayout]" placeholder="请输入组件路径" />
            </a-form-item>

            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="默认跳转地址">
              <a-input v-decorator="['menuRedirect']" placeholder="请输入默认跳转路径" />
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="菜单图标">
              <a-input v-decorator="['icon']" placeholder="点击选择图标">
                <a-icon slot="addonAfter" type="setting" @click="selectIcons" />
              </a-input>
            </a-form-item>

            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="隐藏路由">
              <a-switch
                v-decorator="['isHidden', { valuePropName: 'checked', initialValue: false }]"
                checkedChildren="是"
                unCheckedChildren="否"
              />
            </a-form-item>

            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="是否缓存路由">
              <a-switch
                v-decorator="['keepAlive', { valuePropName: 'checked', initialValue: false }]"
                checkedChildren="是"
                unCheckedChildren="否"
              />
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="打开方式">
              <a-switch
                v-decorator="['isInternal', { valuePropName: 'checked', initialValue: false }]"
                checkedChildren="外部"
                unCheckedChildren="内部"
              />
            </a-form-item>
          </template>

          <a-form-item
            v-if="form.getFieldValue('menuType') == 'btn'"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="授权标识"
          >
            <a-input
              v-decorator="[
                'menuCode',
                { rules: [{ required: false, message: '请输入授权标识!' }, { validator: this.validatePerms }] },
              ]"
              placeholder="请输入授权标识, 如: user:list"
            />
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="排序">
            <a-input-number v-decorator="['rowSort', validatorRules.rowSort]" placeholder="请输入序号" />
          </a-form-item>
        </a-form>
        <!-- 选择图标 -->
        <icons @choose="handleIconChoose" @close="handleIconCancel" :iconChooseVisible="iconChooseVisible"></icons>
      </a-spin>
    </div>
    <div class="drawer-bootom-button">
      <a-button :style="{ marginRight: '8px' }" @click="handleCancel"> 关闭 </a-button>
      <a-button type="primary" @click="handleOk">提交</a-button>
    </div>
  </a-drawer>
</template>

<script>
import { addPermission, editPermission, getSystemMenuList } from '@/api/api'
import Icons from './icon/Icons'
import pick from 'lodash.pick'
import { rebuildRouter } from '@/utils/hasPermission'
export default {
  name: 'PermissionModal',
  components: { Icons },
  data() {
    return {
      drawerWidth: 700,
      treeData: [],
      title: '操作',
      visible: false,
      model: {},
      menuLabel: '菜单名称',
      isRequrie: true, // 是否需要验证
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      confirmLoading: false,
      form: null,
      iconChooseVisible: false,
      validatorRules: {
        menuType: {
          valuePropName: 'value',
          initialValue: 'menu',
          rules: [
            {
              required: true,
              validator(rule, value, callback) {
                if (!value) {
                  callback('请选择菜单类型')
                  return
                }
                callback()
              },
            },
          ],
        },
        title: {
          rules: [
            {
              required: true,
              validator: (rule, value, callback) => {
                let type = this.form.getFieldValue('menuType')
                if (!value || !value.trim()) {
                  switch (type) {
                    case 'menu':
                      callback('请输入菜单名称!')
                      break
                    case 'btn':
                      callback('请输入按钮名称!')
                      break
                    default:
                      callback('该值不能为空!')
                  }
                } else {
                  callback()
                }
              },
              whitespace: true,
            },
          ],
        },
        menuLayout: { rules: [{ required: true, message: '请输入组件路径!', whitespace: true }] },
        path: { rules: [{ required: true, message: '请输入菜单路径!', whitespace: true }] },
        permsType: { rules: [{ required: true, message: '请输入授权策略!' }] },
        rowSort: { initialValue: 1.0 },
      },
      fieldKeys: [
        'id',
        'pid',
        'title',
        'menuType',
        'path',
        'menuLayout',
        'menuRedirect',
        'menuPath',
        'menuCode',
        'rowSort',
        'isHidden',
        'icon',
        'keepAlive',
        'isInternal',
      ],
    }
  },
  methods: {
    async loadTree() {
      this.treeData = []
      let response = await getSystemMenuList()
      if (response.code == 200) {
        let treeList = rebuildRouter(response.data)
        treeList.unshift({ title: '根菜单', id: '0', value: '0' })
        this.treeData = treeList
      }
    },
    add() {
      // 新增操作默认pid 为根目录
      this.edit({ pid: '0', menuType: 'menu' })
    },
    edit(record = {}) {
      this.resetScreenSize() // 调用此方法,根据屏幕宽度自适应调整抽屉的宽度
      let obj = Object.assign({}, record)
      obj.keepAlive = obj.meta ? obj.meta.keepAlive : ''
      this.model = obj
      if (this.model.menuType == 'btn') {
        this.menuLabel = '按钮名称'
      } else {
        this.menuLabel = '菜单名称'
      }
      if (this.form) {
        this.form.resetFields()
        this.fieldKeys.map((item) => {
          this.form.getFieldDecorator(item)
        })
        this.form.setFieldsValue(pick(this.model, this.fieldKeys))
      } else {
        this.form = this.$form.createForm(this, {
          name: 'menuForm',
          mapPropsToFields: () => {
            let fields = {}
            this.fieldKeys.map((key) => {
              fields[key] = this.$form.createFormField({
                value: this.model[key] || undefined,
              })
            })
            return fields
          },
        })
      }
      // 加载菜单下拉树
      this.loadTree()
      this.visible = true
    },
    close() {
      this.$emit('close')
      this.form.resetFields()
      this.confirmLoading = false
      this.visible = false
    },
    handleOk() {
      // 触发表单验证
      this.form.validateFieldsAndScroll(async (err, values) => {
        if (!err) {
          if (this.confirmLoading) return
          this.confirmLoading = true
          console.log('formData==================', values)
          let formData = {
            ...values,
            menuName: values.title,
            menuIcon: values.icon,
            isHidden: values.isHidden ? 1 : 2,
            isInternal: values.isInternal ? 1 : 2,
            keepAlive: values.keepAlive ? 1 : 2,
            menuPath: values.path,
          }
          console.log('formData==================', formData)
          if (values.menuType == 'menu') {
            let menuCode = values.path.split('/')
            menuCode = menuCode[menuCode.length - 1]
            formData.menuCode = menuCode
          } else {
            formData.perm = values.perm
          }

          delete formData.title
          delete formData.icon
          delete formData.path
          let response = null
          if (!this.model.id) {
            response = await addPermission(formData)
          } else {
            response = await editPermission(formData)
          }
          if (response.code == 200) {
            this.$message.success(formData.menuName + this.title + '成功')
            this.$emit('ok')
            this.close()
          } else {
            this.$message.warning(response.msg)
            this.confirmLoading = false
          }
        }
      })
    },
    handleCancel() {
      this.close()
    },
    validateNumber(rule, value, callback) {
      if (!value || new RegExp(/^[0-9]*[1-9][0-9]*$/).test(value)) {
        callback()
      } else {
        callback('请输入正整数!')
      }
    },
    async validatePerms(rule, value, callback) {
      if (value && value.length > 0) {
        // 校验授权标识是否存在
        var params = {
          tableName: 'sys_permission',
          fieldName: 'perms',
          fieldVal: value,
          dataId: this.model.id,
        }
        callback()
        // duplicateCheck(params).then((res) => {
        //   if (res.success) {
        //     callback()
        //   } else {
        //     callback('授权标识已存在!')
        //   }
        // })
      } else {
        callback('请输入授权标识')
      }
    },
    onChangeMenuType(e) {
      let menuType = e.target.value
      if (menuType == 'menu') {
        this.menuLabel = '菜单名称'
      } else {
        this.menuLabel = '按钮名称'
      }
      this.form.resetFields()
      this.form.setFieldsValue({ menuType: menuType })
    },
    selectIcons() {
      this.iconChooseVisible = true
    },
    handleIconCancel() {
      this.iconChooseVisible = false
    },
    handleIconChoose(value) {
      this.model.icon = value
      this.form.icon = value
      this.form.setFieldsValue({
        icon: value,
      })
      this.iconChooseVisible = false
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

<style scoped>
</style>
