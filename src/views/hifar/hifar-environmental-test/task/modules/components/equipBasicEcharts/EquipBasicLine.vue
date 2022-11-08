<!--
 * @Author: 马潭龙
 * @Date: 2021-11-15 11:24:21
 * @LastEditTime: 2021-11-26 18:25:57
 * @LastEditors: 马潭龙
 * @Descripttion: 设备详情顶部-选项卡-曲线图
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\components\equipBasicEcharts\EquipBasicLine.vue
-->
<template>
  <div style="height: 100%">
    <div style="height: 13.5%;margin-left: 5px;display: flex">
      <div style="margin-right: 10px">
        <h-range-picker
          v-model="queryParams.initialTimeRange"
          :placeholder="['开始时间', '结束时间']"
          format="YYYY-MM-DD HH:mm:ss"
          show-time
          size="small"
          style="width: 100%"
          @change="onDateChange"
        >
          <span slot="addonBefore">时间选择</span>
        </h-range-picker>
      </div>
      <div style="flex: 1">
        <a-button icon="search" size="small" type="primary" @click="handleSearch">查询</a-button>
        <a-button icon="reload" size="small" style="margin: 0 0 0 5px" type="default" @click="handleReset">
          重置
        </a-button>
        <a-button v-if="enlargementShow" icon="fullscreen" size="small" style="margin: 0 0 0 5px" type="primary"
                  @click="enlargement">
          放大
        </a-button>
      </div>
    </div>
    <div v-if="spinLoading" class="spin-box">
      <a-spin/>
    </div>
    <div v-else id="eCharts" :style="{ width: '100%', height: '86.5%' }"></div>
  </div>
</template>

<script>
import {getAction, postAction} from '@api/manage'
import moment from 'moment'

