<!--
 * @Author: 赵峰
 * @Date: 2021-09-29 16:29:40
 * @LastEditTime: 2021-09-29 16:53:30
 * @LastEditors: 赵峰
 * @Descripttion: 外部服务调用记录
 * @FilePath: \hifar-platform-client\src\views\hifar\sys\interface\OutfaceMonitoring.vue
-->
<template>
  <div ref="pageWrapper" class="h-custom-layout" style="height: 100%; position: relative">
    <h-card fixed :bordered="true">
      <template slot="title"> 外部服务调用记录 </template>
      <h-search
        v-model="queryParams"
        slot="search-form"
        size="small"
        :showToggleButton="true"
        :data="searchBar"
        @change="refresh"
      />
      <h-vex-table
        slot="content"
        ref="processFlieTable"
        :scroll="{ x: true }"
        :columns="columns"
        :data="loadData"
        :rowKey="(record) => record.id"
      >
      </h-vex-table>
    </h-card>
  </div>
</template>

<script>
import moment from 'moment'
import { getAction, postAction } from '@/api/manage'
export default {
  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper,
    }
  },
  data() {
    return {
      moment,
      queryParams: {},
      selectedRowKeys: [],
      url: {
        list: '/BaseApiOutLogBusiness/listPage',
      },
      detailData: {},
      loadData: (params) => {
        let data = {
          ...this.queryParams,
          ...params,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
      searchBar: [
        {
          title: '登录IP',
          key: 'c_reqIp_7',
          formType: 'input',
        },
        {
          title: '应用编号',
          key: 'c_appCode_7',
          formType: 'input',
        },
        {
          title: '服务编号',
          key: 'c_reqKey_7',
          formType: 'input',
        },
        {
          title: '日志内容',
          key: 'c_reqCtx_7',
          formType: 'input',
        },
        {
          title: '响应编号',
          key: 'c_resCode_7',
          formType: 'input',
        },
      ],
      // 表头
      columns: [
        {
          title: '登录IP',
          align: 'left',
          width: 110,
          dataIndex: 'reqIp',
        },
        {
          title: '应用编号',
          align: 'left',
          dataIndex: 'appCode',
        },
        {
          title: '服务编号',
          align: 'left',
          dataIndex: 'reqKey',
        },
        {
          title: '响应编号',
          align: 'left',
          dataIndex: 'resCode',
          minWidth: 40,
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '消息描述 ',
          align: 'left',
          dataIndex: 'resMsg',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '日志内容',
          align: 'left',
          dataIndex: 'reqCtx',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '响应内容',
          align: 'left',
          dataIndex: 'resCtx',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '耗时 ',
          align: 'left',
          dataIndex: 'costTime',
          customRender: (text, record) => {
            return text ? text + 'ms' : '--'
          },
        },
        {
          title: '状态 ',
          align: 'left',
          dataIndex: 'status',
          customRender: (text, record) => {
            return text == 1 ? '启用' : text == 99 ? '删除' : '--'
          },
        },
        {
          title: '用户名称 ',
          align: 'left',
          dataIndex: 'createUserCode',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '创建时间 ',
          align: 'left',
          dataIndex: 'createTime',
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
      ],
    }
  },
  methods: {
    refresh() {
      this.$refs.processFlieTable.refresh(true)
      this.selectedRowKeys = []
    },
  },
}
</script>