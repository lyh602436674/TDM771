<template>
  <h-modal
     title="修改历史采集"
    :visible="visible"
    :getContainer="getContainer"
    inner
    destoryOnClose
    @submit="handleSubmit"
    @cancel="handleCancel"
  >
    <h-card  style="margin-top: 10px">
      <h-form
        slot="content"
        v-if="visible"
        ref="equipmentForm"
        v-model="historyRecord"
        :formData="formData"
        @change="handleClickSubmit"
      ></h-form>
    </h-card>
  </h-modal>
</template>
<script>
import { postAction } from '@api/manage'

export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  data() {
    return {
      record: {},
      visible: false,
      historyRecord: {},
      formData: [
        {
          key: 'tagid',
          formType: 'input',
          span: 12,
          hidden: true,
        },
        {
          key: 'tablename',
          formType: 'input',
          span: 12,
          hidden: true,
        },
        {
          title: '采集时间',
          formType: 'input',
          key: 'timestamp',
          span: 12,
          disabled:true
          // validate: {
          //   rules: [{required: true, message: '请输入设备名称'}],
          // },
        },
        {
          title: '采集温度',
          formType: 'input',
          key: 'tagvalue',
          span: 12,
          // validate: {
          //   rules: [{required: true, message: '请输入设备编号'}],
          // },
        },
      ],
      url: {
        save: '/HfResHistroyTemperauter/saveHistoryTemperature'
      },
    }
  },
  methods: {


    show(record) {
      console.log(record)
      this.visible = true
      this.historyRecord = record
    },
    handleCancel(e) {
      this.visible = false
      this.activeKey = '1'
    },
    handleSubmit(){
      this.$refs.equipmentForm.validateForm()
    },
    handleClickSubmit(values){
      console.log(">>>>>>",values)
      postAction(this.url.save,values).then((res) => {
        if (res.code == 200) {
          this.$message.success('保存成功')
         this.visible=false
          this.$emit("change",true)
        }
      })}
  }
}
</script>