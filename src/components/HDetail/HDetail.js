/*
 * @Author: 陈乾龙
 * @Date: 2021-06-15 16:54:53
 * @LastEditTime: 2021-06-18 14:04:31
 * @LastEditors: 陈乾龙
 * @Description: 携带电梯层的详情页面组件
 * @FilePath: \hifar-vue\ant-design-jeecg-vue\src\components\HDetail\HDetail.js
 */
import HElevator from "../HElevator/HElevator"
import { randomUUID } from '@/utils/util'
import { sortedIndexBy } from 'lodash'
// 电梯层列表
var elevatorList = []
export default {
  name: "HDetail",
  components: { HElevator },
  props: {
    /**
     * @description: 配置显示是否显示电梯层，true:显示，false:不显示
     */
    showElevator: {
      type: Boolean,
      default: false
    },
    getContainer: {
      // type: [Object,HTMLDocument, HTMLDivElement, HTMLBaseElement, HTMLElement],
      type: Function,
      default: () => undefined
    },
    elevatorOptions: {
      type: Object,
      default: () => {
        return {
          affix: false
        }
      }
    }
  },
  data() {
    return {
      preCls: 'h-detail',
      scrollObj: {
        scrollTop: this.scrollTop
      },
      scrollDom: this.getContainer(),
      anchorOffsetTop: []
    }
  },
  provide() {
    return {
      scroll: this.scrollObj
    }
  },
  mounted() {
    if (this.showElevator) {
      this.listenerScroll()
      this.$once('hook:beforeDestroy', () => {
        this.removeListener()
      })
    }
  },
  methods: {
    removeListener() {
      if (this.scrollDom) {
        this.scrollDom.removeEventListener('scroll', this.handleScroll)
      }
      console.log('remove listiner scroll')
    },
    listenerScroll() {
      let dom = this.scrollDom
      try {
        if (!dom) {
          dom = this.scrollDom = document.getElementsByClassName('page-content-router-view')[0]
        }
        if (dom) {
          dom.addEventListener('scroll', this.handleScroll)
          // 设置DOM属性的平滑滚动功能
        }
      } catch (err) {
        // 这里是为了处理当lastVal 为空时，removeEventListener时间保存，实际上这个错误可以忽略
        // console.log('滚动错误',err)
      }
    },
    handleScroll() {
      let dom = this.scrollDom
      if (!this.showElevator || !this.$refs.HElevator) return
      this.scrollObj.scrollTop = dom.pageYOffset || dom.scrollTop || dom.scrollTop
      // console.log(this.scrollObj.scrollTop)
      if (this.scrollObj.scrollTop > 40) {
        this.$refs.HElevator.$el.style.top = this.scrollObj.scrollTop + 'px'
      }
      // 处理滚动过程中的电梯层高亮
      this.handleElevatorActive()
    },
    async handleElevatorActive() {
      if (this.anchorOffsetTop && this.anchorOffsetTop.length > 0) {
        this.setElevatorActive()
        return
      }
      let anchorList = document.querySelectorAll("[anchor]")
      for (let i = 0, len = anchorList.length; i < len; i++) {
        let anchor = anchorList[i]
        let id = anchor.getAttribute('id')
        let offsetTop = anchor.scrollTop || anchor.offsetTop
        this.anchorOffsetTop.push({
          id, offsetTop
        })
      }
      this.anchorOffsetTop.sort(function (a, b) {
        return a.offsetTop - b.offsetTop
      })
      this.setElevatorActive()
    },
    setElevatorActive() {
      let scrollTop = this.scrollObj.scrollTop
      let activeIndex = sortedIndexBy(this.anchorOffsetTop, { offsetTop: this.scrollObj.scrollTop }, function (obj) {
        return obj.offsetTop
      })
      let activeElevator = null,
        prevElevator = null,
        nextElevator = this.anchorOffsetTop[activeIndex];
      if (activeIndex > 0) {
        prevElevator = this.anchorOffsetTop[activeIndex - 1]
        if ((scrollTop - prevElevator.offsetTop) > (nextElevator.offsetTop - scrollTop)) {
          activeElevator = nextElevator
        } else {
          activeElevator = prevElevator
        }
      } else {
        activeElevator = nextElevator
      }
      this.$refs.HElevator.handleAnchorItemChange(activeElevator)
    },
    // 这里处理电梯层的点击事件，让电梯层回到可视窗吸顶位置
    handleElevatorChange(item) {
      if (this.scrollObj.scrollTop > 40) {
        this.$refs.HElevator.$el.style.top = this.scrollObj.scrollTop + 'px'
      } else {
        this.$refs.HElevator.$el.style.top = 40 + 'px'
      }

    },
    renderContent(h) {
      let descriptionsList = []
      elevatorList = []
      this.$slots.default.map((item) => {
        // 判断是否开启电梯层，如果开启则电梯层数据入栈
        if (this.showElevator) {
          // 判断是否设置了锚点
          if (item.data && item.data.attrs.hasOwnProperty('anchor')) {
            let id = randomUUID()
            item.data.attrs.id = id
            elevatorList.push({
              id: id,
              title: (item.componentOptions && item.componentOptions.propsData && item.componentOptions.propsData.title) || (item.data && item.data.attrs.title),
            })
          }
        }
        descriptionsList.push(item)
      })
      this.elevatorList = elevatorList
      return descriptionsList
    },
    renderElevator(h) {
      let props = Object.assign({}, this.elevatorOptions, { list: this.elevatorList })
      return <HElevator ref="HElevator" {...{ props }} onchange={this.handleElevatorChange}></HElevator>
    }
  },
  render(h) {
    let domList = []
    this.anchorOffsetTop = []
    let className = this.preCls + '-wrapper'
    domList = domList.concat(this.renderContent(h))
    if (this.showElevator) {
      domList = domList.concat(this.renderElevator(h))
      className += ` ${this.preCls}-show-elevator`
    }
    return h('div', {
      class: className
    }, domList)
  }
}