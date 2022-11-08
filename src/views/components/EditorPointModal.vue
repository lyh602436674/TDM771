<!--
 * @Author: 赵峰
 * @Date: 2021-09-15 16:15:08
 * @LastEditTime: 2021-09-15 16:16:52
 * @LastEditors: 赵峰
 * @Descripttion: 指标项选择弹窗
 * @FilePath: \hifar-platform-client\src\views\components\EditorPointModal.vue
-->
<template>
  <h-modal
    destroyOnClose
    inner
    fullScreen
    :title="title"
    :width="600"
    :visible="visible"
    :getContainer="getContainer"
    @submit="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form ref="editorPointForm" :form="form" @submit="handleSubmit" class="groupStyle">
      <a-form-item v-for="(item, index) in dataList" :key="item.conditonType">
        <editor-form-item
          v-decorator="item.decorator"
          :item="item"
          :index="index"
          @selectHandle="selectHandle"
        ></editor-form-item>
      </a-form-item>
    </a-form>
  </h-modal>
</template>

<script>
import moment from 'moment'
import EditorFormItem from './modules/EditorFormItem.vue'
export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  components: { EditorFormItem },
  data() {
    return {
      moment,
      form: null,
      title: '选择指标',
      visible: false,
      pointValue: {},
      conditonType: null,
      selectIndex: null,
      dataList: [
        {
          label: '1、不判读',
          inputKeys: ['minValue'],
          radio: false,
          hidden: true,
          conditonType: 'A01',
          decorator: [
            'A01',
            {
              initialValue: {
                minValue: 0,
              },
              rules: [
                {
                  validator: (rule, value, callback) => {
                    console.log(value)
                    if (!value) {
                      callback()
                      return
                    }
                    if (!value.radio) {
                      callback()
                      return
                    }
                    if (!value.minValue) {
                      callback('请输入正确的值')
                    } else {
                      callback()
                    }
                  },
                },
              ],
            },
          ],
        },
        {
          label: '2、> 大于',
          inputKeys: ['minValue'],
          radio: false,
          conditonType: 'A02',
          decorator: [
            'A02',
            {
              rules: [
                {
                  validator: (rule, value, callback) => {
                    if (!value) {
                      callback()
                      return
                    }
                    if (!value.radio) {
                      callback()
                      return
                    }
                    if (!value.minValue) {
                      callback('请输入正确的值')
                    } else {
                      callback()
                    }
                  },
                },
              ],
            },
          ],
        },
        {
          label: '3、>= 大于等于',
          inputKeys: ['minValue'],
          radio: false,
          conditonType: 'A03',
          decorator: [
            'A03',
            {
              rules: [
                {
                  validator: (rule, value, callback) => {
                    if (!value) {
                      callback()
                      return
                    }
                    if (!value.radio) {
                      callback()
                      return
                    }
                    if (!value.minValue) {
                      callback('请输入正确的值')
                    } else {
                      callback()
                    }
                  },
                },
              ],
            },
          ],
        },
        {
          label: '4、< 小于',
          inputKeys: ['maxValue'],
          radio: false,
          conditonType: 'A04',
          decorator: [
            'A04',
            {
              rules: [
                {
                  validator: (rule, value, callback) => {
                    if (!value) {
                      callback()
                      return
                    }
                    if (!value.radio) {
                      callback()
                      return
                    }
                    if (!value.maxValue) {
                      callback('请输入正确的值')
                    } else {
                      callback()
                    }
                  },
                },
              ],
            },
          ],
        },
        {
          label: '5、<= 小于等于',
          inputKeys: ['maxValue'],
          radio: false,
          conditonType: 'A05',
          decorator: [
            'A05',
            {
              rules: [
                {
                  validator: (rule, value, callback) => {
                    if (!value) {
                      callback()
                      return
                    }
                    if (!value.radio) {
                      callback()
                      return
                    }
                    if (!value.maxValue) {
                      callback('请输入正确的值')
                    } else {
                      callback()
                    }
                  },
                },
              ],
            },
          ],
        },
        {
          label: '6、= 等于',
          inputKeys: ['minValue'],
          radio: false,
          conditonType: 'A06',
          decorator: [
            'A06',
            {
              rules: [
                {
                  validator: (rule, value, callback) => {
                    if (!value) {
                      callback()
                      return
                    }
                    if (!value.radio) {
                      callback()
                      return
                    }
                    if (!value.minValue) {
                      callback('请输入正确的值')
                    } else {
                      callback()
                    }
                  },
                },
              ],
            },
          ],
        },
        {
          label: '7、≠ 不等于',
          inputKeys: ['minValue'],
          radio: false,
          conditonType: 'A07',
          decorator: [
            'A07',
            {
              rules: [
                {
                  validator: (rule, value, callback) => {
                    if (!value) {
                      callback()
                      return
                    }
                    if (!value.radio) {
                      callback()
                      return
                    }
                    if (!value.minValue) {
                      callback('请输入正确的值')
                    } else {
                      callback()
                    }
                  },
                },
              ],
            },
          ],
        },
        {
          label: '8、介于两个值之间 min < value < max',
          inputKeys: ['minValue', 'maxValue'],
          radio: false,
          conditonType: 'A08',
          decorator: [
            'A08',
            {
              rules: [
                {
                  validator: (rule, value, callback) => {
                    if (!value) {
                      callback()
                      return
                    }
                    if (!value.radio) {
                      callback()
                      return
                    }
                    if (!value.minValue || !value.maxValue) {
                      callback('请输入正确的值')
                    } else {
                      callback()
                    }
                  },
                },
              ],
            },
          ],
        },
        {
          label: '9、介于两个值之间 min < value <= max',
          inputKeys: ['minValue', 'maxValue'],
          radio: false,
          conditonType: 'A09',
          decorator: [
            'A09',
            {
              rules: [
                {
                  validator: (rule, value, callback) => {
                    if (!value) {
                      callback()
                      return
                    }
                    if (!value.radio) {
                      callback()
                      return
                    }
                    if (!value.minValue || !value.maxValue) {
                      callback('请输入正确的值')
                    } else {
                      callback()
                    }
                  },
                },
              ],
            },
          ],
        },
        {
          label: '10、介于两个值之间 min <= value < max',
          inputKeys: ['minValue', 'maxValue'],
          radio: false,
          conditonType: 'A10',
          decorator: [
            'A10',
            {
              rules: [
                {
                  validator: (rule, value, callback) => {
                    if (!value) {
                      callback()
                      return
                    }
                    if (!value.radio) {
                      callback()
                      return
                    }
                    if (!value.minValue || !value.maxValue) {
                      callback('请输入正确的值')
                    } else {
                      callback()
                    }
                  },
                },
              ],
            },
          ],
        },
        {
          label: '11、介于两个值之间 min <= value <= max',
          inputKeys: ['minValue', 'maxValue'],
          radio: false,
          conditonType: 'A11',
          decorator: [
            'A11',
            {
              rules: [
                {
                  validator: (rule, value, callback) => {
                    if (!value) {
                      callback()
                      return
                    }
                    if (!value.radio) {
                      callback()
                      return
                    }
                    if (!value.minValue || !value.maxValue) {
                      callback('请输入正确的值')
                    } else {
                      callback()
                    }
                  },
                },
              ],
            },
          ],
        },
        {
          label: '12、± 标准质量',
          inputKeys: ['minValue', 'maxValue'],
          radio: false,
          conditonType: 'A12',
          decorator: [
            'A12',
            {
              rules: [
                {
                  validator: (rule, value, callback) => {
                    if (!value) {
                      callback()
                      return
                    }
                    if (!value.radio) {
                      callback()
                      return
                    }
                    if (!value.minValue || !value.maxValue) {
                      callback('请输入正确的值')
                    } else {
                      callback()
                    }
                  },
                },
              ],
            },
          ],
        },
      ],
    }
  },
  methods: {
    show(record) {
      this.pointValue = record
      this.form = this.$form.createForm(this, { name: 'editorPointForm' })
      this.$nextTick(() => {
        this.visible = true
      })
    },
    selectHandle(val) {
      let conditonType = val.conditonType
      let index = val.index
      this.conditonType = conditonType
      this.selectIndex = index
      this.form.resetFields()
      this.dataList.forEach((item) => {
        item.radio = false
      })
      this.dataList[index].radio = true
    },
    handleCancel() {
      this.visible = false
    },
    conditionTypeDescHandle(conditonType, min, max, standardValue, strValue) {
      let conditionTypeDesc = ''
      if (conditonType == 'A01') {
        conditionTypeDesc = '不判读'
      } else if (conditonType == 'A02') {
        conditionTypeDesc = '大于：value >' + min
      } else if (conditonType == 'A03') {
        conditionTypeDesc = '大于等于：value >=' + min
      } else if (conditonType == 'A04') {
        conditionTypeDesc = '小于：value <' + max
      } else if (conditonType == 'A05') {
        conditionTypeDesc = '小于等于：value <=' + max
      } else if (conditonType == 'A06') {
        conditionTypeDesc = '等于：value =' + min
      } else if (conditonType == 'A07') {
        conditionTypeDesc = '不等于：value !=' + min
      } else if (conditonType == 'A08') {
        conditionTypeDesc = '介于两者之间：' + min + '< value < ' + max
      } else if (conditonType == 'A09') {
        conditionTypeDesc = '介于两者之间：' + min + '< value <= ' + max
      } else if (conditonType == 'A10') {
        conditionTypeDesc = '介于两者之间：' + min + '<= value < ' + max
      } else if (conditonType == 'A11') {
        conditionTypeDesc = '介于两者之间：' + min + '<= value <= ' + max
      } else if (conditonType == 'A12') {
        conditionTypeDesc = '标准值：' + standardValue + '，± ' + min
      } else {
        conditionTypeDesc = strValue
      }
      return conditionTypeDesc
    },
    handleSubmit() {
      let valuesArr = []
      this.form.validateFields((err, values) => {
        if (!err) {
          for (let key in values) {
            valuesArr.push({
              name: key,
              val: values[key],
            })
          }
          if (this.selectIndex == null) {
            this.$message.error('请选择指标项!')
          } else {
            let pointValue = valuesArr[this.selectIndex]
            let paramsVal = {
              ...this.pointValue,
            }

            paramsVal.conditonType = pointValue.name
            paramsVal.minValue = pointValue.val.minValue ? pointValue.val.minValue : 0
            paramsVal.maxValue = pointValue.val.maxValue ? pointValue.val.maxValue : 0
            paramsVal.standardValue = pointValue.name == 'A12' ? pointValue.val.maxValue : 0
            paramsVal.strValue = ''

            paramsVal.conditionTypeDesc = this.conditionTypeDescHandle(
              paramsVal.conditonType,
              paramsVal.minValue,
              paramsVal.maxValue,
              paramsVal.standardValue,
              paramsVal.strValue
            )
            if (paramsVal.conditonType == 'A12') {
              paramsVal.maxValue = 0
            }
            this.$emit('change', paramsVal)
            this.dataList[this.selectIndex].radio = false
            this.handleCancel()
          }
        }
      })
    },
  },
}
</script>
<style lang='less' scoped>
.groupStyle {
  margin: 10px 30px;
}
/deep/ .ant-form-item {
  margin-bottom: 5px;
}
/deep/ .ant-form-item-control-wrapper .ant-form-item-control .ant-form-explain {
  position: absolute;
  top: 37px;
  right: 0;
}
</style>