/*
 * @Author: 陈乾龙
 * @Date: 2021-07-27 15:27:16
 * @LastEditTime: 2021-08-03 10:40:38
 * @LastEditors: 陈乾龙
 * @Description: 项目分类管理 分类下拉选择器，这里只做了分类，后续可以修改组件配置成分类和项目选择器
 * @FilePath: \hifar-platform-client\src\views\hifar\project\components\PcClassifySelect.js
 */
import S from 'ant-design-vue/es/select'
import { postAction } from '@/api/manage'
export default {
  name: 'PcClassifySelect',
  props: Object.assign({}, S.props, {
    filterOption: {
      type: Function,
      default: (value, options) => {
        return options.componentOptions.children[0].text.indexOf(value) >= 0
      },
    }
  }),
  inject: ['groupCode'],
  data() {
    return {
      url: '/HfPrjUnitClassifyBusiness/listByGroupCode',
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
    this.getClassifyList()
  },
  methods: {
    async getClassifyList() {
      let params = {
        groupCode: this.groupCode
      }
      let res = await postAction(this.url, params)
      if (res.code == 200) {
        let options = []
        options = res.data.map(item => {
          return {
            title: item.classifyName,
            label: item.classifyName,
            value: item.id,
            key: item.id
          }
        })
        this.selectOptions = options
      }
    },
    handleSelectChange(v) {
      console.log('select', v)
      this.$emit('change', v)
    },
    renderSelect(h) {
      let props = {
        ...this.$props,
        options: this.selectOptions
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