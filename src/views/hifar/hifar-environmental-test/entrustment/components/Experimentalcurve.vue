<template>
  <div style="width: 100%;height: 100%;display: flex;justify-content: center;align-items: center">
    <div id="Charts" ref="Charts" style="width: 100%;height: 500px;"></div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  data() {
    return {
      Charts: null,
      title: '',
      xAxisData: [],
      yAxisData: [],
    }
  },
  mounted() {
    // this.darChart()
  },
  methods: {
    refresh(record) {
      this.$nextTick(() => {
        this.darChart(record)
      })
    },
    momentFormat(value, arr = []) {
      let result = ''
      for (let i = 0; i < arr.length; i++) {
        if (['hours', 'minutes', 'seconds'].includes(arr[i])) {
          let resItem = moment.duration(value).get(arr[i])
          let formatResItem = resItem < 10 ? ('0' + resItem) : resItem
          result += i < arr.length - 1 ? formatResItem + ':' : formatResItem
        }
      }
      return result
    },
    darChart(record) {
      let chart = this.$echarts.init(document.getElementById('Charts'));
      let option = {
        title: [],//
        legend: {},
        animation:false,
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            params = params[0]
            return params.seriesName + '：' + params.value[1] + '  时长：' + this.momentFormat(params.value[0], ['hours', 'minutes', 'seconds'])
          }.bind(this),
          axisPointer: {
            animation: false
          }
        },
        xAxis: {
          name: "时长",
          type: 'time',
          splitLine: {
            show: false
          },
          legend: {
            data: ['规划曲线']
          },
          splitNumber: 20,
          axisLine: {
            lineStyle: {
              color: '#1B2232'
            }
          },
          axisLabel: {
            formatter: function (value, index) {
              return this.momentFormat(value, ['hours', 'minutes'])
            }.bind(this),
            color: '#1B2232',
            rotate: 45,
          }
        },
        yAxis: {
          name: '数值',
          type: 'value',
          splitLine: {
            show: true
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#1B2232'
            }
          },
          axisLabel: {
            color: '#1B2232'
          }
        },
        toolbox: {
          feature: {
            saveAsImage: {
              name: '规划曲线图'
            },
          }
        },
        series: [
          {
            name: '温度',
            type: 'line',
            hoverAnimation: false,
            symbolSize: 4,
            data: record.temperatureResult || []
          },
          {
            name: '湿度',
            type: 'line',
            hoverAnimation: false,
            symbolSize: 4,
            data: record.humidityResult || []
          },
        ]
      };
      chart.setOption(option)
      this.$emit('change', chart.getDataURL())
    }
  }
}
</script>

<style scoped>

</style>