<template>
  <div style="width: 100%;height: 100%;display: flex;justify-content: center;align-items: center">
    <div id="Charts" ref="Charts" style="width: 100%;height: 500px;"></div>
  </div>
</template>

<script>

const seriesLabel = {
  show: true,
  fontWeight: "bold",
  rotate: 45, // 标签旋转。从 -90 度到 90 度。正值是逆时针。
  distance: 10, // 距离图形元素的距离。
  formatter: (params) => {
    return params.value[1] + '℃' + '\n' + momentFormat(params.value[0])
  }
}
const momentFormat = function (value) {
  let hours = Math.floor(value / 1000 / 60 / 60)
  hours = hours < 10 ? '0' + hours : hours
  let minutes = Math.floor(value / 1000 / 60) % 60
  minutes = minutes < 10 ? '0' + minutes : minutes
  let seconds = Math.floor((value / 1000) % 60)
  seconds = seconds < 10 ? '0' + seconds : seconds
  return `${hours}:${minutes}:${seconds}`
}

import {cloneDeep} from 'lodash'

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
    darChart(record) {
      let {temperatureResult_before, temperatureResult_stage, temperatureResult_after} = cloneDeep(record)
      let before = temperatureResult_before
      let stage = [temperatureResult_before[temperatureResult_before.length - 1]].concat(temperatureResult_stage)
      let after = [temperatureResult_stage[temperatureResult_stage.length - 1]].concat(temperatureResult_after)
      let chart = this.$echarts.init(document.getElementById('Charts'));
      let option = {
        title: [],//
        legend: {},
        animation: false,
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            params = params[0]
            return params.seriesName + '：' + params.value[1] + '  时长：' + momentFormat(params.value[0])
          },
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
          splitNumber: 20,
          axisLine: {
            lineStyle: {
              color: '#1B2232'
            }
          },
          axisLabel: {
            formatter: function (value, index) {
              return momentFormat(value)
            },
            color: '#1B2232',
            rotate: 45,
          }
        },
        yAxis: {
          name: '温度',
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
            name: '前置处理',
            type: 'line',
            hoverAnimation: false,
            symbolSize: 4,
            data: before || [],
            label: seriesLabel,
          },
          {
            name: '循环阶段',
            type: 'line',
            hoverAnimation: false,
            symbolSize: 4,
            data: stage || [],
            label: seriesLabel,
            lineStyle: {
              color: "red"
            }
          },
          {
            name: '后置处理',
            type: 'line',
            hoverAnimation: false,
            symbolSize: 4,
            data: after || [],
            label: seriesLabel,
          },
          // {
          //   name: '湿度',
          //   type: 'line',
          //   hoverAnimation: false,
          //   symbolSize: 4,
          //   data: record.humidityResult || [],
          //   label: seriesLabel,
          // },
        ]
      };
      chart.setOption(option)
      this.$emit('change', chart.getDataURL({pixelRatio: 3, backgroundColor: '#fff'}))
    }
  }
}
</script>

<style scoped>

</style>