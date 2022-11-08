/*
 * @Author: 陈乾龙
 * @Date: 2021-07-19 11:06:15
 * @LastEditTime: 2021-11-19 15:54:23
 * @LastEditors: 赵峰
 * @Description: 动态生成查询条件的搜索栏组件
 * @FilePath: \hifar-platform-client\src\components\HSearch\index.js
 */
import { find, isEmpty, isObject, isFunction } from 'lodash'
export default {
  props: {
    /**
     * @Date: 2021-07-19 11:19:51
     * @Author: 陈乾龙
     * @description:
     *  {
     * addonBefore:'', // 表单名称前缀   所有表单组件均生效
     * addonAfter:'',  // 表单名称后缀   部分表单组件生效
     * title:'',       // 表单名称，如果有addonBefore，该项不生效
     * defaultValue:'',// 默认值
     * formType:'',    // 表单类型，input, datePick, dateRangePick,yearPick, select, dict
     * dictCode:'',    // 当type=dict时，该字段生效，为字典code，字典均为下拉选择
     * key:'',         // 查询的字段名
     * type:'',        // 组件Type
     * options:'',     // 当formType = select时有效
     * }
     */
    data: {
      type: Array,
      default: () => []
    },
    size: {
      type: String,
      default: 'small'
    },
    showToggleButton: {
      type: Boolean,
      default: true
    },
    value: {
      type: Object,
      default: () => { }
    },
    /**
     * @Date: 2021-10-18 16:59:37
     * @Author: 陈乾龙
     * @description: 是否设置独立处理重置事件，如果设置成true,则点击重置按钮不再直接触发change事件，变成触发reload事件
     */
    separateReload: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 对外释放的查询条件
      queryParams: {},
      toggleSearchStatus: false,
      colAttrs: {
        sm: 12,
        md: 6
      },
      activeItem: {},
      activeCode: null,
      isopen: false,
    }
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        console.log('搜索参数变化：', val)
        if (isObject(val))
          this.queryParams = val
        else
          this.queryParams = {}
      }
    }
  },
  methods: {
    renderToggleBtns(h) {
      let renderBtns = [
        h('a-button', {
          attrs: {
            size: this.size,
            icon: 'search',
            type: 'primary'
          },
          on: {
            click: this.triggerChange
          }
        }, '查询'),
        h('a-button', {
          attrs: {
            size: this.size,
            icon: 'reload'
          },
          style: {
            margin: '0 5px'
          },
          on: {
            click: () => {
              this.activeCode = undefined
              this.activeItem = {}
              if (this.separateReload) {
                this.$emit('reload', true)
              } else {
                this.queryParams = {}
                this.triggerChange()
              }
            }
          }
        }, '重置')
      ]
      if (this.showToggleButton) {
        renderBtns.push(
          h('a-button', {
            attrs: {
              type: 'ghost-primary',
              size: this.size,
              icon: this.toggleSearchStatus ? "up" : "down"
            },
            on: {
              click: () => {
                this.toggleSearchStatus = !this.toggleSearchStatus
              }
            }
          }, [this.toggleSearchStatus ? '收起' : '展开'])
        )
      }
      return h('a-col', {
        attrs: {
          sm: this.toggleSearchStatus ? 24 : 12,
          md: this.toggleSearchStatus ? 24 : 7
        },
        style: {
          display: 'flex',
          justifyContent: this.toggleSearchStatus ? 'flex-end' : 'flex-start',
          alignItems: 'center'
        }
      }, renderBtns)
    },
    renderFormItem(h, item) {
      let returnDom = []
      if (this.toggleSearchStatus) {
        if (item.addonBefore || item.title) {
          returnDom.push(<span slot="addonBefore">{item.addonBefore || item.title}</span>)
        }
        if (item.addonAfter) {
          returnDom.push(<span slot="addonAfter">{item.addonAfter}</span>)
        }
      }
      switch (item.formType) {
        case 'input':
          return h('h-input',
            {
              props: {
                size: this.size,
                placeholder: item.placeholder || `请输入${item.title || item.addonBefore}查询条件`,
                type: item.type || '',
                allowClear: item.allowClear || true,
                value: this.queryParams[item.key],
              },
              on: {
                change: (v) => {
                  if (isFunction(item.change)) {
                    item.change(v)
                  } else {
                    this.queryParams[item.key] = v
                    this.triggerChange()
                  }
                }
              }
            },
            returnDom)
        case 'select':
          let addonBefore = null
          if ((item.addonBefore || item.title) && this.toggleSearchStatus) {
            addonBefore = h('span', {
              slot: 'addonBefore'
            }, [item.addonBefore || item.title])
          }
          return h('h-select', {
            props: {
              size: this.size,
              placeholder: `请选择${item.addonBefore || item.title}`,
              options: item.options,
              value: this.queryParams[item.key]
            },
            on: {
              change: (v, vNode) => {
                this.queryParams[item.key] = v
                if (isFunction(item.change)) {
                  item.change(v)
                } else {
                  this.triggerChange()
                }
              }
            }
          }, [addonBefore])
        case 'datePick':
          let datePickProps = {
            size: this.size,
            placeholder: item.placeholder,
            value: this.queryParams[item.key],
            format: item.format || 'YYYY-MM-DD'
          }
          if (item.showTime) {
            datePickProps.showTime = item.showTime
          }
          return h('h-date', {
            props: {
              ...datePickProps
            },
            on: {
              change: v => {
                let dateData = {}
                dateData[item.key] = v
                this.queryParams = Object.assign({}, this.queryParams, dateData)
                if (isFunction(item.change)) {
                  item.change(v)
                }
                this.triggerChange()
              }
            }
          }, returnDom)
        case 'dateRangePick':
          let dateRangePickProps = {
            size: this.size,
            ranges: item.ranges,
            value: this.queryParams[item.key],
            format: item.format || 'YYYY-MM-DD'
          }
          if (item.showTime) {
            dateRangePickProps.showTime = item.showTime
          }
          return h('h-range-picker', {
            props: {
              ...dateRangePickProps
            },
            on: {
              change: (val, momentVal) => {
                let dateData = {}
                dateData[item.key] = momentVal
                this.queryParams = Object.assign({}, this.queryParams, dateData)
                if (isFunction(item.change)) {
                  item.change(v)
                }
                this.triggerChange()
              }
            }
          }, returnDom)
        case 'yearPick':
          let _this = this
          return h('a-date-picker', {
            props: {
              size: this.size,
              placeholder: item.placeholder || '请选择年份',
              disabled: item.disabled || false,
              allowClear: item.allowClear || false,
              type: item.type || "",
              mode: 'year',
              format: "YYYY",
              value: this.queryParams[item.key],
              open: _this.isopen
            },
            style: Object.assign({}, {
              width: '100%'
            }, item.style),
            on: {
              openChange: (status) => {
                if (status) {
                  _this.isopen = true
                } else {
                  _this.isopen = false
                }
              },
              panelChange: (v) => {
                _this.isopen = false
                let dateData = {}
                dateData[item.key] = v
                this.queryParams = Object.assign({}, this.queryParams, dateData)
                if (isFunction(item.change)) {
                  item.change(v)
                }
                this.triggerChange()
              }
            }
          }, returnDom)
        case 'dict':
          return h('h-dict-select',
            {
              props: {
                size: this.size,
                placeholder: `请选择${item.addonBefore || item.title}`,
                dictCode: item.dictCode || '',
                value: this.queryParams[item.key],
              },
              on: {
                change: (v) => {
                  if (isFunction(item.change)) {
                    item.change(v)
                  } else {
                    this.queryParams[item.key] = v
                    this.triggerChange()
                  }
                }
              }
            },
            returnDom)
        default:
          return null
      }
    },
    renderToggleTrue(h) {
      return this.data.map(item => {
        return h('a-col', { attrs: { ...this.colAttrs } }, [this.renderFormItem(h, item)])
      })
    },
    renderToggleFalse(h) {
      if (isEmpty(this.activeItem)) {
        this.activeItem = this.data[0]
      }
      this.activeCode = this.activeItem.key
      return [
        <a-col sm={6} md={5}>
          <h-select v-model={this.activeCode} placeholder="请选择" size={this.size} onChange={this.handleSearchTypeChange}>
            {this.data.map(item => {
              return (
                <a-select-option value={item.key}>{item.addonBefore || item.title}</a-select-option>
              )
            })}
          </h-select>
        </a-col>,
        <a-col sm={12} md={12}>
          {this.renderFormItem(h, this.activeItem)}
        </a-col>
      ]
    },
    handleSearchTypeChange(v) {
      this.activeItem = find(this.data, item => item.key === v)
      this.activeCode = this.activeItem.key
      this.queryParams = {}
    },
    triggerChange() {
      this.$emit('change', Object.assign({}, this.queryParams))
    }
  },
  render(h) {
    let renderDom = null
    if (this.toggleSearchStatus) {
      renderDom = this.renderToggleTrue(h)
    } else {
      renderDom = this.renderToggleFalse(h)
    }
    return h('div', {
      style: {
        maxWidth: this.toggleSearchStatus ? '100%' : "800px"
      },
      on: {
        "keyup": (e) => {
          if (e.keyCode === 13) {
            this.triggerChange()
          }
        }
      }
    }, [
      h('a-row',
        {
          attrs: {
            gutter: [10, 10],
            type: 'flex'
          }
        },
        [renderDom, this.renderToggleBtns(h)]
      )
    ])
  }
}