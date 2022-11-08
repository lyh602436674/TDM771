/*
 * @Author: 陈乾龙
 * @Date: 2021-09-22 10:51:58
 * @LastEditTime: 2021-11-04 11:42:31
 * @LastEditors: 陈乾龙
 * @Description: 饼图
 * @FilePath: \hifar-platform-client\src\components\HChart\HPie.js
 */
import HChartMixin from './HChartMixin'
import { merge, isArray, isObject } from 'lodash'
export default {
  mixins: [HChartMixin],
  props: {
    title: {
      default: "统计",
    },
    subTitle: {
      default: null
    },
    options: {
      type: Object,
      default: () => { }
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
  data() {
    return {
      localOptions: {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
      }
    }
  },
  methods: {
    renderChart() {
      this.initChart()
      if (!this.echart) return
      let options = Object.assign({}, this.localOptions, this.options, {
        title: {
          text: this.title,
          subText: this.subTitle,
          left: 'center'
        }
      })
      this.echart.setOption(options)
    }
  }
}