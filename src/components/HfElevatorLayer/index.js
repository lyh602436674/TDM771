/*
 * @Author: 雷宇航
 * @Date: 2022-03-16 09:29:44
 * @LastEditTime: 2022-03-16 18:39:00
 * @LastEditors: 雷宇航
 * @Description: 电梯层
 * @FilePath:
 */
import './index.less'

export default {
  props: {
    layerColumns: {
      type: Array,
      default: () => []
    },
    defaultActive: {
      type: [String, Number],
      default: ''
    },
  },
  watch: {
    layerColumns: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val && val.length) {
          this.columns = val
          if (this.defaultActive) {
            this.columns.map(item => item.active = item.id === this.defaultActive)
          } else {
            this.columns[0].active = true
          }
          this.$forceUpdate()
        }
      }
    },
  },
  data() {
    return {
      columns: [],
    }
  },
  created() {
  },
  methods: {
    renderLayerItem(h) {
      return this.columns.map(item => {
        return <div class={['elevator-layer-wrapper-item', item.active ? 'elevator-layer-wrapper-item-active' : '']}
                    key={item.id} onClick={() => {
          this.handleClick(item)
        }}>{item.title}</div>
      })
    },
    handleClick(item) {
      this.columns.map(v => {
        v.active = v.id === item.id;
      })
      this.$forceUpdate()
      document.getElementById(item.id).scrollIntoView({behavior: 'smooth'})
    },
  },
  render(h) {
    return h('div', {
      class: 'elevator-layer-wrapper',
    }, [this.renderLayerItem(h)])
  },
}