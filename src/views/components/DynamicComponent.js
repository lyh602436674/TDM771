/*
 * @Author: 陈乾龙
 * @Date: 2021-08-30 17:24:12
 * @LastEditTime: 2021-11-19 15:18:15
 * @LastEditors: 赵峰
 * @Description: 动态组件，用来动态挂载组件
 * @FilePath: \hifar-platform-client\src\views\components\DynamicComponent.js
 */
import VUE from 'vue'
export default {
  props: {
    path: {
      type: String,
      default: null
    },
    id: {
      type: String,
      default: null
    }
  },
  watch: {
    path(val) {
      console.log("动态组件==================", val)
      this.localPath = val
    },
    id(val) {
      console.log('id变化===================', val)
      this.localId = val
    }
  },
  data() {
    return {
      localPath: this.path || null,
      localId: this.id || null
    }
  },
  methods: {
    async renderComponent(h) {
      let _this = this
      if (!this.localPath) {
        return null
      }
      let component = () => import(`@/views${this.localPath}`)
      component = await component()
      let newComponent = VUE.extend(component.default)
      new newComponent({
        created: function () {
          if (_this.id) {
            this.show(_this.id)
          }
        }
      }).$mount('#dynamicComponent')
    }
  },
  render(h) {
    if (!this.localPath) {
      return h('a-empty', {
        style: {
          width: '100%',
          height: "100%",
          overflow: "auto",
          marginRight: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }
      })
    } else {
      return h('div',
        {
          attrs: {
            id: "dynamicComponent"
          },
          style: {
            width: '100%',
            height: "100%",
            overflow: "auto",
            marginRight: '24px'
          }
        },
        this.renderComponent(h)
      )
    }
  }
}