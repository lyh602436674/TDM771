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
    momentFormat(value) {
      let hours = Math.floor(value / 1000 / 60 / 60)
      hours = hours < 10 ? '0' + hours : hours
      let minutes = Math.floor(value / 1000 / 60) % 60
      minutes = minutes < 10 ? '0' + minutes : minutes
      let seconds = Math.floor((value / 1000) % 60)
      seconds = seconds < 10 ? '0' + seconds : seconds
      return `${hours}:${minutes}:${seconds}`
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
            return params.seriesName + '：' + params.value[1] + '  时长：' + this.momentFormat(params.value[0])
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
              return this.momentFormat(value)
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