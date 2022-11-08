/*
 * @Author: 陈乾龙
 * @Date: 2021-06-15 17:23:30
 * @LastEditTime: 2021-06-18 12:34:48
 * @LastEditors: 陈乾龙
 * @Description: 电梯层最小单个组件，必须在HElevator组件下才能正常生效使用
 * @FilePath: \hifar-vue\ant-design-jeecg-vue\src\components\HElevator\HElevatorItem.js
 */
import "./index.less"
export default {
  name: "HElevatorItem",
  props: {
    id: {
      type: String,
      default: "",
      required: true
    },
    title: {
      type: String,
      default: "",
      required: true
    },
    active: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      preCls: 'h-elevator-item',
      loading:false
    }
  },
  methods: {
    handleClick() {
      let dom = document.getElementById(this.id)
      dom.scrollIntoView(true)
      this.$nextTick(() => {
        this.$emit('change', { ...this.$props })
      })
    },
    renderItem(h) {
      let className = this.preCls
      if (this.active) {
        className += ` ${this.preCls}-active`
      }
      return (
        <div class={className} onClick={this.handleClick}>{this.title}</div>
      )
    }
  },
  render(h) {
    return this.renderItem(h)
  }
}