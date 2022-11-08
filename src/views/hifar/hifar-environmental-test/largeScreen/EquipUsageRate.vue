<!--
 * @Author: 雷宇航
 * @Date: 2022-03-31 11:00:48
 * @LastEditTime: 2022-04-12 17:00:10
 * @LastEditors: 雷宇航
 * @Description:
 * @FilePath: \tdm200-client\tdm200-client\src\views\hifar\hifar-environmental-test\largeScreen\EquipUsageRate.vue
-->
<template>
  <div class="equipUsageRate">
    <div class="title">设备占用数量</div>
    <div id="eCharts1"></div>
  </div>
</template>

<script>
import { getAction } from '../../../../api/manage'
import { fontSize } from './chartsFontSizeToRem'
export default {
  name: 'EquipUsageRate',
  description: '设备使用率页面',
  data() {
    return {
      url: {
        usageRate: '/LargeScreenDisplay/equipUtiluzationRate'
      },
      weekRate: '',
      monthRate: '',
      lixueText: '',
      qihouText: ''
    }
  },
  methods: {
    initCharts() {
      let myChart1 = this.$echarts.init(document.getElementById('eCharts1'))
      getAction(this.url.usageRate).then((res) => {
        if (res.code === 200) {
          // let { weekfree, weekoccupy, monthfree, monthoccupy } = res.data

          /*          this.weekRate = (weekoccupy / (weekfree+weekoccupy) * 100).toFixed(2) + '%'
                    this.monthRate = (monthoccupy / (monthfree+monthoccupy) * 100).toFixed(2) + '%'   */
      /*    let lixueRun = data['1_run'] || 0
          let lixutStep = data['1_step'] || 0
          let qihouRun = data['2_run']||0
          let qihouStep = data['2_step'] || 0*/
          let { dynamics_run, dynamics_step, climate_run, climate_step } = res.data
          this.lixueText = ' 力学'
          this.qihouText = ' 气候'
          let lixue = [
            { value: dynamics_run || 0, name: '空闲' },
            { value: dynamics_step || 0, name: '占用' }
          ]
          let qihou = [
            { value: climate_run || 0, name: '空闲' },
            { value: climate_step || 0, name: '占用' }
          ]
          let option = {
            tooltip: {
              trigger: 'item',
              formatter: '{a} <br/>{b}: {c} ({d}%)',
              textStyle: {
                fontSize: fontSize(36)
              }
            },
            legend: {
              show: true,
              left: 'center',
              data: ['空闲', '占用'],
              itemWidth: fontSize(36),
              itemHeight: fontSize(24),
              textStyle: {
                color: '#fff',
                fontSize: fontSize(24),
              },
            },
            color: ['#37a2da', '#ffd85c'],
            graphic: [
              {
                type: 'text',
                left: '18%',
                top: '45%',
                z: 10,
                style: {
                  fill: '#ffffff',
                  text: this.lixueText,
                  textAlign: 'left',
                  font: fontSize(36) + 'px' + ' Arial'
                },
              },
              {
                type: 'text',
                left: '68%',
                top: '45%',
                z: 10,
                style: {
                  fill: '#ffffff',
                  text: this.qihouText,
                  textAlign: 'left',
                  font: fontSize(36) + 'px' + ' Arial'
                },
              },
            ],
            series: [
              {
                name: '力学',
                type: 'pie',
                radius: ['55%', '80%'],
                center: ['25%', '50%'],
                label: {
                  show: true,
                  color: '#fff',
                  fontSize: fontSize(28),
                  formatter:'{c}',
                },
                labelLine: {
                  length: fontSize(4),
                  length2: fontSize(4),
                  show: false,
                  lineStyle: {
                    width: fontSize(2)
                  }
                },
                emphasis: {
                  scaleSize: fontSize(10)
                },
                data: lixue
              },
              {
                name: '气候',
                type: 'pie',
                radius: ['55%', '80%'],
                center: ['75%', '50%'],
                label: {
                  show: true,
                  color: '#fff',
                  fontSize: fontSize(28),
                  formatter:'{c}',
                },
                labelLine: {
                  length: fontSize(4),
                  length2: fontSize(4),
                  show: false,
                  lineStyle: {
                    width: fontSize(1)
                  },
                },
                emphasis: {
                  scaleSize: fontSize(10)
                },
                data: qihou
              },
            ],
          }
          myChart1.setOption(option, true)
          setTimeout(() => {
            window.addEventListener('resize', () => {
              myChart1.resize()
            })
          }, 100)
        }
      })
    },
  },
}
</script>

<style scoped lang="less">
.equipUsageRate {
  .title {
    width: 100%;
    text-align: center;
    color: #00f6ff;
    font-size: 0.1rem;
    padding-bottom: 0.052rem /* 20/384 */;
    background: url('./image/bottom_line.png') bottom no-repeat;
  }
  #eCharts1 {
    width: 100%;
    height: calc(100% - 0.2rem);
  }
}
</style>