<!--
 * @Author: 雷宇航
 * @Date: 2022-03-31 11:40:37
 * @LastEditTime: 2022-04-12 14:20:37
 * @LastEditors: 雷宇航
 * @Description:
 * @FilePath: \tdm200-client\tdm200-client\src\views\hifar\hifar-environmental-test\largeScreen\ShiftRecords.vue
-->
<template>
  <div class="shiftRecords">
    <div class="title">当日排班人员</div>
    <div class="content">
        <ul class="content-wrapper-item">
          <li ref="personItem" v-for="(item, index) in shiftData" :key="index">
            <div>
              <img style="width: 100%;height: 100%;display: block" :src="item.headUrl ? item.headUrl : noHead" alt="图像">
            </div>
            <div>{{ item.idName }}</div>
            <div>{{ item.mobile }}</div>
          </li>
        </ul>
    </div>
  </div>
</template>

<script>
import {getAction} from '@api/manage'
import moment from 'moment'

export default {
  name: 'ShiftRecords',
  description: '交接班记录页面',
  data() {
    return {
      noHead: require('./image/nohead.png'),
      shiftData: [],
      classOption: {
        singleHeight: 30,
      },
      url: {
        list: '/HfRecordHandover/getRecordHandover',
      },
    }
  },
  mounted() {

  },
  methods: {
    moment,
    loadData() {
      getAction(this.url.list).then((res) => {
        let defaultData = [
          {headUrl: "", idName: "暂无排班人员",},
          {headUrl: "", idName: "暂无排班人员",}
        ]
        if (res.code === 200) {
          this.shiftData = res.data && res.data.length ? res.data : defaultData
        } else {
          this.shiftData = defaultData
        }
      }).finally(() => {
        setTimeout(() => {
          window.onresize = () => {
            this.$refs.personItem.forEach(item => {
              item.children[0].style.width = item.children[0].offsetHeight + 'px'
            })
          }
        })
      })
    },
  },
}
</script>

<style scoped lang="less">
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
        height: 100%;
        display: flex;
        flex-direction: column;

        li {
          display: flex;
          align-items: center;
          color: #fff;
          height: calc(50% - 0.052rem);

          &:first-child {
            margin-bottom: 0.052rem;
          }

          div:nth-of-type(1) {
            background-size: 100% 100%;
            height: 100%;
            margin-right: 0.1rem;
            position: relative;
            padding-left: 31%;
            border-radius: 0.05rem;

            img {
              position: absolute;
              left: 0;
              right: 0;
              width: 100%;
              height: 100%;
              display: block;
              border-radius: 0.05rem;
            }
          }

          div:nth-of-type(2) {
            font-size: 0.09rem;
            margin-right: 0.1rem;
          }

          div:nth-of-type(3) {
            font-size: 0.09rem;
          }

        }
      }
    }
  }
}
</style>