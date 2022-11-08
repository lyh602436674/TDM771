import T from "ant-design-vue/es/table/Table";
import get from "lodash.get"
import {isArray} from 'lodash'
export default {
  data() {
    return {
      needTotalList: [],

      selectedRows: [],
      selectedRowKeys: [],

      localLoading: false,
      localDataSource: [],
      localPagination: Object.assign({}, T.props.pagination, {
        showTotal: (total, range) => {
          return range[0] + '-' + range[1] + ' 共' + total + '条'
        }
      })
    };
  },
  props: Object.assign({}, T.props, {
    rowKey: {
      type: [String, Function],
      default: 'id'
    },
    data: {
      type: Function,
      required: true
    },
    pageNo: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 20
    },
    showSizeChanger: {
      type: Boolean,
      default: true
    },
    showAlertInfo: {
      type: Boolean,
      default: false
    },
    showPagination: {
      default: 'auto'
    },
    size: {
      type: String,
      default: 'small'
    },
    // 增加是否在create是就加载数据
    loadOnCreate: {
      type: Boolean,
      default: true
    }
  }),
  watch: {
    'localPagination.current'(val) {
      this.$router.push({
        name: this.$route.name,
        params: Object.assign({}, this.$route.params, {
          pageNo: val
        }),
      });
      // 如果pagination change，重置 total Data
      this.needTotalList = this.initTotalList(this.columns)
      this.selectedRowKeys = []
      this.selectedRows = []
    },
    'rowSelection.selectedRowKeys'(val){
      this.selectedRowKeys = isArray(val)?val:[]
    },
    'rowSelection.selectedRows'(val){
      this.selectedRows = isArray(val)?val:[]
    },
    pageNo(val) {
      Object.assign(this.localPagination, {
        current: val
      });
    },
    pageSize(val) {
      Object.assign(this.localPagination, {
        pageSize: val
      });
    },
    showSizeChanger(val) {
      Object.assign(this.localPagination, {
        showSizeChanger: val
      });
    }
  },
  created() {
    // 这里用来判断是由路由携带需要跳转的页数过来
    const { pageNo } = this.$route.params
    const localPageNum = (pageNo && parseInt(pageNo)) || this.pageNo
    this.localPagination = ['auto', true].includes(this.showPagination) && Object.assign({}, this.localPagination, {
      current: localPageNum,
      pageSize: this.pageSize,
      showSizeChanger: this.showSizeChanger
    }) || false;
    this.needTotalList = this.initTotalList(this.columns)
    // 这里增加是否创建table时，就加载数据，默认是 true
    if (this.loadOnCreate) {
      this.loadData();
    }
  },
  methods: {
    /**
     * @Date: 2021-08-03 14:38:58
     * @description: 表格刷新，是否强制刷新到第一页，默认为true
     * @param {*} bool
     */
    refresh(bool = false) {
      if (bool) {
        bool && (this.localPagination = Object.assign({}, {
          current: 1, pageSize: this.pageSize
        }))
        this.onClearSelected()
        this.loadData()
      } else {
        this.loadData()
      }
    },
    /**
    * 加载数据方法
    * @param {Object} pagination 分页选项器
    * @param {Object} filters 过滤条件
    * @param {Object} sorter 排序条件
    */
    loadData(pagination, filters, sorter) {
      this.localLoading = true
      var result = this.data(
        Object.assign({
          pageNo: (pagination && pagination.current) ||
            this.showPagination && this.localPagination.current || this.pageNo,
          pageSize: (pagination && pagination.pageSize) ||
            this.showPagination && this.localPagination.pageSize || this.pageSize
        },
          (sorter && sorter.field && {
            sortField: sorter.field
          }) || {},
          (sorter && sorter.order && {
            sortOrder: sorter.order
          }) || {}, {
          ...filters
        }
        )
      );
      // eslint-disable-next-line
      if (result instanceof Promise) {
        result.then(r => {
          // 这里做数据兼容，不同的接口返回数据格式不一样
          let dataSource = r.records || r.data || []
          let totalCount = r.total || r.totalCount || 0
          let pageNo = r.pages || r.pageNo || 1

          this.localPagination = this.showPagination && Object.assign({}, this.localPagination, {
            current: pageNo,
            total: totalCount,
            showSizeChanger: this.showSizeChanger,
            pageSize: (pagination && pagination.pageSize) ||
              this.localPagination.pageSize
          }) || false;
          // 为防止删除数据后导致页面当前页面数据长度为 0 ,自动翻页到上一页
          // 这里有一个bug，即当切换到后较大pageNo后，再使用查询条件搜索数据后，页数可能达不到当前的页数，便会疯狂请求接口，直到有数据
          if (dataSource.length === 0 && this.showPagination && this.localPagination.current > 1) {
            // 修复重复请求接口，直到有数据的bug，这里计算出对应最大数据的最大页数
            let currentPageNo = Math.ceil(totalCount / pageSize)
            // this.localPagination.current--
            this.localPagination.current = currentPageNo
            this.loadData()
            return
          }
          //update--begin--autor:wangshuai-----date:20200724------for：判断showPagination是否为false------
          // (!this.showPagination || totalCount && this.showPagination === 'auto') && (this.localPagination = false)
          // 这里用来判断是否隐藏分页组件，如果当前数据不满足分页，则自动隐藏分页组件
          try {
            if ((['auto', true].includes(this.showPagination) && totalCount <= (pageNo * this.localPagination.pageSize))) {
              this.localPagination.hideOnSinglePage = true
            }
          } catch (e) {
            this.localPagination = false
          }
          //update--end--autor:wangshuai-----date:20200724------for：判断showPagination是否为false-----
          this.localDataSource = dataSource; // 返回结果中的数组数据
          this.localLoading = false
        });
      }
    },
    initTotalList(columns) {
      const totalList = []
      columns && columns instanceof Array && columns.forEach(column => {
        if (column.needTotal) {
          totalList.push({
            ...column,
            total: 0
          })
        }
      })
      return totalList
    },
    updateSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
      let list = this.needTotalList
      this.needTotalList = list.map(item => {
        return {
          ...item,
          total: selectedRows.reduce((sum, val) => {
            let total = sum + get(val, item.dataIndex)
            return isNaN(total) ? 0 : total
          }, 0)
        }
      })
      // this.$emit('change', selectedRowKeys, selectedRows)
    },
    updateEdit() {
      this.selectedRows = []
    },
    onClearSelected() {
      if (this.showAlertInfo && this.rowSelection) {
        this.rowSelection.onChange([], [])
      }
      this.selectedRowKeys = []
      this.selectedRows = []
      this.updateSelect([], [])
      this.$emit('clearAll')
    },
    renderMsg(h) {
      const _vm = this
      let d = []
      // 构建 已选择
      d.push(
        h('span', {
          style: {
            marginRight: '12px'
          }
        }, ['已选择 ', h('a', {
          style: {
            fontWeight: 600
          }
        }, this.selectedRows.length)])
      );

      // 构建 列统计
      this.needTotalList.map(item => {
        d.push(h('span', {
          style: {
            marginRight: '12px'
          }
        },
          [
            `${item.title}总计 `,
            h('a', {
              style: {
                fontWeight: 600
              }
            }, `${!item.customRender ? item.total : item.customRender(item.total)}`)
          ]))
      });

      // 构建 清空选择
      d.push(h('a', {
        style: {
          marginLeft: '24px'
        },
        on: {
          click: _vm.onClearSelected
        }
      }, '清空'))

      return d
    },
    renderAlert(h) {
      return h('span', {
        slot: 'message'
      }, this.renderMsg(h))
    },
  },

  render(h) {
    const _vm = this

    let props = {},
      localKeys = Object.keys(this.$data);

    Object.keys(T.props).forEach(k => {
      let localKey = `local${k.substring(0, 1).toUpperCase()}${k.substring(1)}`;
      if (localKeys.includes(localKey)) {
        return props[k] = _vm[localKey];
      }
      return props[k] = _vm[k];
    })
    // 显示信息提示，这里就需要重新绑定onChange事件
    if (this.showAlertInfo) {

      props.rowSelection = {
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          _vm.updateSelect(selectedRowKeys, selectedRows)
          _vm.$emit('onSelect', { selectedRowKeys: selectedRowKeys, selectedRows: selectedRows })
          typeof _vm.rowSelection.onChange !== 'undefined' && _vm.rowSelection.onChange(selectedRowKeys, selectedRows)
        },
      };

      return h('div', {}, [
        h("a-alert", {
          style: {
            marginBottom: '5px'
          },
          props: {
            type: 'info',
            showIcon: true
          }
        }, [_vm.renderAlert(h)]),
        h("a-table", {
          tag: "component",
          attrs: props,
          on: {
            change: _vm.loadData
          },
          scopedSlots: this.$scopedSlots
        }, this.$slots.default)
      ]);

    }

    return h("a-table", {
      tag: "component",
      attrs: props,
      on: {
        change: _vm.loadData
      },
      scopedSlots: this.$scopedSlots
    }, this.$slots.default);

  }
};