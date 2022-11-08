<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-27 09:58:24
 * @LastEditTime: 2021-11-30 15:15:35
 * @LastEditors: 马潭龙
 * @Description: 系统日志管理
 * @FilePath: \hifar-platform-client\src\views\system\LogList.vue
-->
<template>
  <div class="log-list">
    <h-card fixed>
      <h-search v-model="queryParams" slot="search-form" :data="searchData" @change="refresh"/>
      <a-tabs slot="table-operator" v-model="activeTab" type="card" @change="handleTabsChange">
        <a-tab-pane :key="1" tab="登录日志"/>
        <a-tab-pane :key="2" tab="操作日志"/>
      </a-tabs>
      <h-card slot="content" fixed :bordered="false">
        <template slot="table-operator">
          <a-button v-has="'log:derive'" type="ghost-warning" size="small" icon="export" @click="handleExport">导出日志
          </a-button>
        </template>
        <h-vex-table ref="logTable" slot="content" :columns="columns" :data="loadData"></h-vex-table>
      </h-card>
    </h-card>
  </div>
</template>

<script>
  import moment from 'moment'
  import { postAction, downFile } from '@/api/manage'

  export default {
    data() {
      return {
        activeTab: 1,
        queryParams: {},
        dateTime: [moment().subtract(2, 'days'), moment()],
        searchData: [
          {
            title: '日志内容',
            key: 'c_logContent_7',
            formType: 'input'
          },
          {
            title: '操作人',
            key: 'c_createUserName_7',
            formType: 'input'
          },
          {
            title: '操作时间',
            key: 'c_createTime_1',
            formType: 'dateRangePick',
            showTime: true,
            format: 'YYYY-MM-DD'
          },
          {
            title: '操作类型',
            key: 'c_optType_1',
            formType: 'dict',
            dictCode: 'hf_sys_log_opt_type'
          }
        ],
        columns: [
          {
            title: '日志内容',
            dataIndex: 'logContent',
            customRender: (text) => {
              return text || '--'
            }
          },
          {
            title: '操作人名称',
            dataIndex: 'createUserName',
            customRender: (text) => {
              return text || '--'
            }
          },
          {
            title: 'IP',
            dataIndex: 'reqIp',
            customRender: (text) => {
              return text || '--'
            }
          },
          // {
          //   title: '耗时（ms）',
          //   dataIndex: 'costTime',
          //   customRender: (text) => {
          //     return text || '--'
          //   },
          // },
          {
            title: '创建时间',
            dataIndex: 'createTime',
            customRender: (text, record) => {
              return text ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
            }
          }
        ],
        url: {
          login: '/SysLogBusiness/listPageLogin',
          exportLogin: '/SysLogBusiness/exportExcelLogin',
          busi: '/SysLogBusiness/listPageBusiness',
          exportBusi: '/SysLogBusiness/exportExcelBusiness'
        },
        loadData: (params) => {
          let data = {
            ...params,
            ...this.queryParams
          }
          if (data.c_createTime_1 && data.c_createTime_1.length > 0) {
            data.beginTime = moment(data.c_createTime_1[0]).format('YYYY-MM-DD') + ' 00:00:00'
            data.endTime = moment(data.c_createTime_1[1]).format('YYYY-MM-DD') + ' 23:59:59'
            data.beginTime = moment(data.beginTime).format('X') * 1000
            data.endTime = moment(data.endTime).format('X') * 1000
          }
          delete data.c_createTime_1
          return postAction(this.activeTab == 1 ? this.url.login : this.url.busi, data).then((res) => {
            if (res.code == 200) {
              return res.data
            }
          })
        }
      }
    },
    methods: {
      refresh(bool = false) {
        this.$refs.logTable.refresh(bool)
      },

      handleTabsChange(v) {
        this.activeTab = v
        if (v == 2 && this.columns.length < 5) {
          let optTypeColumn = {
            title: '操作类型',
            dataIndex: 'optType',
            customRender: (text) => {
              switch (text) {
                case '1':
                  return '查询'
                case '2':
                  return '添加'
                case '3':
                  return '修改'
                case '4':
                  return '删除'
                case '5':
                  return '导入'
                case '6':
                  return '导出'
                default:
                  return '--'
              }
            }
          }
          this.columns.splice(3, 0, optTypeColumn)
        } else if (this.columns.length >= 5) {
          this.columns.splice(3, 1)
        }

        this.$nextTick(() => {
          this.refresh(true)
        })
      },
      handleExport() {
        let fileName = moment().format('YYYY-MM-DD')
        let url = null
        let beginTime = null,
          endTime = null
        if (this.activeTab == 1) {
          url = this.url.exportLogin
          fileName = '登录日志' + fileName
        } else if (this.activeTab == 2) {
          url = this.url.exportBusi
          fileName = '操作日志' + fileName
        }
        this.$confirm({
          title: '日志导出',
          content: (h) => {
            return h(
              'h-range-picker',
              {
                style: {
                  width: '100%',
                  marginTop: '20px'
                },
                attrs: {
                  size: 'large',
                  placeholder: '选择时间',
                  value: this.dateTime
                },
                on: {
                  change: (dateString, date) => {
                    console.log(dateString, date)
                    beginTime = date[0].valueOf()
                    endTime = date[1].valueOf()
                  }
                }
              },
              [
                h(
                  'span',
                  {
                    slot: 'addonBefore'
                  },
                  '时间范围'
                )
              ]
            )
          },
          onOk: (close) => {
            let { dateTime } = this
            let data = {
              beginTime: dateTime[0].valueOf(),
              endTime: dateTime[1].valueOf()
            }
            let param = {
              beginTime: beginTime ? beginTime : data.beginTime,
              endTime: endTime ? endTime : data.endTime
            }
            param.beginTime_1 = moment(param.beginTime).format('YYYY-MM-DD') + ' 00:00:00'
            param.endTime_1 = moment(param.endTime).format('YYYY-MM-DD') + ' 23:59:59'
            param.beginTime = moment(param.beginTime_1).format('X') * 1000
            param.endTime = moment(param.endTime_1).format('X') * 1000

            if (!data.beginTime || !data.endTime) {
              this.$message.error('请选择时间')
              return
            }
            downFile(url, param).then((data) => {
              if (!data) {
                this.$message.warning('文件下载失败')
                return
              }
              if (typeof window.navigator.msSaveBlob !== 'undefined') {
                window.navigator.msSaveBlob(new Blob([data], { type: 'application/vnd.ms-excel' }), fileName + '.xls')
              } else {
                let url = window.URL.createObjectURL(new Blob([data], { type: 'application/vnd.ms-excel' }))
                let link = document.createElement('a')
                link.style.display = 'none'
                link.href = url
                link.setAttribute('download', fileName + '.xls')
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link) //下载完成移除元素
                window.URL.revokeObjectURL(url) //释放掉blob对象
              }
              close()
            })
          }
        })
      }
    }
  }
</script>

<style lang="less">
  .log-list {
    height: 100%;
    width: 100%;
    overflow: hidden;
    .h-card {
      .ant-card-body {
        padding: 0;
      }
    }
    .ant-tabs-bar {
      margin-bottom: 5px;
    }
  }
</style>
