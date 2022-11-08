<!--
 * @Author: 马潭龙
 * @Date: 2021-11-17 18:45:52
 * @LastEditTime: 2021-11-25 16:14:46
 * @LastEditors: 马潭龙
 * @Descripttion: 交接班详情
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\handover\modules\handoverDetail.vue
-->
<template>
  <h-modal
    ref="handoverDetail"
    :visible="visible"
    inner
    destroyOnClose
    @cancel="handleCancel"
    width="70%"
    title="交接班记录详情"
  >
    <h-desc title="基本信息" bordered size="small" :column='2' labelWidth="120px">
      <h-desc-item label="交班人"> {{ headDetail.surrenderUserName || '--' }}</h-desc-item>
      <h-desc-item label="接班人"> {{ headDetail.receiveUserName || '--' }}</h-desc-item>
      <h-desc-item label="交接时间">
        {{ moment(parseInt(headDetail.handoverTime)).format('YYYY-MM-DD HH:mm') || '--' }}
      </h-desc-item
      >
      <h-desc-item label="环境状态"> {{ headDetail.envStatus==1? '正常':'异常' || '--' }}</h-desc-item>
      <h-desc-item label="测试状态"> {{ headDetail.testStatus==1? '有错误':'无错误' || '--' }}</h-desc-item>
      <h-desc-item label="工具状态"> {{ headDetail.toolStatus==1? '齐全':'缺失' || '--' }}</h-desc-item>
      <h-desc-item label="设备状态"> {{ headDetail.deviceStatus==1? '有故障':'无故障' || '--' }}</h-desc-item>
      <h-desc-item label="设备运行数量" span='2'> {{ headDetail.runNum || '--' }}</h-desc-item>
      <h-desc-item label="密级" span='2'> {{ headDetail.secretLevel || '--' }}</h-desc-item>
      <h-desc-item label="创建人" span='2'> {{ headDetail.createUserName || '--' }}</h-desc-item>
      <h-desc-item label="创建时间" span='2'> {{ moment(parseInt(headDetail.createTime)).format('YYYY-MM-DD HH:mm') || '--'
        }}
      </h-desc-item>
      <h-desc-item label="更新时间" span='2'> {{ moment(parseInt(headDetail.updateTime)).format('YYYY-MM-DD HH:mm') || '--'
        }}
      </h-desc-item>
      <h-desc-item label="更新人" span='2'> {{ headDetail.updateUserName }}</h-desc-item>
      <h-desc-item label="备注" span='2'> {{ headDetail.remarks || '--' }}</h-desc-item>
    </h-desc>
    <!-- 执行任务总览 -->
    <h-desc title="执行任务总览">
      <h-vex-table
        ref="handoverTask"
        bordered
        :pagination="false"
        :columns="columns"
        :data="loadData"
        style="width: 100%; height: 300px"
      />
    </h-desc>
    <div slot="footer">
      <a-button @click="handleCancel" type="ghost-danger"> 关闭</a-button>
    </div>
  </h-modal>
</template>

<script>
  import { postAction } from '@/api/manage'
  import moment from 'moment'

  export default {
    data() {
      return {
        moment,
        id:"",
        visible: false,
        headDetail: {},
        url: {
          headDetail: '/HfEnvTestHandoverRecordBusiness/queryById'
        },
        // 执行任务总览表格
        columns: [
          {
            title: '委托单号',
            align: 'left',
            dataIndex: 'entrustNo',
            minWidth: 10,
            customRender: (text, record) => {
              return text || '--'
            }
          },
          {
            title: '试验项目',
            align: 'left',
            dataIndex: 'unitName',
            minWidth: 10,
            customRender: (text, record) => {
              return text || '--'
            }
          },
          {
            title: '使用设备',
            align: 'left',
            dataIndex: 'equipName',
            minWidth: 25,
            customRender: (text, record) => {
              return text || '--'
            }
          },
          {
            title: '试件数量(件)',
            align: 'left',
            dataIndex: 'sampleNum',
            minWidth: 10,
            customRender: (text, record) => {
              return text || '--'
            }
          },
          {
            title: '试验地点',
            align: 'left',
            dataIndex: 'workName',
            customRender: (text, record) => {
              return text || '--'
            }
          },
          {
            title: '过程描述',
            align: 'left',
            dataIndex: 'processDesc',
            customRender: (text, record) => {
              return text || '--'
            }
          },
          {
            title: '开始时间',
            align: 'left',
            dataIndex: 'realStartTime',
            minWidth: 30,
            customRender: (text, record) => {
              return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD HH:mm') : '--'
            }
          },
          {
            title: '结束时间',
            align: 'left',
            dataIndex: 'realEndTime',
            minWidth: 30,
            customRender: (text, record) => {
              return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD HH:mm') : '--'
            }
          },
          {
            title: '备注',
            align: 'left',
            dataIndex: 'remark',
            customRender: (text, record) => {
              return text || '--'
            }
          }
        ],
        loadData: (params) => {
          return postAction(this.url.headDetail, { id: this.id }).then((res) => {
            if (res.code == 200) {
              return res.data.taskTestList
            }
          })
        }
      }
    },
    methods: {
      show(val) {
        this.id=val.id;
        this.visible = true
        this.getheadDetail(val.id)
      },
      handleCancel() {
        this.visible = false
      },
      // 详情数据
      getheadDetail(id) {
        postAction(this.url.headDetail, { id: id }).then((res) => {
          if (res.code == 200) {
            this.headDetail = res.data
          }
        })
      }

    }

  }
</script>

<style>
</style>