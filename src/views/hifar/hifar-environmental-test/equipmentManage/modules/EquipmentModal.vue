<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-17 09:26:15
 * @LastEditTime: 2021-11-02 10:20:33
 * @LastEditors: 赵峰
 * @Description: 新增设备弹窗，也可以作为编辑弹窗
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\equipmentManage\modules\EquipmentModal.vue
-->
<template>
  <h-modal
    inner
    fullScreen
    :title="title"
    :getContainer="getContainer"
    :visible="visible"
    :confirmLoading="loading"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <h-card>
      <equipment-form slot="content" ref="equipment" @change="submit" />
    </h-card>
  </h-modal>
</template>

<script>
import EquipmentForm from './EquipmentForm.vue'
import { getAction, postAction } from '@/api/manage'
import moment from 'moment'
import { isArray, isString } from 'lodash'
export default {
  inject: {
    getContainer: {
      default: () => {
        return () => document.body
      },
    },
  },
  components: { EquipmentForm },
  data() {
    return {
      visible: false,
      localEquipId: null,
      model: {},
      loading: false,
      title: '操作',
      url: {
        detail: '/HfResEquipBusiness/queryById',
        edit: '/HfResEquipBusiness/modifyById',
        add: '/HfResEquipBusiness/add',
      },
    }
  },
  methods: {
    add() {
      this.edit()
    },
    edit(equipId) {
      this.localEquipId = equipId
      if (this.localEquipId) {
        this.title = '编辑设备'
      } else {
        this.title = '添加设备'
      }
      this.getEquipDetail()
      this.$nextTick(() => {
        this.visible = true
      })
    },
    handleCancel() {
      this.visible = false
      this.$refs.equipment.$refs.equipmentForm.form.resetFields()
    },
    handleSubmit() {
      this.$refs.equipment.validateForm()
    },
    submit(values) {
      if (this.loading) return
      this.loading = true
      let url = null
      let params = {
        ...values,
      }
      params.buyTime = params.buyTime && params.buyTime != 0 ? params.buyTime.valueOf() : ''
      params.checkTime = params.checkTime && params.checkTime != 0 ? params.checkTime.valueOf() : ''
      if (isArray(params.imgUrl)) {
        let imgUrl = []
        imgUrl = params.imgUrl.map((item) => {
          return item.url
        })
        params.imgUrl = imgUrl.join(',')
      }
      if (isArray(params.attachInfo)) {
        let attachInfo = params.attachInfo.map((file) => {
          return file.fileId
        })
        params.attachIds = attachInfo.join(',')
      }
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
    getEquipDetail() {
      getAction(this.url.detail, { id: this.localEquipId }).then((res) => {
        if (res.code == 200) {
          res.data.buyTime = res.data.buyTime && res.data.buyTime != 0 ? moment(parseFloat(res.data.buyTime)) : ''
          res.data.checkTime =
            res.data.checkTime && res.data.checkTime != 0 ? moment(parseFloat(res.data.checkTime)) : ''
          res.data.managerId = res.data.managerId && res.data.managerId != 0 ? res.data.managerId : undefined
          if (res.data.attachInfo && res.data.attachInfo.length > 0) {
            let attachInfo = null
            attachInfo = res.data.attachInfo.map((file) => {
              return Object.assign({}, file, {
                name: file.fileName,
                size: parseFloat(file.fileSize),
                uploadTime: file.createTime,
                percent: 100,
                url: file.filePath,
                type: file.fileType,
                uuid: file.id,
                fileId: file.id,
                status: 'success',
              })
            })
            res.data.attachInfo = attachInfo
          }
          this.model = res.data
          if (this.$refs.efForm) {
            this.$refs.equipment.model = this.model
          }
        }
      })
    },
  },
}
</script>

<style>
</style>