export default {
  props: {
    equipCode: {
      type: String,
      default: ''
    },
    selectedRow: {
      type: Array,
      default: []
    }
  },
  watch: {
    equipCode: {
      immediate: true,
      handler(val) {
        this.equipCodeProps = val
        if (this.queryParams.initialTimeRange) {
          this.loadData()
        }
      }
    },
    selectedRow: {
      immediate: true,
      deep: true,
      handler(row) {
        if (row.length && this.queryParams.initialTimeRange) {
          this.entrustIds = row[0].entrustIds.split(',')
          this.loadData()
        }
      }
    },
  },
  data() {
    return {
      url: {
        list: '/DaqBusiness/listAll',
        saveCurve: '/HfEnvTaskTestBusiness/saveCurve'
      },
      equipCodeProps: '',
      selectRowIdProps: '',
      spinLoading: false,
      enlargementShow: false,//放大按钮默认不显示
      queryParams: {},
      chartsParams: [],
      entrustIds: [],
      abilityInfoData: [],
      inialData: {},
      planData: {},
    }
  },
  methods: {
    enlargement() {
      this.$emit('open', this.inialData)
    },
    moment,
    onDateChange(row) {
      this.queryParams.initialTime_startTime = new Date(row[0]).getTime() / 1000 || 0
      this.queryParams.initialTime_endTime = new Date(row[1]).getTime() / 1000 || 0
      this.loadData()
    },
    handleSearch() {
      this.loadData()
    },
    handleReset() {
      this.queryParams = {}
      this.loadData()
    },
    loadData() {
      let params = {
        ...this.queryParams,
        equipCode: this.equipCodeProps
      }
      delete params.initialTimeRange
      this.spinLoading = true
      getAction(this.url.list, params).then((res) => {
        if (res.code === 200) {
          if (Object.keys(res.data).length > 0 && res.data.data.length > 1 && res.data.params.length > 0) {
            this.spinLoading = false
            this.enlargementShow = res.data.data.length > 1 && res.data.params.length > 0
            this.$nextTick(() => {
              let resultData = {
                data: [['tagName', 'tagValue', 'TimeStamp']].concat(res.data.data),
                params: res.data.params
              }
              console.log(resultData, 'resultData')
              this.inialData = resultData
              this.drawChart(resultData)
            })
          } else if (res.msg) {
            this.spinLoading = false
            this.enlargementShow = false
            this.$message.warning(res.msg)
            this.$nextTick(() => {
              this.drawChart([])
            })
          } else {
            this.spinLoading = false
            this.enlargementShow = false
            this.$message.warning('未查询到相关数据')
          }
        }
      })
    },
    saveCurve(charts) {
      let base64Data = charts.api.getDataURL('png')
      let data = {
        file: base64Data,
        testIds: this.selectedRow.map(item => item.id).join(",")
      }
      postAction(this.url.saveCurve, data).then(res => {
        if (res.code === 200) {
          this.$message.success("保存成功")
        } else {
          this.$message.error("保存失败")
        }
      })
    },
    drawChart(record) {
      let that = this
      let myChart = this.$echarts.init(document.getElementById('eCharts'))
      let myDataset = []
      let mySeries = []
      let chartParams = record.params || []
      let chartData = record.data || []
      if (chartParams.length > 0) {
        chartParams.forEach(i => {
          myDataset.push(
            {
              id: i.type,
              fromDatasetId: 'dataset_raw',
              transform: {
                type: 'filter',
                config: {
                  and: [
                    {dimension: 'tagName', '=': i.type},
                  ]
                }
              }
            }
          )
          mySeries.push(
            {
              name: i.name,
              type: 'line',
              datasetId: i.type,
              showSymbol: false,
              encode: {
                x: 'TimeStamp',
                y: 'tagValue',
                itemName: 'TimeStamp',
                tooltip: ['tagValue']
              }
            }
          )
        })
      } else {
        myDataset = []
        mySeries = []
      }
      let option = {
        backgroundColor: "#fff",
        dataset: [
          {
            id: 'dataset_raw',
            source: chartData
          }
        ].concat(myDataset),
        title: {
          // text: '规划曲线'
        },
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          bottom: 80
        },
        toolbox: {
          feature: {
            saveAsImage: {},
            dataZoom: {},
            mySaveQx: {
              show: true,
              title: '保存到曲线',
              icon: 'path://M814.805 128a51.179 51.179 0 0 1 51.179 51.179V844.01a51.179 51.179 0 0 1-51.179 51.157H201.173a51.179 51.179 0 0 1-51.178-51.157V179.179A51.179 51.179 0 0 1 201.173 128h613.654zM329.024 434.837a51.093 51.093 0 0 1-51.179-51.093V179.157h-76.672v664.854h613.76V179.179H738.22v204.48a51.179 51.179 0 0 1-51.179 51.178H329.024z m0-51.093h357.995V179.157H329.024v204.587z m357.91 204.501a25.557 25.557 0 1 1 0.085 51.072H329.024a25.536 25.536 0 1 1 0-51.072h357.91z',
              onclick() {
                if (!that.selectedRow.length) return that.$message.warning('请在下方列表选择一条试验')
                let testCodes = that.selectedRow.map(item => item.testCode).join(',')
                let _this = this;
                that.$confirm({
                  title: '确认保存',
                  content: `是否保存到试验编号为${testCodes}的任务吗`,
                  onOk: () => {
                    that.saveCurve(_this)
                  }
                })
              }
            }
          },
          right: 40
        },
        dataZoom: [
          {
            type: 'inside',
            start: 0,
            end: 100
          },
          {
            start: 0,
            end: 100
          },
        ],
        legend: {},
        xAxis: {
          type: 'time',
          nameLocation: 'middle',
          axisLabel: {
            show: true,
            showMinLabel: true,
            showMaxLabel: true,
            formatter: (value) => {
              return moment(value).format('MM-DD hh:mm').replace(" ", '\n')
            }
          },
          boundaryGap: false,
        },
        yAxis: {
          // name: '试验值'
        },
        series: mySeries
      }
      myChart.clear()
      setTimeout(function () {
        myChart.setOption(option)
        window.onresize = function () {
          myChart.resize()
        }
      }, 200)
    },
  }
}
</script>
<style lang="less" scoped>
.eCharts {
  width: 100%;
  height: 240px;
}

.spin-box {
  height: 230px;
  line-height: 230px;
  text-align: center;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

/deep/ .empty-box .ant-empty {
  height: 230px;
}
</style>
