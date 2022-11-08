/*
 * @Author: 陈乾龙
 * @Date: 2021-07-21 11:03:06
 * @LastEditTime: 2021-11-19 17:17:46
 * @LastEditors: 马潭龙
 * @Description: 自动生成form表单弹窗
 * @FilePath: \hifar-platform-client\src\components\HFormModal\form.js
 */
import "./hForm.less"
import {formMixin} from "../_util/formMixin"
import {find, isFunction} from "lodash"

export default {
  props: {
    /**
     * @Date: 2021-07-21 11:04:18
     * @Author: 陈乾龙
     * @description: 表单属性列表
     * {
     *    formType:"",        // 表单类型，input, datePick, dateRangePick, select, dict
     *    span:"",            // 行合并
     *    title:"",           // 表单组件title
     *    key:"",             // 表单组件key
     *    validate:{},        // 校验和基本配置，参考ant-design form表单校验配置
     *    hidden:{},          // 表单组件是否隐藏
     *    size:"",            // 表单组件的size，small,default,large
     *    placeholder:"",     // 表单组件为空时的占位符
     *    style:{},           // 表单组件的css
     *    dictCode:"",           // 表单组件字典code
     *    radioType:"",           // 表单组件单选框类型 radioText | radioButton
     * }
     */
    formData: {
      type: Array,
      default: () => []
    },
    value: {
      type: Object,
      default: () => {
      }
    },
    // 弹窗宽度
    width: {
      type: Number
    },
    // 弹窗模式，是否是详情页弹窗
    isDetail: {
      type: Boolean,
      default: false
    },
    // form表单分列
    column: {
      type: Number,
      default: 2
    },
    dictCode: {
      type: String,
      default: ''
    },
    radioType: {
      type: String,
      default: 'radioText'
    },
    autoFocusItem: {
      type: String,
      default: ''
    }
  },
  mixins: [formMixin],
  data() {
    return {
      form: null,
      fieldKeys: [],
      model: Object.assign({}, this.value) || {},
      // formData中最长的title长度
      maxTitleLength: 0,
      isopen: false,
      timeValue: ''
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.form = null
        console.log('HForm data change:', val)
        this.initForm(val)
      }
    },
    formData: {
      immediate: true,
      handler(val) {
        console.log('formDataChange:', val)
        this.form = null
        this.initForm()
      }
    }
  },
  created() {
    this.init()
    // 自动聚焦
    this.$nextTick(() => {
      let focusItem = [].filter.call(this.$el, item => item.getAttribute('id') === this.autoFocusItem)[0]
      focusItem && focusItem.focus()
    })
  },
  methods: {
    init() {
      this.createFieldKeys()
      this.calcuWidth()
      this.initForm(this.model)
    },
    triggleChange() {
      this.$emit('onValueChange', this.form.getFieldsValue())
    },
    validateForm() {
      this.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          console.log("表单校验释放出去的值", values)
          this.$emit('change', values)
        }
      })
    },
    // 重新计算对应formItem的宽度
    calcuWidth() {
      // 计算单个formItem的宽度
      this.itemWidth = this.width / this.column - 24
      // 计算label的宽度，默认是fontSize 14px下单个文本的宽度
      this.labelWidth = this.maxTitleLength * 14
    },
    renderFormItem(h) {
      if (!this.formData.length) {
        return null
      }
      return this.formData.map(item => {
        let __itemWidth = this.itemWidth;
        if (item.span && item.span > 1) {
          if (!this.width) {
            __itemWidth = `${(100 / this.column) * item.span}%`
          } else {
            __itemWidth = ` ${this.itemWidth * item.span}px`
          }
        } else {
          if (!this.width) {
            __itemWidth = `${100 / this.column}%`
          } else {
            __itemWidth = ` ${this.itemWidth}px`
          }
        }
        let required = false
        if (item.validate && item.validate.rules && item.validate.rules.length) {
          required = !!find(item.validate.rules, (obj) => obj.required)
        }
        return (
          <a-form-item class={'h-form-item' + ` ${required ? 'h-form-item-required' : ''}`} vShow={!item.hidden}
                       style={{width: __itemWidth}}>
            <span class="h-form-label" style={{width: this.labelWidth + 'px'}}>
              {item.title}
            </span>
            <div class="h-form-wrapper">
              {this.renderFormItemComponent(item)}
            </div>
          </a-form-item>
        )
      })
    },
    renderFormItemComponent(com) {
      if (com.component) {
        return this.renderCustomComponent(com)
      }
      switch (com.formType) {
        case 'input':
          let addonBefore = null, addonAfter = null;
          if (com.addonBefore) {
            addonBefore = h('span', {slot: 'addonBefore'}, com.addonBefore)
          }
          if (com.addonAfter) {
            addonAfter = h('span', {slot: 'addonAfter'}, com.addonAfter)
          }
          return h('h-input', {
            props: {
              placeholder: com.placeholder || '请输入',
              disabled: com.disabled || false,
              type: com.type || "",
              readOnly: com.readOnly || false
            },
            directives: [{
              name: 'decorator',
              value: [com.key, com.validate || {}]
            }],
            on: {
              change: (v) => {
                if (isFunction(com.change)) {
                  com.change(v)
                } else {
                  let data = {}
                  data[com.key] = v
                  this.form.setFieldsValue(data)
                  this.triggleChange()
                }
              },
              blur: (e) => {
                if (isFunction(com.blur)) {
                  com.blur(e)
                }
              },
              keyup: (e) => {
                if (isFunction(com.keyup)) {
                  com.keyup(e)
                }
              },
              click: (e) => {
                if (isFunction(com.click)) {
                  com.click(e)
                }
              },
            },
            style: com.style,
          }, [addonBefore, addonAfter])
        case 'input-number':
          return h('a-input-number', {
            props: {
              placeholder: com.placeholder || '请输入',
              disabled: com.disabled || false,
              min: com.min || undefined,
              max: com.max || undefined,
              step: com.step || 1,
            },
            directives: [{
              name: 'decorator',
              value: [com.key, com.validate || {}]
            }],
            on: {
              change: (v) => {
                if (isFunction(com.change)) {
                  com.change(v)
                } else {
                  let data = {}
                  data[com.key] = v
                  this.form.setFieldsValue(data)
                  this.triggleChange()
                }
              }
            },
            style: com.style,
          }, [addonBefore, addonAfter])
        case 'select':
          return this.$createElement('a-select', {
            props: {
              disabled: com.disabled,
              mode: com.multiple ? 'multiple' : 'default',
              placeholder: com.placeholder || '请选择',
              options: com.options,
              allowClear: com.allowClear || true
            },
            style: com.style,
            on: {
              change: (v, option) => {
                if (isFunction(com.change)) {
                  com.change(v, option)
                }
                let data = {}
                data[com.key] = v
                this.form.setFieldsValue(data)
                this.triggleChange()
              }
            },
            directives: [{
              name: 'decorator',
              value: [com.key, com.validate || {}]
            }],
          })
        case 'textarea':
          return (
            <a-textarea onchange={(v) => {
              if (isFunction(com.change)) {
                com.change(v)
              } else {
                let data = {}
                data[com.key] = v
                this.form.setFieldsValue(data)
                this.triggleChange()
              }
            }} autoSize={com.autoSize} rows={com.rows} placeholder={com.placeholder || '请输入'} disabled={com.disabled}
                        readOnly={com.readOnly} maxLength={com.maxLength}
                        style={com.style} vDecorator={[com.key, com.validate || {}]}/>
          )
        case 'dict':
          return (
            <h-dict-select dictCode={com.dictCode} onchange={(v, option) => {
              if (isFunction(com.change)) {
                com.change(v, option)
              } else {
                let data = {}
                data[com.key] = v
                this.form.setFieldsValue(data)
                this.triggleChange()
              }
            }} disabled={com.disabled} vDecorator={[com.key, com.validate || {}]}/>
          )
        case 'radio':
          return (
            <h-radio radioType={com.radioType} onchange={(v) => {
              if (isFunction(com.change)) {
                com.change(v)
              } else {
                let data = {}
                data[com.key] = v
                this.form.setFieldsValue(data)
                this.triggleChange()
              }
            }} defaultValue={com.defaultValue} disabled={com.disabled} options={com.options}
                     vDecorator={[com.key, com.validate || {}]}/>
          )
        case 'switch':
          return (
            <h-switch options={com.options} checkedTxt={com.checkedTxt} uncheckedTxt={com.uncheckedTxt}
                      defaultChecked={com.defaultChecked} onchange={com.change || this.triggleChange}
                      disabled={com.disabled} vDecorator={[com.key, com.validate || {}]}/>
          )
        case 'text':
          return h('div', {
            style: Object.assign({}, {
              lineHeight: "34px"
            }, com.style),
          }, this.model[com.key])
        case 'datePick':
          return this.renderDataPick(com)
        case 'yearPick':
          let _this = this
          return h('a-date-picker', {
            props: {
              placeholder: com.placeholder || '请选择年份',
              disabled: com.disabled || false,
              type: com.type || "",
              mode: 'year',
              format: "YYYY",
              open: _this.isopen
            },
            style: Object.assign({}, {
              width: '100%'
            }, com.style),
            on: {
              openChange: (status) => {
                if (status) {
                  _this.isopen = true
                } else {
                  _this.isopen = false
                }

                console.log(_this.isopen)
              },
              panelChange: (v) => {
                _this.isopen = false
                let value = {}
                value[com.key] = v
                this.form.setFieldsValue(value)
              }
            },
            directives: [{
              name: 'decorator',
              value: [com.key, com.validate || {}]
            }],

          }, [])
      }
    },
    renderDataPick(com) {
      return this.$createElement('a-date-picker', {
        props: {
          placeholder: com.placeholder || '请选择时间',
          disabled: com.disabled,
          format: com.format || 'YYYY-MM-DD',
          showTime: com.showTime || false
        },
        style: Object.assign({}, com.style, {width: '100%'}),
        directives: [{
          name: "decorator",
          value: [com.key, com.validate]
        }],
        on: {
          change: (v) => {
            if (isFunction(com.change)) {
              com.change(v)
            }
            this.triggleChange()
          }
        }
      })
    },
    renderCustomComponent(obj) {
      /**
       * @Date: 2021-07-21 18:21:16
       * @Author: 陈乾龙
       * @description: 这里只是对自定义组件简单返回，后面需要配置成slot，支持自定义form组件
       */

        // return obj.component
      let options = {}
      if (obj.validate) {
        options.directives = [
          {
            name: 'decorator',
            value: [obj.key, obj.validate || {}]
          }
        ]
        obj.component.data = Object.assign(obj.component.data, options)
      }
      if (obj.component.data.attrs) {
        obj.component.data.attrs['placeholder'] = obj.placeholder || ''
      }
      return obj.component
    },
    createFieldKeys() {
      let fieldKeys = []
      for (let i = 0, len = this.formData.length; i < len; i++) {
        fieldKeys.push(this.formData[i].key)
        // 如果是隐藏的form 组件，则不计算对应title
        if (this.formData[i].title && !this.formData[i].hidden) {
          // 因为中文汉字和英文像素大小不一样，所以这里认为汉字为1字符长度,英文为0.5字符长度
          let titleLen = this.strlen(this.formData[i].title)
          this.maxTitleLength = titleLen > this.maxTitleLength ? titleLen + 1 : this.maxTitleLength
        }
      }
      this.fieldKeys = fieldKeys
    }
  },
  render(h) {
    return (
      <a-form class='h-form' form={this.form}>
        {this.renderFormItem(h)}
      </a-form>
    )
  }
}