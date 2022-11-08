<!--
 * @Author: 雷宇航
 * @Date: 2022-03-31 11:38:26
 * @LastEditTime: 2022-04-12 15:05:15
 * @LastEditors: 雷宇航
 * @Description:
 * @FilePath: \tdm200-client\tdm200-client\src\views\hifar\hifar-environmental-test\largeScreen\EquipWarningByIntraDay.vue
-->
<template>
  <div class="equipWarningByIntraDay">
    <div class="left">
      <div class="title">当天告警信息</div>
      <div class="left-img">
        <span class="img-text">{{ alarmtotal }}条</span>
      </div>
    </div>
    <div class="right">
      <div class="title">当天异常记录</div>
      <div class="right-img">
        <span class="img-text">{{ exceptiontotal }}条</span>
      </div>
    </div>
  </div>
</template>

<script>
import { getAction } from '@api/manage'
export default {
  name: 'EquipWarningByIntraDay',
  description: '当天设备警告信息页面',
  data() {
    return {
      alarmtotal: 0, //警告
      exceptiontotal: 0, //异常
      url: {
        alarmInfo: '/LargeScreenDisplay/alarmInfo',
      },
    }
  },
  methods: {
    getRecordsNum() {
      getAction(this.url.alarmInfo).then((res) => {
        if (res.code === 200) {
          this.alarmtotal = res.data.alarmtotal
          this.exceptiontotal = res.data.exceptiontotal
        }
      })
    },
  },
}
</script>

<style scoped lang="less">
@title-height: 25%;
@img-height: 75%;

.equipWarningByIntraDay {
  .left {
    width: 50%;
    height: 100%;

    &-img {
      width: 100%;
      height: @img-height;
      background-image: url(./image/msg-left.png);
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;
      position: relative;
    }
  }

  .right {
    width: 50%;
    height: 100%;

    &-img {
      width: 100%;
      height: @img-height;
      background-image: url(./image/msg-right.png);
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;
      position: relative;
    }
  }

  .title {
    width: 100%;
    height: @title-height;
    text-align: center;
    color: #00f6ff;
    font-size: 0.1rem;
    padding: 0.052rem 0;
  }

  .img-text {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-size: 0.167rem /* 64/384 */;
  }
}
</style>