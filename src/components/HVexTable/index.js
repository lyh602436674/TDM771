/*
 * @Author: 陈乾龙
 * @Date: 2021-07-29 13:49:10
 * @LastEditTime: 2021-12-01 17:25:54
 * @LastEditors: 陈乾龙
 * @Description: 自定义Table
 * @FilePath: \hifar-platform-client\src\components\HVexTable\index.js
 */
import T from "ant-design-vue/es/table/Table";
import "./hVexTable.less";
import {isArray, isEmpty, isFunction, isObject, isString} from "lodash";
import {randomUUID} from '@/utils/util';

export default {
  props: Object.assign({}, T.props, {
    uid: {
      type: String
    },
    rowKey: {
      type: [String, Function],
      default: () => 'id'
    },
    // 需要生成的数据,这里接收一个promise对象
    data: {
      type: Function,
      required: true
    },
    pageNum: {
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
    height: {
      type: [Number, String],
      default: '100%'
    },
    // 是否在created 的时候执行loadData
    autoLoad: {
      type: Boolean,
      default: true
    },
    // 是否显示序号列
    showSeq: {
      type: Boolean,
      default: true
    },
    // 是否显示表头
    showHeader: {
      type: Boolean,
      default: true
    },
    // 单独设置cell的样式
    cellStyle: {
      type: [Object, Function],
      default: () => undefined
    },
    checkMethod: {
      type: Function
    },
    RadioMethod: {
      type: Function,
    },
    expandConfig: {
      type: Object,
      default: () => undefined
    },
    // 自定义列配置项
    customConfig: {
      type: Object,
      default: () => undefined
    },
    customMethod: {
      type: Function
    },
    // 右侧显示选中项
    selectedListConfig: {
      type: Object,
      default: () => undefined
    }
  }),
  data() {
    return {
      tableId: this.uid || randomUUID(), // 当前vexTable的唯一标识
      needTotalList: [],
      selectedRows: [],
      selectedRowKeys: [],
      localLoading: false,
      localPagination: Object.assign({}, T.props.pagination, {
        showTotal: (total, range) => {
          return range[0] + '-' + range[1] + ' 共' + total + '条'
        }
      })
    }
  },
  watch: {
    'rowSelection.selectedRowKeys': {
      immediate: true,
      handler(val) {
        // console.log("selectedRowKeys 监听到的数据变化：", val)
        /**
         * @Date: 2021-08-05 19:12:09
         * @Author: 陈乾龙
         * @description: 数据回显这里有个bug 后续处理
         */
        this.resetTableSelected(val)
      }
    }
  },
  created() {
    this.selectedRowKeys = isArray(this.value) ? this.value : isString(this.value) ? this.value.split(',') : []
    this.localPagination = ['auto', true].includes(this.showPagination) && Object.assign({}, this.localPagination, {
      current: this.pageNum,
      pageSize: this.pageSize,
      showSizeChanger: this.showSizeChanger
    });
    this.needTotalList = this.initTotalList(this.columns)
    if (this.autoLoad) {
      this.loadData();
    }
  },
  methods: {
    /**
     * @Date: 2021-12-01 16:29:21
     * @Author: 陈乾龙
     * @description: 数据回显设置，这里回显主要使用的selectedRowKeys，后续可以添加selectedRows 进来
     * @param {*} val 回显的selectedKeys
     */
    resetTableSelected(val) {
      if (isArray(val)) {
        this.selectedRowKeys = val
      } else if (isString(val)) {
        this.selectedRowKeys = val.split(',')
      } else {
        this.selectedRowKeys = []
      }
        // this.setCheckboxStatus()
    },
    /**
     * @Date: 2021-11-17 18:06:54
     * @Author: 陈乾龙
     * @description:
     * @param {*} type 是否将页码改为第一页，true 改为第一页，false 不修改成第一页
     * @return {*}
     */
    refresh(type) {
      if (type) {
        this.loadData({
          current: 1
        })
      } else {
        this.loadData()
      }
    },
    /**
     * @Date: 2021-11-17 18:17:06
     * @Author: 陈乾龙
     * @description: 加载数据的方法
     * @param {*} pagination 分页数据，过滤器，排序器
     * @param {*} filters
     * @param {*} sorter
     * @return {*}
     */
    loadData(pagination, filters, sorter) {
      this.localLoading = true
      var result = this.data(
        Object.assign({
            pageNo: (pagination && pagination.current) ||
              this.localPagination.current,
            pageSize: (pagination && pagination.pageSize) ||
              this.localPagination.pageSize
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
          let dataSource = r.records || r.data || r
          let totalCount = r.total || r.totalCount || 0
          let pageNo = r.pages || r.pageNo || 1
          this.localPagination = this.showPagination && Object.assign({}, this.localPagination, {
            current: pageNo,
            total: totalCount,
            showSizeChanger: this.showSizeChanger,
            pageSize: (pagination && pagination.pageSize) ||
              this.localPagination.pageSize
          });
          // 为防止删除数据后导致页面当前页面数据长度为 0 ,自动翻页到上一页
          if (dataSource.length === 0 && this.showPagination && this.localPagination.current > 1) {
            this.localPagination.current--
            this.loadData()
            return
          }
          // 这里用来判断是否隐藏分页组件，如果当前数据不满足分页，则自动隐藏分页组件
          try {
            if ((['auto', true].includes(this.showPagination) && totalCount <= (pageNo * this.localPagination.pageSize))) {
              this.localPagination.hideOnSinglePage = true
            }
          } catch (e) {
            this.localPagination = false
          }
          //update--end--autor:wangshuai-----date:20200724------for：判断showPagination是否为false-----
          this.$refs[this.tableId].loadData(dataSource)
          this.localLoading = false
          if (!isEmpty(this.selectedListConfig)) {
            this.setCheckboxStatus()
          }
          // 设置数据默认选中行
          if (this.selectedRowKeys.length > 0) {
            let selectionRows = []
            dataSource.forEach(v => {
              this.selectedRowKeys.forEach(s => {
                if (v.id === s) {
                  selectionRows.push(v)
                }
              })
            })
            this.$refs[this.tableId].setCheckboxRow(selectionRows, true)
          }
        })
      }
    },
    /**
     * @Date: 2021-11-17 18:17:59
     * @Author: 陈乾龙
     * @description: 初始化
     * @param {*} columns
     * @return {*}
     */
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
    /**
     * @Date: 2021-11-17 18:18:07
     * @Author: 陈乾龙
     * @description: 分页变化处理函数
     * @param {*} page 分页
     * @param {*} pageSize 分页大小
     * @return {*}
     */
    paginationChange(page, pageSize) {
      this.localPagination.current = page
      this.refresh()
    },
    /**
     * @Date: 2021-11-17 18:18:38
     * @Author: 陈乾龙
     * @description: 分页大小变化处理函数
     * @param {*} current 当前页
     * @param {*} size 分页大小
     * @return {*}
     */
    sizeChange(current, size) {
      this.localPagination.pageSize = size
      this.localPagination.current = current
      this.refresh()
    },
    /**
     * @Date: 2021-11-17 18:21:25
     * @Author: 陈乾龙
     * @description: 渲染页面column
     * @param {*} itemColumn
     * @return {*}
     */
    renderColumn(itemColumn) {
      let _h_ = this.$createElement
      let props = Object.assign({}, itemColumn)
      if (itemColumn.scopedSlots) {
        // 判断是否是自定义slot
        return _h_('vxe-table-column', {
          props: props,
          scopedSlots: {
            default: (props) => {
              let key = itemColumn.dataIndex || itemColumn.scopedSlots.customRender
              if (this.$scopedSlots[itemColumn.scopedSlots.customRender]) {
                return this.$scopedSlots[itemColumn.scopedSlots.customRender](props.row[key], props.row, props.rowIndex)
              } else {
                return null
              }
            }
          }
        })
      }
      if (itemColumn.customRender) {
        props.field = itemColumn.dataIndex
        props.formatter = ({cellValue, row, column}) => {
          return itemColumn.customRender(cellValue, row)
        }
      } else {
        props.field = itemColumn.dataIndex
      }
      return _h_('vxe-table-column', {
        props: {
          ...props
        }
      })
    },
    renderColumns(h) {
      let columns = []
      for (let i = 0, len = this.columns.length; i < len; i++) {
        if (this.columns[i].hidden !== false) {
          let column = null
          column = this.renderColumn(this.columns[i])
          columns.push(column)
        }
      }
      // 这里默认增加序号列
      if (this.showSeq) {
        columns.unshift(h('vxe-table-column', {
          attrs: {
            type: 'seq',
            width: 60,
            align: 'center',
            fixed: 'left',
          }
        }))
      }
      // 处理列表是否设置了rowSelection
      if (!isEmpty(this.rowSelection) && isObject(this.rowSelection)) {
        let selectOptions = Object.assign({
          width: 60,
          align: 'center',
          type: 'checkbox',
          fixed: 'left',
          visible: this.rowSelection.visible && true
        }, this.rowSelection)
        columns.unshift(h('vxe-table-column', {
          attrs: selectOptions
        }))
      }
      return columns
    },
    /**
     * @Date: 2021-08-03 15:39:03
     * @Author: 陈乾龙
     * @description: 单选\多选触发的事件
     */
    radioChange({newValue, oldValue, row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, $event}) {
      let selectedRowKeys
      this.selectedRows = []
      if (this.rowKey) {
        if (isString(this.rowKey)) {
          selectedRowKeys = row[this.rowKey]
        } else if (isFunction(this.rowKey)) {
          selectedRowKeys = this.rowKey(row)
        }
      } else {
        selectedRowKeys = row.id
      }
      this.selectedRowKeys = [selectedRowKeys]
      this.selectedRows[selectedRowKeys] = row
      this.triggerChange()
    },
    checkboxChange({
                     records,
                     reserves,
                     indeterminates,
                     checked,
                     row,
                     rowIndex,
                     $row,
                     $rowIndex,
                     column,
                     columnIndex,
                     $columnIndex,
                     $event
                   }) {
      // records 为当前选中的行数据数组 reserves 为历史选中的数组，但是会出现重复的情况，所以对外输出需要处理掉重复的数据
      // console.log('多选触发的事件', 'records:', records, 'reserves:', reserves, 'indeterminates:', indeterminates, 'checked:', checked, 'row:', row, 'rowIndex:', rowIndex, '$row:', $row, '$rowIndex:', $rowIndex)
      let selectedRows = []
      // selectedRows 被组装成HashArray，对外输出时需要修改成IndexArray
      records.map(item => {
        if (isString(this.rowKey)) {
          selectedRows[item[this.rowKey]] = item
        } else if (isFunction(this.rowKey)) {
          selectedRows[this.rowKey(item)] = item
        }
      })
      reserves.map(item => {
        if (isString(this.rowKey)) {
          selectedRows[item[this.rowKey]] = item
        } else if (isFunction(this.rowKey)) {
          selectedRows[this.rowKey(item)] = item
        }
      })
      this.selectedRowKeys = Object.keys(selectedRows)
      this.selectedRows = selectedRows
      this.triggerChange()
    },
    // checkbox 全选时
    handleCheckAll({
                     records,
                     reserves,
                     checked,
                     row,
                     rowIndex,
                     $row,
                     $rowIndex,
                     column,
                     columnIndex,
                     $columnIndex,
                     $event
                   }) {
      let selectedRows = []
      records.map(item => {
        if (isString(this.rowKey)) {
          selectedRows[item[this.rowKey]] = item
        } else if (isFunction(this.rowKey)) {
          selectedRows[this.rowKey(item)] = item
        }
      })
      reserves.map(item => {
        if (isString(this.rowKey)) {
          selectedRows[item[this.rowKey]] = item
        } else if (isFunction(this.rowKey)) {
          selectedRows[this.rowKey(item)] = item
        }
      })
      this.selectedRowKeys = Object.keys(selectedRows)
      this.selectedRows = selectedRows
      this.triggerChange()
    },
    /**
     * @Date: 2021-08-05 17:05:11
     * @Author: 陈乾龙
     * @description: 对外释放选中的值
     */
    triggerChange() {
      // 当前组件中selectedRows是一个hash数组，对外释放的时候为普通数组
      let selectedRows = []
      for (let key in this.selectedRows) {
        selectedRows.push(this.selectedRows[key])
      }
      if (this.rowSelection) {
        if (this.rowSelection.onSelect && isFunction(this.rowSelection.onSelect)) {
          this.rowSelection.onSelect(this.selectedRowKeys, selectedRows)
        }
        if (this.rowSelection.onChange && isFunction(this.rowSelection.onChange)) {
          this.rowSelection.onChange(this.selectedRowKeys, selectedRows)
        }
      }
      this.$emit('selected', this.selectedRowKeys, selectedRows)
      this.$emit('change', this.selectedRowKeys, selectedRows)
    },

    /**
     * @Date: 2021-08-27 11:45:30
     * @Author: 陈乾龙
     * @description: table 拓展相关
     */
    // 清除拓展项展开 手动清空展开行状态，数据会恢复成未展开的状态
    clearRowExpand() {
      this.$refs[this.tableId].clearRowExpand()
    },
    /**
     * @Date: 2021-11-18 11:48:04
     * @Author: 陈乾龙
     * @description: 渲染右侧的选中选项
     */
    renderSelectedListConfig(h) {
      let tags = []
      for (let key in this.selectedRows) {
        let item = this.selectedRows[key]
        tags.push(h('div', {
          class: 'h-tag',
        }, [
          item[this.selectedListConfig.title || 'id'],
          h('div', {
            class: 'h-tag-close',
            on: {
              click: () => {
                let deleteKey = null
                let selectedRows = []
                if (isString(this.rowKey)) {
                  deleteKey = item[this.rowKey]
                } else if (isFunction(this.rowKey)) {
                  deleteKey = this.rowKey(item)
                }
                this.selectedRowKeys.map(key => {
                  if (key != deleteKey) {
                    selectedRows[key] = this.selectedRows[key]
                  }
                })
                this.selectedRowKeys = Object.keys(selectedRows)
                this.selectedRows = selectedRows
                if (this.rowSelection) {
                  this.setCheckboxStatus()
                }
              }
            }
          })
        ]))
      }
      return h('div', {
        class: 'h-vex-table-selected_list'
      }, [tags])
    },
    setCheckboxStatus() {
      // 因为当前表格数据刷新后 vxe-table的row-id属性发生了变化，导致selectedRows中的数据与当前table的数据不一致，导致数据无法正常更新上去，所以这里做了一次数据查询
      let tableData = this.$refs[this.tableId].getData()
      this.$refs[this.tableId].clearCheckboxRow()
      this.$refs[this.tableId].clearCheckboxReserve()
      tableData.map(item => {
        let checkedKey = null
        if (isString(this.rowKey)) {
          checkedKey = item[this.rowKey]
        } else if (isFunction(this.rowKey)) {
          checkedKey = this.rowKey(item)
        } else {
          checkedKey = item.id
        }
        // 因为回传回来的selectedRowKeys很有可能在table当前页中不存在，所以只能找当前table数据中确定存在的数据
        if (this.selectedRowKeys.includes(checkedKey)) {
          this.selectedRows[checkedKey] = item
        }
      })
      let selectedRows = []
      for (let key in this.selectedRows) {
        selectedRows.push(this.selectedRows[key])
      }
      if (this.rowSelection.type != 'radio') {
        this.$refs[this.tableId].setCheckboxRow(selectedRows, true)
      } else {
        this.$refs[this.tableId].setRadioRow(selectedRows[0])
      }
    }
  },
  render() {
    let vxeTableProps = {
      id: this.tableId,
      height: this.height,
      autoResize: true,
      stripe: true,
      border: this.bordered || true,
      round: true,
      size: this.size,
      loading: this.localLoading,
      showHeader: this.showHeader,
      showOverflow: 'tooltip',
      showHeaderOverflow: 'tooltip',
      class: 'h-vex-table',
      highlightCurrentRow: true,
      highlightCurrentColumn: true,
      highlightHoverColumn: true,
      columnConfig: {
        resizable: true
      },
      rowConfig: {
        isCurrent: true,
        isHover: true
      },
      resizable: true,
      tooltipConfig: {
        enterable: true
      }
    }
    let events = {}
    // 是否显示序列号
    if (this.showSeq) {
      vxeTableProps['seqConfig'] = {
        seqMethod: ({rowIndex}) => {
          let {current, pageSize} = this.localPagination
          return (current - 1) * pageSize + rowIndex + 1
        }
      }
    }
    // 判断是否设置了rowSelection
    if (this.rowSelection) {
      if (this.rowSelection.type !== 'radio') {
        vxeTableProps['checkboxConfig'] = {
          trigger: this.rowSelection.trigger || 'cell',
          highlight: true,
          strict: true,
          reserve: true,
          range: true,
        }
        if (isFunction(this.checkMethod)) {
          vxeTableProps['checkboxConfig'].checkMethod = this.checkMethod
        }
        events['checkbox-change'] = this.checkboxChange
        events['checkbox-all'] = this.handleCheckAll
      } else {
        vxeTableProps['radioConfig'] = {
          strict: true,
          trigger: this.rowSelection.trigger || 'row',
          highlight: true,
        }
        if (isFunction(this.RadioMethod)) {
          vxeTableProps['radioConfig'].checkMethod = this.RadioMethod
        }
        if (isFunction(this.rowSelection.visibleMethod)) {
          vxeTableProps['radioConfig'].visibleMethod = this.rowSelection.visibleMethod
        }

        events['radio-change'] = this.radioChange
      }
    }

    // 判断是否设置了expandConfig
    if (this.expandConfig) {
      vxeTableProps['expand-config'] = this.expandConfig
      events['clearRowExpand'] = this.clearRowExpand
    }

    // 判断是否单独设置cellStyle
    if (isFunction(this.cellStyle)) {
      vxeTableProps['cell-style'] = ({row, rowIndex, column}) => {
        return this.cellStyle(row, rowIndex, column)
      }
    }

    // 判断是否设置了cell合并
    if (isArray(this.mergeCell)) {
      vxeTableProps['merge-cell'] = this.mergeCell
    }

    // 判断是否设置了customConfig，customConfig 用来自定义配置列样式
    if (this.customConfig && isObject(this.customConfig)) {
      vxeTableProps['custom-config'] = this.customConfig
      if (isFunction(this.customMethod)) {
        vxeTableProps['custom-config'].checkMethod = this.customMethod
      }
    }
    // 判断是否显示选中的列表
    let selectedList = null
    if (!isEmpty(this.selectedListConfig)) {
      selectedList = this.renderSelectedListConfig(h)
    }
    return (
      <div class="h-vex-table-wrapper">
        <div class="h-vex-table-wrapper_wrapper">
          <div class="h-vex-table-wrapper_wrapper_table">
            {
              h('vxe-table', {
                ref: this.tableId,
                props: vxeTableProps,
                scopedSlots: {
                  empty: () => {
                    return <a-empty/>
                  }
                },
                on: events
              }, [this.renderColumns(h)])
            }
          </div>
          {
            selectedList
          }
        </div>
        {
          h('a-pagination', {
            attrs: {
              ...this.localPagination,
              size: 'small'
            },
            style: {
              textAlign: 'right',
              width: '100%',
              padding: '10px 0 0'
            },
            on: {
              change: this.paginationChange,
              showSizeChange: this.sizeChange
            }
          })
        }
      </div>
    )
  }
}