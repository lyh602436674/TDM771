///**
//  * @Author: 雷宇航
//  * @Date: 2023-04-07 14:02:29
//  * @fileName: systemAstrictMixin.js
//  * @FilePath: tdm771-client\src\views\hifar\hifar-environmental-test\systemAstrictMixin.js
//  * @Description: 系统中对一些功能限制的配置文件
// /
export default {
  data() {
    return {
      // 固定的试验条件，系统内不可删除和编辑
      testConditionInfoListMap: [
        {coder: "qh01", name: "最高温度"},
        {coder: "qh02", name: "最低温度"},
        {coder: "qh05", name: "升温速率"},
        {coder: "qh06", name: "降温速率"},
        {coder: "qh07", name: "循环次数"},
        {coder: "qh14", name: "升温时间"},
        {coder: "qh15", name: "降温时间"},
        {coder: "rh01", name: "最高湿度"},
        {coder: "rh02", name: "最低湿度"},
        {coder: "lx32", name: "加速度1"},
        {coder: "lx33", name: "加速度2"},
        {coder: "lx37", name: "加速度3"},
        {coder: "lx55", name: "加速度4"},
        {coder: "lx56", name: "加速度5"},
        {coder: "lx57", name: "加速度6"},
        {coder: "lx58", name: "加速度7"},
        {coder: "lx59", name: "加速度8"},
        {coder: "lx60", name: "加速度9"},
        {coder: "lx61", name: "加速度10"},
        {coder: "lx62", name: "加速度11"},
        {coder: "lx63", name: "加速度12"},
        {coder: "lx34", name: "最高压力"},
        {coder: "lx35", name: "最低压力"},
      ]
    }
  },
  methods: {
    isDisabled(val) {
      return this.testConditionInfoListMap.map(item => item.coder).includes(val)
    },
  }
}