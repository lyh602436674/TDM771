<!--
 * @Author: 雷宇航
 * @Date: 2022-03-31 11:28:16
 * @LastEditTime: 2022-04-12 15:59:39
 * @LastEditors: 雷宇航
 * @Description:
 * @FilePath: \tdm200-client\tdm200-client\src\views\hifar\hifar-environmental-test\largeScreen\EquipLocationDistribute.vue
-->
<template>
  <div class="equipLocationDistribute">
    <div class="title">
      <!--      <span>{{ title }}</span>-->
      <div class="equipRunningStatus">
        <div v-for="(item, index) in equipRunningStatus" :key="index + '-info'" class="equipRunningStatus-item">
          <!--          @mouseenter="equipStatusItemEnter(item)"
                      @mouseout="equipStatusItemOut(item)"-->
          <div
            class="status"
            :style="{ backgroundImage: 'url(' + equipStatusImage[item.status - 1] + ')' }"
          ></div>
          <div class="text">{{ item.title }}</div>
        </div>
      </div>
    </div>
    <div class="content" ref="content">
      <div ref="equipImage" class="equipImage-wrapper">
        <div v-if="visible" v-has="'largeScreen:change'" :style="switchStyle" class="dragSwitch">
          <div>
            <span class="change">设备位置修改</span>
            <h-switch
              v-model="dragSwitch"
              :defaultChecked="false"
              :options="['1', '2']"
              checkedTxt="启用"
              uncheckedTxt="禁用"
              @change="dragSwitchChange"
            />
          </div>
          <div style="margin-top:10px">
            <span class="change">自动轮播</span>
            <h-switch
              v-model="autoplaySwitch"
              :defaultChecked="false"
              :options="['1', '2']"
              checkedTxt="启用"
              uncheckedTxt="禁用"
              @change="autoplaySwitchChange"
            />
          </div>
        </div>
        <h-carousel :autoplay="autoplay" :autoplaySpeed="5000" effect="fade">
          <div
            v-for="(_item, _index) in bgImg"
            :key="_index"
            :style="{ backgroundImage: 'url(' + _item.img + ')' }"
            class="equipImage"
            @contextmenu="switchContextmenu"
          >

            <!--   v-if="item.address == _item.key"          -->
            <template v-for="(item, index) in equipStatusDataFilter(_item)">
              <div
                :key="index + '-item'"
                :ref="'equipItem' + _index + index"
                :style="{
                      left: item.coordinateX + '%',
                      top: item.coordinateY + '%',
                      backgroundImage: 'url(' + equipStatusImage[item.status - 1] + ')',
                }"
                class="equipStatus-item"
                @click="equipItemClick(item)"
                @mousedown="(e) => equipItemDrag(e, item, _index, index)"
                @mouseenter="(e) => equipItemEnter(e, item, _index, index)"
                @mouseout="(e) => equipItemOut(e)"
              ></div>
            </template>
          </div>
        </h-carousel>
      </div>
    </div>
  </div>
</template>

<script>
import {getAction, postAction} from '@api/manage'

