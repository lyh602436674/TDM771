<template>
  <div ref="largeScreenPage" class="largeScreenPage">
    <div class="data_content" style="height: 2070px">
      <!--                    调试4k时设置的样式   (主要调整头部信息栏高度)-->
      <div class="data_info" style="height: 211px">
        <div class="info_1 fl" style="height: 100%">
          <div class="text_1 data_info-borderRadius" id="facilityNum"
               style="height: 100%;display: flex;justify-content: space-around">
            <div class="fl" style="">
              <!--                    <img src="${ctxStatic}/img/info_1.png" style="width: 56px;margin-top: 10px;" alt="" class="fl">-->
              <i class="iconfont icon-shebeishuliang"
                 style="font-size: 70px;margin-top: 10px;position: absolute;top: 15px;left: 6px;color: yellow;"></i>
              <div class="fl" style="width: 100%">
                <div style="font-size: 58px;color: #fff;text-align: center">设备总数</div>
                <div style="cursor:pointer;font-size: 58px;color: #ffff43;text-align: center">{{ equipCount }}</div>
              </div>
            </div>
            <div class="fl">
              <i class="iconfont icon-shebeiliebiao"
                 style="font-size:55px;margin-top: 10px;position: absolute;top: 25px;left: 6px;color: yellow;"></i>
              <div class="fl" style="width: 100%">
                <div style="font-size: 58px;color: #fff;text-align: center">运行设备</div>
                <div style="cursor:pointer;font-size: 58px;color: #ffff43;text-align: center">{{ runEquipCount }}</div>
              </div>
            </div>
            <div class="fl">
              <i class="iconfont icon-xiaoshuai"
                 style="font-size: 80px;margin-top: 10px;position: absolute;top: 5px;left: -10px;color: yellow;"></i>
              <div class="fl" style="width: 100%">
                <div style="font-size: 58px;color: #fff;text-align: center">运行率</div>
                <div style="cursor:pointer;font-size: 58px;color: #ffff43;text-align: center">{{ runEquipRate }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="info_2 fl" style="height: 100%">
          <div class="text_2 data_info-borderRadius" id="testTask" style="height: 100%">
            <div class="fl">
              <i class="iconfont icon-renwu3"
                 style="font-size: 60px;margin-top: 10px;position: absolute;top: 20px;left:133px;color: #25f3e6;"></i>
              <div class="fl" style="width: 100%">
                <div style="font-size: 58px;color: #fff;text-align: center">所有未开始任务</div>
                <div style="font-size: 58px;color: #25f3e6;text-align: center">{{ awaitTestTaskCount }}</div>
              </div>
            </div>
            <div class="fl">
              <i class="iconfont icon-renwu2"
                 style="font-size:100px;margin-top: 5px;position: absolute;left:34px;color: #25f3e6;"></i>
              <div class="fl" style="width: 100%">
                <div style="font-size: 58px;color: #fff;text-align: center">所有执行中任务</div>
                <div style="font-size: 58px;color: #25f3e6;text-align: center">{{ executeTaskCount }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="info_3 fl" style="height: 100%">
          <div class="text_3 data_info-borderRadius" id="yearTask" style="height: 100%">
            <div class="fl">
              <i class="iconfont icon-renwu"
                 style="font-size: 58px;margin-top: 10px;position: absolute;top: 18px;left: 20px;color:#ff4e4e;"></i>
              <div class="fl" style="width: 100%">
                <div style="font-size: 58px;color: #fff;text-align: center">已超期任务</div>
                <div style="font-size: 58px;color: #ff4e4e;text-align: center">{{ timeoutTaskCount }}</div>
              </div>
            </div>
            <div class="fl">
              <i class="iconfont icon-renwu1"
                 style="font-size: 73px;margin-top: 10px;position: absolute;top: 13px;left:102px;color:#ff4e4e;"></i>
              <div class="fl" style="width: 100%">
                <div style="font-size: 58px;color: #fff;text-align: center">本月完成任务</div>
                <div style="font-size: 58px;color: #ff4e4e;text-align: center">{{ finishTaskCount }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!--                    调试4k时设置的样式  (主要调整高度)-->
      <div class="data_main" style="height: 850px;margin-top: 90px">
        <div class="main_center fl" style="height: 100%">
          <div class="center_text" style="height: 100%">
            <div class="main_title">
              <span>待测任务类型统计</span>
            </div>
            <div id="chart_1" class="chart" style="width:100%;height: 100%;"></div>
          </div>
        </div>
        <!--        调整4k时设置 （调整宽高和样式）-->
        <div class=" main_right fr" style="height: 100%">
          <div class="right_1" style="height: 100%">
            <div class="main_title" style="position: absolute;left: 50%;transform: translate(-50%)">
              <span>近30天完成任务</span>
            </div>
            <div id="chart_3" class="echart" style="width:100%;height: 100%;"></div>
          </div>
        </div>
      </div>
      <!--    设置4k时宽高样式-->
      <div class="data_bottom" style="height: 800px;margin-top: 65px">
        <div class="bottom_center fl" style="height: 100%;">
          <div class="bottom_2 fl" style="height: 100%;width: calc(100% - 50px)">
            <div class="main_title"
                 style="width: 450px;position: absolute;left: 50%;transform: translate(-50%);text-align: center"
                 id="main_title_today">
              <span>今日值班</span>
            </div>
            <div style="height: 790px">
              <div id="gentryInfo">
                <div v-for="(item,index) in todayBeOnDutyPerson" :key="index+'-today'"
                     style="display: flex;align-items: center;overflow:hidden;padding-right:10px ">
                  <div style="width: 60%;height: 100%;margin-right: 20px;padding: 10px">
                    <img style="width: 100%;height: 100%;" :src="item.headUrl">
                  </div>
                  <div style="font-size: 48px;width: 40%">
                    <div>{{ item.idName }}</div>
                    <div>{{ item.deptName }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bottom_4 fr" style="height: 100%;">
          <!--                    调试4k时设置的样式-->
          <div class="main_title" style="width: 710px;position: absolute;left: 50%;transform: translate(-50%)"
               id="main_title_seven">
            <span>近七天设备利用率</span>
          </div>
          <div class="main_table" id="urgentTaskList" style="width:100%;height: 100%;"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {getAction, postAction} from "@api/manage";

export default {
  name: "LargeScreenPage",
  data() {
    return {
      equipCount: "0",
      runEquipCount: "0",
      runEquipRate: "0%",
      awaitTestTaskCount: "0",
      executeTaskCount: "0",
      finishTaskCount: "0",
      timeoutTaskCount: "0",
      todayBeOnDutyPerson: [],
      setIntervalTime: null,
      url: {
        equipRate: "HfBulletinBoardBusiness/equipRate",
        testTaskRate: "HfBulletinBoardBusiness/testTaskRate",
        monthTaskCount: "HfBulletinBoardBusiness/monthTaskCount",
        testTaskStatistics: "HfBulletinBoardBusiness/testTaskStatistics",
        thirtyDayFinishTaskStatistics: "HfBulletinBoardBusiness/thirtyDayFinishTaskStatistics",
        theDayBeOnDuty: "HfBulletinBoardBusiness/theDayBeOnDuty",
        weekEquipUtilizeRate: "HfBulletinBoardBusiness/weekEquipUtilizeRate",
      },
    }
  },
  created() {
    this.init()
  },
  mounted() {
    getAction('/SysSwitchBusiness/queryByItemKeyPrefix', {itemKey: 'setInterval'}).then(result => {
      if (result.code === 200) {
        result.data.map(item => {
          if (item.itemKey === 'setIntervalTime4k') {
            this.setIntervalTime = setInterval(() => {
              this.init()
            }, +item.itemValue * 1000)
          }
        })
      }
    })
  },
  beforeRouteLeave(to, from, next) {
    //页面离开后关闭定时器
    if (to.path !== '/largeScreenPage') {
      clearInterval(this.setIntervalTime)
    }
    next()
  },
  methods: {
    init() {
      this.getHeadData()
      this.testTaskStatistics()
      this.thirtyDayFinishTaskStatistics()
      this.theDayBeOnDuty()
      this.weekEquipUtilizeRate()
    },
    getHeadData() {
      // 获取头部设备数据
      getAction(this.url.equipRate).then(res => {
        if (res.code === 200) {
          let {equipCount, runEquipCount, runEquipRate} = res.data
          this.equipCount = equipCount
          this.runEquipCount = runEquipCount
          this.runEquipRate = runEquipRate + '%'
        }
      })
      getAction(this.url.testTaskRate).then(res => {
        if (res.code === 200) {
          let {awaitTestTaskCount, executeTaskCount} = res.data
          this.awaitTestTaskCount = awaitTestTaskCount
          this.executeTaskCount = executeTaskCount
        }
      })
      getAction(this.url.monthTaskCount).then(res => {
        if (res.code === 200) {
          let {finishTaskCount, timeoutTaskCount} = res.data
          this.finishTaskCount = finishTaskCount
          this.timeoutTaskCount = timeoutTaskCount
        }
      })
    },
    testTaskStatistics() {
      //待测任务类型统计
      getAction(this.url.testTaskStatistics).then(res => {
        if (res.code === 200) {
          let data = res.data;
          let myChart = this.$echarts.init(document.getElementById('chart_1'))
          let option = {
            backgroundColor: 'transparent',
            tooltip: {
              trigger: 'item',
              formatter: "{a} <br/>{b}: {c} ({d}%)",
            },
            // color: ['#0035f9', '#f36f8a', '#ffff43', '#25f3e6', '#ffff43', '#FF0087'],
            legend: { //图例组件，颜色和名字
              left: '65%',
              top: '95',
              orient: 'vertical',
              itemGap: 15, //图例每项之间的间隔
              itemWidth: 100,
              itemHeight: 60,
              icon: 'roundRect',
              textStyle: {
                color: [],
                fontStyle: 'normal',
                fontFamily: '微软雅黑',
                fontSize: 58,
              }
            },
            series: [{
              name: '任务类型',
              type: 'pie',
              left: 50,
              clockwise: false, //饼图的扇区是否是顺时针排布
              minAngle: 20, //最小的扇区角度（0 ~ 360）
              center: ['25%', '50%'], //饼图的中心（圆心）坐标
              radius: [150, 250], //饼图的半径
              avoidLabelOverlap: true, ////是否启用防止标签重叠
              itemStyle: { //图形样式
                borderRadius: 12,
                borderColor: '#081832',
                borderWidth: 4,
                // normal: {
                //   borderColor: '#1e2239',
                //   borderWidth: 1.5,
                // },
              },
              label: { //标签的位置 , 百分比是否显示
                normal: {
                  show: true,
                  position: 'outside', //标签的位置
                  fontSize: 40,
                  formatter: "{d}%",
                  textStyle: {
                    color: '#fff',
                    fontSize: 42
                  }
                },
                emphasis: {
                  show: true,
                  textStyle: {
                    fontWeight: 'bold'
                  }
                }
              },
              labelLine: {
                length: 30,
                length2: 30,
                lineStyle: {
                  width: 3
                }
              },
              data: data
            }, {
              name: '',
              type: 'pie',left: 50,

              clockwise: false,
              silent: true,
              minAngle: 20, //最小的扇区角度（0 ~ 360）
              center: ['25%', '50%'], //饼图的中心（圆心）坐标
              radius: [0, 145], //饼图的半径
              itemStyle: { //图形样式
                borderRadius: 10,
                borderColor: '#081832',
                borderWidth: 4,
                opacity: 0.2,
              },
              label: { //标签的位置，鼠标点击后任务类型是否显示
                normal: {
                  show: false
                }
              },
              data: data
            }]
          };
          // 使用刚指定的配置项和数据显示图表。
          myChart.setOption(option);
          window.addEventListener("resize", function () {
            myChart.resize();
          });
        }
      })
    },
    thirtyDayFinishTaskStatistics() {
      getAction(this.url.thirtyDayFinishTaskStatistics).then(res => {
        if (res.code === 200) {
          let myChart = this.$echarts.init(document.getElementById('chart_3'));
          let countArr = []
          let timeArr = []
          res.data.data.forEach(item => {
            countArr.push(item.count)
            timeArr.push(item.time)
          })
          let legendData = ['', '', ''];
          let title = "";
          let serieData = [];
          let metaDate = countArr;
          let countDate = timeArr;
          for (let v = 0; v < legendData.length; v++) {
            let serie = {
              name: legendData[v],
              type: 'line',
              symbol: "circle",
              symbolSize: 10,
              data: metaDate[v]
            };
            serieData.push(serie)
          }
          let colors = ["#ffff43"];
          let option = {
            backgroundColor: 'transparent',
            title: {
              text: title,
              textAlign: 'left',
              textStyle: {color: "#fff", fontSize: "16", fontWeight: "normal"}
            },
            color: colors,
            grid: {left: '4%', top: "12%", bottom: "6%", right: "4%", containLabel: true},
            tooltip: {
              trigger: 'axis',
              formatter: (params) => {
                let html = ''
                html += '<div style="padding: 10px">';
                html += '<div>' + params[0].name + '</div>';
                html += '<div style="display: flex;align-items: center;justify-content: space-between">' +
                  '<div style="margin-right: 20px">' + '完成数量' + '</div>' +
                  '<div>' + params[0].value + '</div>'
                  + '</div>';
                html += '</div>';
                return html
              },
              textStyle: {
                fontSize: 32,
              },
              axisPointer: {type: 'shadow'}
            },
            xAxis: [
              {
                type: 'category',
                axisLine: {show: true, lineStyle: {color: "#FFFFFF"}},
                // 调试4k时设置的样式  原fontSize: 12
                axisLabel: {rotate: 30, margin: 30, textStyle: {color: '#fff', textAlign: "center", fontSize: 32}},
                axisTick: {show: false},
                data: countDate,
                // data: xAxisData,
              },
            ],
            yAxis: [
              {
                splitLine: {
                  show: true, lineStyle: {
                    width: 3
                  }
                },
                // 调试4k时设置的样式  原fontSize: 12
                axisLabel: {textStyle: {color: '#fff', fontSize: 32}},
                axisLine: {
                  show: true,
                  lineStyle: {
                    color: "#FFFFFF"
                  }
                },
              },
            ],
            series: {
              type: 'line',
              data: metaDate,
              smooth: true,  //平滑的曲线
              lineStyle: {
                width: 6,
                type: 'dashed'
              }
            }
          };
          // 使用刚指定的配置项和数据显示图表。
          myChart.setOption(option);
          window.addEventListener("resize", function () {
            myChart.resize();
          });
        }
      })
    },
    theDayBeOnDuty() {
      getAction(this.url.theDayBeOnDuty).then(res => {
        if (res.code === 200) {
          this.todayBeOnDutyPerson = res.data
        }
      })
    },
    weekEquipUtilizeRate() {
      getAction(this.url.weekEquipUtilizeRate).then(res => {
        if (res.code === 200) {
          let myChart = this.$echarts.init(document.getElementById("urgentTaskList"));
          let xAxis = [];
          let legend = [];
          let mySeries = [];
          res.data[0].forEach(item => {
            xAxis.push(item.time);
          })
          res.data.forEach((item, index) => {
            legend.push(item[0].name)
            mySeries.push({
              name: item[0].name,
              type: 'line',
              smooth: true, //平滑的曲线
              lineStyle: {
                width: 6,
                type: 'dotted'
              },
              data: []
            })
            item.forEach((v, i) => {
              mySeries[index].data.push(v.count)
            })
          })
          //hsj
          let options = {
            backgroundColor: 'transparent',
            xAxis: {
              type: 'category',
              boundaryGap: false,
              axisLabel: {textStyle: {color: '#fff', fontSize: 32}},
              offset: 20, //x轴偏移量
              data: xAxis
            },
            yAxis: {
              type: 'value',
              axisLabel: {
                textStyle: {color: '#fff', fontSize: 32},
                formatter: '{value}%'
              },
              splitLine: {
                lineStyle: {
                  width: 3
                }
              },
              axisLine: {
                lineStyle: {
                  color: "#fff"
                }
              },
            },
            tooltip: {
              trigger: 'axis',
              textStyle: {
                fontSize: 32,
              },
              formatter: (params) => {
                let html = ''
                html += '<div style="padding: 10px">';
                html += '<div>' + params[0].name + '</div>';
                html += '<div style="display: flex;align-items: center;justify-content: space-between">' +
                  '<div style="margin-right: 20px">' + params[0].seriesName + '</div>' +
                  '<div>' + params[0].value + '%' + '</div>'
                  + '</div>';
                html += '</div>';
                return html
              }
            },
            legend: {
              top: 20,
              itemWidth: 80,
              itemHeight: 50,
              icon: 'roundRect',
              textStyle: {
                color: "#fff",
                // 调试4k时设置的样式 (添加的属性)
                fontSize: 50
              },
              data: legend
              // data: ["中频疲劳设备","高频疲劳设备"]
            },
            grid: {left: '4%', top: "15%", bottom: "15%", right: "5%", containLabel: true},
            series: mySeries
          }
          myChart.setOption(options);
          window.addEventListener("resize", function () {
            myChart.resize();
          });
        }
      })
    },
  },
}
</script>

<style scoped lang="less">
@import "./LargeScreenPage.less";


</style>