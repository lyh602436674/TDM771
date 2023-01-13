<template>
  <h-modal
    :getContainer="getContainer"
    :title="titleMap[type]"
    :visible="visible"
    :width="800"
    destroyOnClose
    inner
    @cancel="handleCancel"
  >
    <template slot="footer">
      <a-button type="ghost-danger" @click="handleCancel"> 关闭</a-button>
      <a-button :loading="submitLoading" type="primary" @click="handleSave">保存</a-button>
    </template>
    <h-form
      v-if="['add','edit'].includes(type)"
      ref="alarmInfoForm"
      v-model="model"
      :column="1"
      :formData="formData"
      @change="handleSubmit"
    ></h-form>
    <h-desc v-if="type === 'detail'" :column="1" :data="model">
      <h-desc-item v-for="item in formData" :key="item.key" :label="item.title">{{ model[item.key] }}</h-desc-item>
    </h-desc>
  </h-modal>
</template>

<script>
import {postAction} from "@api/manage";
import moment from 'moment'

export default {
  name: "AlarmInfoModal",
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  props: {
    equipId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      moment,
      visible: false,
      submitLoading: false,
      model: {
        add: "/HfResDeviceWarningBusiness/add",
        edit: "/HfResDeviceWarningBusiness/modifyById",
      },
      type: 'add',
      url: {},
      formData: [
        {
          title: "报警时间",
          formType: "datePick",
          key: 'warningTime',
          showTime: true,
          validate: {
            rules: [{required: true, message: '请选择报警时间'}],
          },
        },
        {
          title: "报警内容",
          formType: "textarea",
          key: 'contentWarning',
          validate: {
            rules: [{required: true, message: '请输入报警内容'}],
          },
        },
        {
          title: "备注",
          formType: "textarea",
          key: 'remarks',
        },
      ],
      titleMap: {
        add: "新增",
        detail: "详情",
        edit: "编辑",
      }
    }
  },
  methods: {
    add(record, type) {
      this.type = type
      this.model = record
      this.visible = true
    },
    detail(record) {
      this.type = 'detail'
      this.model = Object.assign(this.model, record, {
        warningTime: record.warningTime && +record.warningTime !== 0 ? moment(+record.warningTime).format('YYYY-MM-DD HH:mm:ss') : undefined
      })
      this.visible = true
    },
    handleSave() {
      this.$refs.alarmInfoForm.validateForm()
    },
    handleSubmit(value) {
      let url = ''
      if (value.id) {
        url = this.url.edit
      } else {
        url = this.url.add
      }
      let params = Object.assign({}, value, {
        warningTime: value.warningTime.valueOf()
      })
      postAction(this.url, params).then(res => {
        if (res.code === 200) {
          this.$messages.success(this.type === 'add' ? '新增成功' : '修改成功')
        } else {
          this.$message.warning(res.msg)
        }
      })
    },
    handleCancel() {
      this.visible = false
      this.model = {}
    },
  },
}
</script>

<style scoped>

</style>