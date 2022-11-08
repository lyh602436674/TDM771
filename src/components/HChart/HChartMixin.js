/*
 * @Author: 陈乾龙
 * @Date: 2021-09-22 14:35:30
 * @LastEditTime: 2021-11-04 14:44:42
 * @LastEditors: 陈乾龙
 * @Description: 图表公用
 * @FilePath: \hifar-platform-client\src\components\HChart\HChartMixin.js
 */
import { randomUUID } from '@/utils/util'
import "./HChart.less"
var theme1 = require('./theme.json')
export default {
  data() {
    return {
      id: randomUUID(),
      echart: null,
      $h: this.$createElement,
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.renderChart()
    })
  },
  beforeDestroy() {
    window.onresize = null
  },
  methods: {
    initChart() {
      if (!this.echart) {
        if (!this.$refs[this.id]) {
          return false
        }
        this.$echarts.registerTheme('HifarTheme1', theme1)
        this.echart = this.$echarts.init(this.$refs[this.id], 'HifarTheme1', {
          width: 'auto',
          height: 'auto',
          render: 'canvas'
        })
        this.echart.off('click')
        this.echart.off('mousedown')
        this.echart.off('mouseup')
        this.echart.off('mousemove')
        this.echart.getZr().on('click', (params) => {
          let pointInPixel = [params.offsetX, params.offsetY]
          if (this.echart.containPixel('grid', pointInPixel)) {
            let pointInGrid = this.echart.convertFromPixel({
              seriesIndex: 0
            }, pointInPixel)
            let xIndex = parseInt(pointInGrid[0])
            let yIndex = parseInt(pointInGrid[1])
            this.$emit('onClick', [xIndex, yIndex], params, this.echart)
          }
        })
        // 图表自动调整size
        window.onresize = this.echart.resize
      }
      this.echart.clear()
      return this.echart
    }
  },
  render(h) {
    return h('div', {
      class: 'h-chart',
      attrs: {
        id: this.id
      },
      ref: this.id
    })
  }
}