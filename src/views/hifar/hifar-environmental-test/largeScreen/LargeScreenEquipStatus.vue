<template>
  <div class="main" ref="mainPage">
    <header>724所试验室综合看板</header>
    <div class="equipStatus">
      <div class="leftEquipImage" :style="{backgroundImage:'url('+imageSrc+')'}" ref="leftEquipImage"
           @contextmenu="switchContextmenu">
        <div class="dragSwitch" v-has="'largeScreen:change'" v-if="visible" :style="switchStyle">
          <span class="change">设备位置修改</span>
          <h-switch
            checkedTxt="启用"
            uncheckedTxt="禁用"
            v-model="dragSwitch"
            :defaultChecked="false"
            :options="['1','2']"
            @change="dragSwitchChange"
          />
        </div>
        <div class="equipStatus-item" v-for="(item,index) in equipStatusData" :key="index+'-item'"
             :style="{
             left:item.coordinateX + '%',
             top:item.coordinateY + '%',
             backgroundColor: item.status === '1' ? '#666' : item.status === '2'?'#0f0':item.status === '3' ? 'red' : '',
             }" @click="equipItemClick(item)" ref="equipItem" @mousedown="(e)=>equipItemDrag(e,item,index)"></div>
      </div>
      <div class="rightEquipInfo">
        <div class="equipRunningStatus">
          <div v-for="(item,index) in equipRunningStatus" :key="index+'-info'" class="equipRunningStatus-header">
            <div class="status" :style="{backgroundColor:item.color}"></div>
            <div class="text">{{ item.title }}</div>
          </div>
        </div>
        <div id="equipOccupyRate"></div>
        <div class="equipItemInfo">
          <div v-for="(item,index) in equipItemInfo" :key="index+'info'" style="color: #fff;font-size: 48px">
            <span>{{ item.title }}:</span>
            <span style="display: inline-block;margin-left: 50px">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {postAction, getAction} from "@api/manage";

