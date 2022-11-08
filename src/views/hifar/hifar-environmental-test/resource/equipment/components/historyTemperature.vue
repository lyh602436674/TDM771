<template>

  <h-modal
    title="历史采集"
    destroyOnClose
    inner
    fullScreen
    width="100%"
    :getContainer="getContainer"
    :visible="visible"
    @cancel="handleCancel"
  >
    <a-button slot="footer" type="ghost-danger" @click="handleCancel"> 关闭</a-button>
    <h-card fixed :bordered="true" style="width: 100%;">
<!--      <div style="width:100%;padding: 5px;border: 1px solid #c5c5c5;border-top: 5px">-->
      <div style="margin-left: 5px;margin-bottom:10px;display: flex">
      <a-col :md="7" :sm="12" style="margin-right: 10px;flex: 1">
          <h-range-picker
            style="width: 100%"
            size="small"
            show-time
            v-model="queryParams.initialTimeRange"
            format="YYYY-MM-DD HH:mm:ss"
            :placeholder="['开始时间', '结束时间']"
            @change="onDateChange"
          >
            <span slot="addonBefore">时间选择</span>
          </h-range-picker>
        </a-col>
        <a-col style="flex: 1">
          <a-button type="primary" icon="search" size="small" @click="refresh">查询</a-button>
          <a-button type="default" icon="reload" size="small" style="margin: 0 5px 0 5px" @click="handleReset">
            重置
          </a-button>
          <a-button size="small" type="ghost-warning" icon="download" @click="handleExportXls()">
            导出
          </a-button>
        </a-col>
      </div>
      <div class="task-list" style="height: 100%;width: 100%">
        <h-vex-table
          slot="content"
          ref="historyTemper"
          style="width: 100%"
          :columns="taskColumns"
          :data="loadData"
        >
          <!-- 操作 -->
          <template slot="temperature" slot-scope="text, record">
            <a-input-number style="width: 100%" v-model="record.temperature"
                            @blur="(e)=>handleTableChange(e,record)"></a-input-number>
          </template>
          <template #humidity="text, record">
            <a-input-number style="width: 100%" v-model="record.humidity"
                            @blur="(e)=>handleTableChange(e,record)"></a-input-number>
          </template>
          <!--          <span slot="action" slot-scope="text, record">-->
          <!--              <a-icon-->
          <!--                type="edit"-->
          <!--                title="编辑"-->
          <!--                class="primary-text"-->
          <!--                style="cursor: pointer"-->
          <!--                @click="edit(record)"-->
          <!--              />-->
          <!--          </span>-->
        </h-vex-table>
      </div>
      <!--      <edit-history-temperature ref="editHistory" @change="refresh"></edit-history-temperature>-->
    </h-card>
  </h-modal>
</template>

<script>
import {downloadFile, postAction} from '@api/manage'
import EditHistoryTemperature
  from '@views/hifar/hifar-environmental-test/resource/equipment/components/editHistoryTemperature'

export default {
  components: { EditHistoryTemperature },
  inject: {
    getContainer: {
      default: () => document.body
    }
  },
  data() {
    return {
      queryParams: {},
      equipCode: '',
      visible: false,
      taskColumns: [
        {
          title: '采集时间',
          dataIndex: 'timestamp',
        },
        {
          title: '温度值',
          dataIndex: 'temperature',
          scopedSlots: {customRender: 'temperature'}
        },
        {
          title: '湿度值',
          dataIndex: 'humidity',
          scopedSlots: {customRender: 'humidity'}
        },
        // {
        //   title: '操作',
        //   dataIndex: 'action',
        //   width: 60,
        //   scopedSlots: {customRender: 'action'}
        // }
      ],
      url: '/HfResHistroyTemperauter/historyTemperature'
    }
  },
  methods: {
    handleTableChange(e, record) {
      console.log(e, record, 'rrrrr')
    },
    async handleExportXls() {
      let params = {
        ...this.queryParams,
        equipCode: this.equipCode,
        isExport: 1
      }
      let filename = '设备采集历史温度.xls'
      await downloadFile(this.url, filename, params)
    },

    refresh(bool = true) {
      this.$refs.historyTemper.refresh(bool)
    },

    edit(record) {
      this.$refs.editHistory.show(record)
    },
    onDateChange(row) {
      this.queryParams.initialTime_startTime = new Date(row[0]).getTime() / 1000 || 0
      this.queryParams.initialTime_endTime = new Date(row[1]).getTime() / 1000 || 0
      this.loadData()
    },
    handleReset() {
      this.queryParams = {}
      this.loadData()
    },
    show(record) {
      this.visible = true
      this.equipCode = record.equipCode
    },
    handleCancel(e) {
      this.visible = false
      this.activeKey = '1'
      this.queryParams={}
    },
    loadData(params) {
      let data = {
        ...this.queryParams,
        ...params,
        equipCode: this.equipCode
      }
      return postAction(this.url, data).then((res) => {
        if (res.code === 200) {
          return res.data
          // return [{timestamp: "2021-10-09", temperature: "20", humidity: 30}]
        }
      })
    }
  }
}
</script>