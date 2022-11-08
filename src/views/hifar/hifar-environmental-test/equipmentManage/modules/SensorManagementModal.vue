<!--
 * @Author: 赵峰
 * @Date: 2021-10-25 16:46:56
 * @LastEditTime: 2021-10-25 17:58:12
 * @LastEditors: 赵峰
 * @Descripttion: 设备传感器--增改
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\equipmentManage\modules\SensorManagementModal.vue
-->
<template>
  <h-modal
    :title="title"
    :visible="visible"
    :width="drawerWidth"
    :getContainer="getContainer"
    :confirm-loading="confirmLoading"
    inner
    destoryOnClose
    @submit="handleClickSubmit"
    @cancel="handleCancel"
  >
    <h-form
      v-if="visible"
      ref="equipmentForm"
      v-model="equipentInfo"
      :width="drawerWidth - 48"
      :formData="formData"
      :column="2"
      @change="submit"
    ></h-form>
  </h-modal>
</template>

<script>
import moment from 'moment'
import { downloadFile, postAction, getFileAccessHttpUrl } from '@/api/manage'
import SysUserSelect from '@/views/components/SysUserSelect'
export default {
  components: {
    SysUserSelect,
  },
  inject: {
    getContainer: {
      default: () => document.body,
    },
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
        add: '/HfResSensorBusiness/add',
        edit: '/HfResSensorBusiness/modifyById',
        detail: '/HfResSensorBusiness/queryById',
      },
      formData: [
        {
          title: '',
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '设备名称 ',
          formType: 'input',
          key: 'equipName',
          validate: {
            rules: [{ required: true, message: '请输入设备名称' }],
          },
        },
        {
          title: '设备编号',
          formType: 'input',
          key: 'equipCode',
          validate: {
            rules: [{ required: true, message: '请输入设备编号' }],
          },
        },
        {
          title: '设备型号',
          formType: 'input',
          key: 'equipModel',
          validate: {
            rules: [{ required: false, message: '请输入设备型号' }],
          },
        },
        {
          title: '内部名称',
          formType: 'input',
          key: 'innerName',
        },
        {
          title: '资产编号',
          formType: 'input',
          key: 'assetsCode',
        },
        {
          title: '购买日期',
          formType: 'datePick',
          key: 'buyTime',
        },
        {
          title: '生产厂家',
          formType: 'input',
          key: 'factoryName',
        },
        {
          title: '检定日期',
          formType: 'datePick',
          key: 'checkTime',
        },
        {
          title: '检定有效期',
          formType: 'datePick',
          key: 'checkValid',
        },
        {
          title: '检定周期',
          formType: 'input',
          key: 'checkPeriod',
          type: 'number',
          addonAfter: '天',
          validate: {
            rules: [
              {
                required: false,
                validator: this.validateCheckPeriod,
              },
            ],
          },
        },
        {
          title: '检定编号',
          formType: 'input',
          key: 'checkCode',
        },
        {
          title: '技术参数',
          formType: 'textarea',
          key: 'technologyParam',
          span: 2,
        },
        {
          title: '备注',
          formType: 'textarea',
          key: 'remarks',
          span: 2,
        },
        {
          title: '设备图片',
          key: 'imgUrl',
          span: 2,
          component: (
            <h-upload-img
              multiple={false}
              accept="image/png,image/gif,image/jpg,image/jpeg"
              v-decorator={['imgUrl', { initialValue: [] }]}
            />
          ),
        },
      ],
    }
  },

  methods: {
    show(record, title) {
      this.visible = true
      this.title = title
      if (record.id) {
        this.loadDetailData(record.id)
      } else {
        this.edit(record)
      }
    },
    loadDetailData(id) {
      postAction(this.url.detail, { id: id }).then((res) => {
        if (res.code == 200) {
          const { data } = res
          this.edit(data)
        }
      })
    },
    // 编辑
    edit(record) {
      let obj = Object.assign({}, record)
      let imgInfo = obj.imgUrl
      let imgArr = []
      if (imgInfo) {
        imgArr.push({
          fileId: obj.id,
          url: obj.imgUrl,
        })
      }
      obj.imgUrl = imgArr ? imgArr : []
      obj.checkTime = obj.checkTime && obj.checkTime != 0 ? moment(parseFloat(obj.checkTime)) : ''
      obj.buyTime = obj.buyTime && obj.buyTime != 0 ? moment(parseFloat(obj.buyTime)) : ''
      obj.checkValid = obj.checkValid && obj.checkValid != 0 ? moment(parseFloat(obj.checkValid)) : ''
      this.equipentInfo = obj
    },
    handleCancel(e) {
      this.visible = false
      this.equipentInfo = {}
    },
    handleClickSubmit() {
      this.$refs.equipmentForm.validateForm()
    },
    async submit(value) {
      if (this.confirmLoading) return
      this.confirmLoading = false
      let url = null
      let img_url = ''
      let params = {
        ...value,
        checkUnit: 1,
      }
      let imgUrlArr = params.imgUrl
      if (imgUrlArr.length > 0) {
        img_url = imgUrlArr[0].url
      }
      params.imgUrl = img_url
      params.checkTime = params.checkTime ? params.checkTime.valueOf() : ''
      params.buyTime = params.buyTime ? params.buyTime.valueOf() : ''
      params.checkValid = params.checkValid ? params.checkValid.valueOf() : ''
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
    validateCheckPeriod(rule, value, callback) {
      if (!value) {
        callback()
      } else {
        if (value < 0) {
          callback('请输入正确格式的检定周期')
        } else {
          callback()
        }
      }
    },
  },
}
</script>
<style lang='less' scoped>
</style>