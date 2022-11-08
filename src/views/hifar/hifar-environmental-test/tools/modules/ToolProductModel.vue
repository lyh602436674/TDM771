<template>
  <h-modal
    :title='title'
    :visible='visible'
    :width='drawerWidth'
    :getContainer='getContainer'
    :confirm-loading='confirmLoading'
    inner
    destoryOnClose
    @submit='handleClickSubmit'
    @cancel='handleCancel'
  >
    <h-card>
      <h-form
        slot='content'
        v-if='visible'
        ref='toolsProductForm'
        v-model='equipentInfo'
        :formData='formData'
        :column='24'
        @change='submit'
      ></h-form>
    </h-card>
  </h-modal>
</template>
<script>
import moment from 'moment'
import { downloadFile, postAction, getFileAccessHttpUrl } from '@/api/manage'
import SysUserSelect from '@/views/components/SysUserSelect'
import { isArray } from 'lodash'

export default {
  name: 'ToolProductModel',
  components: {
    SysUserSelect
  },
  inject: {
    getContainer: {
      default: () => document.body
    }
  },
  data() {
    return {
      moment,
      title: '新增',
      visible: false,
      drawerWidth: 1000,
      equipentInfo: {},
      confirmLoading: false,
      url: {
        add: '/HfToolsProducts/add',
        edit: '/HfToolsProducts/modifyById'
      },
      formData: [
        {
          title: '',
          key: 'id',
          formType: 'input',
          span: 12,
          hidden: true
        },
        {
          title: '工装编号 ',
          formType: 'input',
          key: 'toolsCode',
          span: 12,
          validate: {
            rules: [{ required: true, message: '请输入工装编号' }]
          }
        },
        {
          title: '工装名称 ',
          formType: 'input',
          key: 'toolsName',
          span: 12,
          validate: {
            rules: [{ required: true, message: '请输入工装名称' }]
          }
        },
        {
          title: '工装规格 ',
          formType: 'input',
          key: 'toolsSize',
          span: 12,
          validate: {
            rules: [{ required: true, message: '请输入工装名称' }]
          }
        },
        {
          title: '借用部门',
          key: 'borrwoDept',
          span: 12,
          component: (
            <h-depart-select
              placeholder='请选择借用部门'
              v-decorator={['borrwoDept', { initialValue: undefined }]}
              v-on:change={this.borrowDeptChange}
            />
          ),
        },
        {
          title: '',
          key: 'borrwoDeptName',
          formType: 'input',
          hidden: true,
        },

        {
          title: '借用人',
          key: 'borrowPerson',
          span: 12,
          component: <sys-user-select v-decorator={['borrowPerson']}
                                      v-on:change={this.managerChange}></sys-user-select>
          ,
        },
        {
          title: '',
          key: 'borrowPersonName',
          formType: 'input',
          hidden: true,
        },
        {
          title: '借用日期',
          formType: 'datePick',
          key: 'borrowDate',
          span: 12
        },
        {
          title: '检定日期',
          formType: 'datePick',
          key: 'verificationDate',
          span: 12
        },
        {
          title: '在库状态',
          formType: 'dict',
          key: 'larbaryStatus',
          size: 'small',
          dictCode: 'larbary_status',
          span: 12
          // ,
          // validate: {
          //   rules: [{ required: true, message: '请选择在库状态' }]
          // }
        },
        {
          title: '存放地点 ',
          formType: 'input',
          key: 'location',
          span: 12
          // ,
          // validate: {
          //   rules: [{ required: true, message: '请输入存放地点' }]
          // }
        },
        {
          title: '责任人',
          key: 'personId',
          span: 12,
          component: <sys-user-select v-decorator={['personId']}
                                      v-on:change={this.managerChange1}></sys-user-select>
          // ,
          // validate: {
          //   rules: [{ required: true, message: '请选择责任人' }]
          // },
        },
        {
          title: '',
          key: 'person',
          formType: 'input',
          hidden: true,
        },
        {
          title: '责任部门',
          key: 'dept',
          span: 12,
          component: (
            <h-depart-select
              placeholder='请选择责任部门'
              v-decorator={['dept', { initialValue: undefined }]}
              v-on:change={this.userDeptChange}
            />
          )
          // ,
          // validate: {
          //   rules: [{ required: true, message: '请选择责任部门' }]
          // }
        },
        {
          title: '',
          key: 'deptName',
          formType: 'input',
          hidden: true
        },
        {
          title: '生产厂家',
          formType: 'input',
          span: 12,
          key: 'factory'
        },
        {
          title: '启用日期',
          formType: 'datePick',
          key: 'activeDate',
          span: 12
        },
        {
          title: '设备状态',
          formType: 'dict',
          key: 'toolsStatus',
          size: 'small',
          dictCode: 'tools_status',
          span: 12
          // ,
          // validate: {
          //   rules: [{ required: true, message: '请选择分类' }]
          // }
        },
        {
          title: '工装分类',
          formType: 'dict',
          key: 'classify',
          size: 'small',
          dictCode: 'classify_type',
          span: 12
          // ,
          // validate: {
          //   rules: [{ required: true, message: '请选择分类' }]
          // }
        },
        {
          title: '备注 ',
          formType: 'textarea',
          key: 'remake',
          span: 24
        },
        {
          title: '设备图片',
          span: 24,
          key: 'picurl',
          component: <h-upload-img v-decorator={['picurl', { initialValue: [] }]} />,
        },
      ]
    }

  },
  methods: {
    show(record, title) {
      this.visible = true
      this.title = title
      this.edit(record)
    },
    edit(record) {
      let obj = Object.assign({}, record)
      let imgInfo = obj.picurl
      let imgArr = []
      if (imgInfo) {
        imgArr.push({
          fileId: obj.id,
          url: obj.picurl
        })
      }
      obj.picurl = imgArr ? imgArr : []
      obj.userDeptId = obj.userDeptId ? obj.userDeptId : undefined
      obj.verificationDate = obj.verificationDate && obj.verificationDate !== 0 && obj.verificationDate > 0 ? moment(parseInt(obj.verificationDate)) : ''
      obj.borrowDate = obj.borrowDate && obj.borrowDate != 0 && obj.borrowDate > 0 ? moment(parseInt(obj.borrowDate)) : ''
      obj.activeDate = obj.activeDate && obj.activeDate != 0 && obj.activeDate > 0 ? moment(parseInt(obj.activeDate)) : ''
      this.equipentInfo = obj
    },
    handleClickSubmit() {
      this.$refs.toolsProductForm.validateForm()
    },
    async submit(value) {
      if (this.confirmLoading) return
      this.confirmLoading = false
      let url = null
      let params = {
        ...value,
        checkUnit: 1
      }
      if (params.verificationDate) {
        params.verificationDate = moment(params.verificationDate).format('X') * 1000
      }
      if (params.borrowDate) {
        params.borrowDate = moment(params.borrowDate).format('X') * 1000
      }
      if (params.activeDate) {
        params.activeDate = moment(params.activeDate).format('X') * 1000
      }
      if (isArray(params.picurl)) {
        let imgUrl = []
        imgUrl = params.picurl.map((item) => {
          return item.url
        })
        params.picurl = imgUrl.join(',')
      }
      console.log('params>>>>>>>>>>>>>>>>>>>>>>>=======================', params)
      if (params.id) {
        url = this.url.edit
      } else {
        url = this.url.add
      }
      postAction(url, params).then((res) => {
        if (res.code == 200) {
          this.$message.success(this.title + '成功')
          this.handleCancel()
          this.$emit('change', true)
        }
      })
    },
    handleCancel(e) {
      this.visible = false
      this.equipentInfo = {}
    },
    userDeptChange(val, options) {
      this.$refs.toolsProductForm.form.setFieldsValue({ deptName: options.deptName })
    },
    borrowDeptChange(val, options) {
      this.$refs.toolsProductForm.form.setFieldsValue({ borrwoDeptName: options.deptName })
    },
    managerChange(val, option) {
      this.$refs.toolsProductForm.form.setFieldsValue({borrowPersonName: option.idName})
    },
    managerChange1(val, option) {
      this.$refs.toolsProductForm.form.setFieldsValue({person: option.idName})
    },
    validateCheckPeriod(rule, value, callback) {
      if (!value) {
        // callback('请输入检定周期')
        callback()
      } else {
        if (value < 0) {
          callback('请输入正确格式的保质期')
        } else {
          callback()
        }
      }
    }
  }
}
</script>

<style scoped>

</style>