/*
 * @Author: 陈乾龙
 * @Date: 2021-08-18 15:01:23
 * @LastEditTime: 2021-11-24 11:53:24
 * @LastEditors: 赵峰
 * @Description: 文件上传组件
 * @FilePath: \hifar-platform-client\src\components\HUpload\HUploadFile.js
 */
import "./HUpload.less";
import {randomUUID} from "@/utils/util";
import UploadMinxin from "./UploadMinxin";
import moment from 'moment'
import {filter, isArray} from "lodash"

export default {
  mixins: [UploadMinxin],
  props: {
    /**
     * @Date: 2021-07-12 11:09:35
     * @Author: 陈乾龙
     * @description: 是否允许多文件上传
     */
    multiple: {
      type: Boolean,
      default: true,
    },
    /**
     * @Date: 2021-07-12 11:11:29
     * @Author: 陈乾龙
     * @description: 上传文件的类型，文件类型会在调试模式下打印到控制台
     */
    accept: {
      type: String,
      default: '',
    },
    /**
     * @Date: 2021-07-12 11:15:46
     * @Author: 陈乾龙
     * @description: 上传文件返回的文件列表信息
     * @param  [{name:xx,}]
     */
    value: {
      type: Array,
      default: () => [],
    },
    /**
     * @Date: 2021-07-12 12:00:08
     * @Author: 陈乾龙
     * @description: 上传文件的接口地址
     */
    action: {
      type: String,
      default: '',
    },
    /**
     * @Date: 2021-07-12 13:39:26
     * @Author: 陈乾龙
     * @description: 接口请求类型，这里只支持POST,GET
     */
    method: {
      type: String,
      default: 'POST',
    },
    /**
     * @Date: 2021-07-12 13:53:40
     * @Author: 陈乾龙
     * @description: maxSize 文件大小最大，单位kB；文件大小最小，单位kB ; 如果设置成0则认为不限制大小
     */
    maxSize: {
      type: Number,
      default: 0,
    },
    minSize: {
      type: Number,
      default: 0,
    },
    /**
     * @Date: 2021-08-19 09:27:25
     * @Author: 陈乾龙
     * @description: 最大文件数量，文件数量默认至少为1
     */
    max: {
      type: Number,
      default: 1
    },
    /**
     * @Date: 2021-08-19 09:45:58
     * @Author: 陈乾龙
     * @description: 图片的长宽
     */
    width: {
      type: [Number, String],
      default: 120
    },
    height: {
      type: [Number, String],
      default: 160
    },
    /**
     * @Date: 2021-08-19 14:47:45
     * @Author: 陈乾龙
     * @description: 文件保存目录
     */
    fileDir: {
      type: String,
      default: 'hifar/idm'
    },
    /**
     * @Date: 2021-08-19 14:48:22
     * @Author: 陈乾龙
     * @description: 是否设置密级
     */
    showSecret: {
      type: Boolean,
      default: false
    },
    /**
     * @Date: 2021-08-31 13:59:22
     * @Author: 陈乾龙
     * @description: 是否公用
     */
    isPublic: {
      type: Boolean,
      default: false
    },
    /**
     * @Date: 2021-09-16 17:52:29
     * @Author: 陈乾龙
     * @description: 不可编辑
     */
    isEdit: {
      type: Boolean,
      default: true
    },
    /**
     *   是否替换
     */
    isReplace: {
      type: Boolean,
      default: false
    },
    /**
     * 是否详细报告表单名称 （名称在备注）
     */
    isShowForm: {
      type: Boolean,
      default: false
    },
    // 是否可以给文件填写备注
    isWriteRemarks: {
      type: Boolean,
      default: false
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        if (isArray(val)) {
          console.log('文件列表更新', val)
          this.fileList = val
        } else {
          this.fileList = []
        }
      },
    }
  },
  data() {
    return {
      inputConfig: {
        ref: "HUpload" + randomUUID()
      },
      columns: [
        [
          {
            title: "文件名称",
            dataIndex: 'name',
            minWidth: 130,
            scopedSlots: {
              customRender: "name"
            }
          },
          {
            title: "文件大小",
            dataIndex: "size",
            minWidth: 100,
            customRender: (text) => {
              let size = parseFloat(text) / 1024 / 1024
              return size.toFixed(2) + 'MB'
            }
          },
          {
            title: "上传时间",
            dataIndex: "uploadTime",
            minWidth: 180,
            customRender: (text) => {
              return text ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
            }
          },
          {
            title: "上传进度",
            dataIndex: "percent",
            width: 240,
            scopedSlots: {
              customRender: 'percent'
            }
          },
        ],
        [
          {
            title: '密级选择',
            dataIndex: "secret",
            width: 180,
            scopedSlots: {
              customRender: "secret"
            }
          }
        ],
        [
          {
            title: '操作',
            dataIndex: 'actions',
            width: 80,
            fixed: 'right',
            align: 'center',
            scopedSlots: {
              customRender: 'actions'
            }
          }
        ],
        [
          {
            title: '报告表单',
            dataIndex: 'remarks',
            width: 180,
            scopedSlots: {
              customRender: 'remarks'
            }
          },
          {
            title: '表单标签',
            dataIndex: 'label',
            width: 180,
            scopedSlots: {
              customRender: 'label'
            }
          }
        ],
        [
          {
            title: '备注',
            dataIndex: 'remarks',
            width: 250,
            scopedSlots: {
              customRender: 'remarks'
            }
          }
        ]
      ]
    }
  },
  methods: {
    /**
     * 替换文件
     * @param file
     */
    handleReplace(file) {
      console.log('file', file)
      file.replace = true
      this.extendRecords = file
      this.clickUpload()
    },
    renderUploadAction(h) {
      let actions = []
      if (this.isEdit) {
        actions.push(<a-button size="small" type="ghost-primary" icon="plus"
                               onclick={this.clickUpload}>{this.fileList.length ? '继续上传' : '上传文件'}</a-button>)
      }
      return h('div', {
          slot: "table-operator",
          class: "h-upload-file-actions"
        },
        [
          this.renderFilesInfo(h),
          h('a-space', {
            props: {
              size: 'small'
            }
          }, actions)
        ]
      )
    },
    renderFilesInfo(h) {
      let info = {
        number: this.fileList.length,
        size: 0
      }
      this.fileList.map(item => {
        info.size += item.size / 1024 / 1024
      })
      return (
        <div>
          总共有{info.number}个文件，共{info.size.toFixed(2)}MB
        </div>
      )
    },
    renderFilesList(h) {
      if (!this.fileList.length) {
        return (
          <a-empty slot="content"/>
        )
      } else {
        var columns = []
        if (this.isShowForm) {
          columns = columns.concat(this.columns[3])
        }
        if (!this.showSecret) {
          columns = columns.concat(this.columns[0], this.columns[2])
        } else {
          columns = columns.concat(this.columns[0], this.columns[1], this.columns[2])
        }
        if (this.isWriteRemarks) {
          columns = columns.concat(this.columns[4])
        }
        if (!this.isEdit) {
          columns = filter(columns, o => {
            return o.dataIndex != 'percent'
          })
        }
        return h(
          'vxe-table',
          {
            slot: "content",
            props: {
              // showHeader: false,
              columns: columns,
              data: this.fileList,
              size: 'small',
              border: true,
              round: true,
              stripe: true,
              'highlight-current-row': true,
              'highlight-hover-row': true,
              'highlight-current-column': true,
              'highlight-hover-column': true,
              // 'resizable': true,
              'show-overflow': 'tooltip',
              'show-header-overflow': 'tooltip',
            },
            scopedSlots: {
              remarks: (text, record) => {
                return this.isWriteRemarks && this.isEdit? (
                  <aInput readOnly={!this.isEdit} value={record.remarks} onBlur={(e) => {
                    record.remarks = e.target.value
                  }}/>
                ) : (
                  <div>
                    <span>{text}</span>
                  </div>
                )
              },
              label: (text, recode) => {
                return (
                  <div>
                    <span>{text}</span>
                  </div>
                )
              },
              name: (text, record) => {
                return (
                  <div class='file-name'>
                    <h-icon type={this.$options.filters.fileTypeFilter(record.type)}/>
                    <span>{text}</span>
                  </div>
                )
              },
              percent: (text, record) => {
                return (
                  <div style="width:170px;">
                    <a-progress size="small" percent={record.percent}
                                strokeColor={record.replaceStatus == '1' ? 'gray' : ""}
                                format={() => this.percentFormat(record)}/>
                  </div>
                )
              },
              secret: (text, record) => {
                return (
                  <h-dict-select v-model={record.secretLevel} dictCode="hf_sys_file_secret"/>
                  // 附件上传密级选择专用下拉框（暂时不用）
                  // <h-file-secret-level-select v-model={record.secretLevel}/>
                )
              },
              actions: (text, record) => {
                let btns = []
                if (this.isEdit) {
                  btns.push(
                    <a-popconfirm title="确定删除吗?" onconfirm={() => this.handleDelete(record)}>
                      <h-icon class="danger-text" type="icon-shanchu"/>
                    </a-popconfirm>
                  )
                  if (this.isReplace) {
                    btns.push(
                      <a-popconfirm title="确定替换吗?" onconfirm={() => this.handleReplace(record)}>
                        <a-icon type="swap"/>
                      </a-popconfirm>
                    )
                  }
                }
                if (record.url) {
                  btns.push(
                    <a-icon type="download" class="primary-text" title={'下载'}
                            onclick={() => this.handleDownload(record.url, record.name, record.fileId)}/>
                  )
                }
                return this.h('a-space', {
                  size: 'small'
                }, btns)
              }
            }
          },
          this.renderColumns(columns)
        )
      }
    },
    percentFormat(file) {
      if (file.status == 'exception') {
        return '上传失败'
      } else if (file.status == "normal") {
        return file.pretreatment !== 100 ? '预处理' + file.pretreatment + '%' : "上传中" + file.percent + '%'
      } else {
        return '上传成功'
      }
    },
    renderColumns(columns) {
      return columns.map(item => {
        return this.renderColumn(item)
      })
    },
    renderColumn(itemColumn) {
      let _h_ = this.$createElement
      let props = Object.assign({}, itemColumn)
      if (itemColumn.scopedSlots) {
        // 判断是否是自定义slot
        return _h_('vxe-table-column', {
          props: props,
          scopedSlots: {
            default: function (props) {
              let key = itemColumn.dataIndex || itemColumn.scopedSlots.customRender
              if (props.$table.$scopedSlots[itemColumn.scopedSlots.customRender]) {
                return props.$table.$scopedSlots[itemColumn.scopedSlots.customRender](props.row[key], props.row, props.rowIndex)
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
    renderFilesLoader(h) {
      return h('h-card', {
        class: 'h-upload-file',
        props: {
          bordered: false
        }
      }, [
        this.renderUploadAction(h),
        this.renderFilesList(h)
      ])
    }
  },
  render(h) {
    return h('div', {
      class: 'h-upload-wrapper no-padding'
    }, [
      this.renderInput(Object.assign({}, this.inputConfig, {multiple: this.multiple, accept: this.accept || '*',})),
      this.renderFilesLoader(h)
    ])
  }
}