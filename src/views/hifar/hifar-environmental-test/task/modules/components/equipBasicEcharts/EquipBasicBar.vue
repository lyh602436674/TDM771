<!--
 * @Author: 马潭龙
 * @Date: 2021-11-12 15:36:57
 * @LastEditTime: 2021-11-26 18:26:19
 * @LastEditors: 马潭龙
 * @Descripttion: 设备详情顶部-选项卡-柱形图
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\components\equipBasicEcharts\EquipBasicBar.vue
-->
<template>
  <div>
    <div id="chart" class="chart" :style="{ width: '100%',height:'250px' }"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  mounted() {
    this.drawChart()
  },
  methods: {
    drawChart() {
      let myChart = this.$echarts.init(document.getElementById('chart'))
      let option = {
        toolbox: {
          show: true,
          feature: {
            magicType: { show: true, type: ['line', 'bar'] },
            saveAsImage: { show: true },
          },
        },
        legend: {},
        tooltip: {},
        dataset: {
          source: [
            ['product', '温度', '湿度'],
            ['3-18', 36.2, 62.35],
            ['3-19', 85.3, 44.26],
            ['3-20', 55.6, 32.6],
            ['3-21', 43.3, 85.8],
            ['3-22', 86.4, 65.2],
            ['3-25', 72.4, 53.9],
            ['3-26', 72.4, 78.2],
            ['3-27', 45.2, 96.1],
            ['3-28', 72.8, 23.56],
            ['3-29', 52.4, 12.54],
            ['3-30', 39.7, 88.65],
            ['3-31', 88.5, 36.58],
          ],
        },
        xAxis: { type: 'category' },
        yAxis: {},
        series: [
          {
            type: 'bar',
          },
          {
            type: 'bar',
          },
        ],
      }

      myChart.setOption(option)
      setTimeout(function () {
        window.addEventListener("resize", function () {
          if(myChart)myChart.resize()
        })
      }, 200)
    },
  },
}
</script>
<style lang="less" scoped>
</style>