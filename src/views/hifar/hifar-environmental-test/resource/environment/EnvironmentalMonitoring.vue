<!--
 * @Author: 赵峰
 * @Date: 2021-09-02 09:17:14
 * @LastEditTime: 2021-11-25 13:55:33
 * @LastEditors: 赵峰
 * @Descripttion: 环境设施----环境检测
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\environment\EnvironmentalMonitoring.vue
-->
<template>
  <div class="em-custom-wrapper" ref="pageWrapper" style="height: 100%; position: relative">
    <h-card fixed :bordered="true">
      <template slot="title"> 环境检测 </template>
      <r-l-layout class="h-custom-layout" :leftMinWidth="240">
        <div slot="left" class="em-left">
          <h-card :bordered="true">
            <h-dict-select
              v-model="queryParam.c_placeName_1"
              dictCode="hf_res_equip_address"
              placeholder="请选择场地"
              style="margin-bottom: 10px"
              @change="handleSelect"
            >

            </h-dict-select>
            <!--            <a-input-search-->
            <!--              v-model="queryParam.placeName_dictText"-->
            <!--              allowClear-->
            <!--              slot="search-form"-->
            <!--              size="small"-->
            <!--              placeholder="请输入场地名称"-->
            <!--              enter-button="搜索"-->
            <!--              @keyup.enter.native="handleRefresh"-->
            <!--              @search="handleRefresh"-->
            <!--            />-->
            <div
              class="ant-list-split"
              v-for="(item, index) in venueListData"
              :key="item.id"
              @mouseout="handleListMouseout"
            >
              <div
                :class="rowIndex === index ? 'ant-list-item list-item-active' : 'ant-list-item'"
                @click="handleItem(item, index)"
                @mouseover="handleMouseover(index)"
                @mouseout="handleMouseout(index)"
              >
                <a-badge :color="colors[index % colors.length]" :text="item.placeName_dictText" class="item"/>
                <a-icon
                  v-show="hoverIndex === index"
                  style="margin-right: 10px"
                  type="edit"
                  @click.stop="handleAddEditor(item)"
                />
              </div>
            </div>
          </h-card>
        </div>
        <div slot="right" class="em-right">
          <div class="em-right-top">
            <div class="select_time"><a-range-picker style="width: 260px" @change="onChange" /></div>
            <div v-if="dataSource.length > 0" id="monitorEachrts" :style="{ width: '100%', height: '300px' }"></div>
            <a-empty v-else style="padding-top: 100px"></a-empty>
          </div>
          <div class="em-right-bottom">
            <h-vex-table
              ref="EnvironmentalMonitoringTable"
              :autoLoad="false"
              :columns="columns"
              :data="loadPlaceData"
              :rowKey="(record) => record.id"
            >
            </h-vex-table>
          </div>
        </div>
      </r-l-layout>
    </h-card>
    <environmental-monitor-modal ref="EnvironmentalMonitorModal" @change="refresh(true)"></environmental-monitor-modal>
  </div>
</template>

<script>
import moment from 'moment'
import {postAction} from '@/api/manage'
import EnvironmentalMonitorModal from './modules/EnvironmentalMonitorModal'

