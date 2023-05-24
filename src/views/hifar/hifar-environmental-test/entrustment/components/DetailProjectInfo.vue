<!--
 * @Author: 赵峰
 * @Date: 2021-09-18 09:56:30
 * @Descripttion: 委托管理--详情-项目信息
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\entrustment\components\DetailProjectInfo.vue
-->
<template>
  <h-desc :bordered="false" size="small" title="项目信息">
    <h-card v-for="(item, index) in projectInfo" :id="'projectItem' + index" :key="index" style="margin-bottom: 10px">
      <div slot="title">{{ item.unitName }}</div>
      <template slot="content">
        <project-detail-template :model="item" title=""></project-detail-template>
      </template>
    </h-card>
  </h-desc>
</template>

<script>
import moment from 'moment'
import ProjectDetailTemplate from "@views/hifar/hifar-environmental-test/entrustment/components/ProjectDetailTemplate";

export default {
  components: {ProjectDetailTemplate},
  data() {
    return {
      moment,
      projectInfo: [],
    }
  },
  props: {
    projectInfoArr: [Array],
  },
  watch: {
    projectInfoArr: {
      deep: true,
      immediate: true,
      handler(val) {
        if (val) {
          this.projectInfo = val
          let arr = [
            {name: "频率1", value: "20"},
            {name: "谱密度值1", value: ""},
            {name: "左斜率1", value: ""},
            {name: "左斜率2", value: ""},
            {name: "左斜率3", value: ""},
            {name: "左斜率4", value: "-3"},
            {name: "右斜率1", value: "3"},
            {name: "右斜率2", value: ""},
            {name: "右斜率3", value: ""},
            {name: "右斜率4", value: ""},
            {name: "频率2", value: "80"},
            {name: "谱密度值2", value: "0.04"},
            {name: "斜率2", value: "0.04"},
            {name: "频率3", value: "350"},
            {name: "谱密度值3", value: "0.04"},
            {name: "斜率3", value: "-3"},
            {name: "频率4", value: "2000"},
            {name: "频率5", value: "666"},
            {name: "谱密度值4", value: ""},
            {name: "斜率4", value: ""},
            {name: "试验时间1", value: "5"},
            {name: "试验方向1", value: "XYZ"},
          ]
          // 把arr这个数组进行，行转列
          let columns = [
            {title: "序号", key: 'index', width: '10%'},
            {title: "频率", key: 'frequency', width: '18%'},
            {title: "谱密度值", key: 'spectralDensityValue', width: '18%'},
            {title: "左斜率", key: 'leftSlope', width: '18%'},
            {title: "右斜率", key: 'rightSlope', width: '18%'},
            {title: "试验时间", key: 'testTime', width: '18%'},
            {title: "试验方向", key: 'testDirection', width: '18%'},
          ]
          let dataSource = [
            {index: 1, frequency: 20, spectralDensityValue: "", leftSlope: "", rightSlope: "3", testTime: 5, testDirection: "XYZ"},
            {index: 2, frequency: 80,  spectralDensityValue: "0.04", leftSlope: "", rightSlope: "", testTime: "", testDirection: ""},
            {index: 3, frequency: 350,  spectralDensityValue: "0.04", leftSlope: "", rightSlope: "", testTime: "", testDirection: ""},
            {index: 4, frequency: 2000,  spectralDensityValue: "", leftSlope: "-3", rightSlope: "", testTime: "", testDirection: ""},
          ]
          // function transformData(arr) {
          //   let result = [];
          //   let row = {};
          //
          //   arr.forEach((item, index) => {
          //     const key = Object.keys(columns[index % columns.length])[1];
          //     row[key] = item.value;
          //
          //     if ((index + 1) % columns.length === 0) {
          //       row['index'] = result.length + 1;
          //       result.push(row);
          //       row = {};
          //     }
          //   });
          //
          //   return result;
          // }

          // function


          // let transformedData = transformArray(arr);
          // console.log(transformedData ,' zczxczcxc');
        }
      },
    },
  },

  created() {
  },
  methods: {},
}
</script>

<style lang="less" scoped>
.url-list {
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  span {
    margin-right: 10px;
  }

}
</style>