<template>
  <h-modal
    title="下载记录"
    inner
    fullScreen
    destroyOnClose
    :getContainer="getContainer"
    :visible="visible"
    @cancel="handleCancel"
  >
    <h-card :bordered="false" >
      <h-vex-table
        slot="content"
        ref="downloadRecordTable"
        :scroll="{ x: true }"
        :columns="columns"
        :data="loadData"
        :rowKey="(record) => record.id"
      />
    </h-card>
    <template slot='footer' class="drawer-bootom-button">
      <a-button type="ghost-danger" style="margin-right: 8px" @click="handleCancel"> 关闭 </a-button>
    </template >
  </h-modal>
</template>

<script>
  import moment from 'moment'
  import {postAction} from '@/api/manage'
  import mixin from '../mixin'

  export default {
    mixins: [mixin],
    inject: {
      getContainer: {
        default: () => document.body
      }
    },
    components: {},
    watch: {},
    data() {
      return {
        moment,
        queryParams: {},
        id: '',
        title: '下载记录',
        url: {
          list: '/HfEnvReportBusiness/downloadRecord',
        },
        visible: false,
        columns: [
          {
            title: '下载人',
            align: 'left',
            width: '25%',
            dataIndex: 'downloadUserName',
            customRender: (t) => {
              return t || '--'
            }
          },
          {
            title: '下载人部门',
            align: 'left',
            width: '25%',
            dataIndex: 'deptName',
            scopedSlots: {customRender: 'status'},
          },
          {
            title: '下载时间',
            align: 'left',
            width: '25%',
            dataIndex: 'downloadTime',
            customRender: (text, record) => {
              return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD HH:mm') : '--'
            },
          },
          {
            title: '客户机IP',
            width: '25%',
            dataIndex: 'clientIp',
            customRender: (text, record) => {
              return text || '--'
            },
          }
        ],
        loadData: (params) => {
          let data = {
            ...params,
           id: this.id
          }
          return postAction(this.url.list, data).then((res) => {
            if (res.code === 200) {
              return res.data
            }
          })
        },
      }
    },

    methods: {
      refresh(bool = true) {
        ()=>{
          this.$refs.downloadRecordTable.refresh(bool)
        }
      },
      handleCancel() {
        this.visible = false
        this.id = ""
      },
      show(id) {
        this.id = id;
        this.visible = true
        this.refresh(true)
      }
    },
  }
</script>
<style lang='less' scoped>
  /deep/ .h-card.ant-card .ant-card-body {
    padding: 0;
  }
</style>