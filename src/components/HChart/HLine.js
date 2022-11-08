/*
 * @Author: 陈乾龙
 * @Date: 2021-09-08 15:57:31
 * @LastEditTime: 2021-09-22 14:49:26
 * @LastEditors: 陈乾龙
 * @Description: 折线图
 * @FilePath: \hifar-platform-client\src\components\HChart\HLine.js
 */
import { merge, isArray, isObject } from 'lodash'
import HChartMixin from './HChartMixin'
export default {
  mixins:[HChartMixin],
  props: {
    title: {
      default: "统计图"
    },
    /**
     * @Date: 2021-09-08 17:09:27
     * @Author: 陈乾龙
     * @description: chart 的类型
     */
    type: {
      default: 'line'
    },
    /**
     * @Date: 2021-09-08 16:22:46
     * @Author: 陈乾龙
     * @description: chart 的配置参数
     */
    options: {
      type: Object,
      default: () => { }
    },
  },
  watch: {
    options: {
      immediate: true,
      handler(val) {
        if (isObject(val)) {
          if (isArray(val.data)) {
            this.localData = val.data
          } else {
            this.localData = []
          }
          if (isArray(val.xAxis)) {
            this.localXAxis = val.xAxis
          } else {
            this.localXAxis = []
          }
          if (isArray(val.legend)) {
            this.localLegend = val.legend
          } else {
            this.localLegend = []
          }
          if (isObject(val.visualMap)) {
            this.localVisualMap = val.visualMap
          } else {
            this.localVisualMap = {}
          }
          if (isObject(val.yAxis)) {
            this.localYAxis = val.yAxis
          } else {
            this.localYAxis = {}
          }
        } else {
          this.localData = []
          this.localLegend = []
          this.localXAxis = []
          this.localYAxis = {}
        }
        this.renderChart(this.$h)
      }
    }
  },
  data() {
    return {

      localOptions: {
        // color: colorList,
        title: {
          text: this.title,
          textStyle: {
            fontSize: 12,
            fontWeight: 400,
          },
          left: 'center',
          top: '5%',
          show: false,
        },
        legend: {
          x: 'center',
          y: 'top',
          show: true,
          top: '5%',
          right: '5%',
          itemWidth: 6,
          itemGap: 20,
          textStyle: {
            color: '#556677',
          },
          data: [],
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            label: {
              show: true,
              backgroundColor: '#fff',
              color: '#556677',
              borderColor: 'rgba(0,0,0,0)',
              shadowColor: 'rgba(0,0,0,0)',
              shadowOffsetY: 0,
            },
            lineStyle: {
              width: 0,
            },
          },
          backgroundColor: '#fff',
          textStyle: {
            color: '#5c6c7c',
          },
          padding: [10, 10],
          extraCssText: 'box-shadow: 1px 0 2px 0 rgba(163,163,163,0.5)',
        },
        xAxis: {
          type: 'category',
          axisLine: {
            show: true,
            lineStyle: {
              color: '#DCE2E8',
            },
          },
          axisTick: {
            show: true,
          },
          axisLabel: {
            interval: 0,
            textStyle: {
              color: '#556677',
            },
            // 默认x轴字体大小
            fontSize: 12,
            // margin:文字到x轴的距离
            margin: 15,
          },
          axisPointer: {
            show: true,
            label: {
              padding: [0, 0, 10, 0],
              margin: 15,
              fontSize: 12,
              backgroundColor: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: '#fff', // 0% 处的颜色
                  },
                  {
                    offset: 0.86,
                    color: '#fff', // 0% 处的颜色
                  },
                  {
                    offset: 0.86,
                    color: '#33c0cd', // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: '#33c0cd', // 100% 处的颜色
                  },
                ],
                global: false, // 缺省为 false
              },
            },
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
            },
          },
          boundaryGap: false,
        },
        yAxis: {
          type: 'value',
          axisTick: {
            show: false,
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#DCE2E8',
            },
          },
          axisLabel: {
            textStyle: {
              color: '#556677',
            },
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
            },
          },
          scale: true
        },
        series: [],
      },
      localSeries: {
        type: this.type,
        data: [],
        symbolSize: 1,
        symbol: 'circle',
        smooth: false,
        yAxisIndex: 0,
        showSymbol: true,
        emphasis: {
          focus: 'series',
        },
        lineStyle: {
          width: 2,
          shadowColor: 'rgba(158,135,255, 0.3)',
          shadowBlur: 10,
          shadowOffsetY: 20,
        },
        markPoint: {
          symbol: 'pin', //标记的图形
          symbolSize: (value, params) => {
            let val = value.toString()
            let len = val.length
            return len * 13.5
          },
          symbolKeepAspect: true,
          itemStyle: {
            borderColor: '#000', //图形的描边颜色。支持的颜色格式同 color，不支持回调函数。
            borderWidth: 0, //描边线宽。为 0 时无描边。
            borderType: 'solid', //柱条的描边类型，默认为实线，支持 ‘solid’, ‘dashed’, ‘dotted’。
          },
          data: [],
        },
        markLine: {
          data: [],
        },
      },
      localData: [],
      localLegend: [],
      localXAxis: [],
      localVisualMap: {},
      localYAxis: {}
    }
  },
  methods: {
    renderChart(h) {
      let echart = this.initChart()
      if (!echart) return
      let series = []
      this.localData.map(item => {
        series.push(merge({}, this.localSeries, {
          name: item.name,
          data: item.data,
          markPoint: {
            data: item.markPoint
          },
          markLine: {
            data: item.markLine
          }
        }))
      })
      let options = merge({}, this.localOptions, {
        legend: {
          data: this.localLegend
        },
        xAxis: {
          data: this.localXAxis
        },
        yAxis: this.localYAxis
        // visualMap: this.localVisualMap
      })
      options.series = series
      echart.setOption(options)
    }
  }
}