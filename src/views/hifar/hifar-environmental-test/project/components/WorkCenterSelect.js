/*
 * @Author: 陈乾龙
 * @Date: 2021-07-27 15:27:16
 * @LastEditTime: 2021-08-26 16:30:02
 * @LastEditors: 陈乾龙
 * @Description: 工作中心下拉选择器
 * @FilePath: \hifar-platform-client\src\views\hifar\project\components\WorkCenterSelect.js
 */
import S from 'ant-design-vue/es/select'
import { getAction } from '@/api/manage'
export default {
  name: 'WorkCenterSelect',
  props: Object.assign({}, S.props, {
    filterOption: {
      type: Function,
      default: (value, options) => {
        return options.componentOptions.children[0].text.indexOf(value) >= 0
      },
    }
  }),
  data() {
    return {
      url: '/HfPrjWorkCenterBusiness/listAll',
      selectOptions: [],
      initValue: undefined
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.initValue = val
      }
    }
  },
  created() {
    this.getWorkCenterList()
  },
  methods: {
    async getWorkCenterList() {
      let res = await getAction(this.url)
      if (res.code == 200) {
        let options = []
        options = res.data.map(item => {
          return {
            title: item.workName,
            label: item.workName,
            value: item.id,
            key: item.id
          }
        })
        this.selectOptions = options
      }
    },
    handleSelectChange(v) {
      this.$emit('change', v)
    },
    renderSelect(h) {
      let options = this.selectOptions
      let props = {
        ...this.$props,
        options
      }
      return h('a-select', {
        attrs: {
          ...props,
          options: this.selectOptions,
          value: this.initValue
        },
        on: {
          change: this.handleSelectChange
        }
      })
    }
  },
  render(h) {
    return this.renderSelect(h)
  }
}