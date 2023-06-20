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
      <div slot="search-form" style="display:flex">
        <a-col style="margin-right: 10px">
          <span>时间选择：</span>
          <a-range-picker
            style="display: inline-block"
            size="small"
            show-time
            v-model="queryParams.initialTimeRange"
            format="YYYY-MM-DD HH:mm:ss"
            :placeholder="['开始时间', '结束时间']"
            @change="onDateChange"
            @ok="onOk"
          >
            <span slot="addonBefore">时间选择</span>
          </a-range-picker>
        </a-col>
        <a-col>
          <a-button type="primary" icon="search" size="small" @click="refresh">查询</a-button>
          <a-button type="default" icon="reload" size="small" style="margin: 0 5px 0 5px" @click="handleReset">
            重置
          </a-button>
          <a-button size="small" type="ghost-warning" icon="export" @click="handleExportXls()">
            导出
          </a-button>
        </a-col>
      </div>
      <h-vex-table
        slot="content"
        ref="historyTemper"
        style="width: 100%"
        :columns="columns"
        :data="loadData"
      >
        <!-- 操作 -->
        <template slot="temperaturePv" slot-scope="text, record">
          <a-input-number style="width: 100%" v-model="record.temperaturePv"
                          @focus="handleInputFocus"
                          @blur="(e)=>handleInputBlur(e, record,'temperaturePv')"></a-input-number>
        </template>
        <template #humidityPv="text, record">
          <a-input-number style="width: 100%" v-model="record.humidityPv"
                          @focus="handleInputFocus"
                          @blur="(e)=>handleInputBlur(e, record,'humidityPv')"></a-input-number>
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
      <!--      <edit-history-temperature ref="editHistory" @change="refresh"></edit-history-temperature>-->
    </h-card>
  </h-modal>
</template>

<script>
import {downloadFile, postAction} from '@api/manage'
import EditHistoryTemperature
  from '@views/hifar/hifar-environmental-test/resource/equipment/components/editHistoryTemperature'
import moment from 'moment'

export default {
  components: {EditHistoryTemperature},
  inject: {
    getContainer: {
      default: () => document.body
    }
  },
  data() {
    return {
      moment,
      queryParams: {},
      equipCode: '',
      visible: false,
      columns: [
        {
          title: '采集时间',
          dataIndex: 'timestamp',
        },
        {
          title: '温度值',
          dataIndex: 'temperaturePv',
          scopedSlots: {customRender: 'temperaturePv'}
        },
        {
          title: '湿度值',
          dataIndex: 'humidityPv',
          scopedSlots: {customRender: 'humidityPv'}
        },
        // {
        //   title: '操作',
        //   dataIndex: 'action',
        //   width: 60,
        //   scopedSlots: {customRender: 'action'}
        // }
      ],
      url: '/HfResHistroyTemperauter/historyTemperature',
      edit: "/HfResHistroyTemperauter/modifyHistoryTemperature",
      overflowDay: false,
      beforeBlurValue: "",
    }
  },
  methods: {
    handleInputFocus(e) {
      this.beforeBlurValue = e.target.value
    },
    handleInputBlur(e, record, field) {
      if (e.target.value === this.beforeBlurValue) return
      postAction(this.edit, {
        timestamp: record.timestamp,
        tablename: record.tablename,
        [field]: record[field]
      }).then(res => {
        if (res.code === 200) {
          this.refresh()
        }
      }).catch(() => {
        this.$message.warning('保存失败')
      })
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

    refresh(bool = false) {
      if (this.overflowDay) return this.$message.warning('最多支持七天范围内查询');
      this.$refs.historyTemper.refresh(bool)
    },

    // edit(record) {
    //   this.$refs.editHistory.show(record)
    // },
    onOk(selectedDates) {
      let pickerValue0 = moment(selectedDates[0]).format('x')
      let pickerValue1 = moment(selectedDates[1]).format('x')
      const diffInDays = Math.round((pickerValue1 - pickerValue0) / (1000 * 60 * 60 * 24));
      if (diffInDays > 7) {
        this.overflowDay = true
        this.$message.warning('最多支持七天范围内查询');
      } else {
        this.overflowDay = false
      }
    },

    onDateChange(row) {
      this.queryParams.initialTime_startTime = moment(row[0]).format('x') || 0
      this.queryParams.initialTime_endTime = moment(row[1]).format('x') || 0
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
      this.queryParams = {}
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