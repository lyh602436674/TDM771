<template>
  <div class="tasksCompletedByThirtyDays">
    <div class="title">近30天任务完成数量</div>
    <div id="eCharts4"></div>
  </div>
</template>

<script>
import { getAction } from '@api/manage'
import { fontSize } from './chartsFontSizeToRem'
export default {
  name: 'TasksCompletedByThirtyDays',
  description: '近三十天任务完成数量页面',
  data() {
    return {
      url: {
        thirtyDayFinishTaskStatistics: 'HfBulletinBoardBusiness/thirtyDayFinishTaskStatistics',
      },
    }
  },
  mounted() {},
  methods: {
    initCharts() {
      let myCharts4 = this.$echarts.init(document.getElementById('eCharts4'))
      getAction(this.url.thirtyDayFinishTaskStatistics).then((res) => {
        if (res.code === 200) {
          let category = []
          let barData = []
          res.data.data.forEach((item) => {
            category.push(item.time)
            barData.push(item.count)
          })
          let option = {
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow',
              },
              textStyle: {
                fontSize: fontSize(36),
              },
            },
            grid: {
              top: fontSize(40),
              left: fontSize(80),
              right: fontSize(40),
              bottom: fontSize(140),
            },
            xAxis: {
              data: category,
              axisLine: {
                lineStyle: {
                  color: '#fff',
                  width: fontSize(1),
                },
              },
              axisTick: {
                show: false,
              },
              axisLabel: {
                color: '#fff',
                fontSize: fontSize(24),
                rotate: 45,
                margin: fontSize(16),
                // interval: 3,
                showMinLabel: true,
                showMaxLabel: true,
                // align: 'right',
              },
            },
            yAxis: {
              axisLine: {
                show: true,
                lineStyle: {
                  color: '#fff',
                  width: fontSize(1),
                },
              },
              axisLabel: {
                color: '#fff',
                margin: fontSize(16),
                fontSize: fontSize(24),
              },
            },
            series: [
              // {
              //   name: 'line',
              //   type: 'line',
              //   smooth: true,
              //   showAllSymbol: true,
              //   symbol: 'emptyCircle',
              //   symbolSize: 15,
              //   data: barData,
              // },
              {
                name: '完成数量',
                type: 'bar',
                barWidth: fontSize(10),
                itemStyle: {
                  borderRadius: fontSize(5),
                  color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#14c8d4' },
                    { offset: 1, color: '#43eec6' },
                  ]),
                },
                data: barData,
              },
              // {
              //   name: '处理数',
              //   type: 'bar',
              //   barGap: '-100%',
              //   barWidth: 10,
              //   itemStyle: {
              //       color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              //         { offset: 0, color: 'rgba(20,200,212,0.5)' },
              //         { offset: 0.2, color: 'rgba(20,200,212,0.2)' },
              //         { offset: 1, color: 'rgba(20,200,212,0)' },
              //       ]),
              //   },
              //   z: -12,
              //   data: lineData,
              // },
              // {
              //   name: 'dotted',
              //   type: 'pictorialBar',
              //   symbol: 'rect',
              //   itemStyle: {
              //       color: '#0f375f',
              //   },
              //   symbolRepeat: true,
              //   symbolSize: [12, 4],
              //   symbolMargin: 1,
              //   z: -10,
              //   data: barData,
              // },
            ],
          }
          myCharts4.setOption(option, true)
          setTimeout(() => {
            window.addEventListener('resize', () => {
              myCharts4.resize()
            })
          }, 100)
        }
      })
    },
  },
}
</script>

<style scoped lang="less">
.tasksCompletedByThirtyDays {
  .title {
    width: 100%;
    text-align: center;
    color: #00f6ff;
    font-size: 0.1rem;
    padding: 0.052rem 0 /* 20/384 */;
    background: url('./image/bottom_line.png') bottom no-repeat;
  }
  #eCharts4 {
    width: 100%;
    height: calc(100% - 0.252rem);
    padding: 0.026rem;
  }
}
</style>