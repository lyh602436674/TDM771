<!--
 * @Author: 赵峰
 * @Date: 2021-09-13 09:55:00
 * @LastEditTime: 2021-11-29 15:59:40
 * @LastEditors: 马潭龙
 * @Descripttion:
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\equipment\EquipmentModal.vue
-->
<template>
  <h-modal
    :title="title"
    :visible="visible"
    :width="drawerWidth"
    :getContainer="getContainer"
    :confirm-loading="confirmLoading"
    inner
    fullScreen
    destoryOnClose
    @submit="handleClickSubmit"
    @cancel="handleCancel"
  >
    <h-card>
      <h-form
        slot="content"
        v-if="visible"
        ref="equipmentForm"
        v-model="equipentInfo"
        :formData="formData"
        :column="24"
        @change="submit"
      ></h-form>
    </h-card>
    <project-add-modal allowEmpty ref="projectAddModal" @change="projectModalCallback"></project-add-modal>
  </h-modal>
</template>

<script>
import moment from 'moment'
import {postAction} from '@/api/manage'
import SysUserSelect from '@/views/components/SysUserSelect'
import ProjectAddModal from '@views/hifar/hifar-environmental-test/entrustment/modules/ProjectAddModal';

const validatorIp = function (rule, value, callback) {
  const exp = /^((2((5[0-5])|([0-4]\d)))|([0-1]?\d{1,2}))(\.((2((5[0-5])|([0-4]\d)))|([0-1]?\d{1,2}))){3}$/
  if (!value) {
    callback()
  }
  if (exp.test(value)) {
    callback()
  } else {
    callback('请输入正确格式的ip地址')
  }
}
export default {
  components: {
    SysUserSelect, ProjectAddModal
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
        add: '/HfResEquipBusiness/add',
        edit: '/HfResEquipBusiness/modifyById'
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
          title: '设备名称 ',
          formType: 'input',
          key: 'equipName',
          span: 12,
          validate: {
            rules: [{required: true, message: '请输入设备名称'}]
          }
        },
        {
          title: '设备编号',
          formType: 'input',
          key: 'equipCode',
          span: 12,
          validate: {
            rules: [{required: true, message: '请输入设备编号'}]
          }
        },
        {
          title: '设备用途',
          formType: 'dict',
          key: 'equipUse',
          size: 'small',
          span: 12,
          dictCode: 'hf_res_equip_use',
          disabled: true,
          validate: {
            rules: [{required: true, message: '请选择设备用途'}]
          },
          change: val => {
            this.changeEquipUse(val)
          }
        },
        {
          title: '设备类型',
          formType: 'dict',
          key: 'equipTypeCode',
          size: 'small',
          dictCode: 'hf_res_equip_type',
          span: 12,
          validate: {
            rules: [{required: true, message: '请选择设备类型'}]
          },
          change: (val, option) => {
            this.$refs.equipmentForm.form.setFieldsValue({equipTypeName: option.title})
          }
        },
        {
          title: '',
          key: 'equipTypeName',
          formType: 'input',
          span: 12,
          hidden: true
        },
        {
          title: '内部名称',
          formType: 'input',
          span: 12,
          key: 'innerName'
        },
        {
          title: '资产编号',
          formType: 'input',
          span: 12,
          key: 'assetsCode'
        },
        {
          title: '规格',
          formType: 'input',
          span: 12,
          key: 'specification'
        },
        {
          title: '出厂编号',
          formType: 'input',
          span: 12,
          key: 'leaveCode'
        },
        {
          title: '生产厂家',
          formType: 'input',
          span: 12,
          key: 'factoryName'
        },
        {
          title: '购买日期',
          formType: 'datePick',
          span: 12,
          key: 'buyTime'
        },
        {
          title: '负责人',
          key: 'managerId',
          span: 12,
          component: <sys-user-select v-decorator={['managerId']} v-on:change={this.managerChange}></sys-user-select>
        },
        {
          title: '',
          key: 'managerName',
          formType: 'input',
          span: 12,
          hidden: true
        },
        {
          title: '设备型号',
          formType: 'input',
          span: 12,
          key: 'equipModel',
          validate: {
            rules: [
              {required: true, message: '请输入设备型号'}
            ]
          }
        },
        {
          title: '设备状态',
          formType: 'dict',
          key: 'status',
          dictCode: 'status_dict',
          span: 12,
          validate: {
            rules: [{required: true, message: '请选择设备状态'}]
          }
        },
        {
          title: '计量编号',
          formType: 'input',
          key: 'meteringNum',
          span: 12
        },
        {
          title: '计量有效期',
          formType: 'datePick',
          key: 'checkValid',
          span: 12,
          validate: {
            rules: [
              {required: true, message: '请选择计量有效期'}
            ]
          }
        },
        {
          title: '计量周期',
          formType: 'input',
          key: 'checkPeriod',
          type: 'number',
          addonAfter: '天',
          span: 12,
          validate: {
            rules: [
              {required: false, validator: this.validateCheckPeriod}
            ]
          }
        },
        {
          title: '使用部门',
          key: 'userDeptId',
          span: 12,
          validate: {
            rules: [
              {required: true, message: '请选择使用部门'}
            ]
          },
          component: (
            <h-depart-select
              placeholder="请选择使用部门"
              v-decorator={['userDeptId', {
                rules: [
                  {required: true, message: '请选择使用部门'}
                ]
              }]}
              v-on:change={this.userDeptChange}
            />
          )
        },
        {
          key: 'department',
          formType: 'input',
          hidden: true,
        },
        {
          title: '设备能力',
          key: 'equipBaseProjectNames',
          span: 12,
          formType: 'input',
          placeholder: "请选择",
          readOnly: true,
          click: () => {
            this.$refs.projectAddModal.visible = true
            this.$refs.projectAddModal.getProjectTree()
            let equipBaseProjectIds = this.$refs.equipmentForm.form.getFieldsValue().equipBaseProjectIds
            this.$refs.projectAddModal.selectedRowKeys = equipBaseProjectIds && equipBaseProjectIds.split(',') || []
          }
        },
        {
          title: '开机费',
          key: 'startupCost',
          formType: 'input-number',
          span: 12,
          min: 0,
          style: {width: "100%"}
        },
        {
          key: 'equipBaseProjectIds',
          formType: 'input',
          hidden: true
        },
        {
          title: 'X坐标',
          key: 'coordinateX',
          formType: 'input',
          type: 'number',
          span: 6,
          addonAfter: '%',
          validate: {rules: [{required: false, validator: this.validateCoordinate}]}
        },
        {
          title: 'Y坐标',
          key: 'coordinateY',
          formType: 'input',
          span: 6,
          type: 'number',
          addonAfter: '%',
          validate: {rules: [{required: false, validator: this.validateCoordinate}]}
        },
        {
          title: '摄像头IP',
          span: 12,
          formType: 'input',
          key: 'cameraIp',
          validate: {
            rules: [{required: false, validator: validatorIp}]
          }
        },
        {
          title: '放置地点',
          formType: 'dict',
          key: 'address',
          dictCode: 'hf_res_equip_address',
          span: 12,
          validate: {
            rules: [{required: true, message: '请选择放置地点'}]
          }
        },
        {
          title: '排序',
          key: 'rowSort',
          formType: 'input',
          span: 12,
          type: 'number',
        },
        {
          title: '大屏显示名称',
          key: 'largeScreenName',
          formType: 'input',
          span: 12,
        },
        {
          title: '',
          key: 'userDeptName',
          formType: 'input',
          span: 12,
          hidden: true
        },
        {
          title: '技术参数',
          formType: 'textarea',
          key: 'technology',
          span: 24
        },
        {
          title: '备注',
          formType: 'textarea',
          key: 'remarks',
          span: 24
        },
        {
          title: '设备图片',
          key: 'imgUrl',
          span: 24,
          component: (
            <h-upload-img
              multiple={false}
              accept="image/png,image/gif,image/jpg,image/jpeg"
              v-decorator={['imgUrl', {initialValue: []}]}
            />
          )
        },
        {
          title: '附件',
          key: 'attachIds',
          span: 24,
          component: <h-upload-file multiple={true} v-decorator={['attachIds', {initialValue: []}]}/>
        }
      ]
    }
  },

  methods: {
    show(record, title) {
      this.visible = true
      this.title = title
      this.edit(record)
    },
    // 选择项目弹框返回数据
    projectModalCallback(recordId, record) {
      this.$refs.equipmentForm.form.setFieldsValue({
        equipBaseProjectIds: record.map(item => item.id).toString(),
        equipBaseProjectNames: record.map(item => item.unitName).toString()
      })
    },
    // 编辑
    edit(record) {
      let obj = Object.assign({}, record)
      let attachInfo = obj.attachInfo
      let imgInfo = obj.imgUrl
      let fileArr = []
      let imgArr = []
      if (imgInfo) {
        imgArr.push({
          fileId: obj.id,
          url: obj.imgUrl
        })
      }
      if (attachInfo && attachInfo.length > 0) {
        attachInfo.forEach((item) => {
          fileArr.push({
            fileId: item.id,
            size: item.fileSize,
            status: item.status == 9 ? 'success' : 'exception',
            url: item.filePath,
            name: item.fileName,
            uuid: item.id,
            percent: 100,
            uploadTime: item.createTime,
            secretLevel: item.secretLevel,
            type: item.viewType == 2 ? 'image/jpeg' : 'text/plain'
          })
        })
      }
      obj.imgUrl = imgArr || []
      obj.attachIds = fileArr || []
      obj.userDeptId = obj.userDeptId ? obj.userDeptId : undefined
      obj.buyTime = obj.buyTime && obj.buyTime != 0 && obj.buyTime > 0 ? moment(parseInt(obj.buyTime)) : ''
      obj.checkValid = obj.checkValid && obj.checkValid != 0 && obj.checkValid > 0 ? moment(parseInt(obj.checkValid)) : ''
      obj.managerId = obj.managerId && obj.managerId != 0 ? obj.managerId : undefined
      this.equipentInfo = obj
      if (this.title === '新增') {
        this.changeEquipUse(obj.equipUse)
      }
      this.filterFields()
    },
    filterFields() {
      this.$nextTick(() => {
        let formData = this.$refs.equipmentForm.$options.propsData.formData
        let largeScreenName = formData.filter(v => v.key === 'largeScreenName')[0]
        largeScreenName.hidden = this.equipentInfo.equipUse == '2'
      })
    },
    changeEquipUse(val) {
      this.$nextTick(() => {
        let formData = this.$refs.equipmentForm.$options.propsData.formData
        let equipTypeCode = formData.filter(v => v.key === 'equipTypeCode')[0]
        let address = formData.filter(v => v.key === 'address')[0]
        let equipModel = formData.filter(v => v.key === 'equipModel')[0]
        equipTypeCode.validate.rules[0].required = val === '1'
        address.validate.rules[0].required = val === '1'
        equipModel.validate.rules[0].required = val === '1'
        if (val === '2') {
          this.$refs.equipmentForm.form.setFieldsValue({equipTypeCode: '/', address: "7"})
        }
      })
    },
    handleCancel(e) {
      this.visible = false
      this.equipentInfo = {}
    },
    userDeptChange(val, options) {
      this.$refs.equipmentForm.form.setFieldsValue({userDeptName: options.deptName, department: options.deptCode})
    },
    handleClickSubmit() {
      this.$refs.equipmentForm.validateForm()
    },
    async submit(value) {
      if (this.confirmLoading) return
      this.confirmLoading = false
      let url = null
      let attachIds = []
      let img_url = ''
      let params = {
        ...value,
        checkUnit: 1
      }
      let attachIdsArr = params.attachIds
      let imgUrlArr = params.imgUrl
      if (imgUrlArr.length > 0) {
        img_url = imgUrlArr[0].url
      }
      params.imgUrl = img_url
      if (attachIdsArr.length > 0) {
        attachIdsArr.forEach((item) => {
          attachIds.push(item.fileId)
        })
      }
      params.attachIds = attachIds.length > 0 ? attachIds.join(',') : ''
      params.buyTime = params.buyTime ? params.buyTime.valueOf() : ''
      params.checkValid = params.checkValid ? params.checkValid.valueOf() : ''
      if (params.id) {
        url = this.url.edit
      } else {
        url = this.url.add
      }
      postAction(url, params).then((res) => {
        if (res.code === 200) {
          this.$message.success(this.title + '成功')
          this.handleCancel()
          this.$emit('change', true)
        }
      })
    },
    managerChange(val, option) {
      this.$refs.equipmentForm.form.setFieldsValue({managerName: option.idName})
    },
    validateCheckPeriod(rule, value, callback) {
      if (!value) {
        // callback('请输入检定周期')
        callback()
      } else {
        if (value < 0) {
          callback('请输入正确格式的计量周期')
        } else {
          callback()
        }
      }
    },
    validateCoordinate(rule, value, callback) {
      if (!value) {
        callback()
      } else {
        if (value < 0 || value > 100) {
          callback('请输入0-100范围内的数值')
        } else {
          callback()
        }
      }
    }
  }
}
</script>
<style lang='less' scoped>
</style>
