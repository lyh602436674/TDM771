/*
 * @Author: 陈乾龙
 * @Date: 2021-07-21 11:03:06
 * @LastEditTime: 2021-11-17 09:49:22
 * @LastEditors: 马潭龙
 * @Description: 自动生成form表单弹窗
 * @FilePath: \hifar-platform-client\src\components\HFormModal\index.js
 */
import HFrom from './form'
export default {
  components: { HFrom },
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
     * }
     */
    formData: {
      type: Array,
      default: () => []
    },
    // 弹窗宽度
    width: {
      type: Number,
      default: 800
    },
    // 弹窗模式，是否是详情页弹窗
    isDetail: {
      type: Boolean,

    },
    title: {
      type: String,
      default: "操作"
    },
    confirmLoading: {
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
    }
  },
  watch: {
    confirmLoading(val) {
      this.loading = this.confirmLoading
    }
  },
  data() {
    return {
      visible: false,
      model: {},
      formTitle: '操作',
      loading: this.confirmLoading || false,
    }
  },
  methods: {
    show(record = {}) {
      this.model = Object.assign({}, record)
      if (this.model.id) {
        this.formTitle = '编辑'
      } else {
        this.formTitle = '新建'
      }
      if (this.isDetail) {
        this.formTitle = '详情'
      }
      this.visible = true
    },
    renderForm() {
      let props = {
        ...this.$props,
        value:this.model
      }
      return (
        <h-form ref="HModalForm"  {...{ props }} onchange={this.submit}></h-form>
      )
    },
    submit(values) {
      this.$emit('onOk', values)
    },
    handleClickOk() {
      this.$refs.HModalForm.validateForm()
    },
    close() {
      this.visible = false
    }
  },
  render(h) {
    let formComponent = this.renderForm()
    return (
      <a-modal confirmLoading={this.loading} title={this.formTitle} width={this.width} visible={this.visible} oncancel={this.close} destroyOnClose>
        {formComponent}
        <div slot="footer">
          <a-button type="ghost-danger" onclick={this.close}>关闭</a-button>
          <a-button type="ghost-primary" loading={this.loading} onclick={this.handleClickOk}>确认</a-button>
        </div>
      </a-modal>
    )
  }
}