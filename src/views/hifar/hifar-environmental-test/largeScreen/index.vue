<template>
  <div ref="largeScreenPage" class="largeScreenPage">
    <header>
      724所试验室综合看板
      <span
        id="localtime"
        style="
          color: #fff;
          font-size: 0.1rem;
          position: absolute;
          right: 0.15rem;
          top: 50%;
          transform: translate(0, -50%);
        "
      >{{ currentTime }}</span
      >
      <span @click="fullscreen"
            style="cursor:pointer;color: #fff; font-size: 0.1rem;position: absolute;top: 50%;transform: translate(0, -50%);right:0.03rem"><a-icon
        type="fullscreen"></a-icon></span>
    </header>
    <main>
      <div class="main-left" ref="mainLeft">
        <equip-usage-rate ref="equipUsageRate"></equip-usage-rate>
        <equip-standing-book-status ref="equipStandingBookStatus"></equip-standing-book-status>
        <project-task-type-statistics ref="projectTaskTypeStatistics"></project-task-type-statistics>
      </div>
      <div class="main-center">
        <equip-location-distribute
          :title="title"
          :bgImg="bgImg"
          @equipItemEnter="equipItemEnter"
          @equipItemOut="equipItemOut"
          ref="equipLocationDistribute"
        ></equip-location-distribute>
        <equip-detail-list ref="equipDetailList"></equip-detail-list>
      </div>
      <div class="main-right">
        <equip-warning-by-intra-day ref="equipWarningByIntraDay"></equip-warning-by-intra-day>
        <shift-records ref="shiftRecords"></shift-records>
        <tasks-completed-by-thirty-days ref="tasksCompletedByThirtyDays"></tasks-completed-by-thirty-days>
      </div>
    </main>
    <transition>
      <div
        class="equipStatus-detail"
        @mouseleave="equipStatusDetailMouseOut"
        @mouseover="equipStatusDetailMouseEnter"
        @equipItemMove="equipStatusDetailMouseMove"
        v-if="detailVisible"
        :style="detailStyle"
      >
        <div v-for="(item, index) in equipItemInfo" :key="index + 'info'" class="equipStatus-detail-item">
          <span>{{ item.title }}：{{ item.value }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import {getAction} from '@api/manage'
import './flexible'
import EquipUsageRate from '@views/hifar/hifar-environmental-test/largeScreen/EquipUsageRate'
import EquipStandingBookStatus from '@views/hifar/hifar-environmental-test/largeScreen/EquipStandingBookStatus'
import ProjectTaskTypeStatistics from '@views/hifar/hifar-environmental-test/largeScreen/ProjectTaskTypeStatistics'
import EquipLocationDistribute from '@views/hifar/hifar-environmental-test/largeScreen/EquipLocationDistribute'
import EquipDetailList from '@views/hifar/hifar-environmental-test/largeScreen/EquipDetailList'
import EquipWarningByIntraDay from '@views/hifar/hifar-environmental-test/largeScreen/EquipWarningByIntraDay'
import ShiftRecords from '@views/hifar/hifar-environmental-test/largeScreen/ShiftRecords'
import TasksCompletedByThirtyDays from '@views/hifar/hifar-environmental-test/largeScreen/TasksCompletedByThirtyDays'

export default {
  name: 'LargeScreenPage',
  props: {
    title: {
      type: String,
      default: '设备状态',
    },
    bgImg: {
      type: String,
      default: require('./image/main.png'),
    },
  },
  components: {
    TasksCompletedByThirtyDays,
    ShiftRecords,
    EquipWarningByIntraDay,
    EquipDetailList,
    EquipLocationDistribute,
    ProjectTaskTypeStatistics,
    EquipStandingBookStatus,
    EquipUsageRate,
  },
  data() {
    return {
      url: {
        queryEquipInfo: '/HfBulletinBoardBusiness/queryEquipInfo',
      },
      detailStyle: {
        left: 0,
        top: 0,
      },
      isFullscreen: false,
      currentTime: '',
      setIntervalTime: null,
      currentTimeInterval: null,
      equipItemInfo: [
        {title: '委托单号', key: 'entrustNo', value: '--'},
        {title: '运行单号', key: 'entrustCode', value: '--'},
        {title: '设备名称', key: 'innerName', value: '--'},
        {title: '设备型号', key: 'equipModel', value: '--'},
        {title: '试验项目', key: 'unitName', value: '--'},
        {title: '试验性质', key: 'testPropertyName', value: '--'},
        {title: '试品名称', key: 'productName', value: '--'},
        {title: '试品型号', key: 'productModel', value: '--'},
        {title: '开始时间', key: 'realStartTime', value: '--'},
        {title: '预计时长', key: 'predictUseTime', value: '--'},
      ],
      detailVisible: false,
      detailMouseenter: false,
      equipItemTimer: null,
      equipDetailTimer: null,
      equipItemTimeStamp: 0,
      equipDetailTimeStamp: 0,
    }
  },

  created() {
  },
  mounted() {

  },
  beforeRouteEnter(to, from, next) {
    next((vm)=>{
      vm.init()
      vm.showLocale(new Date())
      getAction('/SysSwitchBusiness/queryByItemKeyPrefix', {itemKey: 'setInterval'}).then((result) => {
        if (result.code === 200) {
          result.data.map((item) => {
            if (item.itemKey === 'setIntervalTime4k') {
              vm.setIntervalTime = setInterval(() => {
                vm.init()
              }, +item.itemValue * 1000)
            }
          })
        }
      })
      vm.currentTimeInterval = setInterval(() => {
        vm.showLocale(new Date())
      }, 1000)
    })
  },
  beforeRouteLeave(to, from, next) {
    //页面离开后关闭定时器
    clearInterval(this.setIntervalTime)
    clearInterval(this.currentTimeInterval)
    next()
  },
  // deactivated() {
  //   clearInterval(this.setIntervalTime)
  //   clearInterval(this.currentTimeInterval)
  // },
  // beforeDestroy() {
  //   clearInterval(this.setIntervalTime)
  //   clearInterval(this.currentTimeInterval)
  // },
  methods: {
    init() {
      this.$refs.equipUsageRate.initCharts()
      this.$refs.equipStandingBookStatus.initCharts()
      this.$refs.equipLocationDistribute.getEquipStatus()
      this.$refs.projectTaskTypeStatistics.initCharts()
      this.$refs.tasksCompletedByThirtyDays.initCharts()
      this.$refs.shiftRecords.loadData()
      this.$refs.equipDetailList.loadData()
      this.$refs.equipWarningByIntraDay.getRecordsNum()
    },
    fullscreen() {
      this.isFullscreen = !this.isFullscreen
      let el = this.$refs.largeScreenPage
      if (this.isFullscreen) {
        if (el.requestFullscreen) {
          el.requestFullscreen();
        } else if (el.mozRequestFullScreen) {
          el.mozRequestFullScreen();
        } else if (el.webkitRequestFullscreen) {
          el.webkitRequestFullscreen();
        } else if (el.msRequestFullscreen) {
          el.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    },
    equipStatusDetailMouseMove() {
      this.detailVisible = false
    },
    equipItemEnter(e, item) {
      this.equipItemTimeStamp = 0
      clearInterval(this.equipItemTimer)
      this.equipItemTimer = setInterval(() => {
        this.equipItemTimeStamp++
        if (this.equipItemTimeStamp > 3) {
          clearInterval(this.equipItemTimer)
          let sideWidth = this.isFullscreen ? 0 : document.getElementsByTagName('aside')[0].offsetWidth
          let mainPageWidth = this.$refs.largeScreenPage.offsetWidth
          this.detailStyle = {
            left: ((e.clientX - sideWidth) / mainPageWidth) * 100 + 1 + '%',
            top: e.clientY - (this.isFullscreen ? 0 : 90) + 'px',
          }
          getAction(this.url.queryEquipInfo, {id: item.id}).then((res) => {
            if (res.code === 200) {
              this.detailVisible = true
              this.equipItemInfo.forEach((item) => {
                item.value = '--'
              })
              this.equipItemInfo.forEach((item) => {
                for (let key in res.data) {
                  if (key === item.key) {
                    if (item.key === 'temperature') {
                      item.value = res.data[key] + '℃'
                    } else {
                      item.value = res.data[key] || '--'
                    }
                  }
                }
              })
            }
          })
        }
      }, 100)
    },
    equipItemOut(e) {
      this.equipItemTimeStamp = 0
      if (this.equipItemTimer) {
        clearInterval(this.equipItemTimer)
      }
      this.equipDetailTimeStamp = 0
      if (this.equipDetailTimer) {
        clearInterval(this.equipDetailTimer)
      }
      this.equipDetailTimer = setInterval(() => {
        this.equipDetailTimeStamp++
        if (this.equipDetailTimeStamp >= 3) {
          clearInterval(this.equipDetailTimer)
          this.detailVisible = false
        }
      }, 100)
    },
    equipStatusDetailMouseOut() {
      setTimeout(() => {
        this.detailVisible = false
      }, 300)
    },
    equipStatusDetailMouseEnter() {
      clearInterval(this.equipDetailTimer)
      this.detailVisible = true
    },
    showLocale(time) {
      let str
      let yy = time.getFullYear()
      if (yy < 1900) yy = yy + 1900
      let MM = time.getMonth() + 1
      if (MM < 10) MM = '0' + MM
      let dd = time.getDate()
      if (dd < 10) dd = '0' + dd
      let hh = time.getHours()
      if (hh < 10) hh = '0' + hh
      let mm = time.getMinutes()
      if (mm < 10) mm = '0' + mm
      let ss = time.getSeconds()
      if (ss < 10) ss = '0' + ss
      let ww = time.getDay()
      if (ww === 0) ww = '星期日'
      if (ww === 1) ww = '星期一'
      if (ww === 2) ww = '星期二'
      if (ww === 3) ww = '星期三'
      if (ww === 4) ww = '星期四'
      if (ww === 5) ww = '星期五'
      if (ww === 6) ww = '星期六'
      str = yy + '-' + MM + '-' + dd + ' ' + hh + ':' + mm + ':' + ss + '  ' + ww
      this.currentTime = str
    },
  },
}
</script>

<style scoped lang="less">
@import './index.less';

.v-enter {
  opacity: 0;
  transform: scale(0);
}

.v-enter-to {
  opacity: 1;
  transform: scale(1);
}

.v-enter-active {
  transition: all 0.3s;
}

.v-leave {
  opacity: 1;
  transform: scale(1);
}

.v-leave-to {
  opacity: 0;
  transform: scale(0);
}

.v-leave-active {
  transition: all 0.3s;
}

/***
 *                    .::::.
 *                  .::::::::.
 *                 :::::::::::
 *             ..:::::::::::'
 *           '::::::::::::'
 *             .::::::::::
 *        '::::::::::::::..
 *             ..::::::::::::.
 *           ``::::::::::::::::
 *            ::::``:::::::::'        .:::.
 *           ::::'   ':::::'       .::::::::.
 *         .::::'      ::::     .:::::::'::::.
 *        .:::'       :::::  .:::::::::' ':::::.
 *       .::'        :::::.:::::::::'      ':::::.
 *      .::'         ::::::::::::::'         ``::::.
 *  ...:::           ::::::::::::'              ``::.
 * ```` ':.          ':::::::::'                  ::::..
 *                    '.:::::'                    ':'````..
 */
</style>