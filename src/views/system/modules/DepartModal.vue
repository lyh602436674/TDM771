<!--
 * @Author: 陈乾龙
 * @Date: 2021-07-14 09:37:41
 * @LastEditTime: 2021-10-21 15:58:54
 * @LastEditors: 陈乾龙
 * @Description: 
 * @FilePath: \hifar-platform-client\src\views\system\modules\DepartModal.vue
-->
<template>
  <h-form-modal ref="departModal" :column="1" :formData="formData" @onOk="handleSubmit"></h-form-modal>
</template>

<script>
import { addDepart, editDepart } from '@/api/api'
import { pick, isArray, isString } from 'lodash'
import departMixin from './departMixin'
export default {
  name: 'SysDepartModal',
  mixins: [departMixin],
  data() {
    return {}
  },
  methods: {
    add(pid) {
      let depart = {}
      if (!pid) {
        depart.pid = undefined
      } else {
        if (isArray(pid)) {
          depart.pid = pid.join(',')
        } else if (isString(pid)) {
          depart.pid = pid
        }
      }
      this.edit(depart)
    },
    edit(record = {}) {
      this.$refs.departModal.show(Object.assign({}, record, pick(record, this.fieldKeys)))
    },
    close() {
      this.$refs.departModal.close()
    },
    async handleSubmit(values) {
      let params = {
        ...values,
      }
      let res = null
      console.log('>>>>>>', values)
      if (params.id) {
        res = await editDepart(params)
      } else {
        res = await addDepart(params)
      }
      if (res.code == 200) {
        this.$message.success(this.title + '成功')
        this.$emit('ok', true)
        this.close()
      }
    },
    handleCancel() {
      this.close()
    },
    validateMobile(rule, value, callback) {
      if (!value || new RegExp(/^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/).test(value)) {
        callback()
      } else {
        callback('您的手机号码格式不正确!')
      }
    },
  },
}
</script>