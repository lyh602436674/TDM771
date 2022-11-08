// * @Author: 雷宇航
// * @Date: 2022-06-23 17:48:13
// * @fileName: drawCurveMixin.js
// * @FilePath: tdm200-client\src\views\hifar\hifar-environmental-test\entrustment\drawCurveMixin.js
// * @Description: 绘制曲线

import moment from "moment";

export default {
  data() {
    return {
      isHighTemperature: true,
      loopNum: 1,
      initialTemTime: moment(0).format('x'),//温度初始时间
      initialHumTime: moment(0).format('x'),//湿度初始时间
      initialTemperature: 25, // 初始温度
      initialHumidity: 30, // 初始湿度
      entrustOrTaskFlag:false,// 绘制曲线数据的标记，false=> 在工艺规划页面绘制曲线，true=> 在试验任务中绘制曲线，因为两种绘制曲线的数据格式不一样
    }
  },
  methods: {
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
      let qh05 = qh05Index >= 0 && abilityInfo[qh05Index].minValue
      //降温速率
      let qh06Index = abilityInfo.findIndex(i => i.paramCode === 'qh06')
      let qh06 = qh06Index >= 0 && abilityInfo[qh06Index].minValue
      //循环次数
      // let qh07Index = abilityInfo.findIndex(i => i.paramCode === 'qh07')
      // let qh07 = qh07Index >= 0 && abilityInfo[qh07Index].minValue

      /**
       * 必须：0， 1/2
       * 1存在，{0,1,5}, {0,1,5,3}, {0,1,5,3,7},
       * 2存在，{0,2,6}, {0,2,6,4}, {0,2,6,4,7},
       * 1,2都存在，先1后2
       */
      flag = (qh01 || qh02) && ((qh01 && qh05) || (qh02 && qh06))
      if (flag) {
        // let qh00Val = moment(0).format('x')
        let qh00Val = this.initialTemTime
        // let qh00Val = abilityInfo[qh00Index].minValue;
        let nodeTime = parseInt(qh00Val)
        let nodeVal = this.initialTemperature
        if(this.entrustOrTaskFlag){
          result.push(['Temperature_SV', nodeVal, moment(nodeTime).format('YYYY-MM-DD HH:mm:ss')])
        }else{
          result.push({name: nodeTime, value: [nodeTime, nodeVal]})
        }
        // let loopNum = qh07 ? parseInt(abilityInfo[qh07Index].minValue) : 1

        for (let i = 1; i <= this.loopNum; i++) {
          let loopResult = this.loopTreatmentTemperature(abilityInfo, nodeTime, nodeVal, qh01Index, qh02Index, qh03Index, qh04Index, qh05Index, qh06Index, qh01, qh02, qh05, qh06)
          result = result.concat(loopResult.result)
          nodeTime = loopResult.nodeTime
          nodeVal = loopResult.nodeVal
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
    loopTreatmentTemperature(abilityInfo, nodeTime, nodeVal, qh01Index, qh02Index, qh03Index, qh04Index, qh05Index, qh06Index, qh01, qh02, qh05, qh06) {
      let result = []
      if (this.isHighTemperature) {
        if (qh01 && qh05) {
          let highResult = this.highTreatmentTemperature(abilityInfo, nodeTime, nodeVal, qh01Index, qh03Index, qh05Index)
          result = result.concat(highResult.result)
          nodeTime = highResult.nodeTime
          nodeVal = highResult.nodeVal
          if (qh02 && qh06) {
            let lowTreatment = this.lowTreatmentTemperature(abilityInfo, nodeTime, nodeVal, qh02Index, qh04Index, qh06Index)
            result = result.concat(lowTreatment.result)
            nodeTime = lowTreatment.nodeTime
            nodeVal = lowTreatment.nodeVal
          }
        }
      } else {
        if (qh02 && qh06) {
          let lowTreatment = this.lowTreatmentTemperature(abilityInfo, nodeTime, nodeVal, qh02Index, qh04Index, qh06Index)
          result = result.concat(lowTreatment.result)
          nodeTime = lowTreatment.nodeTime
          nodeVal = lowTreatment.nodeVal
          if (qh01 && qh05) {
            let highResult = this.highTreatmentTemperature(abilityInfo, nodeTime, nodeVal, qh01Index, qh03Index, qh05Index)
            result = result.concat(highResult.result)
            nodeTime = highResult.nodeTime
            nodeVal = highResult.nodeVal
          }
        }
      }
      return {
        result: result,
        nodeTime: nodeTime,
        nodeVal: nodeVal
      }
    },
    highTreatmentTemperature(abilityInfo, nodeTime, nodeVal, qh01Index, qh03Index, qh05Index) {
      let result = []
      let qh01Val = parseFloat(abilityInfo[qh01Index].minValue).toFixed(1)
      let qh05Val = parseFloat(abilityInfo[qh05Index].minValue).toFixed(1)
      let addMin = (qh01Val - 25) / qh05Val
      let highTime = moment(nodeTime).add(addMin, 'm').format('x')
      nodeTime = parseInt(highTime)
      nodeVal = qh01Val
      if(this.entrustOrTaskFlag){
        result.push(['Temperature_SV', nodeVal, moment(nodeTime).format('YYYY-MM-DD HH:mm:ss')])
      }else{
        result.push({name: nodeTime, value: [nodeTime, nodeVal]})
      }
      if (qh03Index >= 0 && abilityInfo[qh03Index].minValue) {
        let qh03Val = parseInt(abilityInfo[qh03Index].minValue)
        let highKeepTime = moment(nodeTime).add(qh03Val, 'm').format('x')
        nodeTime = parseInt(highKeepTime)
        if(this.entrustOrTaskFlag){
          result.push(['Temperature_SV', nodeVal, moment(nodeTime).format('YYYY-MM-DD HH:mm:ss')])
        }else{
          result.push({name: nodeTime, value: [nodeTime, nodeVal]})
        }
      }
      return {
        result: result,
        nodeTime: nodeTime,
        nodeVal: nodeVal
      }
    },
    lowTreatmentTemperature(abilityInfo, nodeTime, nodeVal, qh02Index, qh04Index, qh06Index) {
      let result = []
      let qh02Val = parseFloat(abilityInfo[qh02Index].minValue).toFixed(1) // 最低温度
      let qh06Val = parseFloat(abilityInfo[qh06Index].minValue).toFixed(1) // 降温速率
      let addMin = (nodeVal - qh02Val) / qh06Val
      let lowTime = moment(nodeTime).add(addMin, 'm').format('x')
      nodeTime = parseInt(lowTime)
      nodeVal = qh02Val

      if(this.entrustOrTaskFlag){
        result.push(['Temperature_SV', nodeVal, moment(nodeTime).format('YYYY-MM-DD HH:mm:ss')])
      }else{
        result.push({name: nodeTime, value: [nodeTime, nodeVal]})
      }
      if (qh04Index >= 0 && abilityInfo[qh04Index].minValue) {
        let qh04Val = parseInt(abilityInfo[qh04Index].minValue)
        let lowKeepTime = moment(nodeTime).add(qh04Val, 'm').format('x')
        nodeTime = parseInt(lowKeepTime)
        if(this.entrustOrTaskFlag){
          result.push(['Temperature_SV', nodeVal, moment(nodeTime).format('YYYY-MM-DD HH:mm:ss')])
        }else{
          result.push({name: nodeTime, value: [nodeTime, nodeVal]})
        }
      }
      return {
        result: result,
        nodeTime: nodeTime,
        nodeVal: nodeVal
      }
    },
    // 计算湿度的曲线数据
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

      flag = (rh01 || rh02) && ((rh01 && rh05) || (rh02 && rh06))
      if (flag) {
        let rh00Val = this.initialHumTime
        let nodeTime = parseInt(rh00Val)
        let nodeVal = this.initialHumidity // 默认湿度为30%
        if(this.entrustOrTaskFlag){
          result.push(['Humidity_SV', nodeVal, moment(nodeTime).format('YYYY-MM-DD HH:mm:ss')])
        }else{
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
      if (rh01 && rh05) {
        let highResult = this.highTreatmentHumidity(abilityInfo, nodeTime, nodeVal, rh01Index, rh03Index, rh05Index)
        result = result.concat(highResult.result)
        nodeTime = highResult.nodeTime
        nodeVal = highResult.nodeVal
        if (rh02 && rh06) {
          let lowTreatment = this.lowTreatmentHumidity(abilityInfo, nodeTime, nodeVal, rh02Index, rh04Index, rh06Index)
          result = result.concat(lowTreatment.result)
          nodeTime = lowTreatment.nodeTime
          nodeVal = lowTreatment.nodeVal
        }
      } else if (rh02 && rh06) {
        let lowTreatment = this.lowTreatmentHumidity(abilityInfo, nodeTime, nodeVal, rh02Index, rh04Index, rh06Index)
        result = result.concat(lowTreatment.result)
        nodeTime = lowTreatment.nodeTime
        nodeVal = lowTreatment.nodeVal
      }
      return {
        result: result,
        nodeTime: nodeTime,
        nodeVal: nodeVal
      }
    },
    highTreatmentHumidity(abilityInfo, nodeTime, nodeVal, rh01Index, rh03Index, rh05Index) {
      let result = []
      let rh01Val = parseFloat(abilityInfo[rh01Index].minValue).toFixed(1)
      let rh05Val = parseFloat(abilityInfo[rh05Index].minValue).toFixed(1)
      let highTime = moment(nodeTime).add(rh05Val, 'm').format('x')
      nodeTime = parseInt(highTime)
      nodeVal = rh01Val
      if(this.entrustOrTaskFlag){
        result.push(['Humidity_SV', nodeVal, moment(nodeTime).format('YYYY-MM-DD HH:mm:ss')])
      }else{
        result.push({name: nodeTime, value: [nodeTime, nodeVal]})
      }
      if (rh03Index >= 0 && abilityInfo[rh03Index].minValue) {
        let rh03Val = parseInt(abilityInfo[rh03Index].minValue)
        let highKeepTime = moment(nodeTime).add(rh03Val, 'm').format('x')
        nodeTime = parseInt(highKeepTime)
        if(this.entrustOrTaskFlag){
          result.push(['Humidity_SV', nodeVal, moment(nodeTime).format('YYYY-MM-DD HH:mm:ss')])
        }else{
          result.push({name: nodeTime, value: [nodeTime, nodeVal]})
        }
      }
      return {
        result: result,
        nodeTime: nodeTime,
        nodeVal: nodeVal
      }
    },
    lowTreatmentHumidity(abilityInfo, nodeTime, nodeVal, rh02Index, rh04Index, rh06Index) {
      let result = []
      let rh02Val = parseFloat(abilityInfo[rh02Index].minValue).toFixed(1)
      let rh06Val = parseFloat(abilityInfo[rh06Index].minValue).toFixed(1)
      let lowTime = moment(nodeTime).add(rh06Val, 'm').format('x')
      nodeTime = parseInt(lowTime)
      nodeVal = rh02Val
      if(this.entrustOrTaskFlag){
        result.push(['Humidity_SV', nodeVal, moment(nodeTime).format('YYYY-MM-DD HH:mm:ss')])
      }else{
        result.push({name: nodeTime, value: [nodeTime, nodeVal]})
      }
      if (rh04Index >= 0 && abilityInfo[rh04Index].minValue) {
        let rh04Val = parseInt(abilityInfo[rh04Index].minValue)
        let lowKeepTime = moment(nodeTime).add(rh04Val, 'm').format('x')
        nodeTime = parseInt(lowKeepTime)
        if(this.entrustOrTaskFlag){
          result.push(['Humidity_SV', nodeVal, moment(nodeTime).format('YYYY-MM-DD HH:mm:ss')])
        }else{
          result.push({name: nodeTime, value: [nodeTime, nodeVal]})
        }
      }
      return {
        result: result,
        nodeTime: nodeTime,
        nodeVal: nodeVal
      }
    },
  }
}