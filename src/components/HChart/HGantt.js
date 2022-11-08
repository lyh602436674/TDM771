/*
 * @Author: 陈乾龙
 * @Date: 2021-09-23 09:23:42
 * @LastEditTime: 2021-09-23 09:50:39
 * @LastEditors: 陈乾龙
 * @Description: 甘特图
 * @FilePath: \hifar-platform-client\src\components\HChart\HGantt.js
 */

import HChartMixin from './HChartMixin'
import { merge, isArray, isObject } from 'lodash'

export default {
  mixins: [HChartMixin],
  data() {
    return {
      localOptions:{
        legend:{
          align:'right',
          right:80,
          top:20
        },
        grid:{
          containLabel:true,
          show:true
        }
      }
    }
  },
  props: {
    title: {
      default: "安排",
    },
    subTitle: {
      default: null
    },
    options: {
      type: Object,
      default: () => { }
    }
  },
  methods: {
    renderChart() {
      let echart = this.initChart()
      if (!echart) return
      let options = merge({}, this.localOptions, this.options, {
        title: {
          text: this.title,
          padding:20,
          left: 'center'
        }
      })
      echart.setOption(options)
    }
  }
}