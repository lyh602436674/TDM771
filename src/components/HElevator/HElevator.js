/*
 * @Author: 陈乾龙
 * @Date: 2021-06-15 16:56:44
 * @LastEditTime: 2021-06-18 12:46:07
 * @LastEditors: 陈乾龙
 * @Description: 电梯层组件
 * @FilePath: \hifar-vue\ant-design-jeecg-vue\src\components\HElevator\HElevator.js
 */
// import AC from 'ant-design-vue/es/anchor/Anchor'
import HElevatorItem from './HElevatorItem'
import "./index.less"

export default {
  name: "HElevator",
  components: { HElevatorItem },
  props: {
    /**
     * @description: 电梯层数据
     * @param {ObjectArray} {id:''//电梯层ID 必须的,title:'' //名称}
     */
    list: {
      type: Array,
      default: () => [],
      required: true
    },
  },
  data() {
    return {
      preCls: 'h-elevator',
      activeId: null,
      activeLoading:false
    }
  },
  methods: {
    handleAnchorItemChange(item) {
      if(this.activeLoading)return
      this.activeLoading = true
      this.activeId = item.id
      setTimeout(()=>{
        this.activeLoading=false
      },50)
      this.$emit('change',item)
    },
    renderAnchorItem() {
      let items = this.list.map(item => {
        let props = {
          id: item.id,
          title: item.title,
          active: this.activeId === item.id
        }
        return (
          <h-elevator-item {...{ props }} onchange={this.handleAnchorItemChange}></h-elevator-item>
        )
      })
      return items
    }
  },
  render(h) {
    return h('div', {
      class: this.preCls
    },
      [this.renderAnchorItem(h)]
    )
  }
}