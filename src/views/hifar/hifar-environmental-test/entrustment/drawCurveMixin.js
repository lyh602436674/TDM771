// * @Author: 雷宇航
// * @Date: 2022-06-23 17:48:13
// * @fileName: drawCurveMixin.js
// * @FilePath: tdm200-client\src\views\hifar\hifar-environmental-test\entrustment\drawCurveMixin.js
// * @Description: 绘制曲线

import moment from "moment";

const momentFormat = function (value) {
  let hours = Math.floor(value / 1000 / 60 / 60)
  hours = hours < 10 ? '0' + hours : hours
  let minutes = Math.floor(value / 1000 / 60) % 60
  minutes = minutes < 10 ? '0' + minutes : minutes
  let seconds = Math.floor((value / 1000) % 60)
  seconds = seconds < 10 ? '0' + seconds : seconds
  return `${hours}:${minutes}:${seconds}`
}

export default {
  data() {
    return {
      isHighTemperature: null,
      loopNum: 1,
      initialTemTime: moment(0).format('x'),//温度初始时间
      initialHumTime: moment(0).format('x'),//湿度初始时间
      initialTemperature: 0, // 初始温度
      initialHumidity: 30, // 初始湿度
      entrustOrTaskFlag: false,// 绘制曲线数据的标记，false=> 在工艺规划页面绘制曲线，true=> 在试验任务中绘制曲线，因为两种绘制曲线的数据格式不一样
      temperatureResult: {},
      // 用来判断前置处理是先降温还是先升温，此处听一首许嵩的《降温》
      initHighLowTemperature: true,
    }
  },
  methods: {
    drawCurveByBefore(abilityInfo) {
      let field = 'temperatureResult_before'
      this.temperatureResult[field] = []
      // 目标温度
      let targetTem = this.getValueByField(abilityInfo, 'beforeTargetTem')
      // 初始温度
      let initTem = this.getValueByField(abilityInfo, 'beforeInitTem')
      // 温变时间
      let variationTimeTem = this.getValueByField(abilityInfo, 'beforeVariationTimeTem')
      // 保持时间
      let keepTime = this.getValueByField(abilityInfo, 'beforeKeepTime')
      this.initialTemperature = initTem
      this.resultAddData(this.initialTemperature, field)
      this.initHighLowTemperature = targetTem >= initTem
      if ((initTem || initTem === 0) && (targetTem || targetTem === 0) && variationTimeTem > 0) {
        this.calcAddTime(variationTimeTem)
        this.resultAddData(targetTem, field)
        if (keepTime > 0) {
          this.calcAddTime(keepTime)
          this.resultAddData(targetTem, field)
        }
        this.initialTemperature = targetTem
      }
    },
    drawCurveByStage(abilityInfo, isHighTemperature) {
      let field = 'temperatureResult_stage'
      this.temperatureResult[field] = []
      //最高温度
      let qh01 = this.getValueByField(abilityInfo, 'qh01')
      //最低温度
      let qh02 = this.getValueByField(abilityInfo, 'qh02')
      //高温保持
      let qh03 = this.getValueByField(abilityInfo, 'qh03')
      //低温保持
      let qh04 = this.getValueByField(abilityInfo, 'qh04')
      //升温时间
      let qh14 = this.getValueByField(abilityInfo, 'qh14')
      //降温时间
      let qh15 = this.getValueByField(abilityInfo, 'qh15')
      //循环次数
      let qh07 = this.getValueByField(abilityInfo, 'qh07') || 1
      let flag = !!(((qh01 || qh01 === 0) && qh14) || ((qh02 || qh02 === 0) && qh15))
      if (!flag) return
      // highTemImpact, lowTemImpact 这里判断仅仅只有高温或者低温，先这样判断，还没更好的办法
      let highTemImpact = !!(((qh01 || qh01 === 0) && qh14) && !((qh02 || qh02 === 0) && qh15))
      let lowTemImpact = !!(!((qh01 || qh01 === 0) && qh14) && ((qh02 || qh02 === 0) && qh15))
      if (highTemImpact) {
        this.highTempAddData(qh01, qh03, qh14)(field, isHighTemperature)
        return
      }
      if (lowTemImpact) {
        this.lowTempAddData(qh02, qh04, qh15)(field, isHighTemperature)
        return
      }
      for (let i = 0; i < qh07; i++) {
        if (isHighTemperature === '1') {
          this.highTempAddData(qh01, qh03, qh14)(field, isHighTemperature)
          this.lowTempAddData(qh02, qh04, qh15)(field, isHighTemperature)
        }
        if (isHighTemperature === '2') {
          this.lowTempAddData(qh02, qh04, qh15)(field, isHighTemperature)
          this.highTempAddData(qh01, qh03, qh14)(field, isHighTemperature)
        }
      }
      // 这里需要在循环阶段最后补一条线
      if (isHighTemperature === '1' && this.initHighLowTemperature) {
        this.calcAddTime(qh14)
        this.resultAddData(qh01, field)
        this.initialTemperature = qh01
      }
      if (isHighTemperature === '2' && !this.initHighLowTemperature) {
        this.calcAddTime(qh15)
        this.resultAddData(qh02, field)
        this.initialTemperature = qh02
      }
    },
    drawCurveByAfter(abilityInfo) {
      let field = 'temperatureResult_after'
      this.temperatureResult[field] = []
      // 回归温度
      let targetTem = this.getValueByField(abilityInfo, 'afterLastTem')
      // 温变时间
      let variationTimeTem = this.getValueByField(abilityInfo, 'afterVariationRateTem')
      // 保持时间
      let keepTime = this.getValueByField(abilityInfo, 'afterKeepTime')
      // 回归温度有且等于0时且温变时间有的情况下
      if ((targetTem || targetTem === 0) && variationTimeTem) {
        if (keepTime > 0) {
          this.calcAddTime(keepTime)
          this.resultAddData(this.initialTemperature, field)
        }
        this.calcAddTime(variationTimeTem)
        this.resultAddData(targetTem, field)
      }
    },
    highTempAddData(qh01, qh03, qh14) {
      return (field, isHighTemperature) => {
        if (isHighTemperature === '2' || !this.initHighLowTemperature) this.calcAddTime(qh14)
        this.resultAddData(qh01, field)
        this.initialTemperature = qh01
        if (qh03 > 0) {
          this.calcAddTime(qh03)
          this.resultAddData(qh01, field)
        }
      }
    },
    lowTempAddData(qh02, qh04, qh15) {
      return (field, isHighTemperature) => {
        if (this.initHighLowTemperature || isHighTemperature === '1') this.calcAddTime(qh15)
        this.resultAddData(qh02, field)
        this.initialTemperature = qh02
        if (qh04 > 0) {
          this.calcAddTime(qh04)
          this.resultAddData(qh02, field)
        }
      }
    },
    getValueByField(dataSource, field, variable = 'minValue') {
      try {
        return dataSource.filter(v => v.paramCode === field)[0][variable]
      } catch {
        return undefined
      }
    },
    resultAddData(nodeVal, field) {
      let nodeTime = Number(this.initialTemTime)
      nodeVal = Number(nodeVal)
      console.log(nodeVal, 'nodeVal')
      if (this.entrustOrTaskFlag) {
        this.temperatureResult[field].push(['Temperature_SV', nodeVal, moment(nodeTime).format('YYYY-MM-DD HH:mm:ss')])
      } else {
        this.temperatureResult[field].push({name: nodeTime, value: [nodeTime, nodeVal]})
      }
    },
    calcAddTime(value) {
      this.initialTemTime = Number(moment(this.initialTemTime).add(Number(value) * 60, 's').format('x'))
    },
    // 计算温度的曲线数据
    drawTemperatureCurve(abilityInfo) {
      let flag = false
      //计算   满足要求
      let result = []
      //初始时间
      // let qh00Index = abilityInfo.findIndex(i => i.paramCode === 'qh00')
      // let qh00 = qh00Index >= 0 && abilityInfo[qh00Index].minValue;
      // let qh00 = qh00Index >= 0
      //最高温度
      let qh01Index = abilityInfo.findIndex(i => i.paramCode === 'qh01')
      let qh01 = qh01Index >= 0 && abilityInfo[qh01Index].minValue
      //最低温度
      let qh02Index = abilityInfo.findIndex(i => i.paramCode === 'qh02')
      let qh02 = qh02Index >= 0 && abilityInfo[qh02Index].minValue
      //高温保持
      let qh03Index = abilityInfo.findIndex(i => i.paramCode === 'qh03')
      let qh03 = qh03Index >= 0 && abilityInfo[qh03Index].minValue
      //低温保持
      let qh04Index = abilityInfo.findIndex(i => i.paramCode === 'qh04')
      let qh04 = qh04Index >= 0 && abilityInfo[qh04Index].minValue
      //升温速率
      let qh05Index = abilityInfo.findIndex(i => i.paramCode === 'qh05')
      // let qh05 = qh05Index >= 0 && abilityInfo[qh05Index].minValue
      //降温速率
      let qh06Index = abilityInfo.findIndex(i => i.paramCode === 'qh06')
      // let qh06 = qh06Index >= 0 && abilityInfo[qh06Index].minValue

      //循环次数
      let qh07Index = abilityInfo.findIndex(i => i.paramCode === 'qh07')
      let qh07 = qh07Index >= 0 && abilityInfo[qh07Index].minValue

      /**
       * 必须：0， 1/2
       * 1存在，{0,1,5}, {0,1,5,3}, {0,1,5,3,7},
       * 2存在，{0,2,6}, {0,2,6,4}, {0,2,6,4,7},
       * 1,2都存在，先1后2
       */

      flag = ((qh01 || qh01 === 0) || (qh02 || qh02 === 0)) && (((qh01 || qh01 === 0) && qh14) || ((qh02 || qh02 === 0) && qh15))
      if (flag) {
        // let qh00Val = moment(0).format('x')
        let qh00Val = this.initialTemTime
        // let qh00Val = abilityInfo[qh00Index].minValue;
        let nodeTime = parseInt(qh00Val)
        let nodeVal = this.initialTemperature
        if (this.entrustOrTaskFlag) {
          result.push(['Temperature_SV', nodeVal, moment(nodeTime).format('YYYY-MM-DD HH:mm:ss')])
        } else {
          result.push({name: nodeTime, value: [nodeTime, nodeVal]})
        }
        // let loopNum = qh07 ? parseInt(abilityInfo[qh07Index].minValue) : 1
        for (let i = 1; i <= this.loopNum; i++) {
          let loopResult = this.loopTreatmentTemperature(abilityInfo, nodeTime, nodeVal, qh01Index, qh02Index, qh03Index, qh04Index, qh141Index, qh15Index, qh01, qh02, qh14, qh15)
          nodeTime = loopResult.nodeTime
          nodeVal = loopResult.nodeVal
          result = result.concat(loopResult.result)
        }
        this.initialTemTime = nodeTime
        this.initialTemperature = nodeVal
      }
      if (!flag) {
        result = []
      } else {
        flag = true
      }
      return {result, flag}
    },
    loopTreatmentTemperature(abilityInfo, nodeTime, nodeVal, qh01Index, qh02Index, qh03Index, qh04Index, qh141Index, qh15Index, qh01, qh02, qh14, qh15) {
      let result = []
      if (this.isHighTemperature === '1') {
        if ((qh01 || qh01 === 0) && qh14) {
          let highResult = this.highTreatmentTemperature(abilityInfo, nodeTime, nodeVal, qh01Index, qh03Index, qh141Index)
          result = result.concat(highResult.result)
          nodeTime = highResult.nodeTime
          nodeVal = highResult.nodeVal
          if ((qh02 || qh02 === 0) && qh15) {
            let lowTreatment = this.lowTreatmentTemperature(abilityInfo, nodeTime, nodeVal, qh02Index, qh04Index, qh15Index)
            result = result.concat(lowTreatment.result)
            nodeTime = lowTreatment.nodeTime
            nodeVal = lowTreatment.nodeVal
          }
        }
      } else if (this.isHighTemperature === '2') {
        if ((qh02 || qh02 === 0) && qh15) {
          let lowTreatment = this.lowTreatmentTemperature(abilityInfo, nodeTime, nodeVal, qh02Index, qh04Index, qh15Index)
          result = result.concat(lowTreatment.result)
          nodeTime = lowTreatment.nodeTime
          nodeVal = lowTreatment.nodeVal
          if ((qh01 || qh01 === 0) && qh14) {
            let highResult = this.highTreatmentTemperature(abilityInfo, nodeTime, nodeVal, qh01Index, qh03Index, qh141Index)
            result = result.concat(highResult.result)
            nodeTime = highResult.nodeTime
            nodeVal = highResult.nodeVal
          }
        }
      } else {
        console.log('render error')
      }
      return {
        result: result, nodeTime: nodeTime, nodeVal: nodeVal
      }
    },
    highTreatmentTemperature(abilityInfo, nodeTime, nodeVal, qh01Index, qh03Index, qh141Index) {
      let result = []
      let qh01Val = Number(abilityInfo[qh01Index].minValue) // 最高温度
      let qh051Val = Number(abilityInfo[qh141Index].minValue) // 升温时间
      // let addMin = Math.abs(((qh01Val - nodeVal) / qh051Val) * 60)
      let highTime = moment(nodeTime).add(Number(qh051Val) * 60, 's').format('x')
      nodeTime = parseInt(highTime)
      nodeVal = qh01Val
      if (this.entrustOrTaskFlag) {
        result.push(['Temperature_SV', nodeVal, moment(nodeTime).format('YYYY-MM-DD HH:mm:ss')])
      } else {
        result.push({name: nodeTime, value: [nodeTime, nodeVal]})
      }
      if (qh03Index >= 0 && abilityInfo[qh03Index].minValue) {
        let qh03Val = parseInt(abilityInfo[qh03Index].minValue)
        let highKeepTime = moment(nodeTime).add(qh03Val, 'm').format('x')
        nodeTime = parseInt(highKeepTime)
        if (this.entrustOrTaskFlag) {
          result.push(['Temperature_SV', nodeVal, moment(nodeTime).format('YYYY-MM-DD HH:mm:ss')])
        } else {
          result.push({name: nodeTime, value: [nodeTime, nodeVal]})
        }
      }
      return {
        result: result, nodeTime: nodeTime, nodeVal: nodeVal
      }
    },
    lowTreatmentTemperature(abilityInfo, nodeTime, nodeVal, qh02Index, qh04Index, qh15Index) {
      let result = []
      let qh02Val = Number(abilityInfo[qh02Index].minValue) // 最低温度
      let qh052Val = Number(abilityInfo[qh15Index].minValue) // 降温时间
      // let addMin = Math.abs(((nodeVal - qh02Val) / qh052Val) * 60)
      let lowTime = moment(nodeTime).add(Number(qh052Val) * 60, 's').format('x')
      nodeTime = parseInt(lowTime)
      nodeVal = qh02Val
      if (this.entrustOrTaskFlag) {
        result.push(['Temperature_SV', nodeVal, moment(nodeTime).format('YYYY-MM-DD HH:mm:ss')])
      } else {
        result.push({name: nodeTime, value: [nodeTime, nodeVal]})
      }
      if (qh04Index >= 0 && abilityInfo[qh04Index].minValue) {
        let qh04Val = parseInt(abilityInfo[qh04Index].minValue)
        let lowKeepTime = moment(nodeTime).add(qh04Val, 'm').format('x')
        nodeTime = parseInt(lowKeepTime)
        if (this.entrustOrTaskFlag) {
          result.push(['Temperature_SV', nodeVal, moment(nodeTime).format('YYYY-MM-DD HH:mm:ss')])
        } else {
          result.push({name: nodeTime, value: [nodeTime, nodeVal]})
        }
      }
      return {
        result: result, nodeTime: nodeTime, nodeVal: nodeVal
      }
    }, // 计算湿度的曲线数据
    drawHumidityCurve(abilityInfo) {
      if (!abilityInfo || !abilityInfo.length) {
        this.initialHumTime = this.initialTemTime
      }
      let flag = false, result = []
      // 最高湿度
      let rh01Index = abilityInfo.findIndex(i => i.paramCode === 'rh01')
      let rh01 = rh01Index >= 0 && abilityInfo[rh01Index].minValue
      //最低湿度
      let rh02Index = abilityInfo.findIndex(i => i.paramCode === 'rh02')
      let rh02 = rh02Index >= 0 && abilityInfo[rh02Index].minValue
      //最高湿度保持
      let rh03Index = abilityInfo.findIndex(i => i.paramCode === 'rh03')
      let rh03 = rh03Index >= 0 && abilityInfo[rh03Index].minValue
      //最低湿度保持
      let rh04Index = abilityInfo.findIndex(i => i.paramCode === 'rh04')
      let rh04 = rh04Index >= 0 && abilityInfo[rh04Index].minValue
      //湿度上升时间
      let rh05Index = abilityInfo.findIndex(i => i.paramCode === 'rh05')
      let rh05 = rh05Index >= 0 && abilityInfo[rh05Index].minValue
      //湿度下降时间
      let rh06Index = abilityInfo.findIndex(i => i.paramCode === 'rh06')
      let rh06 = rh06Index >= 0 && abilityInfo[rh06Index].minValue
      //循环次数
      // let rh07Index = abilityInfo.findIndex(i => i.paramCode === 'rh07')
      // let rh07 = rh07Index >= 0 && abilityInfo[rh07Index].minValue

      flag = ((rh01 || rh01 === 0) || (rh02 || rh02 === 0)) && (((rh01 || rh01 === 0) && rh05) || ((rh02 || rh02 === 0) && rh06))
      if (flag) {
        let rh00Val = this.initialHumTime
        let nodeTime = parseInt(rh00Val)
        let nodeVal = this.initialHumidity // 默认湿度为30%
        if (this.entrustOrTaskFlag) {
          result.push(['Humidity_SV', nodeVal, moment(nodeTime).format('YYYY-MM-DD HH:mm:ss')])
        } else {
          result.push({name: nodeTime, value: [nodeTime, nodeVal]})
        }


        for (let i = 1; i <= this.loopNum; i++) {
          let loopResult = this.loopTreatmentHumidity(abilityInfo, nodeTime, nodeVal, rh01Index, rh02Index, rh03Index, rh04Index, rh05Index, rh06Index, rh01, rh02, rh05, rh06)
          result = result.concat(loopResult.result)
          nodeTime = loopResult.nodeTime
          nodeVal = loopResult.nodeVal
        }
        this.initialHumTime = nodeTime
        this.initialHumidity = nodeVal
      }
      if (!flag) {
        result = []
      } else {
        flag = true
      }
      return {result, flag}
    },
    loopTreatmentHumidity(abilityInfo, nodeTime, nodeVal, rh01Index, rh02Index, rh03Index, rh04Index, rh05Index, rh06Index, rh01, rh02, rh05, rh06) {
      let result = []
      if ((rh01 || rh01 === 0) && rh05) {
        let highResult = this.highTreatmentHumidity(abilityInfo, nodeTime, nodeVal, rh01Index, rh03Index, rh05Index)
        result = result.concat(highResult.result)
        nodeTime = highResult.nodeTime
        nodeVal = highResult.nodeVal
        if ((rh02 || rh02 === 0) && rh06) {
          let lowTreatment = this.lowTreatmentHumidity(abilityInfo, nodeTime, nodeVal, rh02Index, rh04Index, rh06Index)
          result = result.concat(lowTreatment.result)
          nodeTime = lowTreatment.nodeTime
          nodeVal = lowTreatment.nodeVal
        }
      } else if ((rh02 || rh02 === 0) && rh06) {
        let lowTreatment = this.lowTreatmentHumidity(abilityInfo, nodeTime, nodeVal, rh02Index, rh04Index, rh06Index)
        result = result.concat(lowTreatment.result)
        nodeTime = lowTreatment.nodeTime
        nodeVal = lowTreatment.nodeVal
      }
      return {
        result: result, nodeTime: nodeTime, nodeVal: nodeVal
      }
    },
    highTreatmentHumidity(abilityInfo, nodeTime, nodeVal, rh01Index, rh03Index, rh05Index) {
      let result = []
      let rh01Val = Number(abilityInfo[rh01Index].minValue)
      let rh05Val = Number(abilityInfo[rh05Index].minValue)
      let highTime = moment(nodeTime).add(rh05Val, 'm').format('x')
      nodeTime = parseInt(highTime)
      nodeVal = rh01Val
      if (this.entrustOrTaskFlag) {
        result.push(['Humidity_SV', nodeVal, moment(nodeTime).format('YYYY-MM-DD HH:mm:ss')])
      } else {
        result.push({name: nodeTime, value: [nodeTime, nodeVal]})
      }
      if (rh03Index >= 0 && abilityInfo[rh03Index].minValue) {
        let rh03Val = parseInt(abilityInfo[rh03Index].minValue)
        let highKeepTime = moment(nodeTime).add(rh03Val, 'm').format('x')
        nodeTime = parseInt(highKeepTime)
        if (this.entrustOrTaskFlag) {
          result.push(['Humidity_SV', nodeVal, moment(nodeTime).format('YYYY-MM-DD HH:mm:ss')])
        } else {
          result.push({name: nodeTime, value: [nodeTime, nodeVal]})
        }
      }
      return {
        result: result, nodeTime: nodeTime, nodeVal: nodeVal
      }
    },
    lowTreatmentHumidity(abilityInfo, nodeTime, nodeVal, rh02Index, rh04Index, rh06Index) {
      let result = []
      let rh02Val = Number(abilityInfo[rh02Index].minValue)
      let rh06Val = Number(abilityInfo[rh06Index].minValue)
      let lowTime = moment(nodeTime).add(rh06Val, 'm').format('x')
      nodeTime = parseInt(lowTime)
      nodeVal = rh02Val
      if (this.entrustOrTaskFlag) {
        result.push(['Humidity_SV', nodeVal, moment(nodeTime).format('YYYY-MM-DD HH:mm:ss')])
      } else {
        result.push({name: nodeTime, value: [nodeTime, nodeVal]})
      }
      if (rh04Index >= 0 && abilityInfo[rh04Index].minValue) {
        let rh04Val = parseInt(abilityInfo[rh04Index].minValue)
        let lowKeepTime = moment(nodeTime).add(rh04Val, 'm').format('x')
        nodeTime = parseInt(lowKeepTime)
        if (this.entrustOrTaskFlag) {
          result.push(['Humidity_SV', nodeVal, moment(nodeTime).format('YYYY-MM-DD HH:mm:ss')])
        } else {
          result.push({name: nodeTime, value: [nodeTime, nodeVal]})
        }
      }
      return {
        result: result, nodeTime: nodeTime, nodeVal: nodeVal
      }
    },
  }
}