export default {
  name: "LargeScreenEquipStatus",
  props: {
    imageSrc: {
      type: String
    }
  },
  data() {
    return {
      dragSwitch: '2',
      visible: false,
      switchStyle: {
        left: 0, top: 0
      },
      url: {
        getEquipStatus: "/HfBulletinBoardBusiness/getEquipStatus",
        queryEquipInfo: "/HfBulletinBoardBusiness/queryEquipInfo",
        modifyEquipXYById: "/HfBulletinBoardBusiness/modifyEquipXYById"
      },
      checkedEquip: {},//选中的设备
      equipRunningStatus: [
        {title: "运行", color: "#0f0"},
        {title: "故障", color: "red"},
        {title: "待机", color: "#666"},
      ],
      equipStatusData: [],
      equipItemInfo: [
        {title: "任务编号", key: "taskCode", value: "--"},
        {title: "设备名称", key: "innerName", value: "--"},
        {title: "设备型号", key: "equipModel", value: "--"},
        {title: "试验项目", key: "unitName", value: "--"},
        {title: "试验性质", key: "testPropertyName", value: "--"},
        {title: "试品名称", key: "productName", value: "--"},
        {title: "试品型号", key: "productModel", value: "--"},
        {title: "开始时间", key: "realStartTime", value: "--"},
        {title: "预计时长", key: "predictUseTime", value: "--"},
      ],
      setIntervalTime: null,
      dragFlag: false,
      dragItemLeftBefore: 0,
      dragItemTopBefore: 0,
    }
  },
  created() {
    this.init()
  },
  mounted() {
    this.equipRunningRate(0)
    document.body.onclick = () => {
      this.visible = false
    }
    getAction('/SysSwitchBusiness/queryByItemKeyPrefix', {itemKey: 'setInterval'}).then(result => {
      if (result.code === 200) {
        result.data.map(item => {
          if (item.itemKey === 'setIntervalTimeEquipStatus') {
            this.setIntervalTime = setInterval(() => {
              this.init()
            }, +item.itemValue * 1000)
          }
        })
      }
    })
  },
  beforeRouteLeave(to, form, next) {
    //页面离开后关闭定时器
    if (to.path !== '/LargeScreenEquipStatus') {
      clearInterval(this.setIntervalTime)
    }
    next()
  },
  methods: {
    switchContextmenu(e) {
      e.preventDefault()
      this.switchStyle.left = e.clientX - document.getElementsByTagName('aside')[0].offsetWidth - this.$refs.leftEquipImage.offsetLeft + 'px'
      this.switchStyle.top = e.clientY - 90 - this.$refs.leftEquipImage.offsetTop + 'px'
      this.visible = true
    },
    dragSwitchChange(val, e) {
      e.stopPropagation()
      this.dragSwitch = val
      setTimeout(() => {
        this.visible = false
      }, 300)
    },
    equipItemDrag(e, item, index) {
      if (this.dragSwitch === '1') {
        e.stopPropagation();
        //记录拖动之前的位置
        this.dragItemLeftBefore = JSON.parse(JSON.stringify(this.$refs.equipItem[index].offsetLeft))
        this.dragItemTopBefore = JSON.parse(JSON.stringify(this.$refs.equipItem[index].offsetTop))
        this.dragFlag = true
        let itemX = e.clientX - this.$refs.equipItem[index].offsetLeft
        let itemY = e.clientY - this.$refs.equipItem[index].offsetTop
        this.$refs.leftEquipImage.onmousemove = (event) => {
          if (!this.dragFlag) return
          let left = event.clientX - itemX
          let top = event.clientY - itemY
          //先让圆点跟着鼠标走
          this.$refs.equipItem[index].style.left = ((left / this.$refs.leftEquipImage.offsetWidth) * 100) + '%'
          this.$refs.equipItem[index].style.top = ((top / this.$refs.leftEquipImage.offsetHeight) * 100) + '%'
          //限制右边边界
          if (left > this.$refs.leftEquipImage.offsetWidth + this.$refs.leftEquipImage.offsetLeft - this.$refs.equipItem[index].offsetWidth) {
            this.$refs.equipItem[index].style.left = (((this.$refs.leftEquipImage.offsetWidth + this.$refs.leftEquipImage.offsetLeft - this.$refs.equipItem[index].offsetWidth) / this.$refs.leftEquipImage.offsetWidth) * 100) + '%'
          }
          //限制左边边界
          if (left < this.$refs.leftEquipImage.offsetLeft) {
            this.$refs.equipItem[index].style.left = ((this.$refs.leftEquipImage.offsetLeft / this.$refs.leftEquipImage.offsetWidth) * 100) + '%'
          }
          //限制上面边界
          if (top <= 0) {
            this.$refs.equipItem[index].style.top = 0 + '%'
          }
          //限制下面边界
          if (top > this.$refs.leftEquipImage.offsetHeight - this.$refs.equipItem[index].offsetHeight) {
            this.$refs.equipItem[index].style.top = (((this.$refs.leftEquipImage.offsetHeight - this.$refs.equipItem[index].offsetHeight) / this.$refs.leftEquipImage.offsetHeight) * 100) + '%'
          }
        }
        this.$refs.leftEquipImage.onmouseup = (events) => {
          this.$refs.leftEquipImage.onmousemove = null
          this.$refs.leftEquipImage.onmouseup = null
          this.dragFlag = false
          let params = {
            id: item.id,
            coordinateX: (((events.clientX - itemX) / this.$refs.leftEquipImage.offsetWidth) * 100).toFixed(2),
            coordinateY: (((events.clientY - itemY) / this.$refs.leftEquipImage.offsetHeight) * 100).toFixed(2)
          }
          if (((this.dragItemLeftBefore / this.$refs.leftEquipImage.offsetWidth) * 100).toFixed(2) !== params.coordinateX ||
            ((this.dragItemTopBefore / this.$refs.leftEquipImage.offsetHeight) * 100).toFixed(2) !== params.coordinateY
          ) {
            postAction(this.url.modifyEquipXYById, params).then(response => {
              if (response.code === 200) {
                this.$message.success('修改成功')
              } else {
                this.$refs.equipItem[index].style.left = ((this.dragItemLeftBefore / this.$refs.leftEquipImage.offsetWidth) * 100) + '%'
                this.$refs.equipItem[index].style.top = ((this.dragItemTopBefore / this.$refs.leftEquipImage.offsetHeight) * 100) + '%'
                this.$message.error('修改失败', response.message)
              }
            })
          }
        }
      }
    },
    equipItemClick(item) {
      this.checkedEquip = item
      this.getEquipInfo(item)
    },
    getEquipInfo(item) {
      getAction(this.url.queryEquipInfo, {id: item.id}).then(res => {
        if (res.code === 200) {
          this.equipRunningRate(res.data.utilizeRate)
          this.equipItemInfo.forEach(item => {
            item.value = '--'
          })
          this.equipItemInfo.forEach(item => {
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
    },
    equipRunningRate(value) {
      let myCharts = this.$echarts.init(document.getElementById('equipOccupyRate'))
      let option = {
        title: {
          show: true,
          text: '设备占用率',
          left: "50%",
          textAlign: "center",
          textStyle: {
            color: "#fff",
            fontSize: 50,
          }
        },
        grid: {},
        series: [
          {
            type: 'gauge',
            progress: {
              show: true,
              width: 24
            },
            axisLine: {
              lineStyle: {
                width: 24
              }
            },
            axisTick: {
              show: false
            },
            splitLine: {
              length: 10,//分割线长度
              distance: 5,//分割线距离外圆距离
              lineStyle: {
                width: 4,//分割线宽度
                color: '#fff'//分割线颜色
              }
            },
            axisLabel: {
              distance: 36,//数字距离分割线距离
              color: '#fff',
              fontSize: 32//数字文字大小
            },
            anchor: {
              show: true,
              showAbove: true,
              size: 16,//指针中间圆点大小
              itemStyle: {
                borderWidth: 0
              }
            },
            pointer: {
              width: 15,
            },
            detail: {
              valueAnimation: true,
              fontSize: 68,//中间文字大小
              color: "#fff",
              formatter: "{value}%",
              offsetCenter: [0, '70%']
            },
            data: [
              {
                value: value || 0,
              },
            ]
          }
        ]
      };
      myCharts.setOption(option);
      window.addEventListener("resize", function () {
        myCharts.resize();
      });
    },
    init() {
      this.getEquipStatus()
      this.getCheckedEquipInfo()
    },
    getCheckedEquipInfo() {
      if (JSON.stringify(this.checkedEquip) !== '{}') {
        this.getEquipInfo(this.checkedEquip)
      }
    },
    getEquipStatus() {
      getAction(this.url.getEquipStatus).then(res => {
        if (res.code === 200) {
          //这里只要设备状态为1，2，3的
          this.equipStatusData = res.data.filter(item => +item.status < 4)
        }
      })
    },
  },
}
</script>

<style scoped lang="less">
.main {
  width: 100%;
  //height: 2160px;
  height: 2070px;
  //background: #081832;
  background-color: rgb(2, 32, 96);
  overflow: hidden;

  /deep/ header {
    width: 100%;
    text-align: center;
    color: #fff;
    font-size: 68px;
    font-weight: bolder;
    position: relative;
  }

  .equipStatus {
    width: 100%;
    height: calc(100% - 102px);
    display: flex;


    /deep/ .leftEquipImage {
      width: 70%;
      height: 97%;
      margin-left: 1%;
      //background: url("./image/equip.jpg");
      background-size: 100% 100%;
      background-position: center center;
      overflow: auto;
      position: relative;

      .dragSwitch {
        position: absolute;
        background-color: #fff;
        padding: 20px;
        border-radius: 10px;
        border: 1px solid #e9e9e9;
        z-index: 999999;

        .change {
          font-size: 52px
        }

        .ant-switch {
          background-color: #999;
          margin-left: 20px;
          width: 200px;
          height: 66px;
          line-height: 60px;
          vertical-align: super;


          &-checked {
            background-color: #409EFF;
          }

          &-inner {
            font-size: 36px;
          }

          &:after {
            top: 4px;
            width: 54px;
            height: 54px;
            border-radius: 54px;
          }
        }
      }

      .equipStatus-item {
        position: absolute;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        transform: translate(-50%);
        cursor: pointer;
      }
    }

    .rightEquipInfo {
      width: 30%;
      height: 100%;

      #equipOccupyRate {
        width: 100%;
        height: 50%;
        margin-top: 40px;
      }

      .equipItemInfo {
        padding: 30px;
        margin: 0px 50px 0;
        //border: 1px solid #034c6a;
        box-shadow: -10px 0px 15px #bbbbbb inset, /*左边阴影*/
          0px -10px 15px #bbb inset, /*上边阴影*/ 10px 0px 15px #bbb inset, /*右边阴影*/ 0px 10px 15px #bbb inset
      }

      .equipRunningStatus {
        width: 100%;
        display: flex;
        justify-content: space-between;

        &-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;

          .status {
            display: inline-block;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            margin-right: 20px;
          }

          .text {
            color: #fff;
            font-weight: bolder;
            font-size: 52px;
          }
        }
      }
    }
  }

}


</style>