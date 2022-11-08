<!--
 * @Author: 赵峰
 * @Date: 2021-10-14 10:33:49
 * @LastEditTime: 2021-10-14 10:36:51
 * @LastEditors: 赵峰
 * @Descripttion: 报告信息
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\entrustment\components\TestReportInfo.vue
-->
<template>
  <h-card :bordered='true' fixed>
    <h-edit-table
      ref='reportMakeTable'
      slot='content'
      :columns='columns'
      :data='loadData'
      :loading="tableLoading"
      :editConfig="editConfig"
      :scroll='{ x: true }'
    ></h-edit-table>
    <report-make-modal ref='ReportMakeModal' @change='refresh(true)'></report-make-modal>
    <report-detail-modal ref='ReportDetailModal'></report-detail-modal>
  </h-card>
</template>

<script>
import moment from 'moment'
import {downloadFile, postAction} from '@/api/manage'
import mixin from '@/views/hifar/hifar-environmental-test/reports/mixin'
import ReportMakeModal from '@/views/hifar/hifar-environmental-test/reports/modules/ReportMakeModal'
import ReportDetailModal from '@/views/hifar/hifar-environmental-test/reports/modules/ReportDetailModal'
import {ACCESS_TOKEN, TENANT_ID} from '@/store/mutation-types'
import Vue from 'vue'
import {cloneDeep} from "lodash";