export default {
  components: {
    EnvironmentalMonitorModal,
  },
  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper,
    }
  },
  data() {
    return {
      moment,
      queryParam: {},
      queryParams: {
        c_placeTime_4: '',
        c_placeTime_6: '',
      },
      rowIndex: 0,
      colors: [
        'pink',
        'gold',
        'green',
        'red',
        'orange',
        'yellow',
        'cyan',
        'blue',
        'purple',
        'geekblue',
        'magenta',
        'volcano',
        'lime',
      ],
      venueListData: [],
      dataSource: [],
      columns: [
        {
          title: '日期 ',
          align: 'left',
          dataIndex: 'placeTime',
          customRender: (time) => {
            return time && time != 0 ? moment(parseInt(time)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '登记人',
          align: 'left',
          dataIndex: 'createUserName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '温度(℃)',
          align: 'left',
          dataIndex: 'temperatureMax',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '湿度(％)',
          align: 'left',
          dataIndex: 'humidityMax',
          customRender: (text, record) => {
            return text || '--'
          },
        },
      ],
      url: {
        list: '/HfResPlaceEnvBusiness/listPageByPlaceId',
        venueList: '/HfResPlaceBusiness/listPage',
      },
      hoverIndex: null,
    }
  },
  created() {
    this.loadData()
  },

  methods: {
    loadData() {
      let data = {
        ...this.queryParam,
        pageNo: 1,
        pageSize: 100,
      }
      return postAction(this.url.venueList, data).then((res) => {
        if (res.code === 200) {
          this.venueListData = res.data.data
        }
      })
    },
    loadPlaceData(params) {
      let data = {
        ...params,
        ...this.queryParams,
        placeId: this.placeId,
      }
      return postAction(this.url.list, data).then((res) => {
        if (res.code === 200) {
          let data = res.data.data.map((item) => {
            return {
              id: item.id,
              humidityMax: item.humidityMax / 10000,
              temperatureMax: item.temperatureMax / 10000,
              placeTime: item.placeTime,
              placeTime_1:
                item.placeTime && item.placeTime != 0 ? moment(parseInt(item.placeTime)).format('YYYY-MM-DD') : '',
              createUserName: item.createUserName,
              createTime: item.createTime,
            }
          })
          this.dataSource = data
          if (data.length > 0) {
            this.$nextTick(() => {
              this.drawLine()
            })
          }
          return data
        }
      })
    },
    drawLine() {
      // 基于准备好的dom，初始化echarts实例
      let myChart = this.$echarts.init(document.getElementById('monitorEachrts'))
      let data = this.dataSource.reverse()
      let x = data.map((item) => (item.placeTime_1 ? item.placeTime_1 : null))
      let y1 = data.map((item) => (item.temperatureMax ? item.temperatureMax : null))
      let y2 = data.map((item) => (item.humidityMax ? item.humidityMax : null))
      // 绘制图表
      myChart.setOption({
        title: {
          text: '',
        },
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            return `${params[0].name}<br/>
            <div style="display:inline-block;width:8px;height:8px;background-color:${
              params[0].color
            };border-radius:5px;margin-right:4px;"></div>温度:
            ${data[params[0].dataIndex].temperatureMax ? data[params[0].dataIndex].temperatureMax : '-'} ℃<br/>
            <div style="display:inline-block;width:8px;height:8px;background-color:${
              params[1].color
            };border-radius:5px;margin-right:4px;"></div>湿度:
            ${data[params[0].dataIndex].humidityMax ? data[params[0].dataIndex].humidityMax : '-'} %<br/>`
          },
        },
        color: ['#5470C6', '#91CC75'],
        legend: {
          data: ['温度', '湿度'],
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        toolbox: {
          right: '2%',
          feature: {
            saveAsImage: {},
          },
        },
        xAxis: {
          show: true,
          type: 'category',
          axisTick: {
            show: false,
          },
          axisLine: { show: false },
          boundaryGap: false,
          data: x,
        },
        yAxis: {
          type: 'value',
          inverse: false,
        },
        series: [
          {
            name: '温度',
            type: 'line',
            stack: '温度',
            data: y1,
          },
          {
            name: '湿度',
            type: 'line',
            stack: '湿度',
            data: y2,
          },
        ],
      })
      setTimeout(function () {
        window.onresize = function () {
          myChart.resize()
        }
      }, 200)
    },
    handleRefresh() {
      this.loadData()
    },
    refresh(bool = true) {
      this.$refs.EnvironmentalMonitoringTable.refresh(bool)
    },
    handleItem(record, index) {
      this.rowIndex = index
      this.placeId = record.id
      this.refresh(true)
    },
    handleMouseover(index) {
      this.hoverIndex = index
    },
    handleMouseout(index) {
      this.hoverIndex = index
    },
    handleListMouseout() {
      this.hoverIndex = null
    },
    handleAddEditor(record) {
      let data = {
        placeId: record.id,
        placeName: record.placeName,
        placeName_dictText: record.placeName_dictText,
      }
      this.$refs.EnvironmentalMonitorModal.show(data)
    },
    handleSelect(value) {
      this.queryParam.c_placeName_1 = value
      this.loadData()
    },
    onChange(date, dateString) {
      let startTime = date[0] ? date[0] : null
      let endTime = date[1] ? date[1] : null
      startTime = moment(startTime).format('YYYY-MM-DD') + ' 00:00:00'
      endTime = moment(endTime).format('YYYY-MM-DD') + ' 23:59:59'
      startTime = moment(startTime).format('X') * 1000
      endTime = moment(endTime).format('X') * 1000
      this.queryParams.c_placeTime_4 = startTime
      this.queryParams.c_placeTime_6 = endTime
      this.refresh(true)
    },
  },
}
</script>
<style lang='less' scoped>
.h-custom-layout {
  height: 100%;
  .actions-icon {
    cursor: pointer;
  }
  .em-right {
    padding: 0 5px;
    height: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    flex-direction: column;
  }
}
.ant-list-split {
  width: 100%;
  .ant-list-item {
    border-bottom: 1px solid #e8e8e8;
    cursor: pointer;
    .item {
      width: 100%;
      padding: 0 15px;
      display: flex;
      align-items: center;
    }
  }
  .list-item-active {
    background: #d9d9d9;
  }
}
</style>
<style lang="less">
.em-custom-wrapper {
  .ant-card-body {
    background-color: #efefef;
  }
  .em-right {
    .em-right-top {
      width: 100%;
      height: 400px;
      background-color: #fff;
      margin-bottom: 10px;
      .select_time {
        padding-left: 30px;
        padding-top: 20px;
      }
    }
    .em-right-bottom {
      flex: 1;
      width: 100%;
      background: #fff;
      padding: 10px 5px;
    }
  }
  .em-left {
    height: 100%;
    background-color: #fff;

    .ant-card-body {
      background-color: #fff;
    }
  }
}
</style>