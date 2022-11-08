/*
 * @Author: 陈乾龙
 * @Date: 2021-07-29 09:24:17
 * @LastEditTime: 2021-08-04 09:27:35
 * @LastEditors: 陈乾龙
 * @Description: 通用弹窗table选择组件
 * @FilePath: \hifar-platform-client\src\views\components\HSelectModal.js
 */
import { isArray } from 'lodash'
import { getAction } from '@/api/manage'
import './HSelectModal.less'

export default {
  props: {
    value: {
      type: Array,
      default: () => []
    },
    // 是否展示在父组件内部
    inner: {
      type: Boolean,
      default: false
    },
    fullScreen: {
      type: Boolean,
      default: false
    },
    getContainer: {
      type: Function,
      default: () => document.body
    },
  },
  data() {
    return {
      confirmLoading: false,
      tableHeight: '100%',
      dataIdParam:'unitId',
      // table请求接口
      url: '',
      // 项目Id
      unitId: '',
      dataId: '',
      // 弹窗title
      title: '',
      // table的columns
      columns: [],
      visible: false,
      queryParams: {},
      // 自定义筛选数据项
      customQuery: {},
      selectedRowKeys: [],
      // 是否有搜索栏
      searchBar: {
        type: Array,
        default: () => []
      }
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        if (isArray(val)) {
          this.selectedRowKeys = val
        } else {
          this.selectedRowKeys = []
        }
      }
    }
  },
  methods: {
    show() {
      this.visible = true
    },
    loadData(params) {
      let data = {
        ...params,
        ...this.queryParams,
        ...this.customQuery,
        [this.dataIdParam]: this.unitId || this.dataId
      }
      if (this.url) {
        return getAction(this.url, data).then(res => {
          if (res.code == 200) {
            return res.data
          }
        })
      } else {
        return new Promise((resolve, reject) => {
          resolve({
            data: [],
            ...this.params,
            totalCount: 0
          })
        })
      }

    },
    onSelected(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    handleSearch(v) {
      this.queryParams = v
      this.$refs.HSelectTable.refresh(true)
    },
    renderContent(h) {
      let searchBarCom = null
      if (this.searchBar && this.searchBar.length) {
        searchBarCom = h('h-search', {
          slot: 'search-form',
          props: {
            size: 'small',
            showToggleButton: this.searchBar.length > 4 ? true : false,
            data: this.searchBar
          },
          directives: [
            {
              name: 'model',
              value: this.queryParams
            }
          ],
          on: {
            change: this.handleSearch
          }
        })
      }
      return h('h-card', {
        props: {
          bordered: false,
          bodyStyle: {
            height: '100%'
          }
        }
      }, [
        searchBarCom,
        h('h-vex-table', {
          slot: 'content',
          ref: 'HSelectTable',
          attrs: {
            columns: this.columns,
            data: this.loadData,
            size: 'small',
            rowSelection: {
              columnWidth: 60,
              columnTitle: '#',
              selectedRowKeys: this.selectedRowKeys,
              onSelect: this.handleOnSelect,
              type: 'checkbox'
            }
          },
          on: {
            selected: this.onSelected
          }
        })
      ])
    },
    renderModalFooter(h) {
      return (
        <div class='drawer-bootom-button'>
          <a-button type='ghost-danger' style='margin-right: 8px' onclick={this.handleCancel}>取消</a-button>
          <a-button type='ghost-primary' onclick={this.handleSubmit}> 提交</a-button>
        </div>
      )
    },
    handleOnSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    handleCancel() {
      this.url = null
      this.columns = []
      this.customQuery = {}
      this.visible = false
    },
    handleSubmit() {
      this.$emit('change', this.selectedRowKeys, this.selectedRows)
    }
  },
  render(h) {
    return h('a-modal', {
      class: {
        'h-select-modal': this.inner,
        'h-select-modal-fullScreen': this.fullScreen
      },
      attrs: {
        visible: this.visible,
        title: this.title,
        getContainer: this.getContainer,
        destroyOnClose: true
      },
      on: {
        cancel: this.handleCancel
      },
      scopedSlots: {
        footer: (props) => {
          return this.renderModalFooter(h)
        }
      }
    }, [this.renderContent(h)])
  }
}