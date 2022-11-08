<template>
  <h-modal
    :title="title"
    destroyOnClose
    inner
    fullScreen
    :getContainer="getContainer"
    :visible="visible"
    @cancel="handleCancel"
  >
    <div class="footer" slot="footer">
      <a-button @click="handleCancel" type="ghost-danger"> 关闭</a-button>
    </div>
    <div id="eChartsModal" class="eCharts" :style="{ width: '100%', height: '100%' }"></div>
  </h-modal>
</template>

<script>
import {postAction} from '@api/manage'
import {createMinioClient} from '@/utils/minioUtil.js'
import moment from "moment";

export default {
  name: "EquipBasicLineModal",
  props: {
    selectRowId: {
      type: Array,
      default: ''
    },
    selectedRow: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      visible: false,
      title: "曲线预览",
      url: {
        saveCurve:'/HfEnvTaskTestBusiness/saveCurve'
      },
    }
  },
  methods: {
    getContainer() {
      return document.body
    },
    open(record) {
      this.visible = true
      this.$nextTick(() => {
        this.drawChartModal(record)
      })
    },
    handleCancel() {
      this.visible = false
    },
    saveCurve(charts) {
      let base64Data = charts.api.getDataURL('png')
      let data={
        file:base64Data,
        testIds:this.selectRowId.map(item=>item.id).join(",")
      }
      console.log("data",data)
      postAction(this.url.saveCurve,data).then(res=>{
        if (res.code === 200) {
          this.$message.success("保存成功")
        } else {
          this.$message.error("保存失败")
        }
      })
      // FIXME: 前端进行文件上传,暂未实现
      /*        tryUpload(file)
                .then(res => {
                  console.log('上传测功', res)
                  let data={
                    file:res,
                    testIds:this.selectRowId.map(item=>item.id).join(",")
                  }
                  console.log("data",data)
                  postAction(this.url.saveCurve,data).then(res=>{
                    if(res.code==200){
                      this.$message.success("保存成功")
                    }else{
                      this.$message.error("保存失败")
                    }
                  })
                })
                .catch(err => {
                  console.log('上传失败', err)
                })*/
    },
    drawChartModal(record, extendRecord) {
      let that=this;
      let myChart = this.$echarts.init(document.getElementById('eChartsModal'))
      let myDataset = [];
      let mySeries = [];
      let chartParams = record.params || [];
      let chartData = record.data || [];
      if (chartParams.length > 0) {
        chartParams.forEach(i => {
          myDataset.push(
            {
              id: i.type,
              fromDatasetId: 'dataset_raw',
              transform: {
                type: 'filter',
                config: {
                  and: [
                    {dimension: 'tagName', '=': i.type},
                  ]
                }
              }
            }
          )
          mySeries.push(
            {
              name: i.name,
              type: 'line',
              datasetId: i.type,
              showSymbol: false,
              encode: {
                x: 'TimeStamp',
                y: 'tagValue',
                itemName: 'TimeStamp',
                tooltip: ['tagValue']
              }
            }
          )
        })
      } else {
        myDataset = []
        mySeries = []
      }
      let option = {
        backgroundColor: "#fff",
        dataset: [
          {
            id: 'dataset_raw',
            source: chartData
          }
        ].concat(myDataset),
        title: {
          // text: '规划曲线'
        },
        tooltip: {
          trigger: 'axis'
        },
        toolbox: {
          feature: {
            saveAsImage: {},
            dataZoom: {},
            mySaveQx: {
              show: true,
              title: '保存到曲线',
              // E:\projects\Hifar\tdm200-client\src\assets\signature-name.png
              // icon:"image://https://img95.699pic.com/element/40133/9422.png_300.png",
              icon: 'path://M814.805 128a51.179 51.179 0 0 1 51.179 51.179V844.01a51.179 51.179 0 0 1-51.179 51.157H201.173a51.179 51.179 0 0 1-51.178-51.157V179.179A51.179 51.179 0 0 1 201.173 128h613.654zM329.024 434.837a51.093 51.093 0 0 1-51.179-51.093V179.157h-76.672v664.854h613.76V179.179H738.22v204.48a51.179 51.179 0 0 1-51.179 51.178H329.024z m0-51.093h357.995V179.157H329.024v204.587z m357.91 204.501a25.557 25.557 0 1 1 0.085 51.072H329.024a25.536 25.536 0 1 1 0-51.072h357.91z',
              onclick() {
                if (that.selectedRow.length === 0) {
                  that.$message.info('请选择一项')
                  return
                }
                console.log("selectRow", that.selectedRow)
                let testCodes = that.selectedRow.map(item => item.testCode).join(',')
                let _this = this;
                that.$confirm({
                  title: '确认保存',
                  content: `是否保存到试验编号为${testCodes}的任务吗`,
                  onOk: function () {
                    that.saveCurve(_this)
                  }
                })
              }
            }
          },
          right: 40
        },
        dataZoom: [
          {
            // startValue: chartData[1][2],
            // endValue: chartData[chartData.length - 1][2],
          },
          {
            type: 'inside',
          },
        ],
        legend: {},
        grid:{
          bottom:80
        },
        xAxis: {
          type: 'time',
          nameLocation: 'middle',
          axisLabel: {
            show: true,
            showMinLabel: true,
            showMaxLabel: true,
            formatter: (value) => {
              return moment(value).format('MM-DD hh:mm').replace(" ", '\n')
            }
          },
          boundaryGap: false,
        },
        yAxis: {
          // name: '试验值'
        },
        series: mySeries
      }
      myChart.clear()
      myChart.setOption(option)
      setTimeout(function () {
        window.onresize = function () {
          myChart.resize()
        }
      }, 200)
    },
  }
}
</script>

<style scoped>

</style>