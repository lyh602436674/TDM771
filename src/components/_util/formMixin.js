/*
 * @Author: 陈乾龙
 * @Date: 2021-06-11 09:52:30
 * @LastEditTime: 2021-08-09 17:17:07
 * @LastEditors: 陈乾龙
 * @Description: 自定义form组件的通用方法
 * @FilePath: \hifar-platform-client\src\components\_util\formMixin.js
 */
import { pick } from 'lodash'
export const formMixin = {
  data() {
    return {
    }
  },
  methods: {
    initForm(record = {}) {
      this.model = Object.assign({}, this.model, record)
      if (this.form) {
        this.form.resetFields()
        this.fieldKeys.map((key) => {
          this.form.getFieldDecorator(key)
        })
        this.form.setFieldsValue(pick(this.model, this.fieldKeys))
        // console.log('form is exist:', this.form.getFieldsValue(this.fieldKeys))
      } else {
        this.form = this.$form.createForm(this, {
          mapPropsToFields: () => {
            let fields = {}
            this.fieldKeys.map((key) => {
              key = key.trim()
              fields[key] = this.$form.createFormField({
                value: this.model[key] || undefined,
              })
            })
            return fields
          }
        })
        // console.log('form is not exist', this.form.getFieldsValue(this.fieldKeys))
      }
    },
    strlen(str) {
      var len = 0;
      for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        //单字节加1   
        if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
          len += 1;
        }
        else {
          len += 1.5;
        }
      }
      return len;
    }
  }
}
export default {
  methods: {

    renderWrapperClass(size) {
      let domClass = [this.preCls + '-wrapper']
      let keys = Object.keys(this.$slots)
      if (!!size) {
        domClass.push(this.preCls + '-' + size)
      } else {
        domClass.push(this.preCls + '-default')
      }
      if (keys.includes('addonBefore')) {
        domClass.push(this.preCls + '-addonBefore')
      }
      if (keys.includes('addonAfter')) {
        domClass.push(this.preCls + '-addonAfter')
      }
      return domClass.join(" ")
    }
  },
}