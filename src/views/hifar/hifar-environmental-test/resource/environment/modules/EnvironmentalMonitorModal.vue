<!--
 * @Author: 赵峰
 * @Date: 2021-09-02 13:47:36
 * @LastEditTime: 2021-11-29 17:17:55
 * @LastEditors: 马潭龙
 * @Descripttion: 环境检测新增-编辑
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\environment\modules\EnvironmentalMonitorModal.vue
-->
<template>
  <h-modal
    :title="title"
    inner
    :visible="visible"
    :getContainer="getContainer"
    :confirm-loading="confirmLoading"
    @submit="handleClickSubmit"
    @cancel="handleCancel"
  >
    <h-form ref="VenueManageForm" v-if="visible" v-model="model" :formData="formData" @change="submitHandle"></h-form>
  </h-modal>
</template>

<script>
import moment from 'moment'
import { downloadFile, postAction, getFileAccessHttpUrl } from '@/api/manage'
export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  data() {
    return {
      moment,
      visible: false,
      confirmLoading: false,
      model: {},
      title: '数据登记',
      url: {
        add: '/HfResPlaceEnvBusiness/add',
        edit: '/HfResPlaceEnvBusiness/modifyById',
        detailById: '/HfResPlaceEnvBusiness/queryById',
      },
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          key: 'placeId',
          formType: 'input',
          hidden: true,
        },
        {
          title: '场地名称',
          key: 'placeName',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入场地名称' }],
          },
          disabled: true,
          span: 2,
        },
        {
          title: '登记时间',
          key: 'placeTime',
          span: 2,
          formType: 'datePick',
          validate: {
            rules: [{ required: true, message: '请选择登记时间' }],
          },
        },

        {
          title: '最高温度',
          key: 'temperatureMax',
          type: 'number',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入最高温度' }],
          },
          span: 2,
        },
        {
          title: '最低温度',
          key: 'temperatureMin',
          formType: 'input',
          type: 'number',
          validate: {
            rules: [{ required: true, validator: this.temperature }],
          },
          span: 2,
        },

        {
          title: '最高湿度',
          key: 'humidityMax',
          type: 'number',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入最高湿度' }],
          },
          span: 2,
        },
        {
          title: '最低湿度',
          key: 'humidityMin',
          type: 'number',
          formType: 'input',
          validate: {
            rules: [{ required: true, validator: this.humidity }],
          },
          span: 2,
        },
      ],
    }
  },
  methods: {
    show(record) {
      this.visible = true
      if (record.id) {
        this.loadDetail(record.id)
      } else {
        this.editor(record)
      }
    },
    loadDetail(id) {
      postAction(this.url.detailById, { id: id }).then((res) => {
        if (res.code == 200) {
          this.editor(res.data)
        }
      })
    },
    editor(record) {
      let obj = Object.assign({}, record)
      obj.placeTime = obj.placeTime && obj.placeTime != 0 ? moment(parseFloat(obj.placeTime)) : moment()
      this.model = obj
    },
    handleClickSubmit() {
      this.$refs.VenueManageForm.validateForm()
    },
    // 温度
    temperature(rule, values, cellback) {
      let temperature = this.$refs.VenueManageForm.form.getFieldsValue(['temperatureMax'])
      let valStart = temperature.temperatureMax
      let val = values ? values : ''
      valStart = valStart ? valStart : ''
      console.log(val, valStart)
      if (!val) {
        cellback('请选择最低温度')
      } else {
        if (valStart && parseInt(val) > parseInt(valStart)) {
          cellback('最低温度不能大于最高温度')
        } else {
          cellback()
        }
      }
    },
    // 湿度
    humidity(rule,value,cb) {
      let humidity = this.$refs.VenueManageForm.form.getFieldsValue(['humidityMax'])
      let valStart = humidity.humidityMax
      let val = value ? value : ''
      valStart = valStart ? valStart : ''
      console.log(val, valStart)
      if (!val) {
        cb('请选择最低湿度')
      } else {
        if (valStart && parseInt(val) > parseInt(valStart)) {
          cb('最低湿度不能大于最高湿度')
        } else {
          cb()
        }
      }
    },
    // 提交
    submitHandle(values) {
      if (this.confirmLoading) return
      this.confirmLoading = false
      let params = {
        ...values,
      }
      let url = null
      if (params.id) {
        url = this.url.edit
      } else {
        url = this.url.add
      }
      params.placeTime = params.placeTime && params.placeTime != 0 ? params.placeTime.valueOf() : ''
      params.temperatureMin = params.temperatureMin ? params.temperatureMin * 10000 : ''
      params.temperatureMax = params.temperatureMax ? params.temperatureMax * 10000 : ''
      params.humidityMax = params.humidityMax ? params.humidityMax * 10000 : ''
      params.humidityMin = params.humidityMin ? params.humidityMin * 10000 : ''
      postAction(url, params).then((res) => {
        if (res.code == 200) {
          this.$message.success(this.title + '成功')
          this.$emit('change', true)
          this.handleCancel()
        }
      })
    },
    acceptUserChange(val, option) {
      this.$refs.VenueManageForm.form.setFieldsValue({ checkUserName: option.idName })
    },
    handleCancel(e) {
      this.visible = false
      this.model = {}
    },
    handleDownload(filePath, fileName) {
      let fileAccessUrl = getFileAccessHttpUrl(filePath)
      downloadFile(fileAccessUrl, fileName)
    },
  },
}
</script>

<style lang='less' scoped>
</style>