export default {
  name: 'EquipLocationDistribute',
  description: '设备位置分布页面',
  props: {
    title: {
      type: String,
      default: '',
    },
    bgImg: {
      type: Array,
      default: [],
    },
  },

  data() {
    return {
      autoplay: false,
      equipStatusImage: [require('./image/running.png'), require('./image/warning.png'), require('./image/error.png')],
      equipRunningStatus: [
        {title: '占用', status: '1'},
        {title: '检修', status: '3'},
        {title: '空闲', status: '2'},
      ],
      url: {
        getEquipStatus: '/HfBulletinBoardBusiness/getEquipStatus',
        modifyEquipXYById: '/HfBulletinBoardBusiness/modifyEquipXYById',
      },
      dragSwitch: '2',
      autoplaySwitch: '2',
      visible: false,
      switchStyle: {
        left: 0,
        top: 0,
      },
      equipStatusData: [],
      dragItemLeftBefore: 0,
      dragItemTopBefore: 0,
    }
  },
  mounted() {
    document.body.onclick = () => {
      this.visible = false
    }
  },
  methods: {
    equipStatusDataFilter(_item) {
      return this.equipStatusData.filter(_eq => _eq.address === _item.key)
    },
    autoplaySwitchChange(val, e) {
      e.stopPropagation()
      this.autoplaySwitch = val
      setTimeout(() => {
        this.visible = false
      }, 300)
      if (val === '1') {
        this.autoplay = true
      }
    },
    equipStatusItemEnter(v) {
      this.equipStatusData.map((item) => {
        if (item.status !== v.status) {
          item.showFlag = false
        }
      })
      this.$forceUpdate()
    },
    equipStatusItemOut(v) {
      this.equipStatusData.map((item) => (item.showFlag = true))
      this.$forceUpdate()
    },
    getEquipStatus() {
      getAction(this.url.getEquipStatus).then((res) => {
        if (res.code === 200) {
          //这里只要设备状态为1，2，3的
          // let address = ['1', '2', '3', '4', '5', '6'] // bgImg
          let address = this.bgImg.map(v => v.key) // bgImg
          this.equipStatusData = res.data.filter((item) => +item.status < 4 && address.includes(item.address))
        }
      })
    },
    switchContextmenu(e) {
      e.preventDefault()
      this.switchStyle.left =
        e.clientX - (this.isFullscreen ? 0 : document.getElementsByTagName('aside')[0].offsetWidth) - this.$refs.equipImage.offsetLeft + 'px'
      this.switchStyle.top = e.clientY - 90 - this.$refs.equipImage.offsetTop + 'px'
      this.visible = true
    },
    equipItemClick(item) {
    },
    equipItemEnter(e, item) {
      this.$emit('equipItemEnter', e, item)
    },
    equipItemOut(e) {
      this.$emit('equipItemOut', e)
    },
    dragSwitchChange(val, e) {
      e.stopPropagation()
      this.dragSwitch = val
      this.$emit('dragSwitch', val)
      setTimeout(() => {
        this.visible = false
      }, 300)
    },
    equipItemDrag(e, item, _index, index) {
      if (this.dragSwitch === '1') {
        e.stopPropagation()
        let equipItemRef = this.$refs['equipItem' + _index + index][0]
        //记录拖动之前的位置
        this.dragItemLeftBefore = JSON.parse(JSON.stringify(equipItemRef.offsetLeft))
        this.dragItemTopBefore = JSON.parse(JSON.stringify(equipItemRef.offsetTop))
        this.dragFlag = true
        let itemX = e.clientX - equipItemRef.offsetLeft
        let itemY = e.clientY - equipItemRef.offsetTop
        this.$refs.equipImage.onmousemove = (event) => {
          this.$emit('equipItemMove')
          if (!this.dragFlag) return
          let left = event.clientX - itemX
          let top = event.clientY - itemY
          //先让圆点跟着鼠标走
          equipItemRef.style.left = (left / this.$refs.equipImage.offsetWidth) * 100 + '%'
          equipItemRef.style.top = (top / this.$refs.equipImage.offsetHeight) * 100 + '%'
          //限制右边边界
          if (left > this.$refs.equipImage.offsetWidth - equipItemRef.offsetWidth) {
            equipItemRef.style.left =
              ((this.$refs.equipImage.offsetWidth - equipItemRef.offsetWidth) /
                this.$refs.equipImage.offsetWidth) *
              100 +
              '%'
          }
          //限制左边边界
          if (left < 0) {
            equipItemRef.style.left = 0
          }
          //限制上面边界
          if (top <= 0) {
            equipItemRef.style.top = 0 + '%'
          }
          //限制下面边界
          if (top > this.$refs.equipImage.offsetHeight - equipItemRef.offsetHeight) {
            equipItemRef.style.top =
              ((this.$refs.equipImage.offsetHeight - equipItemRef.offsetHeight) /
                this.$refs.equipImage.offsetHeight) *
              100 +
              '%'
          }
        }
        this.$refs.equipImage.onmouseup = (events) => {
          this.$refs.equipImage.onmousemove = null
          this.$refs.equipImage.onmouseup = null
          this.dragFlag = false
          let params = {
            id: item.id,
            coordinateX: ((equipItemRef.offsetLeft / this.$refs.equipImage.offsetWidth) * 100).toFixed(
              2
            ),
            coordinateY: ((equipItemRef.offsetTop / this.$refs.equipImage.offsetHeight) * 100).toFixed(
              2
            ),
          }
          if (
            ((this.dragItemLeftBefore / this.$refs.equipImage.offsetWidth) * 100).toFixed(2) !== params.coordinateX ||
            ((this.dragItemTopBefore / this.$refs.equipImage.offsetHeight) * 100).toFixed(2) !== params.coordinateY
          ) {
            postAction(this.url.modifyEquipXYById, params).then((response) => {
              if (response.code === 200) {
                this.$message.success('修改成功')
              } else {
                equipItemRef.style.left =
                  (this.dragItemLeftBefore / this.$refs.equipImage.offsetWidth) * 100 + '%'
                equipItemRef.style.top =
                  (this.dragItemTopBefore / this.$refs.equipImage.offsetHeight) * 100 + '%'
                this.$message.error('修改失败', response.message)
              }
            })
          }
        }
      }
    },
  },
}
</script>
<style scoped lang="less">
.equipLocationDistribute {
  .title {
    width: 100%;
    text-align: center;
    color: #00f6ff;
    font-size: 0.1rem;
    padding: 0.052rem 0;
    height: 0.25rem;
    //background: url('./image/bottom_line.png') bottom no-repeat;
    position: relative;

    .equipRunningStatus {
      position: absolute;
      top: 50%;
      left: 0.078rem /* 30/384 */;
      display: flex;
      justify-content: space-between;
      transform: translate(0, -50%);

      &-item {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 0.052rem /* 20/384 */;
        cursor: pointer;

        .status {
          width: 0.156rem /* 60/384 */;
          height: 0.156rem /* 60/384 */;
          border-radius: 50%;
          margin-right: 0.052rem /* 20/384 */;
          background-size: 100% 100%;
        }

        .text {
          font-size: 0.083rem /* 32/384 */;
        }
      }
    }
  }

  .content {
    width: 100%;
    height: calc(100% - 0.252rem);
    padding: 0.05rem 0.2rem;

    /deep/ .ant-carousel {
      height: 100%;

      .slick-slider {
        height: 100%;

        .slick-list {
          height: 100%;

          .slick-track {
            height: 100%;

            .slick-slide > div {
              height: 100%;
            }
          }
        }
      }
    }

    .equipImage-wrapper {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;

      .dragSwitch {
        position: absolute;
        background-color: #fff;
        padding: 0.039rem /* 15/384 */;
        border-radius: 10px;
        border: 0.003rem solid #e9e9e9;
        z-index: 999999;

        .change {
          font-size: 0.094rem /* 36/384 */;
          color: #000;
          vertical-align: text-bottom;
        }

        .ant-switch {
          background-color: #999;
          margin-left: 0.052rem /* 20/384 */;
          width: 0.521rem /* 200/384 */;
          height: 0.172rem /* 66/384 */;
          line-height: 0.156rem /* 60/384 */;
          vertical-align: super;

          &-checked {
            background-color: #409eff;
          }

          &-inner {
            font-size: 0.094rem /* 36/384 */;
          }

          &:after {
            top: 0.01rem /* 4/384 */;
            width: 0.141rem /* 54/384 */;
            height: 0.141rem /* 54/384 */;
            border-radius: 0.141rem /* 54/384 */;
          }
        }
      }
    }

    .equipImage {
      width: 100%;
      height: 100%;
      background-size: 100% 100%;
      background-position: center center;
      overflow: hidden;
      position: relative;


      .equipStatus-item {
        position: absolute;
        width: 0.156rem /* 60/384 */;
        height: 0.156rem /* 60/384 */;
        border-radius: 50%;
        background-size: 100% 100%;
        cursor: pointer;
      }
    }
  }

  .v-enter {
    opacity: 0;
  }

  .v-enter-to {
    opacity: 1;
  }

  .v-enter-active {
    transition: all 0.3s;
  }

  .v-leave {
    opacity: 1;
  }

  .v-leave-to {
    opacity: 0;
  }

  .v-leave-active {
    transition: all 0.3s;
  }
}
</style>