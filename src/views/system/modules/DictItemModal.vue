<template>
  <h-modal
    destroyOnClose
    :title="title"
    :width="600"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @submit="handleOk"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <h-form v-model="model" ref="dictItemForm" :column="1" :width="600" :formData="formData" @change="submit"></h-form>
  </h-modal>
</template>

<script>
import { addDictItem, editDictItem } from '@/api/api'

export default {
  name: 'DictItemModal',
  data() {
    return {
      title: '操作',
      visible: false,
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          key: 'dictId',
          formType: 'input',
          hidden: true,
        },
        {
          title: '键值',
          key: 'itemKey',
          formType: 'input',
          validate: { rules: [{ required: true, message: '请输入名称!' }] },
        },
        {
          title: '数据值',
          key: 'itemValue',
          formType: 'input',
          validate: { rules: [{ required: true, message: '请输入数据值!' }, { validator: this.validateItemValue }] },
        },
        {
          title: '排序',
          key: 'rowSort',
          formType: 'input',
          validate: { initialValue: 1 },
        },
        {
          title: '描述',
          key: 'itemDesc',
          formType: 'textarea',
        },
        {
          title: '系统参数',
          key: 'isSys',
          component: <h-switch v-decorator={['isSys', { initialValue: 1 }]} options={[1, 2]} />,
        },
        {
          title: '是否启用',
          key: 'status',
          component: <h-switch v-decorator={['status', { initialValue: 1 }]} options={[1, 2]} />,
        },
      ],
      model: {},
      dictId: '',
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      confirmLoading: false,
    }
  },
  created() {},
  methods: {
    add(dictId) {
      this.edit({ dictId })
    },
    edit(record) {
      this.model = Object.assign({}, record)
      console.log(this.model)
      this.visible = true
    },
    submit(values) {
      if (this.confirmLoading) return
      this.confirmLoading = true
      values.itemKey = (values.itemKey || '').trim()
      values.itemValue = (values.itemValue || '').trim()
      values.itemDesc = (values.itemDesc || '').trim()
      let obj
      if (!values.id) {
        obj = addDictItem(values)
      } else {
        obj = editDictItem(values)
      }
      obj
        .then((res) => {
          if (res.code == 200) {
            this.$message.success(this.title + '成功')
            this.$emit('ok')
            this.close()
          }
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    // 确定
    handleOk() {
      this.$refs.dictItemForm.validateForm()
    },
    // 关闭
    handleCancel() {
      this.close()
    },
    close() {
      this.$emit('close')
      this.visible = false
    },
    validateItemValue(rule, value, callback) {
      let param = {
        itemValue: value,
        dictId: this.dictId,
      }
      if (this.model.id) {
        param.id = this.model.id
      }
      if (value) {
        let reg = new RegExp("[`_@#${}'<>《》￥（）—【】‘；：”“。？]")
        if (reg.test(value)) {
          callback('数据值不能包含特殊字符！')
        } else {
          //update--begin--autor:lvdandan-----date:20201203------for：JT-27【数据字典】字典 - 数据值可重复
          // getAction("/sys/dictItem/dictItemCheck",param).then((res)=>{
          //   if(res.success){
          //     callback()
          //   }else{
          //     callback(res.message);
          //   }
          // });
          //update--end--autor:lvdandan-----date:20201203------for：JT-27【数据字典】字典 - 数据值可重复
          callback()
        }
      } else {
        callback()
      }
    },
  },
}
</script>
