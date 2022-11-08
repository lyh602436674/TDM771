<!--
 * @Author: 雷宇航
 * @Date: 2022-03-31 11:34:13
 * @LastEditTime: 2022-04-12 18:13:39
 * @LastEditors: 雷宇航
 * @Description:
 * @FilePath: \tdm200-client\tdm200-client\src\views\hifar\hifar-environmental-test\largeScreen\EquipDetailList.vue
-->
<template>
  <div class="equipDetailList">
    <div class="title">监控列表</div>
    <div class="content">
      <div class="content-table">
        <div class="table-header">
          <div class="table-header-item" v-for="(item, index) in columns" :key="index" :style="{ width: item.width }">
            {{ item.title }}
          </div>
        </div>
        <div class="table-body">
          <h-auto-scroll :data="dataSource" class="table-body-scroll" :class-option="classOption">
            <div class="table-body-row" v-for="(item, index) in dataSource" :key="index + '-tr'">
              <div class="table-body-col" v-for="(v, i) in columns" :key="index + i + 'td'" :style="{ width: v.width }">
                <template v-if="v.key !== 'status'">
                  {{ v.key === 'index' ? 1 + index : item[v.key] }}
                </template>
                <template v-else>
                  <div class="table-body-col-status" :style="{backgroundColor:colorList[item.statusNum-1]}">
                    {{ item[v.key] ? item[v.key] : '--' }}
                  </div>
                </template>
              </div>
            </div>
          </h-auto-scroll>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {getAction} from '@/api/manage'
import moment from 'moment'
import HAutoScroll from "@comp/HAutoScroll/HAutoScroll";

export default {
  name: 'EquipDetailList',
  components: {HAutoScroll},
  description: '设备信息列表页面',
  data() {
    return {
      classOption: {
        singleHeight: 30,
      },
      columns: [
        {title: '序号', width: '8%', key: 'index'},
        {title: '设备名称', width: '15%', key: 'equipName'},
        {title: '设备型号', width: '15%', key: 'equipModel'},
        {title: '已分配任务总数', width: '15%', key: 'count'},
        {title: '已开始任务', width: '15%', key: 'startCount'},
        {title: '预计结束时间', width: '20%', key: 'predictEndTime'},
        {title: '状态', width: '12%', key: 'status'},
      ],
      dataSource: [],
      // colorList: ['#26ad53', '#ff0000', '#7627cb', '#ff7800', '#fffc00', '#46afdb', '#ff0000'],
      colorList: ['#26ad53',  '#ff7800','#ff0000',],
      url: {
        list: '/LargeScreenDisplay/taskMonitor',
      },
    }
  },
  methods: {
    moment,
    loadData() {
      getAction(this.url.list).then((res) => {
        if (res.code === 200) {
          this.dataSource = res.data
          this.dataSource.map((item) => {
            item.statusNum = JSON.parse(JSON.stringify(item.status))
            item.status = this.deviceStatusFilter(item.status)
            item.predictEndTime = item.predictEndTime ? moment(+item.predictEndTime).format('YYYY-MM-DD HH:mm:ss') : ''
          })
        }
      })
    },
    deviceStatusFilter(status) {
      let s = parseInt(status)
      switch (s) {
        case 1:
          return '运行'
        case 2:
          return '待机'
/*        case 1:
          return '在用'
        case 2:
          return '停用'
        case 3:
          return '封存'
        case 4:
          return '报废'
        case 5:
          return '故障'
        case 6:
          return '计量'*/
        default:
          return '--'
      }
    },
  },
}
</script>

<style scoped lang="less">
.equipDetailList {
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
    padding: 0.05rem 0.2rem;
    overflow: hidden;

    &-table {
      width: 100%;
      height: 100%;
      border: 0.005rem solid rgb(13, 72, 224);
      // border-bottom: none;
      overflow: hidden;

      .table-header {
        height: 0.167rem /* 64/384 */;
        width: 100%;
        overflow: hidden;
        border-bottom: 0.005rem solid rgb(13, 72, 224) !important;
        display: flex;

        &-item {
          height: 0.167rem /* 64/384 */;
          line-height: 0.161rem /* 62/384 */;
          text-align: center;
          border-right: 0.005rem solid rgb(13, 72, 224);
          font-size: 0.083rem /* 32/384 */;

          &:last-child {
            border-right: none;
          }
        }
      }

      .table-body {
        width: 100%;
        height: calc(100% - 0.167rem);
        overflow: hidden;
        display: flex;
        flex-direction: column;

        &-scroll {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        &-row {
          width: 100%;
          height: 0.167rem /* 64/384 */;
          line-height: 0.167rem /* 64/384 */;
          text-align: center;
          font-size: 0.083rem /* 32/384 */;
          border-bottom: 0.005rem solid rgb(13, 72, 224);
          display: flex;
        }

        &-col {
          height: 0.167rem /* 64/384 */;
          padding: 0 0.026rem /* 10/384 */;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          border-right: 0.005rem solid rgb(13, 72, 224);

          &-status{
            display: inline-block;
            width: 80%;
            height: .12rem /* 46/384 */;
            line-height: .11rem;
            text-align: center;
            margin-top: .023rem /* 9/384 */;
            border-radius: .013rem /* 5/384 */;
          }

          &:last-child {
            border-right: none;
          }
        }
      }
    }
  }
}
</style>