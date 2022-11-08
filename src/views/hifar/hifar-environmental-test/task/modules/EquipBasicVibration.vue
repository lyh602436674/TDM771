<!--
 * @Author: 马潭龙
 * @Date: 2021-11-26 18:36:50
 * @LastEditTime: 2021-11-29 14:31:48
 * @LastEditors: 马潭龙
 * @Descripttion: 实验记录弹窗
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\EquipBasicVibration.vue
-->
<template>
  <h-modal
    inner
    :title="title"
    :visible="visible"
    destroyOnClose
    width="70%"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <vibration ref="vibration" v-if="typeCode == 'vibration'" :record="this.record"></vibration>
    <humiture ref="humiture" v-else-if="typeCode == 'humiture'" :record="this.record"></humiture>
    <a-empty v-else></a-empty>
  </h-modal>
</template>

<script>
import moment from 'moment'
import vibration from '../modules/testRecord/Vibration.vue'
import humiture from '../modules/testRecord/Humiture.vue'
import { postAction } from '@/api/manage'
export default {
  components: {
    vibration,
    humiture,
  },
  data() {
    return {
      title: '',
      visible: false,
      record:{},
      model: {},
      typeCode: '',
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '开始时间',
          key: 'optTime',
          validate: { rules: [{ required: true, message: '请设置试验开始时间' }] },
          component: (
            <h-time-select v-decorator={['optTime', { rules: [{ required: true, message: '请设置试验开始时间' }] }]} />
          ),
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
        },
      ],
      url: {
        start: '/HfEnvTaskTestBusiness/start',
      },
    }
  },
  methods: {
    show(record) {
      this.record=record
      this.model = Object.assign({}, record)
      this.typeCode = record.typeCode
      this.title = record.typeName + '实验记录'
      this.model.optTime = moment()
      this.$nextTick(() => {
        this.visible = true
      })
    },
    handleCancel() {
      this.visible = false
    },
    handleSubmit() {
      if(this.typeCode=='vibration'){
        this.$refs.vibration.handleSubmit()
        this.visible=false
      }else{
        this.$refs.humiture.handleEnsureCheckEnsure()
        this.visible=false
      }
    },
    submitForm(values) {
      let params = {
        ...values,
      }
      params.optTime = params.optTime.valueOf()
      postAction(this.url.start, params).then((res) => {
        if (res.code == 200) {
          this.handleCancel()
          this.$emit('change', this.type, params)
        }
      })
    },
  },
}
</script>

<style>
</style>