/*
 * @Author: 陈乾龙
 * @Date: 2021-09-24 09:55:38
 * @LastEditTime: 2021-11-30 11:43:44
 * @LastEditors: 马潭龙
 * @Description: 热力图
 * @FilePath: \hifar-platform-client\src\components\HChart\HPunchCard.js
 */
import { merge, isArray, isObject } from 'lodash'
import HChartMixin from './HChartMixin'
export default {
  mixins: [HChartMixin],
  props: {
    title: {
      default: '分布图'
    },
    options: {
      type: Object,
      default: () => { }
    }
  },
  data() {
    return {
      localOptions: {
        title: {
          padding: 20,
          left: 'center'
        },
        tooltop: {
          position: "top"
        },
        grid: {
          height: '85%',
          top: '10%',
          show: true,
          containLabel: true
        },
        xAxis: {
          splitArea: {
            show: true
          }
        },
        yAxis: {
          type: "category",
          splitArea: {
            show: true
          },
        },
        visualMap: {
          show: false,
          min: 0,
          max: 10,
          calculable: true,
          orient: 'horizontal',
          left: "center",
          bottom: '15%'
        }
      }
    }
  },
  watch: {
    options: {
      immediate: true,
      handler(val) {
        if (isObject(val)) {
          this.renderChart()
        }
      }
    }
  },
  methods: {
    renderChart() {
      let echart = this.initChart()
      if (!echart) return
      let options = merge({}, this.localOptions, this.options, {
        title: {
          text: this.title
        }
      })
      echart.setOption(options)
    }
  }
}