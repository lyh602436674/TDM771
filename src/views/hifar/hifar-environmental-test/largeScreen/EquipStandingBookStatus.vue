<!--
 * @Author: 雷宇航
 * @Date: 2022-03-31 11:05:32
 * @LastEditTime: 2022-04-12 16:40:45
 * @LastEditors: 雷宇航
 * @Description:
 * @FilePath: \tdm200-client\tdm200-client\src\views\hifar\hifar-environmental-test\largeScreen\EquipStandingBookStatus.vue
-->
<template>
  <div class="equipStandingBookStatus">
    <div class="title">设备台账状态</div>
    <div class="content" id="eCharts3"></div>
  </div>
</template>

<script>
import { fontSize } from './chartsFontSizeToRem'
import { getAction } from '@/api/manage'
export default {
  name: 'EquipStandingBookStatus',
  description: '设备台账状态页面',
  data() {
    return {
      url: {
        equipStatus: '/LargeScreenDisplay/equipStatus',
      },
    }
  },
  methods: {
    initCharts() {
      let myChart3 = this.$echarts.init(document.getElementById('eCharts3'))
      getAction(this.url.equipStatus).then((res) => {
        if (res.code === 200) {
          let legendData = res.data.map((item) => item.equipstatus)
          let seriesData = []
          let colorList = ['#ff0000','#26ad53','#7627cb','#ff7800', '#fffc00', '#46afdb', ]
          res.data.forEach((item, index) => {
            seriesData.push({
              value: item.total,
              name: item.equipstatus +'-'+ item.total,
              itemStyle: { color: colorList[index] },
            })
          })
          let option = {
            legend: {
              bottom: fontSize(20),
              itemWidth: fontSize(24),
              itemHeight: fontSize(16),
              textStyle: {
                color: '#fff',
                fontSize: fontSize(24),
              },
              data: legendData,
            },
            tooltip: {
              trigger: 'item',
              textStyle: {
                fontSize: fontSize(36),
              },
            },
            series: [
              {
                type: 'pie',
                avoidLabelOverlap: true,
                radius: ['30%', '60%'],
                center: ['55%', '45%'],
                roseType: false, // boolean string => false,radius,area
                data: seriesData,
                labelLine: {
                  length: fontSize(36),
                  length2: fontSize(54),
                  lineStyle: {
                    width: fontSize(2),
                  },
                },
                label: {
                  color: '#fff',
                  fontSize: fontSize(36),
                },
                labelLayout: {
                  draggable: true,
                },
                emphasis: {
                  scaleSize: fontSize(10),
                },
              },
            ],
          }
          myChart3.setOption(option)
          setTimeout(() => {
            window.addEventListener('resize', () => {
              myChart3.resize()
            })
          }, 100)
        }
      })
    },
  },
}
</script>

<style scoped lang="less">
.equipStandingBookStatus {
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