/*
 * @Author: 陈乾龙
 * @Date: 2021-10-29 13:50:00
 * @LastEditTime: 2021-11-05 21:16:37
 * @LastEditors: Please set LastEditors
 * @Description: 
 * @FilePath: \hifar-platform-client\src\components\HEditTable\index.js
 */
import { isArray, isObject, isString, isNumber, merge } from 'lodash'
import T from "ant-design-vue/es/table/Table";
import "./HEditTable.less";
import { randomUUID } from '@/utils/util'
export default {
  props: {
    uid: {
      type: String
    },
    columns: {
      type: Array,
      default: () => []
    },
    data: {
      type: Function,
      default: () => undefined
    },
    height: {
      type: [Number, String]
    },
    maxHeight: {
      type: [Number, String]
    },
    border: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      default: 'small'
    },
    loading: {
      type: Boolean,
      default: false
    },
    rowClassName: {
      type: [String, Function]
    },
    showSeq: {
      type: Boolean,
      default: true
    },
    showPagination: {
      type: Boolean,
      default: true
    },
    pageSize: {
      type: Number,
      default: 20
    },
    pageNum: {
      type: Number,
      default: 1
    },
    showSizeChanger: {
      type: Boolean,
      default: true
    },
    editConfig: {
      type: Object,
      default: () => undefined
    },
    editRules: {
      type: Object,
      default: () => undefined
    },
    autoLoad: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    loading: {
      handler(val) {
        this.localLoading = loading
      }
    },
    columns: {
      immediate: true,
      handler(val) {
        if (isArray(val)) {
          this.localColumns = val
        } else {
          this.localColumns = []
        }
      }
    }
  },
  data() {
    return {
      uuid: randomUUID(),
      localLoading: this.loading || false,
      localColumns: this.columns || [],
      localData: [],
      localPagination: Object.assign({}, T.props.pagination, {
        showTotal: (total, range) => {
          return range[0] + '-' + range[1] + ' 共' + total + '条'
        }
      }),
      localHeight: this.height,
      localDataSource: []
    }
  },
  created() {
    this.localPagination = ['auto', true].includes(this.showPagination) && Object.assign({}, this.localPagination, {
      current: this.pageNum,
      pageSize: this.pageSize,
      showSizeChanger: this.showSizeChanger
    });
    if (this.autoLoad) {
      this.loadData()
    }
  },
  methods: {
    renderColumns() {
      let columns = null
      columns = this.localColumns.map(item => {
        return {
          field: item.key,
          ...item
        }
      })
      if (this.showSeq) {
        columns.unshift({
          type: 'seq',
          title: '#',
          width: 60,
          minWidth: 60,
          resizable: false,
          align: 'center',
        })
      }
      return columns
    },
    renderTable() {
      let props = {
        id: this.uid || this.uuid,
        height: this.localHeight || '100%',
        autoResize: true,
        syncResize: true,
        resizable: true,
        strip: true,
        border: this.border,
        round: true,
        size: this.size,
        loading: this.localLoading,
        'highlight-current-row': true,
        'highlight-hover-row': true,
        'highlight-current-column': true,
        'highlight-hover-column': true,
        'row-class-name': this.rowClassName,
        'show-overflow': true,
        'show-header-overflow': true,
        'show-footer-overflow': true,
        data: this.localDataSource
      }
      let events = {}
      if (this.maxHeight) {
        props.maxHeight = this.maxHeight
      }
      if (this.editConfig) {
        props.editConfig = this.editConfig
        props.keepSource = true
        props.editRules = this.editRules
        events['edit-actived'] = this.handleEditActived
        events['edit-closed'] = this.handleEditClosed
      }
      props.columns = this.renderColumns()
      return this.$createElement('div', {
        class: 'h-edit-table-wrapper'
      }, [
        this.$createElement('vxe-grid', {
          ref: this.uid || this.uuid,
          props: props,
          scopedSlots: {
            empty: (params) => {
              return <a-empty style="margin:10px 0" />
            }
          },
          on: events,

        })
      ])
    },
    renderPagination() {
      if (this.showPagination && this.localData.length > this.localPagination.pageSize) {
        return this.$createElement('div', {
          class: 'h-eidt-table-pagination'
        }, [
          this.$createElement('a-pagination', {
            attrs: {
              ...this.localPagination,
              size: 'small'
            },
            style: {
              textAlign: 'right',
              width: '100%',
              padding: '10px 0'
            },
            on: {
              change: this.paginationChange,
              showSizeChange: this.sizeChange
            }
          })
        ])
      }
      return null
    },
    paginationChange() { },
    sizeChange() { },
    refresh(type) {
      if (type) {
        this.loadData({
          current: 1
        })
      } else {
        this.loadData()
      }
    },
    loadData(pagination, filters, sorter) {
      if (this.localLoading) return
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
          let dataSource = r.records || r.data || []
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
          console.log('测试数据', this.localDataSource)
          this.calculateTableHeight(dataSource)
          this.localLoading = false
        }).catch(err => {
          this.localDataSource = []
          this.localHeight = 200
          this.localLoading = false
        })
      }
    },
    /**
     * @Date: 2021-11-02 11:54:47
     * @Author: 陈乾龙
     * @description:动态计算table的高度
     */
    calculateTableHeight(data) {
      let height = 200
      if (data.length > 0) {
        if (data.length < this.localPagination.pageSize) {
          height = data.length * 40
          if (height < 200) {
            height == 200
          }
          this.localHeight = height + 40
          return
        }
        this.localHeight = this.localPagination.pageSize * 40 + 40
        return
      }
      this.localHeight = 200
      return
    },
    /**
     * @Date: 2021-11-03 11:43:45
     * @Author: 陈乾龙
     * @description: 插入一行数据
     * @param {*} data
     */
    insert(data = {}) {
      let table = this.table()
      table.insert(data)
      this.$nextTick(() => {
        let { tableData } = table.getTableData()
        this.calculateTableHeight(tableData)
      })
    },
    /**
     * @Date: 2021-11-03 11:44:02
     * @Author: 陈乾龙
     * @description: 
     * @param {*} params 包含行数据，列数据，行下标，列下标 {row,column,rowIndex,columnIndex,$rowIndex,$columnIndex}
     */
    delete(params) {
      let table = this.table()
      table.remove(params.row)
      this.calculateTableHeight(table.getTableData().tableData)
    },
    /**
     * @Date: 2021-11-03 11:41:33
     * @Author: 陈乾龙
     * @description: 获取当前表格的数据（完整的全量表体数据、处理条件之后的全量表体数据、当前渲染中的表体数据、当前渲染中的表尾数据）
     * @return {fullData, visibleData, tableData, footerData}
     */
    getTableData() {
      return this.table().getTableData()
    },
    /**
     * @Date: 2021-11-03 11:42:41
     * @Author: 陈乾龙
     * @description: 获取数据，和 data 的行为一致，也可以指定索引获取数据
     * @param rowIndex 行索引
     * @return {fullData, visibleData, tableData, footerData}
     */
    getData(rowIndex) {
      if (rowIndex != undefined) {
        return this.table().getData(rowIndex)
      }
      return null
    },
    /**
     * @Date: 2021-11-03 11:43:02
     * @Author: 陈乾龙
     * @description: 获取表格数据集（获取插入、删除、更改的数据，对于增删改查表格非常方便）
     * @return {insertRecords, removeRecords, updateRecords}
     */
    getRecordset() {
      return this.table().getRecordset()
    },
    /**
     * @Date: 2021-11-03 11:47:17
     * @Author: 陈乾龙
     * @description:  快速校验，如果存在记录不通过的记录，则返回不再继续校验（异步校验除外）；
     *                如果第一个参数为 true 则校验当前表格数据，如果指定 row 或 rows 则校验指定行或多行，如果不指定数据，则默认只校验临时变动的数据，例如新增或修改。
     *                该回调函数会在校验结束后被调用 callback(errMap)。若不传入回调函数，则会返回一个 promise
     * @param {*} rows
     * @param {*} callback
     * @return {*}
     */
    validate(rows, callback) {
      return this.table().validate(rows, callback)
    },
    table() {
      return this.$refs[this.uid || this.uuid]
    },
    handleEditActived() {
      this.$emit('eidtStatus', this.getRecordset())
    },
    handleEditClosed() {
      this.$emit('eidtStatus', this.getRecordset())
    }
  },


  render(h) {
    return h('div', {
      class: {
        'h-edit-table': true
      },
    },
      [
        this.renderTable(), this.renderPagination()
      ])
  }
}