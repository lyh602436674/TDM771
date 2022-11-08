<!--
 * @Author: 雷宇航
 * @Date: 2022-03-31 11:10:44
 * @LastEditTime: 2022-04-12 16:10:23
 * @LastEditors: 雷宇航
 * @Description:
 * @FilePath: \tdm200-client\tdm200-client\src\views\hifar\hifar-environmental-test\largeScreen\ProjectTaskTypeStatistics.vue
-->
<template>
  <div class="projectTaskTypeStatistics">
    <div class="title">30天内项目任务类别统计</div>
    <div class="content" id="eCharts5"></div>
  </div>
</template>

<script>
import { getAction } from '@/api/manage'
import { fontSize } from './chartsFontSizeToRem'
export default {
  name: 'ProjectTaskTypeStatistics',
  description: '项目任务类别统计页面',
  data() {
    return {
      url: {
        statis: '/LargeScreenDisplay/projectTaskCategory',
      },
    }
  },
  methods: {
    initCharts() {
      let myChart5 = this.$echarts.init(document.getElementById('eCharts5'))
      getAction(this.url.statis).then((res) => {
        if (res.code === 200) {
          let dataAxis = res.data.unitNames
          let seriesData = res.data.totals
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
              bottom: fontSize(100),
            },
            xAxis: {
              data: dataAxis,
              axisLabel: {
                color: '#fff',
                rotate: 45,
                interval: 0,
                fontSize: fontSize(24),
                margin: fontSize(16),
              },
              axisTick: {
                show: false,
              },
              axisLine: {
                show: true,
                lineStyle: {
                  color: '#fff',
                  width: fontSize(1),
                },
              },
              z: 10,
            },
            yAxis: {
              axisLine: {
                show: true,
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
              },
            },
            series: [
              {
                type: 'bar',
                label: {
                  show: true,
                  position: 'inside',
                  fontSize: fontSize(36),
                },
                showBackground: true,
                itemStyle: {
                  color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#83bff6' },
                    { offset: 0.5, color: '#188df0' },
                    { offset: 1, color: '#188df0' },
                  ]),
                },
                emphasis: {
                  itemStyle: {
                    color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: '#2378f7' },
                      { offset: 0.7, color: '#2378f7' },
                      { offset: 1, color: '#83bff6' },
                    ]),
                  },
                },
                data: seriesData,
              },
            ],
          }
          myChart5.setOption(option)
          setTimeout(() => {
            window.addEventListener('resize', () => {
              myChart5.resize()
            })
          }, 100)
        }
      })
    },
  },
}
</script>

<style scoped lang="less">
.projectTaskTypeStatistics {
  .title {
    width: 100%;
    text-align: center;
    color: #00f6ff;
    font-size: 0.1rem;
    padding: 0.052rem 0 /* 20/384 */;
    background: url('./image/bottom_line.png') bottom no-repeat;
  }
  .content {
    width: 100%;
    height: calc(100% - 0.252rem);
  }
}
</style>