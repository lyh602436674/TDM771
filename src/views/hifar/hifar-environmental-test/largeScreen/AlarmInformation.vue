<!--
 * @Author: 雷宇航
 * @Date: 2022-03-31 11:40:37
 * @LastEditTime: 2022-04-12 14:20:37
 * @LastEditors: 雷宇航
 * @Description: 报警信息
 * @FilePath: \tdm200-client\tdm200-client\src\views\hifar\hifar-environmental-test\largeScreen\ShiftRecords.vue
-->
<template>
  <div class="shiftRecords">
    <div class="title">报警信息</div>
    <div class="content">
      <h-auto-scroll :class-option="classOption" :data="shiftData" class="content-wrapper">
        <ul class="content-wrapper-item">
          <li v-for="(item, index) in shiftData" :key="index">
            <span>
              <a-icon type="sound"></a-icon>
            </span>
            <span>
              {{ item.title }}
            </span>
            <span v-text="item.date"></span>
          </li>
        </ul>
      </h-auto-scroll>
    </div>
  </div>
</template>

<script>
import {getAction} from '@api/manage'
import moment from 'moment'
import HAutoScroll from "@comp/HAutoScroll/HAutoScroll";

export default {
  name: 'ShiftRecords',
  description: '交接班记录页面',
  components: {HAutoScroll},
  data() {
    return {
      shiftData: [],
      classOption: {
        singleHeight: 30,
      },
      url: {
        list: '/HfResDeviceWarningBusiness/listPage',
      },
    }
  },
  methods: {
    moment,
    loadData() {
      getAction(this.url.list).then((response) => {
        if (response.code === 200) {
          this.shiftData = []
          response.data.forEach((item) => {
            this.shiftData.push({
              title: item.contentWarning,
              date: moment(+item.warningTime).format('YY-MM-DD HH:mm'),
            })
          })
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>
.shiftRecords {
  .title {
    width: 100%;
    text-align: center;
    color: #00f6ff;
    font-size: 0.1rem;
    padding: 0.052rem 0 /* 20/384 */;
    background: url('./image/bottom_line.png') bottom no-repeat;
  }

  /deep/ .content {
    width: 100%;
    height: calc(100% - 0.252rem);
    padding: 0.052rem /* 20/384 */;

    &-wrapper {
      width: 100%;
      height: 100%;
      overflow: hidden;
      margin: 0 auto;

      &-item {
        margin: 0 auto;
        padding: 0 0.063rem /* 24/384 */;

        li {
          display: flex;
          justify-content: space-between;

          span {
            display: inline-block;
            font-size: 0.083rem /* 32/384 */;
            color: #fff;
          }

          span:first-child {
            width: 7%;
          }

          span:nth-of-type(2) {
            width: 55%;
          }

          span:last-child {
            flex: 1;
            text-align: right;
          }
        }
      }
    }
  }
}
</style>