export default {
  mixins: [mixin],
  props: {
    entrustCode: {
      type: String
    },
    isExternalManage: {
      type: Boolean
    }
  },
  components: {
    ReportMakeModal,
    ReportDetailModal
  },
  data() {
    return {
      moment,
      queryParams: {},
      url: {
        list: '/HfEnvReportBusiness/listPage',
        autoFileUrl: '/HfEnvReportBusiness/authUpload',
        logicRemoveById: '/HfEnvReportBusiness/logicRemoveById',
        modifyReportNo: "/HfEnvReportBusiness/modifyReportNo"
      },
      tableLoading:false,
      editConfig: {
        trigger: 'click',
        mode: 'cell',
        autoClear: true,
        showIcon: true,
        showStatus: true,
        showUpdateStatus: true,
        showAsterisk: true,
        showInsertStatus: true,
      },
      columns: [
        {
          title: '报告编号',
          align: 'left',
          key: 'reportCode',
          width: 160,
          editRender: {
            name: 'edit',
            renderEdit: (h, renderOpts, {row, column, rowIndex}) => {
              return h('a-input', {
                props: {
                  value: row[column.property],
                },
                style: {
                  width: '100%',
                },
                on: {
                  change: (value) => {
                    row[column.property] = value.target.value
                  },
                  blur: () => {
                    this.reportCodeHandleEdit(row, rowIndex)
                  }
                },
              })
            },
            renderCell: (h, renderOpts, {row, column}) => {
              return h('span', {}, [row[column.property] || '--'])
            },
          }
        },
        {
          title: '状态',
          align: 'left',
          key: 'status',
          cellRender: {
            name: 'cell',
            renderCell: (h, renderOpts, {row, column}) => {
              return h('a-badge', {
                props: {
                  color: this.reportStatusColorFilterMethods(row[column.property]),
                  text: this.reportStatusFilterMethods(row[column.property])
                }
              }, [])
            },
          }
        },
        {
          title: '委托单位',
          align: 'left',
          key: 'custName',
          cellRender: {
            name: 'cell',
            renderCell: (h, renderOpts, {row, column}) => {
              return row[column.property] || '--'
            },
          }
        },
        {
          title: '联系人',
          align: 'left',
          key: 'custLinkName',
          cellRender: {
            name: 'cell',
            renderCell: (h, renderOpts, {row, column}) => {
              return row[column.property] || '--'
            },
          }
        },
        {
          title: '联系方式',
          align: 'left',
          key: 'custLinkMobile',
          cellRender: {
            name: 'cell',
            renderCell: (h, renderOpts, {row, column}) => {
              return row[column.property] || '--'
            },
          }
        },
        {
          title: '运行单号',
          align: 'left',
          key: 'entrustCode',
          cellRender: {
            name: 'cell',
            renderCell: (h, renderOpts, {row, column}) => {
              return row[column.property] || '--'
            },
          }
        },
        {
          title: '委托单号',
          align: 'left',
          key: 'entrustNo',
          cellRender: {
            name: 'cell',
            renderCell: (h, renderOpts, {row, column}) => {
              return row[column.property] || '--'
            },
          }
        },
        {
          title: '试验项目',
          align: 'left',
          key: 'testName',
          cellRender: {
            name: 'cell',
            renderCell: (h, renderOpts, {row, column}) => {
              return row[column.property] || '--'
            },
          }
        },
        {
          title: '创建人 ',
          align: 'left',
          key: 'createUserName',
          cellRender: {
            name: 'cell',
            renderCell: (h, renderOpts, {row, column}) => {
              return row[column.property] || '--'
            },
          }
        },
        {
          title: '创建时间 ',
          align: 'left',
          key: 'createTime',
          cellRender: {
            name: 'cell',
            renderCell: (h, renderOpts, {row, column}) => {
              return row[column.property] && row[column.property] != 0 ? moment(parseInt(row[column.property])).format('YYYY-MM-DD HH:mm') : '--'
            },
          }
        },
        {
          title: '操作',
          fixed: 'right',
          width: 120,
          align: 'center',
          cellRender: {
            name: 'cell',
            renderCell: (h, renderOpts, params) => {
              return h('div', {}, [
                h('a-icon', {
                  props: {
                    type: "eye",
                    title: "详情",
                  },
                  attrs: {
                    class: "primary-text",
                  },
                  style: {
                    cursor: 'pointer'
                  },
                  on: {
                    click: () => {
                      this.handleDetail(params.row)
                    }
                  }
                }),
                this.isExternalManage ? h('a-upload', {
                  props: {
                    action: this.autoFileUrl,
                    data: {id: params.row.id},
                    headers: this.tokenHeader,
                    multiple: false,
                    'show-upload-list': false,
                  },
                  attrs: {
                    name: "file"
                  },
                  on: {
                    change: (e) => {
                      this.fileChange1(e)
                    }
                  }
                }, [h('a-divider', {
                  style: {
                    color: '#409eff'
                  },
                  attrs: {
                    type: "vertical"
                  }
                }), h('a-icon', {
                  attrs: {
                    title: "替换",
                    type: "swap"
                  },
                  style: {
                    cursor: "pointer"
                  }
                })]) : '',
                h('a-divider', {
                  style: {
                    color: '#409eff'
                  },
                  attrs: {
                    type: "vertical"
                  }
                }),
                params.row.pdfPath ? h('a-icon', {
                  class: {
                    'primary-text': true
                  },
                  style: {
                    cursor: "pointer"
                  },
                  attrs: {
                    title: "下载",
                    type: "download"
                  },
                  on: {
                    click: () => {
                      this.handleDownload(params.row.pdfPath, params.row.reportCode)
                    }
                  }
                }) : h('a-upload', {
                  props: {
                    action: this.autoFileUrl,
                    data: {id: params.row.id},
                    headers: this.tokenHeader,
                    multiple: false,
                    'show-upload-list': false,
                  },
                  attrs: {
                    name: "file"
                  },
                  on: {
                    change: (e) => {
                      this.fileChange(e)
                    }
                  }
                }, [h('a-icon', {
                  attrs: {
                    title: "上传",
                    type: "upload"
                  },
                  style: {
                    cursor: "pointer"
                  }
                })]),
                params.row.status == 1 || params.row.status == 30 || params.row.status == 50 ? h('span', {}, [
                  h('a-divider', {
                    style: {
                      color: '#409eff'
                    },
                    attrs: {
                      type: "vertical"
                    }
                  }),
                  h('a-popconfirm', {
                    attrs: {
                      title: "确定删除吗?"
                    },
                    on: {
                      confirm: () => {
                        this.handleDelete(params.row)
                      }
                    }
                  }, [h('a-icon', {
                    class: {'danger-text': true}, style: {
                      cursor: "pointer"
                    },
                    attrs: {
                      title: "删除",
                      type: "delete"
                    }
                  })]),
                ]) : ''
              ])
            },
          },
        }
      ],
      currentDataSource: [],
      loadData: (params) => {
        let data = {
          ...this.queryParams,
          ...params,
          c_entrustCode_7: this.entrustCode,
          isEntrustListReport: true
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            this.currentDataSource = cloneDeep(res.data.data)
            return res.data
          }
        })
      }
    }
  },

  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    },
    tokenHeader() {
      let head = {'token': Vue.ls.get(ACCESS_TOKEN)}
      let tenantid = Vue.ls.get(TENANT_ID)
      if (tenantid) {
        head['tenant_id'] = tenantid
      }
      return head
    },
    autoFileUrl() {
      return `${window._CONFIG['domianURL']}${this.url.autoFileUrl}`
    }
  },
  methods: {
    reportCodeHandleEdit(row, index) {
      if (row.reportCode !== this.currentDataSource[index].reportCode) {
        postAction(this.url.modifyReportNo, {id: row.id, reportCode: row.reportCode}).then(res => {
          if (res.code === 200) {
            this.$message.success('修改成功')
          }
        })
      }
    },
    fileChange({file}) {
      if (file.response && file.response.code === 200) {
        this.refresh()
      }
    },
    fileChange1({file}) {
      this.tableLoading = true
      if (file.response && file.response.code === 200) {
        this.refresh()
      }
    },
    refresh(bool = true) {
      this.$refs.reportMakeTable.refresh(bool)
    },
    handleDelete(record) {
      postAction(this.url.logicRemoveById, {delInfo: [record]}).then(res => {
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.refresh()
        } else {
          this.$message.error('删除失败')
        }
      })
    },
    handleDownload(filePath, fileName) {
      downloadFile(filePath, fileName + '.pdf')
    },
    // 详情
    handleDetail(record) {
      let type = 'detail'
      let activeKey = '1'
      this.$refs.ReportDetailModal.show(record.id, type, activeKey)
    }
  }
}
</script>